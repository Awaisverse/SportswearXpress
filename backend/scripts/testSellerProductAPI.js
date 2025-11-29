import mongoose from "mongoose";
import Product from "../models/Product.js";
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

const testSellerProductAPI = async () => {
  try {
    await connectDB();

    // Get all sellers
    const sellers = await Seller.find({}).select("_id fullName businessInfo");
    console.log("Total sellers found:", sellers.length);

    if (sellers.length === 0) {
      console.log("No sellers found in database");
      return;
    }

    // Get all products
    const products = await Product.find({}).populate(
      "seller",
      "fullName businessInfo.businessName"
    );
    console.log("Total products found:", products.length);

    if (products.length === 0) {
      console.log("No products found in database");
      return;
    }

    // Test with the first product
    const testProduct = products[0];
    console.log("\nTesting with product:", {
      id: testProduct._id,
      name: testProduct.name,
      seller: testProduct.seller?.fullName || testProduct.seller,
      status: testProduct.status,
      images: testProduct.images?.length || 0,
    });

    // Simulate the API response for getProductById
    const apiResponse = {
      success: true,
      product: {
        _id: testProduct._id,
        name: testProduct.name,
        description: testProduct.description,
        price: testProduct.price,
        category: testProduct.category,
        status: testProduct.status,
        images: testProduct.images,
        seller: testProduct.seller,
        variants: testProduct.variants,
        stock: testProduct.stock,
        createdAt: testProduct.createdAt,
        updatedAt: testProduct.updatedAt,
      },
    };

    console.log(
      "\nAPI Response would be:",
      JSON.stringify(apiResponse, null, 2)
    );

    // Test seller-specific endpoints
    console.log("\nTesting seller-specific endpoints:");
    console.log("GET /api/seller/products - List seller products");
    console.log("GET /api/products/:id - Get individual product (public)");
    console.log("PUT /api/seller/products/:id - Update product");
    console.log("DELETE /api/seller/products/:id - Delete product");
    console.log(
      "PATCH /api/seller/products/:id/status - Update product status"
    );

    mongoose.connection.close();
  } catch (error) {
    console.error("Error testing seller product API:", error);
    mongoose.connection.close();
  }
};

testSellerProductAPI();
