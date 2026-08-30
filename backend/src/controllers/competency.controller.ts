import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { MASTER_COMPETENCIES } from '../data/seedData';
import { CompetencyScoringService } from '../services/competency.service';

export class CompetencyController {
  static async getCompetencies(_req: Request, res: Response) {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('competencies')
          .select('*')
          .order('category', { ascending: true })
          .order('code', { ascending: true });

        if (data && !error && data.length > 0) {
          return res.json({
            success: true,
            data: data.map(c => ({
              id: c.id,
              code: c.code,
              name: c.name,
              category: c.category,
              description: c.description,
              benchmarkScore: Number(c.benchmark_score),
              weight: Number(c.weight)
            })),
            total: data.length,
            source: 'supabase'
          });
        }
      }

      // Local master competencies fallback
      return res.json({
        success: true,
        data: MASTER_COMPETENCIES,
        total: MASTER_COMPETENCIES.length,
        source: 'local_master_framework'
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve competencies',
        message: err.message
      });
    }
  }

  static scoreEvidence(req: Request, res: Response) {
    try {
      const { 
        previousScore = 35, 
        quizScore = 4, 
        totalQuestions = 5, 
        benchmarkScore = 80, 
        impactWeight = 0.35 
      } = req.body;

      if (isNaN(Number(previousScore)) || isNaN(Number(quizScore)) || isNaN(Number(totalQuestions))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input parameters for evidence calculation'
        });
      }

      const calculation = CompetencyScoringService.calculateUpdatedCompetency(
        Number(previousScore),
        Number(quizScore),
        Number(totalQuestions),
        Number(benchmarkScore),
        Number(impactWeight)
      );

      return res.json({
        success: true,
        data: calculation
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Calculation error',
        message: err.message
      });
    }
  }
}
