// server/routes/journalEntries.js
const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const upload = require('../middleware/uploadMiddleware'); // Import multer middleware
const { getAIInsights } = require('../controllers/journalController');

// GET all entries
router.get('/', journalController.getEntries);

// POST a new entry
router.post('/', upload.single('audio'), journalController.createEntry);

// DELETE an entry by ID
router.delete('/:id', journalController.deleteEntry); // <--- ADD THIS LINE

// GET insights from entries
router.get('/insights', journalController.getInsights);
// ADD THE NEW AI INSIGHTS ROUTE
router.get('/ai-insights', getAIInsights);

// PUT update entry by ID
router.put('/:id', journalController.updateEntry);

module.exports = router;