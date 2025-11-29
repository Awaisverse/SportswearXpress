import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/Order.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function testDeliveryManagement() {
  console.log("Testing Delivery Management System...\n");

  try {
    // Test 1: Find orders that can be managed for delivery
    const manageableOrders = await Order.find({
      status: { $in: ["confirmed", "processing", "shipped"] },
    })
      .populate("seller", "fullName email businessInfo.businessName")
      .populate("buyer", "fullName email")
      .limit(5);

    console.log(
      `Found ${manageableOrders.length} orders that can be managed for delivery:`
    );

    manageableOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order #${order.orderNumber}:`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Seller: ${order.seller?.fullName || "N/A"}`);
      console.log(`   Buyer: ${order.buyer?.fullName || "N/A"}`);
      console.log(`   Total: $${order.totalAmount?.toFixed(2) || "0.00"}`);
      console.log(`   Items: ${order.items?.length || 0}`);

      if (order.shippingInfo) {
        console.log(`   Shipping Info:`);
        console.log(
          `     Tracking: ${order.shippingInfo.trackingNumber || "N/A"}`
        );
        console.log(`     Carrier: ${order.shippingInfo.carrier || "N/A"}`);
        console.log(`     Method: ${order.shippingInfo.method || "N/A"}`);
      }

      if (order.timeline && order.timeline.length > 0) {
        console.log(`   Timeline: ${order.timeline.length} entries`);
        order.timeline.forEach((entry) => {
          console.log(
            `     - ${entry.status}: ${entry.note} (${new Date(
              entry.date
            ).toLocaleString()})`
          );
        });
      }
    });

    // Test 2: Check order model structure
    console.log("\n=== Order Model Structure ===");
    const sampleOrder = manageableOrders[0];
    if (sampleOrder) {
      console.log("Order fields available:");
      console.log("- status:", typeof sampleOrder.status);
      console.log("- shippingInfo:", typeof sampleOrder.shippingInfo);
      console.log("- timeline:", typeof sampleOrder.timeline);
      console.log("- seller:", typeof sampleOrder.seller);
      console.log("- buyer:", typeof sampleOrder.buyer);
      console.log("- items:", typeof sampleOrder.items);
    }
  } catch (error) {
    console.error("❌ Error testing delivery management:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }

  console.log("\nDelivery management test completed!");
  process.exit(0);
}

testDeliveryManagement().catch(console.error);
