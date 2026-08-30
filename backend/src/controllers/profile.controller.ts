import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';

export class ProfileController {
  static async getProfileById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profile = await ProfileService.getProfileById(id);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }

      return res.json({
        success: true,
        data: profile
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error while fetching profile',
        message: err.message
      });
    }
  }

  static async getProfileCompetencies(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const competencies = await ProfileService.getUserCompetencies(id);

      return res.json({
        success: true,
        profileId: id,
        data: competencies,
        total: competencies.length
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error while fetching user competencies',
        message: err.message
      });
    }
  }
}
