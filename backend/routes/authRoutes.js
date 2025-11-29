import express from "express";
import { verifyToken, login, register } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/verify-token", verifyToken);

export default router;
