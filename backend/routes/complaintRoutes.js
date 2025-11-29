import express from "express";
import {
  submitComplaint,
  getUserComplaints,
  getComplaint,
  updateComplaintStatus,
  getAllComplaints,
  uploadWithErrorHandling,
} from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit a new complaint
router.post("/", protect, uploadWithErrorHandling, submitComplaint);

// Get user's complaints
router.get("/user", protect, getUserComplaints);

// Get all complaints (admin only)
router.get("/admin/all", protect, getAllComplaints);

// Get single complaint
router.get("/:complaintId", protect, getComplaint);

// Update complaint status (admin only)
router.patch("/:complaintId/status", protect, updateComplaintStatus);

export default router;
