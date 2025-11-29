import Buyer from "../models/Buyer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Register a new buyer
export const register = async (req, res) => {
  try {
    console.log("\n=== Buyer Registration Started ===");
    console.log("Request body:", req.body);
    console.log("MongoDB URI:", process.env.MONGODB_URI ? "Set" : "Not set");
    console.log("JWT Secret:", process.env.JWT_SECRET ? "Set" : "Not set");

    const {
      fullName,
      email,
      password,
      phoneNumber,
      role,
      profilePhoto,
      isSuspended,
      suspensionDetails,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      console.log("Missing required fields:", {
        fullName: !fullName,
        email: !email,
        password: !password,
      });
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          fullName: !fullName,
          email: !email,
          password: !password,
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email);
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if buyer already exists
    console.log("Checking for existing buyer with email:", email);
    const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) {
      console.log("Buyer already exists with email:", email);
      return res.status(400).json({ message: "Buyer already exists" });
    }

    // Hash password
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new buyer with all attributes
    console.log("Creating new buyer object...");
    const buyer = new Buyer({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || null,
      profilePhoto: profilePhoto || null,
      isSuspended: false,
      suspensionDetails: {
        reason: null,
        suspendedAt: null,
        suspendedUntil: null,
      },
      role: "buyer",
    });

    console.log("Attempting to save buyer to database...");
    await buyer.save();
    console.log("Buyer saved successfully:", {
      id: buyer._id,
      email: buyer.email,
      role: buyer.role,
      profilePhoto: buyer.profilePhoto,
      isSuspended: buyer.isSuspended,
      suspensionDetails: buyer.suspensionDetails,
      phoneNumber: buyer.phoneNumber,
      createdAt: buyer.createdAt,
      updatedAt: buyer.updatedAt,
    });

    // Create JWT token
    console.log("Creating JWT token...");
    const token = jwt.sign(
      { id: buyer._id, role: buyer.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("=== Buyer Registration Completed Successfully ===\n");
    res.status(201).json({
      message: "Buyer registered successfully",
      token,
      user: {
        id: buyer._id,
        fullName: buyer.fullName,
        email: buyer.email,
        role: buyer.role,
        profilePhoto: buyer.profilePhoto,
        isSuspended: buyer.isSuspended,
        suspensionDetails: buyer.suspensionDetails,
      },
    });
  } catch (error) {
    console.error("\n=== Buyer Registration Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== End of Error ===\n");
    res.status(500).json({
      message: "Error registering buyer",
      error: error.message,
    });
  }
};

// Login buyer
export const login = async (req, res) => {
  try {
    console.log("\n=== Buyer Login Started ===");
    const { email, password } = req.body;

    // Check if buyer exists
    console.log("Checking for buyer with email:", email);
    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      console.log("Buyer not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if buyer is suspended
    if (buyer.isSuspended) {
      console.log("Buyer account is suspended");
      return res.status(403).json({
        message: "Account is suspended",
        suspensionDetails: buyer.suspensionDetails,
      });
    }

    // Verify password
    console.log("Verifying password...");
    const isMatch = await bcrypt.compare(password, buyer.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    console.log("Creating JWT token...");
    const token = jwt.sign(
      { id: buyer._id, role: buyer.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("=== Buyer Login Completed Successfully ===\n");
    res.json({
      message: "Login successful",
      token,
      user: {
        id: buyer._id,
        fullName: buyer.fullName,
        email: buyer.email,
        role: buyer.role,
        profilePhoto: buyer.profilePhoto,
        isSuspended: buyer.isSuspended,
      },
    });
  } catch (error) {
    console.error("\n=== Buyer Login Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== End of Error ===\n");
    res.status(500).json({ message: "Error logging in" });
  }
};
