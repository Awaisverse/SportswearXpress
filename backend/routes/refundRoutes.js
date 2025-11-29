import express from "express";
import {
  processRefund,
  getRefundHistory,
  getRefund,
  updateRefundStatus,
} from "../controllers/refundController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Process a new refund (admin only)
router.post("/", protect, upload.single("refundScreenshot"), processRefund);

// Get refund history (admin only)
router.get("/history", protect, getRefundHistory);

// Get single refund (admin only)
router.get("/:refundId", protect, getRefund);

// Update refund status (admin only)
router.patch("/:refundId/status", protect, updateRefundStatus);

export default router;
