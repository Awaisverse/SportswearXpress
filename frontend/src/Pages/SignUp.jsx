import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTrash } from 'react-icons/fa';

const businessTypes = [
  { value: "sportswear_manufacturer", label: "Sportswear Manufacturer" },
  { value: "sportswear_retailer", label: "Sportswear Retailer" },
  { value: "custom_clothing_designer", label: "Custom Clothing Designer" },
  { value: "sports_accessories", label: "Sports Accessories" },
  { value: "fitness_apparel", label: "Fitness Apparel" },
  { value: "team_uniform_supplier", label: "Team Uniform Supplier" },
  { value: "sports_equipment_retailer", label: "Sports Equipment Retailer" },
  { value: "custom_printing_service", label: "Custom Printing Service" },
  { value: "sports_footwear", label: "Sports Footwear" },
  { value: "sports_gear_retailer", label: "Sports Gear Retailer" }
];

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    businessName: '',
    businessType: '',
    nationalID: '',
    bankAccounts: [],
    wallets: []
  });

  const [currentBankAccount, setCurrentBankAccount] = useState({
    type: '',
    accountNumber: '',
    accountTitle: '',
    branchCode: '',
    otherBankName: ''
  });

  const [currentWallet, setCurrentWallet] = useState({
    type: '',
    accountNumber: '',
    accountTitle: '',
    otherWalletName: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const { register } = useAuth();

  const bankTypes = ["Allied Bank", "HBL", "Al-Falah", "Faysal Bank", "MCB", "other"];
  const walletTypes = ["jazz cash", "easyPaisa", "other"];

  useEffect(() => {
    // Check if admin exists
    const checkAdmin = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/admin/check');
        const data = await response.json();
        setAdminExists(data.exists);
        if (data.exists) {
          console.log("Admin already exists, removing admin option");
        }
      } catch (error) {
        console.error('Error checking admin:', error);
      }
    };
    checkAdmin();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // If trying to select admin role but admin exists, prevent it
    if (id === 'role' && value === 'admin' && adminExists) {
      toast.error("Admin already exists. Only one admin is allowed.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Real-time validation for phone number
    if (id === 'phoneNumber') {
      if (value && value.trim()) {
        const phone = value.trim();
        if (!/^03\d{9}$/.test(phone)) {
          setErrors(prev => ({ ...prev, phoneNumber: 'Phone number must be 11 digits starting with 03' }));
        } else {
          // 3rd digit (index 2) must be 0-4
          const thirdDigit = parseInt(phone.charAt(2));
          if (thirdDigit > 4) {
            setErrors(prev => ({ ...prev, phoneNumber: '3rd digit must be 0-4' }));
          } else {
            // 4th digit (index 3) must be 0-9
            const fourthDigit = parseInt(phone.charAt(3));
            if (fourthDigit > 9) {
              setErrors(prev => ({ ...prev, phoneNumber: '4th digit must be 0-9' }));
            } else {
              setErrors(prev => ({ ...prev, phoneNumber: '' }));
            }
          }
        }
      } else {
        setErrors(prev => ({ ...prev, phoneNumber: '' }));
      }
    } else if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleBankAccountChange = (e) => {
    const { name, value } = e.target;
    setCurrentBankAccount(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWalletChange = (e) => {
    const { name, value } = e.target;
    setCurrentWallet(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addBankAccount = () => {
    if (!currentBankAccount.type || !currentBankAccount.accountNumber || !currentBankAccount.accountTitle) {
      toast.error("Please fill in all required bank account fields");
      return;
    }

    // Validate bank account number (12 digits)
    if (!/^\d{12}$/.test(currentBankAccount.accountNumber)) {
      toast.error("Bank account number must be exactly 12 digits");
      return;
    }

    const newAccount = {
      type: currentBankAccount.type,
      accountNumber: currentBankAccount.accountNumber,
      accountTitle: currentBankAccount.accountTitle,
      branchCode: currentBankAccount.branchCode || '',
      otherBankName: currentBankAccount.type === 'other' ? currentBankAccount.otherBankName : ''
    };

    setFormData(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, newAccount]
    }));

    setCurrentBankAccount({
      type: '',
      accountNumber: '',
      accountTitle: '',
      branchCode: '',
      otherBankName: ''
    });

    toast.success("Bank account added successfully");
  };

  const removeBankAccount = (index) => {
    setFormData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
    }));
    toast.success("Bank account removed");
  };

  const addWallet = () => {
    if (!currentWallet.type || !currentWallet.accountNumber || !currentWallet.accountTitle) {
      toast.error("Please fill in all required wallet fields");
      return;
    }

    // Validate wallet account number (11 digits with same format as phone numbers)
    const walletNumber = currentWallet.accountNumber.trim();
    if (!/^03\d{9}$/.test(walletNumber)) {
      toast.error("Wallet account number must be 11 digits starting with 03");
      return;
    }
    
    // 3rd digit (index 2) must be 0-4
    const thirdDigit = parseInt(walletNumber.charAt(2));
    if (thirdDigit > 4) {
      toast.error("3rd digit must be 0-4");
      return;
    }
    
    // 4th digit (index 3) must be 0-9
    const fourthDigit = parseInt(walletNumber.charAt(3));
    if (fourthDigit > 9) {
      toast.error("4th digit must be 0-9");
      return;
    }

    const newWallet = {
      type: currentWallet.type,
      accountNumber: currentWallet.accountNumber,
      accountTitle: currentWallet.accountTitle,
      otherWalletName: currentWallet.type === 'other' ? currentWallet.otherWalletName : ''
    };

    setFormData(prev => ({
      ...prev,
      wallets: [...prev.wallets, newWallet]
    }));

    setCurrentWallet({
      type: '',
      accountNumber: '',
      accountTitle: '',
      otherWalletName: ''
    });

    toast.success("Wallet added successfully");
  };

  const removeWallet = (index) => {
    setFormData(prev => ({
      ...prev,
      wallets: prev.wallets.filter((_, i) => i !== index)
    }));
    toast.success("Wallet removed");
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Phone number validation for Pakistani format
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phone = formData.phoneNumber.trim();
      if (!/^03\d{9}$/.test(phone)) {
        newErrors.phoneNumber = 'Phone number must be 11 digits starting with 03';
      } else {
        // 3rd digit (index 2) must be 0-4
        const thirdDigit = parseInt(phone.charAt(2));
        if (thirdDigit > 4) {
          newErrors.phoneNumber = '3rd digit must be 0-4';
        }
        // 4th digit (index 3) must be 0-9
        const fourthDigit = parseInt(phone.charAt(3));
        if (fourthDigit > 9) {
          newErrors.phoneNumber = '4th digit must be 0-9';
        }
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'seller') {
      if (!formData.businessName) {
        newErrors.businessName = 'Business name is required';
      }
      if (!formData.businessType) {
        newErrors.businessType = 'Business type is required';
      }
      if (!formData.nationalID) {
        newErrors.nationalID = 'National ID is required';
      }
      if (formData.bankAccounts.length === 0 && formData.wallets.length === 0) {
        newErrors.paymentMethods = 'At least one payment method is required';
      }
    }

    // Admin validation - require at least one payment method
    if (formData.role === 'admin') {
      if (formData.bankAccounts.length === 0 && formData.wallets.length === 0) {
        newErrors.paymentMethods = 'At least one payment method is required for admin';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Prevent admin registration if admin already exists
    if (formData.role === 'admin' && adminExists) {
      toast.error("Admin already exists. Only one admin is allowed.");
      return;
    }
    
    setLoading(true);

    try {
      let result;
      if (formData.role === 'admin') {
        // Send admin data with bank details
        const adminData = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          bankAccounts: formData.bankAccounts.map(account => ({
            type: account.type,
            accountNumber: account.accountNumber,
            accountTitle: account.accountTitle,
            branchCode: account.branchCode || '',
            otherBankName: account.type === 'other' ? account.otherBankName : undefined
          })),
          wallets: formData.wallets.map(wallet => ({
            type: wallet.type,
            accountNumber: wallet.accountNumber,
            accountTitle: wallet.accountTitle,
            otherWalletName: wallet.type === 'other' ? wallet.otherWalletName : undefined
          }))
        };
        // Send to /api/v1/admin/register
        const response = await fetch('http://localhost:5000/api/v1/admin/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminData),
        });
        const data = await response.json();
        if (response.ok) {
          result = { success: true };
        } else {
          result = { success: false, error: data.message };
        }
      } else {
        // Existing logic for buyer/seller
      const registrationData = {
        role: formData.role,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        profilePhoto: null,
        isSuspended: false,
        suspensionDetails: {
          reason: null,
          suspendedAt: null,
          suspendedUntil: null
        }
      };
      if (formData.role === 'seller') {
        Object.assign(registrationData, {
          businessName: formData.businessName,
          businessType: formData.businessType,
          nationalID: formData.nationalID,
          bankAccounts: formData.bankAccounts.map(account => ({
            type: account.type,
            accountNumber: account.accountNumber,
            accountTitle: account.accountTitle,
            branchCode: account.branchCode || '',
            isDefault: false,
            otherBankName: account.type === 'other' ? account.otherBankName : undefined
          })),
          wallets: formData.wallets.map(wallet => ({
            type: wallet.type,
            accountNumber: wallet.accountNumber,
            accountTitle: wallet.accountTitle,
            isDefault: false,
            otherWalletName: wallet.type === 'other' ? wallet.otherWalletName : undefined
          }))
        });
      }
        result = await register(registrationData);
      }

      if (result.success) {
        toast.success('Registration successful!');
        if (formData.role === 'admin') {
          setAdminExists(true);
        }
      } else {
        // Show specific error for duplicate email
        if (result.error && result.error.toLowerCase().includes('email')) {
          toast.error('This email is already registered. Please use a different email.');
        } else {
          toast.error(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      });
      
      let errorMessage = "Registration failed";
      // Try to extract error message from fetch or axios
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      }
      // Show specific error for duplicate email
      if (errorMessage && errorMessage.toLowerCase().includes('email')) {
        toast.error('This email is already registered. Please use a different email.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Company Logo/Name */}
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
            SportWearXpress
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                {!adminExists && <option value="admin">Admin</option>}
              </select>
              {adminExists && (
                <p className="mt-1 text-sm text-gray-500">
                  Admin account already exists. Only one admin is allowed.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="Enter 11-digit number (e.g., 03012345678)"
                maxLength="11"
                value={formData.phoneNumber}
                onChange={handleChange}
                onKeyPress={(e) => {
                  // Only allow numeric input
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`mt-1 block w-full border ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Format: 03XXXXXXXXX (3rd digit ≤ 4, 4th digit ≤ 9)
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Bank Accounts and Wallets for Admin */}
            {formData.role === 'admin' && (
              <>
                {/* Bank Accounts Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Bank Accounts</h3>
                  
                  {/* Current Bank Account Form */}
                  <div className="space-y-4 p-4 border rounded-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Type</label>
                      <select
                        name="type"
                        value={currentBankAccount.type}
                        onChange={handleBankAccountChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a bank</option>
                        {bankTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {currentBankAccount.type === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                        <input
                          type="text"
                          name="otherBankName"
                          value={currentBankAccount.otherBankName}
                          onChange={handleBankAccountChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        placeholder="Enter 12-digit account number"
                        maxLength="12"
                        value={currentBankAccount.accountNumber}
                        onChange={handleBankAccountChange}
                        onKeyPress={(e) => {
                          // Only allow numeric input
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Bank account number must be exactly 12 digits
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Title</label>
                      <input
                        type="text"
                        name="accountTitle"
                        value={currentBankAccount.accountTitle}
                        onChange={handleBankAccountChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Branch Code (Optional)</label>
                      <input
                        type="text"
                        name="branchCode"
                        value={currentBankAccount.branchCode}
                        onChange={handleBankAccountChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addBankAccount}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add Bank Account
                    </button>
                  </div>

                  {/* Added Bank Accounts */}
                  {formData.bankAccounts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Added Bank Accounts:</h4>
                      {formData.bankAccounts.map((account, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{account.type === 'other' ? account.otherBankName : account.type}</p>
                            <p className="text-sm text-gray-600">{account.accountTitle} - {account.accountNumber}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBankAccount(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Wallets Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Digital Wallets</h3>
                  
                  {/* Current Wallet Form */}
                  <div className="space-y-4 p-4 border rounded-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Wallet Type</label>
                      <select
                        name="type"
                        value={currentWallet.type}
                        onChange={handleWalletChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a wallet</option>
                        {walletTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {currentWallet.type === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Wallet Name</label>
                        <input
                          type="text"
                          name="otherWalletName"
                          value={currentWallet.otherWalletName}
                          onChange={handleWalletChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        placeholder="Enter 11-digit number (e.g., 03012345678)"
                        maxLength="11"
                        value={currentWallet.accountNumber}
                        onChange={handleWalletChange}
                        onKeyPress={(e) => {
                          // Only allow numeric input
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Format: 03XXXXXXXXX (3rd digit ≤ 4, 4th digit ≤ 9)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Title</label>
                      <input
                        type="text"
                        name="accountTitle"
                        value={currentWallet.accountTitle}
                        onChange={handleWalletChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addWallet}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Add Wallet
                    </button>
                  </div>

                  {/* Added Wallets */}
                  {formData.wallets.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Added Wallets:</h4>
                      {formData.wallets.map((wallet, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{wallet.type === 'other' ? wallet.otherWalletName : wallet.type}</p>
                            <p className="text-sm text-gray-600">{wallet.accountTitle} - {wallet.accountNumber}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeWallet(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {errors.paymentMethods && (
                  <p className="text-sm text-red-600">{errors.paymentMethods}</p>
                )}
              </>
            )}

            {formData.role === 'seller' && (
              <>
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      errors.businessName ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className={`shadow appearance-none border ${
                      errors.businessType ? 'border-red-500' : 'border-gray-300'
                    } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    required
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.businessType && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="nationalID" className="block text-sm font-medium text-gray-700">
                    National ID
                  </label>
                  <input
                    id="nationalID"
                    type="text"
                    value={formData.nationalID}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      errors.nationalID ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.nationalID && (
                    <p className="mt-1 text-sm text-red-600">{errors.nationalID}</p>
                  )}
                </div>

                {/* Bank Accounts Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Bank Accounts</h3>
                  
                  {/* Current Bank Account Form */}
                  <div className="space-y-4 p-4 border rounded-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Type</label>
                      <select
                        name="type"
                        value={currentBankAccount.type}
                        onChange={handleBankAccountChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a bank</option>
                        {bankTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {currentBankAccount.type === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                        <input
                          type="text"
                          name="otherBankName"
                          value={currentBankAccount.otherBankName}
                          onChange={handleBankAccountChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        placeholder="Enter 12-digit account number"
                        maxLength="12"
                        value={currentBankAccount.accountNumber}
                        onChange={handleBankAccountChange}
                        onKeyPress={(e) => {
                          // Only allow numeric input
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Bank account number must be exactly 12 digits
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Title</label>
                      <input
                        type="text"
                        name="accountTitle"
                        value={currentBankAccount.accountTitle}
                        onChange={handleBankAccountChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Branch Code (Optional)</label>
                      <input
                        type="text"
                        name="branchCode"
                        value={currentBankAccount.branchCode}
                        onChange={handleBankAccountChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addBankAccount}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaPlus className="mr-2" /> Add Bank Account
                    </button>
                  </div>

                  {/* List of Added Bank Accounts */}
                  {formData.bankAccounts.length > 0 && (
                    <div className="space-y-2">
                      {formData.bankAccounts.map((account, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{account.type === 'other' ? account.otherBankName : account.type}</p>
                            <p className="text-sm text-gray-500">Account: {account.accountNumber}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBankAccount(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Wallets Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Wallets</h3>
                  
                  {/* Current Wallet Form */}
                  <div className="space-y-4 p-4 border rounded-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Wallet Type</label>
                      <select
                        name="type"
                        value={currentWallet.type}
                        onChange={handleWalletChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a wallet</option>
                        {walletTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {currentWallet.type === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Wallet Name</label>
                        <input
                          type="text"
                          name="otherWalletName"
                          value={currentWallet.otherWalletName}
                          onChange={handleWalletChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        placeholder="Enter 11-digit number (e.g., 03012345678)"
                        maxLength="11"
                        value={currentWallet.accountNumber}
                        onChange={handleWalletChange}
                        onKeyPress={(e) => {
                          // Only allow numeric input
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Format: 03XXXXXXXXX (3rd digit ≤ 4, 4th digit ≤ 9)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Title</label>
                      <input
                        type="text"
                        name="accountTitle"
                        value={currentWallet.accountTitle}
                        onChange={handleWalletChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addWallet}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaPlus className="mr-2" /> Add Wallet
                    </button>
                  </div>

                  {/* List of Added Wallets */}
                  {formData.wallets.length > 0 && (
                    <div className="space-y-2">
                      {formData.wallets.map((wallet, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{wallet.type === 'other' ? wallet.otherWalletName : wallet.type}</p>
                            <p className="text-sm text-gray-500">Account: {wallet.accountNumber}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeWallet(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {errors.paymentMethods && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethods}</p>
                )}
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;