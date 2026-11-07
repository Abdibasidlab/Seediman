// SeedIman — Tawheed Level 1: Allah is My Lord.
import type { ImmersiveLesson } from './lessonTypes';

export const TAWHEED_1: ImmersiveLesson = {
  id: 'tawheed-1', level: 1, topic: 'Tawheed', title: 'Allah is My Lord', minutes: 12,

  pillars: [
    {
      key: 'lord', icon: 'orb',
      qAr: 'مَنْ رَبُّكَ؟', qEn: 'Who is your Lord?',
      aAr: 'رَبِّيَ اللهُ', aEn: 'My Lord is Allah.',
      recall: { prompt: 'Quick, before we move on. Who is your Lord?' },
      evidence: {
        audio: 'audio/quran/001002.mp3',
        words: [
          { ar: 'الْحَمْدُ', en: 'All praise', t: 0.07 },
          { ar: 'لِلَّهِ', en: 'is for Allah', t: 0.77 },
          { ar: 'رَبِّ', en: 'Lord', t: 1.81 },
          { ar: 'الْعَالَمِينَ', en: 'of all the worlds', t: 2.25 },
        ],
        en: '“All praise is for Allah, Lord of all the worlds.”',
        ref: 'Surah Al Fatihah, 1:2',
      },
    },
    {
      key: 'religion', icon: 'crescent',
      qAr: 'مَا دِينُكَ؟', qEn: 'What is your religion?',
      aAr: 'دِينِي الإِسْلَامُ', aEn: 'My religion is Islam.',
      recall: { prompt: 'Quick, what is your religion?' },
      evidence: {
        audio: 'audio/quran/003019.mp3',
        words: [
          { ar: 'إِنَّ', en: 'Indeed', t: 0.17 }, { ar: 'الدِّينَ', en: 'the religion', t: 1.31 }, { ar: 'عِندَ', en: 'in the sight of', t: 1.89 }, { ar: 'اللَّهِ', en: 'Allah', t: 3.06 },
          { ar: 'الْإِسْلَامُ', en: 'is Islam', t: 4.36 }, { ar: 'وَمَا', en: 'and did not', t: 7.54 }, { ar: 'اخْتَلَفَ', en: 'differ', t: 7.82 }, { ar: 'الَّذِينَ', en: 'those who', t: 8.64 },
          { ar: 'أُوتُوا', en: 'were given', t: 9.9 }, { ar: 'الْكِتَابَ', en: 'the Scripture', t: 10.71 }, { ar: 'إِلَّا', en: 'except', t: 11.35 }, { ar: 'مِن', en: 'from', t: 12.3 },
          { ar: 'بَعْدِ', en: 'after', t: 13.12 }, { ar: 'مَا', en: 'what', t: 13.84 }, { ar: 'جَاءَهُمُ', en: 'came to them', t: 14.56 }, { ar: 'الْعِلْمُ', en: 'the knowledge', t: 16.52 },
          { ar: 'بَغْيًا', en: 'out of jealousy', t: 17.59 }, { ar: 'بَيْنَهُمْ', en: 'between them', t: 19.04 }, { ar: 'وَمَن', en: 'and whoever', t: 20.36 }, { ar: 'يَكْفُرْ', en: 'disbelieves', t: 21.88 },
          { ar: 'بِآيَاتِ', en: 'in the verses', t: 22.66 }, { ar: 'اللَّهِ', en: 'of Allah', t: 23.52 }, { ar: 'فَإِنَّ', en: 'then indeed', t: 24.59 }, { ar: 'اللَّهَ', en: 'Allah', t: 25.72 },
          { ar: 'سَرِيعُ', en: 'is swift', t: 26.79 }, { ar: 'الْحِسَابِ', en: 'in account', t: 27.79 },
        ],
        en: '“Indeed, the religion in the sight of Allah is Islam. And those who were given the Scripture did not differ except after knowledge had come to them, out of jealous animosity between themselves. And whoever disbelieves in the verses of Allah, then indeed, Allah is swift in taking account.”',
        ref: 'Surah Aal Imran, 3:19',
      },
    },
    {
      key: 'prophet', icon: 'lantern',
      qAr: 'مَنْ نَبِيُّكَ؟', qEn: 'Who is your Prophet?',
      aAr: 'نَبِيِّي مُحَمَّدٌ ﷺ', aEn: 'My Prophet is Muhammad ﷺ.',
      recall: { prompt: 'Quick, who is your Prophet?' },
      evidence: {
        audio: 'audio/quran/033040.mp3',
        words: [
          { ar: 'مَّا', en: 'not', t: 0.04 }, { ar: 'كَانَ', en: 'is', t: 0.43 }, { ar: 'مُحَمَّدٌ', en: 'Muhammad', t: 1.18 }, { ar: 'أَبَا', en: 'the father', t: 2.94 },
          { ar: 'أَحَدٍ', en: 'of any one', t: 3.84 }, { ar: 'مِّن', en: 'of', t: 4.63 }, { ar: 'رِّجَالِكُمْ', en: 'your men', t: 5.66 }, { ar: 'وَلَٰكِن', en: 'but', t: 7.22 },
          { ar: 'رَّسُولَ', en: 'the Messenger', t: 8.45 }, { ar: 'اللَّهِ', en: 'of Allah', t: 9.04 }, { ar: 'وَخَاتَمَ', en: 'and the seal', t: 13.97 }, { ar: 'النَّبِيِّينَ', en: 'of the prophets', t: 14.68 },
          { ar: 'وَكَانَ', en: 'and ever is', t: 18.3 }, { ar: 'اللَّهُ', en: 'Allah', t: 18.7 }, { ar: 'بِكُلِّ', en: 'of all', t: 19.82 }, { ar: 'شَيْءٍ', en: 'things', t: 20.39 },
          { ar: 'عَلِيمًا', en: 'Knowing', t: 21.3 },
        ],
        en: '“Muhammad is not the father of any one of your men, but he is the Messenger of Allah and the seal of the prophets. And ever is Allah, of all things, Knowing.”',
        ref: 'Surah Al Ahzab, 33:40',
      },
    },
  ],

  presentation: {
    opening: [
      'There are some things every Muslim should know.',
      'They are simple questions, but their answers matter more than almost anything else you will learn.',
      'Let’s begin with the first one.',
    ],
    predict: 'What do you think the answer is?',
    closing: 'These are three things every Muslim should know, confidently, without hesitation.',
    listAnswersAtClose: true,
    start: { glow: 0.22 },
    close: { glow: 0.36 },
  },

  reading: {
    title: 'Three Things I Know',
    paras: [
      { parts: [{ text: 'There are some things a Muslim should know clearly.' }] },
      { parts: [
        { text: 'If someone asks me, ' }, { tap: '“Who is your Lord?”' }, { text: ' I know the answer: ' },
        { tap: 'My Lord is Allah.', note: 'This is the first and most important thing every Muslim can say with certainty.' },
      ] },
      { parts: [
        { text: 'If I am asked, ' }, { tap: '“What is your religion?”' }, { text: ' I answer: ' },
        { tap: 'My religion is Islam.', note: 'Islam means submission and peace, choosing to follow what Allah has revealed.' },
      ] },
      { parts: [
        { text: 'And if someone asks, ' }, { tap: '“Who is your Prophet?”' }, { text: ' I say: ' },
        { tap: 'My Prophet is Muhammad ﷺ.', note: 'ﷺ stands for the salutation Muslims say after his name: ṣallallāhu ʿalayhi wa sallam.' },
      ] },
      { parts: [{ text: 'These answers are short, but they matter more than almost anything else I will ever learn. I should know them, understand them, and be able to say them with confidence.' }] },
    ],
  },

  activities: [
    { k: 'match', title: 'Match the Question', hint: 'Drag a line from each question to its answer.',
      pairs: [['Who is your Lord?', 'Allah'], ['What is your religion?', 'Islam'], ['Who is your Prophet?', 'Muhammad ﷺ']] },
    { k: 'complete', title: 'Complete the Answer', hint: 'Choose the word that completes each answer.',
      items: [
        { before: 'My Lord is', after: '.', answer: 'Allah', choices: ['Allah', 'Islam', 'Muhammad ﷺ'] },
        { before: 'My religion is', after: '.', answer: 'Islam', choices: ['Allah', 'Islam', 'Muhammad ﷺ'] },
        { before: 'My Prophet is', after: '.', answer: 'Muhammad ﷺ', choices: ['Allah', 'Islam', 'Muhammad ﷺ'] },
      ] },
    { k: 'arabic', title: 'Arabic and English', hint: 'Drag a line from each Arabic answer to its meaning.',
      pairs: [['رَبِّيَ اللهُ', 'My Lord is Allah.'], ['دِينِي الإِسْلَامُ', 'My religion is Islam.'], ['نَبِيِّي مُحَمَّدٌ ﷺ', 'My Prophet is Muhammad ﷺ.']] },
    { k: 'listen', title: 'Listen and Choose', hint: 'Listen to the question, then choose the answer.' },
    { k: 'build', title: 'Build the Sentence', hint: 'Drag the words into order.',
      sentences: [['My', 'Lord', 'is', 'Allah'], ['My', 'religion', 'is', 'Islam'], ['My', 'Prophet', 'is', 'Muhammad ﷺ']] },
    { k: 'speak', title: 'Speak', hint: 'Record your answer, then compare it with the model.' },
  ],

  quickCheck: {
    scene: { glow: 0.62 }, final: { glow: 1, settled: true },
    badge: 'Level 1 Complete',
    summary: 'My Lord is Allah. My religion is Islam. My Prophet is Muhammad ﷺ.',
  },
};
