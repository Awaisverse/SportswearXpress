# SportswearXpress - Automated Setup Script (PowerShell)

Write-Host "🚀 Setting up SportswearXpress..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Backend Setup
Write-Host ""
Write-Host "📦 Setting up Backend..." -ForegroundColor Yellow
Set-Location backend

if (!(Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
        Write-Host "⚠️  Please edit backend/.env file with your configuration!" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  .env.example not found. Please create .env manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Set-Location ..

# Frontend Setup
Write-Host ""
Write-Host "📦 Setting up Frontend..." -ForegroundColor Yellow
Set-Location frontend

if (!(Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
}

# Create .env.local file if it doesn't exist
if (!(Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ Created .env.local file" -ForegroundColor Green
    }
}

Set-Location ..

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env with your MongoDB URI and OpenAI API key"
Write-Host "2. Start backend: cd backend && npm run dev"
Write-Host "3. Start frontend (new terminal): cd frontend && npm run dev"
Write-Host ""
Write-Host "🌐 Your app will be available at:" -ForegroundColor Cyan
Write-Host "   Backend: http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""

