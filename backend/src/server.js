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
// crossOriginResourcePolicy: false prevents helmet from blocking cross-origin
// static assets (fonts, images) loaded on Vercel's CDN edge
app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : null; // null = allow all (safe for single-domain Vercel monorepo deploy)

app.use(cors({
  origin: allowedOrigins || '*',
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

// Serve frontend static build files (for single-service deployment on Render/Railway/Heroku/Docker)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// SPA fallback: Any non-API route serves index.html if available, or a friendly status page
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SahayakAI Backend API</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 60px 20px; background: #f8fafc; color: #0f172a; }
              .card { max-width: 520px; margin: 0 auto; background: white; padding: 36px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
              h1 { color: #16a34a; margin-bottom: 12px; font-size: 24px; }
              p { color: #64748b; line-height: 1.6; }
              .btn { display: inline-block; margin-top: 20px; padding: 10px 22px; background: #16a34a; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; }
              .btn:hover { background: #15803d; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🩺 SahayakAI Backend API is Live</h1>
              <p>The Express backend is operational and ready to receive requests.</p>
              <a class="btn" href="/api/health">Check API Health (/api/health)</a>
            </div>
          </body>
        </html>
      `);
    }
  });
});

// Only start HTTP server when running locally/standard Node (not on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SahayakAI] Backend server running at http://localhost:${PORT}`);
  });
}

// Export app for Vercel serverless handler
export default app;

