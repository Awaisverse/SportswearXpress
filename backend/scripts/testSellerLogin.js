import mongoose from "mongoose";
import dotenv from "dotenv";
import Seller from "../models/Seller.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function testSellerLogin() {
  console.log("Testing Seller Login Functionality...\n");

  try {
    // Test 1: Check if Seller model can be imported
    console.log("✅ Seller model imported successfully");

    // Test 2: Try to find a seller in the database
    const sellers = await Seller.find({}).limit(1);
    console.log(`Found ${sellers.length} sellers in database`);

    if (sellers.length > 0) {
      const seller = sellers[0];
      console.log("Sample seller data:", {
        id: seller._id,
        email: seller.email,
        fullName: seller.fullName,
        role: seller.role,
        hasPassword: !!seller.password,
        phoneNumber: seller.phoneNumber,
        businessInfo: seller.businessInfo,
      });

      // Test 3: Check if seller has required fields
      if (!seller.password) {
        console.log("❌ Seller missing password field");
      } else {
        console.log("✅ Seller has password field");
      }

      if (!seller.businessInfo) {
        console.log("❌ Seller missing businessInfo field");
      } else {
        console.log("✅ Seller has businessInfo field");
      }

      if (!seller.phoneNumber) {
        console.log("⚠️ Seller has no phone number (optional field)");
      } else {
        console.log("✅ Seller has phone number");
      }
    } else {
      console.log("No sellers found in database");
    }
  } catch (error) {
    console.error("❌ Error testing seller login:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }

  console.log("\nSeller login test completed!");
  process.exit(0);
}

testSellerLogin().catch(console.error);
