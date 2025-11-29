import Customization from "../models/Customization.js";
import Product from "../models/Product.js";
import Buyer from "../models/Buyer.js";
import Seller from "../models/Seller.js";
import { asyncHandler } from "../utils/error.js";
import { ApiError } from "../utils/error.js";
import { ApiResponse } from "../utils/error.js";

// Create a new customization
const createCustomization = asyncHandler(async (req, res) => {
  const { buyerId, productId, name, description, elements, canvasData } =
    req.body;

  // Validate required fields
  if (!buyerId || !productId || !name) {
    throw new ApiError(400, "Buyer ID, Product ID, and name are required");
  }

  // Check if buyer exists
  const buyer = await Buyer.findById(buyerId);
  if (!buyer) {
    throw new ApiError(404, "Buyer not found");
  }

  // Check if product exists and get seller info
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if seller exists
  const seller = await Seller.findById(product.seller);
  if (!seller) {
    throw new ApiError(404, "Seller not found");
  }

  // Calculate element prices
  const elementsWithPricing = elements.map((element) => {
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

    const printMultiplier =
      printQualityMultipliers[element.printQuality] || 1.0;
    const complexityMultiplier = complexityMultipliers[element.type] || 1.0;

    return {
      ...element,
      elementId:
        Date.now().toString() + Math.random().toString(36).substr(2, 9),
      elementPrice: {
        basePrice,
        printQualityMultiplier: printMultiplier,
        complexityMultiplier,
        totalPrice: basePrice * printMultiplier * complexityMultiplier,
      },
    };
  });

  // Calculate total pricing
  const customizationPrice = elementsWithPricing.reduce((total, element) => {
    return total + element.elementPrice.totalPrice;
  }, 0);

  const totalPrice = product.price + customizationPrice;

  // Create customization
  const customization = await Customization.create({
    buyer: buyerId,
    seller: product.seller,
    product: productId,
    name,
    description,
    elements: elementsWithPricing,
    canvasData: canvasData || {
      width: 800,
      height: 600,
      zoom: 1,
      pan: { x: 0, y: 0 },
    },
    pricing: {
      baseProductPrice: product.price,
      customizationPrice,
      totalPrice,
      currency: "USD",
    },
  });

  // Populate references
  await customization.populate(["buyer", "seller", "product"]);

  return res
    .status(201)
    .json(
      new ApiResponse(201, customization, "Customization created successfully")
    );
});

// Get all customizations for a buyer
const getBuyerCustomizations = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  const query = { buyer: buyerId };
  if (status) {
    query.status = status;
  }

  const customizations = await Customization.find(query)
    .populate(["product", "seller"])
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await Customization.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        customizations,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
      "Customizations retrieved successfully"
    )
  );
});

// Get all customizations for a seller
const getSellerCustomizations = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  const query = { seller: sellerId };
  if (status) {
    query.status = status;
  }

  const customizations = await Customization.find(query)
    .populate(["product", "buyer"])
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await Customization.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        customizations,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
      "Customizations retrieved successfully"
    )
  );
});

// Get a single customization by ID
const getCustomizationById = asyncHandler(async (req, res) => {
  const { customizationId } = req.params;

  const customization = await Customization.findById(customizationId).populate([
    "buyer",
    "seller",
    "product",
  ]);

  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        customization,
        "Customization retrieved successfully"
      )
    );
});

// Update a customization
const updateCustomization = asyncHandler(async (req, res) => {
  const { customizationId } = req.params;
  const { name, description, elements, canvasData, status } = req.body;

  const customization = await Customization.findById(customizationId);
  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  // Update fields
  if (name) customization.name = name;
  if (description) customization.description = description;
  if (canvasData) customization.canvasData = canvasData;
  if (status) customization.status = status;

  // Update elements if provided
  if (elements) {
    const elementsWithPricing = elements.map((element) => {
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

      const printMultiplier =
        printQualityMultipliers[element.printQuality] || 1.0;
      const complexityMultiplier = complexityMultipliers[element.type] || 1.0;

      return {
        ...element,
        elementId:
          element.elementId ||
          Date.now().toString() + Math.random().toString(36).substr(2, 9),
        elementPrice: {
          basePrice,
          printQualityMultiplier: printMultiplier,
          complexityMultiplier,
          totalPrice: basePrice * printMultiplier * complexityMultiplier,
        },
      };
    });

    customization.elements = elementsWithPricing;
  }

  await customization.save();
  await customization.populate(["buyer", "seller", "product"]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, customization, "Customization updated successfully")
    );
});

// Delete a customization
const deleteCustomization = asyncHandler(async (req, res) => {
  const { customizationId } = req.params;

  const customization = await Customization.findByIdAndDelete(customizationId);
  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Customization deleted successfully"));
});

// Add element to customization
const addElement = asyncHandler(async (req, res) => {
  const { customizationId } = req.params;
  const elementData = req.body;

  const customization = await Customization.findById(customizationId);
  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  const newElement = customization.addElement(elementData);
  await customization.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { element: newElement, customization },
        "Element added successfully"
      )
    );
});

// Update element in customization
const updateElement = asyncHandler(async (req, res) => {
  const { customizationId, elementId } = req.params;
  const updates = req.body;

  const customization = await Customization.findById(customizationId);
  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  customization.updateElement(elementId, updates);
  await customization.save();

  return res
    .status(200)
    .json(new ApiResponse(200, customization, "Element updated successfully"));
});

// Remove element from customization
const removeElement = asyncHandler(async (req, res) => {
  const { customizationId, elementId } = req.params;

  const customization = await Customization.findById(customizationId);
  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  customization.removeElement(elementId);
  await customization.save();

  return res
    .status(200)
    .json(new ApiResponse(200, customization, "Element removed successfully"));
});

// Add to text library
const addToTextLibrary = asyncHandler(async (req, res) => {
  const { customizationId } = req.params;
  const textData = req.body;

  const customization = await Customization.findById(customizationId);
  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  const textItem = {
    elementId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...textData,
    createdAt: new Date(),
  };

  customization.textLibrary.push(textItem);
  await customization.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { textItem, customization },
        "Text added to library successfully"
      )
    );
});

// Add to shape library
const addToShapeLibrary = asyncHandler(async (req, res) => {
  const { customizationId } = req.params;
  const shapeData = req.body;

  const customization = await Customization.findById(customizationId);
  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  const shapeItem = {
    elementId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...shapeData,
    createdAt: new Date(),
  };

  customization.shapeLibrary.push(shapeItem);
  await customization.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { shapeItem, customization },
        "Shape added to library successfully"
      )
    );
});

// Add to image library
const addToImageLibrary = asyncHandler(async (req, res) => {
  const { customizationId } = req.params;
  const imageData = req.body;

  const customization = await Customization.findById(customizationId);
  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  const imageItem = {
    elementId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...imageData,
    createdAt: new Date(),
  };

  customization.imageLibrary.push(imageItem);
  await customization.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { imageItem, customization },
        "Image added to library successfully"
      )
    );
});

// Get customization statistics
const getCustomizationStats = asyncHandler(async (req, res) => {
  const { buyerId, sellerId } = req.query;

  let query = {};
  if (buyerId) query.buyer = buyerId;
  if (sellerId) query.seller = sellerId;

  const stats = await Customization.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalCustomizations: { $sum: 1 },
        totalRevenue: { $sum: "$pricing.totalPrice" },
        averagePrice: { $avg: "$pricing.totalPrice" },
        statusCounts: {
          $push: "$status",
        },
      },
    },
  ]);

  const statusBreakdown = await Customization.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: stats[0] || {
          totalCustomizations: 0,
          totalRevenue: 0,
          averagePrice: 0,
        },
        statusBreakdown,
      },
      "Statistics retrieved successfully"
    )
  );
});

// Export customization as image
const exportCustomization = asyncHandler(async (req, res) => {
  const { customizationId } = req.params;
  const { format = "png", quality = 0.9 } = req.query;

  const customization = await Customization.findById(customizationId);
  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  // Here you would implement the actual image generation logic
  // For now, we'll just update the exported image field
  customization.exportedImage = `customization_${customizationId}_${Date.now()}.${format}`;
  await customization.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        exportedImage: customization.exportedImage,
        format,
        quality,
      },
      "Customization exported successfully"
    )
  );
});

export {
  createCustomization,
  getBuyerCustomizations,
  getSellerCustomizations,
  getCustomizationById,
  updateCustomization,
  deleteCustomization,
  addElement,
  updateElement,
  removeElement,
  addToTextLibrary,
  addToShapeLibrary,
  addToImageLibrary,
  getCustomizationStats,
  exportCustomization,
};
