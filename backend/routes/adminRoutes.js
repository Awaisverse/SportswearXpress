import express from "express";
import rateLimit from "express-rate-limit";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  register,
  login,
  checkAdminExists,
  getLoginHistory,
  logout,
  getProfile,
  getUnverifiedSellers,
  verifySeller,
  suspendSeller,
  getAllBuyers,
  getAllSellers,
  getUserStats,
  toggleBuyerStatus,
  getUserDetails,
  activateSeller,
  getSellerDetails,
  getAdminBankInfo,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  getRecentActivities,
} from "../controllers/adminController.js";
import { getDashboardStats } from "../controllers/dashboardController.js";
import sessionMiddleware from "../middleware/sessionMiddleware.js";

const router = express.Router();

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
});

// Public routes
router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/check", checkAdminExists);
router.get("/bank-info", getAdminBankInfo);

// Protected routes - apply protect and admin middleware to all routes below
router.use(protect);
router.use(admin);

// Dashboard and profile routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/profile", getProfile);

// Seller management routes (no session tracking needed)
router.get("/sellers/unverified", getUnverifiedSellers);
router.get("/sellers/:sellerId", getSellerDetails);
router.post("/sellers/:sellerId/verify", verifySeller);
router.post("/sellers/:sellerId/suspend", suspendSeller);

// User management routes (no session tracking needed)
router.get("/buyers", getAllBuyers);
router.get("/sellers", getAllSellers);
router.get("/users/:userId/stats", getUserStats);
router.post("/users/:userId/toggle-status", toggleBuyerStatus);
router.get("/users/:userId/details", getUserDetails);
router.post("/sellers/:sellerId/activate", activateSeller);

// Order management routes
router.get("/orders", getAllOrders);
router.get("/orders/stats", getOrderStats);
router.get("/orders/:orderId", getOrderById);
router.patch("/orders/:orderId/status", updateOrderStatus);

// Session routes (only for login history and logout)
router.use(sessionMiddleware);
router.get("/login-history", getLoginHistory);
router.post("/logout", logout);

router.get("/activities/recent", getRecentActivities);

export default router;
