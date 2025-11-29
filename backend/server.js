import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// Load environment variables first
dotenv.config();

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in environment variables");
  process.exit(1);
}

// Warn if OpenAI API key is not set (chatbot feature won't work)
if (!process.env.OPENAI_API_KEY) {
  console.warn(
    "⚠️  WARNING: OPENAI_API_KEY is not defined. Chatbot feature will not work."
  );
}

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/seller", sellerRoutes);
app.use("/api/v1/buyer", buyerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
// Legacy endpoint for backward compatibility - redirects to new endpoint
app.use("/api/chatgpt", chatbotRoutes);

// Test route
app.get("/api/v1/test", (req, res) => {
  res.json({ message: "Backend server is working!" });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Test endpoint to check buyer orders (for debugging)
app.get("/api/test/buyer/:buyerId/orders", async (req, res) => {
  try {
    const { buyerId } = req.params;
    const Buyer = (await import("./models/Buyer.js")).default;

    const buyer = await Buyer.findById(buyerId).populate({
      path: "orders",
      populate: [
        { path: "seller", select: "fullName email businessInfo.businessName" },
        { path: "items.product", select: "name price images" },
      ],
      options: { sort: { createdAt: -1 } },
    });

    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    res.json({
      success: true,
      buyer: {
        id: buyer._id,
        name: buyer.fullName,
        email: buyer.email,
        ordersCount: buyer.orders.length,
      },
      orders: buyer.orders,
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server only after successful database connection
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
