// Core types for StatIntel Platform

export type CompetencyCategory = 
  | 'Statistical'
  | 'Technical'
  | 'Digital Governance'
  | 'Behavioural/Managerial';

export type ResourceSource = 'iGOT' | 'NSSTA' | 'TPAC' | 'MoSPI';

export interface Profile {
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
export type UserProfile = Profile;

export interface Competency {
  id: string;
  code: string;
  name: string;
  category: CompetencyCategory;
  description: string;
  benchmarkScore: number;
  weight: number;
}

export interface UserCompetency {
  id: string;
  userId: string;
  competencyId: string;
  competency?: Competency;
  estimatedScore: number; // 0 - 100
  benchmarkScore: number; // 0 - 100
  gapScore: number;       // benchmarkScore - estimatedScore (if > 0)
  confidenceLevel: number;// 0.0 - 1.0
  lastAssessedAt: string;
  updatedAt: string;
}

export interface LearningResource {
  id: string;
  source: ResourceSource;
  sourceCategory?: string;
  sourceDocument: string;
  sourcePage?: number;
  title: string;
  description: string;
  competencyId: string;
  competencyName?: string;
  competencyCategory?: CompetencyCategory;
  resourceType: 'Course' | 'Workshop' | 'Module' | 'Handbook' | 'Training Programme';
  durationHours: number;
  targetLevel: 'Foundational' | 'Intermediate' | 'Advanced';
  deliveryMode: 'Online' | 'In-Person' | 'Blended' | 'Self-Paced';
  isApiReady: boolean;
  externalUrl?: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  competencyId: string;
  competencyName: string;
  resourceId: string;
  resource: LearningResource;
  gapScore: number;
  matchScore: number;
  rationale: string;
  priorityRank: number;
  status: 'recommended' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  sourceDocument: string;
  sourcePage?: number;
  concept: string;
}

export interface Quiz {
  id: string;
  title: string;
  competencyId: string;
  competencyName: string;
  documentTitle: string;
  sourceDocument: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  createdAt: string;
}

export interface QuizAttemptResult {
  attemptId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  competencyId: string;
  competencyBefore: number;
  competencyAfter: number;
  gapBefore: number;
  gapAfter: number;
  evidenceId: string;
  feedback: string;
  submittedAt: string;
}

export interface CompetencyEvidence {
  id: string;
  userId: string;
  competencyId: string;
  evidenceType: 'quiz' | 'assessment' | 'course_completion' | 'work_sample';
  score: number;
  impactWeight: number;
  previousScore: number;
  newScore: number;
  createdAt: string;
}
