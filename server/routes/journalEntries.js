// server/routes/journalEntries.js
const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const upload = require('../middleware/uploadMiddleware'); // Import multer middleware

// GET all entries
router.get('/', journalController.getEntries);

// POST a new entry
router.post('/', upload.single('audio'), journalController.createEntry);

// DELETE an entry by ID
router.delete('/:id', journalController.deleteEntry); // <--- ADD THIS LINE

// GET, PUT single entry routes (add later if needed)
// router.get('/:id', journalController.getEntryById);
// router.put('/:id', journalController.updateEntry);

module.exports = router;