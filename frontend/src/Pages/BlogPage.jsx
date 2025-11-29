import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const blogPosts = [
    {
      id: 1,
      title: "The Art of Custom T-Shirt Design: Express Yourself",
      excerpt: "Discover how custom t-shirts have become the ultimate canvas for personal expression in fashion.",
      category: "Design Tips",
      date: "May 15, 2023",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 2,
      title: "Sustainable Fashion: How Custom Apparel Reduces Waste",
      excerpt: "Learn how made-to-order clothing is revolutionizing the fashion industry's environmental impact.",
      category: "Sustainability",
      date: "April 28, 2023",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 3,
      title: "5 Unexpected Ways to Use Custom T-Shirts for Your Business",
      excerpt: "Creative marketing strategies using custom apparel that go beyond standard promotional wear.",
      category: "Business",
      date: "March 10, 2023",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 4,
      title: "The Psychology Behind Color Choices in Custom Apparel",
      excerpt: "How color selection influences perception and what it says about your brand personality.",
      category: "Design Tips",
      date: "February 22, 2023",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 5,
      title: "From Concept to Wardrobe: Our Design Process Revealed",
      excerpt: "A behind-the-scenes look at how we transform ideas into wearable art.",
      category: "Behind The Scenes",
      date: "January 18, 2023",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 6,
      title: "Custom T-Shirts Through the Decades: A Style Evolution",
      excerpt: "How personalized apparel trends have changed from the 1960s to today.",
      category: "History",
      date: "December 5, 2022",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  ];

  const categories = ['All', 'Design Tips', 'Sustainability', 'Business', 'Behind The Scenes', 'History'];

  const filteredPosts = activeCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  return (
    <div className="bg-gray-50 min-h-screen bg-white dark:bg-gray-900 dark:text-white duration-200">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-20 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Thread Thoughts</h1>
        <p className="text-xl max-w-2xl mx-auto">Insights, trends, and inspiration from the world of custom apparel</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-indigo-600">{post.category}</span>
                  <span className="text-sm text-gray-500">{post.date}</span>
                </div>
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                  <Link 
                    to={`/blog/${post.id}`} 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest design tips, promotions, and blog updates.
          </p>
          <div className="flex max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-r-lg hover:bg-indigo-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;