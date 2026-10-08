import React from 'react';
import { HeartPulse, Globe, AlertCircle, Home, Volume2 } from 'lucide-react';
import { speechService } from '../services/speechService';

export default function Navbar({ currentView, setCurrentView, lang, setLang, t }) {
  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    speechService.speak(nextLang === 'hi' ? 'भाषा हिंदी में बदली गई' : 'Language changed to English', nextLang);
  };

  const handleSpeakNav = () => {
    speechService.speak(`${t.appName}. ${t.appTagline}`, lang);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('home')}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <HeartPulse className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900">
                {t.appName}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                AI + Voice
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Read Header Aloud (Accessibility) */}
          <button
            onClick={handleSpeakNav}
            title={t.listenText}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all flex items-center gap-1.5 text-sm font-semibold"
            aria-label="Listen to page header"
          >
            <Volume2 className="w-5 h-5 text-emerald-600" />
            <span className="hidden md:inline">{t.listenText}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-3.5 py-2.5 rounded-xl border-2 border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-all flex items-center gap-2 font-bold text-sm shadow-sm"
            aria-label="Toggle language between English and Hindi"
          >
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>{t.navLanguage}</span>
          </button>

          {/* Quick SOS Top Button */}
          <button
            onClick={() => setCurrentView('sos')}
            className={`px-3.5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-sm ${
              currentView === 'sos'
                ? 'bg-red-700 text-white ring-2 ring-red-400'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30'
            }`}
            aria-label="Emergency SOS Quick Action"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-extrabold tracking-wide">SOS</span>
          </button>

          {/* Home button when away from home */}
          {currentView !== 'home' && (
            <button
              onClick={() => setCurrentView('home')}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all flex items-center gap-1.5 text-sm"
              aria-label="Return to home screen"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">{t.navHome}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
