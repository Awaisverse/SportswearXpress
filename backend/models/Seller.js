import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
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
      default: "seller",
      enum: ["seller"],
    },
    businessInfo: {
      businessName: {
        type: String,
        required: true,
        trim: true,
      },
      businessType: {
        type: String,
        required: true,
        enum: [
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
        ],
      },
      nationalID: {
        type: String,
        required: true,
        trim: true,
      },
    },
    bankAccounts: [
      {
        type: {
          type: String,
          enum: [
            "Allied Bank",
            "HBL",
            "Al-Falah",
            "Faysal Bank",
            "MCB",
            "other",
          ],
          required: true,
        },
        accountNumber: {
          type: String,
          required: true,
          trim: true,
          validate: {
            validator: function (v) {
              // Skip validation if field is not being modified
              if (!this.isModified("bankAccounts")) {
                return true;
              }
              // Must be exactly 12 digits
              return /^\d{12}$/.test(v);
            },
            message: "Bank account number must be exactly 12 digits",
          },
        },
        accountTitle: {
          type: String,
          required: true,
          trim: true,
        },
        branchCode: {
          type: String,
          trim: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        otherBankName: {
          type: String,
          trim: true,
          validate: {
            validator: function (v) {
              return (
                this.type !== "other" ||
                (this.type === "other" && v && v.length > 0)
              );
            },
            message: "Bank name is required when type is 'other'",
          },
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
        accountTitle: {
          type: String,
          required: true,
          trim: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        otherWalletName: {
          type: String,
          trim: true,
          validate: {
            validator: function (v) {
              return (
                this.type !== "other" ||
                (this.type === "other" && v && v.length > 0)
              );
            },
            message: "Wallet name is required when type is 'other'",
          },
        },
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    activeSuspension: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suspension",
      default: null,
    },
    suspensionHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Suspension",
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    lastLogin: {
      type: Date,
      default: null,
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalWithdrawals: {
      type: Number,
      default: 0,
    },
    pendingBalance: {
      type: Number,
      default: 0,
    },
    payoutHistory: [
      {
        amount: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
        paymentMethod: {
          type: String,
          required: true,
        },
        reference: {
          type: String,
        },
      },
    ],
    withdrawalHistory: [
      {
        amount: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
        paymentMethod: {
          type: String,
          required: true,
        },
        reference: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Validate at least one payment method exists (only for verified sellers)
sellerSchema.pre("save", function (next) {
  // Skip validation if this is a login update (only updating lastLogin)
  if (
    this.isModified("lastLogin") &&
    Object.keys(this.modifiedPaths()).length === 1
  ) {
    return next();
  }

  // Skip validation if this is a new seller (not yet verified)
  if (this.isNew) {
    return next();
  }

  // Only require payment methods for verified sellers who are active
  if (
    this.isVerified &&
    !this.isSuspended &&
    this.bankAccounts.length === 0 &&
    this.wallets.length === 0
  ) {
    next(
      new Error(
        "At least one bank account or wallet is required for verified sellers"
      )
    );
  }
  next();
});

// Validate unique account numbers across both bank accounts and wallets
sellerSchema.pre("save", async function (next) {
  try {
    // Skip validation if this is a login update (only updating lastLogin)
    if (
      this.isModified("lastLogin") &&
      Object.keys(this.modifiedPaths()).length === 1
    ) {
      return next();
    }

    const allAccountNumbers = [
      ...this.bankAccounts.map((acc) => acc.accountNumber),
      ...this.wallets.map((wallet) => wallet.accountNumber),
    ];

    // Skip validation if no account numbers
    if (allAccountNumbers.length === 0) {
      return next();
    }

    const uniqueAccountNumbers = new Set(allAccountNumbers);

    if (allAccountNumbers.length !== uniqueAccountNumbers.size) {
      return next(
        new Error("Account numbers must be unique across all payment methods")
      );
    }

    // Check for duplicates in database (for both new and existing sellers)
    const existingSeller = await this.constructor.findOne({
      _id: { $ne: this._id },
      $or: [
        { "bankAccounts.accountNumber": { $in: allAccountNumbers } },
        { "wallets.accountNumber": { $in: allAccountNumbers } },
      ],
    });

    if (existingSeller) {
      return next(
        new Error(
          "One or more account numbers are already in use by another seller"
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt timestamp before saving
sellerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add a bank account
sellerSchema.methods.addBankAccount = async function (bankAccount) {
  // Check if account number already exists in any payment method
  const existingAccount = await this.constructor.findOne({
    $or: [
      { "bankAccounts.accountNumber": bankAccount.accountNumber },
      { "wallets.accountNumber": bankAccount.accountNumber },
    ],
  });

  if (existingAccount) {
    throw new Error("Account number already exists in another payment method");
  }

  // If this is the first account or marked as default, unset other defaults
  if (bankAccount.isDefault || this.bankAccounts.length === 0) {
    await this.updateMany(
      { "bankAccounts.$[].isDefault": true },
      { $set: { "bankAccounts.$[].isDefault": false } }
    );
  }
  this.bankAccounts.push(bankAccount);
  return this.save();
};

// Method to add a wallet
sellerSchema.methods.addWallet = async function (wallet) {
  // Check if account number already exists in any payment method
  const existingAccount = await this.constructor.findOne({
    $or: [
      { "bankAccounts.accountNumber": wallet.accountNumber },
      { "wallets.accountNumber": wallet.accountNumber },
    ],
  });

  if (existingAccount) {
    throw new Error("Account number already exists in another payment method");
  }

  // If this is the first wallet or marked as default, unset other defaults
  if (wallet.isDefault || this.wallets.length === 0) {
    await this.updateMany(
      { "wallets.$[].isDefault": true },
      { $set: { "wallets.$[].isDefault": false } }
    );
  }
  this.wallets.push(wallet);
  return this.save();
};

// Method to set default bank account
sellerSchema.methods.setDefaultBankAccount = async function (accountId) {
  const account = this.bankAccounts.id(accountId);
  if (!account) {
    throw new Error("Bank account not found");
  }

  // Unset all defaults
  this.bankAccounts.forEach((acc) => (acc.isDefault = false));

  // Set new default
  account.isDefault = true;
  return this.save();
};

// Method to set default wallet
sellerSchema.methods.setDefaultWallet = async function (walletId) {
  const wallet = this.wallets.id(walletId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // Unset all defaults
  this.wallets.forEach((w) => (w.isDefault = false));

  // Set new default
  wallet.isDefault = true;
  return this.save();
};

// Method to remove bank account
sellerSchema.methods.removeBankAccount = async function (accountId) {
  const account = this.bankAccounts.id(accountId);
  if (!account) {
    throw new Error("Bank account not found");
  }

  // Check if this is the last payment method (only for verified sellers)
  if (
    this.isVerified &&
    !this.isSuspended &&
    this.bankAccounts.length === 1 &&
    this.wallets.length === 0
  ) {
    throw new Error(
      "Cannot remove the last payment method. At least one payment method is required for verified sellers."
    );
  }

  // If removing default account and there are other accounts, set a new default
  if (account.isDefault && this.bankAccounts.length > 1) {
    const nextAccount = this.bankAccounts.find(
      (acc) => acc._id.toString() !== accountId
    );
    if (nextAccount) {
      nextAccount.isDefault = true;
    }
  }

  this.bankAccounts.pull(accountId);
  return this.save();
};

// Method to remove wallet
sellerSchema.methods.removeWallet = async function (walletId) {
  const wallet = this.wallets.id(walletId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // Check if this is the last payment method (only for verified sellers)
  if (
    this.isVerified &&
    !this.isSuspended &&
    this.wallets.length === 1 &&
    this.bankAccounts.length === 0
  ) {
    throw new Error(
      "Cannot remove the last payment method. At least one payment method is required for verified sellers."
    );
  }

  // If removing default wallet and there are other wallets, set a new default
  if (wallet.isDefault && this.wallets.length > 1) {
    const nextWallet = this.wallets.find((w) => w._id.toString() !== walletId);
    if (nextWallet) {
      nextWallet.isDefault = true;
    }
  }

  this.wallets.pull(walletId);
  return this.save();
};

// Method to handle suspension
sellerSchema.methods.suspend = async function (suspensionId) {
  this.isSuspended = true;
  this.activeSuspension = suspensionId;
  this.suspensionHistory.push(suspensionId);
  return this.save();
};

// Method to lift suspension
sellerSchema.methods.liftSuspension = async function () {
  this.isSuspended = false;
  this.activeSuspension = null;
  return this.save();
};

// Method to check if seller is currently suspended
sellerSchema.methods.isCurrentlySuspended = async function () {
  if (!this.activeSuspension) return false;

  const suspension = await mongoose
    .model("Suspension")
    .findById(this.activeSuspension);
  if (!suspension || !suspension.isActive()) {
    await this.liftSuspension();
    return false;
  }

  return true;
};

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
