import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class ComplaintService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api/v1/complaints`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get all complaints (admin only)
  async getAllComplaints(params = {}) {
    try {
      const response = await this.api.get("/admin/all", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user complaints
  async getUserComplaints() {
    try {
      const response = await this.api.get("/user");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get single complaint
  async getComplaint(complaintId) {
    try {
      const response = await this.api.get(`/${complaintId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update complaint status (admin only)
  async updateComplaintStatus(complaintId, status, adminNotes = "") {
    try {
      const response = await this.api.patch(`/${complaintId}/status`, {
        status,
        adminNotes,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Submit new complaint
  async submitComplaint(complaintData) {
    try {
      const formData = new FormData();

      // Add text fields
      Object.keys(complaintData).forEach((key) => {
        if (key !== "attachments") {
          formData.append(key, complaintData[key]);
        }
      });

      // Add files if any
      if (complaintData.attachments) {
        complaintData.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const response = await this.api.post("/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data.message || "An error occurred",
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Network error
      return {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    } else {
      // Other error
      return {
        message: error.message || "An unexpected error occurred",
        status: 0,
      };
    }
  }
}

export default new ComplaintService();
