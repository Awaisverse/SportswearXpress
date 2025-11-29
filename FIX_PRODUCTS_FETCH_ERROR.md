# 🔧 Fix: Failed to Fetch Products Error

## Problem

You're getting "failed to fetch products" error because **the backend server is not running** or **not accessible**.

## Quick Fix Steps

### Step 1: Check Backend Server Status

1. Open a **new terminal/command prompt**
2. Navigate to backend folder:

   ```bash
   cd R:\2\mern-ecommerce\backend
   ```

3. Check if server is running:
   ```bash
   netstat -ano | findstr :5000
   ```

### Step 2: Start Backend Server

If server is NOT running:

```bash
cd R:\2\mern-ecommerce\backend
npm run dev
```

You should see:

```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### Step 3: Verify MongoDB is Running

The backend needs MongoDB to be running. Check:

1. **If MongoDB is installed locally**: Start MongoDB service
2. **If using MongoDB Atlas**: Check your connection string in `.env`

### Step 4: Test Products Endpoint

Open browser and go to:

```
http://localhost:5000/api/v1/products
```

Or use curl:

```bash
curl http://localhost:5000/api/v1/products
```

You should see JSON response with products.

### Step 5: Check Frontend API Configuration

Make sure frontend is pointing to correct backend URL.

1. Check `frontend/.env` or `frontend/.env.local`:

   ```
   VITE_API_URL=http://localhost:5000
   ```

2. Or check `frontend/src/config/api.js`:
   ```javascript
   export const API_BASE_URL =
     import.meta.env.VITE_API_URL || "http://localhost:5000";
   ```

## Common Issues & Solutions

### Issue 1: Port 5000 Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

### Issue 2: MongoDB Connection Failed

**Error**: `MongoDB connection error` or `MONGODB_URI is not defined`

**Solution**:

1. Check `backend/.env` file exists
2. Verify it contains:

   ```env
   MONGODB_URI=mongodb://localhost:27017/mern-ecommerce
   ```

   Or your MongoDB Atlas connection string

3. Make sure MongoDB is running

### Issue 3: CORS Error in Browser

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: This should already be configured. Check `backend/server.js`:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
```

### Issue 4: Frontend Can't Connect

**Error**: `Failed to fetch` or `Network error`

**Solutions**:

1. Make sure backend is running on port 5000
2. Check if frontend URL matches backend CORS settings
3. Try accessing `http://localhost:5000/api/v1/test` directly in browser

## Step-by-Step Fix

1. ✅ **Stop any existing backend processes**
2. ✅ **Start MongoDB** (if using local MongoDB)
3. ✅ **Navigate to backend folder**: `cd backend`
4. ✅ **Install dependencies** (if needed): `npm install`
5. ✅ **Start backend**: `npm run dev`
6. ✅ **Wait for**: "Server running" and "MongoDB Connected" messages
7. ✅ **Test in browser**: http://localhost:5000/api/v1/test
8. ✅ **Refresh frontend** - products should load now

## Testing

### Test 1: Backend Health

```
http://localhost:5000/api/v1/test
```

Should return: `{"message": "Backend server is working!"}`

### Test 2: Products Endpoint

```
http://localhost:5000/api/v1/products
```

Should return: `{"success": true, "count": X, "products": [...]}`

### Test 3: Frontend Connection

- Open your frontend app
- Go to Products page
- Check browser console (F12) for errors
- Products should load

## Need Help?

If still having issues:

1. Check backend terminal for error messages
2. Check browser console (F12) for network errors
3. Verify both frontend and backend are running
4. Make sure MongoDB is accessible
