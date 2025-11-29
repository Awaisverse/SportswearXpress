import Complaint from "../models/Complaint.js";
import Order from "../models/Order.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for complaint file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/complaints/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "complaint-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log("Processing complaint file:", file.originalname, file.mimetype);

    // Accept images, PDFs, and Word documents
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log("File rejected - unsupported type:", file.mimetype);
      cb(
        new Error("Only images, PDFs, and Word documents are allowed!"),
        false
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).array("attachments", 5); // Allow up to 5 files

// Wrap multer with error handling
export const uploadWithErrorHandling = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File too large. Maximum size is 10MB." });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res
          .status(400)
          .json({ message: "Too many files. Maximum 5 files allowed." });
      }
      return res
        .status(400)
        .json({ message: "File upload error: " + err.message });
    } else if (err) {
      console.error("File upload error:", err);
      return res
        .status(400)
        .json({ message: "File upload error: " + err.message });
    }
    next();
  });
};

// Submit a new complaint
export const submitComplaint = async (req, res) => {
  try {
    console.log("=== Submitting Complaint ===");
    console.log("Request body:", req.body);
    console.log("Files:", req.files);
    console.log("User ID:", req.user.id);

    const { orderId, subject, category, priority, description } = req.body;
    const userId = req.user.id;

    // Enhanced validation
    const validationErrors = [];

    if (!orderId) {
      validationErrors.push("Order ID is required");
    }

    if (!subject || !subject.trim()) {
      validationErrors.push("Subject is required");
    } else if (subject.trim().length < 5) {
      validationErrors.push("Subject must be at least 5 characters long");
    } else if (subject.trim().length > 200) {
      validationErrors.push("Subject must be less than 200 characters");
    }

    if (!category) {
      validationErrors.push("Category is required");
    }

    if (!description || !description.trim()) {
      validationErrors.push("Description is required");
    } else if (description.trim().length < 10) {
      validationErrors.push("Description must be at least 10 characters long");
    } else if (description.trim().length > 2000) {
      validationErrors.push("Description must be less than 2000 characters");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId).populate("seller");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.buyer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only submit complaints for your own orders",
      });
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Complaints can only be submitted for delivered orders",
      });
    }

    // Check if complaint already exists for this order
    const existingComplaint = await Complaint.findOne({
      order: orderId,
      user: userId,
    });

    if (existingComplaint) {
      return res.status(400).json({
        success: false,
        message: "A complaint already exists for this order",
      });
    }

    // Handle file uploads
    const attachments = [];
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} uploaded files`);

      for (const file of req.files) {
        try {
          console.log("Processing file:", file.originalname);

          // Create attachment object
          const attachment = {
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
          };

          attachments.push(attachment);
          console.log("File processed successfully:", file.originalname);
        } catch (uploadError) {
          console.error("File processing error:", uploadError);
          // Continue with other files even if one fails
        }
      }
    }

    // Create complaint
    const complaint = new Complaint({
      user: userId,
      order: orderId,
      subject: subject.trim(),
      category,
      priority: priority || "medium",
      description: description.trim(),
      attachments,
    });

    await complaint.save();

    console.log("Complaint created successfully:", complaint._id);

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: {
        complaint: {
          id: complaint._id,
          subject: complaint.subject,
          category: complaint.category,
          priority: complaint.priority,
          status: complaint.status,
          createdAt: complaint.createdAt,
          attachmentsCount: complaint.attachments.length,
        },
      },
    });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get user's complaints
export const getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const orderId = req.query.orderId; // Add support for orderId filter

    // Build query
    let query = { user: userId };
    if (orderId) {
      query.order = orderId;
    }

    const complaints = await Complaint.find(query)
      .populate("order", "orderNumber totalAmount status createdAt")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        complaints,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single complaint
export const getComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const userId = req.user.id;

    const complaint = await Complaint.findById(complaintId)
      .populate("order", "orderNumber totalAmount status createdAt")
      .populate("user", "name email")
      .populate("resolvedBy", "name email");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Check if user owns the complaint or is admin
    if (complaint.user._id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: { complaint },
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update complaint status (admin only)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, resolution, adminNotes } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    complaint.status = status;
    if (resolution) {
      complaint.resolution = resolution;
    }
    if (adminNotes) {
      complaint.adminNotes = adminNotes;
    }
    if (status === "resolved") {
      complaint.resolvedBy = req.user.id;
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      data: { complaint },
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all complaints (admin only)
export const getAllComplaints = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "all";
    const category = req.query.category || "all";
    const priority = req.query.priority || "all";
    const search = req.query.search || "";

    // Build filter object
    const filter = {};

    if (status !== "all") {
      filter.status = status;
    }

    if (category !== "all") {
      filter.category = category;
    }

    if (priority !== "all") {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get complaints with populated user and order data
    const complaints = await Complaint.find(filter)
      .populate("user", "fullName email phoneNumber")
      .populate({
        path: "order",
        select: "orderNumber totalAmount status",
        populate: {
          path: "seller",
          select: "fullName businessInfo",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalComplaints = await Complaint.countDocuments(filter);
    const totalPages = Math.ceil(totalComplaints / limit);

    // Get complaint statistics
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = {
      pending: 0,
      in_review: 0,
      resolved: 0,
      rejected: 0,
      total: totalComplaints,
    };

    stats.forEach((stat) => {
      if (statusStats.hasOwnProperty(stat._id)) {
        statusStats[stat._id] = stat.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        complaints,
        pagination: {
          currentPage: page,
          totalPages,
          totalComplaints,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: statusStats,
      },
    });
  } catch (error) {
    console.error("Error fetching all complaints:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};
