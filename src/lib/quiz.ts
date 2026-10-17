// Quiz Blitz question bank: 30 questions, 6 per category, each translated into
// English, Tamil and Hindi. The CORRECT option is always written first here;
// the game shuffles option order at runtime (same order for every language,
// so switching language mid-question keeps the layout stable).
// Normal questions get one funny wrong option; "funny" questions are silly on
// purpose but still have a single sensible answer.
import type { Lang } from "../i18n/languages.ts";
import { shuffle } from "./random.ts";

export type QuizCategory = "science" | "sports" | "geography" | "tech" | "funny";
export const QUIZ_CATEGORIES: QuizCategory[] = ["science", "sports", "geography", "tech", "funny"];

type L = Record<Lang, string>;
type L4 = Record<Lang, [string, string, string, string]>;

export interface QuizQuestion {
  id: string;
  cat: QuizCategory;
  q: L;
  /** options[lang][0] is the correct answer. */
  options: L4;
}

export const QUESTIONS: QuizQuestion[] = [
  // ---------------- Science ----------------
  {
    id: "sci-planet",
    cat: "science",
    q: { en: "Which planet is known as the Red Planet?", ta: "சிவப்பு கிரகம் என்று அழைக்கப்படுவது எது?", hi: "किस ग्रह को लाल ग्रह कहा जाता है?" },
    options: {
      en: ["Mars", "Venus", "Jupiter", "Planet Ketchup 🍅"],
      ta: ["செவ்வாய்", "வெள்ளி", "வியாழன்", "கெட்சப் கிரகம் 🍅"],
      hi: ["मंगल", "शुक्र", "बृहस्पति", "केचप ग्रह 🍅"],
    },
  },
  {
    id: "sci-water",
    cat: "science",
    q: { en: "What is the chemical formula of water?", ta: "தண்ணீரின் வேதியியல் சூத்திரம் என்ன?", hi: "पानी का रासायनिक सूत्र क्या है?" },
    options: {
      en: ["H₂O", "CO₂", "O₂", "H₂Oops"],
      ta: ["H₂O", "CO₂", "O₂", "H₂அய்யோ"],
      hi: ["H₂O", "CO₂", "O₂", "H₂उफ़"],
    },
  },
  {
    id: "sci-bones",
    cat: "science",
    q: { en: "How many bones does an adult human have?", ta: "வயது வந்த மனிதனுக்கு எத்தனை எலும்புகள்?", hi: "एक वयस्क इंसान में कितनी हड्डियाँ होती हैं?" },
    options: {
      en: ["206", "150", "312", "Just one big wobbly one"],
      ta: ["206", "150", "312", "ஒரே ஒரு பெரிய ஜெல்லி எலும்பு"],
      hi: ["206", "150", "312", "बस एक बड़ी हिलती-डुलती हड्डी"],
    },
  },
  {
    id: "sci-gas",
    cat: "science",
    q: { en: "Which gas do plants absorb from the air?", ta: "தாவரங்கள் காற்றிலிருந்து எந்த வாயுவை உறிஞ்சுகின்றன?", hi: "पौधे हवा से कौन सी गैस लेते हैं?" },
    options: {
      en: ["Carbon dioxide", "Oxygen", "Helium", "Wi-Fi signals"],
      ta: ["கார்பன் டை ஆக்சைடு", "ஆக்ஸிஜன்", "ஹீலியம்", "வைஃபை சிக்னல்"],
      hi: ["कार्बन डाइऑक्साइड", "ऑक्सीजन", "हीलियम", "वाई-फ़ाई सिग्नल"],
    },
  },
  {
    id: "sci-star",
    cat: "science",
    q: { en: "What is the closest star to Earth?", ta: "பூமிக்கு மிக அருகில் உள்ள நட்சத்திரம் எது?", hi: "पृथ्वी के सबसे पास कौन सा तारा है?" },
    options: {
      en: ["The Sun", "Polaris", "Sirius", "A movie star next door"],
      ta: ["சூரியன்", "துருவ நட்சத்திரம்", "சிரியஸ்", "பக்கத்து வீட்டு சினிமா ஸ்டார்"],
      hi: ["सूरज", "ध्रुव तारा", "सीरियस", "पड़ोस का फ़िल्मी स्टार"],
    },
  },
  {
    id: "sci-heart",
    cat: "science",
    q: { en: "Which organ pumps blood around the body?", ta: "உடல் முழுவதும் ரத்தத்தை பம்ப் செய்யும் உறுப்பு எது?", hi: "कौन सा अंग पूरे शरीर में खून पंप करता है?" },
    options: {
      en: ["Heart", "Liver", "Lungs", "The elbow"],
      ta: ["இதயம்", "கல்லீரல்", "நுரையீரல்", "முழங்கை"],
      hi: ["दिल", "जिगर", "फेफड़े", "कोहनी"],
    },
  },
  // ---------------- Sports ----------------
  {
    id: "spo-cricket",
    cat: "sports",
    q: { en: "How many players are on a cricket team on the field?", ta: "மைதானத்தில் ஒரு கிரிக்கெட் அணியில் எத்தனை வீரர்கள்?", hi: "मैदान पर एक क्रिकेट टीम में कितने खिलाड़ी होते हैं?" },
    options: {
      en: ["11", "9", "15", "As many as fit in an auto"],
      ta: ["11", "9", "15", "ஒரு ஆட்டோவில் எத்தனை பேர் அடங்குவாங்களோ அத்தனை"],
      hi: ["11", "9", "15", "जितने एक ऑटो में आ जाएँ"],
    },
  },
  {
    id: "spo-olympics",
    cat: "sports",
    q: { en: "How many rings are on the Olympic flag?", ta: "ஒலிம்பிக் கொடியில் எத்தனை வளையங்கள் உள்ளன?", hi: "ओलंपिक झंडे पर कितने छल्ले होते हैं?" },
    options: {
      en: ["5", "4", "6", "7 onion rings"],
      ta: ["5", "4", "6", "7 வெங்காய வடை"],
      hi: ["5", "4", "6", "7 प्याज़ के छल्ले"],
    },
  },
  {
    id: "spo-football",
    cat: "sports",
    q: { en: "In football (soccer), which player may use their hands?", ta: "கால்பந்தில் கையை பயன்படுத்தக்கூடிய வீரர் யார்?", hi: "फ़ुटबॉल में कौन सा खिलाड़ी हाथ इस्तेमाल कर सकता है?" },
    options: {
      en: ["Goalkeeper", "Striker", "Referee's cousin", "Midfielder"],
      ta: ["கோல்கீப்பர்", "ஸ்ட்ரைக்கர்", "நடுவரின் சொந்தக்காரர்", "மிட்ஃபீல்டர்"],
      hi: ["गोलकीपर", "स्ट्राइकर", "रेफ़री का भतीजा", "मिडफ़ील्डर"],
    },
  },
  {
    id: "spo-chess",
    cat: "sports",
    q: { en: "Which chess piece can only move diagonally?", ta: "சதுரங்கத்தில் குறுக்காக மட்டுமே நகரும் காய் எது?", hi: "शतरंज का कौन सा मोहरा सिर्फ़ तिरछा चलता है?" },
    options: {
      en: ["Bishop", "Rook", "Knight", "The one who is tired"],
      ta: ["மந்திரி (பிஷப்)", "யானை (ரூக்)", "குதிரை", "சோர்ந்து போனது"],
      hi: ["ऊँट (बिशप)", "हाथी (रूक)", "घोड़ा", "जो थक गया हो"],
    },
  },
  {
    id: "spo-marathon",
    cat: "sports",
    q: { en: "About how long is a marathon?", ta: "ஒரு மாரத்தான் தோராயமாக எவ்வளவு தூரம்?", hi: "एक मैराथन लगभग कितनी लंबी होती है?" },
    options: {
      en: ["42 km", "10 km", "100 km", "Fridge to sofa and back"],
      ta: ["42 கி.மீ", "10 கி.மீ", "100 கி.மீ", "ஃப்ரிட்ஜ் முதல் சோஃபா வரை"],
      hi: ["42 किमी", "10 किमी", "100 किमी", "फ्रिज से सोफ़े तक और वापस"],
    },
  },
  {
    id: "spo-badminton",
    cat: "sports",
    q: { en: "What is hit over the net in badminton?", ta: "பேட்மிண்டனில் வலையின் மேல் அடிக்கப்படுவது என்ன?", hi: "बैडमिंटन में नेट के ऊपर क्या मारा जाता है?" },
    options: {
      en: ["Shuttlecock", "Tennis ball", "Puck", "A very surprised pigeon"],
      ta: ["இறகுப்பந்து (ஷட்டில்)", "டென்னிஸ் பந்து", "பக்", "ரொம்ப ஆச்சரியப்பட்ட புறா"],
      hi: ["शटलकॉक", "टेनिस बॉल", "पक", "एक बहुत हैरान कबूतर"],
    },
  },
  // ---------------- Geography ----------------
  {
    id: "geo-ocean",
    cat: "geography",
    q: { en: "What is the largest ocean on Earth?", ta: "பூமியின் மிகப்பெரிய கடல் எது?", hi: "पृथ्वी का सबसे बड़ा महासागर कौन सा है?" },
    options: {
      en: ["Pacific", "Atlantic", "Indian", "The office water cooler"],
      ta: ["பசிபிக்", "அட்லாண்டிக்", "இந்தியப் பெருங்கடல்", "ஆபீஸ் வாட்டர் கேன்"],
      hi: ["प्रशांत", "अटलांटिक", "हिंद", "ऑफ़िस का वॉटर कूलर"],
    },
  },
  {
    id: "geo-capital-japan",
    cat: "geography",
    q: { en: "What is the capital of Japan?", ta: "ஜப்பானின் தலைநகரம் எது?", hi: "जापान की राजधानी क्या है?" },
    options: {
      en: ["Tokyo", "Kyoto", "Osaka", "Sushi City"],
      ta: ["டோக்கியோ", "கியோட்டோ", "ஒசாகா", "சுஷி நகரம்"],
      hi: ["टोक्यो", "क्योटो", "ओसाका", "सुशी नगर"],
    },
  },
  {
    id: "geo-desert",
    cat: "geography",
    q: { en: "Which is the largest hot desert in the world?", ta: "உலகின் மிகப்பெரிய வெப்ப பாலைவனம் எது?", hi: "दुनिया का सबसे बड़ा गर्म रेगिस्तान कौन सा है?" },
    options: {
      en: ["Sahara", "Thar", "Gobi", "Dessert (the sweet one) 🍰"],
      ta: ["சஹாரா", "தார்", "கோபி", "பாயசம் பாலைவனம் 🍮"],
      hi: ["सहारा", "थार", "गोबी", "हलवा रेगिस्तान 🍮"],
    },
  },
  {
    id: "geo-river",
    cat: "geography",
    q: { en: "Which river flows through Varanasi?", ta: "வாரணாசி வழியாக ஓடும் நதி எது?", hi: "वाराणसी से कौन सी नदी बहती है?" },
    options: {
      en: ["Ganga", "Kaveri", "Narmada", "The river of tea ☕"],
      ta: ["கங்கை", "காவேரி", "நர்மதா", "டீ நதி ☕"],
      hi: ["गंगा", "कावेरी", "नर्मदा", "चाय की नदी ☕"],
    },
  },
  {
    id: "geo-continents",
    cat: "geography",
    q: { en: "How many continents are there?", ta: "எத்தனை கண்டங்கள் உள்ளன?", hi: "कितने महाद्वीप हैं?" },
    options: {
      en: ["7", "5", "9", "One, if you squint"],
      ta: ["7", "5", "9", "கண்ணை சுருக்கி பார்த்தா ஒண்ணு"],
      hi: ["7", "5", "9", "आँखें सिकोड़ो तो एक"],
    },
  },
  {
    id: "geo-mountain",
    cat: "geography",
    q: { en: "What is the highest mountain in the world?", ta: "உலகின் மிக உயரமான மலை எது?", hi: "दुनिया का सबसे ऊँचा पहाड़ कौन सा है?" },
    options: {
      en: ["Mount Everest", "K2", "Kilimanjaro", "Mount Laundry 🧺"],
      ta: ["எவரெஸ்ட் சிகரம்", "K2", "கிளிமஞ்சாரோ", "துவைக்காத துணி மலை 🧺"],
      hi: ["माउंट एवरेस्ट", "K2", "किलिमंजारो", "कपड़ों का पहाड़ 🧺"],
    },
  },
  // ---------------- Tech ----------------
  {
    id: "tech-cpu",
    cat: "tech",
    q: { en: "What does CPU stand for?", ta: "CPU என்பதன் விரிவாக்கம் என்ன?", hi: "CPU का पूरा नाम क्या है?" },
    options: {
      en: ["Central Processing Unit", "Computer Power Unit", "Central Print Utility", "Cute Purple Unicorn 🦄"],
      ta: ["Central Processing Unit", "Computer Power Unit", "Central Print Utility", "Cute Purple Unicorn 🦄"],
      hi: ["Central Processing Unit", "Computer Power Unit", "Central Print Utility", "Cute Purple Unicorn 🦄"],
    },
  },
  {
    id: "tech-www",
    cat: "tech",
    q: { en: "What does 'www' stand for in a web address?", ta: "இணைய முகவரியில் 'www' என்பதன் அர்த்தம் என்ன?", hi: "वेब पते में 'www' का मतलब क्या है?" },
    options: {
      en: ["World Wide Web", "Wild Wild West", "Wireless Web Window", "Wow Wow Wow"],
      ta: ["World Wide Web", "Wild Wild West", "Wireless Web Window", "வாவ் வாவ் வாவ்"],
      hi: ["World Wide Web", "Wild Wild West", "Wireless Web Window", "वाह वाह वाह"],
    },
  },
  {
    id: "tech-binary",
    cat: "tech",
    q: { en: "Binary code uses which two digits?", ta: "பைனரி குறியீடு எந்த இரண்டு எண்களை பயன்படுத்துகிறது?", hi: "बाइनरी कोड कौन से दो अंक इस्तेमाल करता है?" },
    options: {
      en: ["0 and 1", "1 and 2", "0 and 9", "😀 and 😢"],
      ta: ["0 மற்றும் 1", "1 மற்றும் 2", "0 மற்றும் 9", "😀 மற்றும் 😢"],
      hi: ["0 और 1", "1 और 2", "0 और 9", "😀 और 😢"],
    },
  },
  {
    id: "tech-mouse",
    cat: "tech",
    q: { en: "Which device is used to move the pointer on a computer screen?", ta: "கணினி திரையில் பாயிண்டரை நகர்த்த பயன்படும் சாதனம் எது?", hi: "कंप्यूटर स्क्रीन पर पॉइंटर हिलाने के लिए क्या इस्तेमाल होता है?" },
    options: {
      en: ["Mouse", "Printer", "Speaker", "A very small cat 🐈"],
      ta: ["மவுஸ்", "பிரிண்டர்", "ஸ்பீக்கர்", "ஒரு குட்டி பூனை 🐈"],
      hi: ["माउस", "प्रिंटर", "स्पीकर", "एक छोटी सी बिल्ली 🐈"],
    },
  },
  {
    id: "tech-ram",
    cat: "tech",
    q: { en: "What does RAM stand for?", ta: "RAM என்பதன் விரிவாக்கம் என்ன?", hi: "RAM का पूरा नाम क्या है?" },
    options: {
      en: ["Random Access Memory", "Read Any Movie", "Really Awesome Machine", "Rapid Apple Mixer"],
      ta: ["Random Access Memory", "Read Any Movie", "Really Awesome Machine", "Rapid Apple Mixer"],
      hi: ["Random Access Memory", "Read Any Movie", "Really Awesome Machine", "Rapid Apple Mixer"],
    },
  },
  {
    id: "tech-email",
    cat: "tech",
    q: { en: "Which symbol is always in an email address?", ta: "மின்னஞ்சல் முகவரியில் எப்போதும் இருக்கும் குறியீடு எது?", hi: "ईमेल पते में हमेशा कौन सा चिह्न होता है?" },
    options: {
      en: ["@", "#", "&", "🍕"],
      ta: ["@", "#", "&", "🍕"],
      hi: ["@", "#", "&", "🍕"],
    },
  },
  // ---------------- Funny (silly but answerable) ----------------
  {
    id: "fun-spider",
    cat: "funny",
    q: { en: "How many legs does a spider have... if it is NOT wearing shoes?", ta: "ஒரு சிலந்திக்கு எத்தனை கால்கள்... அது ஷூ போடாத போது?", hi: "एक मकड़ी के कितने पैर होते हैं... जब उसने जूते न पहने हों?" },
    options: {
      en: ["8", "6", "10", "Depends on the shoe sale"],
      ta: ["8", "6", "10", "ஷூ ஆஃபர் பொறுத்து"],
      hi: ["8", "6", "10", "जूतों की सेल पर निर्भर"],
    },
  },
  {
    id: "fun-feathers",
    cat: "funny",
    q: { en: "What is heavier: 1 kg of feathers or 1 kg of bricks?", ta: "எது கனமானது: 1 கிலோ இறகுகளா அல்லது 1 கிலோ செங்கற்களா?", hi: "क्या भारी है: 1 किलो पंख या 1 किलो ईंटें?" },
    options: {
      en: ["Both weigh the same", "The bricks", "The feathers", "My school bag"],
      ta: ["இரண்டும் ஒரே எடை", "செங்கற்கள்", "இறகுகள்", "என் ஸ்கூல் பேக்"],
      hi: ["दोनों बराबर", "ईंटें", "पंख", "मेरा स्कूल बैग"],
    },
  },
  {
    id: "fun-month",
    cat: "funny",
    q: { en: "Which month has 28 days?", ta: "எந்த மாதத்தில் 28 நாட்கள் உள்ளன?", hi: "किस महीने में 28 दिन होते हैं?" },
    options: {
      en: ["All of them", "Only February", "None", "The month my salary arrives"],
      ta: ["எல்லா மாதங்களிலும்", "பிப்ரவரி மட்டும்", "எதிலும் இல்ல", "சம்பளம் வர்ற மாசம்"],
      hi: ["सभी महीनों में", "सिर्फ़ फ़रवरी", "किसी में नहीं", "जिस महीने सैलरी आती है"],
    },
  },
  {
    id: "fun-cow",
    cat: "funny",
    q: { en: "What do cows drink?", ta: "மாடுகள் என்ன குடிக்கும்?", hi: "गाय क्या पीती है?" },
    options: {
      en: ["Water", "Milk", "Milkshake", "Cold coffee"],
      ta: ["தண்ணீர்", "பால்", "மில்க் ஷேக்", "கோல்ட் காபி"],
      hi: ["पानी", "दूध", "मिल्कशेक", "कोल्ड कॉफ़ी"],
    },
  },
  {
    id: "fun-keys",
    cat: "funny",
    q: { en: "What has keys but can't open any doors?", ta: "சாவிகள் (keys) இருக்கு ஆனா எந்த கதவையும் திறக்க முடியாது - அது என்ன?", hi: "किसके पास 'कीज़' होती हैं पर कोई दरवाज़ा नहीं खुलता?" },
    options: {
      en: ["A piano 🎹", "A locksmith on holiday", "A banana", "A cloud"],
      ta: ["பியானோ 🎹", "லீவுல இருக்கும் பூட்டு ரிப்பேர்காரர்", "வாழைப்பழம்", "மேகம்"],
      hi: ["पियानो 🎹", "छुट्टी पर गया ताले वाला", "केला", "बादल"],
    },
  },
  {
    id: "fun-brainy",
    cat: "funny",
    q: { en: "What is Brainy's favourite snack?", ta: "Brainy-க்கு பிடித்த ஸ்நாக் எது?", hi: "Brainy का पसंदीदा स्नैक क्या है?" },
    options: {
      en: ["Brain-flakes 🥣", "Rocks", "Socks", "Homework"],
      ta: ["மூளை-ஃப்ளேக்ஸ் 🥣", "கற்கள்", "சாக்ஸ்", "ஹோம்வொர்க்"],
      hi: ["ब्रेन-फ़्लेक्स 🥣", "पत्थर", "मोज़े", "होमवर्क"],
    },
  },
];

export interface QuizRoundQuestion {
  question: QuizQuestion;
  /** order[i] = original option index shown at position i. */
  order: number[];
}

/** 10 questions: 2 per category, category order shuffled, options shuffled. */
export function buildQuizRound(rand: () => number = Math.random): QuizRoundQuestion[] {
  const picked: QuizQuestion[] = [];
  for (const cat of QUIZ_CATEGORIES) {
    picked.push(...shuffle(QUESTIONS.filter((q) => q.cat === cat), rand).slice(0, 2));
  }
  return shuffle(picked, rand).map((question) => ({ question, order: shuffle([0, 1, 2, 3], rand) }));
}

/** Points for a correct answer: 100 base + up to 50 speed bonus. */
export function quizPoints(secondsLeft: number, limit: number): number {
  return 100 + Math.round((Math.max(0, secondsLeft) / limit) * 50);
}
