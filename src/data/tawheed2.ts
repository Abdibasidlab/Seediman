// SeedIman — Tawheed Level 2: Allah is My Lord (Creation). Curriculum Lessons 2–4.
// Opens on the steady light Level 1 ended with; the world switches on around it as the lesson unfolds.
import type { ImmersiveLesson } from './lessonTypes';

export const TAWHEED_2: ImmersiveLesson = {
  id: 'tawheed-2', level: 2, topic: 'Tawheed', title: 'Allah is My Lord: Creation', minutes: 15,

  pillars: [
    {
      key: 'above', icon: 'sky',
      qAr: 'أَيْنَ اللهُ؟', qEn: 'Where is Allah?',
      aAr: 'اللهُ فَوْقَ السَّمَاءِ', aEn: 'Allah is above the heaven.',
      cueA: { lift: 0.45 },
      recall: { prompt: 'Quick, where is Allah?' },
      evidence: {
        audio: 'audio/quran/067016.mp3',
        words: [
          { ar: 'أَأَمِنتُم', en: 'Do you feel secure', t: 0.07 }, { ar: 'مَّن', en: 'that He who', t: 2.19 }, { ar: 'فِي', en: 'is over', t: 3.6 }, { ar: 'السَّمَاءِ', en: 'the heaven', t: 3.85 },
          { ar: 'أَن', en: 'will not', t: 5.88 }, { ar: 'يَخْسِفَ', en: 'cause to sink', t: 6.85 }, { ar: 'بِكُمُ', en: 'with you', t: 8.04 }, { ar: 'الْأَرْضَ', en: 'the earth', t: 8.63 },
          { ar: 'فَإِذَا', en: 'then behold', t: 9.24 }, { ar: 'هِيَ', en: 'it', t: 10.43 }, { ar: 'تَمُورُ', en: 'shakes', t: 10.63 },
        ],
        en: '“Do you feel secure that He, Who is over the heaven (Allah), will not cause the earth to sink with you, then behold it shakes (as in an earthquake)?”',
        ref: 'Surah Al Mulk, 67:16',
      },
    },
    {
      key: 'me', icon: 'sprout',
      intro: 'Someone made you. Someone made everything you can see.',
      qAr: 'مَنْ خَلَقَكَ؟', qEn: 'Who created you?',
      aAr: 'اللهُ الَّذِي خَلَقَنِي', aEn: 'Allah created me.',
      cueQ: { land: 0.25 }, cueA: { land: 0.4 },
      recall: { prompt: 'Quick, who created you?' },
      evidence: {
        audio: 'audio/quran/082007.mp3',
        words: [
          { ar: 'الَّذِي', en: 'He who', t: 0.01 },
          { ar: 'خَلَقَكَ', en: 'created you', t: 0.9 },
          { ar: 'فَسَوَّاكَ', en: 'proportioned you', t: 2.1 },
          { ar: 'فَعَدَلَكَ', en: 'and balanced you', t: 2.96 },
        ],
        en: '“He who created you, proportioned you, and balanced you.”',
        ref: 'Surah Al Infitar, 82:7',
      },
    },
    {
      key: 'everything', icon: 'world',
      qAr: 'مَنْ خَلَقَ كُلَّ شَيْءٍ؟', qEn: 'Who created everything?',
      aAr: 'اللهُ الَّذِي خَلَقَ كُلَّ شَيْءٍ', aEn: 'Allah created everything.',
      cueQ: { wide: true, tree: 1, land: 0.6 }, cueA: { tree: 2, birds: true, land: 0.75 },
      // one clearly correct answer: all three are true, so the right choice is the one that includes them all
      recall: { prompt: 'Which of these did Allah create?', options: ['The sun and the moon', 'The mountains and the seas', 'The animals and the birds', 'All of the above'], answer: 3,
        instruction: 'Choose the best answer.', feedback: 'Correct. Allah created all of them.' },
      sequence: [
        { qAr: 'مَنْ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ؟', aAr: 'اللهُ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ', en: 'Allah created the heavens and the earth.' },
        { qAr: 'مَنْ خَلَقَ اللَّيْلَ وَالنَّهَارَ؟', aAr: 'اللهُ الَّذِي خَلَقَ اللَّيْلَ وَالنَّهَارَ', en: 'Allah created the night and the day.' },
        { qAr: 'مَنْ خَلَقَ الشَّمْسَ وَالْقَمَرَ؟', aAr: 'اللهُ الَّذِي خَلَقَ الشَّمْسَ وَالْقَمَرَ', en: 'Allah created the sun and the moon.' },
        { qAr: 'مَنْ خَلَقَ الْجِبَالَ وَالْبِحَارَ؟', aAr: 'اللهُ الَّذِي خَلَقَ الْجِبَالَ وَالْبِحَارَ', en: 'Allah created the mountains and the seas.' },
        { qAr: 'مَنْ خَلَقَ الْحَيَوَانَاتِ وَالطُّيُورَ؟', aAr: 'اللهُ الَّذِي خَلَقَ الْحَيَوَانَاتِ وَالطُّيُورَ', en: 'Allah created the animals and the birds.' },
      ],
      evidence: {
        audio: 'audio/quran/039062.mp3',
        words: [
          { ar: 'اللَّهُ', en: 'Allah', t: 0.07 }, { ar: 'خَالِقُ', en: 'is the Creator', t: 1.17 }, { ar: 'كُلِّ', en: 'of all', t: 2.1 }, { ar: 'شَيْءٍ', en: 'things', t: 3 },
          { ar: 'وَهُوَ', en: 'and He is', t: 3.4 }, { ar: 'عَلَىٰ', en: 'over', t: 5.08 }, { ar: 'كُلِّ', en: 'all', t: 6.09 }, { ar: 'شَيْءٍ', en: 'things', t: 6.8 },
          { ar: 'وَكِيلٌ', en: 'Disposer of affairs', t: 8.52 },
        ],
        en: '“Allah is the Creator of all things, and He is, over all things, Disposer of affairs.”',
        ref: 'Surah Az Zumar, 39:62',
      },
    },
    {
      key: 'senses', icon: 'senses',
      // shown one line at a time; the child is looking and listening as each line lands
      intro: ['You can see this screen.', 'You can hear these words.', 'Allah created your sight and your hearing.'],
      qAr: 'مَنْ خَلَقَ سَمْعِي وَبَصَرِي؟', qEn: 'Who created my hearing and my sight?',
      aAr: 'اللهُ الَّذِي خَلَقَ سَمْعِي وَبَصَرِي', aEn: 'Allah created my hearing and my sight.',
      cueA: { land: 0.85 },
      evidence: {
        audio: 'audio/quran/095004.mp3',
        words: [
          { ar: 'لَقَدْ', en: 'Certainly', t: 0.06 },
          { ar: 'خَلَقْنَا', en: 'We created', t: 1.02 },
          { ar: 'الْإِنسَانَ', en: 'man', t: 1.63 },
          { ar: 'فِي', en: 'in', t: 3.4 },
          { ar: 'أَحْسَنِ', en: 'the best', t: 4.99 },
          { ar: 'تَقْوِيمٍ', en: 'of stature', t: 5.99 },
        ],
        en: '“We have certainly created man in the best of stature.”',
        ref: 'Surah At Tin, 95:4',
      },
    },
  ],

  presentation: {
    opening: ['You already know my Lord is Allah. But what does that really mean? Let’s find out.'],
    predict: 'What do you think?',
    closing: 'All of this, everything you can see and everything about you, was made by your Lord.',
    listAnswersAtClose: false,
    start: { glow: 0.8, settled: true, land: 0, lift: 0 },
    close: { glow: 1.25, land: 1, birds: true, animal: true, tree: 2, wide: true },
  },

  reading: {
    title: 'My Lord Made All of This',
    paras: [
      { parts: [{ text: 'I already know my Lord is Allah. But what does that mean?' }] },
      { parts: [
        { text: 'It means ' },
        { tap: 'Allah is above the heaven,', note: 'This doesn’t mean Allah is far away or uninvolved. It means Allah is exalted above creation while still knowing everything about it.' },
        { text: ' far above everything, seeing and hearing all of it.' },
      ] },
      { parts: [
        { text: 'It means ' },
        { tap: 'Allah created me.', note: 'This is one of the most personal things a Muslim can know: Allah made you specifically, not just the world in general.' },
        { text: ' Not by accident, on purpose, the way I am.' },
      ] },
      { parts: [
        { text: 'It means ' },
        { tap: 'Allah created everything I can see,', note: 'When I look at anything around me, I can remember that it points back to my Lord.' },
        { text: ' the sky, the ground, the animals, the mountains. Nothing made itself.' },
      ] },
      { parts: [
        { text: 'And it means ' },
        { tap: 'Allah created my hearing and my sight,', note: 'Even the ability to read this sentence is something Allah gave me.' },
        { text: ' the very way I’m reading these words right now.' },
      ] },
      { parts: [{ text: 'This is what it means to say my Lord is Allah. He is the one who made me, and made everything around me.' }] },
    ],
  },

  activities: [
    { k: 'match', title: 'Match the Question', hint: 'Drag a line from each question to its answer.',
      pairs: [['Where is Allah?', 'Above the heaven'], ['Who created you?', 'He created me'], ['Who created everything?', 'He created everything'], ['Who created your hearing and sight?', 'He created my hearing and sight']] },
    { k: 'complete', title: 'Complete the Answer', hint: 'Choose the word that completes each answer.',
      items: [
        { before: 'Allah is above the', after: '.', answer: 'heaven', choices: ['heaven', 'earth', 'mountain'] },
        { before: 'Allah', after: 'me.', answer: 'created', choices: ['created', 'forgot', 'ignored'] },
        { before: 'Allah created my', after: 'and my sight.', answer: 'hearing', choices: ['hearing', 'homework', 'toys'] },
      ] },
    { k: 'arabic', title: 'Arabic and English', hint: 'Drag a line from each Arabic sentence to its meaning.',
      pairs: [
        ['اللهُ فَوْقَ السَّمَاءِ', 'Allah is above the heaven.'],
        ['اللهُ الَّذِي خَلَقَنِي', 'Allah created me.'],
        ['اللهُ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ', 'Allah created the heavens and the earth.'],
        ['اللهُ الَّذِي خَلَقَ اللَّيْلَ وَالنَّهَارَ', 'Allah created the night and the day.'],
        ['اللهُ الَّذِي خَلَقَ الشَّمْسَ وَالْقَمَرَ', 'Allah created the sun and the moon.'],
        ['اللهُ الَّذِي خَلَقَ الْجِبَالَ وَالْبِحَارَ', 'Allah created the mountains and the seas.'],
        ['اللهُ الَّذِي خَلَقَ الْحَيَوَانَاتِ وَالطُّيُورَ', 'Allah created the animals and the birds.'],
        ['اللهُ الَّذِي خَلَقَ سَمْعِي وَبَصَرِي', 'Allah created my hearing and my sight.'],
      ] },
    { k: 'listen', title: 'Listen and Choose', hint: 'Listen to the question, then choose the answer.' },
    { k: 'build', title: 'Build the Sentence', hint: 'Drag the words into order.',
      sentences: [['Allah', 'is', 'above', 'the heaven'], ['Allah', 'created', 'me'], ['Allah', 'created', 'my hearing', 'and my sight']] },
    { k: 'speak', title: 'Speak', hint: 'Record your answer, then compare it with the model.' },
    { k: 'look', title: 'Look Around', hint: 'Tap something in the picture and say what it is.',
      intro: 'Look around. Everything here was made by Allah. Tap something and name it.',
      spots: [
        { id: 'sun', label: 'The sun', said: 'Allah created the sun.' },
        { id: 'mountain', label: 'A mountain', said: 'Allah created the mountains.' },
        { id: 'sea', label: 'The sea', said: 'Allah created the sea.' },
        { id: 'tree', label: 'A tree', said: 'Allah created the trees.' },
        { id: 'bird', label: 'A bird', said: 'Allah created the birds.' },
        { id: 'flower', label: 'A flower', said: 'Allah created the flowers.' },
      ] },
  ],

  quickCheck: {
    scene: { glow: 1, settled: true, lift: 0.45, land: 1, wide: true, tree: 2, birds: true, animal: true },
    final: { glow: 1.3, settled: true },
    badge: 'Level 2 Complete',
    summary: 'Allah is above the heaven. Allah created me. Allah created everything. Allah created my hearing and my sight.',
  },
};
