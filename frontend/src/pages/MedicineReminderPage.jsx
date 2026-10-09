import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Bell, 
  Clock, 
  Check, 
  Trash2, 
  Volume2, 
  AlertCircle, 
  Sparkles,
  Timer,
  BellRing
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export default function MedicineReminderPage({ setCurrentView, lang, t }) {
  const { highContrast, simpleMode } = useAccessibility();

  // Load saved reminders or default samples
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('sahayak_medicine_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: '1',
        name: 'Paracetamol 650mg',
        time: '14:00',
        dosage: '1 Tablet',
        instruction: 'After Food (भोजन के बाद)',
        taken: false
      },
      {
        id: '2',
        name: 'Amlodipine 5mg (BP)',
        time: '20:30',
        dosage: '1 Tablet',
        instruction: 'Before Bed (सोने से पहले)',
        taken: false
      }
    ];
  });

  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [instruction, setInstruction] = useState('After Food');
  const [activeAlert, setActiveAlert] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Request browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          setNotificationPermission(perm);
        });
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('sahayak_medicine_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Audio tone synthesizer using Web Audio API (zero external sound files needed)
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  // Trigger medicine alert (Speaks aloud + Browser notification + Visual modal)
  const triggerReminderAlert = (med) => {
    playChime();

    const announcement = lang === 'hi'
      ? `कृपया ध्यान दें! आपकी दवा ${med.name} लेने का समय हो गया है। खुराक: ${med.dosage}`
      : `Attention! It is time to take your medicine: ${med.name}. Dosage: ${med.dosage}`;

    // Speak aloud
    speechService.speak(announcement, lang);

    // Browser native notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`💊 ${lang === 'hi' ? 'दवा का समय!' : 'Medicine Time!'}`, {
          body: `${med.name} - ${med.dosage} (${med.instruction})`,
          icon: '/favicon.ico'
        });
      } catch (err) {
        console.warn('Notification failed:', err);
      }
    }

    setActiveAlert(med);
  };

  // Timer ticker: checks every 15 seconds if any reminder matches current time (HH:MM)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      reminders.forEach((r) => {
        if (r.time === currentTimeStr && !r.taken && (!activeAlert || activeAlert.id !== r.id)) {
          triggerReminderAlert(r);
        }
      });
    }, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders, activeAlert, lang]);

  // Handle adding reminder
  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!name.trim() || !time) return;

    const newReminder = {
      id: Date.now().toString(),
      name: name.trim(),
      time,
      dosage: dosage.trim() || '1 Dose',
      instruction,
      taken: false
    };

    setReminders([...reminders, newReminder]);
    setName('');
    setTime('');

    const confirmMsg = lang === 'hi'
      ? `${newReminder.name} का रिमाइंडर ${newReminder.time} बजे के लिए सेट किया गया`
      : `Reminder for ${newReminder.name} set for ${newReminder.time}`;
    speechService.speak(confirmMsg, lang);
  };

  // Quick 5-second test reminder for hackathon judging convenience
  const handleTriggerTest = () => {
    const testMed = {
      id: 'test-' + Date.now(),
      name: 'Paracetamol 650mg (Test)',
      time: 'Now',
      dosage: '1 Tablet',
      instruction: 'After Food (भोजन के बाद)',
      taken: false
    };
    triggerReminderAlert(testMed);
  };

  const toggleTaken = (id) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, taken: !r.taken } : r))
    );
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Active Medicine Alarm Alert Popup Modal */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-blue-500 animate-bounce-once text-center">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <BellRing className="w-10 h-10" />
            </div>
            
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-black uppercase tracking-wider rounded-full">
              🚨 {lang === 'hi' ? 'दवा का समय हो गया है!' : 'Time for Medicine!'}
            </span>
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-2">
              {activeAlert.name}
            </h2>
            
            <p className="text-lg text-slate-700 font-bold mb-1">
              💊 {activeAlert.dosage}
            </p>
            <p className="text-sm text-slate-500 font-medium mb-6">
              ℹ️ {activeAlert.instruction}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  toggleTaken(activeAlert.id);
                  setActiveAlert(null);
                  speechService.speak(lang === 'hi' ? 'बहुत अच्छा! दवा ले ली गई है।' : 'Great! Marked as taken.', lang);
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all"
              >
                ✓ {lang === 'hi' ? 'मैंने दवा ले ली (Mark as Taken)' : 'I Took My Medicine'}
              </button>

              <button
                onClick={() => setActiveAlert(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm"
              >
                {lang === 'hi' ? 'बाद में याद दिलाएं (Snooze)' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Title & Test Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Pill className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t.cardReminderTitle}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                {lang === 'hi' ? 'दवा समय पर लें • बोलकर अलार्म और नोटिफिकेशन' : 'Scheduled voice alarms and browser alerts'}
              </p>
            </div>
          </div>
        </div>

        {/* Instant Test Alert Button for Hackathon Judges */}
        <button
          onClick={handleTriggerTest}
          className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm active:scale-95 transition-all"
        >
          <Timer className="w-5 h-5 animate-spin" />
          <span>{lang === 'hi' ? '🔔 तुरंत टेस्ट अलार्म बजाएं' : '🔔 Test Voice Alarm Now'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Add Medicine Form */}
        <div className="lg:col-span-5">
          <div className={`p-6 sm:p-7 rounded-3xl border-2 border-slate-200 bg-white shadow-sm ${
            highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''
          }`}>
            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>{lang === 'hi' ? 'नई दवा जोड़ें' : 'Add New Medicine'}</span>
            </h2>

            <form onSubmit={handleAddReminder} className="space-y-4">
              {/* Medicine Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {lang === 'hi' ? 'दवा का नाम' : 'Medicine Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'hi' ? 'उदा. पैरासिटामोल 650mg' : 'e.g., Paracetamol 650mg'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 font-medium text-base text-slate-900 focus:outline-none"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {lang === 'hi' ? 'समय (24-Hour Time)' : 'Reminder Time'} *
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 font-bold text-lg text-slate-900 focus:outline-none"
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {lang === 'hi' ? 'खुराक (Dosage)' : 'Dosage'}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1 Tablet, 5ml Syrup"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 font-medium text-base text-slate-900 focus:outline-none"
                />
              </div>

              {/* Meal Instruction */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {lang === 'hi' ? 'निर्देश (कब लेनी है)' : 'Meal Instructions'}
                </label>
                <select
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 font-medium text-base text-slate-900 focus:outline-none bg-white"
                >
                  <option value="After Food">After Food (भोजन के बाद)</option>
                  <option value="Before Food">Before Food (खाली पेट / भोजन से पहले)</option>
                  <option value="With Milk">With Milk (दूध के साथ)</option>
                  <option value="At Bedtime">At Bedtime (सोते समय)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="w-5 h-5" />
                <span>{lang === 'hi' ? 'रिमाइंडर सेट करें' : 'Set Voice Reminder'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Scheduled Reminders List */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>{lang === 'hi' ? 'आपकी निर्धारित दवाएं' : 'Your Scheduled Medicines'}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {reminders.length}
              </span>
            </h2>

            {notificationPermission !== 'granted' && (
              <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {lang === 'hi' ? 'ब्राउज़र नोटिफिकेशन सक्षम करें' : 'Enable notifications'}
              </span>
            )}
          </div>

          {reminders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-300">
              <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold">
                {lang === 'hi' ? 'कोई दवा निर्धारित नहीं है।' : 'No medicine reminders added yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((med) => (
                <div
                  key={med.id}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    med.taken
                      ? 'bg-emerald-50 border-emerald-300 opacity-80'
                      : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
                  } ${highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      med.taken ? 'bg-emerald-600 text-white' : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Clock className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-black ${med.taken ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {med.name}
                        </h3>
                        {med.taken && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                            {lang === 'hi' ? 'ले ली गई' : 'Taken'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 mt-1">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-bold">
                          🕒 {med.time}
                        </span>
                        <span>•</span>
                        <span>💊 {med.dosage}</span>
                        <span>•</span>
                        <span>{med.instruction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Read Aloud */}
                    <button
                      onClick={() => speechService.speak(`${med.name}, ${med.time}, ${med.instruction}`, lang)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                      title={t.listenText}
                      aria-label={`Listen to ${med.name} reminder details aloud`}
                    >
                      <Volume2 className="w-5 h-5 text-blue-600" />
                    </button>

                    {/* Toggle Taken */}
                    <button
                      onClick={() => toggleTaken(med.id)}
                      aria-label={med.taken ? `Mark ${med.name} as pending` : `Mark ${med.name} as taken`}
                      className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        med.taken
                          ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{med.taken ? (lang === 'hi' ? 'वापस' : 'Undo') : (lang === 'hi' ? 'दवा ली' : 'Take')}</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteReminder(med.id)}
                      className="p-2.5 rounded-xl text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title={lang === 'hi' ? 'रिमाइंडर हटाएं' : 'Delete reminder'}
                      aria-label={`Delete reminder for ${med.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
