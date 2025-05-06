// server/scheduler.js
const cron = require('node-cron');
const mongoose = require('mongoose'); 
const JournalEntry = require('../models/JournalEntry');
const AIInsight = require('../models/AIInsights');
const aiService = require('../services/aiTransformService');
// Ensure you have your db connection logic, or call it if it's separate
// const connectDB = require('./config/db'); 
// connectDB(); // If your DB connection is not already handled in server.js before this runs

// Schedule to run every day at 1 AM. You can change this.
// For testing, you might want something more frequent, like every 5 minutes: '*/5 * * * *'
// cron.schedule('0 1 * * *', async () => { // Runs daily at 1:00 AM
cron.schedule('0 1 * * *', async () => { // FOR TESTING: Runs every 2 minutes
  console.log('Running AI insight generation job (' + new Date().toLocaleTimeString() + ') ...');
  try {
    // For now, we assume a single-user context. 
    // When you have multiple users, you'll need to loop through them.
    // const userId = null; // Or a placeholder if your schema requires it but it's not used in queries

    const periodEndDate = new Date();
    const periodStartDate = new Date();
    periodStartDate.setDate(periodEndDate.getDate() - 7);

    const entries = await JournalEntry.find({
      // user: userId, // Add this back when user context is implemented
      createdAt: { $gte: periodStartDate, $lte: periodEndDate }
    }).sort({ createdAt: -1 });

    if (entries.length >= 2) {
      console.log(`Found ${entries.length} entries for insight generation.`);
      const insightContent = await aiService.getWeeklyMoodArcAndDominantEmotion(entries);
      
      // Create a new insight document each time
      const newInsight = new AIInsight({
        // user: userId, // Add this back when user context is implemented
        insightType: 'weeklyMoodArc',
        generatedAt: new Date(), // This is the generation time of this specific insight doc
        periodStartDate: periodStartDate,
        periodEndDate: periodEndDate,
        content: insightContent,
        sourceEntryIds: entries.map(e => e._id)
      });

      await newInsight.save();
      console.log('Successfully generated and saved new AI insight.');

    } else {
      console.log(`Not enough entries in the last 7 days (${entries.length} found) to generate insight.`);
    }
  } catch (error) {
    console.error('Error during AI insight generation job:', error);
  }
});

console.log('AI Insight generation job scheduled (runs every 2 minutes for testing).');