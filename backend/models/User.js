import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      required: [true, "Role is required"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionDetails: {
      reason: String,
      suspendedAt: Date,
      suspendedUntil: Date,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster queries
userSchema.index({ email: 1, role: 1 });

const User = mongoose.model("User", userSchema);

export default User;
