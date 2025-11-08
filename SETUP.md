# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Setup Environment Variables
```bash
# Copy the example env file
cp .env.example backend/.env

# Edit backend/.env with your configuration
```

### 3. Start MongoDB
```bash
# Option A: Local MongoDB
mongod

# Option B: MongoDB Atlas (Cloud)
# Just update MONGODB_URI in backend/.env
```

### 4. Run the Application
```bash
npm run dev
```

This will start:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`

### 5. Access the Application
- Open `http://localhost:5173`
- Register a new account
- Start using the dashboard!

## Generating Test Data

After logging in, you can generate dummy health data:

```bash
# Using curl (replace YOUR_USER_ID with actual user ID)
curl -X GET "http://localhost:5000/api/health/dummy?userId=YOUR_USER_ID&days=30"
```

Or use the browser console:
```javascript
const userId = localStorage.getItem('userId');
fetch(`/api/health/dummy?userId=${userId}&days=30`)
  .then(r => r.json())
  .then(console.log);
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or check MongoDB Atlas connection
- Verify `MONGODB_URI` in `backend/.env`
- Check MongoDB logs for connection errors

### Port Already in Use
- Change `PORT` in `backend/.env` (default: 5000)
- Change Vite port in `frontend/vite.config.js` (default: 5173)

### RunAnywhere SDK Issues
- The SDK uses a mock implementation by default
- For production, install `@runanywhere/sdk` and configure API key
- See `backend/ai/runAnywhereClient.js` for integration details

### Authentication Issues
- Clear browser localStorage: `localStorage.clear()`
- Register a new account
- Check JWT_SECRET in `backend/.env`

## Production Deployment

1. Build frontend:
   ```bash
   cd frontend && npm run build
   ```

2. Set production environment variables:
   - `NODE_ENV=production`
   - Strong `JWT_SECRET`
   - Production `MONGODB_URI`
   - `FRONTEND_URL` (your domain)

3. Start production server:
   ```bash
   cd backend && npm start
   ```

4. Serve frontend build (using nginx, Apache, or similar)

