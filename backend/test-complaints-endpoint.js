import mongoose from "mongoose";
import dotenv from "dotenv";
import Complaint from "./models/Complaint.js";
import Buyer from "./models/Buyer.js";
import Order from "./models/Order.js";
import Seller from "./models/Seller.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function testComplaintsEndpoint() {
  try {
    console.log("Testing complaints endpoint logic...");

    // Test the same query that the getAllComplaints function uses
    const complaints = await Complaint.find({})
      .populate("user", "fullName email phoneNumber")
      .populate({
        path: "order",
        select: "orderNumber totalAmount status",
        populate: {
          path: "seller",
          select: "fullName businessInfo",
        },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log("Total complaints found:", complaints.length);

    if (complaints.length > 0) {
      console.log("Sample complaint data:");
      console.log({
        id: complaints[0]._id,
        subject: complaints[0].subject,
        status: complaints[0].status,
        user: complaints[0].user
          ? {
              fullName: complaints[0].user.fullName,
              email: complaints[0].user.email,
            }
          : "No user data",
        order: complaints[0].order
          ? {
              orderNumber: complaints[0].order.orderNumber,
              totalAmount: complaints[0].order.totalAmount,
            }
          : "No order data",
      });
    }

    // Test statistics aggregation
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("Status statistics:", stats);
  } catch (error) {
    console.error("Error testing complaints endpoint:", error);
  } finally {
    mongoose.connection.close();
  }
}

testComplaintsEndpoint();
