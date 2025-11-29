import Product from "../models/Product.js";
import Seller from "../models/Seller.js";

// Create a new product
export const createProduct = async (req, res) => {
  console.log("=== CREATE PRODUCT ENDPOINT HIT ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  console.log("User from middleware:", req.user);

  try {
    console.log("Received product creation request:", {
      body: req.body,
      user: req.user,
      files: req.files,
    });

    // Validate user
    if (!req.user || !req.user.id) {
      console.error("No user found in request");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    let productData;
    try {
      // Parse the productData if it's a string
      productData =
        typeof req.body.productData === "string"
          ? JSON.parse(req.body.productData)
          : req.body.productData;

      console.log("Parsed product data:", productData);
    } catch (parseError) {
      console.error("Error parsing product data:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid product data format",
        error: parseError.message,
      });
    }

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "price",
      "gender",
      "sportType",
      "wearType",
      "category",
      "material",
      "quality",
    ];
    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        fields: missingFields,
      });
    }

    // Validate seller exists
    const seller = await Seller.findById(req.user.id);
    if (!seller) {
      console.error("Seller not found:", req.user.id);
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Handle images
    let images = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      images = files.map((file) => file.tempFilePath);
    } else if (productData.images && productData.images.length > 0) {
      images = productData.images;
    }

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    // Validate variants
    if (
      !productData.variants ||
      !productData.variants.colors ||
      productData.variants.colors.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one color variant is required",
      });
    }

    if (
      !productData.variants.sizes ||
      productData.variants.sizes.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one size variant is required",
      });
    }

    if (
      !productData.variants.stockByVariant ||
      productData.variants.stockByVariant.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one variant must have stock",
      });
    }

    // Create new product with seller information
    const product = new Product({
      ...productData,
      images,
      seller: req.user.id,
      status: "pending",
    });

    // Validate product before saving
    const validationError = product.validateSync();
    if (validationError) {
      console.error("Validation error details:", validationError);
      const errorMessages = {};

      if (validationError.errors) {
        Object.keys(validationError.errors).forEach((key) => {
          errorMessages[key] = validationError.errors[key].message;
        });
      }

      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        errors: errorMessages,
        details: validationError.message,
      });
    }

    // Save product
    console.log("Saving product...");
    await product.save();
    console.log("Product saved successfully");

    // Add product to seller's products array
    console.log("Updating seller's products array...");
    seller.products.push(product._id);
    await seller.save();
    console.log("Seller updated successfully");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "approved",
      isActive: true,
    })
      .populate("seller", "fullName businessInfo.businessName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "fullName businessInfo.businessName"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    console.log("Update product request received:", {
      params: req.params,
      body: req.body,
      files: req.files,
    });

    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log("Product not found:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the seller owns this product
    if (product.seller.toString() !== req.user.id) {
      console.log("Unauthorized update attempt:", {
        productSeller: product.seller.toString(),
        requestUser: req.user.id,
      });
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    // Parse the productData if it's a string
    let productData;
    try {
      productData =
        typeof req.body.productData === "string"
          ? JSON.parse(req.body.productData)
          : req.body.productData;

      if (!productData) {
        throw new Error("No product data provided");
      }

      console.log("Parsed product data:", productData);
    } catch (parseError) {
      console.error("Error parsing product data:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid product data format",
        error: parseError.message,
      });
    }

    // Handle image updates
    let images = product.images;
    if (req.files && req.files.length > 0) {
      // Add new images
      const newImages = req.files.map((file) => file.path);
      images = [...images, ...newImages];
      console.log("New images added:", newImages);
    }

    // Handle removed images
    if (req.body.removedImages) {
      try {
        const removedImages = JSON.parse(req.body.removedImages);
        images = images.filter((img) => !removedImages.includes(img));
        console.log("Removed images:", removedImages);
      } catch (error) {
        console.error("Error processing removed images:", error);
        return res.status(400).json({
          success: false,
          message: "Invalid removed images format",
          error: error.message,
        });
      }
    }

    // Prepare update data
    const updateData = {
      ...productData,
      images,
      status: "pending", // Reset status to pending on update
    };

    // Only update variants and stock if variants are provided
    if (productData.variants) {
      // Validate variants if provided
      if (
        !productData.variants.colors ||
        !productData.variants.sizes ||
        !productData.variants.stockByVariant
      ) {
        console.error("Invalid variants data:", productData.variants);
        return res.status(400).json({
          success: false,
          message: "Invalid variants data",
        });
      }

      // Calculate total stock from variants
      const totalStock = productData.variants.stockByVariant.reduce(
        (sum, variant) => sum + (parseInt(variant.stock) || 0),
        0
      );

      console.log("Calculated total stock:", totalStock);
      updateData.stock = totalStock;

      // Update seller's total stock if needed
      const seller = await Seller.findById(req.user.id);
      if (seller) {
        // Calculate the difference in stock
        const oldTotalStock = product.stock;
        const newTotalStock = totalStock;
        const stockDifference = newTotalStock - oldTotalStock;

        // Update seller's total stock
        seller.totalStock = (seller.totalStock || 0) + stockDifference;
        await seller.save();
        console.log("Updated seller's total stock:", {
          sellerId: seller._id,
          oldStock: oldTotalStock,
          newStock: newTotalStock,
          difference: stockDifference,
        });
      }
    } else {
      // If no variants provided, keep existing stock
      updateData.stock = product.stock;
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      console.error("Failed to update product:", req.params.id);
      return res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }

    console.log("Product updated successfully:", updatedProduct._id);
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the seller owns this product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    // Remove product from seller's products array
    await Seller.findByIdAndUpdate(req.user.id, {
      $pull: { products: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// Update product status
export const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const productId = req.params.id;

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the seller owns this product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    // Update the status
    product.status = status;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product status",
      error: error.message,
    });
  }
};
