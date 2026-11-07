// SeedIman — Tawheed Level 5: Only Allah Deserves Worship (Unit 2 of the Saudi Grade 1 second semester, lessons 1 to 3).
// English leads, in Register 2: a reason with every claim, real examples from school and home.
// Arabic comes only from the book's pages (8, 10, 12, 13), the two worship words الدعاء and توكل, and Adh Dhariyat 51:56,
// all copied exactly as the content file gives them. Word meanings for the ayah: quran.com.
// Open in the content file: the evidence for dua (Panel 2) and for tawakkul (Panel 5) is still to come, so those panels have none yet.
// Interface copy written here uses no hyphens or dashes.
import type { Evidence, ImmersiveLesson, SceneCue } from './lessonTypes';

const DHARIYAT_56: Evidence = {
  audio: 'audio/quran/051056.mp3',
  words: [
    { ar: 'وَمَا', en: 'And not', t: 0.07 }, { ar: 'خَلَقْتُ', en: 'I created', t: 0.68 }, { ar: 'الْجِنَّ', en: 'the jinn', t: 1.58 },
    { ar: 'وَالْإِنسَ', en: 'and mankind', t: 3.5 }, { ar: 'إِلَّا', en: 'except', t: 5.6 }, { ar: 'لِيَعْبُدُونِ', en: 'to worship Me', t: 6.42 },
  ],
  en: '“I did not create the jinn and mankind except to worship Me.”',
  ref: 'Surah Adh Dhariyat, 51:56',
};

// the book's lines
const CREATED = 'خَلَقَنِي اللهُ لِعِبَادَتِهِ وَحْدَه';
const CALL = 'يَجِبُ عَلَيَّ أَنْ أَدْعُوَ اللهَ وَلَا أَدْعُوَ مَعَهُ غَيْرَهُ';
const LOVE = 'أُحِبُّ اللهَ وَأُطِيعُهُ لِأَنَّهُ خَلَقَنِي وَرَزَقَنِي وَلِأَنَّهُ جَعَلَنِي مِنَ الْمُسْلِمِينَ';
const LOVE_SHORT = 'أُحِبُّ اللهَ وَأُطِيعُهُ';
const FEAR = 'الْمُسْلِمُ يَخَافُ اللهَ وَلَا يَعْصِيهِ';
const PRAY = 'أَنَا أُصَلِّي لِأَنَّنِي أُحِبُّ اللهَ وَأُطِيعُهُ';
const WORSHIP = 'الْعِبَادَةُ: كُلُّ مَا يُحِبُّهُ اللهُ مِنَ الْأَقْوَالِ وَالْأَعْمَالِ';
const I_WORSHIP = 'أَعْبُدُ اللهَ رَبِّي';

const CREATED_EN = 'Allah created me to worship Him alone.';
const LOVE_EN = 'I love Allah and I obey Him, because He created me, provided for me, and made me one of the Muslims.';
const WORSHIP_EN = 'Worship is everything Allah loves, of words and of actions.';

/** Level 4 closed with three lights joined in one steady beam; Level 5 opens high under that light */
const OPEN: SceneCue = { glow: 1.45, settled: true, lift: 1, land: 1, wide: true, tree: 0, birds: true, time: 'dawn', shot: 'sky', town: true, worship: 0, windows: 0 };

export const TAWHEED_5: ImmersiveLesson = {
  id: 'tawheed-5', level: 5, topic: 'Tawheed', title: 'Only Allah Deserves Worship', minutes: 15,

  pillars: [
    {
      key: 'purpose', icon: { img: 'art/tawheed4/icon-lights.jpg' },
      qEn: 'Why did Allah create me?',
      aAr: CREATED, aEn: CREATED_EN,
      lines: [
        { kind: 'name', en: 'He creates.' },
        { kind: 'name', en: 'He provides.' },
        { kind: 'name', en: 'He manages every affair.' },
        { lead: 'Because', en: 'The One who creates, provides and manages every affair is the only One who deserves worship.' },
        { lead: 'Try it', kind: 'turn', en: 'Finish this sentence in your own words: “Allah alone deserves my worship because…”' },
      ],
      evidence: DHARIYAT_56,
    },
    {
      key: 'dua', icon: { img: 'art/tawheed5/icon-dua.jpg' },
      word: { ar: 'الدُّعَاءُ', tr: 'dua', en: 'Asking Allah, aloud or silently, for anything at all, big or small.' },
      qEn: 'Who do I call on?',
      aAr: CALL, aEn: 'I must call on Allah, and never call on anyone else together with Him.',
      lines: [
        { lead: 'Because', en: 'Allah is the One who provides and manages every affair, so He is the One to ask for what only He can give. Asking anyone else for that would treat them as if they were in charge of it.' },
        { lead: 'A careful difference', en: 'It is completely fine to ask people for help with things they are able to do, like a friend for a pencil or a parent for a lift. What we ask Allah alone for is what only He can give, such as good health, guidance and forgiveness.' },
        { lead: 'Try it', kind: 'turn', en: 'Asking a friend for a pencil and asking Allah for good health are both asking. Why are they different?' },
      ],
    },
    {
      key: 'love', icon: { img: 'art/tawheed5/icon-love.jpg' },
      qEn: 'Why do I worship Allah?',
      aAr: LOVE, aEn: LOVE_EN,
      lines: [
        { lead: 'Because', en: 'Three gifts sit behind that sentence. He created me, He provided for me, and He made me one of the Muslims. Love makes obedience feel like thanks rather than a chore.' },
        { lead: 'A Muslim also stays mindful of Allah.', ar: FEAR, en: 'A Muslim fears Allah and does not disobey Him.' },
        { en: 'This fear is respect and awe, and it sits alongside love. Together they keep us from disobeying Him.' },
        { lead: 'Try it. Here is a pattern to follow.', ar: PRAY, en: 'I pray because I love Allah and obey Him.' },
        { kind: 'turn', en: 'Say the same sentence about a different act of worship.' },
      ],
    },
    {
      key: 'worship', icon: { img: 'art/tawheed5/icon-words.jpg' },
      word: { ar: 'الْعِبَادَةُ', tr: 'ibadah', en: 'Worship.' },
      qEn: 'What counts as worship?',
      aAr: WORSHIP, aEn: WORSHIP_EN,
      lines: [
        { lead: 'Two kinds of worship', en: 'Some worship is quiet and inward, like loving Allah, hoping in Him, fearing to disobey Him, and relying on Him completely. This is worship of the heart.' },
        { en: 'Some worship is said or done, like prayer, fasting, honesty and charity. This is worship of the tongue and the limbs. Prayer is one of the greatest acts of this kind, and it stays at the centre of a Muslim’s day.' },
        { lead: 'Some types', en: 'There are many kinds of worship. Tap each card to hear it.',
          chips: [
            { ar: 'الصَّلَاةُ', en: 'Prayer' }, { ar: 'الصِّيَامُ', en: 'Fasting' }, { ar: 'قِرَاءَةُ الْقُرْآنِ', en: 'Reading the Quran' },
            { ar: 'طَاعَةُ الْوَالِدَيْنِ', en: 'Obeying parents' }, { ar: 'الْإِحْسَانُ إِلَى الْجَارِ', en: 'Being good to your neighbour' },
            { ar: 'الصَّدَقَةُ', en: 'Giving charity' }, { ar: 'تَرْكُ الْكَذِبِ', en: 'Leaving lying' },
          ] },
        { lead: 'Because', en: 'Notice how many of these happen outside the mosque. Honesty at school and kindness to a neighbour are worship when they are done for Allah’s sake and in the way He loves.' },
        { lead: 'Loved and disliked', en: 'Truthfulness is loved. Disobeying parents and harming a neighbour are disliked.',
          chips: [{ ar: 'الصِّدْقُ', en: 'Truthfulness' }, { ar: 'عِصْيَانُ الْوَالِدَيْنِ', en: 'Disobeying parents' }, { ar: 'أَذِيَّةُ الْجَارِ', en: 'Harming a neighbour' }] },
        { lead: 'Try it', kind: 'turn', en: 'Think of one word you said today and one action you did that Allah loves.' },
      ],
    },
    {
      key: 'tawakkul', icon: { img: 'art/tawheed5/icon-tawakkul.jpg' },
      word: { ar: 'توكل', tr: 'tawakkul', en: 'Relying on Allah while doing your part.' },
      qEn: 'What is tawakkul?',
      aEn: 'Doing my part and trusting Allah with the result is worship.',
      lines: [
        { lead: 'Because', en: 'In Level 4 we learned that Allah manages every affair. That is why tawakkul makes sense.' },
        { en: 'Studying for a test is your part. Trusting Allah with the result is tawakkul.' },
        { en: 'Dua and tawakkul work together: you ask Him, you do your part, and you trust Him.' },
        { lead: 'Try it', kind: 'turn', en: 'You have a hard test tomorrow. Which part is yours, and which part do you trust Allah with?' },
      ],
    },
  ],

  presentation: {
    predict: 'What do you think?',
    start: OPEN,
    beats: [
      { k: 'say', lines: ['Four lessons, one idea. Allah created us, Allah provides for us, and Allah manages every affair.'] },
      { k: 'say', lines: ['If all of that is true, there is one question left. What do we owe Him?'], cue: { shot: 'town', lift: 0.35 } },
      { k: 'say', lines: ['Why did Allah create you?', 'Not by accident. He created us for a purpose, and He tells us exactly what it is.'], cue: { lift: 0.2 } },
      { k: 'state', ar: CREATED, en: CREATED_EN },
      { k: 'say', lines: ['Ask most people what worship is and they will say prayer. They are right.', 'Prayer is one of the greatest acts of worship, and it belongs to a whole family of them.'] },
      { k: 'say', lines: ['Some worship happens quietly in the heart: loving Allah, hoping in Him, fearing Him, and relying on Him completely.', 'Other worship happens through what we say and do.'] },
      { k: 'list', items: ['loving Allah', 'trusting Him', 'prayer', 'fasting', 'reading the Quran', 'telling the truth', 'obeying your parents', 'being good to a neighbour', 'giving charity'] },
      { k: 'state', ar: WORSHIP, en: WORSHIP_EN },
      { k: 'say', lines: ['So why worship Him? Not from fear alone. From love.', 'He created us, He provided for us, and He made us Muslims.'] },
      { k: 'state', ar: LOVE, en: LOVE_EN },
      { k: 'say', lines: ['And because He alone does all of this, worship belongs to Him alone. The Quran says it plainly.'], cue: { worship: 30, windows: 99 } },
      { k: 'recite', evidence: DHARIYAT_56, cue: { lift: 0.75, glow: 1.5 } },
    ],
  },

  reading: {
    title: 'More Than Prayer',
    paras: [
      { parts: [{ text: 'Last Saturday I noticed something. Before lunch I had done seven small things, and I had not thought of a single one as worship.' }] },
      { parts: [{ text: 'I said salaam to the new neighbour, even though I felt shy. I told my mum the truth about the cup I had chipped. I carried the shopping in for my brother. I prayed Dhuhr on time. I read a page of the Quran. I put a coin in the charity box. And when I felt nervous about my spelling test, I asked Allah for help.' }] },
      { parts: [
        { text: 'Then I remembered what we had learned. ' },
        { tap: 'Worship is everything Allah loves, of words and of actions.', note: 'The Arabic word is العبادة, ibadah.' },
      ] },
      { parts: [{ text: 'Saying salaam is a word. Carrying shopping is an action. Telling the truth is both. None of them happened in a mosque, and every one of them counted.' }] },
      { parts: [
        { text: 'A classmate once asked me, “Why do you bother with all that?” I could have said, “Because I have to.” But the honest answer is bigger. ' },
        { tap: 'I love Allah and I obey Him, because He created me, provided for me, and made me one of the Muslims.', note: 'Obeying Allah out of love feels different from obeying out of habit. It feels like saying thank you.' },
      ] },
      { parts: [
        { text: 'The spelling test taught me something too. I asked Allah for help, and I also studied. ' },
        { tap: 'Asking Him is called dua. Doing my part and then trusting Him with the result is called tawakkul.', note: 'The Arabic words are الدعاء, dua, and توكل, tawakkul.' },
      ] },
      { parts: [{ text: 'When I add it all up, my whole day belongs to Him: my words, my actions, my asking and my trusting. That is what I mean when I say that only Allah deserves my worship.' }] },
    ],
    remember: [
      { ar: CREATED, en: CREATED_EN },
      { ar: LOVE_SHORT, en: 'I love Allah and I obey Him.' },
      { ar: WORSHIP, en: WORSHIP_EN },
    ],
  },

  activities: [
    { k: 'sort', title: 'Two Boxes', hint: 'Drag each card into the box where it belongs: worship we say, or worship we do.', bins: ['Words', 'Actions'], sample: 4, whyLabel: 'Why is this worship?',
      items: [
        { ar: 'الْبَدْءُ بِالسَّلَامِ', en: 'Greeting first with salaam', bin: 0, why: 'Greeting first with salaam is a word Allah loves, and it spreads peace between people.' },
        { ar: 'قِرَاءَةُ الْقُرْآنِ', en: 'Reading the Quran', bin: 0, why: 'Reading the Quran means saying the words Allah sent down, and every letter read brings a reward.' },
        { ar: 'الدُّعَاءُ', en: 'Making dua', bin: 0, why: 'Making dua is asking Allah, and asking Him shows we know that He alone can give.' },
        { ar: 'الذَّهَابُ إِلَى الْمَسْجِدِ', en: 'Going to the mosque', bin: 1, why: 'Going to the mosque to pray is an action Allah loves, and every step toward it is rewarded.' },
        { ar: 'الصَّدَقَةُ', en: 'Giving charity', bin: 1, why: 'Giving charity is an action Allah loves, and it helps people in need.' },
        { ar: 'زِيَارَةُ الْأَقَارِبِ', en: 'Visiting relatives', bin: 1, why: 'Visiting relatives keeps family ties strong, which Allah commands.' },
      ] },
    { k: 'sort', title: 'Loved or Disliked', hint: 'Drag each action to Allah loves or Allah dislikes. We are sorting actions, never people.', bins: ['Allah loves', 'Allah dislikes'], sample: 4,
      items: [
        { ar: 'الصِّدْقُ', en: 'Telling the truth even when it is uncomfortable', bin: 0 },
        { ar: 'عِصْيَانُ الْوَالِدَيْنِ', en: 'Ignoring your parents when they ask for help', bin: 1 },
        { ar: 'أَذِيَّةُ الْجَارِ', en: 'Being rude to a neighbour', bin: 1 },
        { ar: 'الصَّدَقَةُ', en: 'Giving to charity', bin: 0 },
        { ar: 'تَرْكُ الْكَذِبِ', en: 'Leaving lying', bin: 0 },
      ] },
    { k: 'order', title: 'Build the Argument', hint: 'Put the cards in order so that each one leads to the next, ending in the conclusion.', lights: true,
      items: ['Allah created me.', 'Allah provides for me.', 'Allah manages every affair.', 'So worship belongs to Allah alone.'] },
    { k: 'wordbank', title: 'Complete the Answer', hint: 'Drag each word into the sentence where it belongs. Each word is used once.',
      items: [
        { before: 'Worship is everything Allah', after: 'of words and actions.', answer: 'loves' },
        { before: 'Asking Allah for anything is called', after: '.', answer: 'dua' },
        { before: 'Doing my part and trusting Allah with the result is called', after: '.', answer: 'tawakkul' },
        { before: 'I worship Allah because I', after: 'Him.', answer: 'love' },
      ] },
    { k: 'arabic', title: 'Arabic and English', hint: 'Drag a line from each Arabic line to its meaning.', sample: 4,
      pairs: [
        [CREATED, CREATED_EN],
        [CALL, 'I must call on Allah and never call on anyone else together with Him.'],
        [LOVE_SHORT, 'I love Allah and I obey Him.'],
        [FEAR, 'A Muslim fears Allah and does not disobey Him.'],
        [PRAY, 'I pray because I love Allah and obey Him.'],
        [WORSHIP, WORSHIP_EN],
      ] },
    { k: 'speak', title: 'Speak', hint: 'Record your answer, then play it back.',
      items: [
        { prompt: 'A friend who has never heard the word worship asks what it means. Explain it in thirty seconds.', seconds: 30 },
        { prompt: 'Tell a grown up about one thing you did today that counts as worship.', keep: true, seconds: 30 },
      ] },
    { k: 'moments', title: 'A Day of Worship', hint: 'Take your time. There is no score and no end.',
      intro: 'Tap the moments in this day. Each one can become worship.',
      image: 'art/tawheed5/day.jpg', alt: 'A neighbourhood from sunrise to night: a house door opening, neighbours greeting, a school gate, a child with a chipped cup, shopping carried in, a mosque, a worried child on a bench, and a warm window at night',
      line: 'Your whole day can belong to Him.',
      spots: [
        { id: 'wake', label: 'Waking up', line: 'Thanking Allah when you wake up turns the first moment of the day into worship.', box: [3.5, 53, 7, 33] },
        { id: 'greet', label: 'Greeting a neighbour', line: 'Saying salaam first to a neighbour is a word Allah loves.', box: [16.5, 53, 9, 33] },
        { id: 'school', label: 'The school gate', line: 'Going to school to learn, with a good intention, can be worship too.', box: [27, 54, 11.5, 42] },
        { id: 'truth', label: 'Telling the truth about a mistake', line: 'Telling the truth, even when it is hard, is worship when it is done for Allah.', box: [40, 49, 10, 47] },
        { id: 'help', label: 'Helping at home', line: 'Helping your family at home is kindness that Allah loves.', box: [51.5, 57, 7.5, 27] },
        { id: 'prayer', label: 'Prayer time', line: 'Praying on time is one of the greatest acts of worship.', box: [62, 12, 12, 64] },
        { id: 'worry', label: 'A worry before a test', line: 'Asking Allah for help and then doing your part is dua and tawakkul together.', box: [75, 61, 11, 35] },
        { id: 'evening', label: 'The evening', line: 'Ending the day by remembering Allah is worship too.', box: [88, 32, 12, 52] },
      ] },
  ],

  quickCheck: {
    scene: { glow: 0.9, settled: true, lift: 0, land: 1, wide: true, tree: 0, birds: false, time: 'dawn', shot: 'town', town: true, worship: 0, windows: 0 },
    final: { glow: 1.45, settled: true, lift: 0.5, worship: 30, windows: 99 },
    windows: true,
    questions: [
      { qEn: 'Why did Allah create you?', aAr: CREATED, aEn: CREATED_EN },
      { qEn: 'Name two kinds of worship that are words and two that are actions.', aEn: 'Words: saying salaam and making dua. Actions: giving charity and visiting relatives.' },
      { qEn: 'What do dua and tawakkul mean?', aEn: 'Dua is asking Allah. Tawakkul is doing my part and trusting Allah with the result.' },
    ],
    badge: 'Level 5 Complete',
    summaryAr: [I_WORSHIP],
    summary: 'I worship Allah, my Lord. Only Allah deserves worship, because only Allah creates, provides and manages every affair.',
  },
};
