import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Buyer from "../models/Buyer.js";
import Seller from "../models/Seller.js";

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.json({ valid: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.json({ valid: false });
      }

      try {
        // Map role to model
        const modelMap = {
          admin: Admin,
          buyer: Buyer,
          seller: Seller,
        };
        const Model = modelMap[decoded.role];

        if (!Model) {
          return res.json({ valid: false });
        }

        // Get the full user object from database
        const user = await Model.findById(decoded.id);

        if (!user) {
          return res.json({ valid: false });
        }

        // Remove password from user object
        const userResponse = user.toObject ? user.toObject() : { ...user };
        delete userResponse.password;

        return res.json({ valid: true, user: userResponse });
      } catch (error) {
        console.error("Error fetching user during token verification:", error);
        return res.json({ valid: false });
      }
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.json({ valid: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log("Login attempt:", { email, role });

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required" });
    }

    // Map role to model
    const modelMap = {
      admin: Admin,
      buyer: Buyer,
      seller: Seller,
    };
    const Model = modelMap[role];
    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Find user
    const user = await Model.findOne({ email });
    console.log("User found:", user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.password) {
      return res
        .status(500)
        .json({ message: "User record is missing password field" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(403).json({
        message: "Account is suspended",
        suspensionDetails: user.suspensionDetails,
      });
    }

    // Seller-specific: check if suspended
    if (role === "seller" && user.isSuspended) {
      return res.status(403).json({
        message: "Your account has been suspended",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Remove password from user object
    const userResponse = user.toObject ? user.toObject() : { ...user };
    delete userResponse.password;

    // Optionally, add a redirect path for frontend
    let redirectTo = "/";
    if (role === "admin") redirectTo = "/admin/dashboard";
    else if (role === "seller") redirectTo = "/seller/dashboard";
    else if (role === "buyer") redirectTo = "/buyer/dashboard";

    res.json({
      token,
      user: userResponse,
      redirectTo,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      fullName,
      phoneNumber,
      businessName,
      businessType,
      nationalID,
    } = req.body;

    // Validate required fields
    if (!email || !password || !role || !fullName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Seller-specific validation
    if (role === "seller") {
      if (!businessName || !businessType || !nationalID) {
        return res
          .status(400)
          .json({ message: "Missing required seller fields" });
      }
      // Validate businessType
      const validBusinessTypes = [
        "sportswear_manufacturer",
        "sportswear_retailer",
        "custom_clothing_designer",
        "sports_accessories",
        "fitness_apparel",
        "team_uniform_supplier",
        "sports_equipment_retailer",
        "custom_printing_service",
        "sports_footwear",
        "sports_gear_retailer",
      ];
      if (!validBusinessTypes.includes(businessType)) {
        return res.status(400).json({ message: "Invalid business type" });
      }

      // Validate that at least one payment method is provided
      const { bankAccounts, wallets } = req.body;
      if (
        (!bankAccounts || bankAccounts.length === 0) &&
        (!wallets || wallets.length === 0)
      ) {
        return res.status(400).json({
          message:
            "At least one payment method (bank account or wallet) is required",
        });
      }
    }

    // Map role to model
    const modelMap = {
      admin: Admin,
      buyer: Buyer,
      seller: Seller,
    };
    const Model = modelMap[role];
    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user already exists
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data object
    const userData = {
      email,
      password: hashedPassword,
      fullName,
      phoneNumber: phoneNumber || null,
      profilePhoto: req.body.profilePhoto || null,
      isSuspended: false,
      suspensionDetails: {
        reason: null,
        suspendedAt: null,
        suspendedUntil: null,
      },
    };

    // Add seller-specific fields if role is seller
    if (role === "seller") {
      userData.businessInfo = {
        businessName,
        businessType,
        nationalID,
      };
      userData.bankAccounts = req.body.bankAccounts || [];
      userData.wallets = req.body.wallets || [];
    }

    // Create new user
    const user = new Model(userData);
    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Remove password from user object
    const userResponse = user.toObject ? user.toObject() : { ...user };
    delete userResponse.password;

    // Optionally, add a redirect path for frontend
    let redirectTo = "/";
    if (role === "admin") redirectTo = "/admin/dashboard";
    else if (role === "seller") redirectTo = "/seller/dashboard";
    else if (role === "buyer") redirectTo = "/buyer/dashboard";

    res.status(201).json({
      token,
      user: userResponse,
      redirectTo,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field} already exists`,
      });
    }

    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};
