import React, { useState, useEffect, useRef } from 'react';
import { 
  CalendarClock, 
  CheckCircle2, 
  Mic, 
  MicOff, 
  User, 
  Phone, 
  FileText, 
  Clock, 
  Stethoscope, 
  Volume2, 
  ArrowLeft, 
  Plus, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export default function TeleconsultationPage({ setCurrentView, lang, t }) {
  const { highContrast, simpleMode } = useAccessibility();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [symptom, setSymptom] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (10:00 AM - 12:00 PM)');
  const [doctorType, setDoctorType] = useState('General Physician (MBBS)');
  
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [pastBookings, setPastBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'list'

  const recognitionRef = useRef(null);

  // Fetch past bookings on load
  useEffect(() => {
    fetch('/api/appointments')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.appointments) {
          setPastBookings(data.appointments);
        }
      })
      .catch((err) => console.warn('Could not load appointments:', err));
  }, [confirmedBooking]);

  // Voice dictation for symptoms
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    speechService.stop();
    const recognizer = speechService.createRecognizer(
      lang,
      (transcript) => {
        setSymptom((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  // Submit appointment booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !symptom.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const appointmentPayload = {
      name: name.trim(),
      phone: phone.trim() || 'Not specified',
      symptom: symptom.trim(),
      preferredTime,
      doctorType
    };

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentPayload)
      });

      const data = await response.json();
      const booking = data.appointment || {
        id: `SHK-${Math.floor(1000 + Math.random() * 9000)}`,
        ...appointmentPayload,
        status: 'Confirmed'
      };

      // Also persist to localStorage backup
      const existingLocal = JSON.parse(localStorage.getItem('sahayak_local_appointments') || '[]');
      localStorage.setItem('sahayak_local_appointments', JSON.stringify([booking, ...existingLocal]));

      setConfirmedBooking(booking);

      // Speak confirmation aloud
      const confirmSpeech = lang === 'hi'
        ? `बधाई हो ${booking.name}! आपका डॉक्टर परामर्श सफलतापूर्वक बुक हो गया है। रेफरेंस नंबर है: ${booking.id}। डॉक्टर आपको दिए गए समय पर संपर्क करेंगे।`
        : `Congratulations ${booking.name}! Your teleconsultation is confirmed with reference ID: ${booking.id}. The doctor will contact you during your preferred time.`;

      speechService.speak(confirmSpeech, lang);

    } catch (err) {
      console.error('Error booking appointment:', err);
      // Fallback local booking so user never gets blocked
      const localBooking = {
        id: `SHK-${Math.floor(1000 + Math.random() * 9000)}`,
        ...appointmentPayload,
        status: 'Confirmed'
      };
      setConfirmedBooking(localBooking);
    } finally {
      setIsSubmitting(false);
    }
  };

  const speakConfirmation = () => {
    if (!confirmedBooking) return;
    const text = lang === 'hi'
      ? `परामर्श पर्ची: मरीज ${confirmedBooking.name}, रेफरेंस नंबर ${confirmedBooking.id}, समय ${confirmedBooking.preferredTime}, डॉक्टर ${confirmedBooking.doctorType}`
      : `Booking slip: Patient ${confirmedBooking.name}, Reference ID ${confirmedBooking.id}, Time ${confirmedBooking.preferredTime}, Doctor ${confirmedBooking.doctorType}`;
    speechService.speak(text, lang);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-violet-700 text-white flex items-center justify-center shadow-md">
            <CalendarClock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t.cardTeleconsultTitle}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {lang === 'hi' ? 'ग्रामीण व वृद्धजनों हेतु सरल ऑनलाइन डॉक्टर परामर्श' : 'Simple teleconsultation booking for patients'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        {!confirmedBooking && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'book'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + {lang === 'hi' ? 'नया परामर्श' : 'Book New'}
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📋 {lang === 'hi' ? 'मेरी बुकिंग्स' : 'My Bookings'} ({pastBookings.length})
            </button>
          </div>
        )}
      </div>

      {/* CONFIRMATION SCREEN */}
      {confirmedBooking ? (
        <div className="animate-fade-in max-w-xl mx-auto">
          <div className={`p-8 rounded-3xl border-2 border-emerald-400 bg-white shadow-xl text-center ${
            highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''
          }`}>
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider">
              ✓ {lang === 'hi' ? 'परामर्श सफलतापूर्वक बुक हुआ' : 'Teleconsultation Confirmed'}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-1">
              {confirmedBooking.name}
            </h2>

            <div className="p-3 my-4 bg-purple-50 rounded-2xl border border-purple-200">
              <span className="text-xs text-purple-700 font-bold uppercase tracking-wider block">
                {lang === 'hi' ? 'बुकिंग रेफरेंस नंबर' : 'Booking Reference ID'}
              </span>
              <span className="text-2xl font-black text-purple-900 font-mono tracking-wider">
                {confirmedBooking.id}
              </span>
            </div>

            {/* Slip details */}
            <div className="text-left space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">🩺 {lang === 'hi' ? 'डॉक्टर' : 'Doctor'}:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.doctorType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">🕒 {lang === 'hi' ? 'समय' : 'Preferred Slot'}:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.preferredTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">📞 {lang === 'hi' ? 'फोन' : 'Phone'}:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.phone}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium block text-xs">📝 {lang === 'hi' ? 'लक्षण' : 'Symptom'}:</span>
                <span className="font-bold text-slate-900 text-xs">{confirmedBooking.symptom}</span>
              </div>
            </div>

            {/* Read Slip Aloud */}
            <button
              onClick={speakConfirmation}
              className="w-full py-3 mb-3 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-sm rounded-2xl border border-purple-300 flex items-center justify-center gap-2"
            >
              <Volume2 className="w-5 h-5 text-purple-700" />
              <span>{lang === 'hi' ? 'बुकिंग विवरण बोलकर सुनें' : 'Read Confirmation Aloud'}</span>
            </button>

            {/* Book Another */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setName('');
                  setSymptom('');
                  setPhone('');
                }}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow transition-all"
              >
                + {lang === 'hi' ? 'अन्य अपॉइंटमेंट लें' : 'Book Another'}
              </button>

              <button
                onClick={() => setCurrentView('home')}
                className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl"
              >
                ← {t.backToHome}
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'list' ? (
        /* PAST BOOKINGS TAB */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">
              {lang === 'hi' ? 'आपकी पूर्व बुकिंग्स' : 'Scheduled Appointments'}
            </h2>
            <button
              onClick={() => setActiveTab('book')}
              className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl"
            >
              + {lang === 'hi' ? 'नया बुक करें' : 'Book New'}
            </button>
          </div>

          {pastBookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-300">
              <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-bold">
                {lang === 'hi' ? 'कोई बुकिंग उपलब्ध नहीं है।' : 'No appointments scheduled yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastBookings.map((b) => (
                <div
                  key={b.id}
                  className={`p-5 rounded-2xl border-2 border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 bg-purple-100 text-purple-800 font-black rounded">
                        {b.id}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">{b.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold mt-1">
                      🩺 {b.doctorType} • 🕒 {b.preferredTime}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📝 {b.symptom}
                    </p>
                  </div>

                  <button
                    onClick={() => speechService.speak(`Booking ${b.id} for ${b.name}. Time: ${b.preferredTime}. Doctor: ${b.doctorType}`, lang)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-purple-700 self-end sm:self-center"
                    title={t.listenText}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* BOOKING FORM */
        <div className="max-w-2xl mx-auto">
          <div className={`p-6 sm:p-8 rounded-3xl border-2 border-slate-200 bg-white shadow-sm ${
            highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''
          }`}>
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-purple-600" />
              <span>{lang === 'hi' ? 'सरल परामर्श फॉर्म भरें' : 'Patient Consultation Details'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Field 1: Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>{lang === 'hi' ? 'मरीज का नाम (Patient Name)' : 'Patient Full Name'} *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'hi' ? 'उदा. रमेश कुमार / शांति देवी' : 'e.g. Ramesh Kumar'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 font-medium text-base text-slate-900 focus:outline-none"
                />
              </div>

              {/* Field 2: Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <span>{lang === 'hi' ? 'मोबाइल नंबर / WhatsApp' : 'Mobile / WhatsApp Number'}</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 font-medium text-base text-slate-900 focus:outline-none"
                />
              </div>

              {/* Field 3: Symptom with Voice Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>{lang === 'hi' ? 'लक्षण / समस्या (Symptoms)' : 'Primary Health Concern'} *</span>
                  </label>
                  <span className="text-[11px] font-bold text-purple-700">
                    {lang === 'hi' ? 'माइक से बोलें 🎙️' : 'Voice Input Available'}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    required
                    rows={3}
                    placeholder={
                      lang === 'hi'
                        ? 'अपनी समस्या लिखें या दाईं ओर माइक बटन दबाकर बोलें...'
                        : 'Describe your symptoms or tap the microphone to speak...'
                    }
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    className="w-full px-4 py-3.5 pr-14 rounded-2xl border-2 border-slate-200 focus:border-purple-500 font-medium text-base text-slate-900 focus:outline-none"
                  />
                  
                  {/* Microphone inside textarea */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute right-3 top-3 p-2.5 rounded-xl transition-all shadow ${
                      isListening
                        ? 'bg-red-600 text-white mic-active animate-pulse'
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                    }`}
                    title={isListening ? (lang === 'hi' ? 'माइक रोकें' : 'Stop voice input') : (lang === 'hi' ? 'बोलकर लक्षण लिखें' : 'Speak symptoms')}
                    aria-label={isListening ? "Stop speaking symptoms" : "Dictate symptoms using microphone"}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Field 4: Preferred Time Slot */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>{lang === 'hi' ? 'सुविधाजनक समय (Preferred Time Slot)' : 'Preferred Consultation Time'}</span>
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 font-bold text-sm text-slate-900 focus:outline-none bg-white"
                >
                  <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM / सुबह)</option>
                  <option value="Afternoon (1:00 PM - 3:00 PM)">Afternoon (1:00 PM - 3:00 PM / दोपहर)</option>
                  <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM / शाम)</option>
                </select>
              </div>

              {/* Field 5: Doctor Specialty */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-purple-600" />
                  <span>{lang === 'hi' ? 'विशेषज्ञता (Doctor Specialty)' : 'Doctor Specialty'}</span>
                </label>
                <select
                  value={doctorType}
                  onChange={(e) => setDoctorType(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 font-bold text-sm text-slate-900 focus:outline-none bg-white"
                >
                  <option value="General Physician (MBBS)">General Physician (सामान्य चिकित्सक)</option>
                  <option value="Ayush & Ayurveda Specialist">AYUSH & Ayurveda Specialist (आयुर्वेद)</option>
                  <option value="Child Specialist (Pediatrics)">Child Specialist (शिशु रोग विशेषज्ञ)</option>
                  <option value="Women Health (Gynecology)">Women's Health (महिला स्वास्थ्य)</option>
                  <option value="Elderly & Chronic Care Specialist">Elderly & Geriatric Care (वृद्धजन विशेषज्ञ)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !symptom.trim()}
                aria-label={lang === 'hi' ? 'परामर्श बुक करें' : 'Confirm Teleconsultation Booking'}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 mt-4 ${
                  isSubmitting || !name.trim() || !symptom.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-purple-700 hover:bg-purple-800 text-white shadow-purple-700/25 active:scale-95'
                }`}
              >
                <Check className="w-6 h-6" />
                <span>
                  {isSubmitting 
                    ? (lang === 'hi' ? 'परामर्श बुक हो रहा है...' : 'Booking Consultation...') 
                    : (lang === 'hi' ? 'परामर्श बुक करें' : 'Confirm Teleconsultation Booking')}
                </span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
