import os
import json
import re
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field, field_validator
from app.core.config import settings

class MCQOptions(BaseModel):
    A: str = Field(..., min_length=1, description="Option A text")
    B: str = Field(..., min_length=1, description="Option B text")
    C: str = Field(..., min_length=1, description="Option C text")
    D: str = Field(..., min_length=1, description="Option D text")

class GroundedMCQ(BaseModel):
    question: str = Field(..., min_length=10, description="Clear, professional question text")
    options: MCQOptions = Field(..., description="Dictionary with keys A, B, C, D")
    correct_answer: Literal["A", "B", "C", "D"] = Field(..., description="Key of the correct option: A, B, C, or D")
    explanation: str = Field(..., min_length=10, description="Detailed explanation grounded strictly in the source text")
    source_document: str = Field(..., min_length=1, description="Exact source document name (e.g. Sampling Design.pdf)")
    source_page: int = Field(..., ge=1, description="Page number where the fact/procedure appears")
    source_chunk_id: str = Field(..., min_length=1, description="Chunk identifier of the retrieved source")

    @field_validator("options")
    @classmethod
    def validate_options_distinct(cls, v: MCQOptions) -> MCQOptions:
        opt_texts = [v.A.strip().lower(), v.B.strip().lower(), v.C.strip().lower(), v.D.strip().lower()]
        if len(set(opt_texts)) < 4:
            raise ValueError("All 4 options must be distinct and non-empty")
        return v

class GroundedMCQGenerator:
    """
    Generates grounded multiple choice questions strictly based on retrieved official source material
    using Google Gemini API with strict structured validation.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL

    def _get_gemini_client(self):
        if not self.api_key or self.api_key == "your-gemini-api-key-here":
            return None
        
        try:
            from google import genai
            return genai.Client(api_key=self.api_key)
        except Exception as e:
            print(f"[GroundedMCQGenerator] Failed to initialize genai.Client: {e}")
            return None

    def generate_quiz(
        self,
        topic: str,
        retrieved_chunks: List[Dict[str, Any]],
        num_questions: int = 5,
        difficulty: str = "medium"
    ) -> List[Dict[str, Any]]:
        """
        Generates and strictly validates grounded MCQs using retrieved context and Gemini.
        """
        if not retrieved_chunks:
            raise ValueError("No source chunks provided for grounding.")

        client = self._get_gemini_client()
        if not client:
            raise ValueError("GEMINI_API_KEY is not configured or invalid.")

        # Prepare formatted grounding context
        context_blocks = []
        for idx, chunk in enumerate(retrieved_chunks):
            doc = chunk.get("document_name", "Official MoSPI Document")
            page = chunk.get("page_number", 1)
            chunk_id = chunk.get("chunk_id", f"chunk_{idx}")
            text = chunk.get("content", "").strip()
            context_blocks.append(
                f"--- SOURCE EXCERPT #{idx+1} ---\n"
                f"DOCUMENT: {doc}\n"
                f"PAGE: {page}\n"
                f"CHUNK_ID: {chunk_id}\n"
                f"TEXT:\n{text}\n"
            )

        context_text = "\n\n".join(context_blocks)

        system_prompt = f"""You are the Official Statistical Cadre Assessment AI for India's Ministry of Statistics and Programme Implementation (MoSPI).
Your task is to generate {num_questions} high-quality, professional multiple-choice questions (MCQs) for the competency/topic '{topic}' targeting '{difficulty}' difficulty.

STRICT GROUNDING CONSTRAINTS:
1. Every question, option, and explanation MUST be strictly derived ONLY from the provided source excerpts below.
2. DO NOT use outside general knowledge.
3. DO NOT invent facts, sample sizes, formulas, statistics, procedures, organizations, or examples.
4. If a fact is not stated in the excerpts, DO NOT ask about it.
5. If the context is insufficient to create {num_questions} fully grounded questions, generate ONLY the valid ones (prefer quality and strict truthfulness over quantity).
6. Every question MUST explicitly cite the exact DOCUMENT name, PAGE number, and CHUNK_ID from which the question is grounded.
7. Return ONLY a valid JSON array of objects matching the schema below. Do not wrap in markdown or conversational text.

REQUIRED JSON SCHEMA:
[
  {{
    "question": "Clear, professional question text testing a specific statistical principle",
    "options": {{
      "A": "First plausible option text",
      "B": "Second plausible option text",
      "C": "Third plausible option text",
      "D": "Fourth plausible option text"
    }},
    "correct_answer": "A",
    "explanation": "Detailed explanation citing the facts directly from the source excerpt.",
    "source_document": "Exact Document Name.pdf",
    "source_page": 1,
    "source_chunk_id": "chunk_00499"
  }}
]
"""

        user_prompt = f"""OFFICIAL SOURCE EXCERPTS FOR GROUNDING:
{context_text}

Generate {num_questions} strictly grounded MCQs in JSON format matching the schema."""

        try:
            response = client.models.generate_content(
                model=self.model_name,
                contents=f"{system_prompt}\n\n{user_prompt}"
            )
            raw_text = response.text or ""
        except Exception as e:
            raise RuntimeError(f"Gemini API generation call failed: {str(e)}")

        # Parse & clean JSON
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()

        try:
            raw_data = json.loads(cleaned)
        except Exception as e:
            # Attempt regex extraction if extra text surrounds JSON array
            match = re.search(r'\[\s*\{.*\}\s*\]', cleaned, re.DOTALL)
            if match:
                try:
                    raw_data = json.loads(match.group(0))
                except Exception:
                    raise ValueError(f"Failed to parse Gemini output as JSON: {raw_text[:200]}")
            else:
                raise ValueError(f"Gemini returned non-JSON output: {raw_text[:200]}")

        if not isinstance(raw_data, list):
            if isinstance(raw_data, dict) and "questions" in raw_data and isinstance(raw_data["questions"], list):
                raw_data = raw_data["questions"]
            else:
                raw_data = [raw_data]

        # Validate and sanitize each MCQ strictly
        validated_mcqs: List[Dict[str, Any]] = []
        for idx, item in enumerate(raw_data):
            try:
                normalized_item = self._normalize_mcq_item(item, retrieved_chunks)
                mcq_obj = GroundedMCQ(**normalized_item)
                validated_mcqs.append(mcq_obj.model_dump())
            except Exception as val_err:
                print(f"[GroundedMCQGenerator] Question #{idx+1} failed validation: {val_err}. Skipping.")

        if not validated_mcqs:
            raise ValueError("All generated questions failed strict schema or grounding validation.")

        return validated_mcqs[:num_questions]

    def _normalize_mcq_item(self, item: Dict[str, Any], retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Normalizes raw LLM output into strict GroundedMCQ schema.
        """
        question = str(item.get("question", "")).strip()
        explanation = str(item.get("explanation", "")).strip()

        # Normalize options
        raw_opts = item.get("options", {})
        options_dict = {}
        if isinstance(raw_opts, list) and len(raw_opts) >= 4:
            options_dict = {
                "A": str(raw_opts[0]).strip(),
                "B": str(raw_opts[1]).strip(),
                "C": str(raw_opts[2]).strip(),
                "D": str(raw_opts[3]).strip()
            }
        elif isinstance(raw_opts, dict):
            options_dict = {
                "A": str(raw_opts.get("A", raw_opts.get("a", ""))).strip(),
                "B": str(raw_opts.get("B", raw_opts.get("b", ""))).strip(),
                "C": str(raw_opts.get("C", raw_opts.get("c", ""))).strip(),
                "D": str(raw_opts.get("D", raw_opts.get("d", ""))).strip()
            }

        # Normalize correct answer
        raw_ans = item.get("correct_answer", item.get("correct_option_index", item.get("answer", "A")))
        correct_answer = "A"
        if isinstance(raw_ans, int):
            correct_answer = ["A", "B", "C", "D"][min(max(0, raw_ans), 3)]
        elif isinstance(raw_ans, str):
            ans_clean = raw_ans.strip().upper()
            if ans_clean in ["A", "B", "C", "D"]:
                correct_answer = ans_clean
            elif ans_clean.startswith("OPTION A") or ans_clean.startswith("A:"):
                correct_answer = "A"
            elif ans_clean.startswith("OPTION B") or ans_clean.startswith("B:"):
                correct_answer = "B"
            elif ans_clean.startswith("OPTION C") or ans_clean.startswith("C:"):
                correct_answer = "C"
            elif ans_clean.startswith("OPTION D") or ans_clean.startswith("D:"):
                correct_answer = "D"
            else:
                # Check if correct_answer string equals text of one option
                for k, text in options_dict.items():
                    if text and text.lower() == raw_ans.strip().lower():
                        correct_answer = k
                        break

        # Normalize source attribution
        doc_name = str(item.get("source_document", "")).strip()
        page_val = item.get("source_page", item.get("page", 1))
        try:
            source_page = int(page_val)
        except Exception:
            source_page = 1

        chunk_id = str(item.get("source_chunk_id", item.get("chunk_id", ""))).strip()

        # If missing source attribution, map to first matching chunk
        if not doc_name or not chunk_id:
            default_chunk = retrieved_chunks[0] if retrieved_chunks else {}
            doc_name = doc_name or default_chunk.get("document_name", "Sampling Design.pdf")
            source_page = source_page if source_page > 0 else default_chunk.get("page_number", 1)
            chunk_id = chunk_id or default_chunk.get("chunk_id", "chunk_001")

        return {
            "question": question,
            "options": options_dict,
            "correct_answer": correct_answer,
            "explanation": explanation,
            "source_document": doc_name,
            "source_page": source_page,
            "source_chunk_id": chunk_id
        }
