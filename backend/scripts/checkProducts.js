import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const checkProducts = async () => {
  try {
    console.log("Checking products in database...");

    // Get all products
    const allProducts = await Product.find({});
    console.log(`Total products in database: ${allProducts.length}`);

    // Get approved products
    const approvedProducts = await Product.find({ status: "approved" });
    console.log(`Approved products: ${approvedProducts.length}`);

    // Get active products
    const activeProducts = await Product.find({ isActive: true });
    console.log(`Active products: ${activeProducts.length}`);

    // Get approved and active products
    const approvedAndActive = await Product.find({
      status: "approved",
      isActive: true,
    });
    console.log(`Approved and active products: ${approvedAndActive.length}`);

    // Show details of each product
    console.log("\nProduct details:");
    approvedAndActive.forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.name} - Status: ${product.status}, Active: ${
          product.isActive
        }, Price: $${product.price}`
      );
    });

    if (approvedAndActive.length === 0) {
      console.log(
        "\nNo approved and active products found. This might be why the frontend shows no products."
      );
      console.log("You may need to:");
      console.log("1. Create some products");
      console.log("2. Approve existing products");
      console.log("3. Ensure products have isActive set to true");
    }
  } catch (error) {
    console.error("Error checking products:", error);
  } finally {
    mongoose.connection.close();
  }
};

checkProducts();
