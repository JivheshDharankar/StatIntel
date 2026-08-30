import { Request, Response } from 'express';
import { LearningResourceService } from '../services/learningResource.service';
import { ResourceSourceCategory } from '../types';

export class LearningResourceController {
  static async getResources(req: Request, res: Response) {
    try {
      const { category, competencyId, competencyCode, targetLevel, search, limit } = req.query;

      const resources = await LearningResourceService.getResources({
        category: category as ResourceSourceCategory,
        competencyId: competencyId as string,
        competencyCode: competencyCode as string,
        targetLevel: targetLevel as string,
        search: search as string,
        limit: limit ? Number(limit) : undefined
      });

      return res.json({
        success: true,
        filters: {
          category: category || 'all',
          competencyId: competencyId || null,
          targetLevel: targetLevel || null
        },
        total: resources.length,
        data: resources
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve learning resources',
        message: err.message
      });
    }
  }

  static async getResourceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const resource = await LearningResourceService.getResourceById(id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: `Learning resource ${id} not found`
        });
      }

      return res.json({
        success: true,
        data: resource
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve resource',
        message: err.message
      });
    }
  }
}
