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
    // Add mood field
    mood: {
      type: String,
      enum: ['contemplative', 'inspired', 'confused', 'seeking', ''], // Valid moods + empty
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);