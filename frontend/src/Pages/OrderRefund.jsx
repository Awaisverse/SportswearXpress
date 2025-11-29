import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaMoneyBillWave, FaCreditCard, FaWallet, FaFileUpload, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const OrderRefund = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [formData, setFormData] = useState({
    refundAmount: '',
    refundMethod: 'bank_transfer',
    refundReason: '',
    refundNotes: '',
    refundScreenshot: null
  });

  const refundMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer', icon: FaCreditCard },
    { value: 'wallet_transfer', label: 'Wallet Transfer', icon: FaWallet },
    { value: 'cash_refund', label: 'Cash Refund', icon: FaMoneyBillWave }
  ];

  const refundReasons = [
    'Order Cancelled by Buyer',
    'Order Cancelled by Seller',
    'Order Cancelled by Admin',
    'Product Unavailable',
    'Payment Error',
    'Duplicate Order',
    'Customer Request',
    'Other'
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.get(`${API_URL}/api/v1/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        const orderData = response.data.order;
        if (orderData.status !== 'cancelled') {
          Swal.fire('Error', 'Refunds can only be processed for cancelled orders', 'error');
          navigate('/admin/dashboard');
          return;
        }
        setOrder(orderData);
        setFormData(prev => ({
          ...prev,
          refundAmount: orderData.totalAmount.toString()
        }));
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      Swal.fire("Error", "Failed to fetch order details", "error");
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        refundScreenshot: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.refundAmount || !formData.refundReason) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }

    const refundAmount = parseFloat(formData.refundAmount);
    if (refundAmount <= 0 || refundAmount > order.totalAmount) {
      Swal.fire('Error', 'Refund amount must be greater than 0 and not exceed order total', 'error');
      return;
    }

    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      
      const refundData = new FormData();
      refundData.append('orderId', orderId);
      refundData.append('refundAmount', refundAmount);
      refundData.append('refundMethod', formData.refundMethod);
      refundData.append('refundReason', formData.refundReason);
      refundData.append('refundNotes', formData.refundNotes);
      
      if (formData.refundScreenshot) {
        refundData.append('refundScreenshot', formData.refundScreenshot);
      }

      const response = await axios.post(`${API_URL}/api/v1/admin/refunds`, refundData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Swal.fire({
          title: 'Refund Processed!',
          text: 'The refund has been processed successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/admin/dashboard');
        });
      } else {
        Swal.fire('Error', response.data.message || 'Failed to process refund', 'error');
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to process refund. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Admin Dashboard
          </button>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Process Refund</h1>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Buyer</p>
                  <p className="font-medium text-gray-900">{order.buyer?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-medium text-gray-900">{order.seller?.businessInfo?.businessName || order.seller?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Original Payment Method</p>
                  <p className="font-medium text-gray-900">
                    {order.paymentInfo?.method === "bank_transfer" ? "Bank Transfer" : "Wallet Transfer"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Total</p>
                  <p className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Cancelled
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <FaMoneyBillWave className="text-green-500 mr-3 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">Refund Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Refund Amount */}
                <div>
                  <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="refundAmount"
                      name="refundAmount"
                      value={formData.refundAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max={order.totalAmount}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter refund amount"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum refund amount: ${order.totalAmount.toFixed(2)}
                  </p>
                </div>

                {/* Refund Method */}
                <div>
                  <label htmlFor="refundMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Method *
                  </label>
                  <select
                    id="refundMethod"
                    name="refundMethod"
                    value={formData.refundMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {refundMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Refund Reason */}
                <div>
                  <label htmlFor="refundReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Reason *
                  </label>
                  <select
                    id="refundReason"
                    name="refundReason"
                    value={formData.refundReason}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a reason</option>
                    {refundReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Refund Notes */}
                <div>
                  <label htmlFor="refundNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="refundNotes"
                    name="refundNotes"
                    value={formData.refundNotes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional notes about the refund..."
                  />
                </div>

                {/* Refund Screenshot */}
                <div>
                  <label htmlFor="refundScreenshot" className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Screenshot (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaFileUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <input
                      type="file"
                      id="refundScreenshot"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <label htmlFor="refundScreenshot" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        Click to upload screenshot
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                  {formData.refundScreenshot && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected file:</p>
                      <p className="text-sm text-gray-600">
                        {formData.refundScreenshot.name} ({(formData.refundScreenshot.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="text-yellow-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please ensure the refund has been processed through the payment system before confirming here.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/dashboard')}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <FaCheckCircle className="mr-2" />
                    )}
                    Process Refund
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderRefund; 