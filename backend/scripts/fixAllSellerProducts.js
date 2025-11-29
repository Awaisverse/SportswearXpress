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

const fixAllSellerProducts = async () => {
  try {
    await connectDB();

    console.log("Fixing all sellers' products arrays...");

    // Get all sellers
    const sellers = await Seller.find({});
    console.log(`Found ${sellers.length} sellers`);

    let totalFixed = 0;
    let totalSellersWithProducts = 0;

    for (const seller of sellers) {
      console.log(`\nProcessing seller: ${seller.fullName} (${seller._id})`);

      // Find all products for this seller
      const products = await Product.find({ seller: seller._id });

      if (products.length === 0) {
        console.log("  No products found for this seller");
        continue;
      }

      totalSellersWithProducts++;
      console.log(`  Found ${products.length} products`);

      // Get product IDs
      const productIds = products.map((p) => p._id);

      // Check current seller products array
      const currentSellerProducts = seller.products || [];

      // Find missing products
      const missingProducts = productIds.filter(
        (id) => !currentSellerProducts.includes(id)
      );

      if (missingProducts.length === 0) {
        console.log("  ✅ All products are already properly linked");
        continue;
      }

      console.log(
        `  ❌ Found ${missingProducts.length} missing products in seller array`
      );

      // Add missing products to seller's array
      seller.products = [...currentSellerProducts, ...missingProducts];
      await seller.save();

      console.log("  ✅ Fixed seller products array");
      totalFixed++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Total sellers: ${sellers.length}`);
    console.log(`  Sellers with products: ${totalSellersWithProducts}`);
    console.log(`  Sellers fixed: ${totalFixed}`);
  } catch (error) {
    console.error("Error fixing all seller products:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

fixAllSellerProducts();
