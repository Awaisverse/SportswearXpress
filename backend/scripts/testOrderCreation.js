import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Buyer from "../models/Buyer.js";
import Seller from "../models/Seller.js";
import Product from "../models/Product.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mern-ecommerce";

async function testOrderCreation() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check what data exists
    const buyerCount = await Buyer.countDocuments();
    const sellerCount = await Seller.countDocuments();
    const productCount = await Product.countDocuments();

    console.log("Database statistics:");
    console.log("- Buyers:", buyerCount);
    console.log("- Sellers:", sellerCount);
    console.log("- Products:", productCount);

    if (buyerCount === 0) {
      console.log("❌ No buyers found in database");
      return;
    }

    if (sellerCount === 0) {
      console.log("❌ No sellers found in database");
      return;
    }

    if (productCount === 0) {
      console.log("❌ No products found in database");
      return;
    }

    // Find a buyer to test with
    const buyer = await Buyer.findOne();
    console.log("Found buyer:", buyer.fullName, buyer.email);

    // Find a seller to test with
    const seller = await Seller.findOne();
    console.log("Found seller:", seller.fullName, seller.email);

    // Find a product to test with
    const product = await Product.findOne();
    console.log(
      "Found product:",
      product.name,
      product.price,
      "Seller:",
      product.seller
    );

    // Test order creation with proper validation
    const testOrder = new Order({
      orderNumber: `TEST-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      buyer: buyer._id,
      seller: product.seller, // Use the product's seller
      items: [
        {
          product: product._id,
          quantity: 1,
          price: product.price,
        },
      ],
      totalAmount: product.price + 10, // product price + shipping
      subtotal: product.price,
      shippingAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "Test State",
        country: "Test Country",
        zipCode: "12345",
        phone: "1234567890",
      },
      billingAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "Test State",
        country: "Test Country",
        zipCode: "12345",
        phone: "1234567890",
      },
      paymentInfo: {
        method: "cash_on_delivery",
        status: "pending",
      },
      status: "pending",
    });

    console.log("Attempting to save order...");
    await testOrder.save();
    console.log("✅ Order created successfully!");

    // Test population
    await testOrder.populate([
      { path: "buyer", select: "fullName email" },
      { path: "seller", select: "fullName email businessInfo.businessName" },
      { path: "items.product", select: "name price" },
    ]);

    console.log("✅ Order populated successfully!");
    console.log("Populated order data:");
    console.log("- Buyer:", testOrder.buyer.fullName, testOrder.buyer.email);
    console.log("- Seller:", testOrder.seller.fullName, testOrder.seller.email);
    console.log(
      "- Product:",
      testOrder.items[0].product.name,
      testOrder.items[0].product.price
    );

    // Test the orders array in buyer and seller
    const updatedBuyer = await Buyer.findById(buyer._id);
    const updatedSeller = await Seller.findById(product.seller);

    console.log("✅ Buyer orders array length:", updatedBuyer.orders.length);
    console.log("✅ Seller orders array length:", updatedSeller.orders.length);

    // Clean up test order
    await Order.findByIdAndDelete(testOrder._id);
    console.log("✅ Test order cleaned up");
  } catch (error) {
    console.error("❌ Error:", error);
    if (error.name === "ValidationError") {
      console.error("Validation errors:", error.errors);
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

testOrderCreation();
