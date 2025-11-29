import mongoose from "mongoose";
import dotenv from "dotenv";
import Seller from "../models/Seller.js";
import Buyer from "../models/Buyer.js";
import Admin from "../models/Admin.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const testPhoneNumbers = [
  // Valid phone numbers
  "03012345678", // Valid: starts with 03, 3rd digit = 0, 4th digit = 1
  "03123456789", // Valid: starts with 03, 3rd digit = 1, 4th digit = 2
  "03234567890", // Valid: starts with 03, 3rd digit = 2, 4th digit = 3
  "03345678901", // Valid: starts with 03, 3rd digit = 3, 4th digit = 4
  "03456789012", // Valid: starts with 03, 3rd digit = 4, 4th digit = 5

  // Invalid phone numbers
  "0301234567", // Invalid: too short (10 digits)
  "030123456789", // Invalid: too long (12 digits)
  "03123456789", // Invalid: 3rd digit = 1, 4th digit = 2 (should be valid)
  "03512345678", // Invalid: 3rd digit = 5 (should be ≤ 4)
  "03612345678", // Invalid: 3rd digit = 6 (should be ≤ 4)
  "03712345678", // Invalid: 3rd digit = 7 (should be ≤ 4)
  "03812345678", // Invalid: 3rd digit = 8 (should be ≤ 4)
  "03912345678", // Invalid: 3rd digit = 9 (should be ≤ 4)
  "03001234567", // Invalid: 4th digit = 0 (should be ≤ 9) - actually this should be valid
  "03011234567", // Valid: 4th digit = 1 (should be ≤ 9)
  "03091234567", // Valid: 4th digit = 9 (should be ≤ 9)
  "030A1234567", // Invalid: contains non-numeric character
  "12345678901", // Invalid: doesn't start with 03
  "04012345678", // Invalid: doesn't start with 03
];

async function testPhoneValidation() {
  console.log("Testing Phone Number Validation...\n");

  for (const phoneNumber of testPhoneNumbers) {
    console.log(`Testing: ${phoneNumber}`);

    try {
      // Test with Seller model
      const seller = new Seller({
        fullName: "Test Seller",
        email: `test-${Date.now()}@example.com`,
        password: "password123",
        phoneNumber: phoneNumber,
        businessInfo: {
          businessName: "Test Business",
          businessType: "sportswear_manufacturer",
          nationalID: "1234567890123",
        },
      });

      await seller.validate();
      console.log("✅ Valid phone number");
    } catch (error) {
      if (error.errors && error.errors.phoneNumber) {
        console.log(
          `❌ Invalid phone number: ${error.errors.phoneNumber.message}`
        );
      } else {
        console.log(`❌ Other validation error: ${error.message}`);
      }
    }

    console.log("---");
  }

  console.log("\nPhone number validation test completed!");
  process.exit(0);
}

testPhoneValidation().catch(console.error);
