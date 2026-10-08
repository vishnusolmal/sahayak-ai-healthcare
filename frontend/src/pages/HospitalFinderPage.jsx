import React, { useState } from 'react';
import { 
  Building2, 
  PhoneCall, 
  MapPin, 
  Clock, 
  Stethoscope, 
  Volume2, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export default function HospitalFinderPage({ setCurrentView, lang, t }) {
  const { highContrast, simpleMode } = useAccessibility();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const hospitals = [
    {
      id: 1,
      name: lang === 'hi' ? 'प्राथमिक स्वास्थ्य केंद्र (PHC - नया गांव)' : 'Primary Health Centre (PHC)',
      locality: 'Sector 4, Main Road',
      distance: '1.2 km',
      specialty: lang === 'hi' ? 'सामान्य चिकित्सा, टीकाकरण व मातृत्व सेवा' : 'General Medicine, Immunization & Maternity',
      type: 'Government (Free)',
      isGovt: true,
      openStatus: 'Open 24x7 (खुला है)',
      phone: '+911123456789',
      displayPhone: '011-2345-6789',
      category: 'emergency',
      ayushmanBharat: true
    },
    {
      id: 2,
      name: lang === 'hi' ? 'सामुदायिक स्वास्थ्य केंद्र (CHC)' : 'Community Health Centre (CHC)',
      locality: 'Near Bus Stand, Civil Lines',
      distance: '3.5 km',
      specialty: lang === 'hi' ? 'आपातकालीन वार्ड, प्रसूति व बाल रोग' : 'Emergency Ward, Maternity & Pediatrics',
      type: 'Government CHC',
      isGovt: true,
      openStatus: 'Open 24x7 (आपातकालीन सेवा)',
      phone: '+911129876543',
      displayPhone: '011-2987-6543',
      category: 'emergency',
      ayushmanBharat: true
    },
    {
      id: 3,
      name: lang === 'hi' ? 'जिला नागरिक अस्पताल (District Hospital)' : 'District Civil Hospital',
      locality: 'Hospital Chowk, District Centre',
      distance: '5.8 km',
      specialty: lang === 'hi' ? 'मल्टी-स्पेशियलिटी, आईसीयू, ट्रॉमा व सर्जरी' : 'Multi-Specialty, ICU, Trauma & Major Surgery',
      type: 'Govt. Multi-Specialty',
      isGovt: true,
      openStatus: 'Open 24x7 (आपातकालीन व ट्रॉमा)',
      phone: '+911126588500',
      displayPhone: '011-2658-8500',
      category: 'emergency',
      ayushmanBharat: true
    },
    {
      id: 4,
      name: lang === 'hi' ? 'आयुष्मान आरोग्य मंदिर (स्वास्थ्य केंद्र)' : 'Ayushman Arogya Mandir',
      locality: 'Village Panchayat Bhawan',
      distance: '800 meters',
      specialty: lang === 'hi' ? 'बुजुर्ग क्रोनिक केयर, बीपी, शुगर व जांच' : 'Elderly Chronic Care, BP & Diabetes Screening',
      type: 'Wellness Centre',
      isGovt: true,
      openStatus: '8:00 AM - 6:00 PM',
      phone: '1800114477',
      displayPhone: '1800-11-4477 (Toll-Free)',
      category: 'elderly',
      ayushmanBharat: true
    },
    {
      id: 5,
      name: lang === 'hi' ? 'संजीवनी ग्रामीण जन सेवा क्लिनिक' : 'Sanjivani Rural Charitable Clinic',
      locality: 'Station Road, Market Yard',
      distance: '2.1 km',
      specialty: lang === 'hi' ? 'नेत्र जांच, दंत चिकित्सा व सामान्य ओपीडी' : 'Eye Care, Dental & General OPD',
      type: 'Subsidized Trust',
      isGovt: false,
      openStatus: '9:00 AM - 8:00 PM',
      phone: '+919876543210',
      displayPhone: '+91 98765 43210',
      category: 'general',
      ayushmanBharat: false
    }
  ];

  const filteredHospitals = hospitals.filter((h) => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'emergency' && h.category === 'emergency') ||
      (filter === 'govt' && h.isGovt) ||
      (filter === 'elderly' && h.category === 'elderly');

    const matchesSearch = 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const speakHospital = (h) => {
    const text = `${h.name}. ${lang === 'hi' ? 'दूरी' : 'Distance'}: ${h.distance}. ${h.specialty}. ${h.openStatus}. ${lang === 'hi' ? 'फोन' : 'Phone'}: ${h.displayPhone}`;
    speechService.speak(text, lang);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-700 text-white flex items-center justify-center shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t.cardHospitalTitle}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {lang === 'hi' ? 'नज़दीकी अस्पताल व क्लिनिक • 1-टैप में सीधे कॉल करें' : 'Nearby hospitals & clinics with one-tap calling'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('sos')}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{lang === 'hi' ? 'आपातकालीन 108 एम्बुलेंस' : 'Emergency 108 Ambulance'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'hi' ? 'अस्पताल या विशेषता खोजें...' : 'Search hospital or specialty...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-sky-500 text-sm font-semibold focus:outline-none ${
              highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-white'
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Hospital filters">
          <button
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            aria-label={lang === 'hi' ? 'सभी अस्पताल दिखाएं' : 'Show all hospitals'}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'all'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            {lang === 'hi' ? 'सभी (All)' : 'All'}
          </button>

          <button
            onClick={() => setFilter('emergency')}
            aria-pressed={filter === 'emergency'}
            aria-label={lang === 'hi' ? 'केवल आपातकालीन अस्पताल दिखाएं' : 'Show 24x7 emergency facilities only'}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'emergency'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            🚨 {lang === 'hi' ? '24x7 आपातकालीन' : '24x7 Emergency'}
          </button>

          <button
            onClick={() => setFilter('govt')}
            aria-pressed={filter === 'govt'}
            aria-label={lang === 'hi' ? 'केवल सरकारी स्वास्थ्य केंद्र दिखाएं' : 'Show government health centres only'}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'govt'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            🏛️ {lang === 'hi' ? 'सरकारी (Free)' : 'Government'}
          </button>

          <button
            onClick={() => setFilter('elderly')}
            aria-pressed={filter === 'elderly'}
            aria-label={lang === 'hi' ? 'बुजुर्ग देखभाल केंद्र दिखाएं' : 'Show elderly care centres only'}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'elderly'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            👴 {lang === 'hi' ? 'बुजुर्ग देखभाल' : 'Elderly Care'}
          </button>
        </div>
      </div>

      {/* Hospital List Cards */}
      <div className="space-y-4">
        {filteredHospitals.map((h) => (
          <div
            key={h.id}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              h.category === 'emergency'
                ? 'bg-white border-slate-200 hover:border-sky-400 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            } ${highContrast ? 'bg-black text-yellow-300 border-yellow-300' : ''}`}
          >
            {/* Hospital Details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-lg text-xs font-black flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {h.distance}
                </span>

                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                  {h.type}
                </span>

                {h.ayushmanBharat && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ayushman PMJAY</span>
                  </span>
                )}

                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {h.openStatus}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                {h.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium mb-3">
                📍 {h.locality}
              </p>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Stethoscope className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{h.specialty}</span>
              </div>
            </div>

            {/* Actions: Speak + Call */}
            <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
              
              {/* Listen Aloud Button */}
              <button
                onClick={() => speakHospital(h)}
                className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title={t.listenText}
                aria-label={`Listen to ${h.name} details`}
              >
                <Volume2 className="w-6 h-6 text-sky-600" />
              </button>

              {/* Direct Call Button (tel: link) */}
              <a
                href={`tel:${h.phone}`}
                className="flex-1 md:flex-initial px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <PhoneCall className="w-6 h-6 animate-pulse" />
                <span>{lang === 'hi' ? 'तुरंत कॉल करें' : 'Call Hospital'}</span>
              </a>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
