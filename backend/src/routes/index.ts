import { Router } from 'express';
import authRoutes from './authRoutes';
import eventRoutes from './eventRoutes';
import taskRoutes from './taskRoutes';
import vendorRoutes from './vendorRoutes';
import deadlineRoutes from './deadlineRoutes';
import requirementRoutes from './requirementRoutes';
import riskRoutes from './riskRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/vendors', vendorRoutes);
apiRouter.use('/deadlines', deadlineRoutes);
apiRouter.use('/requirements', requirementRoutes);
apiRouter.use('/risks', riskRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'The Xperience API',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
