// server/config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // To access MONGODB_URI

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Options to avoid deprecation warnings (check Mongoose docs for latest)
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // May not be needed in newer Mongoose
      // useFindAndModify: false // May not be needed in newer Mongoose
    });
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;