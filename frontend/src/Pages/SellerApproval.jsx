import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaSpinner, FaUser, FaEnvelope, FaPhone, FaStore, FaCalendar, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SellerApproval = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check authentication and admin role
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.error('Please login to access this page');
      navigate('/signin');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [user, navigate, authLoading]);

  // Fetch seller details
  useEffect(() => {
    if (!sellerId || authLoading) return;
    
    const fetchSellerDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching seller details for ID:', sellerId);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await axios.get(`${API_URL}/api/v1/admin/sellers/${sellerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Seller details response:', response.data);

        if (response.data.success) {
          setSeller(response.data.seller);
          console.log('Seller data:', response.data.seller);
          console.log('Products count:', response.data.seller.products?.length || 0);
          console.log('Products:', response.data.seller.products);
          console.log('Products array type:', Array.isArray(response.data.seller.products));
          console.log('Bank accounts count:', response.data.seller.bankAccounts?.length || 0);
          console.log('Bank accounts:', response.data.seller.bankAccounts);
          console.log('Wallets count:', response.data.seller.wallets?.length || 0);
          console.log('Wallets:', response.data.seller.wallets);
          console.log('Orders count:', response.data.seller.orders?.length || 0);
          console.log('Orders:', response.data.seller.orders);
          console.log('Full response:', response.data);
        } else {
          setError(response.data.message || 'Failed to fetch seller details');
        }
      } catch (error) {
        console.error('Error fetching seller details:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        if (error.response?.status === 400) {
          setError(error.response.data.message || 'Invalid request');
        } else if (error.response?.status === 404) {
          setError('Seller not found');
        } else if (error.response?.status === 401) {
          toast.error('Authentication failed. Please login again.');
          navigate('/signin');
        } else if (error.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Failed to fetch seller details. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();
  }, [sellerId, authLoading, navigate]);

  // Handle seller verification
  const handleVerifySeller = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/admin/sellers/${sellerId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Seller verified successfully');
      // Update local state
      setSeller(prev => ({ ...prev, isVerified: true }));
    } catch (error) {
      console.error('Error verifying seller:', error);
      toast.error('Failed to verify seller');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle seller suspension
  const handleSuspendSeller = async () => {
    // Navigate to suspension page with seller information
    navigate(`/admin/suspension?sellerId=${sellerId}&sellerName=${encodeURIComponent(seller.fullName)}`);
  };

  // Handle seller activation
  const handleActivateSeller = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/admin/sellers/${sellerId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Seller activated successfully');
      // Update local state
      setSeller(prev => ({ ...prev, isSuspended: false }));
    } catch (error) {
      console.error('Error activating seller:', error);
      toast.error('Failed to activate seller');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading seller details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Seller Not Found</h2>
          <p className="text-gray-600 mb-4">The seller you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Seller Approval</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin: {user?.fullName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Seller Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-20 w-20 rounded-full border-4 border-white"
                  src={seller.profilePhoto || 'https://via.placeholder.com/80'}
                  alt={seller.fullName}
                />
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold">{seller.fullName}</h2>
                <p className="text-blue-100">{seller.businessInfo?.businessName || 'No Business Name'}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    seller.isVerified ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                  }`}>
                    {seller.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    seller.isSuspended ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {seller.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Details */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-3 w-4" />
                    <span className="text-gray-900">{seller.email}</span>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="text-gray-400 mr-3 w-4" />
                    <span className="text-gray-900">{seller.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendar className="text-gray-400 mr-3 w-4" />
                    <span className="text-gray-900">Joined: {new Date(seller.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaStore className="mr-2 text-primary" />
                  Business Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Business Name:</span>
                    <p className="text-gray-900">{seller.businessInfo?.businessName || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Business Type:</span>
                    <p className="text-gray-900">{seller.businessInfo?.businessType || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Business Address:</span>
                    <p className="text-gray-900">{seller.businessInfo?.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-primary" />
                Account Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{seller.orders?.length || 0}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{seller.products?.length || 0}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{seller.bankAccounts?.length || 0}</div>
                  <div className="text-sm text-gray-600">Bank Accounts</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{seller.wallets?.length || 0}</div>
                  <div className="text-sm text-gray-600">Wallets</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                {!seller.isVerified && (
                  <button
                    onClick={handleVerifySeller}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaCheck className="mr-2" />
                    )}
                    Verify Seller
                  </button>
                )}
                
                {seller.isSuspended ? (
                  <button
                    onClick={handleActivateSeller}
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaCheck className="mr-2" />
                    )}
                    Activate Seller
                  </button>
                ) : (
                  <button
                    onClick={handleSuspendSeller}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaTimes className="mr-2" />
                    )}
                    Suspend Seller
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerApproval; 