import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
    },
    userType: {
      type: String,
      required: true,
      enum: ["Admin", "Buyer", "Seller"],
    },
    token: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      required: true,
    },
    browser: {
      type: String,
      required: true,
    },
    os: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginAt: {
      type: Date,
      default: Date.now,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    logoutAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
sessionSchema.index({ userId: 1, userType: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ isActive: 1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
