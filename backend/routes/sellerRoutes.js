import express from "express";
import { protect, seller } from "../middleware/authMiddleware.js";
import {
  getSellerProducts,
  getSellerOrders,
  updateOrderStatus,
  getSellerDashboard,
  getSellerProfile,
  updateSellerProfile,
  getDashboardData,
  getProductCount,
  getSellerProfileById,
} from "../controllers/sellerController.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  getProductById,
} from "../controllers/productController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Product routes
router
  .route("/products")
  .get(seller, getSellerProducts)
  .post(seller, createProduct);

router
  .route("/products/:id")
  .get(seller, getProductById)
  .put(seller, updateProduct)
  .delete(seller, deleteProduct);

router.route("/products/:id/status").patch(seller, updateProductStatus);

// Order routes
router.route("/orders").get(seller, getSellerOrders);

router.route("/orders/:id").put(seller, updateOrderStatus);

// Dashboard and profile routes
router.get("/dashboard", protect, seller, getDashboardData);
router.get("/products/count", protect, seller, getProductCount);
router
  .route("/profile")
  .get(seller, getSellerProfile)
  .put(seller, updateSellerProfile);

// Public route to get seller profile by ID (no authentication required) - placed at end
router.get("/:sellerId/profile", getSellerProfileById);

export default router;
