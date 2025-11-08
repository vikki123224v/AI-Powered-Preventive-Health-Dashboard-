# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Setup Environment
```bash
# Create backend/.env file
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI (or use default localhost)
cd ..
```

### Step 3: Start MongoDB
```bash
# If using local MongoDB:
mongod

# Or use MongoDB Atlas (cloud) - just update MONGODB_URI in backend/.env
```

### Step 4: Run the App
```bash
npm run dev
```

### Step 5: Access the Dashboard
1. Open `http://localhost:5173`
2. Click "Sign Up" to create an account
3. Login with your credentials
4. Generate dummy data (optional):
   - Open browser console (F12)
   - Run: `fetch('/api/health/dummy?userId=' + localStorage.getItem('userId') + '&days=30')`
5. Explore the dashboard!

## 📝 Important Notes

### RunAnywhere SDK
- Currently uses a **mock implementation** for development
- To use real RunAnywhere SDK:
  1. Install: `npm install @runanywhere/sdk` in backend
  2. Update `backend/ai/runAnywhereClient.js` with actual SDK initialization
  3. Add `RUNANYWHERE_API_KEY` to `backend/.env`

### Authentication
- JWT tokens are stored in localStorage
- Token expires in 7 days (configurable in `.env`)
- For production, use a strong `JWT_SECRET`

### MongoDB
- Default connection: `mongodb://localhost:27017/health-dashboard`
- For MongoDB Atlas, update `MONGODB_URI` in `backend/.env`

## 🐛 Troubleshooting

**Port already in use?**
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

**MongoDB connection failed?**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `backend/.env`
- Verify MongoDB is accessible

**Can't login?**
- Clear browser localStorage: `localStorage.clear()`
- Register a new account
- Check backend logs for errors

## 📚 Next Steps

1. **Generate Test Data**: Use the dummy data endpoint to populate metrics
2. **Explore Features**: 
   - Dashboard with charts
   - AI Chatbot
   - Reports (PDF/CSV)
   - Settings
3. **Customize**: 
   - Update health metric ranges in `backend/utils/healthUtils.js`
   - Modify AI prompts in `backend/utils/aiPrompts.js`
   - Customize UI in `frontend/src/`

## 🎯 Key Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/health` - Get metrics
- `POST /api/health` - Save metric
- `POST /api/chat` - AI chat
- `GET /api/risk` - Get risk score
- `GET /api/report/pdf` - Download PDF
- `GET /api/report/csv` - Download CSV

---

**Happy coding! 🎉**

