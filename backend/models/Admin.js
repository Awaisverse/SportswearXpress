import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
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
  role: {
    type: String,
    default: "admin",
    enum: ["admin"],
  },
  // Bank information fields
  bankAccounts: [
    {
      type: {
        type: String,
        enum: ["Allied Bank", "HBL", "Al-Falah", "Faysal Bank", "MCB", "other"],
        required: true,
      },
      otherBankName: {
        type: String,
        trim: true,
      },
      accountTitle: {
        type: String,
        required: true,
        trim: true,
      },
      accountNumber: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: function (v) {
            // Must be exactly 12 digits
            return /^\d{12}$/.test(v);
          },
          message: "Bank account number must be exactly 12 digits",
        },
      },
      branchCode: {
        type: String,
        trim: true,
      },
    },
  ],
  wallets: [
    {
      type: {
        type: String,
        enum: ["jazz cash", "easyPaisa", "other"],
        required: true,
      },
      otherWalletName: {
        type: String,
        trim: true,
      },
      accountTitle: {
        type: String,
        required: true,
        trim: true,
      },
      accountNumber: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: function (v) {
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
            "Wallet account number must be 11 digits starting with 03, 3rd digit ≤ 4, 4th digit ≤ 9",
        },
      },
    },
  ],
  revenue: {
    type: Number,
    default: 0,
    min: 0,
  },
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
adminSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Admin", adminSchema);
