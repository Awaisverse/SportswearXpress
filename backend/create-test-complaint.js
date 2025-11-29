import mongoose from "mongoose";
import dotenv from "dotenv";
import Complaint from "./models/Complaint.js";
import Buyer from "./models/Buyer.js";
import Order from "./models/Order.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function createTestComplaint() {
  try {
    // Find a buyer
    const buyer = await Buyer.findOne({});
    if (!buyer) {
      console.log("No buyers found in database");
      return;
    }

    // Find an order
    const order = await Order.findOne({});
    if (!order) {
      console.log("No orders found in database");
      return;
    }

    console.log("Found buyer:", buyer.fullName);
    console.log("Found order:", order.orderNumber);

    // Create a test complaint
    const testComplaint = new Complaint({
      user: buyer._id,
      order: order._id,
      subject: "Test Complaint - Product Quality Issue",
      category: "Product Quality",
      priority: "medium",
      description:
        "This is a test complaint to verify the complaints functionality is working correctly.",
      status: "pending",
    });

    await testComplaint.save();
    console.log("Test complaint created successfully:", testComplaint._id);
  } catch (error) {
    console.error("Error creating test complaint:", error);
  } finally {
    mongoose.connection.close();
  }
}

createTestComplaint();
