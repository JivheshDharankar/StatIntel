import { LearningResourceItem, RecommendationItem, UserCompetencyScore } from '../types';
import { adapterRegistry } from '../adapters/registry';
import { SkillGapService } from './skillGap.service';

export class RecommendationEngineService {
  /**
   * Generates explainable, prioritized recommendations based on competency gaps and user role.
   */
  static generateRecommendations(
    userCompetencies: UserCompetencyScore[],
    availableResources?: LearningResourceItem[],
    userRole: string = 'Statistical Officer'
  ): RecommendationItem[] {
    const resources = availableResources || adapterRegistry.getAllResources();
    const rankedGaps = SkillGapService.calculateSkillGaps(userCompetencies);
    const recommendations: RecommendationItem[] = [];
    const seenResourceIds = new Set<string>();

    for (const gap of rankedGaps) {
      if (gap.gap <= 0) continue; // No recommendation needed if gap is 0

      // Match resources by competency ID, code, or name
      const matchingResources = resources.filter(r => {
        const matchesId = r.competencyId && r.competencyId === gap.competencyId;
        const matchesCode = r.competencyCode && r.competencyCode === gap.competencyCode;
        const matchesName = r.competencyName && r.competencyName.toLowerCase() === gap.competencyName.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(gap.competencyName.toLowerCase());
        const matchesDesc = r.description.toLowerCase().includes(gap.competencyName.toLowerCase());
        return matchesId || matchesCode || matchesName || matchesTitle || matchesDesc;
      });

      for (const res of matchingResources) {
        if (seenResourceIds.has(res.id)) continue;
        seenResourceIds.add(res.id);

        // Deterministic explainable scoring formula:
        // baseGapFactor (0-50) + sourceReliability (20-30) + roleFactor (10-20)
        const gapFactor = Math.min(50, Math.round(gap.gap * 0.8));
        
        let sourceScore = 25;
        if (res.sourceCategory === 'NSSTA') sourceScore = 30; // Dedicated Academy for Indian Statistical Services
        else if (res.sourceCategory === 'TPAC') sourceScore = 28;
        else if (res.sourceCategory === 'iGOT') sourceScore = 26;
        else if (res.sourceCategory === 'Learning Material') sourceScore = 25;

        let roleScore = 15;
        if (userRole.toLowerCase().includes('statistical') || userRole.toLowerCase().includes('officer')) {
          roleScore = 20;
        }

        const matchScore = Math.min(100, gapFactor + sourceScore + roleScore);

        const rationale = `Recommended because ${gap.competencyName} is your #${gap.priorityRank} priority skill gap (${gap.gap} pts gap to target) and this official ${res.sourceCategory} ${res.resourceType.toLowerCase()} (${res.title}) specifically provides ${res.targetLevel.toLowerCase()} competency building.`;

        recommendations.push({
          id: `rec_${gap.competencyId}_${res.id}`,
          userId: userCompetencies[0]?.userId || 'demo_user',
          competencyId: gap.competencyId,
          resourceId: res.id,
          resource: res,
          gapScore: gap.gap,
          matchScore,
          rationale,
          priorityRank: 0, // Assigned after sorting
          status: 'recommended'
        });
      }
    }

    // Sort descending by matchScore
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Assign final recommendation ranks
    recommendations.forEach((rec, idx) => {
      rec.priorityRank = idx + 1;
    });

    return recommendations;
  }
}
