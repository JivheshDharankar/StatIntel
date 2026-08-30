import { Router, Request, Response } from 'express';

const router = Router();

router.get('/admin-summary', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalCadreOfficers: 1420,
      activeLearners: 890,
      assessmentsCompleted: 3410,
      quizzesTaken: 8920,
      averageGapClosureRate: '34.8%',
      topOrganizationSkillGaps: [
        { name: 'Sampling', averageGap: 42, affectedCadrePercent: 68 },
        { name: 'Data Quality', averageGap: 36, affectedCadrePercent: 54 },
        { name: 'Python', averageGap: 48, affectedCadrePercent: 62 },
        { name: 'AI/ML', averageGap: 52, affectedCadrePercent: 71 },
        { name: 'SDG Indicators', averageGap: 28, affectedCadrePercent: 40 }
      ],
      competencyDistribution: {
        Statistical: 64,
        Technical: 52,
        'Digital Governance': 70,
        'Behavioural/Managerial': 76
      }
    }
  });
});

export default router;
