import express from "express";
import rateLimit from "express-rate-limit";
import {
  chatWithBot,
  chatbotHealth,
} from "../controllers/chatbotController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rate limiting for chatbot to prevent abuse
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    success: false,
    message:
      "Too many requests. Please wait a moment before sending another message.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check route (public - no authentication required)
router.get("/health", chatbotHealth);

// Chat endpoint (protected - requires authentication + rate limiting)
router.post("/chat", protect, chatLimiter, chatWithBot);

// Root POST endpoint for frontend compatibility (protected + rate limited)
router.post("/", protect, chatLimiter, chatWithBot);

export default router;
