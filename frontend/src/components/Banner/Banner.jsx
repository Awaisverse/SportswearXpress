import React from "react";
import BannerImg from "../../assets/women/women2.png";
import { GiRunningShoe, GiTShirt } from "react-icons/gi";
import { FaShippingFast, FaPercentage } from "react-icons/fa";
import { RiSecurePaymentLine } from "react-icons/ri";

const Banner = () => {
  return (
    <div className="min-h-[550px] flex justify-center items-center py-12 sm:py-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          {/* image section - now with proper centering */}
          <div data-aos="zoom-in" className="relative flex justify-center">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-xl blur-lg opacity-20 -z-10"></div>
            <div className="overflow-hidden rounded-xl shadow-2xl border-4 border-white dark:border-gray-700 w-full max-w-[400px] h-[350px]">
              <img
                src={BannerImg}
                alt="Athletic woman in sportswear"
                className="w-full h-full object-cover object-center" // Changed to object-center
                style={{ objectPosition: "50% 30%" }} // Adjust this to center the face
              />
            </div>
          </div>

          {/* text details section */}
          <div className="flex flex-col justify-center gap-6 sm:pt-0 px-4 sm:px-0">
            <h1 data-aos="fade-up" className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
              End of Season Sale - Up to 50% Off
            </h1>
            <p
              data-aos="fade-up"
              className="text-gray-600 dark:text-gray-300 leading-6"
            >
              Upgrade your athletic wardrobe with premium performance wear. Our limited-time sale offers top-quality sportswear at unbeatable prices for your training needs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div data-aos="fade-up" className="flex items-start gap-4 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <GiRunningShoe className="text-3xl text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="font-medium">Performance Gear</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Engineered for maximum athletic performance</p>
                </div>
              </div>
              <div data-aos="fade-up" className="flex items-start gap-4 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <FaShippingFast className="text-3xl text-green-500 dark:text-green-400" />
                <div>
                  <h3 className="font-medium">Fast Shipping</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get your gear in 2-3 business days</p>
                </div>
              </div>
              <div data-aos="fade-up" className="flex items-start gap-4 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <RiSecurePaymentLine className="text-3xl text-purple-500 dark:text-purple-400" />
                <div>
                  <h3 className="font-medium">Secure Checkout</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">100% safe payment options</p>
                </div>
              </div>
              <div data-aos="fade-up" className="flex items-start gap-4 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <FaPercentage className="text-3xl text-red-500 dark:text-red-400" />
                <div>
                  <h3 className="font-medium">Exclusive Offers</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Members get additional discounts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;