import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AccessibilityBar from './components/AccessibilityBar';
import HomePage from './pages/HomePage';
import ChatbotPage from './pages/ChatbotPage';
import MedicineReminderPage from './pages/MedicineReminderPage';
import HospitalFinderPage from './pages/HospitalFinderPage';
import EmergencySOSPage from './pages/EmergencySOSPage';
import TeleconsultationPage from './pages/TeleconsultationPage';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { translations } from './utils/translations';

function MainLayout() {
  const [currentView, setCurrentView] = useState('home');
  const [lang, setLang] = useState('en');

  const t = translations[lang] || translations.en;

  return (
    <AccessibilityProvider lang={lang}>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
        
        {/* Top Accessibility Toolbar */}
        <AccessibilityBar lang={lang} t={t} />

        {/* Main Navbar */}
        <Navbar 
          currentView={currentView}
          setCurrentView={setCurrentView}
          lang={lang}
          setLang={setLang}
          t={t}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {currentView === 'home' && (
            <HomePage 
              setCurrentView={setCurrentView}
              lang={lang}
              t={t}
            />
          )}

          {currentView === 'chat' && (
            <ChatbotPage 
              setCurrentView={setCurrentView}
              lang={lang}
              setLang={setLang}
              t={t}
            />
          )}

          {currentView === 'medicine' && (
            <MedicineReminderPage 
              setCurrentView={setCurrentView}
              lang={lang}
              t={t}
            />
          )}

          {currentView === 'hospital' && (
            <HospitalFinderPage 
              setCurrentView={setCurrentView}
              lang={lang}
              t={t}
            />
          )}

          {currentView === 'sos' && (
            <EmergencySOSPage 
              setCurrentView={setCurrentView}
              lang={lang}
              t={t}
            />
          )}

          {currentView === 'teleconsult' && (
            <TeleconsultationPage 
              setCurrentView={setCurrentView}
              lang={lang}
              t={t}
            />
          )}
        </main>

        {/* Accessible Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-medium">
          <p>SahayakAI (सहायक AI) • Empowering 1.4 Billion Citizens with Accessible Digital Health</p>
        </footer>
      </div>
    </AccessibilityProvider>
  );
}

export default function App() {
  return <MainLayout />;
}
