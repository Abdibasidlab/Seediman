// SeedIman — Tawheed Level 4: Allah is My Lord (Control). The review of all three meanings of رَبِّيَ اللهُ.
// English leads. Arabic appears only for the Quran (Aal Imran 3:26–27, Yunus 10:31) and رَبِّيَ اللهُ from Level 1.
// Every Arabic word the content file gives is copied exactly; the middle of Yunus 10:31, which the file skips with an
// ellipsis, comes from the published text (alquran.cloud) so the ayah is complete. Word meanings: quran.com.
// Interface copy written here uses no hyphens or dashes.
import type { Evidence, ImmersiveLesson, SceneCue } from './lessonTypes';

const ALI_IMRAN_26: Evidence = {
  audio: 'audio/quran/003026.mp3',
  words: [
    { ar: 'قُلِ', en: 'Say', t: 0.15 }, { ar: 'اللَّهُمَّ', en: 'O Allah', t: 0.52 }, { ar: 'مَالِكَ', en: 'Owner', t: 2.24 }, { ar: 'الْمُلْكِ', en: 'of the Dominion', t: 3.31 },
    { ar: 'تُؤْتِي', en: 'You give', t: 4.36 }, { ar: 'الْمُلْكَ', en: 'the dominion', t: 5.17 }, { ar: 'مَنْ', en: 'to whom', t: 5.83 }, { ar: 'تَشَاءُ', en: 'You will', t: 6.83 },
    { ar: 'وَتَنْزِعُ', en: 'and You take away', t: 9.49 }, { ar: 'الْمُلْكَ', en: 'the dominion', t: 11.12 }, { ar: 'مِمَّنْ', en: 'from whom', t: 11.53 }, { ar: 'تَشَاءُ', en: 'You will', t: 12.6 },
    { ar: 'وَتُعِزُّ', en: 'and You honour', t: 16.2, t2: 21.61 }, { ar: 'مَنْ', en: 'whom', t: 17.3, t2: 22.43 }, { ar: 'تَشَاءُ', en: 'You will', t: 17.9, t2: 23.46 }, { ar: 'وَتُذِلُّ', en: 'and You humble', t: 25.3 },
    { ar: 'مَنْ', en: 'whom', t: 26.5 }, { ar: 'تَشَاءُ', en: 'You will', t: 27.46 }, { ar: 'بِيَدِكَ', en: 'In Your hand', t: 30 }, { ar: 'الْخَيْرُ', en: 'is all the good', t: 31.16 },
    { ar: 'إِنَّكَ', en: 'Indeed, You', t: 33.24 }, { ar: 'عَلَى', en: 'are over', t: 34.44 }, { ar: 'كُلِّ', en: 'every', t: 35.28 }, { ar: 'شَيْءٍ', en: 'thing', t: 35.91 },
    { ar: 'قَدِيرٌ', en: 'All Powerful', t: 37.3 },
  ],
  chunks: [
    { from: 0, to: 11, en: 'Say: O Allah, Owner of all sovereignty, You give sovereignty to whom You will and You take it from whom You will,' },
    { from: 12, to: 24, en: 'You honour whom You will and You humble whom You will. In Your hand is all good. Indeed, You have power over all things.' },
  ],
  en: '“Say: O Allah, Owner of all sovereignty, You give sovereignty to whom You will and You take it from whom You will, You honour whom You will and You humble whom You will. In Your hand is all good. Indeed, You have power over all things.”',
  ref: 'Surah Aal Imran, 3:26',
};

const ALI_IMRAN_27: Evidence = {
  audio: 'audio/quran/003027.mp3',
  words: [
    { ar: 'تُولِجُ', en: 'You cause to enter', t: 0.21 }, { ar: 'اللَّيْلَ', en: 'the night', t: 0.81 }, { ar: 'فِي', en: 'into', t: 1.84 }, { ar: 'النَّهَارِ', en: 'the day', t: 1.96 },
    { ar: 'وَتُولِجُ', en: 'and You cause to enter', t: 3.38 }, { ar: 'النَّهَارَ', en: 'the day', t: 4.22 }, { ar: 'فِي', en: 'into', t: 5.41 }, { ar: 'اللَّيْلِ', en: 'the night', t: 6.05 },
    { ar: 'وَتُخْرِجُ', en: 'and You bring out', t: 8.79 }, { ar: 'الْحَيَّ', en: 'the living', t: 10.13 }, { ar: 'مِنَ', en: 'from', t: 10.79 }, { ar: 'الْمَيِّتِ', en: 'the dead', t: 11.39 },
    { ar: 'وَتُخْرِجُ', en: 'and You bring out', t: 12.45 }, { ar: 'الْمَيِّتَ', en: 'the dead', t: 13.25 }, { ar: 'مِنَ', en: 'from', t: 14.13 }, { ar: 'الْحَيِّ', en: 'the living', t: 14.96 },
    { ar: 'وَتَرْزُقُ', en: 'and You provide', t: 16.14 }, { ar: 'مَنْ', en: 'for whom', t: 17.34 }, { ar: 'تَشَاءُ', en: 'You will', t: 17.89 }, { ar: 'بِغَيْرِ', en: 'without', t: 20.18 },
    { ar: 'حِسَابٍ', en: 'account', t: 21.23 },
  ],
  chunks: [
    { from: 0, to: 7, en: 'You make the night enter into the day and You make the day enter into the night,' },
    { from: 8, to: 20, en: 'You bring the living out of the dead and You bring the dead out of the living, and You provide for whom You will without account.' },
  ],
  en: '“You make the night enter into the day and You make the day enter into the night, You bring the living out of the dead and You bring the dead out of the living, and You provide for whom You will without account.”',
  ref: 'Surah Aal Imran, 3:27',
};

const YUNUS_31: Evidence = {
  audio: 'audio/quran/010031.mp3',
  words: [
    // as written in the content file
    { ar: 'قُلْ', en: 'Say', t: 0.07 }, { ar: 'مَنْ', en: 'Who', t: 0.49 }, { ar: 'يَرْزُقُكُمْ', en: 'provides for you', t: 1.35 }, { ar: 'مِنَ', en: 'from', t: 3.73 },
    { ar: 'السَّمَاءِ', en: 'the sky', t: 4.46 }, { ar: 'وَالأَرْضِ', en: 'and the earth', t: 7.07 },
    // the middle of the ayah, which the content file skips, from the published text
    { ar: 'أَمَّنْ', en: 'Or who', t: 8.32 }, { ar: 'يَمْلِكُ', en: 'controls', t: 9.7 }, { ar: 'السَّمْعَ', en: 'the hearing', t: 11.03 }, { ar: 'وَالْأَبْصَارَ', en: 'and the sight', t: 12.13 },
    { ar: 'وَمَنْ', en: 'And who', t: 13.9 }, { ar: 'يُخْرِجُ', en: 'brings out', t: 15.2 }, { ar: 'الْحَيَّ', en: 'the living', t: 15.99 }, { ar: 'مِنَ', en: 'from', t: 16.66 },
    { ar: 'الْمَيِّتِ', en: 'the dead', t: 17.32 }, { ar: 'وَيُخْرِجُ', en: 'and brings out', t: 18.64 }, { ar: 'الْمَيِّتَ', en: 'the dead', t: 19.38 }, { ar: 'مِنَ', en: 'from', t: 20.16 },
    { ar: 'الْحَيِّ', en: 'the living', t: 21.02 },
    // as written in the content file
    { ar: 'وَمَنْ', en: 'And who', t: 21.91 }, { ar: 'يُدَبِّرُ', en: 'manages', t: 23.0 }, { ar: 'الأَمْرَ،', en: 'every affair', t: 24.66 }, { ar: 'فَسَيَقُولُونَ', en: 'Then they will say', t: 25.91 },
    { ar: 'اللَّهُ،', en: 'Allah', t: 27.93 }, { ar: 'فَقُلْ', en: 'So say', t: 31.07 }, { ar: 'أَفَلَا', en: 'Then will not', t: 31.7 }, { ar: 'تَتَّقُونَ', en: 'you be mindful of Him', t: 33.05 },
  ],
  chunks: [
    { from: 0, to: 5, en: 'Say: Who provides for you from the sky and the earth?' },
    { from: 6, to: 18, en: 'Or who controls hearing and sight, and who brings the living out of the dead and brings the dead out of the living,' },
    { from: 19, to: 26, en: 'and who manages every affair? They will say: Allah. So say: Then will you not be mindful of Him?' },
  ],
  en: '“Say: Who provides for you from the sky and the earth? Or who controls hearing and sight, and who brings the living out of the dead and brings the dead out of the living, and who manages every affair? They will say: Allah. So say: Then will you not be mindful of Him?”',
  ref: 'Surah Yunus, 10:31',
};

const RABBI = 'رَبِّيَ اللهُ';
/** Level 3 closed on a warm glow over the lit world; Level 4 opens at dawn on that same world */
const WORLD: SceneCue = { glow: 1.1, settled: true, lift: 0, land: 1, wide: true, tree: 2, birds: true, animal: true, wheat: true, time: 'dawn' };

const DAY_NIGHT = 'Allah makes the night enter into the day and the day enter into the night.';
const LIFE = 'Allah gives life and growth.';
const HEALING = 'Allah gives the healing, and we use the means He allows.';

export const TAWHEED_4: ImmersiveLesson = {
  id: 'tawheed-4', level: 4, topic: 'Tawheed', title: 'Allah is My Lord: Control', minutes: 15,

  pillars: [
    {
      key: 'daynight', icon: 'orb', image: 'art/tawheed4/day-night.jpg',
      qEn: 'Who makes the night enter into the day and the day enter into the night, every single day, never late?',
      aEn: 'Allah does. He manages the sky and the earth.',
      lines: [
        { lead: 'Look', en: 'The sun rises in the east, crosses the sky and sets in the west. Stars come out. The sun rises again.' },
        { lead: 'Think', en: 'If nobody were in charge, would it stay so perfectly in order?' },
      ],
    },
    {
      key: 'life', icon: 'sprout', image: 'art/tawheed4/life.jpg',
      qEn: 'Who gives life and growth? And when someone is ill and then gets better, who gives the healing?',
      aEn: 'Allah does. We do our part: we see a doctor, take medicine and rest. Those are the means Allah lets us use, and the cure comes from Him.',
      lines: [
        { lead: 'Look', en: 'A seed becomes a plant. An egg becomes a chick. A wilted flower opens again after the rain.' },
        { lead: 'Think', en: 'Can a doctor or a farmer make life start by themselves?' },
      ],
      parentsNote: 'Some children have someone ill at home. The lesson does not promise that every illness ends in recovery. It teaches that every affair is managed by Allah with knowledge and wisdom, and that we turn to Him and take the means. Please talk about it in your own way.',
      // one complete ayah for Panels 1 and 2: the night and the day, then life, death and provision
      evidence: ALI_IMRAN_27,
    },
    {
      key: 'power', icon: 'world', image: 'art/tawheed4/mountain.jpg',
      qEn: 'Who is in charge of the strongest, the richest and the most powerful?',
      aEn: 'Allah is. He owns everything. He gives power to whom He wills and takes it away from whom He wills.',
      lines: [
        { lead: 'Look', en: 'A great mountain. A storm that passes over it. A distant city with its lights coming on.' },
        { lead: 'Think', en: 'Is anyone too important to be under Allah’s control?' },
      ],
      evidence: ALI_IMRAN_26,
    },
    {
      key: 'quran', icon: 'orb', image: 'art/tawheed4/dawn.jpg',
      qEn: 'In the Quran Allah asks: who provides for you, and who manages every affair? What do people answer?',
      aEn: 'They will say: Allah.',
      lines: [
        { lead: 'Look', en: 'The same dawn we began with, quiet and wide.' },
        { lead: 'Think', en: 'This ayah shows that provision, ownership, giving life, causing death and managing every affair are all in Allah’s hand alone.' },
      ],
      evidence: YUNUS_31,
    },
    {
      key: 'three', icon: { img: 'art/tawheed4/icon-lights.jpg' },
      qEn: 'What does it mean when I say رَبِّيَ اللهُ, my Lord is Allah?',
      aAr: RABBI, aEn: 'My Lord is Allah.',
      lines: [
        { kind: 'name', en: 'He created me and everything.' },
        { kind: 'name', en: 'He provides for me and for all creatures.' },
        { kind: 'name', en: 'He controls and manages every affair.' },
        { lead: 'Think', en: 'The One who does all three is the only One who deserves our worship. The next unit begins there.' },
      ],
    },
  ],

  presentation: {
    predict: 'What do you think?',
    start: WORLD,
    beats: [
      { k: 'say', lines: ['Every morning the sun rises in the east. Every evening it sets in the west. Then the stars come out, and the morning comes again.'], cue: { lapse: 'day' } },
      { k: 'say', lines: ['Never early. Never late. Have you ever wondered who keeps it all in order?'], cue: { lapse: 'none' } },
      { k: 'ask', qEn: 'Who makes the night follow the day, and the day follow the night?', aEn: 'Allah does.', cueA: { lapse: 'night' } },
      { k: 'say', lines: ['Things begin. They grow. They get better.'], cue: { lapse: 'none', growth: true, shot: 'growth' } },
      { k: 'ask', qEn: 'Who is behind all of it?', aEn: 'Allah is.' },
      { k: 'say', lines: ['Mountains. Storms. Cities. Nothing is too big or too strong to be under His control.'], cue: { growth: false, shot: 'wide', storm: true, city: true, time: 'dusk' } },
      { k: 'state', en: 'Allah manages every affair.' },
      { k: 'say', lines: ['Allah asks these very questions in the Quran. And He tells us how they answer.'], cue: { storm: false, time: 'dawn' } },
      { k: 'recite', evidence: YUNUS_31, cue: { glow: 1.35 } },
    ],
  },

  reading: {
    title: 'Who Keeps Everything Going?',
    paras: [
      { parts: [{ text: 'I woke up before sunrise today. The sky was dark, then grey, then gold, and the sun came up over the east, just like yesterday.' }] },
      { parts: [
        { text: 'It made me wonder. The sun has done this every morning of my whole life, and every morning of my parents’ lives, and their parents’ lives. It has never been late. ' },
        { tap: 'Allah makes the night enter into the day and the day enter into the night.', note: 'The sun rises in the east and sets in the west. Day and night follow each other exactly because Allah manages them.' },
      ] },
      { parts: [{ text: 'Last winter I had a fever. My mum took me to the doctor, I took my medicine, and I rested. After a few days I was better.' }] },
      { parts: [
        { text: 'The doctor helped, and the medicine helped, and I am thankful for both. But I asked myself a question: who gave the healing? ' },
        { tap: 'Allah gives the healing, and we use the means He allows.', note: 'Taking medicine is not against trusting Allah. It is one of the means He gave us. The cure is still from Him.' },
      ] },
      { parts: [
        { text: 'Then I thought about everything else. Seeds that turn into trees. Storms that come and go. Leaders who are powerful one year and gone the next. Nobody planned all of that by themselves. ' },
        { tap: 'Allah manages every affair.', note: 'Nobody is too strong, too rich or too important to be outside Allah’s control.' },
      ] },
      { parts: [{ text: 'So when I say رَبِّيَ اللهُ, my Lord is Allah, I mean three things. He created me and everything. He provides for me and for every living thing. And He controls and manages everything He created.' }] },
      { parts: [{ text: 'And if Allah is the One who does all of that, then He is the One who deserves my worship.' }] },
    ],
    remember: [
      { en: 'Allah created me and everything.' },
      { en: 'Allah provides for me and for all creatures.' },
      { en: 'Allah controls and manages every affair.' },
    ],
  },

  activities: [
    { k: 'match', title: 'Who Is Behind It?', hint: 'Drag a line from what we see to what Allah does.', sample: 4,
      pairs: [
        ['The sun rises in the east and sets in the west', 'Allah keeps the sky in order.'],
        ['Night turns into day', DAY_NIGHT],
        ['A seed becomes a plant', LIFE],
        ['A sick person gets better', HEALING],
        ['A ruler gains power and later loses it', 'Allah gives power and takes it away as He wills.'],
      ] },
    { k: 'wordbank', title: 'Complete the Answer', hint: 'Drag each word into the sentence where it belongs. Each word is used once.',
      items: [
        { before: 'Allah manages every', after: '.', answer: 'affair' },
        { before: 'Allah makes the night enter into the', after: '.', answer: 'day' },
        { before: 'Allah gives the', after: 'when we are sick.', answer: 'healing' },
        { before: 'Nobody is too', after: 'to be under Allah’s control.', answer: 'powerful' },
      ] },
    { k: 'ayahMeaning', title: 'Hear the Ayah, Find the Meaning', hint: 'Listen to the whole ayah. Then choose the meaning of the part that is lit.', sample: 3,
      items: [
        { evidence: ALI_IMRAN_26, chunk: 0 }, { evidence: ALI_IMRAN_26, chunk: 1 },
        { evidence: ALI_IMRAN_27, chunk: 0 }, { evidence: ALI_IMRAN_27, chunk: 1 },
        { evidence: YUNUS_31, chunk: 0 }, { evidence: YUNUS_31, chunk: 2 },
      ] },
    { k: 'scenes', title: 'Listen and Choose', hint: 'Listen to the scene, then choose what it shows.', sample: 3,
      statements: [DAY_NIGHT, LIFE, HEALING],
      items: [
        { scene: 'The sun is setting and the first stars are coming out.', answer: 0 },
        { scene: 'Morning light spreads over the hills as the night ends.', answer: 0 },
        { scene: 'A small green shoot is pushing up out of the soil.', answer: 1 },
        { scene: 'An egg cracks open and a chick steps out.', answer: 1 },
        { scene: 'A child had a fever. She took her medicine, rested, and now she feels better.', answer: 2 },
      ] },
    { k: 'build', title: 'Build the Sentence', hint: 'Drag the words into order.',
      sentences: [['Allah', 'manages', 'every', 'affair'], ['Allah', 'makes', 'the night', 'enter', 'the day'], ['Allah', 'gives', 'power', 'and', 'takes', 'it away', 'as He wills']] },
    { k: 'speak', title: 'Speak', hint: 'Record your answer, then play it back.',
      items: [
        { prompt: 'Who manages every affair?', modelEn: 'Allah manages every affair.' },
        { prompt: 'Who makes the night follow the day?', modelEn: 'Allah makes the night follow the day.' },
        { prompt: 'Tell a grown up one thing you saw today that Allah manages.', keep: true },
      ] },
    { k: 'lanterns', title: 'Three Lanterns', hint: 'Each lantern is one thing my Lord does. Give each card to its lantern.',
      names: ['Creates', 'Provides', 'Controls'], perLantern: 2, ar: RABBI, en: 'My Lord is Allah.',
      cards: [
        { text: 'Allah made me.', lantern: 0 }, { text: 'Allah made the sun and the moon.', lantern: 0 }, { text: 'Allah made the mountains and the seas.', lantern: 0 },
        { text: 'Allah gives me food and drink.', lantern: 1 }, { text: 'Allah sends down the rain from the sky.', lantern: 1 }, { text: 'Allah provides for all creatures.', lantern: 1 },
        { text: 'Allah manages every affair.', lantern: 2 }, { text: 'Allah makes the night enter into the day.', lantern: 2 }, { text: 'Allah gives power and takes it away as He wills.', lantern: 2 },
      ] },
  ],

  quickCheck: {
    scene: { ...WORLD, time: 'dusk', glow: 0.9 }, final: { glow: 1.45, settled: true, time: 'dawn' },
    lanterns: true,
    questions: [
      { qEn: 'Who manages every affair?', aEn: 'Allah manages every affair.' },
      { qEn: 'Who makes the night follow the day?', aEn: 'Allah makes the night follow the day.' },
      { qEn: 'What are the three things my Lord does?', aEn: 'He creates, He provides, and He controls and manages every affair.' },
    ],
    badge: 'Level 4 Complete',
    summaryAr: [RABBI],
    summary: 'My Lord is Allah. He created me and everything. He provides for me and for every creature. He controls and manages every affair.',
  },
};
