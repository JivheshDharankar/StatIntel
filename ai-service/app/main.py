from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as ai_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RAG & Gemini Grounded AI Service for India's Official Statistical System (SIH26101)"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(ai_router, prefix="/api/ai", tags=["AI & RAG"])
app.include_router(ai_router, tags=["AI & RAG Direct"]) # also expose directly for convenience

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
