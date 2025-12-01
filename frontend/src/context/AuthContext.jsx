import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          try {
            // Verify token validity with backend
            const response = await axios.get(`${API_URL}/api/v1/auth/verify-token`, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000, // 5 second timeout
              signal: abortController.signal
            });
            
            if (!isMounted) return;
            
            if (response.data.valid && response.data.user) {
              setUser(response.data.user);
              // Update localStorage with fresh user data
              localStorage.setItem('user', JSON.stringify(response.data.user));
            } else {
              // Token is invalid, clear it
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (error) {
            if (!isMounted) return;
            
            // Ignore abort errors
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
              return;
            }
            
            console.error('Token verification error:', error);
            // If it's a network error or server is down, keep the user logged in
            // but don't update the user data
            if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
              // Server error or network issue - keep user logged in
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            } else {
              // Other errors (like 401, 403) - clear invalid token
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Auth initialization error:', error);
        // Only clear if it's a parsing error, not a network error
        if (error.name === 'SyntaxError') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email,
        password,
        role
      });

      const { token, user } = response.data;

      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      if (!userData.role || !userData.fullName || !userData.email || !userData.password) {
        return {
          success: false,
          error: "Missing required fields"
        };
      }

      const registrationData = {
        ...userData,
        profilePhoto: userData.profilePhoto || null,
        isSuspended: false,
        suspensionDetails: {
          reason: null,
          suspendedAt: null,
          suspendedUntil: null
        }
      };

      console.log('Sending registration data:', registrationData);
      
      const response = await axios.post(`${API_URL}/api/v1/auth/register`, registrationData);
      
      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      let errorMessage = "Registration failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};