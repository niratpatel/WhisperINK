// server/models/JournalEntry.js
const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema(
  {
    // This is no longer a persistent URL we manage. Mark as optional or store differently.
    originalAudioUrl: {
      type: String,
      required: false, // No longer strictly required as it's temporary or internal
      default: 'processed://direct-upload' // Or simply omit/null
    },
    rawTranscription: {
      type: String,
      default: '',
    },
    cinematicEntry: {
      type: String,
      required: [true, 'Cinematic entry text is required.'],
    },
    bookTitle: {
      type: String,
      trim: true,
      default: 'Untitled Book',
    },
    bookAuthor: {
      type: String,
      trim: true,
      default: 'Unknown Author',
    },
    // Mood field - matches client theme.js moodConfig
    mood: {
      type: String,
      enum: [
        // Moods from theme.js moodConfig
        'happy', 'calm', 'reflective', 'energetic', 'grateful', 'anxious', 'sad', 'excited',
        // Legacy moods for backward compatibility
        'contemplative', 'inspired', 'confused', 'seeking', 'angry', 'neutral',
        '' // Allow empty
      ],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);