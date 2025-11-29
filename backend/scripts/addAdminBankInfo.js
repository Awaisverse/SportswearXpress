import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

const addAdminBankInfo = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find the admin
    const admin = await Admin.findOne();

    if (!admin) {
      console.log("No admin found. Please create an admin first.");
      return;
    }

    // Sample bank information
    const bankInfo = {
      bankAccounts: [
        {
          type: "hbl",
          accountTitle: "Admin Account",
          accountNumber: "1234567890",
          branchCode: "001",
        },
        {
          type: "other",
          otherBankName: "Standard Chartered",
          accountTitle: "Admin Business Account",
          accountNumber: "0987654321",
          branchCode: "002",
        },
      ],
      wallets: [
        {
          type: "easypaisa",
          accountTitle: "Admin EasyPaisa",
          accountNumber: "03001234567",
        },
        {
          type: "jazzcash",
          accountTitle: "Admin JazzCash",
          accountNumber: "03009876543",
        },
      ],
    };

    // Update admin with bank information
    admin.bankAccounts = bankInfo.bankAccounts;
    admin.wallets = bankInfo.wallets;

    await admin.save();

    console.log("Admin bank information updated successfully!");
    console.log("Bank accounts:", admin.bankAccounts.length);
    console.log("Wallets:", admin.wallets.length);
  } catch (error) {
    console.error("Error adding admin bank info:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script
addAdminBankInfo();
