import { Router } from 'express';
import { LearningResourceController } from '../controllers/learningResource.controller';

const router = Router();

router.get('/', LearningResourceController.getResources);
router.get('/:id', LearningResourceController.getResourceById);

export default router;
