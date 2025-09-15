# Google Calendar Integration Setup Guide

## Overview
The calendar in your BerseMuka app now supports Google Calendar integration. This allows you to:
- See your Google Calendar events in the app
- Add app events to your Google Calendar
- Sync events bidirectionally

## Setup Instructions

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name your project (e.g., "BerseMuka Calendar")

### Step 2: Enable Google Calendar API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required fields
   - Add your email to test users
4. For Application type, select "Web application"
5. Add these settings:
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173`
     - `http://localhost:3000` (if needed)
   - **Authorized redirect URIs**: 
     - `http://localhost:5173`
     - `http://localhost:3000` (if needed)
6. Click "Create"

### Step 4: Get Your Credentials
1. After creating, you'll see your Client ID and Client Secret
2. Also create an API Key:
   - Click "Create Credentials" > "API Key"
   - Restrict the key to Google Calendar API

### Step 5: Configure the App
1. Copy `frontend/.env.example` to `frontend/.env`
2. Add your credentials:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your_api_key_here
```

### Step 6: Restart the App
```bash
cd frontend
npm run dev
```

## How to Use

### Connect Google Calendar
1. **From Settings**: Go to Settings > Integrations > Google Calendar
2. **When Joining Events**: You'll be prompted to connect when joining your first event
3. Click "Connect" to sign in with your Google account
4. Grant permissions for calendar access
5. Your connection status will be saved

### Features
- **Auto Calendar Invites**: When you join an event, it automatically adds to your Google Calendar
- **Smart Reminders**: Get email reminders 1 day before and popup 1 hour before events
- **View Google Events**: Your Google Calendar events appear alongside app events
- **Different Colors**: Google events show in Google blue (#4285F4)
- **Sync Status**: See connection status in Settings
- **One-Click Disconnect**: Option to disconnect Google Calendar anytime

### Automatic Event Addition
When you join an event in BerseConnect:
1. The event is automatically added to your primary Google Calendar
2. You'll see a green notification confirming the addition
3. Event details include:
   - Event title and description
   - Location and venue
   - Organizer information
   - Category and BerseMuka branding
4. Automatic reminders are set:
   - Email reminder 24 hours before
   - Popup reminder 1 hour before

### Visual Indicators
- **App Events**: Original app colors
- **Google Events**: Blue color with 📅 icon
- **Patterned Dates**: Dates with committed events have a diagonal pattern

## Troubleshooting

### "Failed to initialize Google Calendar"
- Check that your Client ID and API Key are correct in `.env`
- Ensure Google Calendar API is enabled in Google Cloud Console

### "Failed to sign in to Google"
- Check that your domain is added to authorized origins
- Clear browser cookies and try again
- Ensure you're using a Google account

### Events not syncing
- Click the "Sync" button to manually refresh
- Check browser console for errors
- Verify API quotas in Google Cloud Console

## Security Notes
- Never commit your `.env` file with real credentials
- Keep your API keys secure
- Use restricted API keys in production
- Review OAuth consent screen settings for production use

## Support
For issues with Google Calendar integration, check:
1. Browser developer console for errors
2. Google Cloud Console for API status
3. Network tab for failed requests