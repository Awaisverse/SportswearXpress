import mongoose from "mongoose";
import dotenv from "dotenv";
import Seller from "./models/Seller.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

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

const checkSellerData = async (sellerId) => {
  try {
    await connectDB();

    console.log("Checking seller data for ID:", sellerId);

    // Check if seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      console.log("Seller not found");
      return;
    }

    console.log("\n=== SELLER INFO ===");
    console.log("Name:", seller.fullName);
    console.log("Email:", seller.email);
    console.log("Verified:", seller.isVerified);
    console.log("Suspended:", seller.isSuspended);

    console.log("\n=== BANK ACCOUNTS ===");
    console.log("Bank accounts:", seller.bankAccounts || []);
    console.log("Count:", (seller.bankAccounts || []).length);

    console.log("\n=== WALLETS ===");
    console.log("Wallets:", seller.wallets || []);
    console.log("Count:", (seller.wallets || []).length);

    console.log("\n=== PRODUCTS ===");
    console.log("Products array:", seller.products || []);
    console.log("Array count:", (seller.products || []).length);

    // Check products directly
    const products = await Product.find({ seller: sellerId });
    console.log("Direct products count:", products.length);

    console.log("\n=== ORDERS ===");
    console.log("Orders array:", seller.orders || []);
    console.log("Array count:", (seller.orders || []).length);

    // Check orders directly
    const orders = await Order.find({ seller: sellerId });
    console.log("Direct orders count:", orders.length);

    console.log("\n=== SUMMARY ===");
    console.log("Bank Accounts:", (seller.bankAccounts || []).length);
    console.log("Wallets:", (seller.wallets || []).length);
    console.log("Products:", products.length);
    console.log("Orders:", orders.length);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

const sellerId = process.argv[2] || "6858868f296a27cd485ca117";
checkSellerData(sellerId);
