import React from 'react';
import { 
  MessageSquareHeart, 
  Pill, 
  Building2, 
  AlertOctagon, 
  CalendarClock, 
  Volume2, 
  PhoneCall, 
  ShieldCheck, 
  Mic
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export default function HomePage({ setCurrentView, lang, t }) {
  const { simpleMode, highContrast } = useAccessibility();

  const speakCard = (e, text) => {
    e.stopPropagation(); // Don't trigger card navigation when clicking audio button
    speechService.speak(text, lang);
  };

  const handleCardClick = (view, title) => {
    speechService.speak(title, lang);
    setCurrentView(view);
  };

  const cards = [
    {
      id: 'chat',
      title: t.cardAssistantTitle,
      desc: t.cardAssistantDesc,
      badge: t.cardAssistantHindiBadge,
      icon: MessageSquareHeart,
      bgGradient: 'from-emerald-500 to-teal-700',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/20',
      actionPrompt: lang === 'hi' ? 'लक्षण बताएं' : 'Check Symptoms'
    },
    {
      id: 'medicine',
      title: t.cardReminderTitle,
      desc: t.cardReminderDesc,
      badge: t.cardReminderHindiBadge,
      icon: Pill,
      bgGradient: 'from-blue-600 to-indigo-700',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      borderHover: 'hover:border-blue-500 hover:shadow-blue-500/20',
      actionPrompt: lang === 'hi' ? 'दवा सेट करें' : 'Set Alarm'
    },
    {
      id: 'hospital',
      title: t.cardHospitalTitle,
      desc: t.cardHospitalDesc,
      badge: t.cardHospitalHindiBadge,
      icon: Building2,
      bgGradient: 'from-sky-600 to-cyan-700',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
      borderHover: 'hover:border-sky-500 hover:shadow-sky-500/20',
      actionPrompt: lang === 'hi' ? 'अस्पताल सूची' : 'View Clinics'
    },
    {
      id: 'sos',
      title: t.cardSosTitle,
      desc: t.cardSosDesc,
      badge: t.cardSosHindiBadge,
      icon: AlertOctagon,
      bgGradient: 'from-red-600 to-rose-800',
      badgeBg: 'bg-red-100 text-red-800 border-red-300',
      borderHover: 'hover:border-red-500 hover:shadow-red-500/20',
      actionPrompt: lang === 'hi' ? 'आपातकालीन कॉल' : 'Emergency Help',
      isSos: true
    },
    {
      id: 'teleconsult',
      title: t.cardTeleconsultTitle,
      desc: t.cardTeleconsultDesc,
      badge: t.cardTeleconsultHindiBadge,
      icon: CalendarClock,
      bgGradient: 'from-purple-600 to-violet-800',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
      borderHover: 'hover:border-purple-500 hover:shadow-purple-500/20',
      actionPrompt: lang === 'hi' ? 'अपॉइंटमेंट लें' : 'Book Now'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Hero Greeting Section */}
      <section className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Ayushman Bharat & Digital India Healthcare Vision</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
          {t.greeting}
        </h1>
        
        <p className="text-base sm:text-lg text-slate-600 font-medium mb-6">
          {t.greetingSub}
        </p>

        {/* Quick Voice Assistant Banner */}
        <div 
          onClick={() => handleCardClick('chat', t.cardAssistantTitle)}
          className="cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 sm:p-5 rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-between gap-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Mic className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <p className="font-extrabold text-lg sm:text-xl">
                {lang === 'hi' ? 'बोलकर समस्या बताएं (आवाज सहायक)' : 'Tap here to Speak your health question'}
              </p>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                {lang === 'hi' ? 'हिंदी और अंग्रेजी दोनों में समझता है' : 'Understands English & Hindi • Voice answers aloud'}
              </p>
            </div>
          </div>
          <button 
            className="px-4 py-2 bg-white text-emerald-800 font-extrabold rounded-xl text-sm shrink-0 shadow hover:bg-emerald-50"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick('chat', t.cardAssistantTitle);
            }}
          >
            {t.callNow} 🎙️
          </button>
        </div>
      </section>

      {/* Main 5 Large Feature Cards Grid */}
      <section className={
        simpleMode 
          ? "grid grid-cols-1 gap-6 max-w-2xl mx-auto mb-12" 
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
      }>
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id, card.title)}
              className={`group relative bg-white rounded-3xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl ${
                simpleMode ? 'p-8 border-4 border-slate-300' : 'p-6 sm:p-7 border-2 border-slate-200'
              } ${card.borderHover} ${
                card.isSos ? 'ring-2 ring-red-400 bg-red-50/30' : ''
              } ${highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={card.title}
            >
              {/* Card Top Row: Icon + Badge + Audio Button */}
              <div className="flex items-start justify-between mb-5">
                <div className={`${simpleMode ? 'w-20 h-20' : 'w-16 h-16'} rounded-2xl bg-gradient-to-tr ${card.bgGradient} text-white flex items-center justify-center shadow-md`}>
                  <IconComponent className={simpleMode ? "w-12 h-12" : "w-9 h-9"} />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${card.badgeBg}`}>
                    {card.badge}
                  </span>
                  
                  {/* Speaker Button for low-literacy users */}
                  <button
                    onClick={(e) => speakCard(e, `${card.title}. ${card.desc}`)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title={t.listenText}
                    aria-label={`Listen to ${card.title} description`}
                  >
                    <Volume2 className="w-5 h-5 text-emerald-600" />
                  </button>
                </div>
              </div>

              {/* Card Title & Description */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {card.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-6">
                {card.desc}
              </p>

              {/* Bottom Touch Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-sm font-extrabold flex items-center gap-1.5 ${
                  card.isSos ? 'text-red-700' : 'text-emerald-700'
                }`}>
                  {card.actionPrompt} →
                </span>
                <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                  {lang === 'hi' ? 'टैप करें' : 'Tap to open'}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Emergency Quick Helpline Strip */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider mb-1">
              <AlertOctagon className="w-4 h-4" />
              <span>{t.quickHelpTitle}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              {lang === 'hi' ? 'तत्काल आपातकालीन सेवाएं (24x7 निःशुल्क)' : 'Instant Emergency Numbers (24x7 Toll-Free)'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="tel:112"
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black transition-all shadow-md active:scale-95"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5" />
                <span>112</span>
              </div>
              <span className="text-xs bg-red-800/80 px-2 py-0.5 rounded font-bold">{t.emergencyLabel}</span>
            </a>

            <a
              href="tel:108"
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black transition-all shadow-md active:scale-95"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5" />
                <span>108</span>
              </div>
              <span className="text-xs bg-rose-800/80 px-2 py-0.5 rounded font-bold">{t.ambulanceLabel}</span>
            </a>

            <a
              href="tel:102"
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black transition-all border border-slate-700 active:scale-95"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5" />
                <span>102</span>
              </div>
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded font-bold">{t.maternalLabel}</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
