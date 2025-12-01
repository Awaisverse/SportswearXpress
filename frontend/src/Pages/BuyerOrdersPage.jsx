import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { Link } from "react-router-dom";

const BuyerOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    // Only fetch orders if user is authenticated
    if (user && user.role === 'buyer') {
      console.log("User authenticated as buyer, fetching orders...");
      
      const fetchOrdersWithCleanup = async () => {
        try {
          if (!isMounted) return;
          
          setLoading(true);
          const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
          const token = localStorage.getItem("token");
          
          console.log("=== Fetching Orders ===");
          console.log("API_URL:", API_URL);
          console.log("Token exists:", !!token);
          console.log("User:", user);
          
          if (!token) {
            if (isMounted) {
              Swal.fire("Error", "Please login to view your orders", "error");
            }
            return;
          }

          // Decode token to see user info
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log("Token payload:", payload);
              console.log("Token user ID:", payload.id);
              console.log("Token user role:", payload.role);
            }
          } catch (decodeError) {
            console.error("Error decoding token:", decodeError);
          }

          // First check if backend is running
          try {
            console.log("Checking backend health...");
            const healthResponse = await axios.get(`${API_URL}/api/health`, { 
              timeout: 3000,
              signal: abortController.signal
            });
            console.log("Backend health check successful:", healthResponse.data);
          } catch (healthError) {
            if (!isMounted) return;
            
            // Ignore abort errors
            if (healthError.name === 'AbortError' || healthError.name === 'CanceledError') {
              return;
            }
            
            console.error("Backend health check failed:", healthError);
            Swal.fire("Server Error", "Backend server is not running. Please start the server and try again.", "error");
            setLoading(false);
            return;
          }

          if (!isMounted) return;

          console.log("Making request to:", `${API_URL}/api/v1/order/buyer`);
          const response = await axios.get(`${API_URL}/api/v1/order/buyer`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000, // 10 second timeout
            signal: abortController.signal
          });
          
          if (!isMounted) return;
          
          console.log("Order response:", response.data);
          
          if (response.data.success) {
            console.log("Orders fetched successfully:", response.data.data.orders);
            setOrders(response.data.data.orders);
          } else {
            console.error("API returned error:", response.data);
            Swal.fire("Error", response.data.message || "Failed to fetch orders", "error");
          }
        } catch (error) {
          if (!isMounted) return;
          
          // Ignore abort errors
          if (error.name === 'AbortError' || error.name === 'CanceledError') {
            return;
          }
          
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
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchOrdersWithCleanup();
    } else if (user && user.role !== 'buyer') {
      console.log("User is not a buyer, role:", user.role);
      setLoading(false);
      Swal.fire("Access Denied", "This page is only for buyers", "error");
    } else if (!user) {
      console.log("No user found, waiting for authentication...");
      setLoading(false);
      // User is not authenticated, this will be handled by the ProtectedRoute
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      
      console.log("=== Fetching Orders ===");
      console.log("API_URL:", API_URL);
      console.log("Token exists:", !!token);
      console.log("User:", user);
      
      if (!token) {
        Swal.fire("Error", "Please login to view your orders", "error");
        return;
      }

      // Decode token to see user info
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("Token payload:", payload);
          console.log("Token user ID:", payload.id);
          console.log("Token user role:", payload.role);
        }
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
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

      console.log("Making request to:", `${API_URL}/api/v1/order/buyer`);
      const response = await axios.get(`${API_URL}/api/v1/order/buyer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log("Order response:", response.data);
      
      if (response.data.success) {
        console.log("Orders fetched successfully:", response.data.data.orders);
        setOrders(response.data.data.orders);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "placed":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">No orders found</p>
              <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={fetchOrders}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh Orders
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Start Shopping
                </Link>
              </div>
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
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            {item.product?.images && item.product.images.length > 0 && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name || 'Product'}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{item.product?.name || 'Product name not available'}</p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} × ${item.price}
                                {item.variant && (
                                  <span className="ml-2">
                                    ({item.variant.color}, {item.variant.size})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Shipping:</span>
                      <span>${order.shippingInfo?.cost || 0}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Information */}
                  {order.paymentId && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Payment Details:</h4>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          Payment Method: {order.paymentInfo?.method === "bank_transfer" ? "Bank Transfer" : "Wallet Transfer"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {order.paymentInfo?.status?.charAt(0).toUpperCase() + order.paymentInfo?.status?.slice(1) || 'Unknown'}
                        </p>
                        {order.paymentId?.confirmed ? (
                          <p className="text-sm text-green-600 font-medium">✓ Payment Confirmed by Seller</p>
                        ) : (
                          <p className="text-sm text-yellow-600 font-medium">⏳ Payment Pending Confirmation</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Shipping Information */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Address:</h4>
                    <div className="text-sm text-gray-600">
                      <p>{order.shippingAddress?.street || 'Address not available'}</p>
                      <p>
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                      </p>
                      <p>{order.shippingAddress?.country}</p>
                      <p>Phone: {order.shippingAddress?.phone || 'Phone not available'}</p>
                    </div>
                  </div>

                  {/* Seller Information */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Seller:</h4>
                      <p className="text-sm text-gray-600">{order.seller?.fullName || 'Seller information not available'}</p>
                    </div>
                    <Link
                      to={`/buyer/orders/${order._id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BuyerOrdersPage; 