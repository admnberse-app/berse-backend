import { Request, Response } from 'express';
import settingsService from './settings.service';
import { UpdateSettingsRequest } from './settings.types';
import { AuthRequest } from '../../types';

export class SettingsController {
  /**
   * Get user settings
   * @route GET /v2/users/settings
   */
  async getSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log('================================');
      console.log('SETTINGS CONTROLLER - getSettings called');
      console.log('req.user:', JSON.stringify(req.user, null, 2));
      console.log('userId will be:', req.user!.id);
      console.log('================================');
      
      const userId = req.user!.id;

      const settings = await settingsService.getUserSettings(userId);

      res.json({
        success: true,
        data: settings
      });
    } catch (error: any) {
      console.error('Get settings error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch settings'
      });
    }
  }

  /**
   * Update user settings
   * @route PUT /v2/users/settings
   */
  async updateSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const updates: UpdateSettingsRequest = req.body;

      const settings = await settingsService.updateUserSettings(userId, updates);

      res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully'
      });
    } catch (error: any) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update settings'
      });
    }
  }

  /**
   * Update privacy settings
   * @route PUT /v2/users/settings/privacy
   */
  async updatePrivacy(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const privacy = req.body;

      const settings = await settingsService.updateUserSettings(userId, { privacy });

      res.json({
        success: true,
        data: settings.privacy,
        message: 'Privacy settings updated successfully'
      });
    } catch (error: any) {
      console.error('Update privacy error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update privacy settings'
      });
    }
  }

  /**
   * Update notification settings
   * @route PUT /v2/users/settings/notifications
   */
  async updateNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const notifications = req.body;

      const settings = await settingsService.updateUserSettings(userId, { notifications });

      res.json({
        success: true,
        data: settings.notifications,
        message: 'Notification settings updated successfully'
      });
    } catch (error: any) {
      console.error('Update notifications error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update notification settings'
      });
    }
  }

  /**
   * Update app preferences
   * @route PUT /v2/users/settings/preferences
   */
  async updatePreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const preferences = req.body;

      const settings = await settingsService.updateUserSettings(userId, { preferences });

      res.json({
        success: true,
        data: settings.preferences,
        message: 'Preferences updated successfully'
      });
    } catch (error: any) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update preferences'
      });
    }
  }

  /**
   * Reset settings to defaults
   * @route POST /v2/users/settings/reset
   */
  async resetSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { section } = req.body;

      const settings = await settingsService.resetSettings(userId, section);

      res.json({
        success: true,
        data: settings,
        message: section 
          ? `${section} settings reset to defaults`
          : 'All settings reset to defaults'
      });
    } catch (error: any) {
      console.error('Reset settings error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to reset settings'
      });
    }
  }

  /**
   * Export settings
   * @route GET /v2/users/settings/export
   */
  async exportSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const exportData = await settingsService.exportSettings(userId);

      res.json({
        success: true,
        data: exportData
      });
    } catch (error: any) {
      console.error('Export settings error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to export settings'
      });
    }
  }
}

export default new SettingsController();
 
