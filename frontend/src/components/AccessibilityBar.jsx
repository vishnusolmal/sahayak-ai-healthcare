import React from 'react';
import { Eye, Type, LayoutList, Volume2, Check } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { speechService } from '../services/speechService';

export default function AccessibilityBar({ lang, t }) {
  const {
    highContrast,
    toggleHighContrast,
    textSize,
    cycleTextSize,
    simpleMode,
    toggleSimpleMode
  } = useAccessibility();

  const speakInfo = () => {
    const text = lang === 'hi'
      ? 'सुलभता पट्टी: उच्च कंट्रास्ट, बड़े अक्षर और सरल दृश्य के विकल्प यहां उपलब्ध हैं।'
      : 'Accessibility toolbar: options for High Contrast, Large Text, and Simple Easy Mode.';
    speechService.speak(text, lang);
  };

  const getTextSizeLabel = () => {
    if (textSize === 'xlarge') return t.textSizeXLarge;
    if (textSize === 'large') return t.textSizeLarge;
    return t.textSizeNormal;
  };

  return (
    <aside 
      aria-label="Accessibility settings toolbar"
      className="bg-amber-50/90 border-b border-amber-200 py-2.5 px-4 sm:px-6 transition-colors shadow-inner"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
        
        {/* Left Label with Help Voice */}
        <div className="flex items-center gap-2 text-amber-950 font-bold">
          <button
            onClick={speakInfo}
            className="p-1 rounded-md hover:bg-amber-200 transition-colors"
            title="Read toolbar info"
            aria-label="Read toolbar info aloud"
          >
            <Volume2 className="w-4 h-4 text-amber-800" />
          </button>
          <span className="tracking-wide uppercase text-[11px] sm:text-xs">
            ♿ {t.a11yBarTitle}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* 1. High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
            aria-label={highContrast ? "Turn off high contrast mode" : "Turn on high contrast mode (yellow on black)"}
            title={highContrast ? "Disable high contrast" : "Enable high contrast for low vision"}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all font-bold ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-300 shadow-sm ring-2 ring-yellow-400'
                : 'bg-white text-slate-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <Eye className="w-4 h-4 text-amber-700" />
            <span>{highContrast ? t.highContrastOn : t.highContrastBtn}</span>
            {highContrast && <Check className="w-3.5 h-3.5 text-yellow-300" />}
          </button>

          {/* 2. Text Size Toggle */}
          <button
            onClick={cycleTextSize}
            aria-label={`Cycle font size. Current setting is ${getTextSizeLabel()}`}
            title="Increase font size for easier reading"
            className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-slate-800 flex items-center gap-1.5 transition-all font-bold shadow-sm"
          >
            <Type className="w-4 h-4 text-emerald-700" />
            <span>{t.textSizeBtn}: <strong className="text-emerald-800">{getTextSizeLabel()}</strong></span>
          </button>

          {/* 3. Simple Easy UI Toggle */}
          <button
            onClick={toggleSimpleMode}
            aria-pressed={simpleMode}
            aria-label={simpleMode ? "Switch back to standard view" : "Switch to simplified large button view"}
            title="Simplified uncluttered view for low literacy and elderly users"
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all font-bold ${
              simpleMode
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-400'
                : 'bg-white text-slate-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span>{simpleMode ? t.simpleModeOn : t.simpleModeBtn}</span>
            {simpleMode && <Check className="w-3.5 h-3.5" />}
          </button>

        </div>
      </div>
    </aside>
  );
}
