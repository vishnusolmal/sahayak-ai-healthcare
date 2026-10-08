// Native Web Speech API Service (SpeechSynthesis and SpeechRecognition)
// Zero external paid dependencies, works directly in Chrome, Edge, Safari, Firefox.

let voicesCache = [];

// Pre-load voices for Chrome/Edge
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  voicesCache = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voicesCache = window.speechSynthesis.getVoices();
  };
}

export const speechService = {
  // Check browser speech support
  isSynthSupported: () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  isRecSupported: () => typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window),

  // Get available voices
  getVoices: () => {
    if (!speechService.isSynthSupported()) return [];
    if (voicesCache.length === 0) {
      voicesCache = window.speechSynthesis.getVoices();
    }
    return voicesCache;
  },

  // Speak text aloud with callbacks
  speak: (text, lang = 'en', onStart, onEnd, onError) => {
    if (!speechService.isSynthSupported()) {
      console.warn('Speech synthesis not supported in this browser.');
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any currently playing audio

      const utterance = new SpeechSynthesisUtterance(text);
      const isHindi = lang === 'hi' || lang === 'hi-IN';
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95; // Friendly cadence for elderly and clarity
      utterance.pitch = 1.0;

      // Find appropriate regional voice
      const voices = speechService.getVoices();
      let matchingVoice = null;

      if (isHindi) {
        matchingVoice = voices.find(v => v.lang.toLowerCase().includes('hi')) ||
                        voices.find(v => v.lang.toLowerCase().includes('in'));
      } else {
        matchingVoice = voices.find(v => v.lang.toLowerCase() === 'en-in') ||
                        voices.find(v => v.lang.toLowerCase().includes('en-in')) ||
                        voices.find(v => v.lang.toLowerCase().includes('en'));
      }

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        if (onError) onError(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis execution failed:', err);
      if (onError) onError(err);
    }
  },

  // Stop speaking immediately
  stop: () => {
    if (speechService.isSynthSupported()) {
      window.speechSynthesis.cancel();
    }
  },

  // Create speech recognition instance configured for selected language
  createRecognizer: (lang = 'en', onResult, onError, onEnd) => {
    if (!speechService.isRecSupported()) {
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition status:', event.error);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    return recognition;
  }
};
