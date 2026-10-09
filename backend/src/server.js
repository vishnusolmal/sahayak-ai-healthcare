import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRouter from './routes/chat.js';
import appointmentsRouter from './routes/appointments.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet()); // Sets HTTP security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? '*' : ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow all in production, restrict in dev
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '5mb' })); // Limit body size to prevent payload DOS

// Rate limiting to prevent brute-force and API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SahayakAI Healthcare Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_placeholder')
  });
});

// Chatbot Symptom Checker Route
app.use('/api/chat', chatRouter);

// Teleconsultation Appointments Route
app.use('/api/appointments', appointmentsRouter);

// Only start HTTP server when running locally (not on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SahayakAI] Backend server running at http://localhost:${PORT}`);
  });
}

// Export app for Vercel serverless handler
export default app;
