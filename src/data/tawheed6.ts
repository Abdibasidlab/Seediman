// SeedIman — Tawheed Level 6: The Religion of Islam (Unit 3 of the Saudi Grade 1 second semester, lessons 4 to 6, pages 16 to 21).
// English leads, in Register 2. Arabic comes only from the book's pages, Aal Imran 3:85 and the dua, copied exactly as the
// content file gives them. The book's own lines are written without vowel marks there, and are kept that way until the
// vowelled print is supplied; the ayah and the dua carry full vowel marks. Word meanings for the ayah: quran.com.
// Open in the content file: the evidence for Panel 1 (see evidencePending), the evidence on justice and kindness to all people
// (Panel 2), and the reference numbers for the hadith and the dua. A scholar's review of the framing of Panels 2 and 5 is requested.
// Interface copy written here uses no hyphens or dashes.
import type { Evidence, ImmersiveLesson, SceneCue } from './lessonTypes';

const AAL_IMRAN_85: Evidence = {
  audio: 'audio/quran/003085.mp3',
  words: [
    { ar: 'وَمَن', en: 'And whoever', t: 0.15 }, { ar: 'يَبْتَغِ', en: 'seeks', t: 1.35 }, { ar: 'غَيْرَ', en: 'other than', t: 1.9 }, { ar: 'الْإِسْلَامِ', en: 'Islam', t: 3 },
    { ar: 'دِينًا', en: 'as religion', t: 4.38 }, { ar: 'فَلَن', en: 'then never', t: 6.1, t2: 8.8 }, { ar: 'يُقْبَلَ', en: 'will it be accepted', t: 7, t2: 10.5 }, { ar: 'مِنْهُ', en: 'from him', t: 8.1, t2: 11.3 },
    { ar: 'وَهُوَ', en: 'and he', t: 12.1 }, { ar: 'فِي', en: 'in', t: 12.9 }, { ar: 'الْآخِرَةِ', en: 'the Hereafter', t: 13.35 }, { ar: 'مِنَ', en: 'will be among', t: 14.55 },
    { ar: 'الْخَاسِرِينَ', en: 'the losers', t: 15.05 },
  ],
  en: '“And whoever seeks a religion other than Islam, it will never be accepted from him, and in the Hereafter he will be among the losers.”',
  ref: 'Surah Aal Imran, 3:85',
};

const FIVE_PILLARS_HADITH: Evidence = {
  text: 'قال رسول الله ﷺ: «بني الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمدًا رسول الله، وإقام الصلاة، وإيتاء الزكاة، وصوم رمضان، وحج البيت».',
  words: [],
  en: 'The Messenger of Allah ﷺ said: “Islam is built on five: the testimony that there is no deity worthy of worship except Allah and that Muhammad ﷺ is the Messenger of Allah, establishing prayer, giving zakat, fasting Ramadan, and Hajj to the House.”',
  ref: 'Reported by al Bukhari, Muslim and al Tirmidhi',
};

// the book's lines, as printed
const DEFINITION = 'الإسلام هو: الاستسلام لله بالتوحيد، والانقياد له بالطاعة، والبراءة من الشرك وأهله.';
const DEFINITION_EN = 'Islam is to submit to Allah by tawhid, to yield to Him by obeying Him, and to disown shirk and its people.';
const PILLARS: [string, string][] = [
  ['شهادة أن لا إله إلا الله وأن محمدًا رسول الله', 'The testimony that there is no deity worthy of worship except Allah and that Muhammad ﷺ is the Messenger of Allah.'],
  ['إقام الصلاة', 'Establishing prayer.'],
  ['إيتاء الزكاة', 'Giving zakat.'],
  ['صوم رمضان', 'Fasting Ramadan.'],
  ['حج البيت', 'Hajj to the House.'],
];
const FALSE_LINE = 'كل دين غير الإسلام باطل.';
const MUSLIM_LINE = 'أنا مسلم لا أقبل غير الإسلام دينًا.';
const MUSLIM_EN = 'I am a Muslim. I do not accept any religion other than Islam as my religion.';
const DUA = 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ';
const DUA_EN = 'O Turner of hearts, make my heart firm on Your religion.';
/** as the learner first met it in Level 1 */
const DEENI = 'دِينِي الإِسْلَامُ';

/** Level 5 closed with light across the neighbourhood; Level 6 starts there and rises to the whole horizon */
const OPEN: SceneCue = { glow: 1.2, settled: true, lift: 0, land: 1, wide: true, tree: 0, birds: true, time: 'dawn', shot: 'town', town: true, worship: 30, windows: 99, house: true, pillars: 0, pillarsLit: 0, roof: 0, parts: 0 };

export const TAWHEED_6: ImmersiveLesson = {
  id: 'tawheed-6', level: 6, topic: 'Tawheed', title: 'The Religion of Islam', minutes: 15,

  pillars: [
    {
      // placeholder icon: when the final image arrives, add it to public/art/tawheed6/ and change this one path
      key: 'guidance', icon: { img: 'art/tawheed6/icon-path.svg' },
      word: [
        { tr: 'Messenger', en: 'someone Allah chose to deliver His message to people.' },
        { tr: 'Submission', en: 'freely accepting Allah as Lord and following what He asks.' },
      ],
      qEn: 'Not left without guidance',
      aEn: 'Allah created us for a purpose, and He did not leave us without guidance. He sent messengers and gave us a way of life to follow.',
      lines: [
        { lead: 'Because', en: 'Level 5 taught that we were created to worship Allah alone. A purpose with no guidance would leave people guessing, and Allah, in His mercy, did not leave us guessing. He sent messenger after messenger to show us how.' },
        { lead: 'All the messengers', en: 'Allah sent messengers to every people, among them Nuh (Noah), Ibrahim (Abraham), Musa (Moses) and Isa (Jesus), and the last of them, Muhammad ﷺ. Peace be upon them all. Each one called people to the same thing: to worship Allah alone and to submit to Him. The details of their laws differed, but submission to Allah alone was the religion of every one of them. That submission has a name, and the next panel gives it.' },
        { lead: 'Try it', kind: 'turn', en: 'Name two messengers. What did every one of them call people to?' },
      ],
      // to fill: delete this line and add `evidence:` with the ayah or hadith, as the other cards do
      evidencePending: 'Evidence placeholder. The ayah or hadith goes here. Not shown in the live app.',
    },
    {
      key: 'islam', icon: { img: 'art/tawheed6/icon-door.jpg' },
      word: [
        { ar: 'الإسلام', tr: 'Islam', en: 'Submission to Allah.' },
        { ar: 'التوحيد', tr: 'tawhid', en: 'Believing that Allah alone is Lord and alone is worshipped.' },
        { ar: 'الطاعة', tr: 'ta’ah', en: 'Obedience.' },
        { ar: 'الشرك', tr: 'shirk', en: 'Worshipping or calling on anyone else together with Allah.' },
      ],
      qEn: 'What is Islam?',
      aAr: DEFINITION, aEn: DEFINITION_EN,
      lines: [
        { lead: 'Because', en: 'Levels 1 to 5 taught that Allah alone is Lord and alone deserves worship. So a Muslim submits to Him alone, obeys Him, and stays clear of shirk. This is the same submission every messenger practised, from Nuh to Muhammad ﷺ.' },
        { lead: 'A careful note on the last part', en: 'Disowning shirk and its people is about belief and worship. It does not mean we are unkind to anyone. Islam teaches fairness and kindness to every person.' },
        { lead: 'Try it', en: 'Each part of the definition has words that complete it. Tap each part to hear it.',
          chips: [
            { ar: 'الاستسلام لله بالتوحيد', en: 'Submit to Allah by tawhid.' },
            { ar: 'الانقياد له بالطاعة', en: 'Yield to Him by obeying Him.' },
            { ar: 'البراءة من الشرك وأهله', en: 'Disown shirk and its people.' },
          ] },
      ],
    },
    {
      key: 'pillars', icon: { img: 'art/tawheed6/icon-pillars.jpg' },
      qEn: 'What is Islam built on?',
      aEn: 'Islam is built on five pillars.',
      lines: [
        ...PILLARS.map(([ar, en]) => ({ kind: 'name' as const, ar, en })),
        { lead: 'Because', en: 'A building stands on its pillars, and it leans if one is missing. Each pillar holds up a different part of a Muslim’s life.' },
        { en: 'The testimony is the doorway into Islam. Prayer is our daily connection with Allah. Zakat is sharing part of our wealth with people in need.' },
        { en: 'Fasting in Ramadan trains self control and mindfulness of Allah. Hajj is the pilgrimage to His House in Makkah, for those who are able.' },
        { lead: 'Try it', kind: 'turn', en: 'Say the five pillars in the order the hadith gives them.' },
      ],
      evidence: FIVE_PILLARS_HADITH,
    },
    {
      key: 'halves', icon: 'orb',
      qEn: 'What are the two halves of the first pillar?',
      aEn: 'The first pillar has two halves.',
      lines: [
        { lead: 'The first half', ar: 'أن لا إله إلا الله', en: 'That there is no deity worthy of worship except Allah.' },
        { en: 'That is everything Levels 1 to 5 taught: He alone creates, provides, manages every affair, and deserves worship.' },
        { lead: 'The second half', ar: 'وأن محمدًا رسول الله', en: 'And that Muhammad ﷺ is the Messenger of Allah.' },
        { en: 'That is the next level, where we meet him.' },
        { lead: 'Try it', kind: 'turn', en: 'Say the first half in your own words, and give one reason from what you have learned.' },
      ],
    },
    {
      key: 'accepted', icon: { img: 'art/tawheed6/icon-compass.jpg' },
      qEn: 'Which religion does Allah accept?',
      aEn: 'Islam is the religion Allah accepts.',
      lines: [
        { ar: FALSE_LINE, en: 'Every religion other than Islam is false, meaning it is not the religion Allah accepts.' },
        { ar: MUSLIM_LINE, en: MUSLIM_EN },
        { lead: 'Because', en: 'Allah is our Lord, and He tells us which religion He accepts.' },
        { en: 'Holding this belief with confidence does not mean being unkind. Islam also asks for honesty, fairness and kindness toward everyone we meet, including classmates and neighbours of other faiths.' },
        { lead: 'Try it', kind: 'turn', en: 'A classmate asks, “Why do you believe your religion is the right one?” Build a short answer that is confident and kind.' },
      ],
      parentsNote: 'This card states a belief that some children may find hard to say to friends. The lesson pairs it with kindness and gives the child words to use. Please talk it through at home, in your own way.',
      evidence: AAL_IMRAN_85,
    },
    {
      key: 'firm', icon: { img: 'art/tawheed6/icon-heart.jpg' },
      qEn: 'Hearts can change. What do we ask Allah?',
      aAr: DUA, aEn: DUA_EN,
      lines: [
        { lead: 'Because', en: 'In Level 4 we learned that Allah manages every affair, and that includes hearts.' },
        { en: 'When you feel unsure, or when many opinions surround you, this is the dua to ask.' },
        { lead: 'Where do we know this from?', en: 'This dua is reported by Ahmad and al Tirmidhi.' },
        { lead: 'Try it', kind: 'turn', en: 'Learn the dua by heart, and choose one real moment this week when you will say it.' },
      ],
    },
  ],

  presentation: {
    predict: 'What do you think?',
    start: OPEN,
    beats: [
      { k: 'say', solo: true, cue: { shot: 'wide' }, lines: ['In the first levels we learned that Allah created us, provides for us, and manages every affair. And He did not create us and then leave us alone.', 'Allah gave us a purpose: to worship Him alone. And He did not leave us to work out how. He sent us messengers, and a way of life to follow.'] },
      { k: 'say', solo: true, lights: { line: 0, names: ['Nuh', 'Ibrahim', 'Musa', 'Isa', 'Muhammad'] }, lines: ['Nuh, called Noah in English. Ibrahim, Abraham. Musa, Moses. Isa, Jesus. And the last of them, Muhammad ﷺ. Peace be upon them all.', 'Different times, different places, different peoples. But one message. Every one of them called people to worship Allah alone, and to submit to Him.', 'Submitting to Allah and obeying Him alone was the religion of every messenger, from Nuh to Muhammad ﷺ. That submission has a name.'] },
      { k: 'state', ar: 'الإسلام', en: 'Islam. Submission to Allah.', sub: 'The religion of every messenger, from Nuh to Muhammad ﷺ.' },
      { k: 'say', lines: ['Islam is not only a word. It has three parts that fit together.'] },
      { k: 'list', adds: 'parts', speak: 'en', items: ['We believe that Allah alone is Lord and alone deserves worship.', 'We obey Him.', 'And we reject shirk, which is giving anyone a share in what belongs to Allah alone.'] },
      { k: 'say', lines: ['The Prophet ﷺ described Islam as a building. It stands on five pillars.'], cue: { shot: 'houseLow', parts: 0, messengers: 0 } },
      { k: 'list', adds: 'pillars', speak: 'ar', items: PILLARS.map(([ar]) => ar) },
      { k: 'say', lines: ['Allah tells us which religion He accepts. We hold to it with confidence.', 'And we treat every person we meet with fairness and kindness, because that is part of our religion too.'], cue: { roof: 1 } },
      { k: 'recite', evidence: AAL_IMRAN_85, cue: { shot: 'wide' } },
      { k: 'say', lines: ['Hearts can change. So we ask the One who turns hearts to keep ours firm.'] },
      { k: 'state', ar: DUA, en: DUA_EN, cue: { roof: 2, glow: 1.5 } },
    ],
  },

  reading: {
    title: 'Aisha and the New Girl',
    paras: [
      { parts: [{ text: 'On Monday a new girl called Maria joined Aisha’s class. At break she asked, “What exactly is Islam?” It was a big question for a Monday morning, so Aisha took a breath and answered it in parts.' }] },
      { parts: [{ tap: 'Islam means submitting to Allah: believing that He alone is Lord and alone deserves worship, obeying Him, and staying clear of shirk.', note: 'The Arabic word is الإسلام. It comes from the idea of submission.' }] },
      { parts: [
        { text: 'Maria asked what Muslims actually do. Aisha explained that the Prophet Muhammad ﷺ taught that ' },
        { tap: 'Islam is built on five pillars, like a house.', note: 'A building leans if a pillar is missing. That is why they are called pillars.' },
        { text: ' The testimony, prayer, zakat, fasting in Ramadan, and Hajj.' },
      ] },
      { parts: [
        { text: 'Then Maria asked something harder. “Do you think your religion is the right one?” Aisha’s heart beat a little faster. She told the truth, because honesty is part of her religion too. ' },
        { tap: 'She believes that Islam is the religion Allah accepts, and she holds to it with confidence.', note: 'Confidence and kindness go together. Islam asks for both.' },
        { text: ' Then she shared something she had just learned in her lesson. ' },
        { tap: 'Islam is the religion of every prophet Allah sent, from Nuh (Noah) to Muhammad ﷺ, peace be upon them all. Each one called people to worship Allah alone and to submit to Him.', note: 'Sharing what you know about Islam, politely and kindly, is called dawah. Even a young person can do it, by being honest, speaking gently and never pushing or arguing. Allah is the One who guides hearts. Our part is to share with kindness.' },
        { text: ' She said it gently, and added, because kindness is also part of her religion, that she would treat Maria fairly and kindly whatever she believed.' },
      ] },
      { parts: [{ text: 'Maria said she believed something different. They still sat together at lunch and talked about their favourite books. Nothing about their friendship changed.' }] },
      { parts: [
        { text: 'That evening Aisha thought about how easy it would be to feel unsure with so many opinions around her. So she said the dua from her lesson. ' },
        { tap: DUA, note: 'It means, O Turner of hearts, make my heart firm on Your religion.' },
      ] },
    ],
    remember: [
      { ar: DEENI, en: 'My religion is Islam.' },
      { ar: DEFINITION, en: DEFINITION_EN },
      { ar: DUA, en: DUA_EN },
    ],
  },

  activities: [
    { k: 'match', title: 'The Three Parts', hint: 'Drag a line from each part of the definition to the words that complete it.', arabic: true,
      pairs: [['الاستسلام لله', 'بالتوحيد'], ['الانقياد له', 'بالطاعة'], ['البراءة', 'من الشرك وأهله']],
      meanings: { 'الاستسلام لله': 'Submit to Allah by tawhid.', 'الانقياد له': 'Yield to Him by obeying Him.', 'البراءة': 'Disown shirk.' } },
    { k: 'order', title: 'Build the House', hint: 'Put the five pillars in the order the hadith gives them. A pillar rises for each one.', house: true,
      items: PILLARS.map(([ar]) => ar) },
    { k: 'match', title: 'Which Pillar?', hint: 'Drag a line from each moment to the pillar it belongs to.', sample: 4,
      pairs: [
        ['A person says the two testimonies and becomes a Muslim', 'The testimony'],
        ['A family faces the Kaaba and prays at fixed times through the day', 'Prayer'],
        ['A family gives a fixed part of its savings to people in need', 'Zakat'],
        ['A person goes without food and drink from dawn to sunset for a whole month', 'Fasting Ramadan'],
        ['People travel from around the world to the House of Allah in Makkah', 'Hajj'],
      ] },
    { k: 'wordbank', title: 'Complete the Answer', hint: 'Drag each word into the sentence where it belongs. Each word is used once.',
      items: [
        { before: 'Islam means submitting to Allah by', after: '.', answer: 'tawhid' },
        { before: 'The first pillar is the', after: '.', answer: 'testimony' },
        { before: 'Muslims fast in the month of', after: '.', answer: 'Ramadan' },
        { before: 'Hajj is the pilgrimage to the', after: 'in Makkah.', answer: 'House' },
      ] },
    { k: 'arabic', title: 'Arabic and English', hint: 'Drag a line from each Arabic line to its meaning.', sample: 4,
      pairs: [
        ['إقام الصلاة', 'Establishing prayer.'],
        ['إيتاء الزكاة', 'Giving zakat.'],
        ['صوم رمضان', 'Fasting Ramadan.'],
        ['حج البيت', 'Hajj to the House.'],
        [MUSLIM_LINE, MUSLIM_EN],
        [DUA, DUA_EN],
      ] },
    { k: 'speak', title: 'Speak', hint: 'Record your answer, then play it back.',
      items: [
        { prompt: 'A friend asks you what Islam means and what the five pillars are. Explain it in your own words.', seconds: 45 },
        { prompt: 'Say the dua for a firm heart.', modelAr: DUA, seconds: 15 },
      ] },
    { k: 'moments', title: 'A Year in the Life', hint: 'Take your time. There is no score and no end.', house: true, aspect: 1600 / 894,
      intro: 'Tap each moment in this year. Each one belongs to a pillar.',
      image: 'art/tawheed6/year.jpg', alt: 'A year of a Muslim life in five scenes: a man raising his finger in declaration, a man praying at dawn, a Ramadan evening under a crescent moon, a boy giving coins to charity, and pilgrims at the Kaaba',
      line: 'This is the house Islam is built on.',
      spots: [
        { id: 'testimony', pillar: 0, label: 'Saying the testimony', line: 'A person enters Islam by saying the testimony with belief, and Muslims repeat it in every prayer.', box: [0, 0, 20, 100] },
        { id: 'prayer', pillar: 1, label: 'Prayer at dawn', line: 'Five times every day a Muslim stops to pray, starting before sunrise with Fajr.', box: [20, 0, 20, 100] },
        { id: 'ramadan', pillar: 3, label: 'The month of Ramadan', line: 'In Ramadan, Muslims fast from dawn to sunset and break the fast in the evening.', box: [40, 0, 20, 100] },
        { id: 'zakat', pillar: 2, label: 'Giving zakat', line: 'Once a year, a Muslim who has enough wealth gives a set part of it to people in need.', box: [60, 0, 20, 100] },
        { id: 'hajj', pillar: 4, label: 'Hajj to the House', line: 'Every year, pilgrims from around the world come to the Kaaba in Makkah for Hajj.', box: [80, 0, 20, 100] },
      ] },
  ],

  quickCheck: {
    scene: { glow: 0.9, settled: true, lift: 0, land: 1, wide: true, tree: 0, birds: false, time: 'dawn', shot: 'house', town: false, worship: 0, windows: 0, house: true, pillars: 5, pillarsLit: 0, roof: 1, parts: 0 },
    final: { glow: 1.45, settled: true, pillarsLit: 5, roof: 2 },
    house: true,
    questions: [
      { qEn: 'What is Islam? Give its three parts.', aEn: 'Submitting to Allah by tawhid, yielding to Him by obeying Him, and disowning shirk.' },
      { qEn: 'Name the five pillars in order.', aEn: 'The testimony, prayer, zakat, fasting Ramadan and Hajj.' },
      { qEn: 'What dua do we say to ask Allah to keep our heart firm? Say it aloud.', aAr: DUA, aEn: DUA_EN },
    ],
    badge: 'Level 6 Complete',
    summaryAr: [DEENI, DUA],
    summary: 'My religion is Islam. Islam is submitting to Allah, and it stands on five pillars.',
  },
};
