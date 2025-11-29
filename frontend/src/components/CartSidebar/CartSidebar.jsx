import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTimes, FaTrash } from 'react-icons/fa';
import { fetchCart, removeFromCart, updateCartItem } from '../../redux/features/cartSlice';

const CartSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { items, totalAmount, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadCart = async () => {
      if (isOpen && user) {
        await dispatch(fetchCart());
      }
    };
    loadCart();
  }, [isOpen, user, dispatch]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity > 0) {
      try {
        await dispatch(updateCartItem({ itemId, quantity: newQuantity }));
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Color: {item.color} | Size: {item.size}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="px-2 py-1 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        disabled={loading}
                      >
                        -
                      </button>
                      <span className="text-gray-800 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="px-2 py-1 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-red-500 hover:text-red-600 mt-2"
                      disabled={loading}
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 dark:text-gray-300">Total:</span>
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
          <Link
            to="/checkout"
            onClick={onClose}
            className="block w-full bg-primary text-white text-center py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={loading || items.length === 0}
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar; 