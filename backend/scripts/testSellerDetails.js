import axios from "axios";

const API_URL = "http://localhost:5000";

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

// Test fetching seller details with valid data
const testSellerDetails = async (token, sellerId) => {
  try {
    console.log("\n=== Testing Seller Details (Valid) ===");
    const response = await axios.get(
      `${API_URL}/api/admin/users/${sellerId}/details?userType=seller`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Success:", response.data.success);
    console.log("Seller data:", response.data.data?.user);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
};

// Test with invalid ObjectId
const testInvalidObjectId = async (token) => {
  try {
    console.log("\n=== Testing Invalid ObjectId ===");
    const response = await axios.get(
      `${API_URL}/api/admin/users/invalid-id/details?userType=seller`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Response:", response.data);
  } catch (error) {
    console.log(
      "✅ Expected error for invalid ObjectId:",
      error.response?.data
    );
  }
};

// Test with missing userType
const testMissingUserType = async (token, sellerId) => {
  try {
    console.log("\n=== Testing Missing userType ===");
    const response = await axios.get(
      `${API_URL}/api/admin/users/${sellerId}/details`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Response:", response.data);
  } catch (error) {
    console.log(
      "✅ Expected error for missing userType:",
      error.response?.data
    );
  }
};

// Test with invalid userType
const testInvalidUserType = async (token, sellerId) => {
  try {
    console.log("\n=== Testing Invalid userType ===");
    const response = await axios.get(
      `${API_URL}/api/admin/users/${sellerId}/details?userType=invalid`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Response:", response.data);
  } catch (error) {
    console.log(
      "✅ Expected error for invalid userType:",
      error.response?.data
    );
  }
};

// Test fetching all sellers to get a seller ID
const testFetchSellers = async (token) => {
  try {
    console.log("\n=== Testing Fetch Sellers ===");
    const response = await axios.get(
      `${API_URL}/api/admin/sellers?page=1&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.success && response.data.data.sellers.length > 0) {
      const sellerId = response.data.data.sellers[0].id;
      console.log("✅ Found seller ID:", sellerId);
      return sellerId;
    } else {
      console.log("❌ No sellers found");
      return null;
    }
  } catch (error) {
    console.error(
      "❌ Fetch sellers error:",
      error.response?.data || error.message
    );
    return null;
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log("=== Seller Details API Tests ===");

    // Login as admin
    const token = await loginAdmin();
    console.log("✅ Admin login successful");

    // Get a seller ID
    const sellerId = await testFetchSellers(token);

    if (sellerId) {
      // Test valid seller details
      await testSellerDetails(token, sellerId);

      // Test error cases
      await testInvalidObjectId(token);
      await testMissingUserType(token, sellerId);
      await testInvalidUserType(token, sellerId);
    } else {
      console.log("⚠️ No sellers available for testing details");
    }

    console.log("\n=== All tests completed ===");
  } catch (error) {
    console.error("❌ Test execution failed:", error.message);
  }
};

// Run the tests
runTests();
