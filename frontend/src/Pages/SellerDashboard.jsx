import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBox, FaPlus, FaChartLine, FaUser, FaSignOutAlt, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaSun, FaMoon, FaShoppingCart, FaSync } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import SellerOrders from '../components/SellerOrders';
import SellerActualViewOrder from './SellerActualViewOrder';
import 'react-toastify/dist/ReactToastify.css';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    activeProducts: 0,
    totalSales: 0
  });

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    // Set active tab based on URL
    if (location.pathname === '/seller/orders') {
      setActiveTab('orders');
    } else {
      setActiveTab('products');
    }
    
    const fetchWithCleanup = async () => {
      if (!isMounted) return;
      
      try {
        await Promise.all([
          fetchProducts(abortController.signal),
          fetchStats(abortController.signal)
        ]);
      } catch (error) {
        if (isMounted && error.name !== 'AbortError' && error.name !== 'CanceledError') {
          console.error('Error fetching dashboard data:', error);
        }
      }
    };

    fetchWithCleanup();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [location.pathname]);

  // Auto-refresh dashboard every 30 seconds
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const interval = setInterval(() => {
      if (!isMounted) {
        clearInterval(interval);
        return;
      }
      
      if (activeTab === 'products') {
        setIsAutoRefreshing(true);
        Promise.all([
          fetchProducts(abortController.signal),
          fetchStats(abortController.signal)
        ]).finally(() => {
          if (isMounted) {
            setIsAutoRefreshing(false);
          }
        });
      }
    }, 30000); // 30 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
      abortController.abort();
    };
  }, [activeTab]);

  const fetchProducts = async (signal = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        toast.error('Please login to view products');
        navigate('/signin');
        return;
      }

      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log('API URL:', apiUrl);
      console.log('Fetching products from:', `${apiUrl}/api/v1/seller/products`);
      
      const fetchOptions = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      if (signal) {
        fetchOptions.signal = signal;
      }
      
      const response = await fetch(`${apiUrl}/api/v1/seller/products`, fetchOptions);

      // Check if request was aborted
      if (signal?.aborted) {
        return;
      }

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check again if request was aborted before setting state
      if (signal?.aborted) {
        return;
      }
      
      console.log('Products response:', data);

      if (data.success) {
        setProducts(data.products || []);
        console.log('Set products:', data.products || []);
        // Update active products count
        setStats(prevStats => ({
          ...prevStats,
          activeProducts: (data.products || []).filter(p => p.status === 'approved').length
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      // Ignore abort errors
      if (error.name === 'AbortError' || signal?.aborted) {
        return;
      }
      
      console.error('Error fetching products:', error);
      toast.error(error.message || 'Failed to fetch products');
      
      // If unauthorized, redirect to login
      if (error.message.includes('unauthorized') || error.message.includes('token')) {
        navigate('/signin');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const fetchStats = async (signal = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        toast.error('Please login to view dashboard');
        navigate('/signin');
        return;
      }

      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log('API URL:', apiUrl);
      console.log('Fetching dashboard data from:', `${apiUrl}/api/v1/seller/dashboard`);
      
      const fetchOptions = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      if (signal) {
        fetchOptions.signal = signal;
      }
      
      const response = await fetch(`${apiUrl}/api/v1/seller/dashboard`, fetchOptions);

      // Check if request was aborted
      if (signal?.aborted) {
        return;
      }

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check again if request was aborted before setting state
      if (signal?.aborted) {
        return;
      }
      
      console.log('Dashboard data response:', data);

      if (data.success) {
        setStats(prevStats => ({
          ...prevStats,
          totalProducts: data.productCount || 0,
          totalStock: data.totalStock || 0,
          activeProducts: products.filter(p => p.status === 'approved').length,
          totalSales: 0 // Will be implemented later with orders
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      // Ignore abort errors
      if (error.name === 'AbortError' || signal?.aborted) {
        return;
      }
      
      console.error('Error fetching stats:', error);
      toast.error(error.message || 'Failed to fetch dashboard statistics');
      
      // If unauthorized, redirect to login
      if (error.message.includes('unauthorized') || error.message.includes('token')) {
        navigate('/signin');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
    toast.success('Logged out successfully');
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchStats()]);
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!user) {
      toast.error('Please sign in to add products');
      navigate('/signin');
      return;
    }

    if (!user.isVerified) {
      toast.error('Your account needs to be verified before you can add products. Please wait for admin approval.');
      return;
    }

    navigate('/seller/add-product');
  };

  const handleEditProduct = (productId) => {
    navigate(`/seller/edit-product/${productId}`);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        buttonsStyling: true,
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-secondary'
        },
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      
      if (result.isConfirmed) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/v1/seller/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Delete API Error Response:", errorText);
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          await Swal.fire({
            title: 'Deleted!',
            text: 'Product has been deleted successfully.',
            icon: 'success',
            confirmButtonColor: '#28a745',
            confirmButtonText: 'OK'
          });
          // Refresh the products list and stats
          await Promise.all([fetchProducts(), fetchStats()]);
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to delete product. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/seller/product/${productId}`);
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/v1/seller/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Status Change API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Product status updated successfully');
        fetchProducts();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    }
  };

  // Enhanced filtering logic with debugging
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    console.log(`Product: ${product.name}, Status: ${product.status}, Filter: ${filterStatus}, Matches: ${matchesSearch && matchesStatus}`);
    
    return matchesSearch && matchesStatus;
  });

  console.log('Current filter status:', filterStatus);
  console.log('Total products:', products.length);
  console.log('Filtered products:', filteredProducts.length);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md sticky top-0 z-10 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'}`}>
                Seller Dashboard
              </h1>
              {isAutoRefreshing && (
                <div className="ml-3 flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <FaSync className="h-4 w-4 animate-spin mr-1" />
                  <span>Auto-refreshing...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-blue-300 hover:bg-gray-600' : 'bg-gray-100 text-blue-700 hover:bg-gray-200'} transition-colors duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh Dashboard"
              >
                <FaSync className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-300`}
              >
                {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
              </button>
              <Link
                to="/seller/profile"
                className={`flex items-center ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200`}
              >
                <FaUser className="h-5 w-5" />
                <span className="ml-2 font-medium">Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className={`flex items-center ${darkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'} transition-colors duration-200`}
              >
                <FaSignOutAlt className="h-5 w-5" />
                <span className="ml-2 font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <FaBox className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Products</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                <FaChartLine className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Stock</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalStock}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                <FaChartLine className={`h-8 w-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Approved Products</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeProducts}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <FaShoppingCart className={`h-8 w-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Sales</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${stats.totalSales}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaBox className="inline mr-2" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaShoppingCart className="inline mr-2" />
            Orders
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-300`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Products</h2>
              <button
                onClick={handleAddProduct}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
              >
                <FaPlus className="text-sm" />
                Add New Product
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300`}
                  />
                  <FaSearch className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300`}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Debug Info */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Debug: Filter: {filterStatus} | Total Products: {products.length} | Filtered: {filteredProducts.length}
              </p>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Product</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Price</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Stock</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className={`px-6 py-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/40'}
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</div>
                              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>${product.price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={product.status}
                            onChange={(e) => handleStatusChange(product._id, e.target.value)}
                            className={`text-sm rounded-full px-3 py-1 font-semibold ${
                              product.status === 'approved'
                                ? darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                                : product.status === 'rejected'
                                ? darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                                : darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleViewProduct(product._id)}
                              className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'} transition-colors duration-200`}
                            >
                              <FaEye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product._id)}
                              className={`${darkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-900'} transition-colors duration-200`}
                            >
                              <FaEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'} transition-colors duration-200`}
                            >
                              <FaTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <SellerOrders />
        )}
      </main>
    </div>
  );
};

export default SellerDashboard; 