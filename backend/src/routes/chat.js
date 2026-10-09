import express from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const router = express.Router();

// Rich symptom-specific clinical triage knowledge base
function getClinicalFallback(symptomText, lang = 'en') {
  const query = (symptomText || '').toLowerCase().trim();

  // Casual greeting check
  if (
    query === 'hi' || query === 'hello' || query === 'hey' || query === 'namaste' ||
    query.includes('how are you') || query === 'नमस्ते'
  ) {
    if (lang === 'hi') {
      return {
        guidance: "नमस्ते! मैं आपका सहायक AI स्वास्थ्य साथी हूँ। कृपया मुझे अपने लक्षण बताएं।",
        urgency: "Low",
        suggestedAction: "कृपया अपनी स्वास्थ्य समस्या बताएं",
        disclaimer: "यह AI स्वास्थ्य सलाह है।"
      };
    }
    return {
      guidance: "Hi, how are you. I am Sahayak AI, your health companion. Please tell me your symptoms.",
      urgency: "Low",
      suggestedAction: "Please describe your health issue",
      disclaimer: "This is an AI health assistant."
    };
  }

  // 1. CHEST PAIN / BREATHING / CARDIAC EMERGENCY (HIGH URGENCY)
  if (
    query.includes('chest') || query.includes('heart') || query.includes('breath') ||
    query.includes('choking') || query.includes('stroke') || query.includes('unconscious') ||
    query.includes('सीने') || query.includes('छाती') || query.includes('दिल') || query.includes('सांस') || query.includes('बेहोश')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "सीने में दर्द या सांस लेने में भारीपन एक गंभीर आपात स्थिति हो सकती है। कृपया शांत रहें, आराम से बैठें और कोई शारीरिक परिश्रम न करें। तुरंत नज़दीकी आपातकालीन अस्पताल जाएं।",
        urgency: "High",
        suggestedAction: "तत्काल 108 एम्बुलेंस या 112 पर कॉल करें",
        disclaimer: "यह AI प्राथमिक मार्गदर्शन है। तुरंत आपातकालीन डॉक्टर को दिखाएं।"
      };
    }
    return {
      guidance: "Chest discomfort or trouble breathing can be a sign of a serious medical emergency. Please sit down in a comfortable upright position, loosen tight clothing, and do not exert yourself.",
      urgency: "High",
      suggestedAction: "Call 108 or 112 Ambulance or visit the nearest ER immediately",
      disclaimer: "This is AI triage guidance. Seek immediate emergency medical care."
    };
  }

  // 2. FEVER & CHILLS / INFECTION
  if (
    query.includes('fever') || query.includes('temperature') || query.includes('chills') ||
    query.includes('shivering') || query.includes('बुखार') || query.includes('तापमान') || query.includes('ठंड')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "बुखार शरीर में संक्रमण से लड़ने का संकेत है। माथे पर ताजे पानी की गीली पट्टी रखें, भरपूर पानी, नारियल पानी या ओआरएस पिएं और पर्याप्त आराम करें। यदि बुखार 102°F से अधिक हो या 48 घंटे तक बना रहे तो डॉक्टर को दिखाएं।",
        urgency: "Medium",
        suggestedAction: "तापमान मापें और 24-48 घंटों में डॉक्टर से मिलें",
        disclaimer: "दवा लेने से पहले प्रमाणित डॉक्टर या फार्मासिस्ट से परामर्श अवश्य लें।"
      };
    }
    return {
      guidance: "Fever is often your body's response to an infection. Rest comfortably, apply cool wet cloth wipes to the forehead, and drink plenty of fluids like warm water or ORS. Check your temperature regularly with a thermometer.",
      urgency: "Medium",
      suggestedAction: "Monitor temperature; visit a clinic if fever exceeds 102°F or lasts >2 days",
      disclaimer: "Consult a qualified medical doctor before starting any medication."
    };
  }

  // 3. COUGH, COLD, SORE THROAT & FLU
  if (
    query.includes('cough') || query.includes('cold') || query.includes('throat') ||
    query.includes('sneeze') || query.includes('runny') || query.includes('खांसी') || query.includes('जुकाम') || query.includes('गले')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "गले में खराश और खांसी के लिए हल्के गुनगुने पानी में थोड़ा नमक डालकर गरारे करें। दिन में 2-3 बार गर्म पानी की भाप लें और अदरक-शहद का गर्म पानी पिएं। ठंडे पेय और धूल-धुएं से बचें।",
        urgency: "Low",
        suggestedAction: "गुनगुने नमक पानी के गरारे व भाप लें; 3 दिन में आराम न हो तो डॉक्टर से मिलें",
        disclaimer: "यह सामान्य घरेलू देखभाल मार्गदर्शन है, चिकित्सीय पर्चा नहीं।"
      };
    }
    return {
      guidance: "For cough and sore throat, gargle with warm salt water 2 to 3 times a day. Steam inhalation and sipping warm water with ginger or honey can soothe irritation. Avoid cold drinks and direct dust exposure.",
      urgency: "Low",
      suggestedAction: "Warm salt gargles and steam rest; see a doctor if cough lasts over a week",
      disclaimer: "Educational advice only. Always consult a healthcare provider."
    };
  }

  // 4. STOMACH PAIN, ACIDITY, GAS & INDIGESTION
  if (
    query.includes('stomach') || query.includes('abdomen') || query.includes('acidity') ||
    query.includes('gas') || query.includes('indigestion') || query.includes('constipation') ||
    query.includes('पेट') || query.includes('गैस') || query.includes('एसिडिटी') || query.includes('कब्ज')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "पेट दर्द या एसिडिटी के लिए हल्का और सुपाच्य भोजन (जैसे पतली खिचड़ी, दलिया या दही-चावल) लें। तली-भुनी, मसालेदार चीजें और चाय-कॉफी बंद रखें। हल्का गुनगुना पानी घूंट-घूंट पिएं।",
        urgency: "Medium",
        suggestedAction: "सुपाच्य हल्का भोजन लें; यदि दर्द बहुत तेज हो तो तुरंत प्राथमिक स्वास्थ्य केंद्र जाएं",
        disclaimer: "अचानक तेज चुभने वाले पेट दर्द में तुरंत डॉक्टर से संपर्क करें।"
      };
    }
    return {
      guidance: "For stomach ache and acidity, eat simple bland foods like curd rice, khichdi, or toast. Avoid oily, spicy, and deep-fried items. Drink small sips of warm water and avoid lying down flat immediately after eating.",
      urgency: "Medium",
      suggestedAction: "Eat a light bland diet; seek clinic evaluation if pain is severe or sharp",
      disclaimer: "Severe sudden abdominal pain requires in-person medical examination."
    };
  }

  // 5. VOMITING, DIARRHEA & FOOD POISONING
  if (
    query.includes('vomit') || query.includes('nausea') || query.includes('diarrhea') ||
    query.includes('loose') || query.includes('food poisoning') || query.includes('उल्टी') || query.includes('दस्त') || query.includes('जी मिचलाना')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "उल्टी या दस्त में शरीर से पानी और नमक की कमी होना सबसे बड़ा खतरा है। तुरंत ओआरएस (ORS) का घोल, नींबू पानी या नारियल पानी छोटे-छोटे घूंट में बार-बार पिएं। ठोस और भारी भोजन से बचें।",
        urgency: "Medium",
        suggestedAction: "ओआरएस (ORS) का घोल पिएं; यदि 4-5 बार से अधिक उल्टी/दस्त हो तो PHC जाएं",
        disclaimer: "पानी की गंभीर कमी (सूखा मुंह, पेशाब न आना) होने पर तुरंत अस्पताल जाएं।"
      };
    }
    return {
      guidance: "Frequent vomiting or diarrhea causes rapid fluid loss. The most critical step is staying hydrated by sipping ORS (Oral Rehydration Salts) or coconut water slowly. Do not eat oily or dairy-heavy food.",
      urgency: "Medium",
      suggestedAction: "Drink ORS fluid frequently; visit a doctor if vomiting persists beyond 12 hours",
      disclaimer: "Signs of severe dehydration require urgent medical treatment."
    };
  }

  // 6. HEADACHE & MIGRAINE
  if (
    query.includes('headache') || query.includes('migraine') || query.includes('head') ||
    query.includes('सिरदर्द') || query.includes('सिर में दर्द') || query.includes('आधा सीसी')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "सिरदर्द अक्सर तनाव, निर्जलीकरण (पानी की कमी) या आंखों की थकान से होता है। शांत, अंधेरे कमरे में आराम करें, 1-2 गिलास पानी पिएं और माथे पर हल्का ठंडा कपड़ा रखें। स्क्रीन व तेज रोशनी से दूरी बनाएं।",
        urgency: "Low",
        suggestedAction: "शांत अंधेरे कमरे में विश्राम करें व पानी पिएं; चक्कर या उल्टी आने पर डॉक्टर को दिखाएं",
        disclaimer: "यदि सिरदर्द अचानक बहुत तेज हो या देखने में धुंधलापन आए, तो तुरंत डॉक्टर से मिलें।"
      };
    }
    return {
      guidance: "Headaches are often triggered by dehydration, eye strain, lack of sleep, or stress. Rest in a quiet and dim room, drink two glasses of water, and apply a cool compress to your forehead. Step away from phone or TV screens.",
      urgency: "Low",
      suggestedAction: "Hydrate, rest your eyes, and sleep; consult a physician if headache is frequent",
      disclaimer: "Sudden thunderclap headaches require immediate emergency assessment."
    };
  }

  // 7. HIGH BLOOD PRESSURE / DIZZINESS / FAINTING
  if (
    query.includes('bp') || query.includes('blood pressure') || query.includes('dizzy') ||
    query.includes('dizziness') || query.includes('spinning') || query.includes('चक्कर') || query.includes('ब्लड प्रेशर') || query.includes('बीपी')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "चक्कर आने या बीपी के उतार-चढ़ाव में तुरंत बैठ जाएं या लेट जाएं ताकि गिरने से चोट न लगे। भोजन में नमक की मात्रा कम रखें और तनाव न लें। यदि आप बीपी की दवा लेते हैं तो समय पर लें और डिजिटल बीपी मशीन से जांचें।",
        urgency: "Medium",
        suggestedAction: "आराम से बैठें और बीपी चेक कराएं; हाथ-पैर सुन्न हों तो तुरंत 108 पर कॉल करें",
        disclaimer: "उच्च रक्तचाप एक गंभीर स्थिति है। डॉक्टर द्वारा बताई गई खुराक में खुद बदलाव न करें।"
      };
    }
    return {
      guidance: "If you feel dizzy or notice high blood pressure, sit or lie down immediately to prevent falls. Breathe deeply, drink a glass of water, and keep salt intake low. If you have prescribed BP medicine, take it as directed.",
      urgency: "Medium",
      suggestedAction: "Rest seated and check BP; seek urgent medical help if vision is blurry or speech is slurred",
      disclaimer: "Blood pressure abnormalities require certified physician management."
    };
  }

  // 8. DIABETES / HIGH BLOOD SUGAR
  if (
    query.includes('sugar') || query.includes('diabetes') || query.includes('glucose') ||
    query.includes('शुगर') || query.includes('मधुमेह') || query.includes('डायबिटीज')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "डायबिटीज में ब्लड शुगर का स्तर नियंत्रित रखना आवश्यक है। मीठे पकवान, चीनी और मैदे से बचें। फाइबर युक्त भोजन जैसे हरी सब्जियां, जामुन और मेथी का उपयोग करें। नियमित रूप से ग्लूकोमीटर से शुगर नापें।",
        urgency: "Medium",
        suggestedAction: "फास्टिंग और भोजन के बाद की शुगर नापें; डॉक्टर से दवा की खुराक की समीक्षा कराएं",
        disclaimer: "शुगर की दवा या इंसुलिन में कोई भी बदलाव बिना डॉक्टर की सलाह के न करें।"
      };
    }
    return {
      guidance: "Managing blood sugar requires a balanced diet and regular monitoring. Avoid sugary drinks, sweets, and refined flour. Eat whole grains and green leafy vegetables, drink adequate water, and check your blood glucose with a glucometer.",
      urgency: "Medium",
      suggestedAction: "Test blood sugar levels and consult your primary doctor for dosage review",
      disclaimer: "Never modify prescribed diabetes medications without medical guidance."
    };
  }

  // 9. JOINT PAIN, KNEE PAIN, BACKACHE & ARTHRITIS
  if (
    query.includes('joint') || query.includes('knee') || query.includes('arthritis') ||
    query.includes('back') || query.includes('bone') || query.includes('muscle') ||
    query.includes('घुटने') || query.includes('जोड़ों') || query.includes('कमर') || query.includes('हड्डी') || query.includes('दर्द')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "जोड़ों या घुटनों के दर्द के लिए प्रभावित स्थान पर हल्के गर्म कपड़े या हीटिंग पैड से सिकाई करें। जमीन पर पालथी मारकर बैठने से बचें और भारी वजन न उठाएं। हल्का गुनगुना तिल का तेल लगाकर धीरे-धीरे मालिश कर सकते हैं।",
        urgency: "Low",
        suggestedAction: "गर्म सिकाई करें और आराम दें; सूजन या लाली होने पर आर्थोपेडिक डॉक्टर से मिलें",
        disclaimer: "जोड़ों में अचानक तेज सूजन या चोट लगने पर एक्स-रे व डॉक्टर की जांच आवश्यक है।"
      };
    }
    return {
      guidance: "For knee, joint, or back pain, apply a warm compress or heating pad for 15 minutes to ease stiffness. Avoid sitting cross-legged on the floor or lifting heavy weights. Gentle walking and stretching can keep joints flexible.",
      urgency: "Low",
      suggestedAction: "Use warm fomentation and rest; visit a doctor if joints are visibly swollen or red",
      disclaimer: "Persistent severe joint pain requires an orthopedic evaluation."
    };
  }

  // 10. SKIN RASH, ALLERGY & ITCHING
  if (
    query.includes('skin') || query.includes('rash') || query.includes('itch') ||
    query.includes('allergy') || query.includes('खुजली') || query.includes('दाद') || query.includes('चकत्ते') || query.includes('एलर्जी')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "त्वचा पर खुजली या चकत्तों के लिए ठंडे पानी से धोएं और कैलामाइन लोशन या नारियल तेल लगाएं। नाखूनों से खरोंचने से बचें ताकि संक्रमण न फैले। ढीले सूती कपड़े पहनें और तेज धूप से बचें।",
        urgency: "Low",
        suggestedAction: "नारियल तेल या कैलामाइन लगाएं; चेहरे या सांस की नली में सूजन आए तो तुरंत अस्पताल जाएं",
        disclaimer: "गंभीर एलर्जी (सांस लेने में रुकावट, होंठ सूजना) में तत्काल आपातकालीन मदद लें।"
      };
    }
    return {
      guidance: "For skin rashes and itching, wash gently with cool water and pat dry. Apply soothing calamine lotion or pure coconut oil. Avoid scratching with fingernails to prevent secondary bacterial infection, and wear loose cotton clothes.",
      urgency: "Low",
      suggestedAction: "Apply soothing lotion; seek immediate emergency care if lips or throat swell",
      disclaimer: "Severe allergic reactions with facial swelling require emergency care."
    };
  }

  // 11. EYE STRAIN, REDNESS & BURNING
  if (
    query.includes('eye') || query.includes('vision') || query.includes('आंख') || query.includes('दृष्टि') || query.includes('आंखों')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "आंखों में जलन या थकान के लिए ठंडे साफ पानी के छींटे मारें और आंखों को हाथों से न मलें। 20-20-20 नियम अपनाएं: हर 20 मिनट बाद 20 फीट दूर देखें। पर्याप्त नींद लें।",
        urgency: "Low",
        suggestedAction: "साफ ठंडे पानी से आंखें धोएं; यदि लाली, दर्द या पीला पानी आए तो नेत्र चिकित्सक को दिखाएं",
        disclaimer: "आंखों में किसी भी रासायनिक पदार्थ या गंभीर चोट की स्थिति में तुरंत डॉक्टर को दिखाएं।"
      };
    }
    return {
      guidance: "For eye strain or mild redness, splash clean cool water and do not rub your eyes. Take frequent breaks from screen time (follow the 20-20-20 rule). Get proper sleep and rest your eyes in a dimly lit room.",
      urgency: "Low",
      suggestedAction: "Rest your eyes with cool compresses; see an eye specialist if pain or discharge persists",
      disclaimer: "Eye injuries, vision loss, or chemical splashes require urgent emergency care."
    };
  }

  // 12. TOOTHACHE & GUM PAIN
  if (
    query.includes('tooth') || query.includes('teeth') || query.includes('gum') ||
    query.includes('दांत') || query.includes('मसूड़े') || query.includes('दांत दर्द')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "दांत दर्द के लिए एक चुटकी नमक मिले गुनगुने पानी से कुल्ला करें। दर्द वाली जगह पर लौंग का तेल या एक लौंग दबाकर रख सकते हैं। बहुत ठंडा या बहुत गर्म खाना-पीना न लें।",
        urgency: "Low",
        suggestedAction: "गुनगुने नमक पानी से कुल्ला करें और दंत चिकित्सक (डेंटिस्ट) से जांच कराएं",
        disclaimer: "दांत में कीड़ा या मसूड़ों के संक्रमण के लिए दंत चिकित्सक की जांच जरूरी है।"
      };
    }
    return {
      guidance: "For toothache, rinse your mouth gently with warm salt water. You can apply a drop of clove oil on a cotton swab near the aching tooth to soothe the ache. Avoid very cold, hot, or sugary foods.",
      urgency: "Low",
      suggestedAction: "Rinse with warm salt water and book a dental checkup",
      disclaimer: "Tooth decay and infections require evaluation by a certified dentist."
    };
  }

  // 13. WEAKNESS, FATIGUE & LOW ENERGY
  if (
    query.includes('weak') || query.includes('tired') || query.includes('fatigue') ||
    query.includes('energy') || query.includes('कमजोरी') || query.includes('थकान') || query.includes('सुस्ती')
  ) {
    if (lang === 'hi') {
      return {
        guidance: "शारीरिक कमजोरी और थकान के लिए पोषक तत्वों से भरपूर आहार लें—जैसे दूध, दालें, फल और हरी सब्जियां। दिन भर में 8-10 गिलास पानी पिएं और 7-8 घंटे की गहरी नींद लें। खून की कमी (एनीमिया) की जांच हेतु सीबीसी टेस्ट करवा सकते हैं।",
        urgency: "Low",
        suggestedAction: "पौष्टिक भोजन व पर्याप्त नींद लें; लगातार कमजोरी बनी रहे तो डॉक्टर से जांच कराएं",
        disclaimer: "लगातार अत्यधिक थकान किसी आंतरिक स्वास्थ्य समस्या का संकेत हो सकती है।"
      };
    }
    return {
      guidance: "General fatigue is often caused by dehydration, nutritional gaps (like low iron or vitamins), or inadequate sleep. Drink plenty of water, eat fresh fruits and lentils, and aim for 7 to 8 hours of sound sleep.",
      urgency: "Low",
      suggestedAction: "Improve sleep and hydration; check hemoglobin (CBC test) if weakness persists",
      disclaimer: "Chronic unresolving fatigue should be investigated by a physician."
    };
  }

  // 14. DEFAULT CONTEXTUAL ADVICE & GIBBERISH FALLBACK
  if (lang === 'hi') {
    return {
      guidance: `मैं आपके लक्षणों या बात को पूरी तरह समझ नहीं पाया ("${symptomText.slice(0, 40)}..."). मैं एक स्वास्थ्य सहायक हूँ, कृपया मुझे सही और स्पष्ट स्वास्थ्य जानकारी (लक्षण) दें। यदि आपकी स्थिति गंभीर है तो तुरंत डॉक्टर से मिलें।`,
      urgency: "Low",
      suggestedAction: "कृपया सही स्वास्थ्य जानकारी दें",
      disclaimer: "यह AI स्वास्थ्य सलाह है और वास्तविक डॉक्टर की जगह नहीं ले सकती। किसी प्रमाणित चिकित्सक से परामर्श लें।"
    };
  }

  return {
    guidance: `I could not clearly understand your input ("${symptomText.slice(0, 40)}..."). I am a health assistant; please provide correct and clear medical data or symptoms. If this is a real medical issue, please consult a clinic.`,
    urgency: "Low",
    suggestedAction: "Please provide correct health data",
    disclaimer: "This is AI-generated educational guidance and is NOT a substitute for professional medical diagnosis or treatment."
  };
}

router.post('/', async (req, res) => {
  const { message, lang = 'en' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = apiKey && 
    apiKey !== 'your_gemini_api_key_placeholder' && 
    apiKey !== 'your_gemini_api_key_here' && 
    apiKey.trim().length > 10;

  if (!isKeyConfigured) {
    // Return rich clinical triage fallback
    const fallbackResponse = getClinicalFallback(message, lang);
    return res.json({
      ...fallbackResponse,
      mode: 'clinical_simulation_mode'
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: 'You are SahayakAI, a cautious, compassionate health triage assistant designed specifically for elderly, rural, and low-literacy users in India.\n\nSTRICT CLINICAL SAFETY RULES:\n1. If the user only enters a casual greeting, reply naturally and politely ask for their symptoms.\n2. GIBBERISH/NON-MEDICAL: If the user texts meaningless words, random sentences, or non-medical data, politely tell them that you are a health assistant and ask them to "give correct data" or clear symptoms.\n3. ACT AS A CAUTIOUS TRIAGE ASSISTANT: Assess urgency and provide safe preliminary guidance, NOT practice medicine.\n4. NEVER GIVE A DEFINITE DIAGNOSIS: Never say "You have X". Describe general possibilities.\n5. ALWAYS RECOMMEND PROFESSIONAL CONSULTATION FOR ANYTHING SERIOUS.\n6. GRADE-5 READING LEVEL: Keep sentences very short, warm, and easy to understand.\n7. CONCISE & DYNAMIC: Keep the "guidance" field to 2 to 4 simple sentences.',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            guidance: { type: SchemaType.STRING },
            urgency: { type: SchemaType.STRING, enum: ["Low", "Medium", "High"] },
            suggestedAction: { type: SchemaType.STRING },
            disclaimer: { type: SchemaType.STRING }
          },
          required: ["guidance", "urgency", "suggestedAction", "disclaimer"]
        }
      }
    });

    const userPrompt = `PATIENT INQUIRY: "${message}"\nREQUESTED LANGUAGE: ${lang === 'hi' ? 'Hindi (हिंदी in simple, clear Devanagari script)' : 'English (very simple words)'}.`;

    const result = await model.generateContent(userPrompt);
    const text = result.response.text().trim();
    
    const parsed = JSON.parse(text);

    return res.json({
      guidance: parsed.guidance,
      urgency: parsed.urgency || 'Medium',
      suggestedAction: parsed.suggestedAction || (lang === 'hi' ? 'डॉक्टर से परामर्श लें' : 'Consult a doctor'),
      disclaimer: parsed.disclaimer || (lang === 'hi' ? 'यह AI मार्गदर्शन है, डॉक्टर की सलाह अनिवार्य है।' : 'This is AI triage guidance. Please consult a qualified doctor.'),
      mode: 'gemini_live_ai'
    });
  } catch (error) {
    console.warn('[SahayakAI] Gemini API error, seamlessly activating clinical fallback:', error.message);
    const fallbackResponse = getClinicalFallback(message, lang);
    return res.json({
      ...fallbackResponse,
      mode: 'clinical_fallback_mode'
    });
  }
});

export default router;
