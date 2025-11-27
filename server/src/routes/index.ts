import { Router } from 'express';
import boardRoutes from './boards';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/boards', boardRoutes);

export default router;
