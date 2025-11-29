import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema(
  {
    // Core Relationships
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: [true, "Buyer ID is required"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller ID is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },

    // Customization Details
    name: {
      type: String,
      required: [true, "Customization name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Canvas and Design Data
    canvasData: {
      width: {
        type: Number,
        default: 800,
      },
      height: {
        type: Number,
        default: 600,
      },
      zoom: {
        type: Number,
        default: 1,
      },
      pan: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
      },
    },

    // Design Elements with Detailed Properties
    elements: [
      {
        // Unique Identifier
        elementId: {
          type: String,
          required: true,
        },

        // Element Type and Basic Properties
        type: {
          type: String,
          enum: ["text", "shape", "image"],
          required: true,
        },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },

        // Text-specific Properties
        text: String,
        fontSize: Number,
        fontFamily: String,
        color: String,
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false },
        align: {
          type: String,
          enum: ["left", "center", "right"],
          default: "left",
        },

        // Shape-specific Properties
        shapeType: {
          type: String,
          enum: [
            "rect",
            "circle",
            "triangle",
            "line",
            "star",
            "heart",
            "diamond",
            "hexagon",
            "oval",
            "arrow",
            "cross",
            "wave",
          ],
        },
        fillColor: String,
        strokeColor: String,
        strokeWidth: Number,
        fillType: {
          type: String,
          enum: ["filled", "transparent"],
          default: "filled",
        },

        // Image-specific Properties
        src: String,
        brightness: { type: Number, default: 100 },
        contrast: { type: Number, default: 100 },
        saturation: { type: Number, default: 100 },
        blur: { type: Number, default: 0 },
        sepia: { type: Number, default: 0 },
        grayscale: { type: Number, default: 0 },
        hueRotate: { type: Number, default: 0 },

        // Common Properties
        opacity: { type: Number, default: 1, min: 0, max: 1 },
        rotation: { type: Number, default: 0 },
        flipHorizontal: { type: Boolean, default: false },
        flipVertical: { type: Boolean, default: false },

        // Shadow Properties
        shadow: { type: Boolean, default: false },
        shadowColor: { type: String, default: "#000000" },
        shadowBlur: { type: Number, default: 2 },
        shadowOffsetX: { type: Number, default: 1 },
        shadowOffsetY: { type: Number, default: 1 },

        // Gradient Properties
        gradientEnabled: { type: Boolean, default: false },
        gradientType: {
          type: String,
          enum: ["linear", "radial"],
          default: "linear",
        },
        gradientStartColor: String,
        gradientEndColor: String,
        gradientAngle: { type: Number, default: 0 },

        // Text inside Shape Properties
        hasText: { type: Boolean, default: false },
        shapeText: String,
        shapeTextColor: String,
        shapeTextSize: Number,
        shapeTextFont: String,
        shapeTextBold: { type: Boolean, default: false },
        shapeTextItalic: { type: Boolean, default: false },

        // Print Quality
        printQuality: {
          type: String,
          enum: [
            "embroidery",
            "dtg",
            "sublimation",
            "screen",
            "plastisol",
            "htv",
          ],
          default: "dtg",
        },

        // Element Pricing
        elementPrice: {
          basePrice: { type: Number, default: 5 },
          printQualityMultiplier: { type: Number, default: 1 },
          complexityMultiplier: { type: Number, default: 1 },
          totalPrice: { type: Number, required: true },
        },

        // Selection State
        selected: { type: Boolean, default: false },

        // Timestamps
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // Libraries for Reusable Elements
    textLibrary: [
      {
        elementId: String,
        text: String,
        fontSize: Number,
        fontFamily: String,
        color: String,
        bold: Boolean,
        italic: Boolean,
        underline: Boolean,
        printQuality: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    shapeLibrary: [
      {
        elementId: String,
        shapeType: String,
        fillColor: String,
        strokeColor: String,
        strokeWidth: Number,
        opacity: Number,
        printQuality: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    imageLibrary: [
      {
        elementId: String,
        src: String,
        name: String,
        printQuality: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Pricing Structure
    pricing: {
      baseProductPrice: {
        type: Number,
        required: true,
        min: [0, "Base product price cannot be negative"],
      },
      customizationPrice: {
        type: Number,
        required: true,
        min: [0, "Customization price cannot be negative"],
      },
      totalPrice: {
        type: Number,
        required: true,
        min: [0, "Total price cannot be negative"],
      },
      currency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "CAD", "AUD"],
      },
    },

    // Design Status and Metadata
    status: {
      type: String,
      enum: [
        "draft",
        "saved",
        "ordered",
        "in_production",
        "completed",
        "cancelled",
      ],
      default: "draft",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],

    // Export and Rendering
    exportedImage: {
      type: String, // Base64 or file path
    },

    thumbnail: {
      type: String, // Base64 or file path for preview
    },

    // Version Control
    version: {
      type: Number,
      default: 1,
    },

    // History for Undo/Redo
    history: [
      {
        canvasData: String, // Base64 image data
        timestamp: { type: Date, default: Date.now },
        action: String,
      },
    ],

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for Performance
customizationSchema.index({ buyer: 1, createdAt: -1 });
customizationSchema.index({ seller: 1, createdAt: -1 });
customizationSchema.index({ product: 1, createdAt: -1 });
customizationSchema.index({ status: 1, createdAt: -1 });
customizationSchema.index({ "elements.elementId": 1 });

// Pre-save middleware to update timestamps and calculate pricing
customizationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Calculate total customization price from elements
  if (this.elements && this.elements.length > 0) {
    this.pricing.customizationPrice = this.elements.reduce((total, element) => {
      return total + (element.elementPrice?.totalPrice || 0);
    }, 0);

    // Calculate total price
    this.pricing.totalPrice =
      this.pricing.baseProductPrice + this.pricing.customizationPrice;
  }

  next();
});

// Virtual for element count
customizationSchema.virtual("elementCount").get(function () {
  return this.elements ? this.elements.length : 0;
});

// Virtual for library counts
customizationSchema.virtual("textLibraryCount").get(function () {
  return this.textLibrary ? this.textLibrary.length : 0;
});

customizationSchema.virtual("shapeLibraryCount").get(function () {
  return this.shapeLibrary ? this.shapeLibrary.length : 0;
});

customizationSchema.virtual("imageLibraryCount").get(function () {
  return this.imageLibrary ? this.imageLibrary.length : 0;
});

// Instance methods
customizationSchema.methods.calculateElementPrice = function (element) {
  const basePrice = 5;
  const printQualityMultipliers = {
    embroidery: 2.5,
    dtg: 1.0,
    sublimation: 1.8,
    screen: 1.2,
    plastisol: 1.5,
    htv: 1.3,
  };

  const complexityMultipliers = {
    text: 1.0,
    shape: 1.2,
    image: 1.5,
  };

  const printMultiplier = printQualityMultipliers[element.printQuality] || 1.0;
  const complexityMultiplier = complexityMultipliers[element.type] || 1.0;

  return {
    basePrice,
    printQualityMultiplier: printMultiplier,
    complexityMultiplier,
    totalPrice: basePrice * printMultiplier * complexityMultiplier,
  };
};

customizationSchema.methods.addElement = function (elementData) {
  const elementPrice = this.calculateElementPrice(elementData);
  const element = {
    ...elementData,
    elementId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    elementPrice,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  this.elements.push(element);
  return element;
};

customizationSchema.methods.removeElement = function (elementId) {
  this.elements = this.elements.filter((el) => el.elementId !== elementId);
};

customizationSchema.methods.updateElement = function (elementId, updates) {
  const elementIndex = this.elements.findIndex(
    (el) => el.elementId === elementId
  );
  if (elementIndex !== -1) {
    this.elements[elementIndex] = {
      ...this.elements[elementIndex],
      ...updates,
      updatedAt: new Date(),
    };

    // Recalculate price if needed
    if (updates.printQuality || updates.type) {
      this.elements[elementIndex].elementPrice = this.calculateElementPrice(
        this.elements[elementIndex]
      );
    }
  }
};

// Static methods
customizationSchema.statics.findByBuyer = function (buyerId) {
  return this.find({ buyer: buyerId })
    .populate("product seller")
    .sort({ createdAt: -1 });
};

customizationSchema.statics.findBySeller = function (sellerId) {
  return this.find({ seller: sellerId })
    .populate("product buyer")
    .sort({ createdAt: -1 });
};

customizationSchema.statics.findByProduct = function (productId) {
  return this.find({ product: productId })
    .populate("buyer seller")
    .sort({ createdAt: -1 });
};

export default mongoose.model("Customization", customizationSchema);
