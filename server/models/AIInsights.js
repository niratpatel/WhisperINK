// server/models/AIInsight.js
const mongoose = require('mongoose');

const AIInsightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true, // Make true when you have users, for now it's optional
  },
  insightType: {
    type: String,
    required: true,
    enum: ['weeklyMoodArc'], // For now, we only have this type
    default: 'weeklyMoodArc'
  },
  generatedAt: { // When this specific insight document was created/updated by the cron job
    type: Date,
    default: Date.now,
    index: true // Good for sorting to get the latest
  },
  // The period of journal entries this insight is based on
  periodStartDate: {
    type: Date,
    required: true
  },
  periodEndDate: {
    type: Date,
    required: true
  },
  content: {
    moodArcDescription: String,
    dominantEmotion: String,
    // You can add other fields here if your insights become more complex
  },
  sourceEntryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
  }]
}, { timestamps: true }); // timestamps will add createdAt and updatedAt for the document itself

module.exports = mongoose.model('AIInsight', AIInsightSchema);