import express from "express";
import cartController from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Get user's cart
router.get("/", cartController.getCart);

// Add item to cart
router.post("/add", cartController.addToCart);

// Add customized product to cart
router.post("/add-customized", cartController.addCustomizedProductToCart);

// Update cart item quantity
router.put("/update", cartController.updateCartItem);

// Remove item from cart
router.delete("/remove/:itemId", cartController.removeFromCart);

// Clear cart
router.delete("/clear", cartController.clearCart);

// New optimized endpoints for checkout
router.post("/validate-checkout", cartController.validateCartForCheckout);
router.post("/summary", cartController.getCartSummary);
router.get(
  "/product-availability/:productId/:quantity",
  cartController.checkProductAvailability
);

export default router;
