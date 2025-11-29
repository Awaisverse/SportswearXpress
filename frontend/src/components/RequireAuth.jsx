import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';

const RequireAuth = ({ children, role }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    toast.error('Please sign in to access this page');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // For seller routes
  if (role === 'seller') {
    if (user.role !== 'seller') {
      toast.error('You need to register as a seller to access this page');
      return <Navigate to="/seller/register" state={{ from: location }} replace />;
    }
  }

  // For admin routes
  if (role && user.role !== role) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;