import { Router } from 'express';
import discoverRouter from './discover.routes';
// Import other v2 routes as needed

const router = Router();

// API v2 routes
router.use('/discover', discoverRouter);

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
      }
    }
  });
});

export default router;
