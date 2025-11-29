import OpenAI from "openai";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Buyer from "../models/Buyer.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for e-commerce assistant
const SYSTEM_PROMPT = `You are an AI assistant for an e-commerce platform specializing in customized apparel and products. 

Your role is to:
1. Help users find products through natural conversation
2. Answer questions about products, orders, and the platform
3. Perform actions on behalf of users (add to cart, search, etc.)
4. Provide design assistance and suggestions
5. Track orders and manage shopping cart

When users ask you to do something, use the available functions to perform the action automatically. Always confirm actions with the user before executing.

Be friendly, helpful, concise, and professional. Remember context from the conversation.`;

// Available functions/tools for the chatbot
const AVAILABLE_FUNCTIONS = {
  searchProducts: {
    name: "searchProducts",
    description:
      "Search for products by name, category, price range, or other filters",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for product name or description",
        },
        category: {
          type: "string",
          description: "Product category filter",
        },
        minPrice: {
          type: "number",
          description: "Minimum price filter",
        },
        maxPrice: {
          type: "number",
          description: "Maximum price filter",
        },
        gender: {
          type: "string",
          enum: ["male", "female", "unisex"],
          description: "Gender filter",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 10)",
        },
      },
    },
  },
  getProductDetails: {
    name: "getProductDetails",
    description: "Get detailed information about a specific product by ID",
    parameters: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "The ID of the product",
        },
      },
      required: ["productId"],
    },
  },
  addToCart: {
    name: "addToCart",
    description: "Add a product to the user's shopping cart",
    parameters: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "The ID of the product to add",
        },
        quantity: {
          type: "number",
          description: "Quantity to add (default: 1)",
        },
        color: {
          type: "string",
          description: "Color variant if applicable",
        },
        size: {
          type: "string",
          description: "Size variant if applicable",
        },
      },
      required: ["productId"],
    },
  },
  getCart: {
    name: "getCart",
    description: "Get the current contents of the user's shopping cart",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  updateCartItem: {
    name: "updateCartItem",
    description: "Update the quantity of an item in the cart",
    parameters: {
      type: "object",
      properties: {
        itemId: {
          type: "string",
          description: "The ID of the cart item to update",
        },
        quantity: {
          type: "number",
          description: "New quantity (must be > 0)",
        },
      },
      required: ["itemId", "quantity"],
    },
  },
  removeFromCart: {
    name: "removeFromCart",
    description: "Remove an item from the shopping cart",
    parameters: {
      type: "object",
      properties: {
        itemId: {
          type: "string",
          description: "The ID of the cart item to remove",
        },
      },
      required: ["itemId"],
    },
  },
  getUserOrders: {
    name: "getUserOrders",
    description: "Get the user's order history with optional status filter",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
          description: "Filter orders by status",
        },
        limit: {
          type: "number",
          description: "Maximum number of orders to return (default: 10)",
        },
      },
    },
  },
  getOrderDetails: {
    name: "getOrderDetails",
    description: "Get detailed information about a specific order",
    parameters: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "The ID of the order",
        },
      },
      required: ["orderId"],
    },
  },
};

// Function implementations
const functionImplementations = {
  searchProducts: async (args, userId) => {
    try {
      const { query, category, minPrice, maxPrice, gender, limit = 10 } = args;

      const searchQuery = { status: "approved", isActive: true };

      if (query) {
        searchQuery.$or = [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ];
      }

      if (category) searchQuery.category = category;
      if (gender) searchQuery.gender = gender;
      if (minPrice || maxPrice) {
        searchQuery.price = {};
        if (minPrice) searchQuery.price.$gte = minPrice;
        if (maxPrice) searchQuery.price.$lte = maxPrice;
      }

      const products = await Product.find(searchQuery)
        .select("name description price images category gender stock")
        .limit(limit)
        .lean();

      return {
        success: true,
        count: products.length,
        products: products.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.images?.[0] || null,
          category: p.category,
          gender: p.gender,
          stock: p.stock,
        })),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getProductDetails: async (args, userId) => {
    try {
      const { productId } = args;
      const product = await Product.findById(productId)
        .populate("seller", "fullName businessInfo.businessName")
        .lean();

      if (!product || product.status !== "approved" || !product.isActive) {
        return { success: false, error: "Product not found or unavailable" };
      }

      return {
        success: true,
        product: {
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          images: product.images || [],
          category: product.category,
          gender: product.gender,
          stock: product.stock,
          variants: product.variants || {},
          seller: product.seller
            ? {
                name:
                  product.seller.businessInfo?.businessName ||
                  product.seller.fullName,
              }
            : null,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  addToCart: async (args, userId) => {
    try {
      const { productId, quantity = 1, color, size } = args;

      const product = await Product.findOne({
        _id: productId,
        status: "approved",
        isActive: true,
      });

      if (!product) {
        return { success: false, error: "Product not found or unavailable" };
      }

      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
        cart = new Cart({
          user: userId,
          items: [
            {
              product: productId,
              quantity,
              color,
              size,
              price: product.price,
            },
          ],
        });
      } else {
        const existingItemIndex = cart.items.findIndex(
          (item) =>
            item.product.toString() === productId &&
            item.color === color &&
            item.size === size
        );

        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          cart.items.push({
            product: productId,
            quantity,
            color,
            size,
            price: product.price,
          });
        }
      }

      await cart.save();
      await cart.populate("items.product", "name images price");

      return {
        success: true,
        message: "Product added to cart successfully",
        cartItems: cart.items.length,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getCart: async (args, userId) => {
    try {
      const cart = await Cart.findOne({ user: userId })
        .populate("items.product", "name images price stock")
        .lean();

      if (!cart || !cart.items || cart.items.length === 0) {
        return {
          success: true,
          items: [],
          totalAmount: 0,
          message: "Cart is empty",
        };
      }

      const totalAmount = cart.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);

      return {
        success: true,
        items: cart.items.map((item) => ({
          id: item._id.toString(),
          product: {
            id: item.product._id.toString(),
            name: item.product.name,
            price: item.product.price,
            image: item.product.images?.[0] || null,
          },
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: item.price,
        })),
        totalAmount,
        itemCount: cart.items.length,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateCartItem: async (args, userId) => {
    try {
      const { itemId, quantity } = args;

      if (quantity <= 0) {
        return { success: false, error: "Quantity must be greater than 0" };
      }

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return { success: false, error: "Cart not found" };
      }

      const item = cart.items.id(itemId);
      if (!item) {
        return { success: false, error: "Item not found in cart" };
      }

      item.quantity = quantity;
      await cart.save();

      return { success: true, message: "Cart item updated successfully" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  removeFromCart: async (args, userId) => {
    try {
      const { itemId } = args;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return { success: false, error: "Cart not found" };
      }

      cart.items.pull(itemId);
      await cart.save();

      return { success: true, message: "Item removed from cart successfully" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getUserOrders: async (args, userId) => {
    try {
      const { status, limit = 10 } = args;

      const buyer = await Buyer.findById(userId);
      if (!buyer) {
        return { success: false, error: "Buyer not found" };
      }

      const query = { buyer: userId };
      if (status) query.status = status;

      const orders = await Order.find(query)
        .populate("items.product", "name images price")
        .populate("seller", "fullName businessInfo.businessName")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return {
        success: true,
        count: orders.length,
        orders: orders.map((order) => ({
          id: order._id.toString(),
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          items: order.items.map((item) => ({
            product: {
              name: item.product.name,
              price: item.product.price,
            },
            quantity: item.quantity,
          })),
        })),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getOrderDetails: async (args, userId) => {
    try {
      const { orderId } = args;

      const order = await Order.findById(orderId)
        .populate("items.product", "name images price")
        .populate("seller", "fullName businessInfo.businessName email")
        .lean();

      if (!order) {
        return { success: false, error: "Order not found" };
      }

      // Verify the order belongs to the user
      if (order.buyer.toString() !== userId) {
        return { success: false, error: "Unauthorized access to order" };
      }

      return {
        success: true,
        order: {
          id: order._id.toString(),
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          deliveryAddress: order.deliveryAddress,
          items: order.items.map((item) => ({
            product: {
              name: item.product.name,
              price: item.product.price,
              image: item.product.images?.[0] || null,
            },
            quantity: item.quantity,
            price: item.price,
          })),
          seller: order.seller
            ? {
                name:
                  order.seller.businessInfo?.businessName ||
                  order.seller.fullName,
              }
            : null,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Helper function to validate message input
const validateMessage = (message) => {
  if (!message || typeof message !== "string") {
    return { valid: false, error: "Message must be a non-empty string" };
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (trimmedMessage.length > 2000) {
    return { valid: false, error: "Message is too long (max 2000 characters)" };
  }

  return { valid: true, message: trimmedMessage };
};

// Helper function to validate history
const validateHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }

  // Filter valid history entries and limit to last 10
  const validHistory = history
    .filter((msg) => {
      return (
        msg &&
        typeof msg === "object" &&
        (msg.role === "user" || msg.role === "assistant") &&
        msg.content &&
        typeof msg.content === "string"
      );
    })
    .slice(-10); // Keep last 10 messages

  return validHistory;
};

// Main chatbot controller with optimized error handling
export const chatWithBot = async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, history = [] } = req.body;
    const userId = req.user?.id;

    // Validate message
    const messageValidation = validateMessage(message);
    if (!messageValidation.valid) {
      return res.status(400).json({
        success: false,
        message: messageValidation.error,
      });
    }

    const validatedMessage = messageValidation.message;

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return res.status(503).json({
        success: false,
        message:
          "Chatbot service is currently unavailable. Please try again later.",
      });
    }

    // Validate and sanitize history
    const validatedHistory = validateHistory(history);

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...validatedHistory,
      { role: "user", content: validatedMessage },
    ];

    // Prepare tools/functions for OpenAI
    const tools = Object.values(AVAILABLE_FUNCTIONS).map((func) => ({
      type: "function",
      function: func,
    }));

    // Call OpenAI API with timeout handling
    let completion;
    try {
      completion = await Promise.race([
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          tools,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 1000,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("OpenAI API timeout")), 30000)
        ),
      ]);
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);

      if (openaiError.message === "OpenAI API timeout") {
        return res.status(504).json({
          success: false,
          message: "Request timeout. Please try again with a shorter message.",
        });
      }

      if (openaiError.status === 401) {
        return res.status(503).json({
          success: false,
          message:
            "Chatbot service configuration error. Please contact support.",
        });
      }

      if (openaiError.status === 429) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please wait a moment and try again.",
        });
      }

      throw openaiError;
    }

    const assistantMessage = completion.choices[0].message;
    let responseContent = assistantMessage.content || "";
    const toolCalls = assistantMessage.tool_calls || [];

    // Execute function calls if any
    if (toolCalls.length > 0 && userId) {
      const toolResults = [];

      // Execute all tool calls in parallel for better performance
      const toolPromises = toolCalls.map(async (toolCall) => {
        const functionName = toolCall.function.name;

        try {
          const functionArgs = JSON.parse(toolCall.function.arguments);

          if (!functionImplementations[functionName]) {
            return {
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: JSON.stringify({
                success: false,
                error: `Function ${functionName} not implemented`,
              }),
            };
          }

          const result = await functionImplementations[functionName](
            functionArgs,
            userId
          );

          return {
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify(result),
          };
        } catch (error) {
          console.error(`Error executing function ${functionName}:`, error);
          return {
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify({
              success: false,
              error: error.message || "Function execution failed",
            }),
          };
        }
      });

      // Wait for all tool calls to complete
      const results = await Promise.all(toolPromises);
      toolResults.push(...results);

      // Get final response from OpenAI with tool results
      if (toolResults.length > 0) {
        try {
          const finalMessages = [...messages, assistantMessage, ...toolResults];

          const finalCompletion = await Promise.race([
            openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: finalMessages,
              tools,
              tool_choice: "auto",
              temperature: 0.7,
              max_tokens: 1000,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("OpenAI API timeout")), 30000)
            ),
          ]);

          responseContent =
            finalCompletion.choices[0].message.content || responseContent;
        } catch (finalError) {
          console.error("Error in final completion:", finalError);
          // Continue with initial response if final completion fails
          if (!responseContent) {
            responseContent =
              "I've completed the action, but couldn't generate a response. Please check the result.";
          }
        }
      }
    } else if (toolCalls.length > 0 && !userId) {
      responseContent =
        "Please log in to perform actions like adding items to cart or viewing orders.";
    }

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      response: responseContent,
      messageId: completion.id,
      processingTime: `${processingTime}ms`,
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = "Error processing chat message";

    if (error.name === "ValidationError") {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message?.includes("timeout")) {
      statusCode = 504;
      errorMessage = "Request timeout. Please try again.";
    } else if (error.status) {
      statusCode = error.status;
      errorMessage = error.message || "API error occurred";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Health check for chatbot
export const chatbotHealth = async (req, res) => {
  res.json({
    success: true,
    message: "Chatbot service is operational",
    hasApiKey: !!process.env.OPENAI_API_KEY,
  });
};
