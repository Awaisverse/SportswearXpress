import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // Customization fields
  isCustomized: {
    type: Boolean,
    default: false,
  },
  customization: {
    elements: [
      {
        elementId: String,
        type: {
          type: String,
          enum: ["text", "shape", "image"],
        },
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        // Text properties
        text: String,
        fontSize: Number,
        fontFamily: String,
        color: String,
        bold: Boolean,
        italic: Boolean,
        underline: Boolean,
        align: String,
        // Shape properties
        shapeType: String,
        fillColor: String,
        strokeColor: String,
        strokeWidth: Number,
        fillType: String,
        // Image properties
        src: String,
        brightness: Number,
        contrast: Number,
        saturation: Number,
        blur: Number,
        sepia: Number,
        grayscale: Number,
        hueRotate: Number,
        // Common properties
        opacity: Number,
        rotation: Number,
        flipHorizontal: Boolean,
        flipVertical: Boolean,
        // Shadow properties
        shadow: Boolean,
        shadowColor: String,
        shadowBlur: Number,
        shadowOffsetX: Number,
        shadowOffsetY: Number,
        // Gradient properties
        gradientEnabled: Boolean,
        gradientType: String,
        gradientStartColor: String,
        gradientEndColor: String,
        gradientAngle: Number,
        // Text inside shape properties
        hasText: Boolean,
        shapeText: String,
        shapeTextColor: String,
        shapeTextSize: Number,
        shapeTextFont: String,
        shapeTextBold: Boolean,
        shapeTextItalic: Boolean,
        // Print quality - individual for each element
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
        },
      },
    ],
    customizationPrice: Number,
    totalPrice: Number,
    printQualityBreakdown: [
      {
        elementId: String,
        elementType: String,
        printQuality: String,
        elementPrice: Number,
        printQualityName: String,
      },
    ],
    imageData: String, // Base64 image data
    libraries: {
      textLibrary: [Object],
      shapeLibrary: [Object],
      imageLibrary: [Object],
    },
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
cartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
