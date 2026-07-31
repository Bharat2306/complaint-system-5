const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/complaintDB';
  
  // Skip 2.5s connection attempt on Vercel if MONGO_URI is default localhost
  if (process.env.VERCEL && (!process.env.MONGO_URI || MONGO_URI.includes('127.0.0.1') || MONGO_URI.includes('localhost'))) {
    isConnectedToMongo = false;
    try {
      mongoose.set('bufferCommands', false);
    } catch (e) {}
    console.log('ℹ️ Running on Vercel Serverless with High-Performance Memory Storage.');
    return;
  }

  try {
    // Set a quick connection timeout so startup isn't delayed if MongoDB server isn't running locally
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2500
    });
    isConnectedToMongo = true;
    console.log(`✅ MongoDB Connected successfully to ${MONGO_URI}`);
  } catch (err) {
    isConnectedToMongo = false;
    try {
      mongoose.set('bufferCommands', false);
    } catch (e) {}
    console.log(`⚠️ MongoDB connection failed: ${err.message}`);
    console.log(`ℹ️ System will operate using resilient high-performance memory storage for instant zero-config usage!`);
  }
};

const getMongoStatus = () => isConnectedToMongo;

module.exports = { connectDB, getMongoStatus };
