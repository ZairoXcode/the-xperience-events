import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { TaskController } from '../controllers/taskController';
import { VendorController } from '../controllers/vendorController';
import { DeadlinesController } from '../controllers/deadlinesController';
import { RequirementController } from '../controllers/requirementController';
import { RiskController } from '../controllers/riskController';
import { ChatController } from '../controllers/chatController';
import { ActivityController } from '../controllers/activityController';

import { authenticate } from '../middleware/auth';
import { requireEventAccess } from '../middleware/ownership';
import { validate } from '../middleware/validate';

import { createEventSchema, updateEventSchema } from '../validators/eventValidators';
import {
  createTaskSchema,
  createVendorSchema,
  createDeadlineSchema,
  createRequirementSchema,
} from '../validators/entityValidators';

const router = Router();

// Protect all event routes with authentication
router.use(authenticate);

// Event CRUD
router.get('/', EventController.list);
router.post('/', validate(createEventSchema), EventController.create);

router.get('/:id', requireEventAccess, EventController.getById);
router.patch('/:id', requireEventAccess, validate(updateEventSchema), EventController.update);
router.delete('/:id', requireEventAccess, EventController.delete);
router.get('/:id/summary', requireEventAccess, EventController.getSummary);

// Nested Sub-resources
// Tasks
router.get('/:eventId/tasks', requireEventAccess, TaskController.list);
router.post(
  '/:eventId/tasks',
  requireEventAccess,
  validate(createTaskSchema),
  TaskController.create
);

// Vendors
router.get('/:eventId/vendors', requireEventAccess, VendorController.list);
router.post(
  '/:eventId/vendors',
  requireEventAccess,
  validate(createVendorSchema),
  VendorController.create
);

// Deadlines
router.get('/:eventId/deadlines', requireEventAccess, DeadlinesController.list);
router.post(
  '/:eventId/deadlines',
  requireEventAccess,
  validate(createDeadlineSchema),
  DeadlinesController.create
);

// Requirements
router.get('/:eventId/requirements', requireEventAccess, RequirementController.list);
router.post(
  '/:eventId/requirements',
  requireEventAccess,
  validate(createRequirementSchema),
  RequirementController.create
);

// Risks
router.get('/:eventId/risks', requireEventAccess, RiskController.list);

// AI Chat
router.get('/:eventId/chat', requireEventAccess, ChatController.getHistory);
router.post('/:eventId/chat', requireEventAccess, ChatController.sendMessage);
router.delete('/:eventId/chat', requireEventAccess, ChatController.clearHistory);

// Activity Timeline
router.get('/:eventId/activity', requireEventAccess, ActivityController.list);

export default router;
