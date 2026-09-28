import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Complaint from './models/complaints.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ayush1149be24_db_user:Hostel2005@complaintcluster.nwlbow3.mongodb.net/hostelDB?appName=ComplaintCluster";

async function cleanDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB.");

    const mode = process.argv[2]; // e.g. --all to wipe all collections

    if (mode === '--all') {
      const db = mongoose.connection.db;
      console.log("🧹 Wiping ALL collections...");
      await db.collection('complaints').deleteMany({});
      await db.collection('users').deleteMany({});
      await db.collection('staffs').deleteMany({});
      await db.collection('categories').deleteMany({});
      console.log("✨ All complaints, users, staff, and categories wiped clean.");
    } else {
      console.log("🧹 Cleaning complaints collection...");
      const result = await Complaint.deleteMany({});
      console.log(`✨ Successfully removed ${result.deletedCount} complaints. System is clean and ready for fresh complaints!`);
    }

    console.log("✅ Cleanup finished.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    process.exit(1);
  }
}

cleanDatabase();
