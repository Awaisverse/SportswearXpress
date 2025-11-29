import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { FaSpinner, FaCheck, FaMoneyBillWave } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminViewOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/v1/admin/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          console.log('Order data received:', response.data.order);
          setOrder(response.data.order);
        } else {
          toast.error('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Error fetching order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Debug effect to log order changes
  useEffect(() => {
    if (order) {
      console.log('Order state updated:', order);
      console.log('Payment screenshot path:', order.paymentScreenshot);
      console.log('Full image URL:', `${API_URL}/${order.paymentScreenshot}`);
    }
  }, [order]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const response = await axios.patch(`${API_URL}/api/v1/admin/orders/${orderId}/status`, {
        status: 'confirmed',
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        toast.success('Order confirmed! Payment status updated to paid.');
        setOrder(response.data.order);
      } else {
        toast.error('Failed to confirm order');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Error confirming order');
    } finally {
      setConfirming(false);
    }
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>
      <div className="mb-4">
        <span className="font-semibold">Order ID:</span> #{order.orderNumber}<br />
        <span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${
          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
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
        <div>Phone: {order.buyer?.phoneNumber || 'N/A'}</div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Seller Info</h3>
        <div>Name: {order.seller?.fullName || 'N/A'}</div>
        <div>Email: {order.seller?.email || 'N/A'}</div>
        <div>Business: {order.seller?.businessInfo?.businessName || 'N/A'}</div>
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

      {/* Debug Information (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold mb-2 text-yellow-800">Debug Info (Development Only)</h3>
          <div className="text-xs text-yellow-700">
            <div>API URL: {API_URL}</div>
            <div>Payment Screenshot: {order.paymentScreenshot}</div>
            <div>Payment Status: {order.paymentStatus}</div>
            <div>Payment Info: {JSON.stringify(order.paymentInfo, null, 2)}</div>
            <div>Seller Data: {JSON.stringify(order.seller, null, 2)}</div>
          </div>
        </div>
      )}

      {/* Payment Screenshot Section */}
      {order.paymentScreenshot && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-lg">Payment Screenshot</h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-600 mb-2">
                Screenshot Path: {order.paymentScreenshot}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Full URL: {`${API_URL}/${order.paymentScreenshot}`}
              </div>
              <img
                src={`${API_URL}/${order.paymentScreenshot}`}
                alt="Payment Screenshot"
                className="w-full max-w-md h-auto rounded-lg shadow-lg border border-gray-300"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
                onLoad={() => {
                  console.log('Payment screenshot loaded successfully');
                  setImageLoading(false);
                  setImageError(false);
                }}
                onError={(e) => {
                  console.error('Failed to load payment screenshot:', e.target.src);
                  setImageLoading(false);
                  setImageError(true);
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'block';
                  }
                }}
              />
              <div 
                className="hidden text-center text-gray-500 py-8 bg-gray-100 rounded-lg w-full max-w-md"
                style={{ display: 'none' }}
              >
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium mb-2">Payment Screenshot</p>
                <p className="text-sm">Image could not be loaded</p>
                <p className="text-xs text-gray-400 mt-1">Please check if the file exists on the server</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <a
                href={`${API_URL}/${order.paymentScreenshot}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Full Size
              </a>
            </div>
          </div>
        </div>
      )}

      {/* No Screenshot Message */}
      {!order.paymentScreenshot && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-lg">Payment Screenshot</h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-center text-gray-500 py-8">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">No Payment Screenshot</p>
              <p className="text-sm">No payment screenshot was uploaded for this order</p>
              <p className="text-xs text-gray-400 mt-1">paymentScreenshot field is: {order.paymentScreenshot || 'null/undefined'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Payment Status</h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.paymentStatus === 'paid' || order.paymentInfo?.status === 'paid' || order.paymentInfo?.status === 'completed' ? 'bg-green-100 text-green-800' :
            order.paymentStatus === 'pending' || order.paymentInfo?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {order.paymentStatus === 'paid' || order.paymentInfo?.status === 'paid' || order.paymentInfo?.status === 'completed' ? '✓ Paid' :
             order.paymentStatus === 'pending' || order.paymentInfo?.status === 'pending' ? '⏳ Pending' :
             '✗ Failed'}
          </span>
          {order.paymentMethod && (
            <span className="text-sm text-gray-600">
              via {order.paymentMethod}
            </span>
          )}
        </div>
        {order.paymentInfo?.paymentDate && (
          <div className="text-xs text-gray-500 mt-1">
            Payment Date: {new Date(order.paymentInfo.paymentDate).toLocaleString()}
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-6">
        {order.status === 'pending' && (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark flex items-center gap-2 disabled:opacity-50"
          >
            {confirming ? <FaSpinner className="animate-spin" /> : <FaCheck />} Confirm Order
          </button>
        )}
        {order.status === 'cancelled' && (
          <button
            onClick={() => navigate(`/admin/order-refund/${orderId}`)}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <FaMoneyBillWave /> Process Refund
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

export default AdminViewOrder; 