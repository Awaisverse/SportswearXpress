import Admin from "../models/Admin.js";
import Buyer from "../models/Buyer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import SessionService from "../services/sessionService.js";
import Seller from "../models/Seller.js";
import Suspension from "../models/Suspension.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import Complaint from "../models/Complaint.js";

dotenv.config();

// Register admin (only one admin allowed)
export const register = async (req, res) => {
  try {
    console.log("\n=== Admin Registration Started ===");
    console.log("Request body:", { ...req.body, password: "[REDACTED]" });
    console.log("Environment variables:", {
      MONGODB_URI: process.env.MONGODB_URI ? "Set" : "Not set",
      JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV,
    });

    // Check if admin already exists
    const adminCount = await Admin.countDocuments();
    console.log("Current admin count:", adminCount);

    if (adminCount > 0) {
      console.log("Admin already exists");
      return res.status(400).json({
        message:
          "Admin already exists. Only one admin is allowed in the system.",
      });
    }

    const { fullName, email, password, phoneNumber, bankAccounts, wallets } =
      req.body;

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

    // Validate password strength
    if (password.length < 8) {
      console.log("Password too short");
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if email is already in use
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Email already in use:", email);
      return res.status(400).json({ message: "Email already in use" });
    }

    // Validate that at least one payment method is provided
    if (
      (!bankAccounts || bankAccounts.length === 0) &&
      (!wallets || wallets.length === 0)
    ) {
      return res.status(400).json({
        message:
          "At least one payment method (bank account or wallet) is required",
      });
    }

    // Hash password
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    console.log("Creating new admin object...");
    const admin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "admin",
      bankAccounts: bankAccounts || [],
      wallets: wallets || [],
    });

    console.log("Attempting to save admin to database...");
    await admin.save();
    console.log("Admin saved successfully:", {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      bankAccountsCount: admin.bankAccounts.length,
      walletsCount: admin.wallets.length,
    });

    // Create JWT token
    console.log("Creating JWT token...");
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("=== Admin Registration Completed Successfully ===\n");
    res.status(201).json({
      message: "Admin registered successfully",
      token,
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        bankAccounts: admin.bankAccounts,
        wallets: admin.wallets,
      },
    });
  } catch (error) {
    console.error("\n=== Admin Registration Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== End of Error ===\n");
    res.status(500).json({
      message: "Error registering admin",
      error: error.message,
    });
  }
};

// Login admin
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin by email with only necessary fields
    const admin = await Admin.findOne({ email })
      .select("+password") // Explicitly select password field
      .lean(); // Convert to plain object for better performance

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token with more secure options
    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        email: admin.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
        algorithm: "HS256",
      }
    );

    // Create session
    await SessionService.createSession(admin._id, "Admin", token, req);

    // Remove sensitive data
    delete admin.password;

    // Send response
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: "admin",
        profilePhoto: admin.profilePhoto || null,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get login history
export const getLoginHistory = async (req, res) => {
  try {
    const sessions = await SessionService.getUserSessions(req.user.id, "Admin");
    res.json({ history: sessions });
  } catch (error) {
    console.error("Get login history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout admin
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      await SessionService.deactivateSession(token);
    }
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check if admin exists
export const checkAdminExists = async (req, res) => {
  try {
    console.log("\n=== Checking Admin Existence ===");
    const adminCount = await Admin.countDocuments();
    console.log("Admin count:", adminCount);
    console.log("=== Admin Check Completed ===\n");
    res.json({ exists: adminCount > 0 });
  } catch (error) {
    console.error("\n=== Admin Check Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== End of Error ===\n");
    res.status(500).json({ message: "Error checking admin existence" });
  }
};

// Get admin profile
export const getProfile = async (req, res) => {
  try {
    console.log("Fetching admin profile for ID:", req.user.id);
    const admin = await Admin.findById(req.user.id)
      .select("fullName email phoneNumber role createdAt")
      .lean();

    if (!admin) {
      console.log("Admin not found");
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    console.log("Admin profile found:", admin);
    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all unverified sellers
export const getUnverifiedSellers = async (req, res) => {
  try {
    console.log("Getting unverified sellers...");
    console.log("Admin user:", req.user);

    const sellers = await Seller.find({ isVerified: false })
      .select("-password")
      .sort({ createdAt: -1 });

    console.log(`Found ${sellers.length} unverified sellers`);
    res.json(sellers);
  } catch (error) {
    console.error("Error getting unverified sellers:", error);
    res.status(500).json({ message: error.message });
  }
};

// Verify a seller
export const verifySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.isVerified = true;
    await seller.save();

    res.json({ message: "Seller verified successfully", seller });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend seller with detailed information
export const suspendSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const {
      reason,
      duration,
      durationType,
      description,
      evidence,
      adminNotes,
      suspensionType,
      effectiveDate,
      notifySeller,
      notifyBuyers,
    } = req.body;

    // Validate required fields
    if (!reason || !description || !evidence) {
      return res.status(400).json({
        success: false,
        message: "Reason, description, and evidence are required",
      });
    }

    // Find the seller
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Calculate suspension end date
    let suspendedUntil;
    if (suspensionType === "permanent") {
      suspendedUntil = new Date("2099-12-31"); // Far future date for permanent suspension
    } else {
      if (!duration || !durationType) {
        return res.status(400).json({
          success: false,
          message:
            "Duration and duration type are required for temporary suspensions",
        });
      }

      const effectiveDateObj = new Date(effectiveDate);
      const durationInMs = {
        days: duration * 24 * 60 * 60 * 1000,
        weeks: duration * 7 * 24 * 60 * 60 * 1000,
        months: duration * 30 * 24 * 60 * 60 * 1000,
      }[durationType];

      suspendedUntil = new Date(effectiveDateObj.getTime() + durationInMs);
    }

    // Create suspension record
    const suspension = new Suspension({
      seller: sellerId,
      reason,
      suspendedAt: new Date(effectiveDate),
      suspendedUntil,
      suspendedBy: req.user.id,
      status: "active",
      notes: adminNotes,
      complaints: [
        {
          type: "system",
          description: description,
          reportedAt: new Date(),
          status: "resolved",
        },
      ],
    });

    await suspension.save();

    // Update seller status
    seller.isSuspended = true;
    seller.activeSuspension = suspension._id;
    await seller.save();

    // TODO: Send notifications if requested
    if (notifySeller) {
      // Send email/notification to seller
      console.log(
        `Notification sent to seller ${seller.email} about suspension`
      );
    }

    if (notifyBuyers) {
      // Send notifications to buyers with pending orders
      console.log(
        `Notifications sent to buyers with pending orders from seller ${sellerId}`
      );
    }

    res.status(200).json({
      success: true,
      message: "Seller suspended successfully",
      suspension: {
        id: suspension._id,
        reason,
        suspendedAt: suspension.suspendedAt,
        suspendedUntil: suspension.suspendedUntil,
        suspensionType,
        duration:
          suspensionType === "temporary"
            ? `${duration} ${durationType}`
            : "Permanent",
      },
    });
  } catch (error) {
    console.error("Error suspending seller:", error);
    res.status(500).json({
      success: false,
      message: "Error suspending seller",
      error: error.message,
    });
  }
};

// ==================== USER MANAGEMENT FUNCTIONS ====================

// Get all buyers with pagination and filtering
export const getAllBuyers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "all" } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (status !== "all") {
      if (status === "suspended") {
        query.isSuspended = true;
      } else if (status === "active") {
        query.isSuspended = false;
      }
    }

    // Get total count
    const totalBuyers = await Buyer.countDocuments(query);

    // Get buyers with pagination
    const buyers = await Buyer.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Format response
    const formattedBuyers = buyers.map((buyer) => ({
      id: buyer._id,
      fullName: buyer.fullName,
      email: buyer.email,
      phoneNumber: buyer.phoneNumber || "N/A",
      profilePhoto: buyer.profilePhoto,
      status: buyer.isSuspended ? "suspended" : "active",
      joinedDate: buyer.createdAt,
      ordersCount: buyer.orders ? buyer.orders.length : 0,
      suspensionDetails: buyer.suspensionDetails,
      lastLogin: buyer.lastLogin || null,
    }));

    res.json({
      success: true,
      data: {
        buyers: formattedBuyers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBuyers / limit),
          totalBuyers,
          hasNextPage: page * limit < totalBuyers,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching buyers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching buyers",
      error: error.message,
    });
  }
};

// Get all sellers with pagination and filtering
export const getAllSellers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      verification = "all",
    } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { "businessInfo.businessName": { $regex: search, $options: "i" } },
      ];
    }

    if (status !== "all") {
      if (status === "suspended") {
        query.isSuspended = true;
      } else if (status === "active") {
        query.isSuspended = false;
      }
    }

    if (verification !== "all") {
      if (verification === "verified") {
        query.isVerified = true;
      } else if (verification === "unverified") {
        query.isVerified = false;
      }
    }

    // Get total count
    const totalSellers = await Seller.countDocuments(query);

    // Get sellers with pagination
    const sellers = await Seller.find(query)
      .select("-password")
      .populate("activeSuspension")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Format response
    const formattedSellers = sellers.map((seller) => ({
      id: seller._id,
      fullName: seller.fullName,
      email: seller.email,
      phoneNumber: seller.phoneNumber || "N/A",
      profilePhoto: seller.profilePhoto,
      businessName: seller.businessInfo?.businessName || "N/A",
      businessType: seller.businessInfo?.businessType || "N/A",
      status: seller.isSuspended ? "suspended" : "active",
      isVerified: seller.isVerified,
      joinedDate: seller.createdAt,
      ordersCount: seller.orders ? seller.orders.length : 0,
      productsCount: seller.products ? seller.products.length : 0,
      suspensionDetails: seller.activeSuspension,
      lastLogin: seller.lastLogin || null,
      bankAccountsCount: seller.bankAccounts ? seller.bankAccounts.length : 0,
      walletsCount: seller.wallets ? seller.wallets.length : 0,
    }));

    res.json({
      success: true,
      data: {
        sellers: formattedSellers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSellers / limit),
          totalSellers,
          hasNextPage: page * limit < totalSellers,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sellers",
      error: error.message,
    });
  }
};

// Get user statistics for dashboard
export const getUserStats = async (req, res) => {
  try {
    const [
      totalBuyers,
      suspendedBuyers,
      totalSellers,
      unverifiedSellers,
      activeSellers,
    ] = await Promise.all([
      Buyer.countDocuments(),
      Buyer.countDocuments({ isSuspended: true }),
      Seller.countDocuments(),
      Seller.countDocuments({ isVerified: false }),
      Seller.countDocuments({ isSuspended: false, isVerified: true }),
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentBuyers, recentSellers] = await Promise.all([
      Buyer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Seller.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    res.json({
      success: true,
      data: {
        totalBuyers,
        suspendedBuyers,
        totalSellers,
        unverifiedSellers,
        activeSellers,
        recentBuyers,
        recentSellers,
        totalUsers: totalBuyers + totalSellers,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

// Suspend/Activate buyer
export const toggleBuyerStatus = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { action, reason, suspendedUntil, notes } = req.body;

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    if (action === "suspend") {
      buyer.isSuspended = true;
      buyer.suspensionDetails = {
        reason: reason || "Admin suspension",
        suspendedAt: new Date(),
        suspendedUntil: suspendedUntil ? new Date(suspendedUntil) : null,
      };
    } else if (action === "activate") {
      buyer.isSuspended = false;
      buyer.suspensionDetails = {
        reason: null,
        suspendedAt: null,
        suspendedUntil: null,
      };
    }

    await buyer.save();

    res.json({
      success: true,
      message: `Buyer ${
        action === "suspend" ? "suspended" : "activated"
      } successfully`,
      buyer: {
        id: buyer._id,
        fullName: buyer.fullName,
        email: buyer.email,
        status: buyer.isSuspended ? "suspended" : "active",
        suspensionDetails: buyer.suspensionDetails,
      },
    });
  } catch (error) {
    console.error("Error toggling buyer status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating buyer status",
      error: error.message,
    });
  }
};

// Activate (unsuspend) seller
export const activateSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Remove suspension
    seller.isSuspended = false;
    seller.activeSuspension = null;

    // Update any active suspension to inactive
    if (seller.activeSuspension) {
      await Suspension.findByIdAndUpdate(seller.activeSuspension, {
        status: "inactive",
        reactivatedAt: new Date(),
        reactivatedBy: req.user._id,
      });
    }

    await seller.save();

    res.json({
      success: true,
      message: "Seller activated successfully",
      seller: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        status: "active",
        isVerified: seller.isVerified,
      },
    });
  } catch (error) {
    console.error("Error activating seller:", error);
    res.status(500).json({
      success: false,
      message: "Error activating seller",
      error: error.message,
    });
  }
};

// Get user details (buyer or seller)
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const userType = req.query.userType;

    console.log("getUserDetails called with:", { userId, userType });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid ObjectId format:", userId);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Validate userType
    if (!userType || !["buyer", "seller"].includes(userType)) {
      console.log("Invalid userType:", userType);
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be "buyer" or "seller"',
      });
    }

    let user;
    try {
      if (userType === "buyer") {
        user = await Buyer.findById(userId)
          .select("-password")
          .populate("orders")
          .lean();
      } else if (userType === "seller") {
        user = await Seller.findById(userId)
          .select("-password")
          .populate(["orders", "products", "activeSuspension"])
          .lean();
      }
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database error while fetching user",
        error:
          process.env.NODE_ENV === "development" ? dbError.message : undefined,
      });
    }

    if (!user) {
      console.log("User not found:", { userId, userType });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User found successfully:", {
      userId,
      userType,
      userEmail: user.email,
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get individual seller details
export const getSellerDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId)
      .select("-password")
      .populate("activeSuspension")
      .populate("products")
      .populate("orders")
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Format the response
    const formattedSeller = {
      id: seller._id,
      fullName: seller.fullName,
      email: seller.email,
      phone: seller.phoneNumber || "N/A",
      businessInfo: seller.businessInfo,
      status: seller.isSuspended ? "suspended" : "active",
      isVerified: seller.isVerified,
      isSuspended: seller.isSuspended,
      joinedDate: seller.createdAt,
      products: seller.products || [],
      orders: seller.orders || [],
      profilePhoto: seller.profilePhoto,
      suspensionDetails: seller.activeSuspension,
      bankAccounts: seller.bankAccounts || [],
      wallets: seller.wallets || [],
    };

    res.json({
      success: true,
      seller: formattedSeller,
    });
  } catch (error) {
    console.error("Error fetching seller details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seller details",
      error: error.message,
    });
  }
};

// Get admin bank information for checkout
export const getAdminBankInfo = async (req, res) => {
  try {
    // Get the first admin (since only one admin is allowed)
    const admin = await Admin.findOne().select("fullName bankAccounts wallets");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: {
        fullName: admin.fullName,
        bankAccounts: admin.bankAccounts || [],
        wallets: admin.wallets || [],
      },
    });
  } catch (error) {
    console.error("Error fetching admin bank info:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin bank information",
      error: error.message,
    });
  }
};

// Get all orders for admin
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "buyer.fullName": { $regex: search, $options: "i" } },
        {
          "seller.businessInfo.businessName": { $regex: search, $options: "i" },
        },
      ];
    }

    // Get orders with populated buyer and seller info
    const orders = await Order.find(filter)
      .populate("buyer", "fullName email phoneNumber")
      .populate("seller", "fullName email businessInfo")
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error getting all orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get order details by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("buyer", "fullName email phoneNumber address")
      .populate("seller", "fullName email businessInfo")
      .populate("items.product", "name images price description variants");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message,
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const previousStatus = order.status;

    // Update order status
    order.status = status;
    if (notes) {
      order.adminNotes = notes;
    }
    order.updatedAt = new Date();

    // Handle admin revenue changes
    if (status === "confirmed" && previousStatus !== "confirmed") {
      // Add to admin revenue when order is confirmed
      try {
        const admin = await Admin.findOne();
        if (admin) {
          admin.revenue = (admin.revenue || 0) + order.totalAmount;
          await admin.save();
          console.log(
            `Admin revenue increased by ${order.totalAmount} for confirmed order`
          );
        }
      } catch (revenueError) {
        console.error("Error updating admin revenue:", revenueError);
        // Don't fail the status update if revenue update fails
      }
    } else if (status === "cancelled" && previousStatus === "confirmed") {
      // Subtract from admin revenue when confirmed order is cancelled
      try {
        const admin = await Admin.findOne();
        if (admin) {
          admin.revenue = Math.max(0, (admin.revenue || 0) - order.totalAmount);
          await admin.save();
          console.log(
            `Admin revenue decreased by ${order.totalAmount} for cancelled confirmed order`
          );
        }
      } catch (revenueError) {
        console.error("Error updating admin revenue:", revenueError);
        // Don't fail the status update if revenue update fails
      }
    }

    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const confirmedOrders = await Order.countDocuments({ status: "confirmed" });
    const shippedOrders = await Order.countDocuments({ status: "shipped" });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    // Get admin revenue from stored value
    const admin = await Admin.findOne().select("revenue");
    const totalRevenue = admin ? admin.revenue || 0 : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error getting order stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

// Get recent activities for admin dashboard
export const getRecentActivities = async (req, res) => {
  try {
    // Get recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("buyer", "fullName")
      .lean();

    // Get recent complaints
    const recentComplaints = await Complaint.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "fullName")
      .lean();

    // Merge and sort by date
    const activities = [
      ...recentOrders.map((order) => ({
        type: "order",
        message: `New order #${order.orderNumber} by ${
          order.buyer?.fullName || "Unknown"
        }`,
        time: order.createdAt,
      })),
      ...recentComplaints.map((complaint) => ({
        type: "complaint",
        message: `New complaint by ${complaint.user?.fullName || "Unknown"}: ${
          complaint.subject
        }`,
        time: complaint.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
};
