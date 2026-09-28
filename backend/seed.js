import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/user.js';
import Staff from './models/staff.js';
import Category from './models/category.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ayush1149be24_db_user:Hostel2005@complaintcluster.nwlbow3.mongodb.net/hostelDB?appName=ComplaintCluster";

const defaultCategories = [
  "Electricity",
  "Plumbing",
  "Wifi / Internet",
  "Cleanliness",
  "Food / Mess",
  "Furniture",
  "Other"
];

const defaultStaff = [
  { name: "Ramesh Kumar", email: "ramesh@staff.com" },
  { name: "Suresh Singh", email: "suresh@staff.com" },
  { name: "Anita Sharma", email: "anita@staff.com" },
  { name: "Vikas Yadav", email: "vikas@staff.com" }
];

const defaultUsers = [
  { name: "Demo Student", email: "demo@student.com", password: "1234", role: "student" },
  { name: "Hostel Admin", email: "admin@hostel.com", password: "1234", role: "admin" }
];

async function seedDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB.");

    // Seed Categories
    console.log("🌱 Checking categories...");
    for (const catName of defaultCategories) {
      const exists = await Category.findOne({ name: catName });
      if (!exists) {
        await Category.create({ name: catName });
        console.log(`  + Category added: ${catName}`);
      }
    }

    // Seed Staff Members
    console.log("🌱 Checking staff members...");
    for (const staff of defaultStaff) {
      const staffExists = await Staff.findOne({ name: staff.name });
      if (!staffExists) {
        await Staff.create({ name: staff.name });
        console.log(`  + Staff created: ${staff.name}`);
      }

      const userExists = await User.findOne({ email: staff.email });
      if (!userExists) {
        await User.create({
          name: staff.name,
          email: staff.email,
          password: "1234",
          role: "staff"
        });
        console.log(`  + Staff login account created: ${staff.email}`);
      }
    }

    // Seed Demo Users (Student & Admin)
    console.log("🌱 Checking demo student & admin...");
    for (const u of defaultUsers) {
      const userExists = await User.findOne({ email: u.email });
      if (!userExists) {
        await User.create(u);
        console.log(`  + User account created: ${u.email} (${u.role})`);
      }
    }

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seedDatabase();
