import { Router } from 'express';
import { SkillGapController } from '../controllers/skillGap.controller';

const router = Router();

router.get('/:profileId', SkillGapController.getSkillGaps);

export default router;
