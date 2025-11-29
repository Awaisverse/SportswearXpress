import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, seller } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Seller protected routes
router.post("/", protect, seller, createProduct);
router.put("/:id", protect, seller, updateProduct);
router.delete("/:id", protect, seller, deleteProduct);

export default router;
