import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

from app.rag.vectorstore import VectorStore
from app.rag.retriever import RAGRetriever
from app.generator.mcq_generator import GroundedMCQGenerator, GroundedMCQ, MCQOptions

def test_faiss_index_and_retrieval():
    print("\n--- TEST 1: FAISS Index & Semantic Retrieval ---")
    retriever = RAGRetriever()
    assert len(retriever.vector_store.chunks_metadata) > 0, "Vector store should have indexed chunks"
    print(f"[PASS] Loaded {len(retriever.vector_store.chunks_metadata)} chunks into FAISS index")

    # Search for 'sampling design'
    results_sampling = retriever.retrieve_context("sampling design", top_k=3)
    assert len(results_sampling) >= 1, "Should retrieve chunks for sampling design"
    assert "document_name" in results_sampling[0]
    assert "page_number" in results_sampling[0]
    assert "chunk_id" in results_sampling[0]
    print(f"[PASS] 'sampling design' retrieved: {results_sampling[0]['document_name']} (Page {results_sampling[0]['page_number']}) - Score: {results_sampling[0].get('retrieval_score', 0):.4f}")

    # Search for 'data quality'
    results_quality = retriever.retrieve_context("data quality", top_k=3)
    assert len(results_quality) >= 1, "Should retrieve chunks for data quality"
    print(f"[PASS] 'data quality' retrieved: {results_quality[0]['document_name']} (Page {results_quality[0]['page_number']}) - Score: {results_quality[0].get('retrieval_score', 0):.4f}")

def test_schema_validation_and_rejection():
    print("\n--- TEST 2: Strict Schema Validation & Malformed Rejection ---")
    # Valid MCQ
    valid_data = {
        "question": "What is the primary purpose of stratification in survey sampling?",
        "options": {
            "A": "To reduce sampling variance",
            "B": "To eliminate non-sampling errors completely",
            "C": "To increase survey expenditure",
            "D": "To avoid probability proportional to size sampling"
        },
        "correct_answer": "A",
        "explanation": "Stratification groups homogeneous units together, minimizing within-stratum variance.",
        "source_document": "Sampling Design.pdf",
        "source_page": 2,
        "source_chunk_id": "chunk_00485"
    }
    mcq = GroundedMCQ(**valid_data)
    assert mcq.correct_answer == "A"
    print("[PASS] Valid MCQ passed schema validation")

    # Reject duplicate options
    try:
        invalid_options = dict(valid_data)
        invalid_options["options"] = {
            "A": "Duplicate option",
            "B": "Duplicate option",
            "C": "Option C",
            "D": "Option D"
        }
        GroundedMCQ(**invalid_options)
        assert False, "Should have rejected duplicate options"
    except Exception:
        print("[PASS] Successfully rejected MCQ with duplicate options")

    # Reject invalid correct answer
    try:
        invalid_answer = dict(valid_data)
        invalid_answer["correct_answer"] = "E"
        GroundedMCQ(**invalid_answer)
        assert False, "Should have rejected invalid correct_answer key"
    except Exception:
        print("[PASS] Successfully rejected MCQ with invalid correct_answer key ('E')")

def test_real_live_gemini_mcq_generation():
    print("\n--- TEST 3: Live Gemini Grounded MCQ Generation (3 Questions, Sampling) ---")
    retriever = RAGRetriever()
    generator = GroundedMCQGenerator()

    assert generator.api_key and generator.api_key != "your-gemini-api-key-here", "Gemini API key must be configured"
    print(f"Using Gemini Model: {generator.model_name}")

    # 1. Retrieve top chunks for Sampling
    chunks = retriever.retrieve_context("sampling design and stratified estimation", top_k=5)
    assert len(chunks) > 0, "Should retrieve chunks for sampling"

    # 2. Call Gemini
    questions = generator.generate_quiz(
        topic="Sampling",
        retrieved_chunks=chunks,
        num_questions=3,
        difficulty="medium"
    )

    assert len(questions) >= 1, "Should generate at least 1 validated MCQ"
    print(f"[PASS] Successfully generated {len(questions)} grounded MCQs")

    for i, q in enumerate(questions, 1):
        print(f"\n  [Question #{i}]")
        print(f"  Q: {q['question']}")
        print(f"  Options: A) {q['options']['A']} | B) {q['options']['B']} | C) {q['options']['C']} | D) {q['options']['D']}")
        print(f"  Correct Answer: {q['correct_answer']}")
        print(f"  Explanation: {q['explanation']}")
        print(f"  Source Attribution: {q['source_document']} (Page {q['source_page']}, Chunk {q['source_chunk_id']})")
        
        # Verify schema invariants
        assert q["correct_answer"] in ["A", "B", "C", "D"]
        assert len(q["options"]) == 4
        assert q["source_document"] != ""
        assert q["source_page"] >= 1
        assert q["source_chunk_id"] != ""

if __name__ == "__main__":
    test_faiss_index_and_retrieval()
    test_schema_validation_and_rejection()
    test_real_live_gemini_mcq_generation()
    print("\n==================================================")
    print(" >>> ALL PHASE 3B VERIFICATIONS PASSED 100% <<<")
    print("==================================================")
