# 🚀 How to Start Backend Server

## Quick Start

1. **Open a NEW terminal window**
2. **Navigate to backend folder**:
   ```
   cd R:\2\mern-ecommerce\backend
   ```
3. **Start the server**:
   ```
   npm run dev
   ```
4. **Wait for these messages**:
   ```
   MongoDB Connected: localhost
   Server running in development mode on port 5000
   ```
5. **Keep this terminal window open** - don't close it!

## Verify It's Working

Open your browser and go to:

```
http://localhost:5000/api/v1/test
```

You should see:

```json
{ "message": "Backend server is working!" }
```

## Test Products Endpoint

```
http://localhost:5000/api/v1/products
```

You should see products list in JSON format.

## After Starting

1. ✅ Backend should be running on port 5000
2. ✅ Frontend can now fetch products
3. ✅ Chatbot will also work once OpenAI API key is added

## Common Errors

### Error: Port already in use

**Fix**: Kill the process using port 5000:

```bash
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Error: MongoDB connection failed

**Fix**:

- Make sure MongoDB is running
- Check `.env` file has correct `MONGODB_URI`

### Error: MONGODB_URI not defined

**Fix**: Add to `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/mern-ecommerce
```

## Need Both Servers Running?

- **Backend**: `cd backend && npm run dev` (port 5000)
- **Frontend**: `cd frontend && npm run dev` (port 5173)

Make sure BOTH are running for the app to work!
