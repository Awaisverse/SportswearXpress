export const DASHBOARD = {
  RECENT_USERS_LIMIT: 5,
  REFRESH_INTERVAL: 30000, // 30 seconds
};

export const API = {
  BASE_URL: process.env.API_BASE_URL || "http://localhost:5000",
  VERSION: "v1",
};

export const ERROR_MESSAGES = {
  DASHBOARD_STATS: "Failed to fetch dashboard statistics",
  AUTHENTICATION: "Authentication failed",
  AUTHORIZATION: "Not authorized to access this resource",
};
