// SeedIman — Tawheed Level 7: The Messenger and His Message (Unit 4 of the Saudi Grade 1 second semester, lessons 7 and 8, pages 24 to 27).
// English leads, in Register 2. Arabic comes only from the book's pages, copied exactly as the content file gives it.
// Open in the content file: the evidence for Panel 5 (see evidencePending), the dhikr's reference numbers (Ahmad 4/337,
// Tirmidhi 3389, Ibn Majah 3870, to be confirmed from the print, so the app names the reporters only), and the English choices
// for عبد من عباد الله and the two sentences about being sent to all people and calling them to worship Allah alone.
// Interface copy written here uses no hyphens or dashes.
import type { ImmersiveLesson, SceneCue } from './lessonTypes';

// the book's lines, as printed
const SECOND_HALF = 'مُحَمَّدٌ رَسُولُ اللهِ';
const WHO_TAUGHT = 'مَنْ عَلَّمَنَا دِينَ الْإِسْلَامِ؟';
const NAME = 'نَبِيُّ مُحَمَّدُ بْنُ عَبْدِ اللهِ بْنِ عَبْدِ الْمُطَّلِبِ ﷺ';
const NAME_EN = 'Our Prophet Muhammad ﷺ, son of Abdullah, son of Abdul Muttalib.';
const SENT = 'أَرْسَلَهُ اللهُ إِلَى جَمِيعِ النَّاسِ';
const SENT_EN = 'Allah sent him to all people.';
const CALL = 'لِيَدْعُوَهُمْ إِلَى عِبَادَةِ اللهِ وَحْدَهُ وَتَرْكِ عِبَادَةِ غَيْرِهِ';
const CALL_EN = 'To call them to worship Allah alone and to leave the worship of anyone else.';
const OBEY = 'فَمَنْ أَطَاعَ الرَّسُولَ ﷺ دَخَلَ الْجَنَّةَ وَمَنْ عَصَى دَخَلَ النَّارَ';
const OBEY_EN = 'Whoever obeys the Messenger ﷺ enters Paradise, and whoever disobeys enters the Fire.';
const SLAVE = 'نَبِيِّي مُحَمَّدٌ ﷺ عَبْدٌ مِنْ عِبَادِ اللهِ';
const SLAVE_EN = 'My Prophet Muhammad ﷺ is a slave among Allah’s slaves.';
const BEST = 'نَبِيِّي مُحَمَّدٌ ﷺ أَفْضَلُ الْبَشَرِ';
const BEST_EN = 'My Prophet Muhammad ﷺ is the best of mankind.';
const LAST = 'نَبِيِّي مُحَمَّدٌ ﷺ آخِرُ الرُّسُلِ';
const LAST_EN = 'My Prophet Muhammad ﷺ is the last of the messengers.';
const LOVE = 'أَنَا أُحِبُّ نَبِيِّي مُحَمَّدًا ﷺ';
const DHIKR = 'رَضِيتُ بِاللهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ ﷺ نَبِيًّا';
const DHIKR_EN = 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.';

/** Level 6 closed on the house of five pillars glowing steady; Level 7 opens on that same house */
const OPEN: SceneCue = { glow: 1.2, settled: true, lift: 0, land: 1, wide: true, tree: 0, birds: true, time: 'dawn', shot: 'houseLow', town: false, worship: 0, windows: 0, house: true, pillars: 5, pillarsLit: 5, roof: 2, parts: 0, city: false, trail: 0, marks: 0, trailFull: false };

export const TAWHEED_7: ImmersiveLesson = {
  id: 'tawheed-7', level: 7, topic: 'Tawheed', title: 'The Messenger and His Message', minutes: 15,

  pillars: [
    {
      key: 'taught', icon: { img: 'art/tawheed7/icon-book.jpg' },
      qEn: 'Who taught us?',
      aAr: NAME, aEn: 'Our Prophet is Muhammad ﷺ, son of Abdullah, son of Abdul Muttalib.',
      lines: [
        { lead: 'Because', en: 'Islam did not appear out of nowhere in our lives. Someone taught it, and that person was a real man, from a real family, at a real time.' },
        { lead: 'Try it', kind: 'turn', en: 'Say his full name, son of Abdullah, son of Abdul Muttalib, and finish it with ﷺ.' },
      ],
    },
    {
      key: 'everyone', icon: { img: 'art/tawheed7/icon-globe.jpg' },
      qEn: 'Sent to everyone',
      aAr: SENT, aEn: 'Allah sent him to all people, everywhere.',
      lines: [
        { lead: 'Because', en: 'Earlier prophets were sent to their own communities. He was sent to everyone, in every place, for the rest of time. That includes you.' },
        { lead: 'What he called people to', ar: CALL, en: `${CALL_EN} This is the same call every prophet came with, back to Level 5.` },
        { lead: 'Try it', kind: 'turn', en: 'In one sentence, what was he sent to tell people?' },
      ],
    },
    {
      // the content file gives no art prompt for this panel, so it uses a drawn icon
      key: 'obey', icon: 'orb',
      qEn: 'Obeying him',
      aAr: OBEY, aEn: OBEY_EN,
      lines: [
        { lead: 'Because', en: 'He did not choose his own teachings. He passed on what Allah revealed to him, so obeying him means obeying Allah.' },
        { lead: 'Try it', kind: 'turn', ar: LOVE, en: 'Finish this sentence in your own words: “I love my Prophet Muhammad ﷺ because...”' },
      ],
    },
    {
      key: 'slave', icon: { img: 'art/tawheed7/icon-lantern.jpg' },
      word: { ar: 'عَبْدٌ', tr: 'abd', en: 'a slave, someone fully owned by and answerable to Allah.' },
      qEn: 'A slave of Allah',
      aAr: SLAVE, aEn: SLAVE_EN,
      lines: [
        { lead: 'Because', en: 'This matters. He was a man, not divine, not to be worshipped or prayed to. He himself asked to be described as a slave of Allah and His Messenger, in that order, so we never place him where only Allah belongs.' },
        { lead: 'Held together', en: 'Being a slave of Allah does not make him ordinary. He is still the best of mankind, still loved, still obeyed, still ﷺ after his name every time.' },
        { lead: 'Try it', kind: 'turn', en: 'Why do you think it matters that he called himself a slave of Allah first, and Messenger second?' },
      ],
    },
    {
      key: 'last', icon: { img: 'art/tawheed7/icon-seal.jpg' },
      qEn: 'Best of mankind, last of the messengers',
      aEn: 'My Prophet Muhammad ﷺ is the best of mankind, and the last of the messengers.',
      lines: [
        { kind: 'name', ar: BEST, en: BEST_EN },
        { kind: 'name', ar: LAST, en: LAST_EN },
        { lead: 'Because', en: 'Allah sent many messengers before him. He is the last one, so no prophet comes after him, and his message stays complete for everyone until the end of time.' },
        { lead: 'Try it', kind: 'turn', en: 'If he is the last messenger, what does that mean for how carefully we should learn what he taught?' },
        { lead: 'The daily dhikr', kind: 'promise', ar: DHIKR, en: DHIKR_EN, note: 'Try it, every morning and evening. Say this three times.' },
        { lead: 'Where do we know this from?', en: 'Reported by Ahmad, Tirmidhi and Ibn Majah.' },
      ],
      // to fill: delete this line and add `evidence:` with the ayah or hadith, as the other cards do
      evidencePending: 'Evidence placeholder. An ayah or hadith naming him as the last of the messengers or the best of mankind goes here. Not shown in the live app.',
    },
  ],

  presentation: {
    predict: 'What do you think?',
    start: OPEN,
    beats: [
      { k: 'say', lines: ['There is no deity worthy of worship except Allah. That is the first half of what a Muslim declares. There is a second half.'] },
      { k: 'state', ar: SECOND_HALF, en: 'Muhammad ﷺ is the Messenger of Allah.' },
      { k: 'say', lines: ['Nobody worked this out alone. Someone taught it to us.'], cue: { shot: 'city', city: true, trail: 2 } },
      { k: 'ask', qAr: WHO_TAUGHT, qEn: 'Who taught us the religion of Islam?', aAr: NAME, aEn: NAME_EN },
      { k: 'say', lines: ['He was not sent to one town, or one people. He was sent to everyone.'], cue: { trail: 7 } },
      { k: 'state', ar: SENT, en: SENT_EN, cue: { trail: 10 } },
      { k: 'say', lines: ['And what he asked of every one of them was the same thing we have been learning since Level 1.'] },
      { k: 'state', ar: CALL, en: CALL_EN },
      { k: 'state', ar: OBEY, en: OBEY_EN },
      { k: 'say', lines: ['So who was he? Not someone to be worshipped. A man Allah chose, and honoured above every other man.'], cue: { trail: 12 } },
      { k: 'state', ar: SLAVE, en: SLAVE_EN },
      { k: 'state', ar: BEST, en: BEST_EN },
      { k: 'state', ar: LAST, en: LAST_EN, cue: { trail: 14, trailFull: true, glow: 1.5 } },
    ],
  },

  reading: {
    title: 'Aisha’s Grandmother Asks a Question',
    paras: [
      { parts: [{ text: 'One evening Aisha’s grandmother asked her, “Who taught you everything you know about Allah and Islam?”' }] },
      { parts: [
        { text: 'Aisha thought about it properly before answering. She had learned it from her mum, and her teacher, and this app. But none of them made it up. ' },
        { tap: 'Our Prophet Muhammad ﷺ, son of Abdullah, son of Abdul Muttalib,', note: 'ﷺ is said after his name every time, as a sign of honour and respect.' },
        { text: ' is the one who first taught it, and everyone since has been passing it on.' },
      ] },
      { parts: [
        { text: '“And why should that matter to me,” her grandmother asked, “here, so far from where he lived?” Aisha smiled, because she knew this one. ' },
        { tap: 'Allah sent him to all people, everywhere, not only to the people of his own town.', note: 'Earlier prophets were sent to their own communities. He was sent to the whole world.' },
      ] },
      { parts: [
        { text: 'Her grandmother asked one more question, a harder one. “Do Muslims worship him, then?” Aisha shook her head firmly. ' },
        { tap: SLAVE_EN, note: 'He himself asked to be called a slave of Allah and His Messenger, in that order.' },
        { text: ' He is loved, and obeyed, and the best of mankind, but worship belongs to Allah alone.' },
      ] },
      { parts: [{ text: 'Aisha’s grandmother nodded slowly. “That is a careful answer,” she said. “Keep learning it that carefully.”' }] },
      { parts: [
        { text: 'That night, before Aisha slept, she said what her lesson had taught her, three times, the way she does every morning and evening. ' },
        { tap: DHIKR, note: `It means, ${DHIKR_EN}` },
      ] },
    ],
    remember: [
      { ar: NAME, en: NAME_EN },
      { ar: SENT, en: SENT_EN },
      { ar: SLAVE, en: SLAVE_EN },
      { ar: DHIKR, en: DHIKR_EN },
    ],
  },

  activities: [
    { k: 'match', title: 'Match the Book’s Columns', hint: 'Drag a line from each answer to the words it belongs with.', arabic: true,
      pairs: [
        ['مُحَمَّدُ بْنُ عَبْدِ اللهِ بْنِ عَبْدِ الْمُطَّلِبِ', 'اسْمُ نَبِيِّي'],
        ['جَمِيعُ النَّاسِ', 'أَرْسَلَهُ اللهُ لِيَدْعُوَ إِلَى'],
        ['عِبَادَةُ اللهِ وَحْدَهُ وَتَرْكُ عِبَادَةِ غَيْرِهِ', 'لِأَنَّهُ عَلَّمَنَا دِينَ الْإِسْلَامِ'],
      ],
      meanings: {
        'مُحَمَّدُ بْنُ عَبْدِ اللهِ بْنِ عَبْدِ الْمُطَّلِبِ': 'His name: Muhammad ﷺ, son of Abdullah, son of Abdul Muttalib.',
        'جَمِيعُ النَّاسِ': 'Who he was sent to: all people.',
        'عِبَادَةُ اللهِ وَحْدَهُ وَتَرْكُ عِبَادَةِ غَيْرِهِ': 'What he called people to: to worship Allah alone and to leave the worship of anyone else.',
      } },
    { k: 'wordbank', title: 'Complete the Answer', hint: 'Drag each word into the sentence where it belongs. Each word is used once.', arabic: true,
      items: [
        { before: 'مَنْ أَطَاعَ الرَّسُولَ ﷺ دَخَلَ', after: '.', answer: 'الْجَنَّةَ' },
        { before: 'مَنْ عَصَى', after: 'دَخَلَ النَّارَ.', answer: 'الرَّسُولَ' },
        { before: 'نَبِيِّي مُحَمَّدٌ ﷺ', after: 'الرُّسُلِ.', answer: 'آخِرُ' },
      ] },
    { k: 'choose', title: 'Which Comes First?', hint: 'Read each question and choose the answer.',
      items: [
        { q: 'My Prophet Muhammad ﷺ is which of the messengers?', options: ['First of the messengers', 'Last of the messengers'], answer: 1 },
        { q: 'When he called people to worship Allah alone, was he starting something new, or continuing what every prophet before him taught?', options: ['Starting something new', 'Continuing what every prophet taught'], answer: 1 },
      ] },
    { k: 'listen', title: 'Listen and Choose', hint: 'Listen to the question, then choose the sentence that answers it.',
      items: [{ qAr: WHO_TAUGHT, aAr: NAME }], others: [SENT, SLAVE] },
    { k: 'arabic', title: 'Arabic and English', hint: 'Drag a line from each Arabic line to its meaning.', sample: 4,
      pairs: [[NAME, NAME_EN], [SENT, SENT_EN], [OBEY, OBEY_EN], [SLAVE, SLAVE_EN], [BEST, BEST_EN], [LAST, LAST_EN]] },
    { k: 'speak', title: 'Speak', hint: 'Record your answer, then play it back.',
      items: [
        { prompt: 'A friend asks who Muhammad ﷺ was and why he matters to you. Explain in your own words.', seconds: 45 },
        { prompt: 'Say the daily dhikr three times.', modelAr: DHIKR, seconds: 40 },
      ] },
    { k: 'moments', title: 'A Day With the Prophet’s Guidance', hint: 'Take your time. There is no score and no end.', aspect: 1600 / 894,
      intro: 'Tap each moment in this day. Each one connects to something Prophet Muhammad ﷺ taught.',
      image: 'art/tawheed7/day.jpg', alt: 'One girl’s day in six scenes, from morning to bedtime: greeting her family, telling the truth, being kind to a neighbour, praying on time, being patient with her sister, and saying the daily dhikr by the window',
      line: 'Everything you have learned traces back to what he taught us.',
      spots: [
        { id: 'greeting', label: 'Greeting her family', line: 'Prophet Muhammad ﷺ taught us to spread salam.', box: [0, 0, 16.66, 100] },
        { id: 'truth', label: 'Telling the truth', line: 'Prophet Muhammad ﷺ taught us to tell the truth, even about something small.', box: [16.66, 0, 16.66, 100] },
        { id: 'neighbour', label: 'Kind to a neighbour', line: 'Prophet Muhammad ﷺ taught us to be good to our neighbours.', box: [33.33, 0, 16.66, 100] },
        { id: 'prayer', label: 'Praying on time', line: 'Prophet Muhammad ﷺ taught us to pray on time.', box: [50, 0, 16.66, 100] },
        { id: 'patience', label: 'Patient with her sister', line: 'Prophet Muhammad ﷺ taught us to be patient and gentle with our family.', box: [66.66, 0, 16.66, 100] },
        { id: 'dhikr', label: 'The daily dhikr', line: 'Prophet Muhammad ﷺ taught us to remember Allah every morning and evening.', box: [83.33, 0, 16.67, 100] },
      ] },
  ],

  quickCheck: {
    scene: { glow: 0.9, settled: true, lift: 0, land: 0.55, wide: true, tree: 0, birds: false, time: 'dawn', shot: 'city', town: false, worship: 0, windows: 0, house: false, pillars: 0, pillarsLit: 0, roof: 0, parts: 0, city: true, trail: 14, marks: 0, trailFull: false },
    final: { glow: 1.45, settled: true, marks: 3, trailFull: true },
    path: true,
    questions: [
      { qEn: 'Who is our Prophet, and who was he sent to?', aEn: 'Muhammad ﷺ, son of Abdullah, son of Abdul Muttalib. He was sent to all people.' },
      { qEn: 'What happens to whoever obeys the Messenger ﷺ, and what happens to whoever disobeys?', aEn: OBEY_EN },
      { qEn: 'Is Muhammad ﷺ divine, or a slave of Allah? What else is true about him?', aEn: 'He is a slave of Allah, the best of mankind, and the last of the messengers.' },
    ],
    badge: 'Level 7 Complete',
    summaryAr: [DHIKR],
    summaryEn: DHIKR_EN,
    summary: 'My Prophet is Muhammad ﷺ. He taught me my religion, he was sent to everyone, and I obey him because I love Allah.',
  },
};
