# 🍃 MongoDB Atlas Free Tier Setup - Step by Step

Follow these exact steps to set up your free MongoDB database in 5 minutes!

---

## Step 1: Create Account (2 minutes)

1. **Open this URL in your browser:**
   ```
   https://www.mongodb.com/cloud/atlas/register
   ```

2. **Sign up with Google (EASIEST):**
   - Click the **"Sign up with Google"** button
   - Choose your Google account
   - This is the fastest way!

   **OR sign up with email:**
   - Enter your email, first name, last name
   - Create a password
   - Click "Create your Atlas account"
   - Check your email and verify

3. **Complete the welcome questionnaire:**
   - Goal: Select **"I'm learning MongoDB"** or **"Build a new app"**
   - Language: Select **"JavaScript"**
   - Click "Finish"

---

## Step 2: Create a FREE Cluster (2 minutes)

1. **You'll see: "Deploy your database"**
   - Look for **three options**: M0, M10, M30 (or Shared, Dedicated, Serverless)

2. **Select the FREE tier:**
   - Click on **"M0 FREE"** (should say "Shared" or "Free")
   - It shows: **512 MB Storage** ✅

3. **Choose a cloud provider:**
   - Provider: **AWS** (or Google Cloud/Azure - doesn't matter)
   - Region: Choose the one **closest to India** 
     - Look for: **Mumbai (ap-south-1)** ✅ BEST FOR YOU
     - Or: **Singapore (ap-southeast-1)**
   - Click on the region to select it

4. **Cluster Name:**
   - Keep default "Cluster0" or change to "WhisperINK"
   - Doesn't matter, just for your reference

5. **Click the big green button:**
   - **"Create Deployment"** or **"Create"**
   - Wait ~30 seconds while it sets up (you'll see a loading animation)

---

## Step 3: Security Setup (1 minute)

After clicking Create, you'll see a **"Security Quickstart"** popup:

### Part A: Create Database User

1. **You'll see "How would you like to authenticate your connection?"**
   - Keep **"Username and Password"** selected (default)

2. **Create credentials:**
   - **Username:** Type `whisperink_admin` (or any name you like)
   - **Password:** Click **"Autogenerate Secure Password"** 
   - **IMPORTANT:** A password will appear - **COPY IT NOW!**
     - Click the **copy icon** next to the password
     - Paste it somewhere safe (Notes app, etc.)
     - Example: `xK9mP2qL8vN5tR7w`

3. **Click "Create User"**

### Part B: Network Access

1. **You'll see "Where would you like to connect from?"**

2. **Add your IP:**
   - You'll see your current IP address
   - Click **"Add My Current IP Address"**

3. **Also add access from anywhere (for deployment):**
   - Click **"Add a different IP address"** (or "+ ADD IP ADDRESS")
   - In the box, type: `0.0.0.0/0`
   - Description: `Allow all (for development)`
   - Click "Add Entry"

4. **Click "Finish and Close"**

5. **Click "Go to Database"** (or "Close" if no option)

---

## Step 4: Get Your Connection String (1 minute)

1. **You should be on the Database Deployments page**
   - You'll see your cluster "Cluster0" with a green dot 🟢 (means it's running)

2. **Click the "Connect" button:**
   - It's next to your cluster name
   - Big button that says **"Connect"**

3. **Choose connection method:**
   - Click **"Drivers"** (or "Connect your application")
   - NOT "Compass" or "Shell" - choose **"Drivers"**

4. **Select your driver:**
   - Driver: **Node.js**
   - Version: **5.5 or later** (or any recent version)

5. **Copy the connection string:**
   - You'll see a box with code like:
     ```
     mongodb+srv://whisperink_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Click the **"Copy"** button

6. **IMPORTANT: Edit the connection string:**
   - **Replace** `<password>` with the password you copied in Step 3
   - **Add** `/whisperink` before the `?`
   
   **Example:**
   ```
   Before:
   mongodb+srv://whisperink_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

   After:
   mongodb+srv://whisperink_admin:xK9mP2qL8vN5tR7w@cluster0.xxxxx.mongodb.net/whisperink?retryWrites=true&w=majority
   ```

7. **Copy this final connection string** - you'll need it in the next step!

---

## Step 5: Create Your .env File

Now let's create the `.env` file with your MongoDB connection string:

1. **Open Terminal** and navigate to your project:
   ```bash
   cd /Users/niratpatel/Documents/Projects/WhisperINK-2/server
   ```

2. **Create the .env file:**
   ```bash
   nano .env
   ```

3. **Paste this template:**
   ```env
   # Server Configuration
   PORT=5001

   # MongoDB Atlas Connection String
   # REPLACE the whole line below with YOUR connection string
   MONGODB_URI=mongodb+srv://whisperink_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/whisperink?retryWrites=true&w=majority

   # Google Gemini AI API Key (we'll add this later)
   GEMINI_API_KEY=

   # AssemblyAI API Key (we'll add this later)
   ASSEMBLYAI_API_KEY=

   # AWS S3 (Optional - leave empty)
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=
   AWS_BUCKET_NAME=
   ```

4. **Replace the MONGODB_URI line:**
   - Delete the example line
   - Paste YOUR actual connection string from Step 4
   - Make sure it's all on ONE line
   - Make sure password is filled in and `/whisperink` is before `?`

5. **Save the file:**
   - Press `Ctrl + X`
   - Press `Y` (yes to save)
   - Press `Enter`

---

## Step 6: Test the Connection

1. **Restart your server:**
   - If it's running, press `Ctrl + C` to stop it
   - Then start it again:
     ```bash
     npm run dev
     ```

2. **Look for SUCCESS message:**
   ```
   ✅ GOOD - You should see:
   MongoDB Connected: cluster0.xxxxx.mongodb.net
   Server running on port 5001 and accessible on LAN

   ❌ BAD - If you see:
   MongoDB Connection Error: ...
   ```

3. **If you see an error:**
   - Check your `.env` file: `cat .env`
   - Verify:
     - ✅ No `<password>` placeholder - actual password is there
     - ✅ Has `/whisperink` before the `?`
     - ✅ No extra spaces or line breaks
     - ✅ Connection string is all on one line

---

## ✅ Success Checklist

After completing all steps:

- [ ] MongoDB Atlas account created
- [ ] Free M0 cluster created (Mumbai region recommended)
- [ ] Database user created (username & password saved)
- [ ] IP addresses whitelisted (`0.0.0.0/0` added)
- [ ] Connection string copied and modified
- [ ] `.env` file created with your connection string
- [ ] Server starts without MongoDB errors
- [ ] You see "MongoDB Connected" message

---

## 🎉 You're Done!

Your MongoDB is now set up and connected! Next steps:

1. **Get Google Gemini API Key** (for AI transformations)
2. **Get AssemblyAI API Key** (for voice transcription)
3. **Add them to your `.env` file**

Want help with those? Let me know and I'll create guides for them too!

---

## 🆘 Common Issues

### "Authentication failed"
- Check password in connection string is correct
- No `<password>` placeholder should remain
- Password might have special characters - try regenerating a simpler one

### "IP not whitelisted"
- Go to Atlas → Network Access
- Make sure `0.0.0.0/0` is added
- Click "Edit" and confirm it's active

### "Cannot connect to cluster"
- Wait 1-2 minutes - cluster might still be spinning up
- Check cluster has green dot (active) in Atlas dashboard
- Verify region you selected is available

### "Database name not found"
- Make sure you added `/whisperink` in the connection string
- Should be: `...mongodb.net/whisperink?retryWrites...`

---

## 📸 Quick Visual Guide

**Where to find key items:**

1. **After signup:** Dashboard → Deploy a cluster
2. **Cluster list:** Database Deployments (left sidebar)
3. **Connect button:** Next to cluster name
4. **Network Access:** Left sidebar under Security
5. **Database Access (users):** Left sidebar under Security

---

## 💡 Pro Tips

- Your free tier includes:
  - ✅ 512 MB storage (thousands of journal entries!)
  - ✅ Shared RAM & CPU (plenty for personal use)
  - ✅ Free forever (never expires)
  - ✅ No credit card required

- Bookmark your cluster page - you'll use it later!
- The Atlas dashboard is great - explore the Charts and Metrics tabs

---

**Once you see "MongoDB Connected" - come back and I'll help you set up the API keys! 🚀**
