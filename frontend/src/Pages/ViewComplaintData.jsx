import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaExclamationTriangle, FaUser, FaBox, FaCalendarAlt, FaFileAlt, FaCheck, FaTimes, FaBan } from 'react-icons/fa';

const ViewComplaintData = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.get(`${API_URL}/api/v1/complaints/${complaintId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setComplaint(response.data.data.complaint);
        setResolution(response.data.data.complaint.resolution || '');
      } else {
        Swal.fire('Error', 'Failed to fetch complaint details', 'error');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error("Error fetching complaint details:", error);
      Swal.fire('Error', 'Failed to fetch complaint details', 'error');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      
      const updateData = {
        status: newStatus,
        resolution: resolution
      };

      const response = await axios.patch(`${API_URL}/api/v1/complaints/${complaintId}/status`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        Swal.fire('Success', 'Complaint status updated successfully', 'success');
        fetchComplaintDetails(); // Refresh the data
      } else {
        Swal.fire('Error', response.data.message || 'Failed to update complaint status', 'error');
      }
    } catch (error) {
      console.error("Error updating complaint status:", error);
      Swal.fire('Error', 'Failed to update complaint status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleSuspendSeller = () => {
    if (complaint?.order?.seller) {
      const sellerId = complaint.order.seller._id;
      const sellerName = complaint.order.seller.fullName;
      navigate(`/suspension?sellerId=${sellerId}&sellerName=${encodeURIComponent(sellerName)}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Complaint Not Found</h2>
          <p className="text-gray-600 mb-4">The complaint you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Complaint Details</h1>
                <p className="text-gray-600">Complaint ID: #{complaint._id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                  {complaint.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaExclamationTriangle className="mr-2 text-orange-500" />
                Complaint Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-gray-900 font-medium">{complaint.subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{complaint.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{complaint.description}</p>
                  </div>
                </div>

                {/* Attachments */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {complaint.attachments.map((attachment, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FaFileAlt className="text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900 truncate">{attachment.originalName}</span>
                            </div>
                            <a
                              href={attachment.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View
                            </a>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resolution</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Notes
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter resolution notes..."
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleStatusUpdate('in_review')}
                    disabled={updating || complaint.status === 'in_review'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <FaCheck className="mr-2" />
                    Mark as In Review
                  </button>
                  
                  <button
                    onClick={() => handleStatusUpdate('resolved')}
                    disabled={updating || complaint.status === 'resolved'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <FaCheck className="mr-2" />
                    Mark as Resolved
                  </button>
                  
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={updating || complaint.status === 'rejected'}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Reject Complaint
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaBox className="mr-2 text-blue-600" />
                Order Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium text-gray-900">#{complaint.order?.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium text-gray-900">{formatDate(complaint.order?.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-gray-900">${complaint.order?.totalAmount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.order?.status)}`}>
                    {complaint.order?.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Buyer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="mr-2 text-green-600" />
                Buyer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{complaint.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{complaint.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            {complaint.order?.seller && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2 text-purple-600" />
                  Seller Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{complaint.order.seller.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{complaint.order.seller.email}</p>
                  </div>
                  {complaint.order.seller.businessInfo?.businessName && (
                    <div>
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium text-gray-900">{complaint.order.seller.businessInfo.businessName}</p>
                    </div>
                  )}
                  
                  {/* Suspend Seller Button */}
                  <button
                    onClick={handleSuspendSeller}
                    className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <FaBan className="mr-2" />
                    Suspend Seller
                  </button>
                </div>
              </div>
            )}

            {/* Complaint Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-gray-600" />
                Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Complaint Submitted</p>
                    <p className="text-sm text-gray-500">{formatDate(complaint.createdAt)}</p>
                  </div>
                </div>
                
                {complaint.resolvedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Resolved</p>
                      <p className="text-sm text-gray-500">{formatDate(complaint.resolvedAt)}</p>
                      {complaint.resolvedBy && (
                        <p className="text-xs text-gray-400">by {complaint.resolvedBy.name}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewComplaintData; 