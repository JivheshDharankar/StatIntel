from pathlib import Path
from typing import List, Dict, Any, Optional
from app.rag.vectorstore import VectorStore
from app.core.config import settings

class RAGRetriever:
    """
    Coordinates semantic retrieval across indexed learning documents.
    """

    def __init__(self, vector_store: Optional[VectorStore] = None):
        self.vector_store = vector_store or VectorStore()
        
        # Check standard locations for precomputed FAISS index
        candidates = [
            settings.FAISS_INDEX_DIR,
            Path("data/processed/faiss_index"),
            Path("../data/processed/faiss_index"),
            Path(__file__).resolve().parent.parent.parent / "data" / "processed" / "faiss_index",
            Path(__file__).resolve().parent.parent.parent.parent / "data" / "processed" / "faiss_index",
            Path("/app/data/processed/faiss_index")
        ]
        for p in candidates:
            if p.exists() and (p / "chunks.json").exists():
                self.vector_store.load(p)
                break

    def retrieve_context(self, topic_or_concept: str, top_k: int = 4) -> List[Dict[str, Any]]:
        return self.vector_store.search(topic_or_concept, top_k=top_k)

    def format_grounding_prompt(self, retrieved_chunks: List[Dict[str, Any]]) -> str:
        if not retrieved_chunks:
            return "No official source material retrieved."

        formatted_sections = []
        for i, chunk in enumerate(retrieved_chunks, 1):
            formatted_sections.append(
                f"--- SOURCE CHUNK {i} ---\n"
                f"Document: {chunk.get('document_name', 'Unknown')}\n"
                f"Page: {chunk.get('page_number', 'N/A')}\n"
                f"Chunk ID: {chunk.get('chunk_id', 'N/A')}\n"
                f"Content:\n{chunk.get('content', '').strip()}\n"
            )
        return "\n".join(formatted_sections)
