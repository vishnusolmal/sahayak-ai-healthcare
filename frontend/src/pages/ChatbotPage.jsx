import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  RotateCcw, 
  ShieldAlert,
  Loader2,
  Sparkles,
  PhoneCall,
  Globe,
  Radio
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export default function ChatbotPage({ setCurrentView, lang, setLang, t }) {
  const { highContrast, simpleMode } = useAccessibility();
  
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeechEnabled, setAutoSpeechEnabled] = useState(true);
  const [speechError, setSpeechError] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Switch language directly from the chatbot
  const handleLanguageChange = (newLang) => {
    if (newLang === lang) return;
    if (setLang) setLang(newLang);
    speechService.stop();
    setIsSpeaking(false);
    const audioConfirm = newLang === 'hi' 
      ? 'भाषा हिंदी में बदली गई। बोलकर या लिखकर लक्षण बताएं।' 
      : 'Language changed to English. Speak or type your symptoms.';
    speechService.speak(audioConfirm, newLang);
  };

  // Set welcome message on load or language switch
  useEffect(() => {
    const welcomeMsg = {
      id: 1,
      sender: 'assistant',
      text: lang === 'hi' 
        ? "नमस्ते! मैं आपका सहायक AI स्वास्थ्य साथी हूँ। कृपया अपने लक्षण बताएं। आप नीचे माइक बटन दबाकर हिंदी में बोल भी सकते हैं।"
        : "Namaste! I am your Sahayak AI health companion. Please describe your symptoms. You can also tap the microphone button below to speak.",
      urgency: 'Low',
      disclaimer: lang === 'hi' 
        ? "यह केवल सामान्य मार्गदर्शन है, वास्तविक डॉक्टर की जांच का विकल्प नहीं।"
        : "For educational guidance only. Not a substitute for a licensed medical professional.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMsg]);
  }, [lang]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechService.stop();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Web Speech API Voice Recognition (Microphone Speech-to-Text)
  const toggleListening = () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Stop ongoing speech before listening
    speechService.stop();
    setIsSpeaking(false);

    if (!speechService.isRecSupported()) {
      setSpeechError(
        lang === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान (Web Speech API) उपलब्ध नहीं है। कृपया Google Chrome या Edge का उपयोग करें।'
          : 'Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    const recognizer = speechService.createRecognizer(
      lang,
      (transcript) => {
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      },
      (error) => {
        console.warn('Speech recognition status:', error);
        if (error === 'not-allowed') {
          setSpeechError(
            lang === 'hi'
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।'
              : 'Microphone permission blocked. Please enable microphone access in your browser settings.'
          );
        } else if (error === 'no-speech') {
          setSpeechError(
            lang === 'hi' ? 'कोई आवाज़ सुनाई नहीं दी। कृपया पुनः बोलें।' : 'No speech detected. Please tap mic and speak again.'
          );
        }
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (err) {
        console.error('Could not start recognition:', err);
        setIsListening(false);
      }
    }
  };

  // Play text aloud using Web Speech API SpeechSynthesis
  const speakResponse = (text) => {
    speechService.stop();
    setIsSpeaking(true);
    speechService.speak(
      text,
      lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const stopSpeaking = () => {
    speechService.stop();
    setIsSpeaking(false);
  };

  // Submit symptoms to backend Gemini API
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSpeechError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query.trim(), lang })
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: data.guidance,
        urgency: data.urgency || 'Low',
        suggestedAction: data.suggestedAction || '',
        disclaimer: data.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);

      // AUTOMATIC TEXT-TO-SPEECH PLAYBACK OF AI'S RESPONSE
      if (autoSpeechEnabled) {
        const speechPayload = `${data.guidance}. ${
          lang === 'hi' ? 'खतरे का स्तर' : 'Urgency level'
        }: ${data.urgency}. ${data.suggestedAction || ''}`;
        speakResponse(speechPayload);
      }

    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: lang === 'hi'
          ? "माफ़ कीजिए, सर्वर से जुड़ने में समस्या आई। यदि स्थिति गंभीर है तो तुरंत 108 या 112 पर कॉल करें।"
          : "Sorry, there was a connection issue. If this is serious, please call 108 or 112 immediately.",
        urgency: 'Medium',
        disclaimer: "Emergency helplines: 112, 108",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-tap symptom chips
  const quickSymptomChips = lang === 'hi' ? [
    "मुझे 2 दिन से तेज बुखार है",
    "छाती में भारीपन और सांस लेने में कठिनाई",
    "पेट में दर्द और उल्टी",
    "हल्की खांसी और जुकाम"
  ] : [
    "High fever and chills for 2 days",
    "Chest heaviness and trouble breathing",
    "Stomach pain and nausea",
    "Mild cough and sore throat"
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Top Header & Bilingual Segmented Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 shrink-0">
        
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.cardAssistantTitle}
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {lang === 'hi' ? 'वाक् एवं पाठ स्वास्थ्य सहायता (Web Speech API)' : 'Voice & Text Health Triage (Web Speech API)'}
            </p>
          </div>
        </div>

        {/* Controls: Bilingual Toggle & Audio Options */}
        <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
          
          {/* Dedicated Bilingual Language Segmented Control */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                lang === 'en'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Set language to English"
            >
              <span>🇬🇧 English</span>
            </button>
            <button
              onClick={() => handleLanguageChange('hi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                lang === 'hi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Set language to Hindi"
            >
              <span>🇮🇳 हिंदी</span>
            </button>
          </div>

          {/* Auto Text-To-Speech Toggle Button */}
          <button
            onClick={() => {
              const nextState = !autoSpeechEnabled;
              setAutoSpeechEnabled(nextState);
              if (!nextState) stopSpeaking();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              autoSpeechEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Toggle automatic text-to-speech readout"
          >
            {autoSpeechEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">
              {lang === 'hi' ? (autoSpeechEnabled ? 'बोलकर उत्तर: चालू' : 'बोलकर उत्तर: बंद') : (autoSpeechEnabled ? 'Auto-TTS: ON' : 'Auto-TTS: OFF')}
            </span>
          </button>

          {/* Clear conversation button */}
          <button
            onClick={() => {
              stopSpeaking();
              setMessages(messages.slice(0, 1));
            }}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Clear Chat"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Live Speaking Feedback Bar */}
      {isSpeaking && (
        <div className="my-2 p-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-md animate-pulse shrink-0">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 animate-bounce" />
            <span>
              {lang === 'hi' 
                ? '🔊 सहायक AI उत्तर बोलकर सुना रहा है...' 
                : '🔊 Sahayak AI is reading the response aloud...'}
            </span>
          </div>
          <button
            onClick={stopSpeaking}
            className="px-3 py-1 bg-white text-emerald-800 font-extrabold rounded-xl text-xs shadow hover:bg-emerald-50"
          >
            {lang === 'hi' ? 'आवाज़ रोकें ⏹️' : 'Stop Audio ⏹️'}
          </button>
        </div>
      )}

      {/* Error alert banner */}
      {speechError && (
        <div className="my-2 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between shrink-0">
          <span>⚠️ {speechError}</span>
          <button onClick={() => setSpeechError(null)} className="text-amber-800 font-black ml-2">✕</button>
        </div>
      )}

      {/* 1-Tap Quick Symptom Shortcut Chips */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-wider">
          {lang === 'hi' ? 'त्वरित लक्षण:' : 'Quick Options:'}
        </span>
        {quickSymptomChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-xs font-bold text-slate-700 shrink-0 transition-all active:scale-95 shadow-sm"
          >
            + {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isHigh = msg.urgency === 'High';
          const isMed = msg.urgency === 'Medium';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-3xl p-5 shadow-sm transition-all ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : isHigh
                    ? 'bg-red-50 border-2 border-red-400 text-slate-900 rounded-bl-none shadow-red-100'
                    : isMed
                    ? 'bg-amber-50 border-2 border-amber-300 text-slate-900 rounded-bl-none'
                    : 'bg-white border-2 border-slate-200 text-slate-900 rounded-bl-none'
                } ${highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''}`}
              >
                {/* Urgency Badge Row */}
                {!isUser && msg.urgency && (
                  <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isHigh
                            ? 'bg-red-600 text-white animate-pulse'
                            : isMed
                            ? 'bg-amber-400 text-amber-950'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isHigh ? <AlertOctagon className="w-3.5 h-3.5" /> : isMed ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {lang === 'hi' ? 'खतरे का स्तर' : 'Urgency'}: {msg.urgency}
                      </span>
                    </div>

                    {/* Manual Read Aloud Button */}
                    <button
                      onClick={() => speakResponse(`${msg.text}. ${msg.suggestedAction || ''}`)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
                      title={t.listenText}
                      aria-label="Read message aloud"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-700" />
                      <span>{lang === 'hi' ? 'सुनें' : 'Listen'}</span>
                    </button>
                  </div>
                )}

                {/* Main Message Text */}
                <p className="text-base sm:text-lg font-medium leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Suggested Action */}
                {!isUser && msg.suggestedAction && (
                  <div className={`mt-3 p-3 rounded-2xl flex items-center justify-between gap-3 ${
                    isHigh ? 'bg-red-600 text-white' : 'bg-emerald-100/80 text-emerald-900 font-bold'
                  }`}>
                    <div className="flex items-center gap-2 text-sm font-black">
                      <span>👉 {msg.suggestedAction}</span>
                    </div>
                    {isHigh && (
                      <button
                        onClick={() => setCurrentView('sos')}
                        className="px-3 py-1 bg-white text-red-700 font-black rounded-xl text-xs flex items-center gap-1 shadow"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>SOS 112/108</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Mandatory Medical Disclaimer */}
                {!isUser && msg.disclaimer && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-start gap-1.5 text-xs text-slate-500 font-semibold">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>⚠️ {msg.disclaimer}</span>
                  </div>
                )}

                <div className="mt-2 text-right text-[11px] opacity-70">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* ACCESSIBLE CLINICAL LOADING STATE */}
        {isLoading && (
          <div 
            role="status" 
            aria-live="polite"
            className={`max-w-[85%] sm:max-w-[70%] p-5 rounded-3xl border-2 border-emerald-300 bg-emerald-50/70 shadow-md flex items-start gap-4 transition-all animate-pulse ${
              highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''
            }`}
          >
            {/* Spinning/pulsing triage icon */}
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-emerald-950">
                  {lang === 'hi' 
                    ? 'सहायक AI लक्षणों का विश्लेषण कर रहा है...' 
                    : 'Sahayak AI is analyzing your symptoms...'}
                </span>
                
                {/* 3 Animated Bouncing Dots */}
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-700 typing-dot-1" />
                  <span className="w-2 h-2 rounded-full bg-emerald-700 typing-dot-2" />
                  <span className="w-2 h-2 rounded-full bg-emerald-700 typing-dot-3" />
                </div>
              </div>

              <p className="text-xs font-semibold text-emerald-800 mt-1">
                {lang === 'hi'
                  ? '🩺 खतरे के स्तर और प्रारंभिक सुरक्षा सलाह की जांच हो रही है...'
                  : '🩺 Evaluating clinical urgency level & safety guidance...'}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar with Microphone Speech-to-Text */}
      <div className="pt-3 border-t border-slate-200 shrink-0">
        
        {/* Active Microphone Status Banner */}
        {isListening && (
          <div 
            role="status"
            aria-live="assertive"
            className="mb-2 p-3 rounded-2xl bg-red-600 text-white text-xs font-black flex items-center justify-between animate-pulse shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping" />
              <span>
                {lang === 'hi' 
                  ? '🎙️ हिंदी में सुन रहा हूँ... कृपया अपने लक्षण बोलें' 
                  : '🎙️ Listening in English... Please speak your symptoms now'}
              </span>
            </div>
            <button
              onClick={toggleListening}
              className="text-xs bg-white text-red-700 px-3 py-1 rounded-xl font-black shadow hover:bg-red-50"
              aria-label={lang === 'hi' ? 'बोलना बंद करें' : 'Stop voice listening'}
            >
              {lang === 'hi' ? 'रोकें ⏹️' : 'Done ⏹️'}
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          aria-busy={isLoading}
          className="flex items-center gap-2"
        >
          {/* Big Microphone Button (Web Speech Recognition) */}
          <button
            type="button"
            disabled={isLoading}
            onClick={toggleListening}
            className={`p-4 rounded-2xl transition-all shadow-md flex items-center justify-center shrink-0 ${
              isLoading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : isListening
                ? 'bg-red-600 text-white mic-active scale-105 ring-4 ring-red-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 shadow-emerald-600/30'
            }`}
            title={
              isLoading
                ? (lang === 'hi' ? 'कृपया प्रतीक्षा करें...' : 'Please wait...')
                : isListening 
                ? (lang === 'hi' ? 'माइक बंद करें' : 'Stop microphone')
                : (lang === 'hi' ? 'बोलकर लक्षण बताएं (माइक्रोफ़ोन)' : 'Speak symptoms with microphone')
            }
            aria-label={
              isListening
                ? (lang === 'hi' ? 'माइक बंद करें' : 'Stop voice input')
                : (lang === 'hi' ? 'माइक से लक्षण बोलें' : 'Speak symptoms with microphone')
            }
          >
            {isListening ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>

          {/* Text Input Box */}
          <input
            type="text"
            disabled={isLoading}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isLoading
                ? (lang === 'hi' ? 'AI उत्तर तैयार कर रहा है...' : 'AI is analyzing your symptoms...')
                : lang === 'hi'
                ? "लक्षण लिखें या हरा माइक बटन दबाकर बोलें..."
                : "Type symptoms or tap green mic to speak..."
            }
            aria-label={lang === 'hi' ? 'लक्षण इनपुट बॉक्स' : 'Symptoms input field'}
            className={`flex-1 px-4 py-4 rounded-2xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none text-base sm:text-lg font-medium shadow-inner ${
              isLoading ? 'bg-slate-100 text-slate-500 cursor-wait' : ''
            } ${
              highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-white text-slate-900'
            }`}
          />

          {/* Send Button with Loading Indicator */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`px-5 py-4 rounded-2xl font-black text-white transition-all shadow-md shrink-0 flex items-center justify-center gap-2 ${
              !inputText.trim() || isLoading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/30'
            }`}
            aria-label={
              isLoading 
                ? (lang === 'hi' ? 'प्रतीक्षा करें, विश्लेषण जारी है' : 'Analyzing symptoms, please wait')
                : (lang === 'hi' ? 'लक्षण जांचें' : 'Check symptoms')
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-white" />
                <span className="hidden md:inline text-xs uppercase font-extrabold">
                  {lang === 'hi' ? 'जांच...' : 'Analyzing'}
                </span>
              </>
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </form>

      </div>

    </div>
  );
}
