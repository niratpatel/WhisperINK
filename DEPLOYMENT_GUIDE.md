# 🚀 Student-Friendly Deployment Guide for WhisperINK

This guide will help you deploy WhisperINK to your phone and potentially Google Play Store **completely FREE** (except for the $25 one-time Google Play fee).

## 📱 Phase 1: Test on Your Phone (5 minutes)

### Option A: Expo Go (Quickest - No Build Required)

1. **Install Expo Go on your phone:**
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. **Start the development server:**
   ```bash
   cd client
   npm start
   ```

3. **Scan the QR code:**
   - Android: Use the Expo Go app to scan
   - iOS: Use your camera app to scan, it will open Expo Go

4. **Connect to backend on LAN:**
   - Your phone and computer must be on the **same WiFi network**
   - The server is already configured to run on `0.0.0.0` (accessible on LAN)
   - Update `client/src/services/api.js` to use your computer's local IP:
     ```javascript
     const API_URL = 'http://192.168.1.X:5001/api'; // Replace X with your IP
     ```

### Option B: Development Build (More Features)

If Expo Go has limitations, create a development build:

```bash
cd client
npx expo install expo-dev-client
eas build --profile development --platform android
```

## 🌐 Phase 2: Free Backend Hosting

You need to host your backend on a free service. Here are the best options:

### ⭐ Option 1: Railway.app (RECOMMENDED - Easiest)

**Free Tier:** $5 credit/month, 500 hours runtime (enough for development)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy from server directory
cd server
railway init
railway up

# Add environment variables in Railway dashboard
# Then get your deployment URL
```

**Steps:**
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub (free)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your WhisperINK repository
5. Set root directory to `/server`
6. Add environment variables in the dashboard
7. Get your URL (e.g., `https://your-app.railway.app`)

**Environment Variables to Add:**
- `MONGODB_URI` - from MongoDB Atlas (see below)
- `GEMINI_API_KEY` - from Google AI Studio
- `ASSEMBLYAI_API_KEY` - from AssemblyAI
- `PORT` - Railway sets this automatically

### Option 2: Render.com (Free Forever Plan)

**Free Tier:** Unlimited apps, sleeps after 15 min inactivity

```bash
# Just connect your GitHub repo
```

**Steps:**
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variables
7. Deploy (free tier URL: `https://your-app.onrender.com`)

**Note:** Free tier sleeps after 15 minutes of inactivity (takes ~30s to wake up).

### Option 3: Fly.io (Free with Credit Card)

**Free Tier:** 3 shared-cpu-1x VMs, 160GB outbound data/month

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
cd server
fly launch
fly deploy
```

### Option 4: Cyclic.sh (Simple, GitHub-based)

**Free Tier:** Unlimited apps

1. Go to [Cyclic.sh](https://www.cyclic.sh/)
2. Connect GitHub repo
3. Select server directory
4. Add env variables
5. Deploy

## 🗄️ Free Database: MongoDB Atlas

**Free Tier:** 512MB storage (plenty for starting out)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (free)
3. Create a free cluster (M0 Sandbox)
4. Create database user
5. Allow access from anywhere: `0.0.0.0/0` (for development)
6. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/whisperink?retryWrites=true&w=majority
   ```

## 🔑 Free API Keys

### Google Gemini AI (FREE)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

**Free Tier:** 60 requests per minute (plenty for personal use)

### AssemblyAI (FREE Tier)
1. Go to [AssemblyAI](https://www.assemblyai.com/)
2. Sign up (free)
3. Get API key from dashboard

**Free Tier:** 5 hours of audio per month (100 entries of 3 minutes each)

## 📦 Phase 3: Build Your App

### For Testing (Development Build)

```bash
cd client

# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure the project
eas build:configure

# Build for Android (takes ~15-20 minutes)
eas build --platform android --profile development

# Download and install the .apk on your phone
```

### For Production (Google Play Ready)

```bash
# Create production build
eas build --platform android --profile production

# This creates an .aab file for Google Play
```

## 🎮 Phase 4: Google Play Store Publishing

### Requirements:
- **One-time fee:** $25 (only required cost)
- **Google Play Developer Account**
- **Signed APK/AAB file** (from EAS build)

### Steps:

1. **Create Google Play Developer Account:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Pay one-time $25 registration fee
   - Complete account setup

2. **Prepare App Listing:**
   - App name: WhisperINK
   - Description
   - Screenshots (take from your phone)
   - Privacy policy (you can use free generators)

3. **Upload Your App:**
   ```bash
   # Build production AAB
   eas build --platform android --profile production
   
   # Download the .aab file
   # Upload to Google Play Console → Internal Testing
   ```

4. **Testing Track:**
   - Start with **Internal Testing** (up to 100 testers)
   - Then **Closed Testing** (alpha/beta)
   - Finally **Production** when ready

## 🔄 Complete Free Setup Workflow

### Step-by-Step:

```bash
# 1. Set up MongoDB Atlas (free)
# - Create account and cluster
# - Get connection string

# 2. Get API Keys (free)
# - Google Gemini AI Studio
# - AssemblyAI

# 3. Deploy Backend to Railway (free)
cd server
railway login
railway init
railway up
# Add environment variables in dashboard

# 4. Update Client API URL
# Edit client/src/services/api.js
# Change to your Railway URL

# 5. Build Android App
cd client
eas build --platform android --profile preview

# 6. Install on Phone
# Download .apk and install
```

## 📱 Update Your Client API Configuration

Edit `client/src/services/api.js`:

```javascript
// For local testing (phone on same WiFi)
const API_URL = 'http://192.168.1.5:5001/api'; // Your computer's IP

// For production (after deploying to Railway/Render)
const API_URL = 'https://your-app.railway.app/api';
```

## 💡 Cost-Free Architecture

```
┌─────────────────┐
│   Your Phone    │
│  (WhisperINK)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐        ┌──────────────────┐
│  Railway.app    │───────▶│  MongoDB Atlas   │
│  (Backend FREE) │        │  (Database FREE) │
└────────┬────────┘        └──────────────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│  Google Gemini  │  │  AssemblyAI     │
│  (AI - FREE)    │  │  (Speech - FREE)│
└─────────────────┘  └─────────────────┘
```

**Total Monthly Cost: $0**
**One-time Cost: $25** (only if publishing to Google Play)

## 🎯 Recommended Path for Students

1. **Week 1:** Test locally on phone via Expo Go (same WiFi)
2. **Week 2:** Deploy backend to Railway (free) + MongoDB Atlas
3. **Week 3:** Build development APK and test on phone
4. **Week 4:** Create production build and publish to Google Play

## 🆘 Troubleshooting

### Phone can't connect to local server?
- Ensure same WiFi network
- Check firewall settings
- Use `ifconfig` (Mac) or `ipconfig` (Windows) to find your IP
- Update API_URL in client code

### Railway/Render app sleeping?
- Use a free uptime monitor like [UptimeRobot](https://uptimerobot.com/) to ping every 5 minutes

### MongoDB Atlas connection issues?
- Whitelist IP: `0.0.0.0/0` for development
- Check username/password in connection string
- Ensure database name is correct

### Build failing on EAS?
- Check `eas.json` configuration
- Ensure all dependencies are in `package.json`
- Check Expo SDK compatibility

## 📚 Free Resources

- **Expo Documentation:** https://docs.expo.dev/
- **Railway Docs:** https://docs.railway.app/
- **MongoDB Atlas Tutorials:** https://www.mongodb.com/docs/atlas/
- **Google Play Publishing Guide:** https://developer.android.com/distribute

## 🎓 Student Benefits

Consider applying for:
- **GitHub Student Developer Pack:** Free credits for various services
- **Google Cloud for Students:** Free credits (can host there too)
- **AWS Educate:** Free tier + credits

---

**You can build and publish a professional app with $0-25 total cost!** 🎉
