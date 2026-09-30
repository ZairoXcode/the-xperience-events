import { Router } from 'express';
import { RequirementController } from '../controllers/requirementController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateRequirementSchema } from '../validators/entityValidators';

const router = Router();

router.patch('/:reqId', authenticate, validate(updateRequirementSchema), RequirementController.update);
router.delete('/:reqId', authenticate, RequirementController.delete);

export default router;
