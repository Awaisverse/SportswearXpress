// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/api/v1/products`,
  AUTH: `${API_BASE_URL}/api/v1/auth`,
  SELLER: `${API_BASE_URL}/api/v1/seller`,
  BUYER: `${API_BASE_URL}/api/v1/buyer`,
  ADMIN: `${API_BASE_URL}/api/v1/admin`,
  CART: `${API_BASE_URL}/api/v1/cart`,
  ORDER: `${API_BASE_URL}/api/v1/order`,
  CHATBOT: `${API_BASE_URL}/api/v1/chatbot`,
  CHATGPT: `${API_BASE_URL}/api/chatgpt`, // Legacy endpoint compatibility
};
