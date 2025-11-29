import express from "express";
import { protect, buyer } from "../middleware/authMiddleware.js";
import { register, login } from "../controllers/buyerController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.use(protect);

// Buyer profile routes
router.get("/profile", buyer, (req, res) => {
  res.json({ message: "Buyer profile route" });
});

// Buyer orders routes
router.get("/orders", buyer, (req, res) => {
  res.json({ message: "Buyer orders route" });
});

export default router;
