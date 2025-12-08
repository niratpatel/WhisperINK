// server/controllers/journalController.js
const JournalEntry = require('../models/JournalEntry');
const AIInsight = require('../models/AIInsights');
const aiService = require('../services/aiTransformService');
const { transcribeAudio } = require('../services/transcriptionService'); // Using the exported direct upload function
const aiTransformService = require('../services/aiTransformService');
const mongoose = require('mongoose'); // Add this import for ObjectId validation

// GET entries function remains the same
exports.getEntries = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find().sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching entries:', erwror);
    next(error);
  }
};

// POST entry adapted for direct upload
exports.createEntry = async (req, res, next) => {
  try {
    console.log('Received Body:', req.body);
    console.log('Received File (info):', req.file ? { name: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype } : 'No file');

    if (!req.file || !req.file.buffer) { // Check specifically for the buffer
      return res.status(400).json({ message: 'No audio file buffer received.' });
    }

    const { bookTitle, bookAuthor, mood } = req.body; // Extract mood from request
    const audioFileBuffer = req.file.buffer; // Use the buffer from memoryStorage

    // --- Workflow ---
    // 1. (No S3 Upload Step)

    // 2. Get Transcription via Direct Upload
    console.log('Requesting transcription via direct upload...');
    const transcriptionText = await transcribeAudio(audioFileBuffer); // Pass the buffer
    console.log('Transcription received (length):', transcriptionText?.length || 0);

    // 3. Get Cinematic Transformation from Gemini
    console.log('Requesting AI transformation...');
    const cinematicText = await aiTransformService.transformToCinematic(
      transcriptionText,
      bookTitle,
      bookAuthor,
      mood // Pass mood to transformation service
    );
    console.log('Cinematic text received (length):', cinematicText?.length || 0);

    // 4. Save to Database
    console.log('Saving entry to database...');
    const newEntry = new JournalEntry({
      // originalAudioUrl: 'processed://direct-upload', // Or omit if default is set in model
      rawTranscription: transcriptionText,
      cinematicEntry: cinematicText,
      bookTitle: bookTitle || 'Untitled Book',
      bookAuthor: bookAuthor || 'Unknown Author',
      mood: mood || '', // Save mood to database
    });
    await newEntry.save();
    console.log('Entry saved:', newEntry._id);

    // 5. Respond to App
    res.status(201).json(newEntry);

  } catch (error) {
    console.error('Error creating journal entry:', error);
    next(error); // Pass to global error handler
  }
};



// --- ADD DELETE Entry Function ---
// @desc    Delete a journal entry
// @route   DELETE /api/journal-entries/:id
// @access  Public (adjust if auth needed)
exports.deleteEntry = async (req, res, next) => {
  try {
    const entryId = req.params.id;

    // Optional: Validate if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return res.status(400).json({ success: false, message: 'Invalid entry ID format' });
    }

    const entry = await JournalEntry.findById(entryId);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    // --- Optional: Add authorization check here if you have users ---
    // Example: if (entry.userId.toString() !== req.user.id) {
    //   return res.status(401).json({ success: false, message: 'Not authorized to delete this entry' });
    // }
    // --- End Optional Auth Check ---


    // --- Optional: Delete associated audio file from storage (S3, etc.) ---
    // If you were storing audio files persistently, you'd add logic here
    // to delete the file from S3/GCS/etc. using the entry.originalAudioUrl.
    // Since we aren't storing persistently in the current setup, skip this.
    // Example: await audioDeleteService.deleteAudio(entry.originalAudioUrl);
    // --- End Optional Audio Delete ---


    await JournalEntry.deleteOne({ _id: entryId }); // Use deleteOne or findByIdAndDelete

    console.log(`Deleted journal entry: ${entryId}`);
    res.status(200).json({ success: true, data: {} }); // Send success response

  } catch (error) {
    console.error('Error deleting entry:', error);
    next(error); // Pass to global error handler
  }
};
// --- END ADD DELETE Function ---

// --- ADD UPDATE Entry Function ---
// @desc    Update a journal entry
// @route   PUT /api/journal-entries/:id
// @access  Public (adjust if auth needed)
exports.updateEntry = async (req, res, next) => {
  try {
    const entryId = req.params.id;
    const updates = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return res.status(400).json({ success: false, message: 'Invalid entry ID format' });
    }

    // Find and update the entry
    const entry = await JournalEntry.findById(entryId);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['bookTitle', 'bookAuthor', 'mood', 'cinematicEntry'];
    const updateData = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    // Apply updates
    const updatedEntry = await JournalEntry.findByIdAndUpdate(
      entryId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`Updated journal entry: ${entryId}`, updateData);
    res.status(200).json({ success: true, data: updatedEntry });

  } catch (error) {
    console.error('Error updating entry:', error);
    next(error);
  }
};
// --- END ADD UPDATE Function ---

// ... existing code ...

// Generate insights from journal entries
exports.getInsights = async (req, res, next) => {
  try {
    // Get all entries
    const entries = await JournalEntry.find().sort({ createdAt: -1 });

    if (!entries || entries.length === 0) {
      return res.status(200).json({
        moodDistribution: {},
        commonThemes: [],
        activityPatterns: {},
        writingTrends: {}
      });
    }

    // Calculate mood distribution
    const moodDistribution = {};
    entries.forEach(entry => {
      const mood = entry.mood || 'unspecified';
      moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
    });

    // Extract common themes (simplified version - in production, use AI for this)
    const commonThemes = [];
    // This is a placeholder - in a real implementation, you would use 
    // your existing AI service to analyze text and extract themes
    if (entries.length >= 3) {
      commonThemes.push(
        { name: 'Reflection', count: Math.floor(entries.length * 0.7) },
        { name: 'Growth', count: Math.floor(entries.length * 0.5) },
        { name: 'Creativity', count: Math.floor(entries.length * 0.3) }
      );
    }

    // Calculate activity patterns by day of week
    const activityPatterns = {};
    entries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      activityPatterns[dayOfWeek] = (activityPatterns[dayOfWeek] || 0) + 1;
    });

    // Analyze writing trends over time
    const writingTrends = {};
    entries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const month = date.toLocaleString('default', { month: 'long' });
      writingTrends[month] = (writingTrends[month] || 0) + 1;
    });

    // Return insights
    res.status(200).json({
      moodDistribution,
      commonThemes,
      activityPatterns,
      writingTrends,
      entryCount: entries.length
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    next(error);
  }
};

exports.getAIInsights = async (req, res) => {
  try {
    // const userId = req.user.id; // Placeholder for when you have user authentication

    const latestInsight = await AIInsight.findOne({
      // user: userId, // Uncomment when user auth is in place
      insightType: 'weeklyMoodArc' // Ensure we get the correct type of insight
    }).sort({ generatedAt: -1 }); // Get the most recently generated one

    if (!latestInsight) {
      return res.status(404).json({
        message: 'No AI insights available yet. Journal more to unlock them, or check back soon!',
        moodAnalysis: null // Keep a consistent response structure
      });
    }

    // Send the content of the insight
    res.json({
      message: 'Successfully retrieved AI insights.',
      moodAnalysis: latestInsight.content,
      generatedAt: latestInsight.generatedAt, // You might want to send this to the frontend
      periodStartDate: latestInsight.periodStartDate,
      periodEndDate: latestInsight.periodEndDate
    });

  } catch (error) {
    console.error('Error in getAIInsights controller (fetching stored):', error);
    res.status(500).json({
      message: 'Oops! Failed to retrieve AI insights from the database.',
      moodAnalysis: null
    });
  }
};