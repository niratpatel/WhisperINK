// server/routes/journalEntries.js
const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const upload = require('../middleware/uploadMiddleware'); // Import multer middleware
const { getAIInsights } = require('../controllers/journalController');
const authMiddleware = require('../middleware/authMiddleware');

// GET all entries
router.get('/', authMiddleware, journalController.getEntries);

// POST a new entry
router.post('/', authMiddleware, upload.single('audio'), journalController.createEntry);

// DELETE an entry by ID
router.delete('/:id', authMiddleware, journalController.deleteEntry); // <--- ADD THIS LINE

// GET insights from entries
router.get('/insights', authMiddleware, journalController.getInsights);
// ADD THE NEW AI INSIGHTS ROUTE
router.get('/ai-insights', authMiddleware, getAIInsights);

// GET, PUT single entry routes (add later if needed)
// router.get('/:id', journalController.getEntryById);
// router.put('/:id', journalController.updateEntry);

module.exports = router;