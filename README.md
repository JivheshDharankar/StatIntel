# StatIntel Platform

**AI-enabled Skill Intelligence and Personalized Learning Platform for India's Official Statistical System**  
*Aligned with Smart India Hackathon Problem Statement SIH26101 (Ministry of Statistics and Programme Implementation - MoSPI)*

---

## 📌 Project Overview
StatIntel is a functional, end-to-end prototype designed to diagnose competency gaps across India's statistical cadre, recommend targeted learning from **iGOT Karmayogi**, **NSSTA**, and **TPAC**, provide grounded **RAG-based AI quizzes** generated via Google Gemini strictly from official learning materials, and transparently close competency gaps with verifiable evidence.

---

## 🏛️ Architecture & Discovered Source Data

### Source Data Structure (`Desktop/StatIntel/` — Read-Only)
- **`iGOT/` (1 PDF)**: Course recommendations & catalogue (Karmayogi Saptah).
- **`NSSTA_TPAC/` (7 PDFs)**: Mid-Career Training Programmes (MCTP Phase 1/2), TPAC Calendars (2022–2026), Statistical Literacy & Storytelling.
- **`Learning_Materials/` (3 PDFs)**: Official MoSPI methodology handbooks on Sampling Design, Survey Estimation, and Data Quality Assurance.

### Technical Stack
- **Frontend (`frontend/`)**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Supabase Auth.
- **Backend API (`backend/`)**: Node.js, Express, TypeScript, API-ready Source Adapters (`iGOT`, `NSSTA`, `TPAC`), Supabase PostgreSQL client.
- **AI & RAG Service (`ai-service/`)**: FastAPI, Python 3.10+, PyMuPDF, Sentence-Transformers, FAISS Vector Index, Google Gemini API.
- **Database & Persistence (`supabase/`)**: PostgreSQL schema (15 normalized tables) covering profiles, competencies, evidence, quizzes, and learning progress.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20+` or `v24+` & `npm`
- Python `3.10+` & `pip`
- Supabase account (or local PostgreSQL)
- Google Gemini API Key

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in each respective service directory:
```bash
# In StatIntel-platform root
cp .env.example .env

# In frontend
cp frontend/.env.example frontend/.env

# In backend
cp backend/.env.example backend/.env

# In ai-service
cp ai-service/.env.example ai-service/.env
```

### 3. Install Dependencies

#### Frontend & Backend:
```bash
npm install
```

#### AI Service:
```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 4. Source Data Ingestion (Read-Only)
Extract text, citations, and chunks from the 11 source PDFs into `data/processed/`:
```bash
python3 scripts/ingest_source_pdfs.py
```

### 5. Running the Application

You can start all three services simultaneously from the root directory:
```bash
npm run dev
```

Or run each service individually in dedicated terminal tabs:

- **Frontend (Vite)**:
  ```bash
  cd frontend && npm run dev
  # Accessible at: http://localhost:5173
  ```

- **Backend API (Express)**:
  ```bash
  cd backend && npm run dev
  # Accessible at: http://localhost:5000
  ```

- **AI Service (FastAPI)**:
  ```bash
  cd ai-service
  source .venv/bin/activate
  uvicorn app.main:app --reload --port 8000
  # Accessible at: http://localhost:8000 (Swagger docs: http://localhost:8000/docs)
  ```

---

## 📊 Database Schema Setup
Execute the migration and seed scripts in Supabase SQL Editor or via CLI:
1. `supabase/migrations/20260830000001_initial_schema.sql` (Creates 15 core tables & indexes)
2. `supabase/seed.sql` (Seeds 33 official competencies & demo Statistical Officer profile)

---

## 🗺️ Implementation Roadmap

- [x] **Phase 1 (Current)**: Architecture initialization, source data discovery, package configurations, API adapter foundations, database schema & migrations.
- [ ] **Phase 2**: Full RAG indexing pipeline, PDF parsing and FAISS vector index builder for all 11 documents.
- [ ] **Phase 3**: Backend recommendation engine integration, user competency scoring service, and REST controllers.
- [ ] **Phase 4**: Frontend complete UI implementation:
  - Official Profile & Assignment management
  - Interactive Competency Assessment & Radar/Bar Visualizations
  - Explainable Recommendations from iGOT / NSSTA / TPAC
  - Grounded AI Quiz & Real-Time Page Citation inspection
  - Gap-Closure visualization (Before vs. After)
  - Executive Administrative Dashboard
- [ ] **Phase 5**: End-to-end testing, demo flow rehearsal, and evaluation readiness.
