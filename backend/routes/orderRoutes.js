import express from "express";
import { protect, buyer, seller, admin } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderDelivery,
  cancelOrder,
  getOrderStats,
  getPendingPayments,
  approvePayment,
  testOrderCreation,
} from "../controllers/orderController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Test route to verify order routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Order routes are working!" });
});

// Test order creation (buyer only) - for debugging
router.post("/test-create", protect, buyer, testOrderCreation);

// Create order (buyer only) - Updated path to match frontend
router.post("/create", protect, buyer, upload, createOrder);

// Get buyer orders (buyer only)
router.get("/buyer", protect, buyer, getBuyerOrders);

// Get seller orders (seller only)
router.get("/seller", protect, seller, getSellerOrders);

// Get pending payments (admin only)
router.get("/pending-payments", protect, admin, getPendingPayments);

// Approve payment (admin only)
router.patch("/:orderId/approve-payment", protect, admin, approvePayment);

// Get order by ID (buyer or seller who owns the order)
router.get("/:orderId", protect, getOrderById);

// Cancel order (buyer only)
router.patch("/:orderId/cancel", protect, buyer, cancelOrder);

// Update order status (seller only)
router.patch("/:orderId/status", protect, seller, updateOrderStatus);

// Update order delivery information (seller only)
router.patch("/:orderId/delivery", protect, seller, updateOrderDelivery);

// Get order statistics for dashboard
router.get("/stats/dashboard", protect, getOrderStats);

export default router;
