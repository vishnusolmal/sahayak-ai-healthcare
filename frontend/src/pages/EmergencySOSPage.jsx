import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Building2, 
  UserCheck, 
  Radio, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export default function EmergencySOSPage({ setCurrentView, lang, t }) {
  const { highContrast, simpleMode } = useAccessibility();

  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [familyNumber, setFamilyNumber] = useState(() => {
    return localStorage.getItem('sahayak_family_sos_contact') || '+91 9876543210';
  });
  const [editingFamily, setEditingFamily] = useState(false);
  const [tempNumber, setTempNumber] = useState(familyNumber);

  // Synthesize an emergency siren tone using Web Audio API
  useEffect(() => {
    let intervalId;
    let audioCtx;

    if (isAlarmActive) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let highTone = true;

        intervalId = setInterval(() => {
          if (!audioCtx) return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(highTone ? 960 : 770, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
          highTone = !highTone;
        }, 400);

      } catch (e) {
        console.warn('Audio siren error:', e);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioCtx) audioCtx.close().catch(() => {});
    };
  }, [isAlarmActive]);

  const handleTriggerSOS = () => {
    const nextState = !isAlarmActive;
    setIsAlarmActive(nextState);

    if (nextState) {
      const emergencyAnnouncement = lang === 'hi'
        ? "आपातकालीन चेतावनी सक्रिय! राष्ट्रीय आपातकाल 112, एम्बुलेंस 108 और आपके परिवार के संपर्क नीचे तैयार हैं। तुरंत कॉल करें।"
        : "Emergency alert triggered! National emergency 112, Ambulance 108, and your family emergency contact are ready below. Call immediately.";
      speechService.speak(emergencyAnnouncement, lang);
    } else {
      speechService.stop();
    }
  };

  const handleSaveFamily = (e) => {
    e.preventDefault();
    setFamilyNumber(tempNumber);
    localStorage.setItem('sahayak_family_sos_contact', tempNumber);
    setEditingFamily(false);
    speechService.speak(lang === 'hi' ? 'आपातकालीन संपर्क सुरक्षित किया गया' : 'Emergency family contact saved', lang);
  };

  const speakEmergencyNumbers = () => {
    const text = lang === 'hi'
      ? 'आपातकालीन नंबर: राष्ट्रीय सहायता 112, एम्बुलेंस 108, जननी सुरक्षा 102।'
      : 'Emergency numbers: National SOS 112, Ambulance 108, Mother and child helpline 102.';
    speechService.speak(text, lang);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Alert Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-extrabold text-xs sm:text-sm uppercase tracking-wider mb-3">
          <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
          <span>{lang === 'hi' ? 'तत्काल आपातकालीन सहायता' : 'Emergency Rapid Response'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
          {t.cardSosTitle}
        </h1>
        <p className="text-base text-slate-600 font-medium max-w-xl mx-auto">
          {lang === 'hi' 
            ? 'किसी भी चिकित्सकीय आपातकाल में नीचे दिए गए बड़े लाल बटन को दबाएं या सीधे नंबर पर कॉल करें।' 
            : 'In any medical emergency, tap the large red SOS button or call the helplines directly below.'}
        </p>
      </div>

      {/* ONE BIG RED SOS BUTTON */}
      <div className="flex flex-col items-center justify-center my-8">
        <button
          onClick={handleTriggerSOS}
          aria-label={
            isAlarmActive 
              ? (lang === 'hi' ? 'आपातकालीन अलार्म बंद करें' : 'Stop emergency siren alarm') 
              : (lang === 'hi' ? 'आपातकालीन अलार्म बजाएं (SOS)' : 'Activate emergency SOS siren alarm')
          }
          title={
            isAlarmActive 
              ? (lang === 'hi' ? 'अलार्म बंद करें' : 'Stop alarm sound') 
              : (lang === 'hi' ? 'आपातकालीन सायरन बजाएं' : 'Play emergency siren sound')
          }
          className={`relative group w-48 h-48 sm:w-60 sm:h-60 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${
            isAlarmActive
              ? 'bg-red-600 text-white ring-8 ring-red-400 animate-bounce'
              : 'bg-gradient-to-b from-red-600 to-rose-800 hover:from-red-700 hover:to-rose-900 text-white ring-8 ring-red-100 shadow-red-600/50'
          }`}
        >
          {/* Animated pulse rings */}
          <span className="absolute -inset-3 rounded-full bg-red-500/30 animate-ping -z-10" />
          <AlertOctagon className="w-16 h-16 sm:w-20 sm:h-20 mb-2 text-white animate-pulse" />
          <span className="text-2xl sm:text-3xl font-black tracking-widest uppercase">
            {isAlarmActive ? (lang === 'hi' ? 'अलार्म बंद' : 'STOP ALARM') : 'SOS'}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider opacity-90 mt-1">
            {lang === 'hi' ? 'आपातकालीन अलार्म' : 'Emergency Alarm'}
          </span>
        </button>

        {isAlarmActive && (
          <div className="mt-4 px-6 py-3 rounded-2xl bg-red-600 text-white font-black text-sm flex items-center gap-2 animate-pulse shadow-lg">
            <Radio className="w-5 h-5 animate-spin" />
            <span>
              {lang === 'hi' ? '🚨 अलार्म सक्रिय है! नीचे दिए गए नंबर पर तुरंत कॉल करें!' : '🚨 SOS ALARM ACTIVE! Call the responders below!'}
            </span>
          </div>
        )}
      </div>

      {/* Primary Emergency Contact Numbers Grid */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-600" />
            <span>{lang === 'hi' ? 'सीधे आपातकालीन कॉल नंबर' : 'Direct Emergency Helplines'}</span>
          </h2>
          <button
            onClick={speakEmergencyNumbers}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
            title={t.listenText}
          >
            <Volume2 className="w-4 h-4 text-red-600" />
            <span>{t.listenText}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 112 - National All-In-One */}
          <a
            href="tel:112"
            className={`p-6 rounded-3xl border-2 border-red-500 bg-red-50/50 hover:bg-red-100 transition-all flex items-center justify-between gap-4 shadow-sm group active:scale-95 ${
              highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''
            }`}
          >
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-700">
                {lang === 'hi' ? 'राष्ट्रीय आपातकाल (अखिल भारतीय)' : 'National Emergency (All-In-One)'}
              </span>
              <p className="text-3xl font-black text-slate-900 mt-1">
                112
              </p>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                {lang === 'hi' ? 'पुलिस, मेडिकल, फायर 24x7 निःशुल्क' : 'Police, Medical, Fire • 24x7 Free'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <PhoneCall className="w-7 h-7 animate-bounce" />
            </div>
          </a>

          {/* 108 - Medical Ambulance */}
          <a
            href="tel:108"
            className={`p-6 rounded-3xl border-2 border-rose-500 bg-rose-50/50 hover:bg-rose-100 transition-all flex items-center justify-between gap-4 shadow-sm group active:scale-95 ${
              highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''
            }`}
          >
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
                {lang === 'hi' ? 'एम्बुलेंस एवं आपात चिकित्सा' : 'Free Ambulance Service'}
              </span>
              <p className="text-3xl font-black text-slate-900 mt-1">
                108
              </p>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                {lang === 'hi' ? 'गंभीर मरीज व दुर्घटना राहत 24x7' : 'Trauma & Emergency Patient Transport'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <PhoneCall className="w-7 h-7 animate-bounce" />
            </div>
          </a>

          {/* 102 - Maternal & Child Transport */}
          <a
            href="tel:102"
            className={`p-6 rounded-3xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-4 shadow-sm group active:scale-95 ${
              highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''
            }`}
          >
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                {lang === 'hi' ? 'जननी शिशु सुरक्षा' : 'Mother & Child Care (JSSK)'}
              </span>
              <p className="text-3xl font-black text-slate-900 mt-1">
                102
              </p>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                {lang === 'hi' ? 'गर्भवती महिलाओं व नवजात शिशुओं हेतु' : 'Pregnant Women & Infant Transport'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <PhoneCall className="w-7 h-7" />
            </div>
          </a>

          {/* Family / Caregiver Contact */}
          <div className={`p-6 rounded-3xl border-2 border-emerald-300 bg-emerald-50/50 flex flex-col justify-between gap-3 shadow-sm ${
            highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                {lang === 'hi' ? 'परिवार / देखभालकर्ता (Caregiver)' : 'Family / Caregiver Contact'}
              </span>
              <button
                onClick={() => setEditingFamily(!editingFamily)}
                className="text-xs font-bold text-emerald-700 underline"
              >
                {editingFamily ? (lang === 'hi' ? 'रद्द' : 'Cancel') : (lang === 'hi' ? 'बदलें' : 'Edit')}
              </button>
            </div>

            {editingFamily ? (
              <form onSubmit={handleSaveFamily} className="flex gap-2 mt-1">
                <input
                  type="tel"
                  value={tempNumber}
                  onChange={(e) => setTempNumber(e.target.value)}
                  placeholder="+91..."
                  className="px-3 py-2 rounded-xl border border-emerald-400 text-slate-900 text-sm font-bold flex-1"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900">
                    {familyNumber}
                  </p>
                  <p className="text-xs text-slate-600 font-semibold">
                    {lang === 'hi' ? 'आपका व्यक्तिगत आपातकालीन नंबर' : 'Your saved emergency caregiver'}
                  </p>
                </div>
                <a
                  href={`tel:${familyNumber.replace(/\s+/g, '')}`}
                  className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow hover:bg-emerald-700"
                >
                  <PhoneCall className="w-6 h-6" />
                </a>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Nearest Hospital Highlight Card */}
      <div className={`p-6 sm:p-7 rounded-3xl border-2 border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
        highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''
      }`}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-800">
                {lang === 'hi' ? 'निकटतम ट्रॉमा अस्पताल' : 'Nearest Trauma Hospital'}
              </span>
              <span className="text-xs font-bold text-slate-500">📍 1.2 km</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              {lang === 'hi' ? 'जिला नागरिक आपातकालीन अस्पताल' : 'District Civil Emergency Hospital'}
            </h3>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              24x7 ICU, Trauma & Critical Care Unit • Govt PMJAY
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:+911126588500"
            className="px-6 py-4 bg-sky-700 hover:bg-sky-800 text-white font-black text-base rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
          >
            <PhoneCall className="w-5 h-5" />
            <span>{lang === 'hi' ? 'अस्पताल को कॉल करें' : 'Call Hospital'}</span>
          </a>
        </div>
      </div>

    </div>
  );
}
