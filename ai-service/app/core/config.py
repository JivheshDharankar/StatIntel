import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "StatIntel AI Service"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api/ai"
    
    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

    # Embeddings & Vector Store
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "100"))

    # File paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    SOURCE_DATA_DIR: Path = Path(os.getenv("SOURCE_DATA_DIR", BASE_DIR.parent.parent))
    PROCESSED_DATA_DIR: Path = Path(os.getenv("PROCESSED_DATA_DIR", BASE_DIR.parent / "data" / "processed"))
    FAISS_INDEX_DIR: Path = PROCESSED_DATA_DIR / "faiss_index"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
