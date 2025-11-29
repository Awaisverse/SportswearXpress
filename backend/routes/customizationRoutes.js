import express from "express";
import {
  createCustomization,
  getBuyerCustomizations,
  getSellerCustomizations,
  getCustomizationById,
  updateCustomization,
  deleteCustomization,
  addElement,
  updateElement,
  removeElement,
  addToTextLibrary,
  addToShapeLibrary,
  addToImageLibrary,
  getCustomizationStats,
  exportCustomization,
} from "../controllers/customizationController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Customization CRUD operations
router.post("/", createCustomization);
router.get("/buyer/:buyerId", getBuyerCustomizations);
router.get("/seller/:sellerId", getSellerCustomizations);
router.get("/:customizationId", getCustomizationById);
router.put("/:customizationId", updateCustomization);
router.delete("/:customizationId", deleteCustomization);

// Element management
router.post("/:customizationId/elements", addElement);
router.put("/:customizationId/elements/:elementId", updateElement);
router.delete("/:customizationId/elements/:elementId", removeElement);

// Library management
router.post("/:customizationId/library/text", addToTextLibrary);
router.post("/:customizationId/library/shape", addToShapeLibrary);
router.post("/:customizationId/library/image", addToImageLibrary);

// Statistics and analytics
router.get("/stats/overview", getCustomizationStats);

// Export functionality
router.get("/:customizationId/export", exportCustomization);

export default router;
