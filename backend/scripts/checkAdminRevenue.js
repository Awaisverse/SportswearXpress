import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import Order from "../models/Order.js";

dotenv.config();

const checkAdminRevenue = async () => {
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

    // Check if revenue field exists
    if (admin.revenue === undefined || admin.revenue === null) {
      console.log("⚠️  Revenue field is not set, initializing to 0");
      admin.revenue = 0;
      await admin.save();
      console.log("✅ Revenue initialized to 0");
    }

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
    console.log("💵 Stored admin revenue:", admin.revenue);

    if (admin.revenue !== calculatedRevenue) {
      console.log("⚠️  Revenue mismatch detected!");
      console.log(
        "Would you like to update the stored revenue to match calculated revenue? (y/n)"
      );

      // In a real script, you'd read user input here
      // For now, let's just log the difference
      console.log("Difference:", Math.abs(admin.revenue - calculatedRevenue));
    } else {
      console.log("✅ Revenue is consistent");
    }

    // Show some sample orders
    if (confirmedOrders.length > 0) {
      console.log("\n📋 Sample confirmed orders:");
      confirmedOrders.slice(0, 5).forEach((order, index) => {
        console.log(
          `${index + 1}. Order #${order.orderNumber} - $${order.totalAmount}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

checkAdminRevenue();
