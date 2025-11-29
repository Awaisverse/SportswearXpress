import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mern-ecommerce";

async function testProductFetching() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get the Product model
    const Product = mongoose.model("Product", new mongoose.Schema({}));

    // Find a product to test with
    const product = await Product.findOne().populate("seller", "name email");

    if (!product) {
      console.log("No products found in database");
      return;
    }

    console.log("Found product:", {
      id: product._id,
      name: product.name,
      seller: product.seller
        ? {
            id: product.seller._id,
            name: product.seller.name,
            email: product.seller.email,
          }
        : "No seller",
    });

    console.log("\nTest the API endpoint:");
    console.log(`GET http://localhost:5000/api/products/${product._id}`);
    console.log("Headers: Authorization: Bearer <seller_token>");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

testProductFetching();
