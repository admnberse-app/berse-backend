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

// Get all users (for match screen)
router.get('/all', authenticateToken, asyncHandler(UserController.getAllUsers));

// Update user profile
router.put('/profile', authenticateToken, asyncHandler(UserController.updateProfile));

// Upload profile picture (supports both file upload and base64)
router.post('/upload-avatar', 
  authenticateToken,
  uploadLimiter,
  asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { image } = req.body; // For base64 image
      const file = req.file; // For file upload

      let profilePictureUrl;

      if (image) {
        // Handle base64 image
        // For now, we'll store the base64 directly in the database
        // In production, you'd want to upload to a cloud storage service
        profilePictureUrl = image;
      } else if (file) {
        // Handle file upload
        profilePictureUrl = `/uploads/${file.filename}`;
      } else {
        throw new AppError('No image provided', 400);
      }

      // Update user's profile picture
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: profilePictureUrl,
        },
        select: {
          id: true,
          profilePicture: true,
        },
      });

      sendSuccess(res, { 
        ...updatedUser, 
        data: { profilePicture: profilePictureUrl } 
      }, 'Profile picture uploaded successfully');
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

// Delete user (admin only)
router.delete('/:id', authenticateToken, asyncHandler(UserController.deleteUser));

export default router;