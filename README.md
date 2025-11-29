# 🏪 SportswearXpress - MERN E-Commerce Platform

A full-stack e-commerce platform built with MongoDB, Express, React, and Node.js, featuring AI-powered chatbot integration with ChatGPT API.

## 🌟 Features

### Core E-Commerce Features
- ✅ **Product Management**: Complete CRUD operations for products
- ✅ **User Authentication**: Separate roles for Buyers, Sellers, and Admins
- ✅ **Shopping Cart**: Full cart management with quantity updates
- ✅ **Order Processing**: Order creation, tracking, and management
- ✅ **Customization**: Design customization tool for products
- ✅ **Payment Integration**: Payment processing and verification
- ✅ **Complaint System**: User complaint management
- ✅ **Refund Management**: Order refund processing

### AI Features
- 🤖 **ChatGPT Integration**: Intelligent chatbot with function calling
- 🎯 **Agentic AI**: Automatically performs actions (search, add to cart, etc.)
- 💬 **Conversational Interface**: Natural language understanding
- 🔧 **9 Function Calls**: Product search, cart management, order tracking

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **OpenAI API** - ChatGPT integration
- **Cloudinary** - Image storage
- **Multer** - File uploads

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- OpenAI API key (for chatbot)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file (optional):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🎯 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/verify-token` - Verify JWT token

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product (seller)
- `PUT /api/v1/products/:id` - Update product (seller)
- `DELETE /api/v1/products/:id` - Delete product (seller)

### Cart
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/update` - Update cart item
- `DELETE /api/v1/cart/remove/:itemId` - Remove item

### Orders
- `POST /api/v1/order/create` - Create order
- `GET /api/v1/order/buyer` - Get buyer orders
- `GET /api/v1/order/seller` - Get seller orders
- `GET /api/v1/order/:orderId` - Get order details

### Chatbot (NEW!)
- `GET /api/v1/chatbot/health` - Health check
- `POST /api/v1/chatbot/chat` - Chat with AI assistant
- `POST /api/chatgpt` - Legacy endpoint (compatible)

## 🤖 AI Chatbot Features

The integrated ChatGPT chatbot can:
- 🔍 Search products by query, category, price range
- 📦 Add products to cart automatically
- 🛒 View and manage shopping cart
- 📋 Check order history and details
- 💡 Provide design suggestions
- ❓ Answer questions about the platform

### Example Conversations:
- "Show me running shoes under $50"
- "Add product ID 12345 to my cart"
- "What's in my cart?"
- "Show my recent orders"

## 📁 Project Structure

```
mern-ecommerce/
├── backend/
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration files
│   ├── services/         # Business logic services
│   ├── scripts/          # Utility scripts
│   └── server.js         # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── Pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── redux/        # Redux store
│   │   ├── services/     # API services
│   │   └── config/       # Configuration
│   └── public/           # Static assets
│
└── README.md
```

## 🔐 User Roles

### Buyer
- Browse and search products
- Add to cart and checkout
- Track orders
- Submit complaints
- Request refunds

### Seller
- Create and manage products
- View and process orders
- Manage inventory
- Track sales and revenue

### Admin
- Manage all users
- Approve/verify sellers
- Process complaints
- View platform analytics
- Manage orders and payments

## 🎨 Design Customization

- Canvas-based design tool
- Add text, shapes, and images
- Real-time preview
- Price calculation
- Save and load designs

## 📚 Documentation

- [ChatGPT Integration Setup](backend/CHATBOT_SETUP.md)
- [Implementation Summary](CHATBOT_IMPLEMENTATION_SUMMARY.md)
- [Optimization Guide](OPTIMIZATION_COMPLETE.md)
- [Troubleshooting](BACKEND_SERVER_FIX.md)

## 🚀 Deployment

### Backend
1. Set environment variables on hosting platform
2. Deploy to services like Heroku, Railway, or AWS
3. Ensure MongoDB connection is accessible

### Frontend
1. Build for production:
   ```bash
   npm run build
   ```
2. Deploy `dist` folder to Vercel, Netlify, or similar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Awaisverse**
- GitHub: [@Awaisverse](https://github.com/Awaisverse)

## 🙏 Acknowledgments

- OpenAI for ChatGPT API
- React and Express.js communities
- All open-source contributors

---

**Made with ❤️ using MERN Stack + AI**

