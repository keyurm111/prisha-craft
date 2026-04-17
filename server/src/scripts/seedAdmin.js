const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config({ path: __dirname + "/../../.env" });

const seedAdmin = async () => {
  try {
    // 1) Connect to DB
    const connString = process.env.MONGODB_URI || "mongodb://localhost:27017/meili-db";
    console.log("🔗 Connecting to Registry at:", connString);
    await mongoose.connect(connString);
    console.log("✅ Successfully reached Database...");

    // 2) User Details
    const adminEmail = "admin@meili.com";
    const adminPass = "admin123"; // INSTRUCTION: PLEASE CHANGE THIS UPON SUCCESSFUL MISSION

    // 3) Clean existing admin to avoid conflicts
    await User.deleteOne({ email: adminEmail });
    console.log("🧹 Clearing existing admin path...");

    // 4) Create User
    // User model handles hashing via pre-save hook, but let's confirm
    const newAdmin = await User.create({
      name: "Meili Master Administrator",
      email: adminEmail,
      password: adminPass,
      phone: "0000000000",
      role: "admin", // Ensure the user has the 'admin' permission if implemented
    });

    console.log("💎 MASTER ADMIN IDENTITY CREATED 💎");
    console.log("------------------------------------");
    console.log("ID:      " + adminEmail);
    console.log("KEY:     " + adminPass);
    console.log("------------------------------------");
    console.log("⚠️ CAUTION: Change this key after your first successful login.");

    process.exit(0);
  } catch (err) {
    console.error("❌ Registry Seeding Failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
