import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Buyer from "../models/Buyer.js";

dotenv.config();

const checkOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check all orders
    const orders = await Order.find({});
    console.log(`Total orders in database: ${orders.length}`);

    if (orders.length > 0) {
      console.log("\nOrders found:");
      orders.forEach((order, index) => {
        console.log(`${index + 1}. Order ID: ${order._id}`);
        console.log(`   Order Number: ${order.orderNumber}`);
        console.log(`   Buyer: ${order.buyer}`);
        console.log(`   Seller: ${order.seller}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Total: $${order.totalAmount}`);
        console.log(`   Created: ${order.createdAt}`);
        console.log("");
      });
    }

    // Check all buyers
    const buyers = await Buyer.find({});
    console.log(`\nTotal buyers in database: ${buyers.length}`);

    if (buyers.length > 0) {
      console.log("\nBuyers found:");
      buyers.forEach((buyer, index) => {
        console.log(`${index + 1}. Buyer ID: ${buyer._id}`);
        console.log(`   Name: ${buyer.fullName}`);
        console.log(`   Email: ${buyer.email}`);
        console.log(`   Orders count: ${buyer.orders.length}`);
        console.log(`   Order IDs: ${buyer.orders.join(", ")}`);
        console.log("");
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

checkOrders();
