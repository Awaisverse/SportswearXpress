#!/bin/bash

# SportswearXpress - Automated Setup Script (Bash/Linux/Mac)

echo "🚀 Setting up SportswearXpress..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend || exit

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "⚠️  Please edit backend/.env file with your configuration!"
    else
        echo "⚠️  .env.example not found. Please create .env manually."
    fi
else
    echo "✅ .env file already exists"
fi

cd ..

# Frontend Setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend || exit

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local file"
    fi
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Edit backend/.env with your MongoDB URI and OpenAI API key"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend (new terminal): cd frontend && npm run dev"
echo ""
echo "🌐 Your app will be available at:"
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo ""

