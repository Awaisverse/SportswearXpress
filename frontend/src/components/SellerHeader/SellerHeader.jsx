import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStore, FaBox, FaClipboardList, FaChartLine, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import Logo from "../../assets/logo.png";

const SellerHeader = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate("/signin");
  };

  const menuItems = [
    { id: 1, name: "Dashboard", link: "/seller/dashboard", icon: <FaChartLine /> },
    { id: 2, name: "Products", link: "/seller/products", icon: <FaBox /> },
    { id: 3, name: "Orders", link: "/seller/orders", icon: <FaClipboardList /> },
  ];

  return (
    <div className="bg-white shadow-md dark:bg-gray-900 dark:text-white duration-200">
      <div className="container py-3 sm:py-0">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Logo" className="h-12" />
            <span className="text-xl font-bold">Seller Dashboard</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-4">
            <ul className="hidden lg:flex items-center gap-4">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.link)}
                    className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-500 hover:text-primary dark:text-gray-200 dark:hover:text-white duration-200"
                  >
                    {item.icon}
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaStore className="text-xl text-primary" />
              <span className="text-sm font-medium">{user?.fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
            >
              <FaSignOutAlt />
              Logout
            </button>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-primary dark:text-gray-200 dark:hover:text-white"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="text-2xl" />
                ) : (
                  <FaBars className="text-2xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <ul className="flex flex-col gap-4 p-4">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    navigate(item.link);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 font-semibold text-gray-500 hover:text-primary dark:text-gray-200 dark:hover:text-white duration-200"
                >
                  {item.icon}
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SellerHeader; 