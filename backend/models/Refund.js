import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    refundMethod: {
      type: String,
      enum: ["bank_transfer", "wallet_transfer", "cash_refund"],
      required: true,
    },
    refundReason: {
      type: String,
      required: true,
      trim: true,
    },
    refundNotes: {
      type: String,
      trim: true,
    },
    refundScreenshot: {
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "completed", "failed"],
      default: "pending",
      lowercase: true,
      trim: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Refund = mongoose.model("Refund", refundSchema);
export default Refund;
