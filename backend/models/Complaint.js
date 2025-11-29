import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Product Quality",
        "Wrong Item Received",
        "Damaged Product",
        "Size/Fit Issues",
        "Missing Items",
        "Delivery Issues",
        "Seller Communication",
        "Other",
      ],
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        mimetype: String,
        size: Number,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "in_review", "resolved", "rejected"],
      default: "pending",
      lowercase: true,
      trim: true,
    },
    resolution: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    resolvedAt: {
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

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
