#!/bin/bash

# WhisperINK Quick Start Script
# This script helps you get started with testing on your phone

echo "🚀 WhisperINK Quick Start"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -d "client" ] || [ ! -d "server" ]; then
    echo "❌ Error: Please run this script from the WhisperINK-2 root directory"
    exit 1
fi

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "📱 Your local IP address: $LOCAL_IP"
echo ""

echo "📋 Quick Start Options:"
echo ""
echo "Option 1: Test on Your Phone (Same WiFi)"
echo "=========================================="
echo "1. Install 'Expo Go' app on your phone from Play Store/App Store"
echo "2. Make sure your phone is on the same WiFi as this computer"
echo "3. The API is already configured for IP: $LOCAL_IP"
echo ""
echo "To start:"
echo "  Terminal 1: cd server && npm run dev"
echo "  Terminal 2: cd client && npm start"
echo "  Then scan the QR code with Expo Go app"
echo ""
echo ""
echo "Option 2: Deploy to Free Hosting (Railway)"
echo "==========================================="
echo "1. Sign up at https://railway.app (free)"
echo "2. Install Railway CLI: npm install -g @railway/cli"
echo "3. Deploy: cd server && railway init && railway up"
echo "4. Get your deployment URL and update client/src/services/api.js"
echo ""
echo ""
echo "📚 Full deployment guide: See DEPLOYMENT_GUIDE.md"
echo ""

# Offer to start the servers
read -p "Would you like to start both servers now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "Starting servers..."
    echo "Note: You'll need to configure .env file for full functionality"
    echo ""
    
    # Check if .env exists
    if [ ! -f "server/.env" ]; then
        echo "⚠️  Warning: server/.env not found"
        echo "Creating minimal .env for local testing..."
        cat > server/.env << EOF
PORT=5001
MONGODB_URI=mongodb://localhost:27017/whisperink
GEMINI_API_KEY=
ASSEMBLYAI_API_KEY=
EOF
        echo "✅ Created server/.env (you'll need to add API keys later)"
        echo ""
    fi
    
    # Start server in background
    echo "Starting backend server..."
    cd server && npm run dev &
    SERVER_PID=$!
    
    # Wait a bit for server to start
    sleep 3
    
    # Start client
    echo "Starting Expo client..."
    cd ../client && npm start
    
    # When client exits, kill server too
    kill $SERVER_PID
else
    echo ""
    echo "👍 No problem! Start manually with:"
    echo "   cd server && npm run dev"
    echo "   cd client && npm start"
fi
