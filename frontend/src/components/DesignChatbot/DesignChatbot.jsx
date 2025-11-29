import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api.js';
import { useAuth } from '../../context/AuthContext';

const DesignChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const { user } = useAuth();

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: "Hello! I'm your AI design assistant, ready to help you create amazing designs! 🎨\n\nI can help you with:\n• Design suggestions and improvements\n• Product search and recommendations\n• Shopping cart management\n• Order tracking\n• Technical troubleshooting\n• Creative inspiration\n\nWhat would you like to work on today?",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Call ChatGPT API with proper authentication, retry logic, and timeout
  const callChatGPT = async (message, retryCount = 2) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestBody = {
      message: message,
      history: chatHistory.slice(-10), // Keep last 10 messages for context
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout

    try {
      const response = await fetch(API_ENDPOINTS.CHATBOT, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different response statuses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        // Handle specific error cases
        if (response.status === 401 || response.status === 403) {
          throw new Error('Please log in to use the chatbot');
        }
        
        if (response.status === 429) {
          // Rate limited - retry after delay
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return callChatGPT(message, retryCount - 1);
          }
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        
        if (response.status >= 500 && retryCount > 0) {
          // Server error - retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          return callChatGPT(message, retryCount - 1);
        }
        
        throw new Error(errorData.message || `Failed to get response (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Chatbot error');
      }

      return data.response || 'I apologize, but I couldn\'t generate a response. Please try again.';
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return callChatGPT(message, retryCount - 1);
        }
        throw new Error('Request timeout. Please try again with a shorter message.');
      }
      
      // Handle network errors
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return callChatGPT(message, retryCount - 1);
        }
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      console.error('ChatGPT API error:', error);
      throw error;
    }
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessageText = inputMessage.trim();

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Update chat history
    setChatHistory(prev => [...prev, { role: 'user', content: userMessageText }]);

    setIsLoading(true);

    try {
      const botResponse = await callChatGPT(userMessageText);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setChatHistory(prev => [...prev, { role: 'assistant', content: botMessage.content }]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: error.message || "I'm sorry, I encountered an error. Please try again or check your connection.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      if (error.message.includes('log in')) {
        toast.error('Please log in to use the chatbot features');
      } else {
        toast.error('Failed to get response from chatbot');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { text: "Search Products", message: "Show me some products" },
    { text: "View Cart", message: "What's in my cart?" },
    { text: "My Orders", message: "Show my recent orders" },
    { text: "Help", message: "How can you help me?" }
  ];

  const handleQuickAction = (message) => {
    setInputMessage(message);
    // Automatically send after state update
    setTimeout(() => {
      handleSendMessage();
    }, 50);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 z-50"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
      </button>

      {/* Chatbot Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaRobot size={20} />
              <span className="font-semibold">AI Assistant</span>
            </div>
            {!user && (
              <span className="text-xs bg-yellow-500 px-2 py-1 rounded">
                Login for full features
              </span>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chatbot"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <FaRobot size={16} className="mt-1 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                    <div className="whitespace-pre-line text-sm break-words">
                      {message.content}
                    </div>
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin" size={16} />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputMessage(action.message);
                    setTimeout(handleSendMessage, 100);
                  }}
                  className="text-xs bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={user ? "Ask me anything..." : "Login to ask questions..."}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading || !user}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || !user}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 disabled:dark:bg-gray-600"
                aria-label="Send message"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
            {!user && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Please log in to use the chatbot
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DesignChatbot; 
