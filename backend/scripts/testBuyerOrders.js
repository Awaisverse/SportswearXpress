import mongoose from "mongoose";
import dotenv from "dotenv";
import Buyer from "../models/Buyer.js";
import Order from "../models/Order.js";

dotenv.config();

const testBuyerOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all buyers
    const buyers = await Buyer.find({});
    console.log(`Found ${buyers.length} buyers`);

    if (buyers.length === 0) {
      console.log("No buyers found in database");
      return;
    }

    // Check each buyer's orders
    for (const buyer of buyers) {
      console.log(`\n=== Buyer: ${buyer.fullName} (${buyer.email}) ===`);
      console.log(`Buyer ID: ${buyer._id}`);
      console.log(`Orders array length: ${buyer.orders.length}`);

      if (buyer.orders.length > 0) {
        console.log("Order IDs:", buyer.orders);

        // Try to populate orders
        const populatedBuyer = await Buyer.findById(buyer._id).populate({
          path: "orders",
          populate: [
            {
              path: "seller",
              select: "fullName email businessInfo.businessName",
            },
            { path: "items.product", select: "name price images" },
          ],
          options: { sort: { createdAt: -1 } },
        });

        console.log("Populated orders:", populatedBuyer.orders);
      } else {
        console.log("No orders found for this buyer");
      }
    }

    // Check all orders in the database
    const allOrders = await Order.find({});
    console.log(`\n=== All Orders in Database ===`);
    console.log(`Total orders: ${allOrders.length}`);

    if (allOrders.length > 0) {
      allOrders.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`);
        console.log(`- ID: ${order._id}`);
        console.log(`- Order Number: ${order.orderNumber}`);
        console.log(`- Buyer: ${order.buyer}`);
        console.log(`- Seller: ${order.seller}`);
        console.log(`- Status: ${order.status}`);
        console.log(`- Total Amount: ${order.totalAmount}`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

testBuyerOrders();
