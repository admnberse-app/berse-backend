# SMTP Setup Guide - Quick Start

## 🚀 Option 1: Gmail (Fastest Setup - 5 minutes)

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Under "How you sign in to Google", click **2-Step Verification**
3. Follow the prompts to set it up (you can use your phone)

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
   - Or search "app passwords" in your Google Account
2. In the dropdown, select:
   - **App**: Mail
   - **Device**: Other (type "Berse App")
3. Click **Generate**
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
5. **Important**: Remove spaces when pasting into .env

### Step 3: Update .env File
Open your `.env` file and update these lines:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE="false"
SMTP_USER="your-actual-email@gmail.com"
SMTP_PASS="abcdefghijklmnop"  # 16-char password, no spaces
FROM_EMAIL="your-actual-email@gmail.com"
FROM_NAME="Berse"
SUPPORT_EMAIL="your-actual-email@gmail.com"
APP_URL="http://localhost:5173"
```

### Step 4: Test It!
```bash
# The server should automatically restart
# Look for: ✅ Email service is ready

# Test with curl:
curl -X POST http://localhost:3000/api/v1/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@gmail.com"}'
```

---

## 🧪 Option 2: Mailtrap (Safest for Testing)

### Why Use Mailtrap?
- Captures all emails without sending them
- Perfect for testing without spamming real inboxes
- View emails in a web interface
- Free tier is generous

### Setup Steps:
1. Sign up: https://mailtrap.io (free account)
2. Go to **Email Testing** → **Inboxes** → **My Inbox**
3. Click **Show Credentials** under SMTP Settings
4. Copy the credentials

### Update .env:
```env
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_SECURE="false"
SMTP_USER="your-mailtrap-username"
SMTP_PASS="your-mailtrap-password"
FROM_EMAIL="test@bersemuka.com"
FROM_NAME="Berse"
SUPPORT_EMAIL="support@bersemuka.com"
APP_URL="http://localhost:5173"
```

### View Emails:
- All emails appear in your Mailtrap inbox
- Nothing gets sent to real email addresses
- Perfect for testing templates

---

## 🚀 Option 3: SendGrid (Production Ready)

### Setup Steps:
1. Sign up: https://app.sendgrid.com/signup
2. Complete sender verification
3. Go to **Settings** → **API Keys**
4. Click **Create API Key**
5. Name it "Berse App" and select "Full Access"
6. Copy the key (starts with `SG.`)

### Update .env:
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="SG.your-full-api-key-here"
FROM_EMAIL="noreply@yourdomain.com"  # Must verify this in SendGrid
FROM_NAME="Berse"
SUPPORT_EMAIL="support@yourdomain.com"
APP_URL="https://yourdomain.com"
```

### Verify Sender:
1. Go to **Settings** → **Sender Authentication**
2. Verify a single email OR authenticate your domain
3. Use verified email in `FROM_EMAIL`

---

## 🔍 Troubleshooting

### ❌ "Email service connection failed"
**Check:**
- SMTP credentials are correct
- No extra spaces in password
- Using correct SMTP host and port

### ❌ Gmail "Username and Password not accepted"
**Solutions:**
- Make sure 2FA is enabled
- Use App Password, not your regular password
- Remove spaces from the 16-character password
- Try generating a new App Password

### ❌ "Connection timeout"
**Check:**
- Your firewall isn't blocking port 587
- Try port 25 or 465
- Set `SMTP_SECURE="true"` for port 465

### ❌ Emails going to spam
**Solutions:**
- Use a verified sender domain
- Configure SPF, DKIM, DMARC records
- Use a professional SMTP provider (SendGrid, etc.)
- Avoid spam trigger words in subject/content

---

## 📊 Provider Comparison

| Provider | Free Tier | Best For | Setup Time |
|----------|-----------|----------|------------|
| **Gmail** | 500/day | Development | 5 min ⚡ |
| **Mailtrap** | 500/month | Testing | 5 min ⚡ |
| **SendGrid** | 100/day | Production | 15 min |
| **Mailgun** | 5,000/month | Production | 15 min |
| **Amazon SES** | 62K/month* | Scale | 30 min |

*Free tier when sending from EC2

---

## ✅ Verification Checklist

After configuring SMTP:

1. [ ] Updated `.env` with correct credentials
2. [ ] Removed any extra spaces from password
3. [ ] Server shows: `✅ Email service is ready`
4. [ ] Tested with `/api/v1/email/test` endpoint
5. [ ] Received test email successfully

---

## 🎯 Quick Test Command

```bash
# After configuring SMTP, test it:
curl -X POST http://localhost:3000/api/v1/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'

# Expected response:
# {"success": true, "message": "Test email sent successfully"}
```

---

## 📞 Need Help?

If you encounter issues:

1. Check server logs for detailed error messages
2. Verify SMTP credentials in provider dashboard
3. Try using Mailtrap first (easiest to debug)
4. Check your firewall settings
5. Review provider documentation for rate limits

---

## 🔐 Security Tips

- Never commit `.env` file to git
- Use environment-specific credentials
- Rotate passwords regularly
- Enable 2FA on email provider accounts
- Use API keys instead of passwords when possible
- Monitor email sending logs for suspicious activity
