import React from "react";
import Image1 from "../../assets/hero/women.png";
import Image2 from "../../assets/hero/Shopping.png";
import Image3 from "../../assets/hero/sale.png";
import Slider from "react-slick";

const ImageList = [
  {
    id: 1,
    img: Image1,
    title: "50% Off Performance Sportswear",
    description:
      "Engineered for champions. Moisture-wicking fabrics to keep you dry during intense workouts.",
  },
  {
    id: 2,
    img: Image2,
    title: "New Arrivals: Pro Training Gear",
    description:
      "Cutting-edge designs with maximum mobility. Train harder with our premium athletic wear.",
  },
  {
    id: 3,
    img: Image3,
    title: "Elite Compression Wear - 70% Off",
    description:
      "Enhanced blood flow & muscle support. Designed for peak athletic performance.",
  },
];

const Hero = ({ handleOrderPopup }) => {
  var settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "ease-in-out",
    pauseOnHover: false,
    pauseOnFocus: true,
  };

  return (
    <div className="relative overflow-hidden min-h-[550px] sm:min-h-[650px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 dark:text-white duration-200">
      {/* Athletic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-[700px] w-[700px] bg-blue-500/10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-red-500/10 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-yellow-500/5 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* hero section */}
      <div className="container pb-8 sm:pb-0 relative z-10">
        <Slider {...settings}>
          {ImageList.map((data) => (
            <div key={data.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                {/* text content section */}
                <div className="flex flex-col justify-center gap-6 pt-12 sm:pt-0 text-center sm:text-left order-2 sm:order-1 px-4">
                  <h1
                    data-aos="zoom-out"
                    data-aos-duration="500"
                    data-aos-once="true"
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent"
                  >
                    {data.title}
                  </h1>
                  <p
                    data-aos="fade-up"
                    data-aos-duration="500"
                    data-aos-delay="100"
                    className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto sm:mx-0"
                  >
                    {data.description}
                  </p>
                  <div
                    data-aos="fade-up"
                    data-aos-duration="500"
                    data-aos-delay="300"
                    className="mt-4"
                  >
                    <button
                      onClick={handleOrderPopup}
                      className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition-all bg-gradient-to-r from-blue-600 to-red-600 rounded-full hover:from-blue-500 hover:to-red-500 group shadow-lg hover:shadow-xl"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Shop Now
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </button>
                  </div>
                </div>
                {/* image section */}
                <div className="order-1 sm:order-2">
                  <div
                    data-aos="zoom-in"
                    data-aos-once="true"
                    className="relative"
                  >
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-full blur-md opacity-20 animate-pulse"></div>
                    <img
                      src={data.img}
                      alt=""
                      className="relative z-10 w-[280px] h-[280px] sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px] object-contain mx-auto transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Hero;