// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
require('./jobs/scheduler');
const journalRoutes = require('./routes/journalEntries');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use('/api/journal-entries', journalRoutes);

// Global Error Handler (Place after routes)
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server.';
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} and accessible on LAN`);
  });
  
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));