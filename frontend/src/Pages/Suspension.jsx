import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBan, FaExclamationTriangle, FaCalendarAlt, FaUser, FaTimes, FaCheck } from 'react-icons/fa';

const Suspension = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get('sellerId');
  const sellerName = searchParams.get('sellerName');
  
  const [loading, setLoading] = useState(false);
  const [seller, setSeller] = useState(null);
  const [suspensionData, setSuspensionData] = useState({
    reason: '',
    duration: '',
    durationType: 'days',
    description: '',
    evidence: '',
    adminNotes: '',
    suspensionType: 'temporary',
    effectiveDate: new Date().toISOString().split('T')[0],
    notifySeller: true,
    notifyBuyers: false
  });

  useEffect(() => {
    if (sellerId) {
      fetchSellerDetails();
    }
  }, [sellerId]);

  const fetchSellerDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/v1/admin/sellers/${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSeller(data.seller || data.data);
      } else {
        toast.error('Failed to fetch seller details');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error fetching seller details:', error);
      toast.error('Error fetching seller details');
      navigate('/admin/dashboard');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSuspensionData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!suspensionData.reason.trim()) {
      errors.push('Suspension reason is required');
    }

    if (suspensionData.suspensionType === 'temporary' && !suspensionData.duration) {
      errors.push('Duration is required for temporary suspensions');
    }

    if (!suspensionData.description.trim()) {
      errors.push('Detailed description is required');
    }

    if (!suspensionData.evidence.trim()) {
      errors.push('Evidence or proof is required');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/v1/admin/sellers/${sellerId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(suspensionData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Seller suspended successfully');
        navigate('/admin/dashboard');
      } else {
        throw new Error(data.message || 'Failed to suspend seller');
      }
    } catch (error) {
      console.error('Error suspending seller:', error);
      toast.error(error.message || 'Failed to suspend seller');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-full">
                <FaBan className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Suspend Seller</h1>
                <p className="text-gray-600">Suspend seller account with detailed information</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Seller Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaUser className="w-5 h-5 mr-2 text-blue-600" />
            Seller Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Seller Name</p>
              <p className="text-lg text-gray-900">{seller.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Business Name</p>
              <p className="text-lg text-gray-900">{seller.businessInfo?.businessName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg text-gray-900">{seller.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-lg text-gray-900">{seller.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                seller.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {seller.isSuspended ? 'Suspended' : 'Active'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Products</p>
              <p className="text-lg text-gray-900">{seller.products?.length || 0} products</p>
            </div>
          </div>
        </div>

        {/* Suspension Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <FaExclamationTriangle className="w-5 h-5 mr-2 text-red-600" />
            Suspension Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Suspension Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suspension Type *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="suspensionType"
                    value="temporary"
                    checked={suspensionData.suspensionType === 'temporary'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>Temporary</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="suspensionType"
                    value="permanent"
                    checked={suspensionData.suspensionType === 'permanent'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>Permanent</span>
                </label>
              </div>
            </div>

            {/* Duration (for temporary suspensions) */}
            {suspensionData.suspensionType === 'temporary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={suspensionData.duration}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter duration"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration Type *
                  </label>
                  <select
                    name="durationType"
                    value={suspensionData.durationType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            )}

            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date *
              </label>
              <input
                type="date"
                name="effectiveDate"
                value={suspensionData.effectiveDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suspension Reason *
              </label>
              <select
                name="reason"
                value={suspensionData.reason}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a reason</option>
                <option value="policy_violation">Policy Violation</option>
                <option value="fraudulent_activity">Fraudulent Activity</option>
                <option value="poor_quality_products">Poor Quality Products</option>
                <option value="customer_complaints">Multiple Customer Complaints</option>
                <option value="payment_issues">Payment Issues</option>
                <option value="inappropriate_behavior">Inappropriate Behavior</option>
                <option value="spam_or_misleading">Spam or Misleading Content</option>
                <option value="legal_violation">Legal Violation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                name="description"
                value={suspensionData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed explanation of the suspension reason..."
                required
              />
            </div>

            {/* Evidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence or Proof *
              </label>
              <textarea
                name="evidence"
                value={suspensionData.evidence}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide evidence, links, or proof supporting the suspension..."
                required
              />
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Internal)
              </label>
              <textarea
                name="adminNotes"
                value={suspensionData.adminNotes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Internal notes for admin reference..."
              />
            </div>

            {/* Notification Options */}
            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Notification Options</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notifySeller"
                    checked={suspensionData.notifySeller}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span>Notify seller about the suspension</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notifyBuyers"
                    checked={suspensionData.notifyBuyers}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span>Notify buyers with pending orders from this seller</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Suspending...
                  </>
                ) : (
                  <>
                    <FaBan className="w-4 h-4 mr-2" />
                    Suspend Seller
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Suspension; 