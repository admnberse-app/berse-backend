# 🚀 Enable Google Calendar Integration - Quick Setup

## Step 1: Open Google Cloud Console
Open this link in your browser:
👉 **https://console.cloud.google.com/**

## Step 2: Create/Select Project
1. Click the project dropdown at the top
2. Click "NEW PROJECT"
3. Name it: **BerseMuka Calendar**
4. Click "CREATE"

## Step 3: Enable Google Calendar API
1. Once project is created, go to:
   👉 **https://console.cloud.google.com/apis/library**
2. Search for: **Google Calendar API**
3. Click on it
4. Click **"ENABLE"** button

## Step 4: Create OAuth Credentials
1. Go to: 👉 **https://console.cloud.google.com/apis/credentials**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**

### If you see "Configure Consent Screen":
1. Click it
2. Choose **"External"**
3. Fill in:
   - App name: **BerseMuka**
   - User support email: **Your email**
   - Developer contact: **Your email**
4. Click **"SAVE AND CONTINUE"**
5. On Scopes page, click **"SAVE AND CONTINUE"**
6. On Test users, add **your email address**
7. Click **"SAVE AND CONTINUE"**
8. Go back to Credentials

### Continue with OAuth Client:
1. Application type: **Web application**
2. Name: **BerseMuka Web Client**
3. Under "Authorized JavaScript origins", click **"+ ADD URI"** and add:
   - `http://localhost:5173`
   - `http://localhost:3000`
4. Under "Authorized redirect URIs", click **"+ ADD URI"** and add:
   - `http://localhost:5173`
   - `http://localhost:3000`
5. Click **"CREATE"**

## Step 5: Copy Your Credentials
You'll see a popup with:
- **Client ID**: Something like `123456789-abcdefg.apps.googleusercontent.com`
- Copy this Client ID

## Step 6: Create API Key
1. Still in Credentials page
2. Click **"+ CREATE CREDENTIALS"** > **"API key"**
3. Copy the API key that appears
4. Click **"RESTRICT KEY"**
5. Under "API restrictions":
   - Select **"Restrict key"**
   - Choose **"Google Calendar API"**
6. Click **"SAVE"**

## Step 7: Update Your .env File
Open `frontend/.env` and replace the placeholders:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

## Step 8: Restart the App
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

## Step 9: Test It!
1. Go to your app: http://localhost:5173
2. Navigate to **BerseConnect**
3. Click on any event to view details
4. Click **"Join Event"**
5. You'll be prompted to connect Google Calendar
6. Sign in with your Google account
7. Grant permissions
8. The event will be automatically added to your calendar! 📅

## Troubleshooting

### "Failed to initialize" error:
- Make sure you replaced BOTH the Client ID and API Key in .env
- Check that the Client ID ends with `.apps.googleusercontent.com`

### "Popup blocked" error:
- Allow popups from localhost in your browser
- Chrome: Click the blocked popup icon in address bar

### "Not authorized" error:
- Make sure you added your email as a test user in OAuth consent screen
- Check that localhost:5173 is in authorized origins

## Need Help?
Check the browser console (F12) for detailed error messages.

---
✅ **Once you've added the credentials and restarted, the Google Calendar integration will be fully active!**