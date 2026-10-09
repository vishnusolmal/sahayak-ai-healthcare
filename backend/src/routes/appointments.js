import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/appointments.json');

// Vercel serverless functions have a read-only filesystem.
// Use in-memory store when VERCEL env var is set; use JSON file locally.
const IS_SERVERLESS = !!process.env.VERCEL;
let memoryStore = []; // in-memory appointments for serverless environments

// Helper to read appointments
async function readAppointments() {
  if (IS_SERVERLESS) return [...memoryStore];
  try {
    if (!fs.existsSync(DATA_FILE)) {
      await fs.promises.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.promises.writeFile(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const content = await fs.promises.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error('Error reading appointments.json:', err);
    return [];
  }
}

// Helper to write appointments
async function writeAppointments(data) {
  if (IS_SERVERLESS) { memoryStore = data; return true; }
  try {
    await fs.promises.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing appointments.json:', err);
    return false;
  }
}

// GET /api/appointments - fetch all bookings
router.get('/', async (req, res) => {
  const appointments = await readAppointments();
  res.json({ appointments, count: appointments.length });
});

// POST /api/appointments - book a teleconsultation
router.post('/', async (req, res) => {
  const { name, phone, symptom, preferredTime, doctorType } = req.body;

  if (!name || !symptom) {
    return res.status(400).json({ error: 'Name and symptom are required' });
  }

  const newAppointment = {
    id: `SHK-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name.trim(),
    phone: phone ? phone.trim() : 'Not provided',
    symptom: symptom.trim(),
    preferredTime: preferredTime || 'Morning (10:00 AM - 12:00 PM)',
    doctorType: doctorType || 'General Physician (MBBS)',
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  const existing = await readAppointments();
  existing.unshift(newAppointment); // prepend latest
  await writeAppointments(existing);

  res.status(201).json({
    success: true,
    message: 'Teleconsultation booked successfully',
    appointment: newAppointment
  });
});

export default router;
