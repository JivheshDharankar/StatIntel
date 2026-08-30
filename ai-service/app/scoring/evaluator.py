from typing import List, Dict, Any

class QuizEvaluator:
    """
    Evaluates quiz responses and computes transparent evidence update metrics.
    """

    @staticmethod
    def evaluate_submission(
        user_answers: List[int],
        quiz_questions: List[Dict[str, Any]],
        previous_competency_score: float = 35.0,
        benchmark_score: float = 80.0,
        impact_weight: float = 0.35
    ) -> Dict[str, Any]:
        total_questions = len(quiz_questions)
        correct_count = 0
        question_breakdown = []

        for idx, q in enumerate(quiz_questions):
            user_ans = user_answers[idx] if idx < len(user_answers) else -1
            correct_ans = q.get("correct_option_index", 0)
            is_correct = (user_ans == correct_ans)
            if is_correct:
                correct_count += 1

            question_breakdown.append({
                "question_index": idx,
                "user_answer": user_ans,
                "correct_answer": correct_ans,
                "is_correct": is_correct,
                "source_document": q.get("source_document"),
                "source_page": q.get("source_page"),
                "explanation": q.get("explanation")
            })

        percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0.0

        # Transparent update formula
        new_estimated = previous_competency_score * (1 - impact_weight) + percentage * impact_weight
        new_estimated = round(min(100.0, max(0.0, new_estimated)), 1)
        remaining_gap = round(max(0.0, benchmark_score - new_estimated), 1)

        delta = round(new_estimated - previous_competency_score, 1)
        sign = "+" if delta >= 0 else ""

        return {
            "score": correct_count,
            "total_questions": total_questions,
            "percentage": round(percentage, 1),
            "previous_competency_score": previous_competency_score,
            "new_estimated_score": new_estimated,
            "competency_delta": f"{sign}{delta}",
            "benchmark_score": benchmark_score,
            "remaining_gap": remaining_gap,
            "evidence_explanation": f"Candidate achieved {correct_count}/{total_questions} ({round(percentage)}%) on official curriculum quiz, providing positive evidence to adjust competency by {sign}{delta} points (Weight: {int(impact_weight*100)}%).",
            "question_breakdown": question_breakdown
        }
