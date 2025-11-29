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

const checkSellerProducts = async (sellerId) => {
  try {
    await connectDB();

    console.log("Checking seller products for ID:", sellerId);

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
      productsArray: seller.products || [],
    });

    // Check products directly by seller ID
    const products = await Product.find({ seller: sellerId });
    console.log("Products found by seller ID:", products.length);
    console.log(
      "Products:",
      products.map((p) => ({ id: p._id, name: p.name, status: p.status }))
    );

    // Check if products are in seller's products array
    const sellerProductIds = seller.products || [];
    console.log("Seller products array length:", sellerProductIds.length);
    console.log("Seller products array:", sellerProductIds);

    // Check if there's a mismatch
    const productIds = products.map((p) => p._id.toString());
    const missingInSeller = productIds.filter(
      (id) => !sellerProductIds.includes(id)
    );
    const missingInProducts = sellerProductIds.filter(
      (id) => !productIds.includes(id.toString())
    );

    if (missingInSeller.length > 0) {
      console.log("Products missing from seller array:", missingInSeller);
    }

    if (missingInProducts.length > 0) {
      console.log("Products in seller array but not found:", missingInProducts);
    }

    if (missingInSeller.length === 0 && missingInProducts.length === 0) {
      console.log("✅ All products are properly linked");
    } else {
      console.log("❌ There are mismatches in product linking");
    }
  } catch (error) {
    console.error("Error checking seller products:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

// Get seller ID from command line argument
const sellerId = process.argv[2];
if (!sellerId) {
  console.log("Please provide a seller ID as an argument");
  console.log("Usage: node checkSellerProducts.js <sellerId>");
  process.exit(1);
}

checkSellerProducts(sellerId);
