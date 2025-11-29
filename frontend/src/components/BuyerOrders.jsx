import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.get(`${API_URL}/api/v1/order/buyer`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire("Error", "Failed to fetch orders", "error");
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400">Start shopping to see your orders here</p>
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
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {item.product.images && item.product.images.length > 0 && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
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
                      Payment Method: {order.paymentInfo.method === "bank_transfer" ? "Bank Transfer" : "Wallet Transfer"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {order.paymentInfo.status.charAt(0).toUpperCase() + order.paymentInfo.status.slice(1)}
                    </p>
                    {order.paymentId.confirmed ? (
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
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Seller Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Seller:</h4>
                <p className="text-sm text-gray-600">{order.seller.fullName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerOrders; 