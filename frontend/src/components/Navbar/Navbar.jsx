import React, { useState, useEffect, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdSearch } from "react-icons/io";
import { FaBars, FaTimes, FaUser, FaShoppingBag, FaHeart, FaHistory } from "react-icons/fa";
import DarkMode from "./DarkMode";
import CartIcon from "../CartIcon";
import CartSidebar from "../CartSidebar";
import { Menu, Transition } from "@headlessui/react";
import { useAuth } from "../../context/AuthContext";

const PublicMenu = [
  { id: 1, name: "Home", link: "/" },
  { id: 2, name: "About Us", link: "/about-us" },
  { id: 3, name: "Blog", link: "/blog" },
  { id: 4, name: "Products", link: "/products" },
];

const BuyerMenu = [
  { id: 1, name: "Home", link: "/" },
  { id: 2, name: "Products", link: "/products" },
  { id: 3, name: "My Orders", link: "/buyer/orders" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const handleViewProfile = () => {
    if (user?.role === 'buyer') {
      navigate('/buyer/profile');
    } else if (user?.role === 'seller') {
      navigate('/seller/profile');
    } else if (user?.role === 'admin') {
      navigate('/admin/profile');
    }
    setShowProfileDropdown(false);
  };

  const handleViewOrders = () => {
    navigate('/buyer/orders');
    setShowProfileDropdown(false);
  };

  const handleViewWishlist = () => {
    navigate('/buyer/wishlist');
    setShowProfileDropdown(false);
  };

  const currentMenu = user?.role === 'buyer' ? BuyerMenu : PublicMenu;

  const renderUserMenu = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return (
          <Menu as="div" className="relative ml-3">
            <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span className="sr-only">Open admin menu</span>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/admin/dashboard"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      Dashboard
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/admin/profile"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        );

      case 'seller':
        return (
          <Menu as="div" className="relative ml-3">
            <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span className="sr-only">Open seller menu</span>
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/seller/dashboard"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      Dashboard
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/seller/profile"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/seller/products"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      My Products
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/seller/orders"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      Orders
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        );

      case 'buyer':
        return (
          <Menu as="div" className="relative ml-3">
            <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span className="sr-only">Open buyer menu</span>
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/buyer/dashboard"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      Dashboard
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/buyer/profile"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/buyer/orders"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      My Orders
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow-lg dark:bg-gray-900 dark:text-white duration-300 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                SportWearXpress
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <ul className="hidden md:flex items-center space-x-1">
              {currentMenu.map((data) => (
                <li key={data.id}>
                  <Link
                    to={data.link}
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg transition-all duration-300 font-medium relative group"
                  >
                    <span className="relative z-10">{data.name}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block relative w-48">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-3 py-1.5 text-sm rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-300"
                />
                <IoMdSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              </div>

              <DarkMode />
              <CartIcon />
              <CartSidebar />

              {/* Sign In Button or User Menu */}
              {!user ? (
                <Link
                  to="/signin"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Sign In
                </Link>
              ) : (
                renderUserMenu()
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <FaTimes className="block h-5 w-5" />
                ) : (
                  <FaBars className="block h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-2 pb-3 space-y-2">
              <div className="relative px-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-3 py-1.5 text-sm rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-300"
                />
                <IoMdSearch className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              </div>
              <ul className="space-y-1">
                {currentMenu.map((data) => (
                  <li key={data.id}>
                    <Link
                      to={data.link}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg transition-all duration-300 font-medium relative group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="relative z-10">{data.name}</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Link>
                  </li>
                ))}
              </ul>
              {!user && (
                <div className="px-4 py-2">
                  <Link
                    to="/signin"
                    className="block w-full text-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <CartSidebar />
    </div>
  );
};

export default Navbar;