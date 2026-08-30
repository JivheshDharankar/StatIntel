import { Router } from 'express';
import { CompetencyController } from '../controllers/competency.controller';

const router = Router();

router.get('/', CompetencyController.getCompetencies);
router.post('/score-evidence', CompetencyController.scoreEvidence);

export default router;
