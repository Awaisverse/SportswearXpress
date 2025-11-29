import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const loadCart = () => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(Array.isArray(parsedCart) ? parsedCart : []);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
    }
  }, [cart, loading]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) {
      toast.error("Invalid product data");
      return;
    }

    // Ensure seller information is included
    const productWithSeller = {
      ...product,
      sellerId: product.sellerId || product.seller?._id || product.seller,
      sellerName: product.seller?.businessInfo?.businessName || 
                 product.seller?.fullName || 
                 product.sellerName || 
                 null,
      quantity: quantity
    };

    setCart((prevCart) => {
      // Check if product already exists in cart with same variants
      const existingItemIndex = prevCart.findIndex(
        (item) => 
          item._id === product._id && 
          item.selectedColor === product.selectedColor && 
          item.selectedSize === product.selectedSize
      );

      if (existingItemIndex !== -1) {
        // Update quantity if product exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: (updatedCart[existingItemIndex].quantity || 0) + quantity
        };
        toast.success("Product quantity updated in cart!");
        return updatedCart;
      } else {
        // Add new product to cart
        const newCart = [...prevCart, productWithSeller];
        toast.success("Product added to cart!");
        return newCart;
      }
    });
  };

  const removeFromCart = (productId, selectedColor, selectedSize) => {
    if (!productId) {
      toast.error("Invalid product ID");
      return;
    }

    setCart((prevCart) => {
      const updatedCart = prevCart.filter(
        (item) => !(item._id === productId && 
                   item.selectedColor === selectedColor && 
                   item.selectedSize === selectedSize)
      );
      toast.success("Product removed from cart!");
      return updatedCart;
    });
  };

  const updateQuantity = (productId, selectedColor, selectedSize, quantity) => {
    if (!productId || quantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    toast.success("Cart cleared!");
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
    );
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  };

  // New validation methods
  const validateCartForCheckout = () => {
    if (!cart || cart.length === 0) {
      return { isValid: false, error: "Cart is empty" };
    }

    // Check if all items have seller information
    const itemsWithoutSeller = cart.filter(item => !item.sellerId);
    if (itemsWithoutSeller.length > 0) {
      return { isValid: false, error: "Some items are missing seller information" };
    }

    // Check if all items are from the same seller
    const firstItemSellerId = cart[0].sellerId;
    const allSameSeller = cart.every(item => item.sellerId === firstItemSellerId);
    if (!allSameSeller) {
      return { isValid: false, error: "All items must be from the same seller" };
    }

    // Validate item data
    for (const item of cart) {
      if (!item._id || !item.quantity || !item.price) {
        return { isValid: false, error: "Invalid item data in cart" };
      }
      if (item.quantity < 1) {
        return { isValid: false, error: "Item quantity must be at least 1" };
      }
      if (item.price <= 0) {
        return { isValid: false, error: "Item price must be greater than 0" };
      }
    }

    return { 
      isValid: true, 
      sellerId: firstItemSellerId,
      itemCount: cart.length,
      total: getCartTotal()
    };
  };

  const getCartSellerId = () => {
    if (!cart || cart.length === 0) return null;
    return cart[0].sellerId;
  };

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isCartOpen,
    setIsCartOpen,
    cartItemCount: getCartCount(),
    validateCartForCheckout,
    getCartSellerId
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};