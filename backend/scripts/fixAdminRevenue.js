import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import Order from "../models/Order.js";

dotenv.config();

const fixAdminRevenue = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin exists
    const admin = await Admin.findOne();

    if (!admin) {
      console.log("❌ No admin found in database");
      console.log("Please create an admin account first");
      return;
    }

    console.log("✅ Admin found:", admin.fullName);
    console.log("📧 Email:", admin.email);
    console.log("💰 Current revenue:", admin.revenue || 0);

    // Calculate revenue from confirmed orders
    const confirmedOrders = await Order.find({ status: "confirmed" });
    const calculatedRevenue = confirmedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    console.log("📊 Confirmed orders count:", confirmedOrders.length);
    console.log(
      "💵 Calculated revenue from confirmed orders:",
      calculatedRevenue
    );

    // Update admin revenue
    const oldRevenue = admin.revenue || 0;
    admin.revenue = calculatedRevenue;
    await admin.save();

    console.log("✅ Admin revenue updated!");
    console.log("💰 Old revenue:", oldRevenue);
    console.log("💰 New revenue:", calculatedRevenue);
    console.log("📈 Difference:", calculatedRevenue - oldRevenue);

    // Show some sample orders
    if (confirmedOrders.length > 0) {
      console.log("\n📋 Confirmed orders used for calculation:");
      confirmedOrders.forEach((order, index) => {
        console.log(
          `${index + 1}. Order #${order.orderNumber} - $${
            order.totalAmount
          } (${order.createdAt.toLocaleDateString()})`
        );
      });
    } else {
      console.log("\n📋 No confirmed orders found");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

fixAdminRevenue();
