import fetch from "node-fetch";

const API_URL = "http://localhost:5000/api/v1";

// Test data
const testDesign = {
  productId: "507f1f77bcf86cd799439011", // Mock product ID
  elements: [
    {
      id: 1,
      type: "text",
      text: "Test Text",
      x: 100,
      y: 100,
      fontSize: 24,
      fontFamily: "Arial",
      color: "#000000",
    },
  ],
  imageData:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  price: 99.99,
  name: "Test Custom Design",
};

// Test the design save endpoint
async function testDesignSave() {
  try {
    console.log("Testing design save endpoint...");

    const response = await fetch(`${API_URL}/design/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token", // This will fail auth, but we can test the endpoint exists
      },
      body: JSON.stringify(testDesign),
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);
  } catch (error) {
    console.error("Error testing design save:", error);
  }
}

// Test the health endpoint
async function testHealth() {
  try {
    console.log("Testing health endpoint...");

    const response = await fetch(`${API_URL.replace("/v1", "")}/health`);
    const data = await response.json();

    console.log("Health check response:", data);
  } catch (error) {
    console.error("Error testing health endpoint:", error);
  }
}

// Run tests
async function runTests() {
  console.log("Starting API tests...\n");

  await testHealth();
  console.log("\n---\n");

  await testDesignSave();

  console.log("\nTests completed!");
}

runTests();
