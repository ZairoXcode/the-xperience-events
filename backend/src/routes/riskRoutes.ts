import { Router } from 'express';
import { RiskController } from '../controllers/riskController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateRiskSchema } from '../validators/entityValidators';

const router = Router();

router.patch('/:riskId', authenticate, validate(updateRiskSchema), RiskController.updateStatus);

export default router;
