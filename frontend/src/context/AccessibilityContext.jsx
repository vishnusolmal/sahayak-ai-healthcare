import React, { createContext, useContext, useState, useEffect } from 'react';
import { speechService } from '../services/speechService';

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children, lang = 'en' }) {
  // 1. High-contrast mode state (Yellow on Black)
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('sahayak_high_contrast') === 'true';
  });

  // 2. Font size scaling: 'normal' | 'large' | 'xlarge'
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('sahayak_text_size') || 'normal';
  });

  // 3. Simple UI mode (ultra-minimal single-column list with gigantic icons)
  const [simpleMode, setSimpleMode] = useState(() => {
    return localStorage.getItem('sahayak_simple_mode') === 'true';
  });

  // Apply high contrast class to html and body
  useEffect(() => {
    localStorage.setItem('sahayak_high_contrast', highContrast);
    if (highContrast) {
      document.documentElement.classList.add('high-contrast-mode');
      document.body.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
      document.body.classList.remove('high-contrast-mode');
    }
  }, [highContrast]);

  // Apply text size class to html and body so all rem units scale
  useEffect(() => {
    localStorage.setItem('sahayak_text_size', textSize);
    const classes = ['text-scale-normal', 'text-scale-large', 'text-scale-xlarge'];
    document.documentElement.classList.remove(...classes);
    document.body.classList.remove(...classes);
    document.documentElement.classList.add(`text-scale-${textSize}`);
    document.body.classList.add(`text-scale-${textSize}`);
  }, [textSize]);

  // Apply simple mode to storage
  useEffect(() => {
    localStorage.setItem('sahayak_simple_mode', simpleMode);
  }, [simpleMode]);

  const toggleHighContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    const msg = nextVal 
      ? (lang === 'hi' ? 'उच्च कंट्रास्ट मोड चालू किया गया' : 'High contrast mode turned on')
      : (lang === 'hi' ? 'सामान्य कंट्रास्ट मोड बहाल' : 'Standard contrast restored');
    speechService.speak(msg, lang);
  };

  const cycleTextSize = () => {
    let nextSize = 'normal';
    if (textSize === 'normal') nextSize = 'large';
    else if (textSize === 'large') nextSize = 'xlarge';
    else nextSize = 'normal';

    setTextSize(nextSize);
    const sizeName = nextSize === 'xlarge' 
      ? (lang === 'hi' ? 'अति विशाल' : 'Extra Large') 
      : nextSize === 'large' 
        ? (lang === 'hi' ? 'बड़ा' : 'Large') 
        : (lang === 'hi' ? 'सामान्य' : 'Normal');

    const msg = lang === 'hi' 
      ? `अक्षर का आकार ${sizeName} किया गया` 
      : `Text size set to ${sizeName}`;
    speechService.speak(msg, lang);
  };

  const toggleSimpleMode = () => {
    const nextVal = !simpleMode;
    setSimpleMode(nextVal);
    const msg = nextVal 
      ? (lang === 'hi' ? 'सरल मोड सक्रिय' : 'Simple easy UI enabled')
      : (lang === 'hi' ? 'मानक मोड सक्रिय' : 'Standard UI enabled');
    speechService.speak(msg, lang);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        textSize,
        cycleTextSize,
        simpleMode,
        toggleSimpleMode,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
