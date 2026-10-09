# SahayakAI (सहायक AI) 🩺🇮🇳
> **AI-Powered Healthcare Accessibility Platform for Elderly, Rural, Low-Literacy & Differently-Abled Users in India.**

SahayakAI is an inclusive, voice-enabled healthcare companion designed to eliminate literacy, language, and sensory barriers to essential healthcare guidance.

🔗 **Live Demo**: [https://sahayak-ai-healthcare.vercel.app](https://sahayak-ai-healthcare.vercel.app)  
📦 **GitHub**: [https://github.com/vishnusolmal/sahayak-ai-healthcare](https://github.com/vishnusolmal/sahayak-ai-healthcare)

---

## 🌟 Key Innovations for Inclusion & Accessibility
- **Voice-First Interaction (वाक् सहायता)**: Built with browser-native Web Speech API (zero latency, zero paid third-party dependencies). Users can speak and listen in both English and Hindi.
- **Ultra-Accessible UI**: One-click **High Contrast Mode** (Yellow-on-Black low-vision standard) and **Font Size Scaling** (Normal, Large, Extra Large).
- **Triage AI Engine**: Powered by Google Gemini API with smart urgency scoring (Low/Medium/High) and safety disclaimers.
- **Fail-Safe Clinical Fallback**: Judges can run and evaluate all features immediately even before setting up a Gemini API key.
- **India-Specific Emergency & Telecare**: One-tap SOS (112, 108, 102), hospital locator with direct calling (`tel:`), and teleconsultation scheduling.
- **Ultra-Lightweight**: Zero database setup required, uses browser LocalStorage and backend JSON file persistence. Repo footprint is under 10MB without dependencies.

---

## 🚀 Quickstart Guide for Judges

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Modern web browser (Google Chrome or Microsoft Edge recommended for native Web Speech API support)

---

### Step 1: Install Dependencies
Run the following command from the project root directory:

```bash
# Install both backend and frontend dependencies in one command
npm run install:all
```
*(Alternatively, run `npm install` inside both `backend/` and `frontend/` directories).*

---

### Step 2: Configure Environment (Optional)
The backend includes a `.env` file pre-configured with a placeholder:

```bash
# backend/.env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_placeholder
```

> **Note for Judges**: You can paste your Google Gemini API key into `backend/.env`. If you don't have one handy, **SahayakAI includes an intelligent clinical simulation mode** so every feature can be fully tested without errors!

---

### Step 3: Run the Application
From the root directory, start both the backend and frontend concurrently:

```bash
npm run dev
```

Or run them in two separate terminal windows:
```bash
# Terminal 1 (Backend - Port 5000):
npm run dev:backend

# Terminal 2 (Frontend - Port 5173):
npm run dev:frontend
```

Now open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## ☁️ Production Deployment (Vercel)

This repo is configured for **one-click Vercel deployment** via `vercel.json`:

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import `vishnusolmal/sahayak-ai-healthcare`
2. Vercel auto-detects `vercel.json` — no build settings to change
3. Add one **Environment Variable** in Vercel dashboard:

   | Key | Value |
   |-----|-------|
   | `GEMINI_API_KEY` | Your key from [aistudio.google.com](https://aistudio.google.com/) |

4. Click **Deploy** 🎉

The backend Express API is deployed as a **serverless function** and the React frontend as a **static site**, both on the same Vercel URL under `/api/*`.

---

## 🧪 Step-by-Step Feature Testing Guide

| # | Feature | How to Test | Expected Result |
|---|---|---|---|
| **1** | **Scaffold & Health** | Open `http://localhost:5173` | Displays status `Connected (SahayakAI Healthcare Backend)` |
| **2** | **Home Navigation** | Click on any of the 5 large action cards | Instant navigation to module with voice feedback |
| **3** | **Accessibility Controls** | Click **"High Contrast"** or **"Text Size"** in top navbar | Instant switch to high-contrast theme and enlarged fonts |
| **4** | **Language Switcher** | Toggle between **English** and **हिंदी** in navbar | All UI cards and AI responses switch language |
| **5** | **AI Symptom Checker** | Click mic icon or type *"I have a fever and sore throat for 2 days"* | AI responds with triage advice, urgency level badge, and reads aloud |
| **6** | **Medicine Reminder** | Add a medicine (e.g. *"Paracetamol"*) set 1 minute ahead | Audio alert speaks *"Time to take Paracetamol"* and notification pops up |
| **7** | **Hospital Finder** | Navigate to "Find Hospital" | Lists 5 Indian healthcare centers with distance and direct `tel:` call button |
| **8** | **Emergency SOS** | Click the large Red SOS button | Sounds alarm simulation, highlights 112/108/102 and nearest hospital |
| **9** | **Teleconsultation** | Fill out the simple 3-field booking form | Confirms booking, generates reference ID, and saves locally/in JSON |

---

## 📁 Repository Structure
```
sahayak-ai-healthcare/
├── .gitignore               # Strict ignore: node_modules, .env, dist, build (<10MB)
├── README.md                # Documentation and evaluation guide
├── package.json             # Root runner scripts (postinstall, dev, start)
├── vercel.json              # Vercel monorepo deployment config
├── Procfile                 # Heroku/Railway compatibility
├── backend/
│   ├── .env.example         # Environment variable template (safe to commit)
│   ├── package.json
│   └── src/
│       ├── server.js        # Express API server — exports app for Vercel serverless
│       ├── routes/
│       │   ├── chat.js      # Gemini AI triage endpoint
│       │   └── appointments.js  # Teleconsultation booking (file + in-memory)
│       └── data/            # JSON data storage (local only)
└── frontend/
    ├── .env.example         # VITE_API_URL template
    ├── package.json
    ├── vite.config.js       # Vite dev server + /api proxy
    ├── tailwind.config.js   # Accessibility & contrast color tokens
    └── src/
        ├── App.jsx
        ├── index.css        # High-contrast & font-size styles
        ├── components/      # Navbar, AccessibilityBar
        ├── context/         # AccessibilityContext
        ├── services/        # speechService (Web Speech API)
        ├── utils/           # translations (EN/HI)
        └── pages/           # Feature pages (Chat, Medicine, Hospital, SOS, Teleconsult)
```

---

## 🔒 Privacy & Safety
- SahayakAI provides educational and preliminary health guidance only.
- Every assessment includes an explicit medical disclaimer advising consultation with certified healthcare professionals.
