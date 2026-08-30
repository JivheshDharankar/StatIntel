import os
from pathlib import Path
from typing import List, Dict, Any
import pymupdf as fitz  # PyMuPDF

class DocumentExtractor:
    """
    Extracts text from official PDFs while preserving page numbers and metadata.
    Read-only: NEVER mutates original files.
    """

    @staticmethod
    def extract_pdf_pages(file_path: str | Path) -> List[Dict[str, Any]]:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Source PDF not found at {path}")

        pages_data = []
        doc = fitz.open(path)
        try:
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                text = page.get_text("text").strip()
                if text:
                    pages_data.append({
                        "document_name": path.name,
                        "file_path": str(path),
                        "page_number": page_idx + 1,
                        "text": text,
                        "char_count": len(text)
                    })
        finally:
            doc.close()

        return pages_data
