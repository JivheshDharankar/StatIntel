import { supabase } from '../lib/supabase';
import { UserProfile, UserCompetencyScore, CompetencyEvidenceItem } from '../types';
import { DEMO_OFFICIAL_PROFILE, DEMO_USER_COMPETENCIES, MASTER_COMPETENCIES } from '../data/seedData';

// In-memory state store for user competencies during prototype session
let activeUserCompetencies: UserCompetencyScore[] = [...DEMO_USER_COMPETENCIES];
let activeEvidenceHistory: CompetencyEvidenceItem[] = [];

export class ProfileService {
  /**
   * Retrieves user profile by ID
   */
  static async getProfileById(id: string): Promise<UserProfile | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (data && !error) {
        return {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          designation: data.designation,
          department: data.department,
          jobRole: data.job_role,
          experienceYears: data.experience_years,
          education: data.education,
          currentAssignment: data.current_assignment,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
    }

    // Local / Prototype fallback
    return DEMO_OFFICIAL_PROFILE;
  }

  /**
   * Retrieves user competency scores by User ID
   */
  static async getUserCompetencies(userId: string): Promise<UserCompetencyScore[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('user_competencies')
        .select('*, competency:competencies(*)')
        .eq('user_id', userId);

      if (data && !error && data.length > 0) {
        return data.map((uc: any) => ({
          id: uc.id,
          userId: uc.user_id,
          competencyId: uc.competency_id,
          competency: uc.competency ? {
            id: uc.competency.id,
            code: uc.competency.code,
            name: uc.competency.name,
            category: uc.competency.category,
            description: uc.competency.description,
            benchmarkScore: Number(uc.competency.benchmark_score),
            weight: Number(uc.competency.weight)
          } : undefined,
          estimatedScore: Number(uc.estimated_score),
          benchmarkScore: Number(uc.benchmark_score),
          gapScore: Number(uc.gap_score),
          confidenceLevel: Number(uc.confidence_level),
          lastAssessedAt: uc.last_assessed_at
        }));
      }
    }

    return activeUserCompetencies;
  }

  /**
   * Updates an officer's competency score following evidence calculation
   */
  static async updateUserCompetencyScore(
    userId: string,
    competencyId: string,
    newEstimatedScore: number
  ): Promise<UserCompetencyScore | null> {
    // 1. Try Supabase update if configured
    if (supabase) {
      const { data: comp } = await supabase
        .from('competencies')
        .select('benchmark_score')
        .eq('id', competencyId)
        .single();

      const benchmark = comp ? Number(comp.benchmark_score) : 80;
      const gapScore = Math.max(0, benchmark - newEstimatedScore);

      await supabase
        .from('user_competencies')
        .update({
          estimated_score: newEstimatedScore,
          gap_score: gapScore,
          last_assessed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('competency_id', competencyId);
    }

    // 2. Update local in-memory prototype state
    const existingIndex = activeUserCompetencies.findIndex(
      uc => uc.userId === userId && (uc.competencyId === competencyId || uc.competency?.code === competencyId)
    );

    if (existingIndex >= 0) {
      const current = activeUserCompetencies[existingIndex];
      const benchmark = current.benchmarkScore || 80;
      const updated: UserCompetencyScore = {
        ...current,
        estimatedScore: newEstimatedScore,
        gapScore: Math.round(Math.max(0, benchmark - newEstimatedScore) * 100) / 100,
        lastAssessedAt: new Date().toISOString()
      };
      activeUserCompetencies[existingIndex] = updated;
      return updated;
    } else {
      // Find matching competency from master
      const comp = MASTER_COMPETENCIES.find(c => c.id === competencyId || c.code === competencyId || c.name.toLowerCase() === competencyId.toLowerCase()) || MASTER_COMPETENCIES[1]; // default Sampling
      const updated: UserCompetencyScore = {
        id: `uc_${Date.now()}`,
        userId,
        competencyId: comp.id,
        competency: comp,
        estimatedScore: newEstimatedScore,
        benchmarkScore: comp.benchmarkScore,
        gapScore: Math.round(Math.max(0, comp.benchmarkScore - newEstimatedScore) * 100) / 100,
        confidenceLevel: 0.85,
        lastAssessedAt: new Date().toISOString()
      };
      activeUserCompetencies.push(updated);
      return updated;
    }
  }

  /**
   * Records a competency evidence item
   */
  static async recordCompetencyEvidence(evidence: CompetencyEvidenceItem): Promise<CompetencyEvidenceItem> {
    if (supabase) {
      try {
        await supabase.from('competency_evidence').insert({
          id: evidence.id,
          user_id: evidence.userId,
          competency_id: evidence.competencyId,
          evidence_type: evidence.evidenceType,
          score: evidence.score,
          impact_weight: evidence.impactWeight,
          previous_score: evidence.previousScore,
          new_score: evidence.newScore,
          metadata: {
            quiz_id: evidence.quizId,
            target_score: evidence.targetScore,
            old_gap: evidence.oldGap,
            new_gap: evidence.newGap,
            gap_closed_percentage: evidence.gapClosedPercentage
          }
        });
      } catch (err) {
        console.warn('[ProfileService] Supabase evidence insert notice:', err);
      }
    }

    activeEvidenceHistory.push(evidence);
    return evidence;
  }

  static getEvidenceHistory(): CompetencyEvidenceItem[] {
    return activeEvidenceHistory;
  }

  static resetMockState(): void {
    activeUserCompetencies = [...DEMO_USER_COMPETENCIES];
    activeEvidenceHistory = [];
  }
}
