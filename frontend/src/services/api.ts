import { 
  UserProfile, 
  Competency, 
  UserCompetency, 
  LearningResource, 
  Recommendation,
  QuickRevisionNote 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  database: {
    isRemoteConfigured: boolean;
    mode: string;
  };
  resourcesCount: number;
  warnings?: string[];
}

export interface SkillGapItem {
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  category: string;
  currentScore: number;
  requiredScore: number;
  gap: number;
  priorityRank: number;
  status: 'critical_gap' | 'moderate_gap' | 'proficient' | 'mastery';
}

export interface SkillGapsResponse {
  success: boolean;
  profileId: string;
  profileRole: string;
  summary: {
    totalAssessed: number;
    criticalGapsCount: number;
    moderateGapsCount: number;
    proficientCount: number;
    averageGap: number;
  };
  data: SkillGapItem[];
}

export interface QuizQuestionData {
  id: string;
  questionNumber: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer?: string;
  explanation?: string;
  sourceDocument: string;
  sourcePage: number;
  sourceChunkId: string;
}

export interface GeneratedQuizResponse {
  success: boolean;
  quizId: string;
  topic: string;
  competencyId: string;
  competencyName: string;
  difficulty: string;
  totalQuestions: number;
  sourceDocument: string;
  questions: QuizQuestionData[];
  createdAt: string;
}

export interface QuestionResultItem {
  questionId: string;
  questionNumber: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  sourceDocument: string;
  sourcePage: number;
  sourceChunkId: string;
}

export interface QuizSubmissionResponse {
  success: boolean;
  data: {
    attemptId: string;
    quizId: string;
    userId: string;
    topic: string;
    competencyId: string;
    competencyName: string;
    totalQuestions: number;
    correctCount: number;
    incorrectCount: number;
    score: number;
    percentage: number;
    competencyBefore: number;
    competencyAfter: number;
    targetScore: number;
    oldGap: number;
    newGap: number;
    gapClosedPercentage: number;
    evidenceWeight: number;
    evidenceId: string;
    submittedAt: string;
    questionResults: QuestionResultItem[];
    nextRecommendations: Recommendation[];
    revisionNotes?: QuickRevisionNote[];
  };
}

export async function fetchHealth(): Promise<BackendHealthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      service: 'backend',
      version: '0.0.0',
      database: { isRemoteConfigured: false, mode: 'offline' },
      resourcesCount: 0
    };
  }
}

export async function fetchAiHealth(): Promise<{ status: string; service: string }> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`);
    if (!res.ok) throw new Error('AI service health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', service: 'ai-service' };
  }
}

export async function fetchCompetencies(): Promise<Competency[]> {
  const res = await fetch(`${API_BASE_URL}/competencies`);
  if (!res.ok) throw new Error('Failed to fetch competencies');
  const json = await res.json();
  return json.data || [];
}

export async function fetchProfile(id: string = 'd0000000-0000-0000-0000-000000000001'): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/profiles/${id}`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  const json = await res.json();
  return json.data;
}

export async function fetchProfileCompetencies(id: string = 'd0000000-0000-0000-0000-000000000001'): Promise<UserCompetency[]> {
  const res = await fetch(`${API_BASE_URL}/profiles/${id}/competencies`);
  if (!res.ok) throw new Error('Failed to fetch user competencies');
  const json = await res.json();
  return json.data || [];
}

export async function fetchSkillGaps(profileId: string = 'd0000000-0000-0000-0000-000000000001'): Promise<SkillGapsResponse> {
  const res = await fetch(`${API_BASE_URL}/skill-gaps/${profileId}`);
  if (!res.ok) throw new Error('Failed to fetch skill gaps');
  return await res.json();
}

export async function fetchRecommendations(profileId: string = 'd0000000-0000-0000-0000-000000000001'): Promise<Recommendation[]> {
  const res = await fetch(`${API_BASE_URL}/recommendations/${profileId}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  const json = await res.json();
  return json.data || [];
}

export async function fetchLearningResources(category?: string): Promise<LearningResource[]> {
  const url = category ? `${API_BASE_URL}/learning-resources?category=${category}` : `${API_BASE_URL}/learning-resources`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch learning resources');
  const json = await res.json();
  return json.data || [];
}

export async function generateQuiz(
  topic: string = 'Sampling',
  questionCount: number = 5,
  difficulty: string = 'medium'
): Promise<GeneratedQuizResponse> {
  const res = await fetch(`${API_BASE_URL}/quizzes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      question_count: questionCount,
      difficulty
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to generate quiz' }));
    throw new Error(err.message || err.error || 'Failed to generate quiz');
  }
  return await res.json();
}

export async function submitQuizAnswers(
  quizId: string,
  answers: Record<string, string>,
  profileId: string = 'd0000000-0000-0000-0000-000000000001'
): Promise<QuizSubmissionResponse> {
  const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers,
      profileId,
      impactWeight: 0.25
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Quiz submission failed' }));
    throw new Error(err.message || err.error || 'Quiz submission failed');
  }
  return await res.json();
}

export async function fetchRevisionNotes(
  incorrectQuestions: QuestionResultItem[],
  topic: string = 'Sampling'
): Promise<QuickRevisionNote[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/quizzes/revision-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incorrectQuestions,
        topic
      })
    });
    if (!res.ok) throw new Error('Failed to fetch revision notes');
    const json = await res.json();
    return json.notes || [];
  } catch (err) {
    console.warn('[StatIntel] Revision notes network fallback:', err);
    return [];
  }
}

export async function fetchRetryQuestion(params: {
  topic?: string;
  concept?: string;
  excludeQuestions?: string[];
  difficulty?: string;
}): Promise<QuizQuestionData | null> {
  const { topic = 'Sampling', concept, excludeQuestions = [], difficulty = 'medium' } = params;
  try {
    const res = await fetch(`${API_BASE_URL}/quizzes/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        concept,
        excludeQuestions,
        difficulty
      })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.question) {
        return json.question;
      }
    }
  } catch (err) {
    console.warn('[StatIntel] Retry endpoint network fallback:', err);
  }

  // Fallback to standard generate endpoint if retry route is unreachable
  try {
    const res = await generateQuiz(concept || topic, 1, difficulty);
    if (res && res.questions && res.questions.length > 0) {
      return res.questions[0];
    }
    return null;
  } catch (err) {
    console.warn('[StatIntel] Retry question generation fallback:', err);
    return null;
  }
}
