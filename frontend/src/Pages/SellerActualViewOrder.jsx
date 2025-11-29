import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { FaSpinner, FaCog, FaTruck, FaArrowRight } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SellerActualViewOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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
          setOrder(response.data.data.order);
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>
      <div className="mb-4">
        <span className="font-semibold">Order ID:</span> #{order.orderNumber}<br />
        <span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${
          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
          order.status === 'processing' ? 'bg-orange-100 text-orange-800' :
          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>{order.status}</span><br />
        <span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleString()}<br />
        <span className="font-semibold">Total Amount:</span> ${order.totalAmount?.toFixed(2) || '0.00'}
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Buyer Info</h3>
        <div>Name: {order.buyer?.fullName || 'N/A'}</div>
        <div>Email: {order.buyer?.email || 'N/A'}</div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Items</h3>
        <ul className="list-disc pl-6">
          {order.items.map((item, idx) => (
            <li key={idx} className="mb-2">
              <span className="font-medium">{item.product?.name || 'Product'}</span> x {item.quantity} <br />
              <span className="text-gray-500 text-xs">Variant: {item.variant?.color} / {item.variant?.size}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Shipping Information Display */}
      {order.shippingInfo && (order.status === 'processing' || order.status === 'shipped') && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FaTruck className="text-blue-600" />
            Shipping Information
          </h3>
          {order.shippingInfo.trackingNumber && (
            <div><span className="font-medium">Tracking Number:</span> {order.shippingInfo.trackingNumber}</div>
          )}
          {order.shippingInfo.carrier && (
            <div><span className="font-medium">Carrier:</span> {order.shippingInfo.carrier}</div>
          )}
          {order.shippingInfo.method && (
            <div><span className="font-medium">Method:</span> {order.shippingInfo.method}</div>
          )}
          {order.shippingInfo.estimatedDelivery && (
            <div><span className="font-medium">Estimated Delivery:</span> {new Date(order.shippingInfo.estimatedDelivery).toLocaleDateString()}</div>
          )}
          {order.shippingInfo.deliveryNotes && (
            <div><span className="font-medium">Notes:</span> {order.shippingInfo.deliveryNotes}</div>
          )}
        </div>
      )}

      <div className="flex gap-4 mt-6">
        {order.status === 'confirmed' && (
          <button
            onClick={() => navigate(`/seller/delivery-management/${orderId}`)}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-2"
          >
            <FaTruck /> Manage Delivery
          </button>
        )}
        {order.status === 'processing' && (
          <button
            onClick={() => navigate(`/seller/delivery-management/${orderId}`)}
            className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
          >
            <FaTruck /> Update Shipping Info
          </button>
        )}
        {order.status === 'shipped' && (
          <button
            onClick={() => navigate(`/seller/delivery-management/${orderId}`)}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          >
            <FaTruck /> Update Status
          </button>
        )}
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default SellerActualViewOrder; 