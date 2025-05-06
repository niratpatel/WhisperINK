// server/middleware/uploadMiddleware.js
const multer = require('multer');

// Store files in memory as Buffer objects - IMPORTANT for direct upload
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 120 * 1024 * 1024, // 25MB limit - adjust as needed
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  },
});

module.exports = upload;