import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Swal from "sweetalert2";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, validateCartForCheckout } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sellerNames, setSellerNames] = useState({});

  // Fetch seller names for all unique seller IDs in cart
  useEffect(() => {
    const fetchSellerNames = async () => {
      // Get seller IDs that don't have names stored
      const itemsNeedingSellerNames = cart.filter(item => 
        item.sellerId && !item.sellerName && !sellerNames[item.sellerId]
      );
      
      if (itemsNeedingSellerNames.length === 0) return;

      try {
        const sellerNamesData = { ...sellerNames };
        
        for (const item of itemsNeedingSellerNames) {
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/v1/seller/${item.sellerId}/profile`);
            if (response.ok) {
              const sellerData = await response.json();
              sellerNamesData[item.sellerId] = sellerData.businessInfo?.businessName || sellerData.fullName || 'Unknown Seller';
            } else {
              sellerNamesData[item.sellerId] = 'Unknown Seller';
            }
          } catch (error) {
            console.error('Error fetching seller info:', error);
            sellerNamesData[item.sellerId] = 'Unknown Seller';
          }
        }
        
        setSellerNames(sellerNamesData);
      } catch (error) {
        console.error('Error fetching seller names:', error);
      }
    };

    fetchSellerNames();
  }, [cart, sellerNames]);

  const handleQuantityChange = (productId, selectedColor, selectedSize, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId, selectedColor, selectedSize);
    } else {
      updateQuantity(productId, selectedColor, selectedSize, newQuantity);
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      Swal.fire("Login Required", "Please login to proceed to checkout", "warning");
      navigate("/auth");
      return;
    }

    // Validate cart before proceeding
    const validation = validateCartForCheckout();
    
    if (!validation.isValid) {
      Swal.fire("Cart Error", validation.error, "error");
      return;
    }

    // Navigate to checkout with seller ID
    navigate(`/checkout/${validation.sellerId}`);
  };

  const calculateShipping = () => {
    // Fixed shipping cost of $10
    return 10;
  };

  const subtotal = getCartTotal();
  const shipping = calculateShipping();
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {cart.map((item, index) => (
                <div key={`${item._id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center p-6 border-b last:border-b-0">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-24 h-24 mr-4">
                    <img
                      src={item.images && item.images[0] ? item.images[0] : "/placeholder-image.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Price: ${item.price}
                    </p>
                    {(item.selectedColor || item.selectedSize) && (
                      <p className="text-sm text-gray-500">
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                        {item.selectedColor && item.selectedSize && " | "}
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                      </p>
                    )}
                    {item.sellerId && (
                      <p className="text-xs text-blue-600 mt-1">
                        Seller: {item.sellerName || sellerNames[item.sellerId] || 'Unknown Seller'}
                      </p>
                    )}
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id, item.selectedColor, item.selectedSize)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items):</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors mt-6"
              >
                Proceed to Checkout
              </button>
              
              <button
                onClick={() => navigate("/products")}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors mt-3"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;