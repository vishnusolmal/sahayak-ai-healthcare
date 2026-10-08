import express from 'express';
import cors from 'cors';
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

// Middleware
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`[SahayakAI] Backend server running at http://localhost:${PORT}`);
});
