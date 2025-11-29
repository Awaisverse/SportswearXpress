import Refund from "../models/Refund.js";
import Order from "../models/Order.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";

// Process a new refund
export const processRefund = async (req, res) => {
  try {
    const { orderId, refundAmount, refundMethod, refundReason, refundNotes } =
      req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!orderId || !refundAmount || !refundMethod || !refundReason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if order exists
    const order = await Order.findById(orderId)
      .populate("buyer", "fullName email")
      .populate("seller", "fullName businessInfo.businessName");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is cancelled
    if (order.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Refunds can only be processed for cancelled orders",
      });
    }

    // Check if refund already exists for this order
    const existingRefund = await Refund.findOne({ order: orderId });
    if (existingRefund) {
      return res.status(400).json({
        success: false,
        message: "A refund already exists for this order",
      });
    }

    // Validate refund amount
    const amount = parseFloat(refundAmount);
    if (amount <= 0 || amount > order.totalAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Refund amount must be greater than 0 and not exceed order total",
      });
    }

    // Handle file upload
    let refundScreenshot = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path, "refunds");
        refundScreenshot = {
          filename: result.public_id,
          originalName: req.file.originalname,
          path: result.secure_url,
          mimetype: req.file.mimetype,
          size: req.file.size,
        };
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        // Continue without screenshot if upload fails
      }
    }

    // Create refund record
    const refund = new Refund({
      order: orderId,
      buyer: order.buyer._id,
      seller: order.seller._id,
      refundAmount: amount,
      refundMethod,
      refundReason,
      refundNotes: refundNotes || "",
      refundScreenshot,
      processedBy: adminId,
      status: "processed",
    });

    await refund.save();

    // Update order with refund information
    order.refund = refund._id;
    order.refundStatus = "processed";
    await order.save();

    res.status(201).json({
      success: true,
      message: "Refund processed successfully",
      data: {
        refund: {
          id: refund._id,
          amount: refund.refundAmount,
          method: refund.refundMethod,
          reason: refund.refundReason,
          status: refund.status,
          processedAt: refund.processedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get refund history
export const getRefundHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const refunds = await Refund.find()
      .populate("order", "orderNumber totalAmount status")
      .populate("buyer", "fullName email")
      .populate("seller", "fullName businessInfo.businessName")
      .populate("processedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Refund.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        refunds,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching refund history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single refund
export const getRefund = async (req, res) => {
  try {
    const { refundId } = req.params;

    const refund = await Refund.findById(refundId)
      .populate("order", "orderNumber totalAmount status createdAt")
      .populate("buyer", "fullName email phoneNumber")
      .populate("seller", "fullName email businessInfo")
      .populate("processedBy", "fullName email");

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { refund },
    });
  } catch (error) {
    console.error("Error fetching refund:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update refund status
export const updateRefundStatus = async (req, res) => {
  try {
    const { refundId } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user.id;

    const refund = await Refund.findById(refundId);
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    refund.status = status;
    if (notes) {
      refund.refundNotes = notes;
    }

    if (status === "completed") {
      refund.completedAt = new Date();
    }

    await refund.save();

    res.status(200).json({
      success: true,
      message: "Refund status updated successfully",
      data: { refund },
    });
  } catch (error) {
    console.error("Error updating refund status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
