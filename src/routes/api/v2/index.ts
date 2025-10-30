import { Router } from 'express';
import discoverRouter from './discover.routes';
import matchingRouter from '../../../modules/matching/matching.routes';
// Import other v2 routes as needed

const router = Router();

// API v2 routes
router.use('/discover', discoverRouter);
router.use('/matching', matchingRouter);

// API v2 health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API v2 is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// API v2 documentation
router.get('/', (req, res) => {
  res.json({
    success: true,
    version: '2.0.0',
    endpoints: {
      discover: {
        'GET /discover': 'Get discover feed (sections or search results)',
        'GET /discover/trending': 'Get trending content',
        'GET /discover/nearby': 'Get nearby content',
      },
      matching: {
        'GET /matching/discover': 'Get discovery users with matching algorithm',
        'POST /matching/swipe': 'Record swipe action (SKIP or INTERESTED)',
        'POST /matching/connection-sent': 'Mark connection request as sent',
        'GET /matching/stats': 'Get swipe statistics',
      }
    }
  });
});

export default router;
