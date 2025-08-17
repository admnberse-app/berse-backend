import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { asyncHandler } from '../../../utils/asyncHandler';
import { UserController } from '../../../controllers/user.controller';
import { upload } from '../../../middleware/upload';
import { uploadLimiter } from '../../../middleware/rateLimiter';
import { prisma } from '../../../config/database';
import { sendSuccess } from '../../../utils/response';
import { AppError } from '../../../middleware/error';

const router = Router();

// Get user profile
router.get('/profile', authenticateToken, asyncHandler(UserController.getProfile));

// Update user profile
router.put('/profile', authenticateToken, asyncHandler(UserController.updateProfile));

// Upload profile picture
router.post('/upload-avatar', 
  authenticateToken,
  uploadLimiter,
  upload.single('avatar'),
  asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const file = req.file;

      if (!file) {
        throw new AppError('No file uploaded', 400);
      }

      // Update user's profile picture
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: `/uploads/${file.filename}`,
        },
        select: {
          id: true,
          profilePicture: true,
        },
      });

      sendSuccess(res, updatedUser, 'Profile picture uploaded successfully');
    } catch (error) {
      next(error);
    }
  })
);

// Search users
router.get('/search', authenticateToken, asyncHandler(UserController.searchUsers));

// Get user by ID
router.get('/:id', authenticateToken, asyncHandler(UserController.getUserById));

// Follow user
router.post('/follow/:id', authenticateToken, asyncHandler(UserController.followUser));

// Unfollow user
router.delete('/follow/:id', authenticateToken, asyncHandler(UserController.unfollowUser));

export default router;