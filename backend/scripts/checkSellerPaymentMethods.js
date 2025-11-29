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

const checkSellerPaymentMethods = async () => {
  try {
    await connectDB();

    const sellers = await Seller.find({}).select(
      "fullName email businessInfo bankAccounts wallets status"
    );
    console.log("Total sellers found:", sellers.length);

    sellers.forEach((seller, index) => {
      console.log(`\nSeller ${index + 1}:`);
      console.log("  ID:", seller._id);
      console.log("  Name:", seller.fullName);
      console.log("  Email:", seller.email);
      console.log("  Business Name:", seller.businessInfo?.businessName);
      console.log("  Status:", seller.status);
      console.log("  Bank Accounts:", seller.bankAccounts?.length || 0);
      console.log("  Wallets:", seller.wallets?.length || 0);

      if (seller.bankAccounts && seller.bankAccounts.length > 0) {
        console.log("  Bank Account Details:");
        seller.bankAccounts.forEach((account, i) => {
          console.log(
            `    ${i + 1}. Bank: ${account.bankName}, Account: ${
              account.accountNumber
            }`
          );
        });
      }

      if (seller.wallets && seller.wallets.length > 0) {
        console.log("  Wallet Details:");
        seller.wallets.forEach((wallet, i) => {
          console.log(
            `    ${i + 1}. Type: ${wallet.walletType}, Number: ${
              wallet.walletNumber
            }`
          );
        });
      }
    });

    // Check sellers with no payment methods
    const sellersWithoutPayment = sellers.filter(
      (seller) =>
        (!seller.bankAccounts || seller.bankAccounts.length === 0) &&
        (!seller.wallets || seller.wallets.length === 0)
    );

    console.log(
      `\nSellers without payment methods: ${sellersWithoutPayment.length}`
    );
    if (sellersWithoutPayment.length > 0) {
      sellersWithoutPayment.forEach((seller) => {
        console.log(`  - ${seller.fullName} (${seller.email})`);
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error checking seller payment methods:", error);
    mongoose.connection.close();
  }
};

checkSellerPaymentMethods();
