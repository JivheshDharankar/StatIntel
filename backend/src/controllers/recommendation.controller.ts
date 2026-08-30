import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { RecommendationEngineService } from '../services/recommendation.service';

export class RecommendationController {
  static async getRecommendationsForProfile(req: Request, res: Response) {
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
      const recommendations = RecommendationEngineService.generateRecommendations(
        userCompetencies,
        undefined, // Uses AdapterRegistry all resources
        profile.designation
      );

      return res.json({
        success: true,
        profileId,
        officerName: profile.fullName,
        designation: profile.designation,
        totalRecommendations: recommendations.length,
        data: recommendations
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate recommendations',
        message: err.message
      });
    }
  }
}
