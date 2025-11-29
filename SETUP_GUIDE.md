# 🚀 Quick Setup Guide - SportswearXpress

## ⚡ Quick Start (Automated)

### Step 1: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your MongoDB URI and OpenAI API key
npm run dev
```

### Step 2: Frontend Setup (New Terminal)
```bash
cd frontend
npm install
cp .env.example .env.local
# Optional: Edit .env.local if backend URL is different
npm run dev
```

## 📋 Manual Setup Details

### Backend Environment Variables

Create `backend/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/mern-ecommerce
JWT_SECRET=your_jwt_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key
```

### Frontend Environment Variables

Create `frontend/.env.local` file (optional):
```env
VITE_API_URL=http://localhost:5000
```

## 🔑 Getting API Keys

### MongoDB
- **Local**: Install MongoDB locally or use MongoDB Atlas
- **Atlas**: https://www.mongodb.com/cloud/atlas

### OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Sign up/Login
3. Create new secret key
4. Copy and add to `.env` file

## ✅ Verify Installation

1. **Backend**: http://localhost:5000/api/v1/test
2. **Frontend**: http://localhost:5173
3. **Chatbot Health**: http://localhost:5000/api/v1/chatbot/health

## 🎯 Default Ports

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

---

**Ready to go!** 🚀

