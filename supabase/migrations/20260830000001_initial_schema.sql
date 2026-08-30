-- ==============================================================================
-- StatIntel: Database Schema Migration
-- AI-enabled Skill Intelligence and Personalized Learning Platform (SIH26101)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles / User Details
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    designation TEXT NOT NULL, -- e.g. 'Statistical Officer', 'Deputy Director', 'Junior Statistical Officer'
    department TEXT NOT NULL,  -- e.g. 'MoSPI - National Statistical Systems Training Academy (NSSTA)'
    job_role TEXT NOT NULL,    -- e.g. 'Sample Survey Field & Estimation Specialist'
    experience_years INTEGER DEFAULT 0,
    education TEXT,            -- e.g. 'M.Sc. Statistics / Mathematical Statistics'
    current_assignment TEXT,   -- e.g. 'Periodic Labour Force Survey (PLFS) & Annual Survey of Industries (ASI)'
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Competency Framework Master
CREATE TABLE IF NOT EXISTS public.competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g. 'STAT_SAMP', 'TECH_PYTH'
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Statistical', 'Technical', 'Digital Governance', 'Behavioural/Managerial')),
    description TEXT,
    benchmark_score NUMERIC(5, 2) DEFAULT 80.0,
    weight NUMERIC(3, 2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Competency Ratings & Gap State
CREATE TABLE IF NOT EXISTS public.user_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
    estimated_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (estimated_score BETWEEN 0 AND 100),
    benchmark_score NUMERIC(5, 2) NOT NULL DEFAULT 80.0,
    gap_score NUMERIC(5, 2) GENERATED ALWAYS AS (GREATEST(0, benchmark_score - estimated_score)) STORED,
    confidence_level NUMERIC(3, 2) DEFAULT 0.50 CHECK (confidence_level BETWEEN 0 AND 1),
    last_assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, competency_id)
);

-- 4. Assessments Master
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    competency_id UUID REFERENCES public.competencies(id) ON DELETE SET NULL,
    target_level TEXT DEFAULT 'Intermediate', -- 'Foundational', 'Intermediate', 'Advanced'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Assessment Questions
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of string options
    correct_option_index INTEGER NOT NULL,
    explanation TEXT,
    difficulty TEXT DEFAULT 'Medium',
    weight NUMERIC(3, 2) DEFAULT 1.0
);

-- 6. Assessment Results
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    competency_delta NUMERIC(5, 2) DEFAULT 0.0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Learning Resources (iGOT, NSSTA, TPAC, MoSPI)
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL CHECK (source IN ('iGOT', 'NSSTA', 'TPAC', 'MoSPI')),
    source_document TEXT NOT NULL,
    source_page INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    competency_id UUID REFERENCES public.competencies(id) ON DELETE SET NULL,
    resource_type TEXT NOT NULL DEFAULT 'Course', -- 'Course', 'Workshop', 'Module', 'Training Programme', 'Handbook'
    duration_hours NUMERIC(5, 1) DEFAULT 10.0,
    target_level TEXT DEFAULT 'Intermediate',
    delivery_mode TEXT DEFAULT 'Self-Paced', -- 'Self-Paced', 'In-Person', 'Blended', 'Online'
    is_api_ready BOOLEAN DEFAULT TRUE,
    external_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Personalized Recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    gap_score NUMERIC(5, 2) NOT NULL,
    match_score NUMERIC(5, 2) NOT NULL,
    rationale TEXT NOT NULL,
    priority_rank INTEGER DEFAULT 1,
    status TEXT DEFAULT 'recommended' CHECK (status IN ('recommended', 'in_progress', 'completed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Documents Ingested (RAG & Knowledge Base)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    source_category TEXT NOT NULL CHECK (source_category IN ('iGOT', 'NSSTA_TPAC', 'Learning_Materials')),
    total_pages INTEGER DEFAULT 1,
    file_size_bytes BIGINT DEFAULT 0,
    status TEXT DEFAULT 'indexed',
    metadata JSONB DEFAULT '{}'::jsonb,
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Document Chunks (RAG Grounding & Citations)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    page_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    embedding_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 11. Quizzes Generated
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    competency_id UUID REFERENCES public.competencies(id) ON DELETE SET NULL,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    target_concept TEXT,
    question_count INTEGER DEFAULT 5,
    status TEXT DEFAULT 'ready',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Quiz Questions (Grounded MCQs)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option INTEGER NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
    explanation TEXT NOT NULL,
    source_document TEXT NOT NULL,
    source_page INTEGER,
    chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE SET NULL
);

-- 13. Quiz Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers JSONB NOT NULL,
    competency_before NUMERIC(5, 2) NOT NULL,
    competency_after NUMERIC(5, 2) NOT NULL,
    gap_before NUMERIC(5, 2) NOT NULL,
    gap_after NUMERIC(5, 2) NOT NULL,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Competency Evidence Ledger
CREATE TABLE IF NOT EXISTS public.competency_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('quiz', 'assessment', 'course_completion', 'work_sample', 'self_reported')),
    evidence_id TEXT,
    score NUMERIC(5, 2) NOT NULL,
    impact_weight NUMERIC(3, 2) DEFAULT 0.35,
    previous_score NUMERIC(5, 2) NOT NULL,
    new_score NUMERIC(5, 2) NOT NULL,
    rationale TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Learning Progress Tracking
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percent NUMERIC(5, 2) DEFAULT 0.0 CHECK (progress_percent BETWEEN 0 AND 100),
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, resource_id)
);

-- Create Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_user_competencies_user ON public.user_competencies(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_gap ON public.recommendations(gap_score DESC);
CREATE INDEX IF NOT EXISTS idx_document_chunks_doc ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_competency_evidence_user ON public.competency_evidence(user_id);
