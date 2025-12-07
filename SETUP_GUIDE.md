# 🔧 Environment Setup Guide for WhisperINK

This guide will walk you through setting up all the API keys and configuration needed for WhisperINK.

## 📋 What You'll Need

1. **MongoDB Atlas** (Database) - FREE
2. **Google Gemini AI** (AI Transformations) - FREE
3. **AssemblyAI** (Audio Transcription) - FREE with 5 hours/month

---

## 1️⃣ MongoDB Atlas Setup (5 minutes)

MongoDB Atlas provides a free 512MB database - perfect for starting out!

### Steps:

1. **Go to:** https://www.mongodb.com/cloud/atlas/register

2. **Sign up:**
   - Use your email or sign up with Google
   - Choose the FREE tier (M0 Sandbox)

3. **Create a cluster:**
   - Click "Build a Database"
   - Choose **FREE** shared cluster
   - Select a cloud provider & region (any nearby region)
   - Cluster name: `WhisperINK` (or leave default)
   - Click "Create"

4. **Create a database user:**
   - You'll see "Security Quickstart"
   - Username: `whisperink_user` (or your choice)
   - Password: Click "Autogenerate Secure Password" and **SAVE IT**
   - Click "Create User"

5. **Set network access:**
   - Click "Add My Current IP Address"
   - For development, also add: `0.0.0.0/0` (allows access from anywhere)
   - Click "Finish and Close"

6. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy the connection string - looks like:
     ```
     mongodb+srv://whisperink_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **IMPORTANT:** Replace `<password>` with the password you saved earlier
   - Add database name at the end: `/whisperink`
   
   Final format:
   ```
   mongodb+srv://whisperink_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/whisperink?retryWrites=true&w=majority
   ```

✅ **Save this connection string!** You'll need it for the .env file.

---

## 2️⃣ Google Gemini AI Setup (2 minutes)

Gemini AI transforms your transcriptions into beautiful, cinematic journal entries.

### Steps:

1. **Go to:** https://aistudio.google.com/app/apikey

2. **Sign in** with your Google account

3. **Create API Key:**
   - Click "Create API Key"
   - Select "Create API key in new project" (or use existing project)
   - Click "Create"

4. **Copy your API key** - looks like:
   ```
   AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

5. **Free Tier Limits:**
   - 60 requests per minute
   - 1,500 requests per day
   - More than enough for personal use!

✅ **Save this API key!**

---

## 3️⃣ AssemblyAI Setup (3 minutes)

AssemblyAI transcribes your voice recordings into text.

### Steps:

1. **Go to:** https://www.assemblyai.com/

2. **Click "Get Started Free"** or "Sign Up"

3. **Create an account:**
   - Use your email or sign up with Google/GitHub
   - Verify your email if needed

4. **Get API Key:**
   - After signing in, you'll see your dashboard
   - Your API key is displayed on the home page
   - Or go to: https://www.assemblyai.com/app/account
   - Copy the API key - looks like:
     ```
     xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

5. **Free Tier Limits:**
   - 5 hours of audio per month
   - That's about 100 journal entries of 3 minutes each!

✅ **Save this API key!**

---

## 4️⃣ Create Your .env File

Now let's create the `.env` file with all your API keys:

### Option A: Use the Interactive Setup Script

```bash
cd /Users/niratpatel/Documents/Projects/WhisperINK-2
./setup-env.sh
```

The script will ask for each value and create the .env file for you!

### Option B: Manual Setup

1. **Create the file:**
   ```bash
   cd server
   nano .env
   ```

2. **Paste this template and fill in YOUR values:**
   ```env
   # Server Configuration
   PORT=5001

   # MongoDB Atlas Connection String
   # Replace with YOUR connection string from step 1
   MONGODB_URI=mongodb+srv://whisperink_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/whisperink?retryWrites=true&w=majority

   # Google Gemini AI API Key
   # Replace with YOUR API key from step 2
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

   # AssemblyAI API Key
   # Replace with YOUR API key from step 3
   ASSEMBLYAI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # AWS S3 (Optional - leave empty for now)
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=
   AWS_BUCKET_NAME=
   ```

3. **Save the file:**
   - Press `Ctrl + X`
   - Press `Y` to confirm
   - Press `Enter` to save

---

## 5️⃣ Test Your Configuration

After creating the .env file:

```bash
# Stop the current server (if running)
# Press Ctrl+C in the terminal where server is running

# Restart the server
cd server
npm run dev
```

**Expected output (SUCCESS):**
```
[nodemon] starting `node server.js`
AI Insight generation job scheduled
Server running on port 5001 and accessible on LAN
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

**If you see errors:**
- "MongoDB Connection Error" → Check your MONGODB_URI
- "Gemini API Key not found" → Check GEMINI_API_KEY
- "AssemblyAI API Key not found" → Check ASSEMBLYAI_API_KEY

---

## 6️⃣ Verify Everything Works

Test the health endpoint:

```bash
# In a new terminal
curl http://localhost:5001/api/health
```

**Expected response:**
```json
{"status":"OK","timestamp":"2025-12-07T..."}
```

---

## 📝 Quick Reference

### Your .env file should look like this:

```env
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/whisperink?retryWrites=true&w=majority
GEMINI_API_KEY=AIzaSy...
ASSEMBLYAI_API_KEY=...
```

### Important Notes:

- ✅ `.env` is in `.gitignore` (won't be committed to GitHub)
- ✅ Never share your API keys publicly
- ✅ All services listed are FREE for personal/development use
- ✅ You can always regenerate keys if needed

---

## ❓ Troubleshooting

### "MongoDB connection failed"
- Check your password has no special characters that need encoding
- Verify IP whitelist includes `0.0.0.0/0`
- Ensure `/whisperink` is at the end of connection string

### "Gemini API Error"
- Verify API key is correct
- Check you haven't exceeded free tier limits
- Make sure there are no extra spaces in the .env file

### "AssemblyAI Error"
- Verify API key is correct
- Check you haven't used all 5 hours for the month
- Verify your account is activated

---

## 🎉 Next Steps

Once your .env is set up:

1. ✅ Backend server should start without errors
2. ✅ Start the client: `cd client && npm start`
3. ✅ Test on your phone with Expo Go
4. ✅ Record your first journal entry!

---

**Need help?** Check the error messages in the terminal - they'll guide you to what's missing!
