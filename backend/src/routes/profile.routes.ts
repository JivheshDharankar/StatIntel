import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';

const router = Router();

router.get('/:id', ProfileController.getProfileById);
router.get('/:id/competencies', ProfileController.getProfileCompetencies);

export default router;
