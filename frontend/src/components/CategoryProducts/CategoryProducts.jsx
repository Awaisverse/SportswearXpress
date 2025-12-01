import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFilter, FaTimes, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cartSlice";

const CategoryProducts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: "all", name: "All Products" },
    { id: "men", name: "Men's Collection" },
    { id: "women", name: "Women's Collection" },
    { id: "accessories", name: "Accessories" },
    { id: "sports", name: "Sports Wear" },
    { id: "casual", name: "Casual Wear" }
  ];

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const fetchProductsWithCleanup = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(`${API_URL}/api/v1/products`, {
          signal: abortController.signal
        });
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        if (response.data && Array.isArray(response.data)) {
          // Filter for approved and isActive products only
          const filtered = response.data.filter(
            (p) => p.status === "approved" && p.isActive
          );
          setProducts(filtered);
          setFilteredProducts(filtered);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
        setError(null);
      } catch (error) {
        // Ignore abort errors
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
          return;
        }
        
        if (isMounted) {
          console.error("Error fetching products:", error);
          setError("Failed to fetch products. Please try again later.");
          setProducts([]);
          setFilteredProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProductsWithCleanup();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.get(`${API_URL}/api/v1/products`);
      if (response.data && Array.isArray(response.data)) {
        // Filter for approved and isActive products only
        const filtered = response.data.filter(
          (p) => p.status === "approved" && p.isActive
        );
        setProducts(filtered);
        setFilteredProducts(filtered);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again later.");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(products)) {
      filterProducts();
    }
  }, [selectedCategory, sortBy, products]);

  const filterProducts = () => {
    if (!Array.isArray(products)) return;
    
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "men") {
        filtered = filtered.filter(product => product.gender === "male" || product.gender === "unisex");
      } else if (selectedCategory === "women") {
        filtered = filtered.filter(product => product.gender === "female" || product.gender === "unisex");
      } else {
        filtered = filtered.filter(product => 
          product.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "popular":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // featured - no sorting needed
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    dispatch(addToCart(product));
  };

  const handleCustomize = (e, product) => {
    e.stopPropagation();
    navigate(`/product/${product._id}?customize=true`);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 bg-primary text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="text-center mb-12 relative">
        <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Discover our wide range of products across different categories
        </p>
      </div>

      {/* Mobile Filter Button */}
      <button
        className="md:hidden flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg mb-4"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        {isFilterOpen ? <FaTimes /> : <FaFilter />}
        {isFilterOpen ? "Close Filters" : "Show Filters"}
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
          {/* Category Filter */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`block w-full text-left px-2 py-1 rounded ${
                    selectedCategory === category.id
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <img
                      src={product.images?.[0] || '/placeholder-image.jpg'}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-primary font-bold">${product.price}</p>
                        {product.originalPrice && (
                          <p className="text-gray-500 line-through text-sm">
                            ${product.originalPrice}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1">{product.rating || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-primary text-white py-2 px-4 rounded-full hover:bg-primary/90 duration-300 text-sm font-medium"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={(e) => handleCustomize(e, product)}
                        className="bg-gray-200 text-gray-800 py-2 px-4 rounded-full hover:bg-gray-300 duration-300 text-sm font-medium"
                      >
                        Customize
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View All Products Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 duration-300"
        >
          View All Products
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default CategoryProducts; 