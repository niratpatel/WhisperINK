# WhisperINK 📖✨

WhisperINK is a voice-powered journaling application that transforms your spoken thoughts into beautifully crafted, cinematic journal entries. Using AI, it transcribes your voice recordings and reimagines them in the style of your favorite books and authors.

## 🌟 Features

- **Voice Recording**: Record your thoughts, feelings, and experiences with an intuitive voice recorder
- **AI Transcription**: Automatically transcribe audio recordings using advanced speech-to-text technology
- **Cinematic Transformation**: Transform raw transcriptions into poetic, cinematic journal entries using Google's Gemini AI
- **Mood Tracking**: Tag your entries with moods to track emotional patterns over time
- **Literary Styling**: Style your entries in the voice of your favorite books and authors
- **AI-Powered Insights**: Get weekly mood arcs and insights about your journaling patterns
- **Beautiful UI**: Elegant mobile interface with custom fonts (Lora, Lato) and smooth animations
- **Cross-Platform**: Built with React Native and Expo for iOS, Android, and web support

## 🛠️ Tech Stack

### Frontend (Client)
- **React Native** with **Expo** - Cross-platform mobile development
- **React Navigation** - Navigation and routing
- **Expo AV** - Audio recording capabilities
- **NativeWind** - Styling with Tailwind CSS
- **Axios** - HTTP client for API requests
- **Custom Fonts** - Lora and Lato via Google Fonts
- **Expo Linear Gradient** - Beautiful gradient effects

### Backend (Server)
- **Node.js** with **Express** - RESTful API server
- **MongoDB** with **Mongoose** - Database for journal entries and insights
- **Google Generative AI (Gemini)** - AI transformation and insights
- **Multer** - File upload handling
- **Node-Cron** - Scheduled tasks for periodic AI insights
- **CORS** - Cross-origin resource sharing
- **AWS SDK (S3)** - Cloud storage integration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas account)
- **Expo CLI** (for mobile development)
- **Google Cloud API Key** (for Gemini AI)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd WhisperINK-2
```

### 2. Server Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key (optional)
AWS_SECRET_ACCESS_KEY=your_aws_secret_key (optional)
AWS_REGION=your_aws_region (optional)
AWS_BUCKET_NAME=your_s3_bucket_name (optional)
```

Start the server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5001` (or your specified PORT).

### 3. Client Setup

```bash
cd client
npm install
```

Update the API endpoint in your client configuration:
- Locate `src/services/api.js` and ensure the base URL points to your server

Start the Expo development server:

```bash
# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 📱 Usage

1. **Record Your Thoughts**: Open the app and tap the microphone to start recording
2. **Add Context**: Optionally add a book title, author, and mood to your recording
3. **AI Magic**: The app transcribes your voice and transforms it into a cinematic entry
4. **Review Entries**: Browse your journal entries in a beautiful list view
5. **View Insights**: Check the Insights tab to see mood patterns and AI-generated analysis
6. **Read & Reflect**: Tap any entry to read the full cinematic version

## 🏗️ Project Structure

```
WhisperINK-2/
├── client/                    # React Native mobile app
│   ├── src/
│   │   ├── navigation/       # App navigation setup
│   │   ├── screens/          # App screens
│   │   │   ├── RecordScreen.js
│   │   │   ├── JournalListScreen.js
│   │   │   ├── EntryDetailScreen.js
│   │   │   └── InsightsScreen.js
│   │   ├── services/         # API integration
│   │   └── assets/           # Images, fonts, icons
│   ├── App.js                # Root component
│   └── package.json
│
└── server/                    # Express.js backend
    ├── config/               # Database configuration
    ├── controllers/          # Request handlers
    ├── models/               # MongoDB schemas
    │   ├── JournalEntry.js
    │   └── AIInsights.js
    ├── routes/               # API routes
    ├── services/             # Business logic
    │   ├── transcriptionService.js
    │   ├── aiTransformService.js
    │   └── aiInsightsService.js
    ├── jobs/                 # Scheduled tasks (cron)
    ├── middleware/           # Custom middleware
    ├── server.js             # Entry point
    └── package.json
```

## 🔌 API Endpoints

### Journal Entries
- `GET /api/journal-entries` - Get all journal entries
- `POST /api/journal-entries` - Create a new entry (with audio file)
- `DELETE /api/journal-entries/:id` - Delete an entry

### Insights
- `GET /api/journal-entries/insights` - Get basic analytics
- `GET /api/journal-entries/ai-insights` - Get AI-generated mood analysis

### Health Check
- `GET /api/health` - Server health status

## 🎨 Customization

### Changing AI Transformation Style
Edit `server/services/aiTransformService.js` to modify the AI prompts and transformation logic.

### Modifying UI Theme
Update the colors and styles in:
- `client/src/screens/` - Individual screen styles
- Custom colors are defined in component StyleSheets

### Adding New Moods
Modify the mood selector in `RecordScreen.js` to add or remove mood options.

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Implement authentication before deploying to production
- Add user authorization for journal entries
- Validate and sanitize all user inputs

## 🐛 Troubleshooting

### Server Issues
- **MongoDB Connection Failed**: Check your `MONGODB_URI` in `.env`
- **Gemini API Errors**: Verify your `GEMINI_API_KEY` is valid
- **Port Already in Use**: Change the `PORT` in `.env`

### Client Issues
- **Cannot Connect to Server**: Update API base URL to your machine's IP address
- **Expo Build Errors**: Run `expo doctor` to diagnose issues
- **Font Loading Issues**: Ensure fonts are properly loaded before rendering

### Audio Recording Issues
- **Permission Denied**: Grant microphone permissions in your device settings
- **Recording Failed**: Check audio format compatibility for your platform

## 🚢 Deployment

### Backend Deployment
Consider deploying to:
- **Heroku**
- **Railway**
- **Render**
- **AWS EC2**
- **DigitalOcean**

### Mobile App Deployment
Build and deploy using Expo:

```bash
# Create a production build
eas build --platform ios
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a personal project. If you'd like to contribute, please reach out to the project owner.

## 📧 Contact

For questions or support, please contact the project maintainer.

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful AI transformations
- **Expo Team** - For excellent mobile development tools
- **MongoDB** - For flexible data storage
- **React Native Community** - For amazing libraries and support

---

Made with ❤️ using React Native, Node.js, and AI
