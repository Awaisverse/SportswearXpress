import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './styles/sweetalert2.css';
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import ProductPage from "./Pages/ProductPage";
import Customization from "./Pages/Customization";
import Checkout from "./Pages/Checkout";
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyCode from "./Pages/VerifyCode";
import ResetPassword from "./Pages/ResetPassword";
import AboutUs from "./Pages/AboutUs";
import Cart from "./Pages/Cart";
import BlogPage from "./Pages/BlogPage";
import AddProduct from "./Pages/AddProduct";
import RequireAuth from "./components/RequireAuth";
import AuthPage from "./Pages/AuthPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import BuyerDashboard from "./Pages/BuyerDashboard";
import SellerDashboard from "./Pages/SellerDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import AdminProfile from './Pages/AdminProfile';
import BuyerProfile from './Pages/BuyerProfile';
import BuyerOrdersPage from './Pages/BuyerOrdersPage';
import SellerProfile from "./Pages/SellerProfile";
import SellerProductPage from './Pages/SellerProductPage';
import EditProductPage from './Pages/EditProductPage';
import Products from "./Pages/Products";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from './redux/features/cartSlice';
import SellerApproval from "./Pages/SellerApproval";
import Suspension from "./Pages/Suspension";
import BuyerOrderDetails from './Pages/BuyerOrderDetails';
import AdminViewOrder from './Pages/AdminViewOrder';
import SellerActualViewOrder from './Pages/SellerActualViewOrder';
import SellerDeliveryManagement from './Pages/SellerDeliveryManagement';
import BuyerComplaint from './Pages/BuyerComplaint';
import OrderRefund from './Pages/OrderRefund';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/customize/:productId" element={<Customization />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verifycode" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/order-details" element={<BuyerOrderDetails />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/products" element={<Products />} />
      {/* Protected Routes */}
      <Route
        path="/checkout/:sellerId"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth"
        element={
          <RequireAuth>
            <AuthPage />
          </RequireAuth>
        }
      />
      <Route
        path="/buyer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/orders"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/orders/:orderId"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerOrderDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/complaint/:orderId"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerComplaint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/profile"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/profile"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/add-product"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <AddProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/product/:id"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/edit-product/:id"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <EditProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/seller-approval/:sellerId"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SellerApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/suspension"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspension />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/orders/:orderId" element={<AdminViewOrder />} />
      <Route path="/seller/orders/:orderId" element={<SellerActualViewOrder />} />
      <Route
        path="/seller/delivery-management/:orderId"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerDeliveryManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/order-refund/:orderId"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <OrderRefund />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;