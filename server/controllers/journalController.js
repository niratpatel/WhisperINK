// server/controllers/journalController.js
const JournalEntry = require('../models/JournalEntry');
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