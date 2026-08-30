import { UserCompetencyScore, SkillGapItem } from '../types';

export class SkillGapService {
  /**
   * Calculates and ranks skill gaps for a user's competency profile.
   * Gap formula: gap = max(0, requiredScore - currentScore)
   * Clamped between 0 and 100 with zero negative values.
   */
  static calculateSkillGaps(userCompetencies: UserCompetencyScore[]): SkillGapItem[] {
    const gaps: SkillGapItem[] = userCompetencies.map(uc => {
      const currentScore = Math.min(100, Math.max(0, uc.estimatedScore));
      const requiredScore = Math.min(100, Math.max(0, uc.benchmarkScore || 80));
      const gap = Math.max(0, Math.round((requiredScore - currentScore) * 10) / 10);

      let status: SkillGapItem['status'] = 'proficient';
      if (gap >= 35) {
        status = 'critical_gap';
      } else if (gap > 10) {
        status = 'moderate_gap';
      } else if (gap === 0 && currentScore >= 90) {
        status = 'mastery';
      } else {
        status = 'proficient';
      }

      return {
        competencyId: uc.competencyId,
        competencyCode: uc.competency?.code || 'UNKNOWN',
        competencyName: uc.competency?.name || 'Competency',
        category: uc.competency?.category || 'Statistical',
        currentScore,
        requiredScore,
        gap,
        priorityRank: 0, // Assigned after sorting
        status
      };
    });

    // Sort descending by gap magnitude
    gaps.sort((a, b) => b.gap - a.gap);

    // Assign 1-indexed priority ranks
    gaps.forEach((item, index) => {
      item.priorityRank = index + 1;
    });

    return gaps;
  }
}
