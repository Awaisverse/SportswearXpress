import mongoose from "mongoose";

const suspensionSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    suspendedAt: {
      type: Date,
      default: Date.now,
    },
    suspendedUntil: {
      type: Date,
      required: true,
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    complaints: [
      {
        type: {
          type: String,
          required: true,
          enum: ["customer", "system", "other"],
        },
        description: {
          type: String,
          required: true,
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "resolved", "dismissed"],
          default: "pending",
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "lifted"],
      default: "active",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient querying
suspensionSchema.index({ seller: 1, status: 1 });
suspensionSchema.index({ suspendedUntil: 1 });

// Method to check if suspension is active
suspensionSchema.methods.isActive = function () {
  return this.status === "active" && this.suspendedUntil > new Date();
};

// Method to lift suspension
suspensionSchema.methods.liftSuspension = async function () {
  this.status = "lifted";
  await this.save();

  // Update seller's suspension status
  await mongoose.model("Seller").findOneAndUpdate(
    { _id: this.seller },
    {
      $set: { isSuspended: false },
      $unset: { activeSuspension: 1 },
    }
  );
};

// Method to add a complaint
suspensionSchema.methods.addComplaint = function (complaint) {
  this.complaints.push(complaint);
  return this.save();
};

// Pre-save middleware to handle suspension status
suspensionSchema.pre("save", function (next) {
  if (this.suspendedUntil < new Date() && this.status === "active") {
    this.status = "expired";
  }
  next();
});

const Suspension = mongoose.model("Suspension", suspensionSchema);

export default Suspension;
