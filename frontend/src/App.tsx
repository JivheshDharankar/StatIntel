import React, { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { NavTab } from './components/layout/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CompetenciesView } from './components/CompetenciesView';
import { LearningCatalogueView } from './components/LearningCatalogueView';
import { AssessmentView } from './components/AssessmentView';
import { EvidenceView } from './components/EvidenceView';
import { 
  fetchHealth, 
  fetchAiHealth, 
  fetchProfile, 
  fetchCompetencies, 
  fetchProfileCompetencies, 
  fetchSkillGaps, 
  fetchRecommendations, 
  fetchLearningResources,
  generateQuiz,
  submitQuizAnswers,
  BackendHealthResponse,
  SkillGapItem,
  GeneratedQuizResponse,
  QuizSubmissionResponse
} from './services/api';
import { UserProfile, Competency, UserCompetency, LearningResource, Recommendation } from './types';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [backendHealth, setBackendHealth] = useState<BackendHealthResponse | null>(null);
  const [aiStatus, setAiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('statintel_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('statintel_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('statintel_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Data States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [userCompetencies, setUserCompetencies] = useState<UserCompetency[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz Interaction States
  const [activeQuiz, setActiveQuiz] = useState<GeneratedQuizResponse | null>(null);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmissionResponse['data'] | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        healthRes, 
        aiHealthRes, 
        profRes, 
        compsRes, 
        userCompsRes, 
        gapsRes, 
        recsRes, 
        resourcesRes
      ] = await Promise.all([
        fetchHealth(),
        fetchAiHealth(),
        fetchProfile(),
        fetchCompetencies(),
        fetchProfileCompetencies(),
        fetchSkillGaps(),
        fetchRecommendations(),
        fetchLearningResources()
      ]);

      setBackendHealth(healthRes);
      setAiStatus(aiHealthRes.status === 'healthy' || aiHealthRes.status === 'ok' ? 'online' : 'offline');
      setProfile(profRes);
      setCompetencies(compsRes);
      setUserCompetencies(userCompsRes);
      setSkillGaps(gapsRes.data || []);
      setRecommendations(recsRes || []);
      setLearningResources(resourcesRes);
    } catch (err: any) {
      console.error('[StatIntel] Data fetch notice:', err);
      setError(err.message || 'Connecting to local prototype backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleStartQuiz = async (
    topic: string = 'Sampling',
    questionCount: number = 5,
    difficulty: string = 'medium'
  ) => {
    setActiveTab('assessment');
    setQuizLoading(true);
    setError(null);
    setQuizResult(null);
    setUserAnswers({});
    try {
      const quiz = await generateQuiz(topic, questionCount, difficulty);
      setActiveQuiz(quiz);
    } catch (err: any) {
      setError(err.message || 'Failed to generate assessment quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmittingQuiz(true);
    setError(null);
    try {
      const res = await submitQuizAnswers(activeQuiz.quizId, userAnswers);
      setQuizResult(res.data);
      
      // Refresh competency gaps and recommendations live
      const [gapsRes, recsRes, userCompsRes] = await Promise.all([
        fetchSkillGaps(),
        fetchRecommendations(),
        fetchProfileCompetencies()
      ]);
      setSkillGaps(gapsRes.data || []);
      setRecommendations(recsRes || []);
      setUserCompetencies(userCompsRes);
    } catch (err: any) {
      setError(err.message || 'Quiz submission failed');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleResetQuiz = () => {
    setActiveQuiz(null);
    setQuizResult(null);
    setUserAnswers({});
  };

  const criticalGapsCount = skillGaps.filter(g => g.status === 'critical_gap').length;

  return (
    <AppShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      profile={profile}
      backendHealth={backendHealth}
      aiStatus={aiStatus}
      criticalGapsCount={criticalGapsCount}
      learningCount={learningResources.length}
      loading={loading}
      onRefresh={loadAllData}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleDarkMode}
    >
      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 p-4 rounded-2xl flex items-center space-x-3 text-xs animate-fade-in shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <div>
            <span className="font-bold">System Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Tab Views */}
      {activeTab === 'dashboard' && (
        <DashboardView
          profile={profile}
          skillGaps={skillGaps}
          recommendations={recommendations}
          onStartQuiz={(topic) => handleStartQuiz(topic, 5, 'medium')}
        />
      )}

      {activeTab === 'competencies' && (
        <CompetenciesView
          competencies={competencies}
          userCompetencies={userCompetencies}
          onStartQuiz={(topic) => handleStartQuiz(topic, 5, 'medium')}
        />
      )}

      {activeTab === 'learning' && (
        <LearningCatalogueView
          resources={learningResources}
          onStartQuiz={(topic) => handleStartQuiz(topic, 5, 'medium')}
        />
      )}

      {activeTab === 'assessment' && (
        <AssessmentView
          activeQuiz={activeQuiz}
          quizLoading={quizLoading}
          submittingQuiz={submittingQuiz}
          quizResult={quizResult}
          userAnswers={userAnswers}
          onStartQuiz={handleStartQuiz}
          onSelectOption={handleSelectOption}
          onSubmitQuiz={handleSubmitQuiz}
          onResetQuiz={handleResetQuiz}
        />
      )}

      {activeTab === 'evidence' && (
        <EvidenceView
          skillGaps={skillGaps}
          onStartQuiz={(topic) => handleStartQuiz(topic, 5, 'medium')}
        />
      )}
    </AppShell>
  );
}

export default App;
