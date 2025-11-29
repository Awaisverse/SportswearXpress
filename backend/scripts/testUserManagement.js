import axios from "axios";

const API_URL = "http://localhost:5000";

// Check if admin exists
const checkAdminExists = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/check`);
    return response.data.exists;
  } catch (error) {
    console.error(
      "Check admin exists error:",
      error.response?.data || error.message
    );
    return false;
  }
};

// Register admin
const registerAdmin = async () => {
  try {
    console.log("Registering admin...");
    const response = await axios.post(`${API_URL}/api/admin/register`, {
      fullName: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      phoneNumber: "1234567890",
    });

    console.log("Admin registration response:", response.data);
    return response.data.token;
  } catch (error) {
    console.error(
      "Admin registration error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Test admin login to get token
const loginAdmin = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/admin/login`, {
      email: "admin@example.com",
      password: "admin123",
    });

    if (response.data.success) {
      return response.data.token;
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    console.error("Admin login error:", error.response?.data || error.message);
    throw error;
  }
};

// Test fetching buyers
const testFetchBuyers = async (token) => {
  try {
    console.log("\n=== Testing Fetch Buyers ===");
    const response = await axios.get(
      `${API_URL}/api/admin/buyers?page=1&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Buyers response:", response.data);
    console.log("Success:", response.data.success);
    console.log("Buyers count:", response.data.data?.buyers?.length || 0);
    console.log("Pagination:", response.data.data?.pagination);
  } catch (error) {
    console.error("Fetch buyers error:", error.response?.data || error.message);
  }
};

// Test fetching sellers
const testFetchSellers = async (token) => {
  try {
    console.log("\n=== Testing Fetch Sellers ===");
    const response = await axios.get(
      `${API_URL}/api/admin/sellers?page=1&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Sellers response:", response.data);
    console.log("Success:", response.data.success);
    console.log("Sellers count:", response.data.data?.sellers?.length || 0);
    console.log("Pagination:", response.data.data?.pagination);
  } catch (error) {
    console.error(
      "Fetch sellers error:",
      error.response?.data || error.message
    );
  }
};

// Test user stats
const testUserStats = async (token) => {
  try {
    console.log("\n=== Testing User Stats ===");
    const response = await axios.get(`${API_URL}/api/admin/users/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("User stats response:", response.data);
    console.log("Success:", response.data.success);
    console.log("Stats:", response.data.data);
  } catch (error) {
    console.error("User stats error:", error.response?.data || error.message);
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log("=== User Management API Tests ===");

    // Check if admin exists
    const adminExists = await checkAdminExists();
    console.log("Admin exists:", adminExists);

    let token;
    if (!adminExists) {
      // Register admin if it doesn't exist
      token = await registerAdmin();
      console.log("Admin registered successfully");
    } else {
      // Login as admin
      token = await loginAdmin();
      console.log("Admin login successful");
    }

    console.log("Token obtained:", token ? "Yes" : "No");

    // Run tests
    await testFetchBuyers(token);
    await testFetchSellers(token);
    await testUserStats(token);

    console.log("\n=== All tests completed ===");
  } catch (error) {
    console.error("Test execution failed:", error.message);
  }
};

// Run the tests
runTests();
