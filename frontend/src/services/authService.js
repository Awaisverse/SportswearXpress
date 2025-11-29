import { API, ERROR_MESSAGES } from "../config/constants";

class AuthService {
  getToken() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error(ERROR_MESSAGES.AUTH_TOKEN_MISSING);
    }
    return token;
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.getToken()}`,
      "Content-Type": "application/json",
    };
  }

  async fetchWithAuth(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || ERROR_MESSAGES.FETCH_ERROR);
      }

      return await response.json();
    } catch (error) {
      console.error("Auth service error:", error);
      throw error;
    }
  }

  async login(email, password, role) {
    try {
      const response = await fetch(`${API.BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || ERROR_MESSAGES.LOGIN_FAILED);
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API.BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || ERROR_MESSAGES.REGISTRATION_FAILED
        );
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}

export default new AuthService();
