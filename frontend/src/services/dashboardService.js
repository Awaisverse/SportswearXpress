import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class DashboardService {
  async getDashboardStats() {
    try {
      console.log(
        "Fetching dashboard stats from:",
        `${API_URL}/api/v1/admin/dashboard/stats`
      );

      const response = await axios.get(
        `${API_URL}/api/v1/admin/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Dashboard stats response:", response.data);
      return response.data.stats;
    } catch (error) {
      console.error("Dashboard stats error:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      } else {
        throw new Error(
          error.response?.data?.message ||
            "Failed to fetch dashboard statistics"
        );
      }
    }
  }

  async getPendingProducts() {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/pending-products`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch pending products"
      );
    }
  }

  async getPendingSellers() {
    try {
      const response = await axios.get(`${API_URL}/api/admin/pending-sellers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch pending sellers"
      );
    }
  }

  async approveProduct(productId, action) {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/approve-product/${productId}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to process product approval"
      );
    }
  }

  async approveSeller(sellerId, action) {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/approve-seller/${sellerId}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to process seller approval"
      );
    }
  }

  async getBuyers(
    page = 1,
    limit = 10,
    searchQuery = "",
    statusFilter = "all"
  ) {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/buyers?page=${page}&limit=${limit}&search=${searchQuery}&status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch buyers"
      );
    }
  }

  async getSellers(
    page = 1,
    limit = 10,
    searchQuery = "",
    statusFilter = "all"
  ) {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/sellers?page=${page}&limit=${limit}&search=${searchQuery}&status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch sellers"
      );
    }
  }

  async updateUserStatus(
    userId,
    userType,
    status,
    reason = "",
    duration = null
  ) {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/${userType}s/${userId}/status`,
        {
          status,
          reason,
          duration,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update user status"
      );
    }
  }

  async getUserDetails(userId, userType) {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/${userType}s/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user details"
      );
    }
  }

  // Fetch recent activities for admin dashboard
  async getRecentActivities() {
    const token = localStorage.getItem("token");
    const response = await axios.get("/admin/activities/recent", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}

export default new DashboardService();
