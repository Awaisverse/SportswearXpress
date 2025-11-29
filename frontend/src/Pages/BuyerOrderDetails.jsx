import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { FaArrowLeft, FaBox, FaTruck, FaCreditCard, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';

const BuyerOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [complaintExists, setComplaintExists] = useState(false);
  const [complaintLoading, setComplaintLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Check if we're returning from complaint submission
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('refresh') === 'true') {
      // Clear the refresh parameter from URL
      navigate(`/buyer/orders/${orderId}`, { replace: true });
      // Re-check complaint status
      if (order && order.status === 'delivered') {
        checkComplaintExists();
      }
    }
  }, [location.search, order, orderId, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.get(`${API_URL}/api/v1/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setOrder(response.data.data.order);
        // Check if complaint exists for this order
        if (response.data.data.order.status === 'delivered') {
          checkComplaintExists();
        } else {
          setComplaintLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      Swal.fire("Error", "Failed to fetch order details", "error");
      navigate('/buyer/orders');
    } finally {
      setLoading(false);
    }
  };

  const checkComplaintExists = async () => {
    try {
      setComplaintLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.get(`${API_URL}/api/v1/complaints/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          orderId: orderId
        }
      });

      if (response.data.success) {
        // Check if any complaint exists for this order
        const hasComplaint = response.data.data.complaints.some(
          complaint => complaint.order === orderId
        );
        setComplaintExists(hasComplaint);
      }
    } catch (error) {
      console.error("Error checking complaint status:", error);
      // If there's an error, assume no complaint exists to be safe
      setComplaintExists(false);
    } finally {
      setComplaintLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: "Are you sure you want to cancel this order? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    });

    if (result.isConfirmed) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.patch(`${API_URL}/api/v1/order/${orderId}/cancel`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          Swal.fire(
            'Cancelled!',
            'Your order has been cancelled successfully.',
            'success'
          );
          // Refresh order details
          fetchOrderDetails();
        } else {
          Swal.fire('Error', response.data.message || 'Failed to cancel order', 'error');
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to cancel order. Please try again.', 'error');
      }
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/buyer/orders')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaArrowLeft className="mr-2" />
              Back to Orders
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/buyer/orders')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600 mt-2">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaBox className="mr-2" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    {item.product?.images && item.product.images.length > 0 && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product?.name || 'Product'}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product?.name || 'Product name not available'}</h3>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ${item.price}
                        {item.variant && (
                          <span className="ml-2">
                            ({item.variant.color}, {item.variant.size})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                Shipping Address
              </h2>
              <div className="text-gray-600">
                <p className="font-medium">{order.shippingAddress?.street || 'Address not available'}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
                <p className="mt-2">Phone: {order.shippingAddress?.phone || 'Phone not available'}</p>
                {order.shippingAddress?.additionalInfo && (
                  <p className="mt-2">Additional Info: {order.shippingAddress.additionalInfo}</p>
                )}
              </div>
            </div>

            {/* Shipping Tracking Information */}
            {order.shippingInfo && (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FaTruck className="mr-2" />
                  Shipping Information
                </h2>
                <div className="space-y-4">
                  {order.shippingInfo.trackingNumber && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-900">Tracking Number</span>
                      <span className="text-blue-600 font-mono">{order.shippingInfo.trackingNumber}</span>
                    </div>
                  )}
                  {order.shippingInfo.carrier && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Carrier</span>
                      <span className="text-gray-600">{order.shippingInfo.carrier}</span>
                    </div>
                  )}
                  {order.shippingInfo.method && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Shipping Method</span>
                      <span className="text-gray-600 capitalize">{order.shippingInfo.method}</span>
                    </div>
                  )}
                  {order.shippingInfo.estimatedDelivery && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Estimated Delivery</span>
                      <span className="text-gray-600">{new Date(order.shippingInfo.estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                  )}
                  {order.shippingInfo.deliveryNotes && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium text-gray-900">Delivery Notes:</span>
                      <p className="text-gray-600 mt-1">{order.shippingInfo.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaCreditCard className="mr-2" />
                Payment Information
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Payment Method</span>
                  <span className="text-gray-600">{order.paymentInfo?.method === "bank_transfer" ? "Bank Transfer" : "Wallet Transfer"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Payment Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.paymentInfo?.status === "completed" ? 'bg-green-100 text-green-800' :
                    order.paymentInfo?.status === "pending" ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.paymentInfo?.status?.charAt(0).toUpperCase() + order.paymentInfo?.status?.slice(1) || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Total Amount</span>
                  <span className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Actions</h2>
              <div className="space-y-3">
                {/* Cancel Order Button - Only show for orders that can be cancelled */}
                {['pending', 'confirmed'].includes(order.status) && (
                  <button
                    onClick={() => handleCancelOrder()}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    Cancel Order
                  </button>
                )}
                
                {/* Submit Complaint Button - Only show for delivered orders without existing complaints */}
                {order.status === 'delivered' && !complaintExists && !complaintLoading && (
                  <button
                    onClick={() => navigate(`/buyer/complaint/${orderId}`)}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    Submit Complaint
                  </button>
                )}

                {/* Complaint Status - Show if complaint exists */}
                {order.status === 'delivered' && complaintExists && (
                  <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <FaExclamationTriangle className="text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">Complaint Already Submitted</span>
                  </div>
                )}

                {/* Loading state for complaint check */}
                {order.status === 'delivered' && complaintLoading && (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-600">Checking complaint status...</span>
                  </div>
                )}
                
                {/* Show message for non-delivered orders */}
                {['processing', 'shipped', 'cancelled'].includes(order.status) && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      {order.status === 'cancelled' ? 'This order has been cancelled.' : 
                       'Complaints can be submitted once the order is delivered.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>${order.shippingInfo?.cost || 0}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Seller Information</h2>
              <div className="space-y-2">
                {order.seller ? (
                  <>
                    <p className="font-medium">{order.seller.fullName}</p>
                    <p className="text-gray-600">{order.seller.email}</p>
                    {order.seller.businessInfo?.businessName && (
                      <p className="text-gray-600">{order.seller.businessInfo.businessName}</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">Seller information not available</p>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Timeline</h2>
                <div className="space-y-3">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(event.date)}
                        </p>
                        {event.note && (
                          <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BuyerOrderDetails; 