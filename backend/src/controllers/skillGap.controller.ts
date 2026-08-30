import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { SkillGapService } from '../services/skillGap.service';

export class SkillGapController {
  static async getSkillGaps(req: Request, res: Response) {
    try {
      const { profileId } = req.params;
      const profile = await ProfileService.getProfileById(profileId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: `Profile ${profileId} not found`
        });
      }

      const userCompetencies = await ProfileService.getUserCompetencies(profileId);
      const gaps = SkillGapService.calculateSkillGaps(userCompetencies);

      const criticalGaps = gaps.filter(g => g.status === 'critical_gap');
      const moderateGaps = gaps.filter(g => g.status === 'moderate_gap');
      const proficientCount = gaps.filter(g => g.status === 'proficient' || g.status === 'mastery').length;

      return res.json({
        success: true,
        profileId,
        profileRole: profile.jobRole || profile.designation,
        summary: {
          totalAssessed: gaps.length,
          criticalGapsCount: criticalGaps.length,
          moderateGapsCount: moderateGaps.length,
          proficientCount,
          averageGap: gaps.length > 0 ? Math.round((gaps.reduce((acc, curr) => acc + curr.gap, 0) / gaps.length) * 10) / 10 : 0
        },
        data: gaps
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Failed to calculate skill gaps',
        message: err.message
      });
    }
  }
}
