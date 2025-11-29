import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaBox, FaTag, FaInfoCircle, FaSun, FaMoon, FaTshirt, FaRunning, FaVenusMars, FaLayerGroup, FaWarehouse, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const SellerProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/v1/seller/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Product response:', data);

      if (data.success) {
        setProduct(data.product);
      } else {
        throw new Error(data.message || 'Failed to fetch product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
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
          container: 'my-swal',
          popup: 'my-swal-popup',
          header: 'my-swal-header',
          title: 'my-swal-title',
          closeButton: 'my-swal-close',
          icon: 'my-swal-icon',
          image: 'my-swal-image',
          content: 'my-swal-content',
          input: 'my-swal-input',
          actions: 'my-swal-actions',
          confirmButton: 'my-swal-confirm',
          cancelButton: 'my-swal-cancel',
          footer: 'my-swal-footer'
        },
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        },
        focusConfirm: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        stopKeydownPropagation: false,
        showCloseButton: true
      });
      
      if (result.isConfirmed) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/v1/seller/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Delete API Error Response:", errorText);
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Delete response:', data);

        if (data.success) {
          await Swal.fire({
            title: 'Deleted!',
            text: 'Product has been deleted successfully.',
            icon: 'success',
            confirmButtonColor: '#28a745',
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'my-swal-confirm'
            }
          });
          navigate('/seller/dashboard');
        } else {
          throw new Error(data.message || 'Failed to delete product');
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to delete product. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'my-swal-confirm'
        }
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} flex justify-center items-center transition-colors duration-300`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} flex flex-col items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 max-w-md w-full transform transition-all duration-300 hover:scale-105`}>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-4 text-center`}>Error</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-center mb-6`}>{error}</p>
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} flex flex-col items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 max-w-md w-full transform transition-all duration-300 hover:scale-105`}>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4 text-center`}>Product Not Found</h2>
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with Dark Mode Toggle */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 mb-8 transform transition-all duration-300 hover:shadow-2xl`}>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/seller/dashboard')}
                className={`flex items-center px-6 py-3 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transform transition-all duration-300 hover:scale-105`}
              >
                {darkMode ? <FaSun className="w-6 h-6" /> : <FaMoon className="w-6 h-6" />}
              </button>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(`/seller/edit-product/${id}`)}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaEdit className="mr-2" />
                Edit Product
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <FaTrash className="mr-2" />
                Delete Product
              </button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 transform transition-all duration-300 hover:shadow-2xl`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Product Gallery</h2>
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-xl">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transform transition-all duration-300 hover:scale-105"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {product.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover transform transition-all duration-300 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 transform transition-all duration-300 hover:shadow-2xl`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Product Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaBox className={`w-5 h-5 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaTag className={`w-5 h-5 mr-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>${product.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaWarehouse className={`w-5 h-5 mr-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.stock} units</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaLayerGroup className={`w-5 h-5 mr-3 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Status & Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="flex items-center mr-3">
                        {getStatusIcon(product.status)}
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                        <p className={`font-medium ${getStatusColor(product.status)}`}>{product.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaTshirt className={`w-5 h-5 mr-3 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Wear Type</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.wearType}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaRunning className={`w-5 h-5 mr-3 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sport Type</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.sportType}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaVenusMars className={`w-5 h-5 mr-3 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gender</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.gender}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 transform transition-all duration-300 hover:shadow-2xl`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Description</h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 transform transition-all duration-300 hover:shadow-2xl`}>
                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Variants</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Colors */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.colors.map((color, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Sizes */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Sizes</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.sizes.map((size, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Stock by Variant */}
                {product.variants.stockByVariant && product.variants.stockByVariant.length > 0 && (
                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Stock by Variant</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.variants.stockByVariant.map((variant, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {variant.color} - {variant.size}
                          </p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {variant.stock} units
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Details */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 transform transition-all duration-300 hover:shadow-2xl`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Additional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Product Specifications</h3>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Material</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.material}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quality</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.quality}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Timestamps</h3>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductPage; 