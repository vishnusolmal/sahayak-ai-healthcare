import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/appointments.json');

// Helper to read appointments
function readAppointments() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error('Error reading appointments.json:', err);
    return [];
  }
}

// Helper to write appointments
function writeAppointments(data) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing appointments.json:', err);
    return false;
  }
}

// GET /api/appointments - fetch all bookings
router.get('/', (req, res) => {
  const appointments = readAppointments();
  res.json({ appointments, count: appointments.length });
});

// POST /api/appointments - book a teleconsultation
router.post('/', (req, res) => {
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

  const existing = readAppointments();
  existing.unshift(newAppointment); // prepend latest
  writeAppointments(existing);

  res.status(201).json({
    success: true,
    message: 'Teleconsultation booked successfully',
    appointment: newAppointment
  });
});

export default router;
