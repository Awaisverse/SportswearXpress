import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaStore, FaIdCard, FaCreditCard, FaEdit, FaSave, FaTimes, FaChartLine, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SellerProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    businessInfo: {
      businessName: '',
      businessType: '',
      nationalID: ''
    },
    bankAccounts: [],
    wallets: [],
    isVerified: false,
    isSuspended: false
  });

  // New payment method forms
  const [newBankAccount, setNewBankAccount] = useState({
    type: '',
    accountNumber: '',
    accountTitle: '',
    branchCode: '',
    otherBankName: '',
    isDefault: false
  });

  const [newWallet, setNewWallet] = useState({
    type: '',
    accountNumber: '',
    accountTitle: '',
    otherWalletName: '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/v1/seller/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setProfile({
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          phoneNumber: response.data.phoneNumber || '',
          businessInfo: {
            businessName: response.data.businessInfo?.businessName || '',
            businessType: response.data.businessInfo?.businessType || '',
            nationalID: response.data.businessInfo?.nationalID || ''
          },
          bankAccounts: response.data.bankAccounts || [],
          wallets: response.data.wallets || [],
          isVerified: response.data.isVerified || false,
          isSuspended: response.data.isSuspended || false
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Profile fetch error:', error);
      // If there's an error, use the user data from context as fallback
      if (user) {
        setProfile({
          fullName: user.fullName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          businessInfo: {
            businessName: user.businessInfo?.businessName || '',
            businessType: user.businessInfo?.businessType || '',
            nationalID: user.businessInfo?.nationalID || ''
          },
          bankAccounts: user.bankAccounts || [],
          wallets: user.wallets || [],
          isVerified: user.isVerified || false,
          isSuspended: user.isSuspended || false
        });
      }
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBankInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBankAccount(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWalletInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewWallet(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addBankAccount = () => {
    if (!newBankAccount.type || !newBankAccount.accountNumber || !newBankAccount.accountTitle) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newBankAccount.type === 'other' && !newBankAccount.otherBankName) {
      toast.error('Please provide bank name for other bank type');
      return;
    }

    const updatedProfile = {
      ...profile,
      bankAccounts: [...profile.bankAccounts, newBankAccount]
    };

    setProfile(updatedProfile);
    setNewBankAccount({
      type: '',
      accountNumber: '',
      accountTitle: '',
      branchCode: '',
      otherBankName: '',
      isDefault: false
    });
    setShowAddBank(false);
    toast.success('Bank account added successfully');
  };

  const addWallet = () => {
    if (!newWallet.type || !newWallet.accountNumber || !newWallet.accountTitle) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newWallet.type === 'other' && !newWallet.otherWalletName) {
      toast.error('Please provide wallet name for other wallet type');
      return;
    }

    const updatedProfile = {
      ...profile,
      wallets: [...profile.wallets, newWallet]
    };

    setProfile(updatedProfile);
    setNewWallet({
      type: '',
      accountNumber: '',
      accountTitle: '',
      otherWalletName: '',
      isDefault: false
    });
    setShowAddWallet(false);
    toast.success('Wallet added successfully');
  };

  const removeBankAccount = (index) => {
    const updatedBankAccounts = profile.bankAccounts.filter((_, i) => i !== index);
    setProfile(prev => ({
      ...prev,
      bankAccounts: updatedBankAccounts
    }));
    toast.success('Bank account removed successfully');
  };

  const removeWallet = (index) => {
    const updatedWallets = profile.wallets.filter((_, i) => i !== index);
    setProfile(prev => ({
      ...prev,
      wallets: updatedWallets
    }));
    toast.success('Wallet removed successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/v1/seller/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
              >
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-xl rounded-lg overflow-hidden"
          >
            {/* Profile Header */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                >
                  {isEditing ? (
                    <>
                      <FaTimes className="h-5 w-5 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <FaEdit className="h-5 w-5 mr-2" />
                      Edit Profile
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Personal Information */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:shadow-md"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaUser className="h-5 w-5 mr-2 text-blue-600" />
                  </motion.div>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-500 transition-all duration-300"
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Business Information */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:shadow-md"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaStore className="h-5 w-5 mr-2 text-blue-600" />
                  </motion.div>
                  Business Information
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input
                      type="text"
                      name="businessInfo.businessName"
                      value={profile.businessInfo.businessName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <label className="block text-sm font-medium text-gray-700">Business Type</label>
                    <input
                      type="text"
                      name="businessInfo.businessType"
                      value={profile.businessInfo.businessType}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <label className="block text-sm font-medium text-gray-700">National ID</label>
                    <input
                      type="text"
                      name="businessInfo.nationalID"
                      value={profile.businessInfo.nationalID}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Account Status */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:shadow-md"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaShieldAlt className="h-5 w-5 mr-2 text-blue-600" />
                  </motion.div>
                  Account Status
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                    <div className="mt-1 flex items-center">
                      {profile.isVerified ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="h-5 w-5 mr-2" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <FaTimesCircle className="h-5 w-5 mr-2" />
                          Pending Verification
                        </span>
                      )}
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <div className="mt-1 flex items-center">
                      {!profile.isSuspended ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="h-5 w-5 mr-2" />
                          Active
                        </span>
                        ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <FaTimesCircle className="h-5 w-5 mr-2" />
                          Suspended
                        </span>
                        )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Payment Methods */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:shadow-md"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaCreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  </motion.div>
                  Payment Methods
                </h3>

                {/* Bank Accounts */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-gray-700">Bank Accounts</h4>
                    {isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddBank(!showAddBank)}
                        className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <FaPlus className="h-4 w-4 mr-1" />
                        Add Bank
                      </motion.button>
                    )}
                  </div>

                  {/* Add Bank Account Form */}
                  {showAddBank && isEditing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4"
                    >
                      <h5 className="font-medium text-gray-700 mb-3">Add New Bank Account</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Type *</label>
                          <select
                            name="type"
                            value={newBankAccount.type}
                            onChange={handleBankInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select Bank</option>
                            <option value="Allied Bank">Allied Bank</option>
                            <option value="HBL">HBL</option>
                            <option value="Al-Falah">Al-Falah</option>
                            <option value="Faysal Bank">Faysal Bank</option>
                            <option value="MCB">MCB</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={newBankAccount.accountNumber}
                            onChange={handleBankInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter account number"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Title *</label>
                          <input
                            type="text"
                            name="accountTitle"
                            value={newBankAccount.accountTitle}
                            onChange={handleBankInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter account title"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
                          <input
                            type="text"
                            name="branchCode"
                            value={newBankAccount.branchCode}
                            onChange={handleBankInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter branch code"
                          />
                        </div>
                        {newBankAccount.type === 'other' && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                            <input
                              type="text"
                              name="otherBankName"
                              value={newBankAccount.otherBankName}
                              onChange={handleBankInputChange}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter bank name"
                              required
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddBank(false)}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={addBankAccount}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add Bank Account
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {profile.bankAccounts && profile.bankAccounts.length > 0 ? (
                    <div className="space-y-4">
                      {profile.bankAccounts.map((account, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative"
                        >
                          {isEditing && (
                            <button
                              onClick={() => removeBankAccount(index)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                              title="Remove bank account"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Bank Type</p>
                              <p className="text-sm text-gray-900">{account.type}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Account Number</p>
                              <p className="text-sm text-gray-900">{account.accountNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Account Title</p>
                              <p className="text-sm text-gray-900">{account.accountTitle}</p>
                            </div>
                            {account.branchCode && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Branch Code</p>
                                <p className="text-sm text-gray-900">{account.branchCode}</p>
                              </div>
                            )}
                            {account.type === 'other' && account.otherBankName && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Bank Name</p>
                                <p className="text-sm text-gray-900">{account.otherBankName}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No bank accounts added</p>
                  )}
                </div>

                {/* Wallets */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-gray-700">Digital Wallets</h4>
                    {isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddWallet(!showAddWallet)}
                        className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <FaPlus className="h-4 w-4 mr-1" />
                        Add Wallet
                      </motion.button>
                    )}
                  </div>

                  {/* Add Wallet Form */}
                  {showAddWallet && isEditing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4"
                    >
                      <h5 className="font-medium text-gray-700 mb-3">Add New Digital Wallet</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Type *</label>
                          <select
                            name="type"
                            value={newWallet.type}
                            onChange={handleWalletInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            required
                          >
                            <option value="">Select Wallet</option>
                            <option value="jazz cash">Jazz Cash</option>
                            <option value="easyPaisa">EasyPaisa</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={newWallet.accountNumber}
                            onChange={handleWalletInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter wallet number"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Title *</label>
                          <input
                            type="text"
                            name="accountTitle"
                            value={newWallet.accountTitle}
                            onChange={handleWalletInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter account title"
                            required
                          />
                        </div>
                        {newWallet.type === 'other' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Name *</label>
                            <input
                              type="text"
                              name="otherWalletName"
                              value={newWallet.otherWalletName}
                              onChange={handleWalletInputChange}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                              placeholder="Enter wallet name"
                              required
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddWallet(false)}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={addWallet}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Add Wallet
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {profile.wallets && profile.wallets.length > 0 ? (
                    <div className="space-y-4">
                      {profile.wallets.map((wallet, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative"
                        >
                          {isEditing && (
                            <button
                              onClick={() => removeWallet(index)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                              title="Remove wallet"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Wallet Type</p>
                              <p className="text-sm text-gray-900">{wallet.type}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Account Number</p>
                              <p className="text-sm text-gray-900">{wallet.accountNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Account Title</p>
                              <p className="text-sm text-gray-900">{wallet.accountTitle}</p>
                            </div>
                            {wallet.type === 'other' && wallet.otherWalletName && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Wallet Name</p>
                                <p className="text-sm text-gray-900">{wallet.otherWalletName}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No digital wallets added</p>
                  )}
                </div>
              </motion.div>

              {isEditing && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-end"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    <FaSave className="h-5 w-5 mr-2" />
                    Save Changes
                  </motion.button>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
};

export default SellerProfile; 