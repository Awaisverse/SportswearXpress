import mongoose from "mongoose";
import Seller from "../models/Seller.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const testSellerProfileAPI = async () => {
  try {
    await connectDB();

    // Get all sellers
    const sellers = await Seller.find({}).select(
      "_id fullName businessInfo bankAccounts wallets status"
    );
    console.log("Total sellers found:", sellers.length);

    if (sellers.length === 0) {
      console.log("No sellers found in database");
      return;
    }

    // Test with the first seller
    const testSeller = sellers[0];
    console.log("\nTesting with seller:", {
      id: testSeller._id,
      name: testSeller.fullName,
      businessName: testSeller.businessInfo?.businessName,
      bankAccounts: testSeller.bankAccounts?.length || 0,
      wallets: testSeller.wallets?.length || 0,
      status: testSeller.status,
    });

    // Simulate the API response
    const apiResponse = {
      success: true,
      fullName: testSeller.fullName,
      businessInfo: testSeller.businessInfo,
      status: testSeller.status,
      bankAccounts: testSeller.bankAccounts || [],
      wallets: testSeller.wallets || [],
    };

    console.log(
      "\nAPI Response would be:",
      JSON.stringify(apiResponse, null, 2)
    );

    // Check if seller has payment methods
    if (testSeller.bankAccounts && testSeller.bankAccounts.length > 0) {
      console.log("\nBank Accounts:");
      testSeller.bankAccounts.forEach((account, index) => {
        console.log(
          `  ${index + 1}. ${account.type} - ${account.accountTitle} (${
            account.accountNumber
          })`
        );
      });
    }

    if (testSeller.wallets && testSeller.wallets.length > 0) {
      console.log("\nWallets:");
      testSeller.wallets.forEach((wallet, index) => {
        console.log(
          `  ${index + 1}. ${wallet.type} - ${wallet.accountTitle} (${
            wallet.accountNumber
          })`
        );
      });
    }

    if (
      (!testSeller.bankAccounts || testSeller.bankAccounts.length === 0) &&
      (!testSeller.wallets || testSeller.wallets.length === 0)
    ) {
      console.log("\n⚠️  This seller has no payment methods set up");
      console.log("   They need to add payment methods to their profile");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error testing seller profile API:", error);
    mongoose.connection.close();
  }
};

testSellerProfileAPI();
