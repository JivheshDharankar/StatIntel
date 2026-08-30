export type CompetencyCategory = 
  | 'Statistical'
  | 'Technical'
  | 'Digital Governance'
  | 'Behavioural/Managerial';

export type ResourceSource = 'iGOT' | 'NSSTA' | 'TPAC' | 'MoSPI';
export type ResourceSourceCategory = 'iGOT' | 'NSSTA' | 'TPAC' | 'Learning Material';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  designation: string;
  department: string;
  jobRole: string;
  experienceYears: number;
  education: string;
  currentAssignment: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompetencyItem {
  id: string;
  code: string;
  name: string;
  category: CompetencyCategory;
  description: string;
  benchmarkScore: number;
  weight: number;
}

export interface UserCompetencyScore {
  id: string;
  userId: string;
  competencyId: string;
  competency?: CompetencyItem;
  estimatedScore: number;
  benchmarkScore: number;
  gapScore: number;
  confidenceLevel: number;
  lastAssessedAt: string;
}

export interface LearningResourceItem {
  id: string;
  source: ResourceSource;
  sourceCategory: ResourceSourceCategory;
  sourceDocument: string;
  sourcePage?: number;
  title: string;
  description: string;
  competencyId?: string;
  competencyCode?: string;
  competencyName?: string;
  competencyCategory?: CompetencyCategory;
  resourceType: 'Course' | 'Workshop' | 'Module' | 'Handbook' | 'Training Programme';
  durationHours: number;
  targetLevel: 'Foundational' | 'Intermediate' | 'Advanced';
  deliveryMode: 'Online' | 'In-Person' | 'Blended' | 'Self-Paced';
  isApiReady: boolean;
  externalUrl?: string;
  metadata?: Record<string, any>;
}

export interface SkillGapItem {
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  category: CompetencyCategory;
  currentScore: number;
  requiredScore: number;
  gap: number;
  priorityRank: number;
  status: 'critical_gap' | 'moderate_gap' | 'proficient' | 'mastery';
}

export interface RecommendationItem {
  id: string;
  userId: string;
  competencyId: string;
  resourceId: string;
  resource?: LearningResourceItem;
  gapScore: number;
  matchScore: number;
  rationale: string;
  priorityRank: number;
  status: 'recommended' | 'in_progress' | 'completed' | 'dismissed';
}

export interface CompetencyEvidenceItem {
  id: string;
  userId: string;
  competencyId: string;
  evidenceType: 'quiz' | 'assessment' | 'course_completion' | 'work_sample';
  quizId?: string;
  score: number;
  impactWeight: number;
  previousScore: number;
  newScore: number;
  targetScore: number;
  oldGap: number;
  newGap: number;
  gapClosedPercentage: number;
  rationale: string;
  createdAt: string;
}

export interface QuizQuestionItem {
  id: string;
  quizId: string;
  questionNumber: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  sourceDocument: string;
  sourcePage: number;
  sourceChunkId: string;
}

export interface QuizItem {
  id: string;
  topic: string;
  competencyId: string;
  competencyName: string;
  difficulty: string;
  totalQuestions: number;
  sourceDocument: string;
  questions: QuizQuestionItem[];
  createdAt: string;
}

export interface QuestionSubmissionResult {
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

export interface QuickRevisionNote {
  id: string;
  concept: string;
  quickNote: string;
  remember: string;
  source: {
    documentTitle: string;
    page: number | string;
    chunkId: string;
  };
  relatedQuestionIds?: string[];
  competencyCode?: string;
  competencyName?: string;
}

export interface QuizSubmissionResult {
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
  questionResults: QuestionSubmissionResult[];
  nextRecommendations: RecommendationItem[];
  revisionNotes?: QuickRevisionNote[];
}
