import { Router } from 'express';
import { DeadlinesController } from '../controllers/deadlinesController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateDeadlineSchema } from '../validators/entityValidators';

const router = Router();

router.patch('/:deadlineId', authenticate, validate(updateDeadlineSchema), DeadlinesController.update);
router.delete('/:deadlineId', authenticate, DeadlinesController.delete);

export default router;
