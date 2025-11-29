import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaShoppingCart, FaExclamationTriangle, FaCheckCircle, FaUsers, FaCog, FaChartPie, FaTimes, FaHistory, FaExclamationCircle, FaBox, FaStore, FaCheck, FaSpinner, FaSignOutAlt, FaEye, FaEdit, FaTrash, FaClock, FaCheckDouble, FaBan } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dashboardService from '../services/dashboardService';
import complaintService from '../services/complaintService';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Check if user is admin
  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to load
    }
    
    if (!user) {
      toast.error('Please login to access admin dashboard');
      navigate('/signin');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    
    setIsCheckingAuth(false);
  }, [user, navigate, authLoading]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeUserType, setActiveUserType] = useState('buyers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [salesData, setSalesData] = useState([
    { name: 'Completed', value: 65 },
    { name: 'Pending', value: 35 }
  ]);
  const [userStats, setUserStats] = useState({
    totalBuyers: 0,
    suspendedBuyers: 0,
    totalSellers: 0,
    unverifiedSellers: 0,
    activeUsers: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState('7'); // Default 7 days
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBuyers: 0,
    totalSellers: 0,
    unverifiedSellers: 0
  });
  const [error, setError] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unverifiedSellers, setUnverifiedSellers] = useState([]);
  const [showSuspensionForm, setShowSuspensionForm] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [suspensionData, setSuspensionData] = useState({
    reason: '',
    suspendedUntil: '',
    notes: ''
  });

  // User management state
  const [realBuyers, setRealBuyers] = useState([]);
  const [realSellers, setRealSellers] = useState([]);
  const [userManagementLoading, setUserManagementLoading] = useState(false);
  const [userPagination, setUserPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [userFilters, setUserFilters] = useState({
    search: '',
    status: 'all',
    verification: 'all'
  });

  // Orders management state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });
  const [orderPagination, setOrderPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [orderFilters, setOrderFilters] = useState({
    search: '',
    status: 'all'
  });

  // Complaints management state
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintStats, setComplaintStats] = useState({
    pending: 0,
    in_review: 0,
    resolved: 0,
    rejected: 0,
    total: 0
  });
  const [complaintPagination, setComplaintPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalComplaints: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [complaintFilters, setComplaintFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    priority: 'all'
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    adminNotes: ''
  });

  // Mock data for buyers and sellers
  const [buyers, setBuyers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      joinedDate: '2024-01-15',
      status: 'active',
      avatar: null
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      joinedDate: '2024-02-01',
      status: 'suspended',
      avatar: null
    }
  ]);

  const [sellers, setSellers] = useState([
    {
      id: 1,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      storeName: 'Mike\'s Store',
      joinedDate: '2024-01-10',
      status: 'active',
      avatar: null
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      storeName: 'Sarah\'s Shop',
      joinedDate: '2024-02-05',
      status: 'active',
      avatar: null
    }
  ]);

  // Mock data for user details
  const [userDetails, setUserDetails] = useState({
    orders: [
      { id: 1, date: '2024-03-01', amount: 150.00, status: 'Delivered' },
      { id: 2, date: '2024-03-15', amount: 75.50, status: 'Processing' }
    ],
    complaints: [
      { id: 1, date: '2024-03-10', subject: 'Product Quality Issue', status: 'Resolved' },
      { id: 2, date: '2024-03-20', subject: 'Delivery Delay', status: 'Pending' }
    ],
    loginHistory: [
      { date: '2024-03-25 14:30', ip: '192.168.1.1', device: 'Chrome on Windows' },
      { date: '2024-03-24 09:15', ip: '192.168.1.1', device: 'Mobile Safari' }
    ]
  });

  const handleViewDetails = (userId) => {
    // Implement view details functionality
    console.log('View details for user:', userId);
  };

  const handleToggleStatus = (userId) => {
    // Implement status toggle functionality
    console.log('Toggle status for user:', userId);
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSuspension = () => {
    setShowSuspensionModal(true);
  };

  const handleConfirmSuspension = () => {
    // Implement suspension logic here
    console.log('Suspending user:', selectedUser.id);
    console.log('Reason:', suspensionReason);
    console.log('Duration:', suspensionDuration, 'days');
    
    // Update user status in the list
    if (activeUserType === 'buyers') {
      setBuyers(buyers.map(buyer => 
        buyer.id === selectedUser.id 
          ? { ...buyer, status: 'suspended' }
          : buyer
      ));
    } else {
      setSellers(sellers.map(seller => 
        seller.id === selectedUser.id 
          ? { ...seller, status: 'suspended' }
          : seller
      ));
    }

    setShowSuspensionModal(false);
    setShowUserModal(false);
    setSuspensionReason('');
    setSuspensionDuration('7');
  };

  const COLORS = ['#0088FE', '#FFBB28'];

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await dashboardService.getRecentActivities();
        if (res.success) {
          setNotifications(res.data);
        }
      } catch (err) {
        setNotifications([]);
      }
    }
    fetchActivities();
    // Optionally, set up polling:
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const [productsData, sellersData] = await Promise.all([
        dashboardService.getPendingProducts(),
        dashboardService.getPendingSellers()
      ]);
      setPendingProducts(productsData);
      setPendingSellers(sellersData);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPendingApprovals();
    }
  }, [activeTab]);

  // Fetch complaints when complaints tab is active
  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints(1, complaintFilters);
    }
  }, [activeTab]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders(1, orderFilters);
      fetchOrderStats();
    }
  }, [activeTab]);

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeTab === 'users') {
      if (activeUserType === 'buyers') {
        fetchBuyers(1, userFilters);
      } else {
        fetchSellers(1, userFilters);
      }
    }
  }, [activeTab, activeUserType]);

  // Handle product approval
  const handleProductApproval = async (productId, action) => {
    try {
      await dashboardService.approveProduct(productId, action);
      toast.success('Product approval processed successfully');
      fetchPendingApprovals(); // Refresh the list
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error(error.message || 'Failed to process product approval');
    }
  };

  // Handle seller approval
  const handleSellerApproval = async (sellerId, action) => {
    try {
      await dashboardService.approveSeller(sellerId, action);
      toast.success('Seller approval processed successfully');
      fetchPendingApprovals(); // Refresh the list
    } catch (error) {
      console.error('Error approving seller:', error);
      toast.error(error.message || 'Failed to process seller approval');
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsData = await dashboardService.getDashboardStats();
      console.log('Dashboard stats received:', statsData);
      
      setStats(statsData);
      setUserStats({
        totalBuyers: statsData?.totalBuyers || 0,
        totalSellers: statsData?.totalSellers || 0,
        unverifiedSellers: statsData?.unverifiedSellers || 0,
        activeUsers: (statsData?.activeBuyers || 0) + (statsData?.activeSellers || 0)
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message || 'Failed to fetch dashboard statistics');
      toast.error(error.message || 'Failed to fetch dashboard statistics');
      
      // Set default values on error
      setStats({
        totalBuyers: 0,
        totalSellers: 0,
        unverifiedSellers: 0
      });
      setUserStats({
        totalBuyers: 0,
        totalSellers: 0,
        unverifiedSellers: 0,
        activeUsers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch unverified sellers - only call after authentication is confirmed
  useEffect(() => {
    if (!authLoading && !isCheckingAuth && user && user.role === 'admin') {
      fetchUnverifiedSellers();
    }
  }, [authLoading, isCheckingAuth, user]);

  const fetchUnverifiedSellers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching unverified sellers with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.error('No token found');
        toast.error('Please login to access admin dashboard');
        return;
      }

      console.log('Using API URL:', API_URL);
      console.log('Fetching unverified sellers from:', `${API_URL}/api/v1/admin/sellers/unverified`);
      
      const response = await axios.get(`${API_URL}/api/v1/admin/sellers/unverified`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Unverified sellers response:', response.data);
      setUnverifiedSellers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching unverified sellers:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        navigate('/signin');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error('Failed to fetch unverified sellers');
      }
      setLoading(false);
    }
  };

  const handleVerify = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/v1/admin/sellers/${sellerId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Seller verified successfully');
      fetchUnverifiedSellers();
    } catch (error) {
      console.error('Error verifying seller:', error);
      toast.error('Failed to verify seller');
    }
  };

  const handleSuspend = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/v1/admin/sellers/${sellerId}/suspend`, suspensionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Seller suspended successfully');
      setShowSuspensionForm(false);
      setSelectedSeller(null);
      setSuspensionData({
        reason: '',
        suspendedUntil: '',
        notes: ''
      });
      fetchUnverifiedSellers();
    } catch (error) {
      console.error('Error suspending seller:', error);
      toast.error('Failed to suspend seller');
    }
  };

  const openSuspensionForm = (seller) => {
    setSelectedSeller(seller);
    setShowSuspensionForm(true);
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // User management functions
  const fetchBuyers = async (page = 1, filters = {}) => {
    setUserManagementLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: filters.search || '',
        status: filters.status || 'all'
      });

      const response = await axios.get(`${API_URL}/api/v1/admin/buyers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRealBuyers(response.data.data.buyers);
        setUserPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
      toast.error('Failed to fetch buyers');
    } finally {
      setUserManagementLoading(false);
    }
  };

  const fetchSellers = async (page = 1, filters = {}) => {
    setUserManagementLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: filters.search || '',
        status: filters.status || 'all',
        verification: filters.verification || 'all'
      });

      const response = await axios.get(`${API_URL}/api/v1/admin/sellers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRealSellers(response.data.data.sellers);
        setUserPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('Failed to fetch sellers');
    } finally {
      setUserManagementLoading(false);
    }
  };

  const handleUserFilterChange = (filterType, value) => {
    const newFilters = { ...userFilters, [filterType]: value };
    setUserFilters(newFilters);
    setUserPagination(prev => ({ ...prev, currentPage: 1 }));
    
    if (activeUserType === 'buyers') {
      fetchBuyers(1, newFilters);
    } else {
      fetchSellers(1, newFilters);
    }
  };

  const handleUserPageChange = (newPage) => {
    setUserPagination(prev => ({ ...prev, currentPage: newPage }));
    
    if (activeUserType === 'buyers') {
      fetchBuyers(newPage, userFilters);
    } else {
      fetchSellers(newPage, userFilters);
    }
  };

  const handleToggleUserStatus = async (userId, action, userType) => {
    try {
      setUserManagementLoading(true);
      
      const endpoint = userType === 'buyers' 
        ? `/api/admin/users/${userId}/toggle-status`
        : `/api/admin/sellers/${userId}/${action}`;
      
      const response = await axios.post(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success(`User ${action} successfully`);
        
        // Refresh the current user list
        if (activeUserType === 'buyers') {
          await fetchBuyers(userPagination.currentPage, userFilters);
        } else {
          await fetchSellers(userPagination.currentPage, userFilters);
        }
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(error.response?.data?.message || 'Error updating user status');
    } finally {
      setUserManagementLoading(false);
    }
  };

  // Order management functions
  const fetchOrders = async (page = 1, filters = {}) => {
    try {
      setOrdersLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });

      const response = await axios.get(`${API_URL}/api/v1/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setOrderPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error fetching orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/orders/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setOrderStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const handleOrderFilterChange = (filterType, value) => {
    setOrderFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleOrderPageChange = (newPage) => {
    setOrderPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
    fetchOrders(newPage, orderFilters);
  };

  const handleViewOrderDetails = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Complaints management functions
  const fetchComplaints = async (page = 1, filters = {}) => {
    setComplaintsLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        ...filters
      };

      const response = await complaintService.getAllComplaints(params);
      
      if (response.success) {
        setComplaints(response.data.complaints);
        setComplaintPagination(response.data.pagination);
        setComplaintStats(response.data.stats);
      } else {
        toast.error(response.message || 'Failed to fetch complaints');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Error fetching complaints');
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleComplaintFilterChange = (filterType, value) => {
    setComplaintFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleComplaintPageChange = (newPage) => {
    setComplaintPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
    fetchComplaints(newPage, complaintFilters);
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  const handleUpdateComplaintStatus = async (complaintId, status, adminNotes) => {
    try {
      const response = await complaintService.updateComplaintStatus(complaintId, status, adminNotes);
      
      if (response.success) {
        toast.success('Complaint status updated successfully');
        setShowStatusModal(false);
        setStatusUpdateData({ status: '', adminNotes: '' });
        // Refresh complaints list
        fetchComplaints(complaintPagination.currentPage, complaintFilters);
      } else {
        toast.error(response.message || 'Failed to update complaint status');
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Error updating complaint status');
    }
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusUpdateData({ status: complaint.status, adminNotes: complaint.adminNotes || '' });
    setShowStatusModal(true);
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
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin h-8 w-8 text-primary" />
                <span className="ml-2 text-gray-600">Loading dashboard statistics...</span>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <FaExclamationCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={fetchDashboardStats}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Buyers Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Buyers</h3>
                    {loading ? (
                      <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-blue-600">{stats.totalBuyers}</p>
                    )}
                  </div>

                  {/* Total Sellers Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Sellers</h3>
                    {loading ? (
                      <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-green-600">{stats.totalSellers}</p>
                    )}
                  </div>

                  {/* Unverified Sellers Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Unverified Sellers</h3>
                    {loading ? (
                      <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-yellow-600">{stats.unverifiedSellers}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {salesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                    <div className="space-y-4">
                      {notifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <FaBell className="text-primary" />
                          <div>
                            <p className="text-sm font-medium">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'users':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              
              {/* User Type Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveUserType('buyers')}
                    className={`${
                      activeUserType === 'buyers'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Buyers
                  </button>
                  <button
                    onClick={() => setActiveUserType('sellers')}
                    className={`${
                      activeUserType === 'sellers'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Sellers
                  </button>
                </nav>
              </div>

              {/* Search and Filter */}
              <div className="mb-4 flex justify-between items-center">
                <div className="flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder={`Search ${activeUserType}...`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={userFilters.search}
                    onChange={(e) => handleUserFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={userFilters.status}
                    onChange={(e) => handleUserFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  {activeUserType === 'sellers' && (
                    <select
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={userFilters.verification}
                      onChange={(e) => handleUserFilterChange('verification', e.target.value)}
                    >
                      <option value="all">All Verification</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {userManagementLoading && (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin h-6 w-6 text-primary" />
                  <span className="ml-2 text-gray-600">Loading {activeUserType}...</span>
                </div>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeUserType === 'buyers' ? (
                      // Buyers List
                      realBuyers.map((buyer) => (
                        <tr 
                          key={buyer.id} 
                          onClick={() => handleRowClick(buyer)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={buyer.profilePhoto || 'https://via.placeholder.com/40'}
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{buyer.fullName}</div>
                                <div className="text-sm text-gray-500">{buyer.phoneNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{buyer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(buyer.joinedDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              buyer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {buyer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleUserStatus(buyer.id, 'suspend', 'buyer');
                              }}
                              className="text-red-600 hover:text-red-900 mr-4"
                            >
                              Suspend
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleUserStatus(buyer.id, 'activate', 'buyer');
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Activate
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Sellers List
                      realSellers.map((seller) => (
                        <tr 
                          key={seller.id} 
                          onClick={() => handleRowClick(seller)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={seller.profilePhoto || 'https://via.placeholder.com/40'}
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{seller.fullName}</div>
                                <div className="text-sm text-gray-500">{seller.businessName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{seller.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(seller.joinedDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              seller.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {seller.status}
                            </span>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  seller.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {seller.isVerified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/seller-approval/${seller.id}`);
                              }}
                              className="text-blue-600 hover:text-blue-900 font-medium mr-3"
                            >
                              View Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/suspension?sellerId=${seller.id}&sellerName=${encodeURIComponent(seller.fullName)}`);
                              }}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Suspend
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((userPagination.currentPage - 1) * 10) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(userPagination.currentPage * 10, userPagination.totalUsers)}</span> of{' '}
                  <span className="font-medium">{userPagination.totalUsers}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!userPagination.hasPrevPage}
                    onClick={() => handleUserPageChange(userPagination.currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {userPagination.currentPage} of {userPagination.totalPages}
                  </span>
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!userPagination.hasNextPage}
                    onClick={() => handleUserPageChange(userPagination.currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Management</h2>
              
              {/* Order Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-600">Total Orders</h3>
                  <p className="text-2xl font-bold text-blue-900">{orderStats.totalOrders}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-600">Pending</h3>
                  <p className="text-2xl font-bold text-yellow-900">{orderStats.pendingOrders}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-600">Delivered</h3>
                  <p className="text-2xl font-bold text-green-900">{orderStats.deliveredOrders}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-600">Revenue</h3>
                  <p className="text-2xl font-bold text-purple-900">${orderStats.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mb-4 flex justify-between items-center">
                <div className="flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={orderFilters.search}
                    onChange={(e) => handleOrderFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={orderFilters.status}
                    onChange={(e) => handleOrderFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => fetchOrders(1, orderFilters)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {ordersLoading && (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin h-6 w-6 text-primary" />
                  <span className="ml-2 text-gray-600">Loading orders...</span>
                </div>
              )}

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buyer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.buyer?.fullName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.buyer?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.seller?.businessInfo?.businessName || order.seller?.fullName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.seller?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${order.totalAmount?.toFixed(2) || '0.00'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewOrderDetails(order._id)}
                            className="text-primary hover:text-primary-dark mr-3"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((orderPagination.currentPage - 1) * 10) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(orderPagination.currentPage * 10, orderPagination.totalOrders)}</span> of{' '}
                  <span className="font-medium">{orderPagination.totalOrders}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!orderPagination.hasPrevPage}
                    onClick={() => handleOrderPageChange(orderPagination.currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {orderPagination.currentPage} of {orderPagination.totalPages}
                  </span>
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!orderPagination.hasNextPage}
                    onClick={() => handleOrderPageChange(orderPagination.currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'complaints':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Complaint Management</h2>
              
              {/* Complaint Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-600">Total Complaints</h3>
                  <p className="text-2xl font-bold text-blue-900">{complaintStats.total}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-600">Pending</h3>
                  <p className="text-2xl font-bold text-yellow-900">{complaintStats.pending}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-600">Resolved</h3>
                  <p className="text-2xl font-bold text-green-900">{complaintStats.resolved}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-red-600">Rejected</h3>
                  <p className="text-2xl font-bold text-red-900">{complaintStats.rejected}</p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mb-4 flex justify-between items-center">
                <div className="flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={complaintFilters.search}
                    onChange={(e) => handleComplaintFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={complaintFilters.status}
                    onChange={(e) => handleComplaintFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => fetchComplaints(1, complaintFilters)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {complaintsLoading && (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin h-6 w-6 text-primary" />
                  <span className="ml-2 text-gray-600">Loading complaints...</span>
                </div>
              )}

              {/* Complaints Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Complaint ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complaints.map((complaint) => (
                      <tr key={complaint._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{complaint._id.slice(-6)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{complaint.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(complaint.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewComplaint(complaint)}
                            className="text-primary hover:text-primary-dark mr-3"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => openStatusModal(complaint)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Update Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((complaintPagination.currentPage - 1) * 10) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(complaintPagination.currentPage * 10, complaintPagination.totalComplaints)}</span> of{' '}
                  <span className="font-medium">{complaintPagination.totalComplaints}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!complaintPagination.hasPrevPage}
                    onClick={() => handleComplaintPageChange(complaintPagination.currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {complaintPagination.currentPage} of {complaintPagination.totalPages}
                  </span>
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!complaintPagination.hasNextPage}
                    onClick={() => handleComplaintPageChange(complaintPagination.currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
            <p>This feature is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Show loading screen while checking authentication */}
      {authLoading || isCheckingAuth ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Top Navbar */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
              <div className="h-6 w-px bg-gray-200"></div>
              <p className="text-sm text-gray-500">Welcome back, {user?.fullName}</p>
            </div>
            <div className="flex items-center gap-6">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-primary relative transition-colors duration-200"
                >
                  <FaBell className="text-xl" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden ring-2 ring-primary ring-offset-2">
                    {user?.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt="Admin"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-lg" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/admin/profile');
                      }}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 w-full text-left transition-colors duration-200"
                    >
                      <FaUser className="mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium">View Profile</p>
                        <p className="text-xs text-gray-500">View your account details</p>
                      </div>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-200"
                    >
                      <FaSignOutAlt className="mr-3" />
                      <div>
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-red-500">Log out of your account</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-md h-[calc(100vh-4rem)] sticky top-16">
          <nav className="mt-6 px-3">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaChartPie className={`mr-3 ${activeTab === 'dashboard' ? 'text-white' : 'text-gray-400'}`} />
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange('orders')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'orders' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaShoppingCart className={`mr-3 ${activeTab === 'orders' ? 'text-white' : 'text-gray-400'}`} />
              Orders
            </button>
            <button
              onClick={() => handleTabChange('complaints')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'complaints' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaExclamationTriangle className={`mr-3 ${activeTab === 'complaints' ? 'text-white' : 'text-gray-400'}`} />
              Complaints
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'users' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaUsers className={`mr-3 ${activeTab === 'users' ? 'text-white' : 'text-gray-400'}`} />
              User Management
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'settings' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaCog className={`mr-3 ${activeTab === 'settings' ? 'text-white' : 'text-gray-400'}`} />
              Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
            <div className="flex-1">
          {renderContent()}
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Complaint Details</h2>
              <button
                onClick={() => setShowComplaintModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Complaint Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Complaint ID:</label>
                    <p className="text-gray-900">#{selectedComplaint._id.slice(-6)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Subject:</label>
                    <p className="text-gray-900">{selectedComplaint.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category:</label>
                    <p className="text-gray-900 capitalize">{selectedComplaint.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Priority:</label>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status:</label>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created:</label>
                    <p className="text-gray-900">{formatDate(selectedComplaint.createdAt)}</p>
                  </div>
                  {selectedComplaint.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Updated:</label>
                      <p className="text-gray-900">{formatDate(selectedComplaint.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">User Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">User Name:</label>
                    <p className="text-gray-900">{selectedComplaint.user?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email:</label>
                    <p className="text-gray-900">{selectedComplaint.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone:</label>
                    <p className="text-gray-900">{selectedComplaint.user?.phoneNumber || 'N/A'}</p>
                  </div>
                  {selectedComplaint.order && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Order Number:</label>
                        <p className="text-gray-900">#{selectedComplaint.order.orderNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Order Amount:</label>
                        <p className="text-gray-900">${selectedComplaint.order.totalAmount}</p>
                      </div>
                      {selectedComplaint.order.seller && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Seller:</label>
                            <p className="text-gray-900">{selectedComplaint.order.seller.fullName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Business:</label>
                            <p className="text-gray-900">{selectedComplaint.order.seller.businessInfo?.businessName || 'N/A'}</p>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>
            </div>
            
            {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Attachments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedComplaint.attachments.map((attachment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                      <p className="text-xs text-gray-500">{attachment.size} bytes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedComplaint.adminNotes && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Admin Notes</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedComplaint.adminNotes}</p>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => openStatusModal(selectedComplaint)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowComplaintModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Update Complaint Status</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusUpdateData.status}
                  onChange={(e) => setStatusUpdateData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={statusUpdateData.adminNotes}
                  onChange={(e) => setStatusUpdateData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add notes about the status update..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => handleUpdateComplaintStatus(selectedComplaint._id, statusUpdateData.status, statusUpdateData.adminNotes)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 