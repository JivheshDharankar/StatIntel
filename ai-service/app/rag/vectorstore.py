import os
import json
import pickle
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np

try:
    import faiss
    from sentence_transformers import SentenceTransformer
except ImportError:
    faiss = None
    SentenceTransformer = None

from app.core.config import settings

class VectorStore:
    """
    FAISS-based vector index for semantic retrieval of learning materials.
    """

    def __init__(self, model_name: str = settings.EMBEDDING_MODEL_NAME):
        self.model_name = model_name
        self.embedder = None
        self.index = None
        self.chunks_metadata: List[Dict[str, Any]] = []

    def _load_embedder(self):
        if self.embedder is None and SentenceTransformer is not None:
            self.embedder = SentenceTransformer(self.model_name)

    def build_index(self, chunks: List[Dict[str, Any]]):
        if not chunks:
            return

        self._load_embedder()
        self.chunks_metadata = chunks
        texts = [c["content"] for c in chunks]

        if self.embedder is not None and faiss is not None:
            embeddings = self.embedder.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dimension)  # Cosine similarity on normalized embeddings
            self.index.add(embeddings.astype(np.float32))

    def search(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        if not self.chunks_metadata:
            return []

        self._load_embedder()
        
        # Fallback if FAISS or SentenceTransformer not installed yet
        if self.embedder is None or self.index is None or faiss is None:
            # Keyword matching fallback for bootstrapping
            query_words = query.lower().split()
            scored = []
            for chunk in self.chunks_metadata:
                score = sum(1 for w in query_words if w in chunk["content"].lower())
                if score > 0:
                    scored.append((score, chunk))
            scored.sort(key=lambda x: x[0], reverse=True)
            return [item[1] for item in scored[:top_k]]

        query_emb = self.embedder.encode([query], convert_to_numpy=True, normalize_embeddings=True)
        scores, indices = self.index.search(query_emb.astype(np.float32), top_k)

        results = []
        for rank, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.chunks_metadata):
                chunk_copy = dict(self.chunks_metadata[idx])
                chunk_copy["retrieval_score"] = float(scores[0][rank])
                results.append(chunk_copy)

        return results

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
