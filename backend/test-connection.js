import fetch from "node-fetch";

const testBackend = async () => {
  try {
    console.log("Testing backend connection...");

    // Test basic connection
    const response = await fetch("http://localhost:5000/api/test");
    const data = await response.json();
    console.log("Test endpoint response:", data);

    // Test products endpoint (should return 401 without auth)
    const productsResponse = await fetch("http://localhost:5000/api/products");
    console.log("Products endpoint status:", productsResponse.status);

    console.log("Backend is running and responding!");
  } catch (error) {
    console.error("Backend test failed:", error.message);
  }
};

testBackend();
