import React from 'react';
import { FaTshirt, FaRunning, FaBrain, FaUsers, FaRegLightbulb, FaRocket, FaHeart, FaStar, FaAward, FaGlobe, FaShieldAlt } from 'react-icons/fa';
import { IoMdColorPalette } from 'react-icons/io';
import { RiTeamFill, RiCustomerService2Fill } from 'react-icons/ri';
import { BiTrendingUp } from 'react-icons/bi';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';

const AboutUs = () => {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Navbar />
      
      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6">
                <FaRocket className="mr-2 animate-bounce" />
                Innovation at its Finest
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6 leading-tight"
            >
              Redefining
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Sportswear
              </span>
              <span className="block text-4xl md:text-5xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Through Innovation
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              At <span className="text-purple-400 font-semibold">SportWearXpress</span>, we blend cutting-edge technology with premium sportswear to deliver personalized athletic apparel that enhances performance and expresses individuality.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg">
                Explore Our Collection
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-purple-500/50 hover:border-purple-400 text-purple-300 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                Watch Our Story
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Happy Customers", icon: FaHeart },
              { number: "100K+", label: "Custom Designs", icon: FaTshirt },
              { number: "4.9★", label: "Customer Rating", icon: FaStar },
              { number: "24/7", label: "Support", icon: RiCustomerService2Fill }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-white/20 hover:to-white/10 transition-all duration-300 transform hover:scale-105">
                  <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium mb-6">
              <FaRegLightbulb className="mr-2" />
              Our Story
            </div>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              From Concept to
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Cutting-Edge
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Founded in 2023 by a team of athletes and tech enthusiasts, SportWearXpress was born from a simple idea: sportswear should be as unique as the athletes who wear it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FaRegLightbulb,
                title: "The Idea",
                description: "Recognizing the gap in personalized athletic wear, our founders set out to create a platform that combines customization with performance.",
                gradient: "from-yellow-500/20 to-orange-500/20",
                border: "border-yellow-500/30",
                iconColor: "text-yellow-400"
              },
              {
                icon: FaBrain,
                title: "AI Integration",
                description: "We pioneered the use of AI in sportswear design, creating intelligent tools that help athletes visualize their perfect gear.",
                gradient: "from-purple-500/20 to-pink-500/20",
                border: "border-purple-500/30",
                iconColor: "text-purple-400"
              },
              {
                icon: FaUsers,
                title: "Community Growth",
                description: "From our first 100 customers to serving athletes worldwide, we've built a community that values both performance and personal expression.",
                gradient: "from-green-500/20 to-emerald-500/20",
                border: "border-green-500/30",
                iconColor: "text-green-400"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className={`bg-gradient-to-br ${item.gradient} backdrop-blur-sm border ${item.border} rounded-2xl p-8 h-full hover:bg-gradient-to-br hover:from-white/20 hover:to-white/10 transition-all duration-300 transform hover:scale-105`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* What Makes Us Unique */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 backdrop-blur-sm border border-pink-500/30 rounded-full text-pink-300 text-sm font-medium mb-6">
              <BiTrendingUp className="mr-2" />
              Innovation
            </div>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Why SportWearXpress
              <span className="block bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                Stands Out
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're not just another sportswear brand. Here's what sets us apart from the competition.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: IoMdColorPalette,
                  title: "Unlimited Customization",
                description: "Our AI-powered design studio offers endless possibilities for personalization.",
                gradient: "from-purple-500/20 to-pink-500/20",
                border: "border-purple-500/30",
                iconColor: "text-purple-400"
                },
                {
                icon: FaRunning,
                  title: "Performance First",
                description: "Every design is engineered to enhance athletic performance, not just look good.",
                gradient: "from-green-500/20 to-emerald-500/20",
                border: "border-green-500/30",
                iconColor: "text-green-400"
                },
                {
                icon: FaTshirt,
                  title: "Premium Materials",
                description: "We use only the highest quality fabrics that stand up to intense training.",
                gradient: "from-blue-500/20 to-cyan-500/20",
                border: "border-blue-500/30",
                iconColor: "text-blue-400"
                },
                {
                icon: FaBrain,
                  title: "Smart Recommendations",
                description: "Our AI learns your preferences to suggest perfect designs for your sport.",
                gradient: "from-indigo-500/20 to-purple-500/20",
                border: "border-indigo-500/30",
                iconColor: "text-indigo-400"
                },
                {
                icon: RiTeamFill,
                  title: "Team Collaboration",
                description: "Special tools for teams to design matching gear with individual touches.",
                gradient: "from-orange-500/20 to-red-500/20",
                border: "border-orange-500/30",
                iconColor: "text-orange-400"
                },
                {
                icon: FaGlobe,
                  title: "Sustainable Innovation",
                description: "Eco-friendly materials and processes without compromising performance.",
                gradient: "from-teal-500/20 to-cyan-500/20",
                border: "border-teal-500/30",
                iconColor: "text-teal-400"
                }
              ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className={`bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border ${feature.border} rounded-2xl p-8 h-full hover:bg-gradient-to-br hover:from-white/20 hover:to-white/10 transition-all duration-300 transform hover:scale-105`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
              ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full text-emerald-300 text-sm font-medium mb-6">
              <RiTeamFill className="mr-2" />
              Our Team
          </div>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              The Minds Behind
              <span className="block bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                the Innovation
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "M Awais Akram",
                role: "Tech Lead & AI Specialist",
                bio: "Architect of our AI customization engine with a passion for machine learning applications in fashion.",
                gradient: "from-blue-500/20 to-indigo-500/20",
                border: "border-blue-500/30"
              },
              {
                name: "Sarah Johnson",
                role: "Creative Director",
                bio: "Former professional athlete turned designer, bringing real-world performance insights to every design.",
                gradient: "from-pink-500/20 to-rose-500/20",
                border: "border-pink-500/30"
              },
              {
                name: "David Chen",
                role: "Head of Operations",
                bio: "Ensuring seamless delivery of custom orders while maintaining our commitment to quality and sustainability.",
                gradient: "from-green-500/20 to-emerald-500/20",
                border: "border-green-500/30"
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className={`bg-gradient-to-br ${member.gradient} backdrop-blur-sm border ${member.border} rounded-2xl p-8 h-full hover:bg-gradient-to-br hover:from-white/20 hover:to-white/10 transition-all duration-300 transform hover:scale-105`}>
                  <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaAward className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white text-center mb-2">{member.name}</h3>
                  <p className="text-purple-300 text-center mb-4 font-medium">{member.role}</p>
                  <p className="text-gray-300 text-center leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Ready to Create Your
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Perfect Sportswear?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of athletes who have already discovered the power of personalized performance wear.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg">
            Start Designing Now
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-purple-500/50 hover:border-purple-400 text-purple-300 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                Contact Our Team
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;