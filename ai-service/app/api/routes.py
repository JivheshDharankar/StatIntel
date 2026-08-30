from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.rag.retriever import RAGRetriever
from app.generator.mcq_generator import GroundedMCQGenerator
from app.scoring.evaluator import QuizEvaluator

router = APIRouter()
retriever = RAGRetriever()
generator = GroundedMCQGenerator()

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query or statistical concept")
    top_k: int = Field(5, ge=1, le=20, description="Number of source chunks to retrieve")

class QuizGenerateRequest(BaseModel):
    topic: Optional[str] = Field(None, description="Topic or competency name (e.g. Sampling, Data Quality)")
    competency_name: Optional[str] = Field(None, description="Alternative alias for topic")
    question_count: Optional[int] = Field(None, ge=1, le=10, description="Number of questions requested")
    num_questions: Optional[int] = Field(None, ge=1, le=10, description="Alternative alias for question count")
    difficulty: Optional[str] = Field("medium", description="Target difficulty level (easy, medium, hard)")
    target_level: Optional[str] = Field(None, description="Alternative alias for difficulty")

class QuizSubmissionRequest(BaseModel):
    user_answers: List[Any]
    quiz_questions: List[Dict[str, Any]]
    previous_competency_score: float = 35.0
    benchmark_score: float = 80.0
    impact_weight: float = 0.35

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "statintel-ai-service",
        "version": "0.2.0",
        "gemini_model": generator.model_name,
        "gemini_configured": bool(generator.api_key and generator.api_key != "your-gemini-api-key-here"),
        "indexed_chunks": len(retriever.vector_store.chunks_metadata)
    }

@router.post("/search")
@router.post("/rag/search")
def search_documents(payload: SearchRequest):
    try:
        results = retriever.retrieve_context(payload.query, top_k=payload.top_k)
        if not results:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No relevant source chunks found for query: '{payload.query}'"
            )
        return {
            "success": True,
            "query": payload.query,
            "total_retrieved": len(results),
            "results": [
                {
                    "chunk_id": r.get("chunk_id"),
                    "source_document": r.get("document_name"),
                    "page_number": r.get("page_number"),
                    "similarity_score": round(r.get("retrieval_score", 0.0), 4),
                    "content": r.get("content", "").strip()
                }
                for r in results
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing semantic search: {str(e)}"
        )

@router.post("/generate-quiz")
@router.post("/quiz/generate")
def generate_grounded_quiz(payload: QuizGenerateRequest):
    topic_name = payload.topic or payload.competency_name or "Sampling"
    count = payload.question_count or payload.num_questions or 5
    diff = payload.difficulty or payload.target_level or "medium"

    # Step 1: Semantic Retrieval from indexed Learning Materials
    chunks = retriever.retrieve_context(topic_name, top_k=count + 2)
    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient source material found for topic '{topic_name}' in the indexed learning corpus."
        )

    # Step 2: Grounded Gemini MCQ Generation
    try:
        questions = generator.generate_quiz(
            topic=topic_name,
            retrieved_chunks=chunks,
            num_questions=count,
            difficulty=diff
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err)
        )
    except RuntimeError as run_err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(run_err)
        )
    except Exception as gen_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate grounded quiz: {str(gen_err)}"
        )

    return {
        "success": True,
        "topic": topic_name,
        "difficulty": diff,
        "question_count": len(questions),
        "retrieved_chunks_used": len(chunks),
        "questions": questions
    }

@router.post("/evaluate-quiz")
def evaluate_quiz(payload: QuizSubmissionRequest):
    result = QuizEvaluator.evaluate_submission(
        user_answers=payload.user_answers,
        quiz_questions=payload.quiz_questions,
        previous_competency_score=payload.previous_competency_score,
        benchmark_score=payload.benchmark_score,
        impact_weight=payload.impact_weight
    )
    return {
        "success": True,
        "data": result
    }
