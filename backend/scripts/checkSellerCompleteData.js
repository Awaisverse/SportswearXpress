import mongoose from "mongoose";
import dotenv from "dotenv";
import Seller from "../models/Seller.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

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

const checkSellerCompleteData = async (sellerId) => {
  try {
    await connectDB();

    console.log("Checking complete seller data for ID:", sellerId);

    // Check if seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      console.log("Seller not found");
      return;
    }

    console.log("\n=== SELLER BASIC INFO ===");
    console.log("Seller found:", {
      id: seller._id,
      name: seller.fullName,
      email: seller.email,
      isVerified: seller.isVerified,
      isSuspended: seller.isSuspended,
    });

    console.log("\n=== BANK ACCOUNTS ===");
    console.log("Bank accounts in seller model:", seller.bankAccounts || []);
    console.log("Bank accounts count:", (seller.bankAccounts || []).length);

    console.log("\n=== WALLETS ===");
    console.log("Wallets in seller model:", seller.wallets || []);
    console.log("Wallets count:", (seller.wallets || []).length);

    console.log("\n=== PRODUCTS ===");
    console.log("Products array in seller model:", seller.products || []);
    console.log("Products array count:", (seller.products || []).length);

    // Check products directly by seller ID
    const products = await Product.find({ seller: sellerId });
    console.log("Products found by seller ID:", products.length);
    console.log(
      "Products:",
      products.map((p) => ({ id: p._id, name: p.name, status: p.status }))
    );

    console.log("\n=== ORDERS ===");
    console.log("Orders array in seller model:", seller.orders || []);
    console.log("Orders array count:", (seller.orders || []).length);

    // Check orders directly by seller ID
    const orders = await Order.find({ seller: sellerId });
    console.log("Orders found by seller ID:", orders.length);
    console.log(
      "Orders:",
      orders.map((o) => ({
        id: o._id,
        status: o.status,
        totalAmount: o.totalAmount,
      }))
    );

    console.log("\n=== SUMMARY ===");
    console.log("Bank Accounts:", (seller.bankAccounts || []).length);
    console.log("Wallets:", (seller.wallets || []).length);
    console.log("Products:", products.length);
    console.log("Orders:", orders.length);

    // Check for data inconsistencies
    console.log("\n=== DATA CONSISTENCY CHECK ===");

    const productIds = products.map((p) => p._id.toString());
    const sellerProductIds = (seller.products || []).map((id) => id.toString());
    const missingProductsInSeller = productIds.filter(
      (id) => !sellerProductIds.includes(id)
    );
    const missingProductsInDB = sellerProductIds.filter(
      (id) => !productIds.includes(id)
    );

    const orderIds = orders.map((o) => o._id.toString());
    const sellerOrderIds = (seller.orders || []).map((id) => id.toString());
    const missingOrdersInSeller = orderIds.filter(
      (id) => !sellerOrderIds.includes(id)
    );
    const missingOrdersInDB = sellerOrderIds.filter(
      (id) => !orderIds.includes(id)
    );

    if (missingProductsInSeller.length > 0) {
      console.log(
        "❌ Products missing from seller array:",
        missingProductsInSeller
      );
    } else {
      console.log("✅ Products properly linked");
    }

    if (missingProductsInDB.length > 0) {
      console.log(
        "❌ Products in seller array but not found in DB:",
        missingProductsInDB
      );
    }

    if (missingOrdersInSeller.length > 0) {
      console.log(
        "❌ Orders missing from seller array:",
        missingOrdersInSeller
      );
    } else {
      console.log("✅ Orders properly linked");
    }

    if (missingOrdersInDB.length > 0) {
      console.log(
        "❌ Orders in seller array but not found in DB:",
        missingOrdersInDB
      );
    }
  } catch (error) {
    console.error("Error checking seller complete data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

// Get seller ID from command line argument
const sellerId = process.argv[2];
if (!sellerId) {
  console.log("Please provide a seller ID as an argument");
  console.log("Usage: node checkSellerCompleteData.js <sellerId>");
  process.exit(1);
}

checkSellerCompleteData(sellerId);
