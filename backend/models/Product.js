import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters long"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
      default: "",
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      max: [1000000, "Price cannot exceed 1,000,000"],
      default: 0,
    },
    gender: {
      type: String,
      required: [true, "Gender specification is required"],
      enum: {
        values: ["male", "female", "unisex"],
        message: "Gender must be either male, female, or unisex",
      },
      default: "unisex",
    },
    sportType: {
      type: String,
      required: [true, "Sport type is required"],
      enum: {
        values: [
          "gym",
          "running",
          "yoga",
          "basketball",
          "football",
          "tennis",
          "swimming",
          "cycling",
          "cricket",
          "boxing",
          "martial_arts",
          "casual_sports",
          "other",
        ],
      },
      default: "gym",
    },
    wearType: {
      type: String,
      required: [true, "Wear type is required"],
      enum: {
        values: [
          "gym_wear",
          "casual_sports",
          "performance",
          "compression",
          "training",
          "competition",
          "recovery",
        ],
      },
      default: "gym_wear",
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: {
        values: [
          "tops",
          "bottoms",
          "shorts",
          "sports_bras",
          "jackets",
          "hoodies",
          "leggings",
          "socks",
          "shoes",
          "accessories",
        ],
      },
      default: "tops",
    },
    material: {
      type: String,
      required: [true, "Material specification is required"],
      enum: {
        values: [
          "polyester",
          "nylon",
          "spandex",
          "cotton",
          "lycra",
          "mesh",
          "dri_fit",
          "compression",
          "thermal",
          "hybrid",
        ],
      },
      default: "polyester",
    },
    quality: {
      type: String,
      required: [true, "Quality specification is required"],
      enum: {
        values: ["premium", "standard", "economy"],
      },
      default: "standard",
    },
    features: {
      type: [String],
      default: [],
      validate: {
        validator: function (features) {
          const validFeatures = [
            "moisture_wicking",
            "quick_dry",
            "breathable",
            "anti_odor",
            "uv_protection",
            "compression",
            "thermal_regulation",
            "water_resistant",
            "reflective",
            "padded",
          ];
          return features.every((feature) => validFeatures.includes(feature));
        },
        message: "Invalid feature(s) provided",
      },
    },
    specifications: {
      fit: {
        type: String,
        required: [true, "Fit specification is required"],
        enum: ["regular", "slim", "loose", "compression"],
        default: "regular",
      },
      weight: {
        type: String,
        required: [true, "Weight specification is required"],
        default: "0g",
      },
      care: {
        type: String,
        required: [true, "Care instructions are required"],
        default: "Machine wash cold, tumble dry low",
      },
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: [0, "Sold count cannot be negative"],
      validate: {
        validator: function (v) {
          return Number.isInteger(v) && v >= 0;
        },
        message: "Sold count must be a non-negative integer",
      },
    },
    images: {
      type: [String],
      default: [],
      validate: [
        {
          validator: function (images) {
            return images.length > 0;
          },
          message: "At least one product image is required",
        },
        {
          validator: function (images) {
            return images.length <= 6;
          },
          message: "Maximum 6 images allowed",
        },
      ],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller ID is required"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: function (v) {
          return v >= 0 && v <= 5 && Number.isFinite(v);
        },
        message: "Rating must be a number between 0 and 5",
      },
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, "Number of reviews cannot be negative"],
      validate: {
        validator: function (v) {
          return Number.isInteger(v) && v >= 0;
        },
        message: "Number of reviews must be a non-negative integer",
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Buyer",
          required: [true, "Review must be associated with a buyer"],
          validate: {
            validator: function (v) {
              return mongoose.Types.ObjectId.isValid(v);
            },
            message: "Invalid buyer ID",
          },
        },
        name: {
          type: String,
          required: [true, "Reviewer name is required"],
          trim: true,
          minlength: [2, "Reviewer name must be at least 2 characters long"],
          maxlength: [50, "Reviewer name cannot exceed 50 characters"],
        },
        rating: {
          type: Number,
          required: [true, "Rating is required"],
          min: [1, "Rating must be at least 1"],
          max: [5, "Rating cannot exceed 5"],
          validate: {
            validator: function (v) {
              return Number.isInteger(v) && v >= 1 && v <= 5;
            },
            message: "Rating must be an integer between 1 and 5",
          },
        },
        comment: {
          type: String,
          required: [true, "Review comment is required"],
          trim: true,
          minlength: [10, "Review comment must be at least 10 characters long"],
          maxlength: [500, "Review comment cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
          validate: {
            validator: function (v) {
              return v instanceof Date && !isNaN(v);
            },
            message: "Invalid date",
          },
        },
      },
    ],
    variants: {
      colors: {
        type: [String],
        default: [],
        validate: {
          validator: function (colors) {
            return colors.length > 0;
          },
          message: "At least one color variant is required",
        },
      },
      sizes: {
        type: [String],
        default: [],
        validate: {
          validator: function (sizes) {
            return sizes.length > 0;
          },
          message: "At least one size variant is required",
        },
      },
      stockByVariant: {
        type: [
          {
            color: String,
            size: String,
            stock: {
              type: Number,
              min: [0, "Stock cannot be negative"],
              default: 0,
            },
          },
        ],
        default: [],
        validate: {
          validator: function (stockByVariant) {
            return (
              stockByVariant.length > 0 &&
              stockByVariant.some((variant) => variant.stock > 0)
            );
          },
          message: "At least one variant must have stock",
        },
      },
    },
    customization: {
      enabled: {
        type: Boolean,
        default: false,
      },
    },
    shipping: {
      weight: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return !v || /^\d+(\.\d+)?\s*(g|kg|oz|lb)$/i.test(v);
          },
          message:
            "Weight must be in format: number followed by unit (g, kg, oz, lb)",
        },
      },
      dimensions: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return !v || /^\d+x\d+x\d+\s*(cm|in)$/i.test(v);
          },
          message:
            "Dimensions must be in format: LxWxH followed by unit (cm or in)",
        },
      },
      freeShipping: {
        type: Boolean,
        default: false,
      },
      shippingCost: {
        type: Number,
        min: [0, "Shipping cost cannot be negative"],
        default: 0,
        validate: {
          validator: function (v) {
            return Number.isFinite(v) && v >= 0;
          },
          message: "Shipping cost must be a valid non-negative number",
        },
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return v.length >= 2 && v.length <= 30;
          },
          message: "Tags must be between 2 and 30 characters long",
        },
      },
    ],
    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
      default: 0,
      validate: {
        validator: function (v) {
          return Number.isFinite(v) && v >= 0 && v <= 100;
        },
        message: "Discount must be a number between 0 and 100",
      },
    },
    discountEndDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || (v instanceof Date && !isNaN(v) && v > new Date());
        },
        message: "Discount end date must be a valid future date",
      },
    },
    complaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better search performance
productSchema.index({
  name: "text",
  description: "text",
  category: "text",
  sportType: "text",
  wearType: "text",
});

// Method to check if product is in stock
productSchema.methods.isInStock = function (color, size) {
  if (!color && !size) {
    return this.stock > 0;
  }

  const variant = this.variants.stockByVariant.find(
    (v) => v.color === color && v.size === size
  );

  return variant ? variant.stock > 0 : false;
};

// Method to update stock and sold count
productSchema.methods.updateStock = function (
  quantity,
  color,
  size,
  isCustomized = false
) {
  if (!color && !size) {
    this.stock -= quantity;
    this.soldCount += quantity;
    if (isCustomized) {
      this.customization.customizationsSold += quantity;
    }
  } else {
    const variant = this.variants.stockByVariant.find(
      (v) => v.color === color && v.size === size
    );
    if (variant) {
      variant.stock -= quantity;
      variant.soldCount += quantity;
      this.soldCount += quantity;
      if (isCustomized) {
        this.customization.customizationsSold += quantity;
      }
    }
  }
  return this.save();
};

// Method to update customization stats
productSchema.methods.updateCustomizationStats = function (selectedOptions) {
  if (!this.customization.enabled) return this;

  selectedOptions.forEach((option) => {
    let stat = this.customization.customizationStats.find(
      (s) => s.optionName === option.name && s.optionType === option.type
    );

    if (stat) {
      stat.timesSelected += 1;
      stat.lastSelected = new Date();
    } else {
      this.customization.customizationStats.push({
        optionName: option.name,
        optionType: option.type,
        timesSelected: 1,
        lastSelected: new Date(),
      });
    }
  });

  return this.save();
};

// Method to get sales statistics
productSchema.methods.getSalesStats = function () {
  return {
    totalSold: this.soldCount,
    totalSales: this.soldCount * this.price,
    averagePrice: this.price,
    stockRemaining: this.stock,
    customizationStats: {
      totalCustomizedSold: this.customization.customizationsSold,
      customizationPercentage:
        this.soldCount > 0
          ? (this.customization.customizationsSold / this.soldCount) * 100
          : 0,
      popularOptions: this.customization.customizationStats
        .sort((a, b) => b.timesSelected - a.timesSelected)
        .slice(0, 5),
    },
    variantStats: this.variants.stockByVariant.map((variant) => ({
      color: variant.color,
      size: variant.size,
      sold: variant.soldCount,
      remaining: variant.stock,
    })),
  };
};

// Static method to find products by category
productSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true, status: "approved" });
};

// Static method to find products by sport type
productSchema.statics.findBySportType = function (sportType) {
  return this.find({ sportType, isActive: true, status: "approved" });
};

// Static method to find products by wear type
productSchema.statics.findByWearType = function (wearType) {
  return this.find({ wearType, isActive: true, status: "approved" });
};

// Static method to find products by gender
productSchema.statics.findByGender = function (gender) {
  return this.find({ gender, isActive: true, status: "approved" });
};

// Static method to find products by seller
productSchema.statics.findBySeller = function (sellerId) {
  return this.find({ seller: sellerId });
};

// Static method to find products on sale
productSchema.statics.findOnSale = function () {
  return this.find({
    discount: { $gt: 0 },
    discountEndDate: { $gt: new Date() },
    isActive: true,
    status: "approved",
  });
};

// Static method to find best selling products
productSchema.statics.findBestSelling = function (limit = 10) {
  return this.find({ isActive: true, status: "approved" })
    .sort({ soldCount: -1 })
    .limit(limit);
};

// Static method to find best selling customizations
productSchema.statics.findBestSellingCustomizations = function (limit = 10) {
  return this.find({
    "customization.enabled": true,
    "customization.customizationsSold": { $gt: 0 },
    isActive: true,
    status: "approved",
  })
    .sort({ "customization.customizationsSold": -1 })
    .limit(limit);
};

// Static method to get customization trends
productSchema.statics.getCustomizationTrends = function (days = 30) {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);

  return this.aggregate([
    {
      $match: {
        "customization.enabled": true,
        "customization.customizationStats.lastSelected": { $gte: dateLimit },
      },
    },
    {
      $unwind: "$customization.customizationStats",
    },
    {
      $group: {
        _id: {
          optionName: "$customization.customizationStats.optionName",
          optionType: "$customization.customizationStats.optionType",
        },
        totalSelections: {
          $sum: "$customization.customizationStats.timesSelected",
        },
        uniqueProducts: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        _id: 0,
        optionName: "$_id.optionName",
        optionType: "$_id.optionType",
        totalSelections: 1,
        productCount: { $size: "$uniqueProducts" },
      },
    },
    {
      $sort: { totalSelections: -1 },
    },
    {
      $limit: 10,
    },
  ]);
};

const Product = mongoose.model("Product", productSchema);
export default Product;
