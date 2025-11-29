import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { FaSpinner, FaTruck, FaShippingFast, FaCheck, FaArrowLeft, FaEdit, FaCog } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SellerDeliveryManagement = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    trackingNumber: '',
    carrier: '',
    method: 'standard',
    estimatedDelivery: '',
    deliveryNotes: ''
  });
  const [selectedStatus, setSelectedStatus] = useState('');

  // Available statuses for different order states
  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'confirmed':
        return [
          { value: 'processing', label: 'Processing' },
          { value: 'shipped', label: 'Shipped' }
        ];
      case 'processing':
        return [
          { value: 'shipped', label: 'Shipped' }
        ];
      case 'shipped':
        return [
          { value: 'delivered', label: 'Delivered' },
          { value: 'returned', label: 'Returned' }
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/v1/order/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          const orderData = response.data.data.order;
          setOrder(orderData);
          setSelectedStatus(orderData.status);
          
          // Pre-fill shipping info if it exists
          if (orderData.shippingInfo) {
            setShippingInfo({
              trackingNumber: orderData.shippingInfo.trackingNumber || '',
              carrier: orderData.shippingInfo.carrier || '',
              method: orderData.shippingInfo.method || 'standard',
              estimatedDelivery: orderData.shippingInfo.estimatedDelivery ? 
                new Date(orderData.shippingInfo.estimatedDelivery).toISOString().split('T')[0] : '',
              deliveryNotes: orderData.shippingInfo.deliveryNotes || ''
            });
          }
        } else {
          toast.error('Order not found');
        }
      } catch (error) {
        toast.error('Error fetching order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusUpdate = async (newStatus) => {
    // Validate required fields for shipped status
    if (newStatus === 'shipped') {
      if (!shippingInfo.trackingNumber.trim()) {
        toast.error('Tracking number is required for shipped status');
        return;
      }
      if (!shippingInfo.carrier.trim()) {
        toast.error('Carrier information is required for shipped status');
        return;
      }
    }

    setSubmitting(true);
    try {
      // Prepare shipping info with proper date handling
      const shippingInfoToSend = {
        ...shippingInfo,
        status: newStatus
      };

      // Only include estimatedDelivery if it's a valid date
      if (shippingInfo.estimatedDelivery && shippingInfo.estimatedDelivery.trim()) {
        try {
          const date = new Date(shippingInfo.estimatedDelivery);
          if (!isNaN(date.getTime())) {
            shippingInfoToSend.estimatedDelivery = date;
          }
        } catch (dateError) {
          console.warn('Invalid date format:', shippingInfo.estimatedDelivery);
          // Remove invalid date
          delete shippingInfoToSend.estimatedDelivery;
        }
      } else {
        // Remove empty date
        delete shippingInfoToSend.estimatedDelivery;
      }

      const updateData = {
        status: newStatus,
        shippingInfo: shippingInfoToSend
      };

      console.log('Sending update data:', updateData);

      const response = await axios.patch(`${API_URL}/api/v1/order/${orderId}/delivery`, updateData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const statusMessages = {
          'processing': 'Order set to processing',
          'shipped': 'Order marked as shipped',
          'delivered': 'Order marked as delivered',
          'returned': 'Order marked as returned'
        };
        toast.success(statusMessages[newStatus] || 'Order status updated successfully!');
        setOrder(response.data.data.order);
        setSelectedStatus(newStatus);
        
        // Update local shipping info
        setShippingInfo(prev => ({
          ...prev,
          status: newStatus
        }));
      } else {
        toast.error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error updating order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-primary mb-4" />
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return <div className="p-6">Order not found.</div>;
  }

  // Only allow access for confirmed, processing, or shipped orders
  if (!['confirmed', 'processing', 'shipped'].includes(order.status)) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            This order cannot be managed for delivery at this stage.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const availableStatuses = getAvailableStatuses(order.status);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h2 className="text-2xl font-bold">Delivery Management</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            order.status === 'processing' ? 'bg-orange-100 text-orange-800' :
            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'returned' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium">Buyer:</span> {order.buyer?.fullName || 'N/A'}</p>
            <p><span className="font-medium">Email:</span> {order.buyer?.email || 'N/A'}</p>
            <p><span className="font-medium">Total Amount:</span> ${order.totalAmount?.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p><span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><span className="font-medium">Items:</span> {order.items?.length || 0} items</p>
            <p><span className="font-medium">Payment Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                order.paymentConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.paymentConfirmed ? 'Confirmed' : 'Pending'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Status Update Section */}
      {availableStatuses.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaEdit className="text-green-600" />
            Update Order Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={order.status}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)} (Current)
                </option>
                {availableStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => handleStatusUpdate(selectedStatus)}
                disabled={submitting || selectedStatus === order.status}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Information Form */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaTruck className="text-blue-600" />
          Shipping Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tracking Number {order.status === 'shipped' && '*'}
            </label>
            <input
              type="text"
              name="trackingNumber"
              value={shippingInfo.trackingNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tracking number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carrier {order.status === 'shipped' && '*'}
            </label>
            <div className="flex gap-2 mb-2">
              {['FedEx', 'UPS', 'DHL', 'USPS', 'TNT', 'Aramex'].map(carrier => (
                <button
                  key={carrier}
                  type="button"
                  onClick={() => setShippingInfo(prev => ({ ...prev, carrier }))}
                  className={`px-3 py-1 text-xs rounded border ${
                    shippingInfo.carrier === carrier 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {carrier}
                </button>
              ))}
            </div>
            <input
              type="text"
              name="carrier"
              value={shippingInfo.carrier}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., FedEx, UPS, DHL"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Method
            </label>
            <select
              name="method"
              value={shippingInfo.method}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard Shipping</option>
              <option value="express">Express Shipping</option>
              <option value="overnight">Overnight Shipping</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Delivery Date
            </label>
            <input
              type="date"
              name="estimatedDelivery"
              value={shippingInfo.estimatedDelivery}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Notes
          </label>
          <textarea
            name="deliveryNotes"
            value={shippingInfo.deliveryNotes}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special delivery instructions or notes..."
          />
        </div>
      </div>

      {/* Shipping Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaShippingFast className="text-purple-600" />
            Shipping Timeline
          </h3>
          
          <div className="space-y-4">
            {order.timeline.map((entry, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  entry.status === 'confirmed' ? 'bg-blue-500' :
                  entry.status === 'processing' ? 'bg-orange-500' :
                  entry.status === 'shipped' ? 'bg-purple-500' :
                  entry.status === 'delivered' ? 'bg-green-500' :
                  entry.status === 'returned' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium capitalize">{entry.status}</p>
                      <p className="text-sm text-gray-600">{entry.note}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        
        {order.status === 'confirmed' && (
          <button
            onClick={() => handleStatusUpdate('processing')}
            disabled={submitting}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaCog />}
            Set to Processing
          </button>
        )}
        
        <button
          onClick={() => handleStatusUpdate('shipped')}
          disabled={submitting || !shippingInfo.trackingNumber.trim() || !shippingInfo.carrier.trim()}
          className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? <FaSpinner className="animate-spin" /> : <FaShippingFast />}
          Mark as Shipped
        </button>
      </div>

      {/* Status Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Status Information:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Confirmed:</strong> Order is confirmed and ready for processing</li>
          <li>• <strong>Processing:</strong> Order is being prepared for shipment</li>
          <li>• <strong>Shipped:</strong> Order has been shipped with tracking information</li>
          <li>• <strong>Delivered:</strong> Order has been successfully delivered to buyer</li>
          <li>• <strong>Returned:</strong> Order has been returned by buyer</li>
          <li>• Tracking number and carrier are required for shipped status</li>
          <li>• You can update status for confirmed, processing, and shipped orders</li>
        </ul>
      </div>
    </div>
  );
};

export default SellerDeliveryManagement; 