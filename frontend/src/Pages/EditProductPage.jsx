import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Constants for dropdown options
  const genderOptions = ["male", "female", "unisex"];
  const sportTypeOptions = [
    "gym", "running", "yoga", "basketball", "football", "tennis",
    "swimming", "cycling", "cricket", "boxing", "martial_arts",
    "casual_sports", "other"
  ];
  const wearTypeOptions = [
    "gym_wear", "casual_sports", "performance", "compression",
    "training", "competition", "recovery"
  ];
  const categoryOptions = [
    "tops", "bottoms", "shorts", "sports_bras", "jackets",
    "hoodies", "leggings", "socks", "shoes", "accessories"
  ];
  const materialOptions = [
    "polyester", "nylon", "spandex", "cotton", "lycra",
    "mesh", "dri_fit", "compression", "thermal", "hybrid"
  ];
  const qualityOptions = ["premium", "standard", "economy"];

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    gender: '',
    sportType: '',
    wearType: '',
    category: '',
    material: '',
    quality: '',
    images: [],
    variants: {
      colors: [],
      sizes: [],
      stockByVariant: []
    }
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = `${API_URL}/api/v1/products/${id}`;
      console.log('Fetching product from:', url);
      
      const response = await fetch(url, {
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
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    const requiredFields = ['name', 'description', 'price', 'gender', 'sportType', 'wearType', 'category', 'material', 'quality'];
    requiredFields.forEach(field => {
      if (!product[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Price validation
    if (product.price && (isNaN(product.price) || product.price <= 0)) {
      newErrors.price = 'Price must be a positive number';
    }

    // Images validation
    if (product.images.length + newImages.length - removedImages.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    // Variants validation
    if (!product.variants.colors.length) {
      newErrors.colors = 'At least one color is required';
    }
    if (!product.variants.sizes.length) {
      newErrors.sizes = 'At least one size is required';
    }
    if (!product.variants.stockByVariant.length) {
      newErrors.stock = 'Stock information is required for at least one variant';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVariantChange = (type, value) => {
    setProduct(prev => {
      const newVariants = {
        ...prev.variants,
        [type]: value
      };

      // If colors or sizes are changed, update stockByVariant
      if (type === 'colors' || type === 'sizes') {
        // Keep only valid combinations
        newVariants.stockByVariant = prev.variants.stockByVariant.filter(variant => {
          if (type === 'colors') {
            return value.includes(variant.color);
          } else {
            return value.includes(variant.size);
          }
        });

        // Add new combinations with default stock of 0
        const existingCombinations = new Set(
          newVariants.stockByVariant.map(v => `${v.color}-${v.size}`)
        );

        newVariants.colors.forEach(color => {
          newVariants.sizes.forEach(size => {
            const combination = `${color}-${size}`;
            if (!existingCombinations.has(combination)) {
              newVariants.stockByVariant.push({
                color,
                size,
                stock: 0
              });
            }
          });
        });
      }

      return {
        ...prev,
        variants: newVariants
      };
    });
  };

  const handleStockChange = (index, field, value) => {
    setProduct(prev => {
      const newStockByVariant = [...prev.variants.stockByVariant];
      newStockByVariant[index] = {
        ...newStockByVariant[index],
        [field]: parseInt(value) || 0
      };

      // Calculate total stock
      const totalStock = newStockByVariant.reduce(
        (sum, variant) => sum + (variant.stock || 0),
        0
      );

      return {
        ...prev,
        stock: totalStock,
        variants: {
          ...prev.variants,
          stockByVariant: newStockByVariant
        }
      };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length + product.images.length - removedImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setNewImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index, isNew = false) => {
    if (isNew) {
      setNewImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setRemovedImages(prev => [...prev, product.images[index]]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setSaving(true);
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Calculate total stock from variants
      const totalStock = product.variants.stockByVariant.reduce(
        (sum, variant) => sum + (parseInt(variant.stock) || 0),
        0
      );

      // Prepare product data with the same structure as AddProduct
      const productData = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: Number(product.price),
        gender: product.gender,
        sportType: product.sportType,
        wearType: product.wearType,
        category: product.category,
        material: product.material,
        quality: product.quality,
        features: product.features || [],
        specifications: {
          fit: product.specifications?.fit || "regular",
          weight: product.specifications?.weight || "0g",
          care: product.specifications?.care || "Machine wash cold, tumble dry low"
        },
        variants: {
          colors: product.variants.colors || [],
          sizes: product.variants.sizes || [],
          stockByVariant: product.variants.stockByVariant.map(variant => ({
            ...variant,
            stock: parseInt(variant.stock) || 0
          }))
        },
        stock: totalStock,
        status: "pending",
        images: product.images.filter(Boolean)
      };

      // Log the data being sent
      console.log('Sending update request with data:', productData);

      // Append product data as JSON string
      formData.append('productData', JSON.stringify(productData));
      
      // Append new images
      newImages.forEach(image => {
        formData.append('images', image);
      });

      // Append removed images
      if (removedImages.length > 0) {
        formData.append('removedImages', JSON.stringify(removedImages));
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/v1/seller/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Update response:', data);

      if (data.success) {
        toast.success('Product updated successfully');
        navigate('/seller/dashboard');
      } else {
        throw new Error(data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  // Update functions for individual fields
  const updateName = async (newName) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      const productData = {
        ...product,
        name: newName.trim()
      };
      formData.append('productData', JSON.stringify(productData));
      
      const response = await fetch(`${API_URL}/api/v1/seller/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update name API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Update name response:', data);
      
      if (data.success) {
        setProduct(prev => ({ ...prev, name: newName }));
        toast.success('Product name updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update name');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error(error.message || 'Failed to update name');
    }
  };

  const updatePrice = async (newPrice) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Prepare product data with the same structure as AddProduct
      const productData = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: Number(newPrice),
        gender: product.gender,
        sportType: product.sportType,
        wearType: product.wearType,
        category: product.category,
        material: product.material,
        quality: product.quality,
        features: product.features || [],
        specifications: {
          fit: product.specifications?.fit || "regular",
          weight: product.specifications?.weight || "0g",
          care: product.specifications?.care || "Machine wash cold, tumble dry low"
        },
        variants: {
          colors: product.variants.colors || [],
          sizes: product.variants.sizes || [],
          stockByVariant: product.variants.stockByVariant || []
        },
        stock: product.stock,
        status: "pending",
        images: product.images || []
      };

      console.log('Sending price update with data:', productData);
      
      const response = await fetch(`${API_URL}/api/v1/seller/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productData })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update price API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Update price response:', data);
      
      if (data.success) {
        setProduct(prev => ({ ...prev, price: Number(newPrice) }));
        toast.success('Price updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update price');
      }
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error(error.message || 'Failed to update price');
    }
  };

  const updateDescription = async (newDescription) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const productData = {
        ...product,
        description: newDescription.trim()
      };
      
      const response = await fetch(`${API_URL}/api/v1/seller/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productData })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update description API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Update description response:', data);
      
      if (data.success) {
        setProduct(prev => ({ ...prev, description: newDescription }));
        toast.success('Description updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update description');
      }
    } catch (error) {
      console.error('Error updating description:', error);
      toast.error(error.message || 'Failed to update description');
    }
  };

  const updateCategory = async (field, value) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const productData = {
        ...product,
        [field]: value
      };
      
      const response = await fetch(`${API_URL}/api/v1/seller/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productData })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Update ${field} API Error Response:`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Update ${field} response:`, data);
      
      if (data.success) {
        setProduct(prev => ({ ...prev, [field]: value }));
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
      } else {
        throw new Error(data.message || `Failed to update ${field}`);
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(error.message || `Failed to update ${field}`);
    }
  };

  const updateVariants = async (newVariants) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const totalStock = newVariants.stockByVariant.reduce(
        (sum, variant) => sum + (parseInt(variant.stock) || 0),
        0
      );

      const productData = {
        ...product,
        variants: newVariants,
        stock: totalStock
      };
      
      const response = await fetch(`${API_URL}/api/v1/seller/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productData })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update variants API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Update variants response:', data);
      
      if (data.success) {
        setProduct(prev => ({ ...prev, variants: newVariants, stock: totalStock }));
        toast.success('Variants updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update variants');
      }
    } catch (error) {
      console.error('Error updating variants:', error);
      toast.error(error.message || 'Failed to update variants');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-lg shadow-sm p-4 transform transition-all duration-300 hover:shadow-md">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
          >
            <FaArrowLeft className="mr-2 transform transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Edit Product
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg p-6 transform transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
                    className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => updateName(product.name)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Update
                  </button>
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.name}</p>
                )}
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={(e) => setProduct(prev => ({ ...prev, price: e.target.value }))}
                    className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => updatePrice(product.price)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Update
                  </button>
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.price}</p>
                )}
              </div>

              <div className="md:col-span-2 transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="flex gap-2">
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
                    rows="4"
                    className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => updateDescription(product.description)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Update
                  </button>
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white shadow-sm rounded-lg p-6 transform transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
              Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="flex gap-2">
                  <select
                    name="gender"
                    value={product.gender}
                    onChange={(e) => setProduct(prev => ({ ...prev, gender: e.target.value }))}
                    className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => updateCategory('gender', product.gender)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Update
                  </button>
                </div>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.gender}</p>
                )}
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Type
                </label>
                <div className="flex gap-2">
                  <select
                    name="sportType"
                    value={product.sportType}
                    onChange={(e) => setProduct(prev => ({ ...prev, sportType: e.target.value }))}
                    className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.sportType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Sport Type</option>
                    {sportTypeOptions.map(option => (
                      <option key={option} value={option}>
                        {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => updateCategory('sportType', product.sportType)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Update
                  </button>
                </div>
                {errors.sportType && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.sportType}</p>
                )}
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wear Type
                </label>
                <div className="flex gap-2">
                  <select
                    name="wearType"
                    value={product.wearType}
                    onChange={(e) => setProduct(prev => ({ ...prev, wearType: e.target.value }))}
                    className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.wearType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Wear Type</option>
                    {wearTypeOptions.map(option => (
                      <option key={option} value={option}>
                        {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => updateCategory('wearType', product.wearType)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Update
                  </button>
                </div>
                {errors.wearType && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.wearType}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white shadow-sm rounded-lg p-6 transform transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
              Product Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex gap-2">
                  <select
                    name="category"
                    value={product.category}
                    onChange={(e) => setProduct(prev => ({ ...prev, category: e.target.value }))}
                    className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(option => (
                      <option key={option} value={option}>
                        {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => updateCategory('category', product.category)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Update
                  </button>
                </div>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.category}</p>
                )}
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material
                </label>
                <div className="flex gap-2">
                  <select
                    name="material"
                    value={product.material}
                    onChange={(e) => setProduct(prev => ({ ...prev, material: e.target.value }))}
                    className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.material ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Material</option>
                    {materialOptions.map(option => (
                      <option key={option} value={option}>
                        {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => updateCategory('material', product.material)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Update
                  </button>
                </div>
                {errors.material && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.material}</p>
                )}
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality
                </label>
                <div className="flex gap-2">
                  <select
                    name="quality"
                    value={product.quality}
                    onChange={(e) => setProduct(prev => ({ ...prev, quality: e.target.value }))}
                    className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.quality ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Quality</option>
                    {qualityOptions.map(option => (
                      <option key={option} value={option}>
                        {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => updateCategory('quality', product.quality)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Update
                  </button>
                </div>
                {errors.quality && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.quality}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white shadow-sm rounded-lg p-6 transform transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
              Images
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {newImages.map((image, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, true)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {product.images.length + newImages.length - removedImages.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Upload Image</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {errors.images && (
                <p className="text-sm text-red-600 animate-shake">{errors.images}</p>
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white shadow-sm rounded-lg p-6 transform transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
              Variants
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colors
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'].map((color) => (
                    <label key={color} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={product.variants.colors.includes(color)}
                        onChange={(e) => {
                          const newColors = e.target.checked
                            ? [...product.variants.colors, color]
                            : product.variants.colors.filter(c => c !== color);
                          handleVariantChange('colors', newColors);
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">{color}</span>
                    </label>
                  ))}
                </div>
                {errors.colors && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.colors}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <label key={size} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={product.variants.sizes.includes(size)}
                        onChange={(e) => {
                          const newSizes = e.target.checked
                            ? [...product.variants.sizes, size]
                            : product.variants.sizes.filter(s => s !== size);
                          handleVariantChange('sizes', newSizes);
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">{size}</span>
                    </label>
                  ))}
                </div>
                {errors.sizes && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.sizes}</p>
                )}
              </div>

              {/* Stock by Variant */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Stock by Variant</h3>
                <div className="space-y-4">
                  {product.variants.colors.map((color) => (
                    <div key={color} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{color}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {product.variants.sizes.map((size) => {
                          const variantIndex = product.variants.stockByVariant.findIndex(
                            v => v.color === color && v.size === size
                          );
                          const stock = variantIndex !== -1
                            ? product.variants.stockByVariant[variantIndex].stock
                            : 0;

                          return (
                            <div key={`${color}-${size}`}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {size}
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  if (variantIndex !== -1) {
                                    handleStockChange(variantIndex, 'stock', value);
                                  } else {
                                    const newStock = {
                                      color,
                                      size,
                                      stock: value
                                    };
                                    setProduct(prev => ({
                                      ...prev,
                                      variants: {
                                        ...prev.variants,
                                        stockByVariant: [...prev.variants.stockByVariant, newStock]
                                      }
                                    }));
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600 animate-shake">{errors.stock}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save All Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage; 