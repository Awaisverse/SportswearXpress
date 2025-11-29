import mongoose from "mongoose";
import Product from "../models/Product.js";
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

const checkProduct = async () => {
  try {
    await connectDB();

    const productId = "684d6db1cc3e528690ebf4d0";
    console.log("Checking for product ID:", productId);

    // Check if the ID is valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("❌ Invalid ObjectId format");
      return;
    }

    // Find the product
    const product = await Product.findById(productId).populate(
      "seller",
      "fullName businessInfo.businessName"
    );

    if (product) {
      console.log("✅ Product found!");
      console.log("Product details:", {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        status: product.status,
        seller: product.seller?.fullName || product.seller,
        createdAt: product.createdAt,
        images: product.images?.length || 0,
      });
    } else {
      console.log("❌ Product not found");

      // Let's check what products exist
      const allProducts = await Product.find({})
        .select("_id name category status createdAt")
        .limit(5);
      console.log("\nAvailable products (first 5):");
      allProducts.forEach((p, index) => {
        console.log(
          `${index + 1}. ID: ${p._id}, Name: ${p.name}, Category: ${
            p.category
          }, Status: ${p.status}`
        );
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error checking product:", error);
    mongoose.connection.close();
  }
};

checkProduct();
