import mongoose from "mongoose";
import dotenv from "dotenv";
import Seller from "../models/Seller.js";
import Product from "../models/Product.js";

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

const fixSellerProducts = async (sellerId) => {
  try {
    await connectDB();

    console.log("Fixing seller products for ID:", sellerId);

    // Check if seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      console.log("Seller not found");
      return;
    }

    console.log("Seller found:", {
      id: seller._id,
      name: seller.fullName,
      email: seller.email,
      currentProductsArray: seller.products || [],
    });

    // Find all products for this seller
    const products = await Product.find({ seller: sellerId });
    console.log("Products found by seller ID:", products.length);

    if (products.length === 0) {
      console.log("No products found for this seller");
      return;
    }

    // Get product IDs
    const productIds = products.map((p) => p._id);
    console.log("Product IDs:", productIds);

    // Check current seller products array
    const currentSellerProducts = seller.products || [];
    console.log("Current seller products array:", currentSellerProducts);

    // Find missing products
    const missingProducts = productIds.filter(
      (id) => !currentSellerProducts.includes(id)
    );
    console.log("Missing products in seller array:", missingProducts);

    if (missingProducts.length === 0) {
      console.log("✅ All products are already properly linked");
      return;
    }

    // Add missing products to seller's array
    seller.products = [...currentSellerProducts, ...missingProducts];
    await seller.save();

    console.log("✅ Fixed seller products array");
    console.log("Updated seller products array:", seller.products);

    // Verify the fix
    const updatedSeller = await Seller.findById(sellerId);
    console.log(
      "Verification - Updated seller products array:",
      updatedSeller.products
    );
  } catch (error) {
    console.error("Error fixing seller products:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

// Get seller ID from command line argument
const sellerId = process.argv[2];
if (!sellerId) {
  console.log("Please provide a seller ID as an argument");
  console.log("Usage: node fixSellerProducts.js <sellerId>");
  process.exit(1);
}

fixSellerProducts(sellerId);
