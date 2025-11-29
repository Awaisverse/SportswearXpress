export const API = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  VERSION: "v1",
};

export const DASHBOARD = {
  REFRESH_INTERVAL: 30000, // 30 seconds
};

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING: "pending",
};

export const ERROR_MESSAGES = {
  AUTH_TOKEN_MISSING: "Authentication token missing",
  FETCH_ERROR: "Failed to fetch data",
  NETWORK_ERROR: "Network error occurred",
  LOGIN_FAILED: "Login failed. Please check your credentials.",
  REGISTRATION_FAILED: "Registration failed. Please try again.",
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_SUSPENDED: "Your account has been suspended",
  SERVER_ERROR: "Server error occurred. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again",
  UNAUTHORIZED: "You are not authorized to perform this action",
  SESSION_EXPIRED: "Your session has expired. Please login again",
};
