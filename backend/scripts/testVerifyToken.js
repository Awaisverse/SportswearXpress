import axios from "axios";

const API_URL = "http://localhost:5000";

const testVerifyToken = async () => {
  try {
    console.log("Testing token verification...");

    // First, login to get a token
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: "akram46@gmail.com",
      password: "admin123", // Replace with actual password
      role: "admin",
    });

    console.log("Login successful");
    console.log("User from login:", loginResponse.data.user);
    console.log("User role from login:", loginResponse.data.user.role);

    const token = loginResponse.data.token;

    // Now test token verification
    const verifyResponse = await axios.get(`${API_URL}/api/auth/verify-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Token verification response:", verifyResponse.data);
    console.log("Verified user:", verifyResponse.data.user);
    console.log("Verified user role:", verifyResponse.data.user?.role);
  } catch (error) {
    console.error("Test failed:", error.response?.data || error.message);
  }
};

testVerifyToken();
