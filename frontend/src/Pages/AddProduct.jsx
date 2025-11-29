import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { FaUpload, FaTimes, FaSun, FaMoon, FaBox, FaTshirt, FaRunning, FaTag } from "react-icons/fa";
import SellerHeader from "../components/SellerHeader/SellerHeader";
import Footer from "../components/Footer/Footer";

const AddProduct = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    console.log('AddProduct useEffect - user:', user);
    
    // Check if user is logged in
    if (!user) {
      console.log('No user found, redirecting to signin');
      toast.error('Please sign in to add products');
      navigate('/signin');
      return;
    }

    // Check if user is a seller
    if (user.role !== 'seller') {
      console.log('User is not a seller, redirecting to dashboard');
      toast.error('Only sellers can add products');
      navigate('/');
      return;
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.log('User is not verified, redirecting to seller dashboard');
      toast.error('Your account needs to be verified before you can add products. Please wait for admin approval.');
      navigate('/seller/dashboard');
      return;
    }

    console.log('User is authenticated and verified, showing AddProduct page');
  }, [user, navigate]);

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Sport types from the model
  const sportTypes = [
    "gym", "running", "yoga", "basketball", "football", "tennis",
    "swimming", "cycling", "cricket", "boxing", "martial_arts",
    "casual_sports", "other"
  ];

  // Wear types from the model
  const wearTypes = [
    "gym_wear", "casual_sports", "performance", "compression",
    "training", "competition", "recovery"
  ];

  // Categories from the model
  const categories = [
    "tops", "bottoms", "shorts", "sports_bras", "jackets",
    "hoodies", "leggings", "socks", "shoes", "accessories"
  ];

  // Materials from the model
  const materials = [
    "polyester", "nylon", "spandex", "cotton", "lycra",
    "mesh", "dri_fit", "compression", "thermal", "hybrid"
  ];

  // Features from the model
  const availableFeatures = [
    "moisture_wicking", "quick_dry", "breathable", "anti_odor",
    "uv_protection", "compression", "thermal_regulation",
    "water_resistant", "reflective", "padded"
  ];

  // Initialize formData with seller information
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    gender: "male",
    sportType: "gym",
    wearType: "gym_wear",
    category: "tops",
    material: "polyester",
    quality: "standard",
    features: [],
    specifications: {
      fit: "regular",
      weight: "",
      care: ""
    },
    customization: false,
    shipping: {
      weight: "",
      dimensions: "",
      freeShipping: false
    },
    variants: {
    colors: [],
      sizes: [],
      stockByVariant: []
    },
    images: [],
    seller: user?.id, // Add seller ID from logged-in user
    status: "pending"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate user is logged in
    if (!user) {
      toast.error("Please sign in to add products");
      navigate('/signin');
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      // Calculate total stock
      const totalStock = formData.variants.stockByVariant.reduce((sum, variant) => sum + (variant.stock || 0), 0);

      // Prepare product data with default values and ensure all required fields are present
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        gender: formData.gender || "unisex",
        sportType: formData.sportType || "gym",
        wearType: formData.wearType || "gym_wear",
        category: formData.category || "tops",
        material: formData.material || "polyester",
        quality: formData.quality || "standard",
        features: formData.features || [],
        specifications: {
          fit: formData.specifications.fit || "regular",
          weight: formData.specifications.weight || "0g",
          care: formData.specifications.care || "Machine wash cold, tumble dry low"
        },
        variants: {
          colors: formData.variants.colors || [],
          sizes: formData.variants.sizes || [],
          stockByVariant: formData.variants.stockByVariant || []
        },
        stock: totalStock,
        status: "pending",
        images: formData.images || []
      };

      // Log the request data for debugging
      console.log('Sending product data:', productData);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Log the API URL for debugging
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('API URL:', `${API_URL}/api/v1/products`);
      console.log('Form data:', formData);

      const response = await fetch(`${API_URL}/api/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productData })
      });

      // Log the response status and headers for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error('Server response:', errorData);
        
        // Handle validation errors
        if (errorData.errors) {
          Object.values(errorData.errors).forEach(error => {
            toast.error(error);
          });
        } else {
          throw new Error(errorData.message || 'Failed to add product');
        }
        return;
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Product added successfully!");
        navigate("/seller/dashboard");
      } else {
        throw new Error(result.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    // Validate total number of files
    if (files.length + formData.images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Process each file
    const processFile = (file) => {
      return new Promise((resolve, reject) => {
        if (file.size > maxSize) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          reject();
          return;
        }
        if (!allowedTypes.includes(file.type)) {
          toast.error(`${file.name} is not a supported image type`);
          reject();
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject();
        reader.readAsDataURL(file);
      });
    };

    // Process all files
    Promise.all(files.map(processFile))
      .then(results => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...results]
        }));
      })
      .catch(error => {
        console.error('Error processing images:', error);
      });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleStockChange = (color, size, value) => {
    const stockValue = parseInt(value) || 0;
    const newStockByVariant = [...formData.variants.stockByVariant];
    const existingIndex = newStockByVariant.findIndex(
      v => v.color === color && v.size === size
    );

    if (existingIndex >= 0) {
      newStockByVariant[existingIndex].stock = stockValue;
    } else {
      newStockByVariant.push({
        color,
        size,
        stock: stockValue,
        soldCount: 0
      });
    }

    setFormData({
      ...formData,
      variants: {
        ...formData.variants,
        stockByVariant: newStockByVariant
      }
    });
  };

  const validateForm = () => {
    const errors = [];

    // Required fields validation
    if (!formData.name.trim()) {
      errors.push("Product name is required");
    } else if (formData.name.length < 3) {
      errors.push("Product name must be at least 3 characters long");
    }

    if (!formData.description.trim()) {
      errors.push("Product description is required");
    } else if (formData.description.length < 10) {
      errors.push("Description must be at least 10 characters long");
    }

    if (!formData.price) {
      errors.push("Product price is required");
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.push("Price must be a valid positive number");
    }

    // Validate specifications
    if (!formData.specifications.fit) {
      errors.push("Fit specification is required");
    }

    if (!formData.specifications.weight) {
      errors.push("Weight specification is required");
    }

    if (!formData.specifications.care) {
      errors.push("Care instructions are required");
    }

    // Validate variants
    if (!formData.variants.colors.length) {
      errors.push("At least one color variant is required");
    }

    if (!formData.variants.sizes.length) {
      errors.push("At least one size variant is required");
    }

    // Validate stock
    const hasStock = formData.variants.stockByVariant.some(variant => variant.stock > 0);
    if (!hasStock) {
      errors.push("At least one variant must have stock");
    }

    // Validate images
    if (!formData.images.length) {
      errors.push("At least one product image is required");
    }

    return errors;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SellerHeader />
      <div className={`flex-grow ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} py-8 transition-colors duration-300`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl`}>
            <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent`}>
                  Add New Product
                </h1>
                <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fill in the details below to add your product to the marketplace
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} hover:shadow-md transition-all duration-300 transform hover:scale-105`}
              >
                {darkMode ? <FaSun className="w-6 h-6" /> : <FaMoon className="w-6 h-6" />}
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Basic Information */}
              <div className={`space-y-6 p-8 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-gray-50 to-white'} shadow-sm hover:shadow-md transition-all duration-300 border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                    <FaBox className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Basic Information
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Product Name *
                    </label>
              <input
                type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      placeholder="Enter product name"
                required
              />
            </div>
            
                  <div className="space-y-2">
                    <label htmlFor="price" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Price (PKR) *
                    </label>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>₨</span>
              <input
                type="number"
                        id="price"
                name="price"
                        value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                        className={`w-full pl-8 pr-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                    placeholder="Enter product description"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="gender" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Gender *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="sportType" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sport Type *
                    </label>
                    <select
                      id="sportType"
                      name="sportType"
                      value={formData.sportType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      required
                    >
                      <option value="">Select sport type</option>
                      {sportTypes.map(type => (
                        <option key={type} value={type}>
                          {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="wearType" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Wear Type *
                    </label>
                    <select
                      id="wearType"
                      name="wearType"
                      value={formData.wearType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      required
                    >
                      <option value="">Select wear type</option>
                      {wearTypes.map(type => (
                        <option key={type} value={type}>
                          {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="category" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="material" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Material *
                    </label>
                    <select
                      id="material"
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                required
                    >
                      <option value="">Select material</option>
                      {materials.map(material => (
                        <option key={material} value={material}>
                          {material.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
            </div>
            
                  <div className="space-y-2">
                    <label htmlFor="quality" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Quality *
                    </label>
                    <select
                      id="quality"
                      name="quality"
                      value={formData.quality}
                onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                required
                    >
                      <option value="">Select quality</option>
                      <option value="premium">Premium</option>
                      <option value="standard">Standard</option>
                      <option value="economy">Economy</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className={`space-y-6 p-8 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-gray-50 to-white'} shadow-sm hover:shadow-md transition-all duration-300 border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <FaTag className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Product Features
                  </h2>
            </div>
            
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableFeatures.map(feature => (
                    <label
                      key={feature}
                      className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                        formData.features.includes(feature)
                          ? darkMode
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-purple-100 text-purple-600'
                          : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                      className="hidden"
                    />
                      <span className="flex-1">
                        {feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                  </label>
                    ))}
                  </div>
              </div>

              {/* Specifications */}
              <div className={`space-y-6 p-8 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-gray-50 to-white'} shadow-sm hover:shadow-md transition-all duration-300 border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                    <FaTshirt className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  </div>
                  <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Specifications
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="specifications.fit" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fit *
                    </label>
                    <select
                      id="specifications.fit"
                      name="specifications.fit"
                      value={formData.specifications.fit}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      required
                    >
                      <option value="">Select fit</option>
                      <option value="regular">Regular</option>
                      <option value="slim">Slim</option>
                      <option value="loose">Loose</option>
                      <option value="compression">Compression</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="specifications.weight" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Weight *
                    </label>
                    <input
                      type="text"
                      id="specifications.weight"
                      name="specifications.weight"
                      value={formData.specifications.weight}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      placeholder="e.g., 200g"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="specifications.care" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Care Instructions
                    </label>
                    <textarea
                      id="specifications.care"
                      name="specifications.care"
                      value={formData.specifications.care}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      placeholder="Enter care instructions"
                    />
                  </div>
                </div>
              </div>

              {/* Product Variants */}
              <div className={`space-y-6 p-8 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-gray-50 to-white'} shadow-sm hover:shadow-md transition-all duration-300 border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <FaTshirt className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Product Variants
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Colors */}
                  <div className="space-y-4">
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Available Colors
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange'].map((color) => (
                        <label
                          key={color}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                            formData.variants.colors.includes(color)
                              ? darkMode
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-green-100 text-green-600'
                              : darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                  <input
                    type="checkbox"
                            checked={formData.variants.colors.includes(color)}
                            onChange={() => {
                              const newColors = formData.variants.colors.includes(color)
                                ? formData.variants.colors.filter(c => c !== color)
                                : [...formData.variants.colors, color];
                              setFormData(prev => ({
                                ...prev,
                                variants: {
                                  ...prev.variants,
                                  colors: newColors
                                }
                              }));
                            }}
                            className="hidden"
                          />
                          <span>{color}</span>
                  </label>
                      ))}
                          </div>
                        </div>
                        
                  {/* Sizes */}
                  <div className="space-y-4">
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Available Sizes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <label
                          key={size}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                            formData.variants.sizes.includes(size)
                              ? darkMode
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-green-100 text-green-600'
                              : darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                            <input
                              type="checkbox"
                            checked={formData.variants.sizes.includes(size)}
                            onChange={() => {
                              const newSizes = formData.variants.sizes.includes(size)
                                ? formData.variants.sizes.filter(s => s !== size)
                                : [...formData.variants.sizes, size];
                              setFormData(prev => ({
                                ...prev,
                                variants: {
                                  ...prev.variants,
                                  sizes: newSizes
                                }
                              }));
                            }}
                            className="hidden"
                          />
                          <span>{size}</span>
                            </label>
                      ))}
                          </div>
                        </div>

                  {/* Variant Stock */}
                  {formData.variants.colors.length > 0 && formData.variants.sizes.length > 0 && (
                    <div className="space-y-4">
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Stock by Variant
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {formData.variants.colors.map((color) => (
                          formData.variants.sizes.map((size) => (
                            <div key={`${color}-${size}`} className="border rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div 
                                  className="w-6 h-6 rounded-full border" 
                                  style={{ backgroundColor: color }}
                                />
                                <span className="font-medium">{size}</span>
                              </div>
                                  <input
                                        type="number"
                                        min="0"
                                placeholder="Quantity"
                                value={formData.variants.stockByVariant.find(
                                  v => v.color === color && v.size === size
                                )?.stock || 0}
                                onChange={(e) => handleStockChange(color, size, e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                      />
                            </div>
                          ))
                            ))}
                            </div>
                          </div>
                        )}
                      </div>
              </div>

              {/* Customization Options */}
              <div className={`space-y-6 p-8 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-gray-50 to-white'} shadow-sm hover:shadow-md transition-all duration-300 border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                    <FaRunning className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Customization Options
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id="customization"
                      name="customization"
                      checked={formData.customization}
                      onChange={handleChange}
                      className={`w-5 h-5 rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} focus:ring-indigo-500`}
                    />
                    <label htmlFor="customization" className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Enable Product Customization
                    </label>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} pl-9`}>
                    If enabled, customers will be able to customize this product. Customization prices and options will be determined by our AI system.
                  </p>
                  </div>
                </div>

              {/* Product Images */}
              <div className={`space-y-6 p-8 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-gray-50 to-white'} shadow-sm hover:shadow-md transition-all duration-300 border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <FaUpload className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        </div>
                  <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Product Images
                  </h2>
                    </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.images.length < 5 && (
                    <label className={`flex flex-col items-center justify-center w-full h-64 border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'} border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300 hover:shadow-md`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaUpload className={`w-12 h-12 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <p className={`mb-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          PNG, JPG, WEBP (MAX. 5MB)
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formData.images.length}/5 images uploaded
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}

                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Information */}
              <div className={`space-y-6 p-8 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-gray-50 to-white'} shadow-sm hover:shadow-md transition-all duration-300 border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                    <FaBox className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Shipping Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="shipping.weight" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Shipping Weight *
                    </label>
                    <input
                      type="text"
                      id="shipping.weight"
                      name="shipping.weight"
                      value={formData.shipping.weight}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      placeholder="e.g., 500g"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="shipping.dimensions" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Shipping Dimensions *
                    </label>
                    <input
                      type="text"
                      id="shipping.dimensions"
                      name="shipping.dimensions"
                      value={formData.shipping.dimensions}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      placeholder="e.g., 30x20x10 cm"
                      required
                    />
                </div>

                  <div className="space-y-2">
                      <label htmlFor="shipping.shippingCost" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Shipping Cost (PKR)
                      </label>
                      <input
                        type="number"
                        id="shipping.shippingCost"
                        name="shipping.shippingCost"
                        value={formData.shipping.shippingCost}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:shadow-md`}
                      placeholder="0.00"
                      />
                    </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="shipping.freeShipping"
                      name="shipping.freeShipping"
                      checked={formData.shipping.freeShipping}
                      onChange={handleChange}
                      className={`w-4 h-4 rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} focus:ring-blue-500`}
                    />
                    <label htmlFor="shipping.freeShipping" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Free Shipping
                    </label>
                  </div>
              </div>
            </div>
            
              <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                  onClick={() => navigate("/seller/dashboard")}
                  className={`px-6 py-3 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-105`}
              >
                Cancel
              </button>
              <button
                type="submit"
                  disabled={loading}
                  className={`px-8 py-3 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Product...
                    </span>
                  ) : (
                    "Add Product"
                  )}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AddProduct;