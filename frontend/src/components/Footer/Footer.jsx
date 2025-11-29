import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaLinkedin,
  FaTiktok
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to your backend
      // For now, we'll just simulate a successful subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">SportWearXpress</h3>
            <p className="text-gray-400 leading-relaxed">
              Your one-stop destination for premium sports wear and accessories. Quality products for every athlete.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <FaPhone className="text-primary" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-primary" />
                <span className="text-gray-400">support@sportwearxpress.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-primary" />
                <span className="text-gray-400">123 Sports Street, Athletic City, AC 12345</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/productpage" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for updates, exclusive offers, and early access to new collections.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
              <input
                type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
              />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe Now"}
              </button>
            </form>
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2 text-primary">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
            <FaFacebook className="text-2xl" />
          </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
            <FaTwitter className="text-2xl" />
          </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
            <FaInstagram className="text-2xl" />
          </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
            <FaYoutube className="text-2xl" />
          </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  <FaTiktok className="text-2xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  <FaLinkedin className="text-2xl" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} SportWearXpress. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-primary text-sm transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-primary text-sm transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/cookie-policy" className="text-gray-400 hover:text-primary text-sm transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Back to top"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>

      {/* WhatsApp Support Button */}
      <a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="w-6 h-6" />
      </a>
    </footer>
  );
};

export default Footer;