import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';

const router = Router();

// Retrieve prioritized recommendations for given profile
router.get('/:profileId', RecommendationController.getRecommendationsForProfile);

export default router;
