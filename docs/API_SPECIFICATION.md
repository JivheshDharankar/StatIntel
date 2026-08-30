# StatIntel API Specification

All services expose standards-compliant REST endpoints.

## Backend Service Endpoints (`http://localhost:5000/api`)

### Health & Diagnostic
- `GET /health`
  - Returns backend health, version, timestamp.

### Competency Framework
- `GET /competencies`
  - Returns all 33 competencies categorized by domain.
- `POST /competencies/score-evidence`
  - Body: `{ previousScore: number, quizScore: number, totalQuestions: number, benchmarkScore?: number, impactWeight?: number }`
  - Returns updated estimated score, gap score, and calculation explanation.

### Recommendation Engine
- `GET /recommendations`
  - Returns ranked learning recommendations with explainable rationale for active officer profile.

### Quiz & Evidence Evaluation
- `POST /quizzes/submit`
  - Body: `{ quizId: string, userId: string, competencyId: string, score: number, totalQuestions: number, previousCompetencyScore: number }`
  - Records quiz attempt and returns calculated competency evidence update.

### Analytics & Reporting
- `GET /analytics/admin-summary`
  - Returns organization-level aggregate skill gap statistics, cadre distribution, and closure rates.

---

## AI & RAG Service Endpoints (`http://localhost:8000/api/ai`)

### Health & Capabilities
- `GET /api/ai/health`
  - Returns index status, chunk count, and Gemini connectivity flag.

### Semantic Search
- `POST /api/ai/search`
  - Body: `{ query: string, top_k?: number }`
  - Returns top-k retrieved chunks with citations.

### Grounded MCQ Generation
- `POST /api/ai/generate-quiz`
  - Body: `{ competency_name: string, target_concept?: string, num_questions?: number, target_level?: string }`
  - Returns generated MCQs with `source_document`, `source_page`, `options`, `correct_option_index`, and `explanation`.

### Quiz Evaluation
- `POST /api/ai/evaluate-quiz`
  - Body: `{ user_answers: number[], quiz_questions: QuizQuestion[], previous_competency_score?: number }`
  - Returns graded response breakdown and competency score adjustment.
