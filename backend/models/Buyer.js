import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        // Skip validation if field is not being modified
        if (!this.isModified("phoneNumber")) {
          return true;
        }
        if (!v) return true; // Allow empty phone numbers
        // Must be exactly 11 digits starting with 03
        if (!/^03\d{9}$/.test(v)) {
          return false;
        }
        // 3rd digit (index 2) must be 0-4
        const thirdDigit = parseInt(v.charAt(2));
        if (thirdDigit > 4) {
          return false;
        }
        // 4th digit (index 3) must be 0-9
        const fourthDigit = parseInt(v.charAt(3));
        if (fourthDigit > 9) {
          return false;
        }
        return true;
      },
      message:
        "Phone number must be 11 digits starting with 03, 3rd digit ≤ 4, 4th digit ≤ 9",
    },
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
    reason: {
      type: String,
      default: null,
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
  },
  role: {
    type: String,
    default: "buyer",
    enum: ["buyer"],
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
buyerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Buyer", buyerSchema);
