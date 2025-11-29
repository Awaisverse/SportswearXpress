import Order from "../models/Order.js";
import Buyer from "../models/Buyer.js";
import Seller from "../models/Seller.js";
import Product from "../models/Product.js";
import Admin from "../models/Admin.js";

// Helper function to update product stock
const updateProductStock = async (items) => {
  console.log("Updating product stock for order items...");
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      console.error(`Product not found: ${item.product}`);
      continue;
    }

    console.log(`=== Processing product: ${product.name} ===`);
    console.log(`Order quantity: ${item.quantity}`);
    console.log(`Initial product stock: ${product.stock}`);
    console.log(`Initial variants:`, product.variants.stockByVariant);

    // If item has variant (color and size), update stockByVariant
    if (item.variant && item.variant.color && item.variant.size) {
      const variantIndex = product.variants.stockByVariant.findIndex(
        (variant) =>
          variant.color === item.variant.color &&
          variant.size === item.variant.size
      );

      if (variantIndex !== -1) {
        const currentStock =
          product.variants.stockByVariant[variantIndex].stock;
        const newStock = Math.max(0, currentStock - item.quantity);

        product.variants.stockByVariant[variantIndex].stock = newStock;
        console.log(
          `Updated stock for variant ${item.variant.color}/${item.variant.size}: ${currentStock} -> ${newStock}`
        );

        // Recalculate overall product stock from all variants
        const totalVariantStock = product.variants.stockByVariant.reduce(
          (total, variant) => total + variant.stock,
          0
        );
        const oldProductStock = product.stock;
        product.stock = totalVariantStock;
        console.log(
          `Recalculated overall product stock: ${oldProductStock} -> ${totalVariantStock}`
        );
        console.log(`Stock reduction: ${oldProductStock - totalVariantStock}`);
      } else {
        console.error(
          `Variant not found: ${item.variant.color}/${item.variant.size} for product ${product.name}`
        );
      }
    } else {
      // If no variant, update the main stock
      const currentStock = product.stock;
      const newStock = Math.max(0, currentStock - item.quantity);

      product.stock = newStock;
      console.log(
        `Updated main stock for product ${product.name}: ${currentStock} -> ${newStock}`
      );
    }

    // Update sold count
    product.soldCount += item.quantity;

    await product.save();
    console.log(`Final product stock after save: ${product.stock}`);
    console.log(`Stock updated successfully for product: ${product.name}`);
    console.log(`=== End processing product: ${product.name} ===`);
  }
  console.log("All product stock updates completed successfully");
};

// Helper function to restore product stock when order is cancelled
const restoreProductStock = async (items) => {
  console.log("Restoring product stock for cancelled order items...");
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      console.error(`Product not found: ${item.product}`);
      continue;
    }

    // If item has variant (color and size), restore stockByVariant
    if (item.variant && item.variant.color && item.variant.size) {
      const variantIndex = product.variants.stockByVariant.findIndex(
        (variant) =>
          variant.color === item.variant.color &&
          variant.size === item.variant.size
      );

      if (variantIndex !== -1) {
        const currentStock =
          product.variants.stockByVariant[variantIndex].stock;
        const newStock = currentStock + item.quantity;

        product.variants.stockByVariant[variantIndex].stock = newStock;
        console.log(
          `Restored stock for variant ${item.variant.color}/${item.variant.size}: ${currentStock} -> ${newStock}`
        );

        // Recalculate overall product stock from all variants
        const totalVariantStock = product.variants.stockByVariant.reduce(
          (total, variant) => total + variant.stock,
          0
        );
        product.stock = totalVariantStock;
        console.log(`Recalculated overall product stock: ${totalVariantStock}`);
      } else {
        console.error(
          `Variant not found: ${item.variant.color}/${item.variant.size} for product ${product.name}`
        );
      }
    } else {
      // If no variant, restore the main stock
      const currentStock = product.stock;
      const newStock = currentStock + item.quantity;

      product.stock = newStock;
      console.log(
        `Restored main stock for product ${product.name}: ${currentStock} -> ${newStock}`
      );
    }

    // Reduce sold count
    product.soldCount = Math.max(0, product.soldCount - item.quantity);

    await product.save();
    console.log(`Stock restored successfully for product: ${product.name}`);
  }
  console.log("All product stock restorations completed successfully");
};

// Utility function to update admin revenue
const updateAdminRevenue = async (amount, operation = "add") => {
  try {
    const admin = await Admin.findOne();
    if (!admin) {
      console.error("No admin found for revenue update");
      return;
    }

    if (operation === "add") {
      admin.revenue = (admin.revenue || 0) + amount;
    } else if (operation === "subtract") {
      admin.revenue = Math.max(0, (admin.revenue || 0) - amount);
    }

    await admin.save();
    console.log(
      `Admin revenue ${
        operation === "add" ? "increased" : "decreased"
      } by ${amount}. New total: ${admin.revenue}`
    );
  } catch (error) {
    console.error("Error updating admin revenue:", error);
  }
};

// Create a new order with payment information
export const createOrder = async (req, res) => {
  try {
    console.log("=== Order Creation Started ===");
    console.log("Request headers:", req.headers);
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Request body:", {
      ...req.body,
      paymentScreenshot: req.file ? "File uploaded" : "No file",
    });
    console.log("User ID:", req.user.id);
    console.log("Files:", req.files);
    console.log("File:", req.file);

    // Validate that we have the required fields
    const {
      sellerId,
      items,
      shippingAddress,
      billingAddress,
      totalAmount,
      subtotal,
      paidToBankAccount,
      paidToWallet,
      paymentMethod,
    } = req.body;

    // Check if required fields are present
    if (
      !sellerId ||
      !items ||
      !shippingAddress ||
      !billingAddress ||
      !totalAmount ||
      !subtotal
    ) {
      console.log("Missing required fields:", {
        sellerId,
        items: !!items,
        shippingAddress: !!shippingAddress,
        billingAddress: !!billingAddress,
        totalAmount,
        subtotal,
      });
      return res.status(400).json({
        message: "Missing required fields",
        received: {
          sellerId,
          hasItems: !!items,
          hasShippingAddress: !!shippingAddress,
          hasBillingAddress: !!billingAddress,
          totalAmount,
          subtotal,
        },
      });
    }

    const buyerId = req.user.id;
    let paymentScreenshot = "no-screenshot.jpg";

    if (req.file) {
      paymentScreenshot = req.file.path;
      console.log("Payment screenshot uploaded:", paymentScreenshot);
    } else if (req.files && req.files.paymentScreenshot) {
      paymentScreenshot =
        req.files.paymentScreenshot.path ||
        req.files.paymentScreenshot.tempFilePath;
      console.log("Payment screenshot from files:", paymentScreenshot);
    } else {
      console.log("No payment screenshot provided, using default");
    }

    // Validate that at least one payment method is specified
    if (!paidToBankAccount && !paidToWallet) {
      console.log("Payment method validation failed");
      return res.status(400).json({
        message: "Must specify either bank account or wallet payment",
      });
    }

    // Validate items data
    let parsedItems;
    try {
      parsedItems = typeof items === "string" ? JSON.parse(items) : items;
    } catch (error) {
      console.log("Items parsing error:", error);
      return res.status(400).json({ message: "Invalid items data format" });
    }

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      console.log("Items array validation failed");
      return res
        .status(400)
        .json({ message: "Items array is required and cannot be empty" });
    }

    // Enhanced item validation
    for (const item of parsedItems) {
      if (!item.product || !item.quantity || !item.price) {
        console.log("Item validation failed:", item);
        return res.status(400).json({
          message: "Each item must have product, quantity, and price",
        });
      }
      if (item.quantity < 1) {
        console.log("Invalid quantity:", item.quantity);
        return res
          .status(400)
          .json({ message: "Item quantity must be at least 1" });
      }
      if (item.price < 0) {
        console.log("Invalid price:", item.price);
        return res
          .status(400)
          .json({ message: "Item price cannot be negative" });
      }

      // Check product stock availability
      const product = await Product.findById(item.product);
      if (!product) {
        console.log("Product not found:", item.product);
        return res.status(404).json({
          message: `Product with ID ${item.product} not found`,
        });
      }

      // Check stock based on variant or main stock
      let availableStock = 0;
      if (item.variant && item.variant.color && item.variant.size) {
        const variant = product.variants.stockByVariant.find(
          (v) => v.color === item.variant.color && v.size === item.variant.size
        );
        availableStock = variant ? variant.stock : 0;
      } else {
        availableStock = product.stock;
      }

      if (availableStock < item.quantity) {
        console.log(
          `Insufficient stock for product ${product.name}: requested ${item.quantity}, available ${availableStock}`
        );
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Validate addresses
    let parsedShippingAddress, parsedBillingAddress;
    try {
      parsedShippingAddress =
        typeof shippingAddress === "string"
          ? JSON.parse(shippingAddress)
          : shippingAddress;
      parsedBillingAddress =
        typeof billingAddress === "string"
          ? JSON.parse(billingAddress)
          : billingAddress;
    } catch (error) {
      console.log("Address parsing error:", error);
      return res.status(400).json({ message: "Invalid address data format" });
    }

    const requiredAddressFields = [
      "street",
      "city",
      "state",
      "country",
      "zipCode",
      "phone",
    ];

    for (const field of requiredAddressFields) {
      if (!parsedShippingAddress[field]?.trim()) {
        console.log("Missing shipping address field:", field);
        return res.status(400).json({
          message: `Missing required shipping address field: ${field}`,
        });
      }
      if (!parsedBillingAddress[field]?.trim()) {
        console.log("Missing billing address field:", field);
        return res.status(400).json({
          message: `Missing required billing address field: ${field}`,
        });
      }
    }

    // Validate amounts
    const calculatedSubtotal = parsedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = 10; // Fixed shipping cost
    const calculatedTotal = calculatedSubtotal + shippingCost;

    if (Math.abs(calculatedSubtotal - parseFloat(subtotal)) > 0.01) {
      console.log("Subtotal mismatch:", calculatedSubtotal, subtotal);
      return res.status(400).json({ message: "Subtotal calculation mismatch" });
    }

    if (Math.abs(calculatedTotal - parseFloat(totalAmount)) > 0.01) {
      console.log("Total amount mismatch:", calculatedTotal, totalAmount);
      return res
        .status(400)
        .json({ message: "Total amount calculation mismatch" });
    }

    console.log("All validations passed, creating order...");

    // Create order with enhanced payment information
    const orderData = {
      buyer: buyerId,
      seller: sellerId,
      items: parsedItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant || {},
        name: item.name,
        images: item.images || [],
      })),
      totalAmount: calculatedTotal,
      subtotal: calculatedSubtotal,
      shippingAddress: {
        ...parsedShippingAddress,
        additionalInfo: parsedShippingAddress.additionalInfo || "",
      },
      billingAddress: {
        ...parsedBillingAddress,
        additionalInfo: parsedBillingAddress.additionalInfo || "",
      },
      paymentScreenshot,
      paidToBankAccount: paidToBankAccount || "",
      paidToWallet: paidToWallet || "",
      paymentConfirmed: false,
      paymentInfo: {
        method:
          paymentMethod ||
          (paidToBankAccount ? "bank_transfer" : "wallet_transfer"),
        status: "pending",
        paymentDate: new Date(),
      },
      status: "pending",
      shippingInfo: {
        method: "standard",
        cost: shippingCost,
        status: "pending",
      },
      timeline: [
        {
          status: "pending",
          date: new Date(),
          note: "Order placed successfully",
        },
      ],
    };

    console.log("Creating order with data:", {
      ...orderData,
      items: orderData.items.length,
      buyer: orderData.buyer,
      seller: orderData.seller,
    });

    console.log("About to create order in database...");
    let order;
    try {
      console.log("Calling Order.create()...");
      order = await Order.create(orderData);
      console.log("Order.create() completed successfully");
      console.log("Order created successfully:", order.orderNumber);
    } catch (createError) {
      console.error("=== Order Creation Database Error ===");
      console.error("Error name:", createError.name);
      console.error("Error message:", createError.message);
      console.error("Error code:", createError.code);
      console.error("Error errors:", createError.errors);
      console.error("Error stack:", createError.stack);
      console.error("=== End of Database Error ===");

      // Return specific validation errors if available
      if (createError.name === "ValidationError") {
        const validationErrors = Object.values(createError.errors).map(
          (err) => err.message
        );
        return res.status(400).json({
          message: "Validation error",
          errors: validationErrors,
        });
      }

      throw createError; // Re-throw to be caught by outer catch block
    }

    // Update buyer's orders array
    try {
      await Buyer.findByIdAndUpdate(buyerId, {
        $push: { orders: order._id },
      });
      console.log("Buyer orders array updated successfully");
    } catch (buyerUpdateError) {
      console.error("Error updating buyer orders:", buyerUpdateError);
      // Don't fail the order creation if buyer update fails
    }

    // Update seller's orders array
    try {
      await Seller.findByIdAndUpdate(sellerId, {
        $push: { orders: order._id },
      });
      console.log("Seller orders array updated successfully");
    } catch (sellerUpdateError) {
      console.error("Error updating seller orders:", sellerUpdateError);
      // Don't fail the order creation if seller update fails
    }

    // Update product stock
    try {
      await updateProductStock(parsedItems);
    } catch (stockUpdateError) {
      console.error("Error updating product stock:", stockUpdateError);
      // Don't fail the order creation if stock update fails, but log the error
    }

    // Update seller's total stock
    try {
      const seller = await Seller.findById(sellerId);
      if (seller) {
        // Calculate total quantity ordered in this order
        const totalOrdered = parsedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        seller.totalStock = Math.max(
          0,
          (seller.totalStock || 0) - totalOrdered
        );
        await seller.save();
        console.log("Seller total stock updated:", seller.totalStock);
      }
    } catch (err) {
      console.error("Error updating seller total stock:", err);
    }

    // Populate references for response
    await order.populate([
      { path: "buyer", select: "fullName email" },
      { path: "seller", select: "fullName email businessInfo.businessName" },
      { path: "items.product", select: "name price images" },
    ]);

    console.log("=== Order Creation Completed Successfully ===");

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order: {
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          buyer: order.buyer,
          seller: order.seller,
          items: order.items,
        },
      },
    });
  } catch (error) {
    console.error("=== Order Creation Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== End of Error ===");

    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get pending payments for admin
export const getPendingPayments = async (req, res) => {
  try {
    const orders = await Order.find({
      paymentConfirmed: false,
      status: "pending",
    }).populate([
      { path: "buyer", select: "fullName email" },
      { path: "seller", select: "fullName email businessInfo.businessName" },
      { path: "items.product", select: "name price images" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Pending payments retrieved successfully",
      data: { orders },
    });
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Approve payment by admin
export const approvePayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentConfirmed) {
      return res.status(400).json({ message: "Payment already confirmed" });
    }

    // Update payment confirmation and order status
    order.paymentConfirmed = true;
    order.status = "placed";
    order.paymentInfo.status = "completed";
    order.paymentInfo.paymentDate = new Date();

    // Add to timeline
    order.timeline.push({
      status: "placed",
      date: new Date(),
      note: "Payment approved by admin",
    });

    await order.save();

    // Populate references for response
    await order.populate([
      { path: "buyer", select: "fullName email" },
      { path: "seller", select: "fullName email businessInfo.businessName" },
      { path: "items.product", select: "name price images" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Payment approved successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error approving payment:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get buyer's orders
export const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const buyer = await Buyer.findById(buyerId).populate({
      path: "orders",
      populate: [
        { path: "seller", select: "fullName email businessInfo.businessName" },
        { path: "items.product", select: "name price images" },
      ],
      options: { sort: { createdAt: -1 } },
    });

    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Buyer orders retrieved successfully",
      data: { orders: buyer.orders },
    });
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get seller's orders
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Get seller to verify they exist
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Get orders for this seller, excluding cancelled and pending orders
    const orders = await Order.find({
      seller: sellerId,
      status: { $nin: ["cancelled", "pending"] }, // Exclude cancelled and pending orders
    })
      .populate("buyer", "fullName email")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Seller orders retrieved successfully",
      data: { orders },
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId).populate([
      { path: "buyer", select: "fullName email" },
      { path: "seller", select: "fullName email businessInfo.businessName" },
      { path: "items.product", select: "name price images" },
    ]);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has access to this order
    if (
      order.buyer._id.toString() !== userId &&
      order.seller._id.toString() !== userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has permission to update this order
    if (order.seller.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const previousStatus = order.status;

    // Update order status
    order.status = status;

    // Add to timeline
    order.timeline.push({
      status,
      date: new Date(),
      note: note || "",
      updatedBy: userId,
    });

    // Handle admin revenue changes
    if (status === "confirmed" && previousStatus !== "confirmed") {
      // Add to admin revenue when order is confirmed
      try {
        await updateAdminRevenue(order.totalAmount, "add");
        console.log(
          `Admin revenue increased by ${order.totalAmount} for confirmed order`
        );
      } catch (revenueError) {
        console.error("Error updating admin revenue:", revenueError);
        // Don't fail the status update if revenue update fails
      }
    } else if (status === "cancelled" && previousStatus === "confirmed") {
      // Subtract from admin revenue when confirmed order is cancelled
      try {
        await updateAdminRevenue(order.totalAmount, "subtract");
        console.log(
          `Admin revenue decreased by ${order.totalAmount} for cancelled confirmed order`
        );
      } catch (revenueError) {
        console.error("Error updating admin revenue:", revenueError);
        // Don't fail the status update if revenue update fails
      }
    }

    // If order is being cancelled, restore the product stock
    if (status === "cancelled" && previousStatus !== "cancelled") {
      try {
        await restoreProductStock(order.items);
        console.log("Product stock restored for cancelled order");
      } catch (stockRestoreError) {
        console.error("Error restoring product stock:", stockRestoreError);
        // Don't fail the status update if stock restoration fails
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Cancel order (buyer only)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order
    if (order.buyer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own orders",
      });
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    const previousStatus = order.status;

    // Update order status to cancelled
    order.status = "cancelled";

    // Add to timeline
    order.timeline.push({
      status: "cancelled",
      date: new Date(),
      note: "Order cancelled by buyer",
      updatedBy: userId,
    });

    // If order was confirmed, subtract from admin revenue
    if (previousStatus === "confirmed") {
      try {
        await updateAdminRevenue(order.totalAmount, "subtract");
        console.log(
          `Admin revenue decreased by ${order.totalAmount} for cancelled confirmed order`
        );
      } catch (revenueError) {
        console.error("Error updating admin revenue:", revenueError);
        // Don't fail the cancellation if revenue update fails
      }
    }

    // Restore the product stock
    if (previousStatus !== "cancelled") {
      try {
        await restoreProductStock(order.items);
        console.log("Product stock restored for cancelled order");
      } catch (stockRestoreError) {
        console.error("Error restoring product stock:", stockRestoreError);
        // Don't fail the cancellation if stock restoration fails
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === "buyer") {
      const buyer = await Buyer.findById(userId);
      if (!buyer) {
        return res.status(404).json({ message: "Buyer not found" });
      }

      const totalOrders = buyer.orders.length;
      const pendingOrders = await Order.countDocuments({
        buyer: userId,
        status: "pending",
      });
      const completedOrders = await Order.countDocuments({
        buyer: userId,
        status: "delivered",
      });

      stats = {
        totalOrders,
        pendingOrders,
        completedOrders,
      };
    } else if (userRole === "seller") {
      const seller = await Seller.findById(userId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const totalOrders = seller.orders.length;
      const pendingOrders = await Order.countDocuments({
        seller: userId,
        status: "pending",
      });
      const completedOrders = await Order.countDocuments({
        seller: userId,
        status: "delivered",
      });

      stats = {
        totalOrders,
        pendingOrders,
        completedOrders,
      };
    }

    return res.status(200).json({
      success: true,
      message: "Order statistics retrieved successfully",
      data: { stats },
    });
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update order delivery information and status
export const updateOrderDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, shippingInfo } = req.body;
    const userId = req.user.id;

    console.log("=== Update Order Delivery ===");
    console.log("Order ID:", orderId);
    console.log("New Status:", status);
    console.log("Shipping Info:", shippingInfo);
    console.log("User ID:", userId);

    const order = await Order.findById(orderId).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Current order status:", order.status);

    // Check if user has permission to update this order
    if (order.seller.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Only allow updates for confirmed, processing, or shipped orders
    if (!["confirmed", "processing", "shipped"].includes(order.status)) {
      return res.status(400).json({
        message:
          "Only confirmed, processing, and shipped orders can be updated for delivery",
      });
    }

    // If status is the same, just update shipping info
    if (status === order.status) {
      console.log("Status unchanged, updating shipping info only");

      // Update shipping information
      if (shippingInfo) {
        order.shippingInfo = {
          ...order.shippingInfo,
          ...shippingInfo,
        };
      }

      await order.save();

      // Populate references for response
      await order.populate([
        { path: "buyer", select: "fullName email" },
        { path: "seller", select: "fullName email businessInfo.businessName" },
        { path: "items.product", select: "name price images" },
      ]);

      return res.status(200).json({
        success: true,
        message: "Shipping information updated successfully",
        data: { order },
      });
    }

    // Validate status transitions
    const validTransitions = {
      confirmed: ["processing", "shipped"],
      processing: ["shipped"],
      shipped: ["delivered", "returned"],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from ${order.status} to ${status}`,
      });
    }

    const previousStatus = order.status;

    // Update order status
    order.status = status;

    // Update shipping information
    if (shippingInfo) {
      order.shippingInfo = {
        ...order.shippingInfo,
        ...shippingInfo,
        status: status,
      };
    }

    // Prepare timeline entry
    const timelineEntry = {
      status,
      date: new Date(),
      note:
        status === "processing"
          ? "Order set to processing"
          : status === "shipped"
          ? `Order shipped via ${
              shippingInfo?.carrier || "carrier"
            } - Tracking: ${shippingInfo?.trackingNumber || "N/A"}`
          : status === "delivered"
          ? "Order delivered successfully"
          : status === "returned"
          ? "Order returned by buyer"
          : "Order status updated",
      updatedBy: userId,
    };

    // Update order using findByIdAndUpdate to avoid pre-save hook conflicts
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: status,
          shippingInfo: shippingInfo
            ? {
                ...order.shippingInfo,
                ...shippingInfo,
                status: status,
              }
            : order.shippingInfo,
        },
        $push: {
          timeline: timelineEntry,
        },
      },
      { new: true }
    ).populate([
      { path: "buyer", select: "fullName email" },
      { path: "seller", select: "fullName email businessInfo.businessName" },
      { path: "items.product", select: "name price images" },
    ]);

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found after update" });
    }

    console.log("Order updated successfully to status:", status);

    return res.status(200).json({
      success: true,
      message: "Order delivery information updated successfully",
      data: { order: updatedOrder },
    });
  } catch (error) {
    console.error("Error updating order delivery:", error);
    console.error("Error stack:", error.stack);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Test order creation without file upload
export const testOrderCreation = async (req, res) => {
  try {
    console.log("=== Testing Order Creation ===");
    console.log("Request body:", req.body);
    console.log("User:", req.user);

    const testOrderData = {
      buyer: req.user.id,
      seller: req.body.sellerId || "6851b80c252999f74abbba3f",
      items: [
        {
          product: "test-product-id",
          quantity: 1,
          price: 100,
          name: "Test Product",
          images: [],
        },
      ],
      totalAmount: 110,
      subtotal: 100,
      shippingAddress: {
        street: "Test Street",
        city: "Test City",
        state: "Test State",
        country: "Test Country",
        zipCode: "12345",
        phone: "1234567890",
        additionalInfo: "",
      },
      billingAddress: {
        street: "Test Street",
        city: "Test City",
        state: "Test State",
        country: "Test Country",
        zipCode: "12345",
        phone: "1234567890",
        additionalInfo: "",
      },
      paymentScreenshot: "test-screenshot.jpg",
      paidToBankAccount: "test-bank",
      paidToWallet: "",
      paymentInfo: {
        method: "bank_transfer",
        status: "pending",
        paymentDate: new Date(),
      },
      status: "pending",
      shippingInfo: {
        method: "standard",
        cost: 10,
        status: "pending",
      },
      timeline: [
        {
          status: "pending",
          date: new Date(),
          note: "Test order created",
        },
      ],
    };

    console.log("Creating test order with data:", testOrderData);

    const order = await Order.create(testOrderData);
    console.log("Test order created successfully:", order.orderNumber);

    return res.status(201).json({
      success: true,
      message: "Test order created successfully",
      data: { order },
    });
  } catch (error) {
    console.error("=== Test Order Creation Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== End of Test Error ===");

    return res.status(500).json({
      message: "Test order creation failed",
      error: error.message,
    });
  }
};
