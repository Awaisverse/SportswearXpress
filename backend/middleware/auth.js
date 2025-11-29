import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

dotenv.config();

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res
        .status(401)
        .json({ message: "Token verification failed, authorization denied" });
    }

    // Check if user is admin
    if (verified.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required." });
    }

    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is invalid" });
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's an admin token
    if (decoded.role === "admin") {
      const admin = await Admin.findById(decoded.id);
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }
      req.user = admin;
    } else {
      // For non-admin users, use User model
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
