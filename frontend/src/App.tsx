import React, { useEffect, useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
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

  const handleStartQuiz = async (topic: string) => {
    setActiveTab('assessment');
    setQuizLoading(true);
    setError(null);
    setQuizResult(null);
    setUserAnswers({});
    try {
      const quiz = await generateQuiz(topic, 3, 'medium');
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar with branding & tabs */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        backendHealth={backendHealth}
        aiStatus={aiStatus}
        loading={loading}
        onRefresh={loadAllData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center space-x-3 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Notice:</span> {error}
            </div>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            skillGaps={skillGaps}
            recommendations={recommendations}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {activeTab === 'competencies' && (
          <CompetenciesView
            competencies={competencies}
            userCompetencies={userCompetencies}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {activeTab === 'learning' && (
          <LearningCatalogueView
            resources={learningResources}
            onStartQuiz={handleStartQuiz}
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
            onStartQuiz={handleStartQuiz}
          />
        )}
      </main>

      {/* Government Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">StatIntel</span>
            <span>• Smart India Hackathon (SIH26101) Functional Prototype</span>
          </div>
          <span className="text-slate-400">
            Ministry of Statistics & Programme Implementation • Official Statistical System
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
