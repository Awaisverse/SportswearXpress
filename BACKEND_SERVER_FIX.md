# 🔧 Backend Server Fix - Failed to Fetch Products

## Problem Identified

The **backend server is not running**, which is why you're getting "failed to fetch products" error.

## Solution

### Option 1: Start Backend Server Manually

1. Open a terminal/command prompt
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

### Option 2: Start Backend Server (Windows PowerShell)

I've attempted to start it automatically. Check if a new PowerShell window opened.

## Verify Server is Running

After starting the server, verify it's running:

1. **Check the terminal output** - You should see:

   ```
   Server running in development mode on port 5000
   MongoDB Connected: localhost
   ```

2. **Test the endpoint**:

   ```bash
   curl http://localhost:5000/api/v1/products
   ```

   Or open in browser: http://localhost:5000/api/v1/test

## Expected Output

When working correctly, you should see:

- ✅ Backend server running on port 5000
- ✅ MongoDB connected
- ✅ Products endpoint accessible at `/api/v1/products`

## Common Issues

### Issue 1: Port 5000 Already in Use

**Solution**: Kill the process using port 5000:

```bash
# Find process
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 2: MongoDB Not Connected

**Solution**: Make sure MongoDB is running:

- Check if MongoDB service is running
- Verify MONGODB_URI in `.env` file is correct

### Issue 3: Environment Variables Missing

**Solution**: Check your `backend/.env` file has:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Quick Fix Script

If server keeps stopping, you can create a `start-backend.bat` file:

```batch
@echo off
cd backend
echo Starting backend server...
npm run dev
pause
```

Double-click the file to start the server.

## Still Having Issues?

1. Check backend terminal for error messages
2. Verify all dependencies are installed: `npm install`
3. Check MongoDB connection string
4. Verify port 5000 is available
