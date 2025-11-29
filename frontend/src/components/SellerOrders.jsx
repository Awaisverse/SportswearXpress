import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      
      console.log("=== Fetching Seller Orders ===");
      console.log("API_URL:", API_URL);
      console.log("Token exists:", !!token);
      
      if (!token) {
        Swal.fire("Error", "Please login to view your orders", "error");
        return;
      }

      // First check if backend is running
      try {
        console.log("Checking backend health...");
        const healthResponse = await axios.get(`${API_URL}/api/health`, { timeout: 3000 });
        console.log("Backend health check successful:", healthResponse.data);
      } catch (healthError) {
        console.error("Backend health check failed:", healthError);
        Swal.fire("Server Error", "Backend server is not running. Please start the server and try again.", "error");
        setLoading(false);
        return;
      }

      console.log("Making request to:", `${API_URL}/api/v1/order/seller`);
      const response = await axios.get(`${API_URL}/api/v1/order/seller`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log("Seller orders response:", response.data);
      
      if (response.data.success) {
        console.log("Orders fetched successfully:", response.data.data.orders);
        // Filter out pending orders and cancelled orders, but keep shipped orders for management
        const filteredOrders = response.data.data.orders.filter(order => 
          order.status !== 'pending' && order.status !== 'cancelled'
        );
        setOrders(filteredOrders);
      } else {
        console.error("API returned error:", response.data);
        Swal.fire("Error", response.data.message || "Failed to fetch orders", "error");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        Swal.fire("Connection Error", "Unable to connect to server. Please check your internet connection and try again.", "error");
      } else if (error.response?.status === 401) {
        Swal.fire("Authentication Error", "Please login again to view your orders", "error");
      } else if (error.response?.status === 404) {
        Swal.fire("Not Found", "Orders endpoint not found. Please check if the backend is running correctly.", "error");
      } else {
        Swal.fire("Error", `Failed to fetch orders: ${error.response?.data?.message || error.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/seller/orders/${orderId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "placed":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Orders</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">No active orders found</p>
          <p className="text-gray-400 mb-6">Only confirmed, processing, shipped, and delivered orders are shown here</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh Orders
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Buyer: {order.buyer?.fullName || 'N/A'}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <button
                    onClick={() => handleViewDetails(order._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {item.product?.images && item.product.images.length > 0 && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} • ${item.product?.price || 0}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-gray-400">
                              Variant: {item.variant.color} / {item.variant.size}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-semibold text-gray-900">
                  ${order.totalAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders; 