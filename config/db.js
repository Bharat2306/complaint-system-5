const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/complaintDB';
  
  try {
    // Set a quick connection timeout so startup isn't delayed if MongoDB server isn't running locally
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2500
    });
    isConnectedToMongo = true;
    console.log(`✅ MongoDB Connected successfully to ${MONGO_URI}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.log(`⚠️ MongoDB connection failed: ${err.message}`);
    console.log(`ℹ️ System will operate using resilient high-performance memory storage for instant zero-config usage!`);
  }
};

const getMongoStatus = () => isConnectedToMongo;

module.exports = { connectDB, getMongoStatus };
