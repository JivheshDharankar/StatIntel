import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np

try:
    import faiss
except ImportError:
    faiss = None

# Prefer fastembed (ONNX Runtime CPU - ~100MB RAM, zero PyTorch overhead)
try:
    from fastembed import TextEmbedding
except ImportError:
    TextEmbedding = None

from app.core.config import settings

class VectorStore:
    """
    FAISS-based vector index for low-memory semantic retrieval of learning materials.
    Uses fastembed (ONNX Runtime) for lightweight CPU inference without PyTorch bloat.
    """

    def __init__(self, model_name: str = settings.EMBEDDING_MODEL_NAME):
        # Normalize model name for fastembed
        if model_name == "all-MiniLM-L6-v2":
            self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        else:
            self.model_name = model_name

        self.embedder = None
        self.index = None
        self.chunks_metadata: List[Dict[str, Any]] = []

    def _load_embedder(self):
        if self.embedder is not None:
            return

        if TextEmbedding is not None:
            try:
                self.embedder = TextEmbedding(model_name=self.model_name)
                return
            except Exception as e:
                print(f"[VectorStore] FastEmbed initialization warning: {e}. Trying fallback.")

        # Lazy fallback only if fastembed is absent/failed
        try:
            from sentence_transformers import SentenceTransformer
            self.embedder = SentenceTransformer(self.model_name)
        except Exception:
            pass

    def _encode(self, texts: List[str]) -> Optional[np.ndarray]:
        self._load_embedder()
        if self.embedder is None or not texts:
            return None

        # FastEmbed TextEmbedding
        if TextEmbedding is not None and isinstance(self.embedder, TextEmbedding):
            embeddings = list(self.embedder.embed(texts))
            return np.array(embeddings, dtype=np.float32)

        # SentenceTransformer fallback
        if SentenceTransformer is not None and isinstance(self.embedder, SentenceTransformer):
            emb = self.embedder.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
            return emb.astype(np.float32)

        return None

    def build_index(self, chunks: List[Dict[str, Any]]):
        if not chunks:
            return

        self.chunks_metadata = chunks
        texts = [c["content"] for c in chunks]
        embeddings = self._encode(texts)

        if embeddings is not None and faiss is not None:
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dimension)  # Cosine similarity on normalized embeddings
            self.index.add(embeddings)

    def search(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        if not self.chunks_metadata:
            return []

        query_emb = self._encode([query])

        # Semantic FAISS search
        if query_emb is not None and self.index is not None and faiss is not None:
            scores, indices = self.index.search(query_emb, top_k)
            results = []
            for rank, idx in enumerate(indices[0]):
                if idx != -1 and idx < len(self.chunks_metadata):
                    chunk_copy = dict(self.chunks_metadata[idx])
                    chunk_copy["retrieval_score"] = float(scores[0][rank])
                    results.append(chunk_copy)
            return results

        # Keyword matching fallback
        query_words = query.lower().split()
        scored = []
        for chunk in self.chunks_metadata:
            score = sum(1 for w in query_words if w in chunk.get("content", "").lower())
            if score > 0:
                scored.append((score, chunk))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [dict(item[1], retrieval_score=float(item[0])) for item in scored[:top_k]]

    def save(self, output_dir: Path):
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        if self.index is not None and faiss is not None:
            faiss.write_index(self.index, str(output_dir / "index.faiss"))
            
        with open(output_dir / "chunks.json", "w", encoding="utf-8") as f:
            json.dump(self.chunks_metadata, f, indent=2, ensure_ascii=False)

    def load(self, input_dir: Path):
        input_dir = Path(input_dir)
        chunks_file = input_dir / "chunks.json"
        index_file = input_dir / "index.faiss"

        if chunks_file.exists():
            with open(chunks_file, "r", encoding="utf-8") as f:
                self.chunks_metadata = json.load(f)

        if index_file.exists() and faiss is not None:
            self.index = faiss.read_index(str(index_file))

