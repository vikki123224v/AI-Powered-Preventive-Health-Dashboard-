# AI-Powered Preventive Health Dashboard

A production-grade full-stack web application that uses **RunAnywhere SDK** for on-device AI analytics and chatbot generation. The system tracks, visualizes, and predicts potential health risks while maintaining **100% data privacy** (no cloud data sharing).

![Health Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## 🎯 Features

### Core Functionality
- **Real-time Health Metrics Tracking**: Monitor heart rate, steps, sleep, blood sugar, and more
- **AI-Powered Chatbot**: Get preventive health advice using RunAnywhere SDK (100% on-device processing)
- **Risk Score Prediction**: Hybrid AI + rule-based risk assessment (0-100 scale)
- **Interactive Dashboard**: Beautiful charts and visualizations using Chart.js
- **Report Generation**: Export health data as PDF or CSV
- **Dark/Light Mode**: Modern UI with theme switching
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Security & Privacy
- **JWT Authentication**: Secure user authentication
- **Bcrypt Password Hashing**: Industry-standard password security
- **Rate Limiting**: Protection against abuse
- **Helmet.js**: Security headers
- **100% Data Privacy**: All AI processing done locally via RunAnywhere SDK

## 🏗️ Architecture

```
/project-root
├── /frontend          → React + Vite + Tailwind CSS
├── /backend           → Node.js + Express.js + RunAnywhere SDK
├── /database          → MongoDB + Mongoose models
├── /public            → Static assets
├── /utils             → Helper scripts, config, AI prompt templates
├── package.json       → Root package with concurrently scripts
├── .env.example       → Environment variables template
└── README.md          → This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** (local or Atlas)
- **RunAnywhere SDK** API key (optional for local mode)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-powered-health-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```
   This installs dependencies for root, backend, and frontend.

3. **Configure environment variables**
   ```bash
   cp .env.example backend/.env
   ```
   Edit `backend/.env` with your configuration:
   - MongoDB connection string
   - JWT secret (use a strong random string)
   - RunAnywhere API key (if using cloud mode)

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```
   This starts:
   - Backend server on `http://localhost:5000`
   - Frontend dev server on `http://localhost:5173`

6. **Access the application**
   - Open `http://localhost:5173` in your browser
   - Register a new account or login
   - Start tracking your health metrics!

## 📁 Project Structure

### Backend (`/backend`)
```
backend/
├── server.js              → Express server entry point
├── routes/
│   ├── auth.js           → Authentication routes
│   ├── health.js         → Health metrics CRUD
│   ├── chat.js           → AI chatbot endpoint
│   ├── report.js         → PDF/CSV report generation
│   └── risk.js           → Risk score calculation
├── database/
│   ├── dbConnect.js      → MongoDB connection with retry logic
│   └── models/
│       ├── User.js       → User schema
│       ├── HealthMetric.js → Health data schema
│       └── AIInsight.js  → AI chat history schema
├── ai/
│   └── runAnywhereClient.js → RunAnywhere SDK integration
├── middleware/
│   └── auth.js           → JWT authentication middleware
└── utils/
    ├── logger.js         → Winston logger
    ├── aiPrompts.js      → AI prompt templates
    └── healthUtils.js    → Metric normalization & validation
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx     → Authentication page
│   │   ├── Dashboard.jsx → Main dashboard with metrics
│   │   ├── Chatbot.jsx   → AI chat interface
│   │   ├── Reports.jsx   → Report download page
│   │   └── Settings.jsx  → User settings
│   ├── components/
│   │   ├── Layout.jsx    → App layout wrapper
│   │   ├── Navbar.jsx   → Top navigation
│   │   ├── Sidebar.jsx  → Side navigation
│   │   └── PrivateRoute.jsx → Protected route wrapper
│   └── contexts/
│       ├── AuthContext.jsx → Authentication state
│       └── ThemeContext.jsx → Dark/light theme
├── vite.config.js        → Vite configuration
└── tailwind.config.js    → Tailwind CSS configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Health Metrics
- `GET /api/health` - Get health metrics (with date range)
- `POST /api/health` - Create/update health metric
- `GET /api/health/stats` - Get aggregated statistics
- `GET /api/health/dummy` - Generate dummy data for testing

### AI Chatbot
- `POST /api/chat` - Send message to AI assistant
- `GET /api/chat/history` - Get chat history

### Risk Assessment
- `GET /api/risk` - Get current risk score
- `POST /api/risk/analyze` - Get detailed AI analysis

### Reports
- `GET /api/report/pdf` - Download PDF health report
- `GET /api/report/csv` - Download CSV health data

## 🧠 RunAnywhere SDK Integration

The application uses **RunAnywhere SDK** for on-device AI processing, ensuring 100% data privacy. The SDK is integrated in `/backend/ai/runAnywhereClient.js`.

### Features
- **Local AI Processing**: All AI analysis happens on-device
- **Structured JSON Output**: Consistent response format
- **Health Advice Generation**: Personalized preventive recommendations
- **Risk Prediction**: AI-powered risk scoring

### Usage Example
```javascript
import { generateHealthAdvice } from './ai/runAnywhereClient.js';

const advice = await generateHealthAdvice(userMetrics);
// Returns: { advice, riskScore, recommendations, alerts, trend }
```

## 🎨 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Schema validation
- **PDFKit** - PDF generation
- **csv-writer** - CSV export
- **Winston** - Logging
- **RunAnywhere SDK** - On-device AI

### Security
- **Helmet.js** - Security headers
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing
- **JWT** - Token-based authentication

## 📊 Health Metrics

The dashboard tracks:
- **Heart Rate** (bpm) - Resting heart rate
- **Steps** - Daily step count
- **Sleep Hours** - Nightly sleep duration
- **Blood Sugar** (mg/dL) - Glucose levels
- **Blood Pressure** - Systolic/Diastolic
- **Weight** (kg) - Body weight

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing (12 rounds)
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- Input validation with Zod
- CORS configuration
- Environment-based secrets

## 🧪 Testing with Dummy Data

Generate dummy health data for testing:
```bash
# After logging in, visit:
GET /api/health/dummy?userId=YOUR_USER_ID&days=30
```

This creates 30 days of realistic health metrics for visualization and testing.

## 📦 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- Strong `JWT_SECRET`
- Production `MONGODB_URI`
- `NODE_ENV=production`
- `FRONTEND_URL` (your production frontend URL)

### Start Production Server
```bash
cd backend
npm start
```

## 🚧 Future Enhancements

The following features are planned for future releases:

- [ ] **Voice-based AI Assistant** (STT + TTS)
- [ ] **Wearable Integration** (Fitbit API, Apple Health)
- [ ] **Multi-modal AI** (image + text analysis)
- [ ] **Gamified Health Streaks**
- [ ] **Real-time Notifications** (Web Push API)
- [ ] **Health Goal Setting** & Tracking
- [ ] **Medication Reminders**
- [ ] **Family Health Sharing**

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact the development team

## 🙏 Acknowledgments

- **RunAnywhere SDK** for on-device AI processing
- **Chart.js** for beautiful data visualizations
- **Tailwind CSS** for rapid UI development
- **Framer Motion** for smooth animations

---

**Built with ❤️ for preventive healthcare**

