import re
from typing import List, Dict, Any

class DocumentChunker:
    """
    Splits page-extracted text into semantic chunks while retaining page numbers and metadata.
    """

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_pages(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        chunks = []
        global_chunk_idx = 0

        for page in pages:
            text = page["text"]
            # Simple word-based chunking with overlap
            words = text.split()
            if not words:
                continue

            # If page text is shorter than chunk_size words, keep as 1 chunk
            if len(words) <= self.chunk_size:
                chunks.append({
                    "chunk_id": f"{page['document_name']}_p{page['page_number']}_c0",
                    "chunk_index": global_chunk_idx,
                    "document_name": page["document_name"],
                    "file_path": page["file_path"],
                    "page_number": page["page_number"],
                    "content": text,
                    "word_count": len(words)
                })
                global_chunk_idx += 1
                continue

            start = 0
            sub_idx = 0
            while start < len(words):
                end = min(start + self.chunk_size, len(words))
                chunk_words = words[start:end]
                chunk_text = " ".join(chunk_words)

                chunks.append({
                    "chunk_id": f"{page['document_name']}_p{page['page_number']}_c{sub_idx}",
                    "chunk_index": global_chunk_idx,
                    "document_name": page["document_name"],
                    "file_path": page["file_path"],
                    "page_number": page["page_number"],
                    "content": chunk_text,
                    "word_count": len(chunk_words)
                })

                global_chunk_idx += 1
                sub_idx += 1
                if end == len(words):
                    break
                start += (self.chunk_size - self.chunk_overlap)

        return chunks
