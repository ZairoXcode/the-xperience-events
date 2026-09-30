import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateTaskSchema } from '../validators/entityValidators';

const router = Router();

router.patch('/:taskId', authenticate, validate(updateTaskSchema), TaskController.update);
router.delete('/:taskId', authenticate, TaskController.delete);

export default router;
