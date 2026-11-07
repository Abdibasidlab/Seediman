// SeedIman — Tawheed Level 3: Allah is My Lord (Provision). Curriculum Lessons 2, 5 and 6.
// All Arabic declarations, questions, adhkar and the promise are from the Saudi book (pp. 10–11, 16–19), exactly as
// supplied. Ayat come from `npm run fetch-ayah` and are complete. The English, order, scenes and activities are ours.
import type { ImmersiveLesson, SceneCue } from './lessonTypes';

const AR = {
  rainQ: 'مَنِ الَّذِي يُنْزِلُ الْمَطَرَ مِنَ السَّمَاءِ؟',
  rain: 'اللهُ الَّذِي يُنْزِلُ الْمَطَرَ مِنَ السَّمَاءِ',
  plants: 'اللهُ الَّذِي يُخْرِجُ النَّبَاتَ مِنَ الْأَرْضِ',
  creaturesQ: 'مَنِ الَّذِي يَرْزُقُ جَمِيعَ الْمَخْلُوقَاتِ؟',
  creatures: 'اللهُ الَّذِي يَرْزُقُ جَمِيعَ الْمَخْلُوقَاتِ',
  razzaq: 'اللهُ الرَّزَّاقُ',
  meQ: 'مَنِ الَّذِي رَزَقَكَ؟',
  blessingsQ: 'مَنِ الَّذِي خَلَقَكَ وَرَزَقَكَ النِّعَمَ؟',
  blessings: 'اللهُ الَّذِي خَلَقَنِي وَرَزَقَنِي النِّعَمَ',
  foodDrink: 'اللهُ الَّذِي رَزَقَنِي الطَّعَامَ وَالشَّرَابَ',
  hearingSight: 'اللهُ الَّذِي رَزَقَنِي السَّمْعَ وَالْبَصَرَ',
  many: 'نِعَمُ اللهِ عَلَيْنَا كَثِيرَةٌ',
  hamd: 'الْحَمْدُ لِلَّهِ',
  rainDua: 'مُطِرْنَا بِفَضْلِ اللهِ وَرَحْمَتِهِ',
  seeHear: 'أُبْصِرُ بِعَيْنِي وَأَسْمَعُ بِأُذُنِي فَأَحْمَدُ اللهَ',
  promise: 'أَشْكُرُ اللهَ الَّذِي رَزَقَنِي النِّعَمَ وَأُطِيعُهُ وَلَا أَعْصِيهِ',
};
const EN = {
  rain: 'Allah sends down the rain from the sky.',
  plants: 'Allah brings out the plants from the earth.',
  creatures: 'Allah provides for all creatures.',
  blessings: 'Allah created me and provided me the blessings.',
  foodDrink: 'Allah provided me food and drink.',
  hearingSight: 'Allah provided me hearing and sight.',
  many: 'Allah’s blessings on us are many.',
  hamd: 'All praise and thanks belong to Allah.',
  promise: 'I thank Allah who provided me the blessings, and I obey Him and do not disobey Him.',
};

/** Level 2 ended on a fully lit world; Level 3 warms it and lays a meal on the grass */
const WORLD: SceneCue = { glow: 1, settled: true, lift: 0.45, land: 1, wide: true, tree: 2, birds: true, animal: true, meal: true, wheat: true };

export const TAWHEED_3: ImmersiveLesson = {
  id: 'tawheed-3', level: 3, topic: 'Tawheed', title: 'Allah is My Lord: Provision', minutes: 15,

  pillars: [
    {
      key: 'food', icon: { img: 'art/tawheed3/icon-food.jpg' },
      qEn: 'Where does my food come from?',
      lines: [
        { qAr: AR.rainQ, ar: AR.rain, en: EN.rain },
        { ar: AR.plants, en: EN.plants },
        { kind: 'turn', lead: 'When rain falls we say:', ar: AR.rainDua, en: 'It rained by the favour and mercy of Allah.' },
      ],
      recall: { prompt: 'Quick, who sends down the rain?', options: [EN.plants, EN.rain, EN.creatures], answer: 1, instruction: 'Choose the answer to the question.' },
    },
    {
      key: 'creatures', icon: { img: 'art/tawheed3/icon-creatures.jpg' },
      qAr: AR.creaturesQ, qEn: 'Who provides for all creatures?',
      aAr: AR.creatures, aEn: EN.creatures,
      lines: [
        { kind: 'name', ar: AR.razzaq, en: 'Allah is the Provider, Ar Razzaq.', note: 'This is one of Allah’s beautiful names. We will meet more of them in a later level.' },
      ],
      recall: { prompt: 'Quick, which name means the Provider?', options: ['Ar Rahman', 'Ar Razzaq', 'Al Khaliq'], answer: 1, instruction: 'Choose the name.' },
      // one ayah for Cards 1 and 2: the rain, the plants and every creature
      evidence: {
        audio: 'audio/quran/051058.mp3',
        words: [
          { ar: 'إِنَّ', en: 'Indeed', t: 0.12 }, { ar: 'اللَّهَ', en: 'Allah', t: 1.61 }, { ar: 'هُوَ', en: 'He', t: 2.1 }, { ar: 'الرَّزَّاقُ', en: 'is the All-Provider', t: 2.65 },
          { ar: 'ذُو', en: 'Possessor', t: 4.01 }, { ar: 'الْقُوَّةِ', en: 'of Power', t: 4.29 }, { ar: 'الْمَتِينُ', en: 'the Strong', t: 5.42 },
        ],
        en: '“Indeed, Allah is the Provider, the Possessor of strength, the Firm.”',
        ref: 'Surah Adh Dhariyat, 51:58',
      },
    },
    {
      key: 'me', icon: { img: 'art/tawheed3/icon-bowl.jpg' },
      qAr: AR.meQ, qEn: 'Who provided for you?',
      lines: [
        { qAr: AR.blessingsQ, ar: AR.blessings, en: EN.blessings },
        { ar: AR.foodDrink, en: EN.foodDrink },
        { ar: AR.hearingSight, en: EN.hearingSight },
      ],
      recall: { prompt: 'Quick, who provided you food and drink?', options: [EN.creatures, EN.rain, EN.foodDrink], answer: 2, instruction: 'Choose the answer to the question.' },
    },
    {
      key: 'thanks', icon: { img: 'art/tawheed3/icon-jar.jpg' },
      qEn: 'Can you count Allah’s blessings?',
      aAr: AR.many, aEn: EN.many,
      lines: [
        { lead: 'What do we say?', ar: AR.hamd, en: EN.hamd },
        { kind: 'turn', lead: 'Your turn. Say it after you eat and drink, and complete the sentence out loud:', ar: AR.seeHear, en: 'I see with my eyes and hear with my ears, so I praise Allah.' },
        { kind: 'promise', lead: 'And the promise that closes the lesson:', ar: AR.promise, en: EN.promise },
      ],
      recall: { prompt: 'Quick, name three blessings you were given today.', say: true },
      // one ayah for Cards 3 and 4, complete
      evidence: {
        audio: 'audio/quran/014034.mp3',
        words: [
          { ar: 'وَآتَاكُمْ', en: 'And He gave you', t: 0.01 }, { ar: 'مِنْ', en: 'of', t: 1.85 }, { ar: 'كُلِّ', en: 'all', t: 3.25 }, { ar: 'مَا', en: 'what', t: 4 },
          { ar: 'سَأَلْتُمُوهُ', en: 'you asked of Him', t: 4.34 }, { ar: 'وَإِنْ', en: 'And if', t: 8.05 }, { ar: 'تَعُدُّوا', en: 'you count', t: 9.24 }, { ar: 'نِعْمَتَ', en: 'the favour', t: 10.64 },
          { ar: 'اللَّهِ', en: 'of Allah', t: 11.06 }, { ar: 'لَا', en: 'not', t: 12.1 }, { ar: 'تُحْصُوهَا', en: 'you could count them', t: 12.69 }, { ar: 'إِنَّ', en: 'Indeed', t: 14.8 },
          { ar: 'الْإِنْسَانَ', en: 'mankind', t: 16.11 }, { ar: 'لَظَلُومٌ', en: 'is surely unjust', t: 17.8 }, { ar: 'كَفَّارٌ', en: 'and ungrateful', t: 19.95 },
        ],
        en: '“And He gave you from all you asked of Him. And if you should count the blessings of Allah, you could not enumerate them. Indeed, mankind is generally most unjust and ungrateful.”',
        ref: 'Surah Ibrahim, 14:34',
      },
    },
  ],

  presentation: {
    predict: 'What do you think?',
    start: { ...WORLD, shot: 'meal' },
    beats: [
      { k: 'say', lines: ['Look at this meal. Where did it come from? Let’s follow it back.'], cue: { shot: 'meal' } },
      // the camera does the teaching: meal → field → rain → cloud → open sky; the book's lines fade in quietly below
      { k: 'say', lines: ['Bread. Wheat. Soil. Rain. Sky. And behind every step, a Provider.'], shots: [
        { cue: { shot: 'field' }, ms: 3400, caption: AR.plants },
        { cue: { shot: 'rain', rain: true }, ms: 3800, caption: AR.rain },
        { cue: { shot: 'cloud' }, ms: 2800, caption: AR.rain },
        { cue: { shot: 'wide', rain: false }, ms: 2200 },
      ] },
      { k: 'say', lines: ['Nobody is left out. Every creature has its provision.'], cue: { shot: 'wide', birds: true, animal: true } },
      { k: 'ask', qAr: AR.creaturesQ, qEn: 'Who provides for all creatures?', aAr: AR.creatures, aEn: EN.creatures },
      { k: 'say', lines: ['And what about me?'], cue: { shot: 'meal' } },
      { k: 'ask', qAr: AR.blessingsQ, qEn: 'Who created you and provided you the blessings?', aAr: AR.blessings, aEn: EN.blessings },
      { k: 'say', lines: ['Water, food, sight, hearing, family, home. Try counting them. You can’t.'], cue: { shot: 'wide', rising: 3 } },
      { k: 'state', ar: AR.many, en: EN.many },
      { k: 'say', lines: ['So what do we say?'], cue: { settleLights: true, rising: 0, glow: 1.3 } },
      { k: 'state', ar: AR.hamd, en: EN.hamd, cue: { glow: 1.35 } },
    ],
  },

  reading: {
    title: 'Where Did My Breakfast Come From?',
    paras: [
      { parts: [{ text: 'This morning I ate warm bread, and it made me curious. Where did it really come from?' }] },
      { parts: [
        { text: 'The baker made the bread, but the baker did not make the wheat. The farmer planted the seed, but the farmer could not make the rain fall or make the seed grow. ' },
        { tap: 'Allah sends down the rain from the sky, and Allah brings out the plants from the earth.', note: 'People work, and Allah tells us to take steps. But the rain, the plants and the result all come from Him.' },
      ] },
      { parts: [{ text: 'So the bread on my table was a gift the whole way through. ' }, { tap: 'Allah provided me food and drink.' }] },
      { parts: [
        { text: 'And it is not only me. Think of the birds. They leave their nests in the morning with nothing, and by evening they have found what they need. ' },
        { tap: 'Allah provides for all creatures,', note: 'One of Allah’s beautiful names is Ar Razzaq, the Provider.' },
        { text: ' from the smallest ant to the biggest animal.' },
      ] },
      { parts: [
        { text: 'The more I think about it, the more I notice. Water to drink. Air to breathe. Eyes to see and ears to hear. Sleep at night. A home. People who love me. When I try to count them, I lose count. ' },
        { tap: 'Allah’s blessings on us are many.', note: 'Allah tells us in the Quran that if we tried to count His blessings, we could not.' },
      ] },
      { parts: [{ text: 'So what can I do? I can say الْحَمْدُ لِلَّهِ with my tongue. And I can thank Him by using what He gave me in good ways, with my eyes, my ears, my food and my time.' }] },
      { parts: [{ text: 'So when I say رَبِّيَ اللهُ, I mean that Allah created me, and Allah provides for me.' }] },
    ],
    remember: [
      { ar: AR.creatures, en: EN.creatures },
      { ar: AR.foodDrink, en: EN.foodDrink },
      { ar: AR.many, en: EN.many },
      { ar: AR.promise, en: EN.promise },
    ],
  },

  activities: [
    { k: 'order', title: 'Follow the Food', hint: 'Drag the cards into order, from where the food begins to the moment of thanks.',
      items: ['The rain falls from the sky.', 'The seed grows into wheat.', 'The wheat becomes flour, and the flour becomes bread.', 'The bread is on my table.', 'I say الْحَمْدُ لِلَّهِ.'],
      reveal: { ar: AR.razzaq, en: 'Allah is the Provider.' } },
    { k: 'wordbank', title: 'Complete the Answer', hint: 'Drag each word into the sentence where it belongs. Each word is used once.',
      items: [
        { before: 'Allah sends down the', after: 'from the sky.', answer: 'rain' },
        { before: 'Allah brings out the', after: 'from the earth.', answer: 'plants' },
        { before: 'Allah provides for all', after: '.', answer: 'creatures' },
        { before: 'Allah provided me food and', after: '.', answer: 'drink' },
      ] },
    { k: 'arabic', title: 'Arabic and English', hint: 'Drag a line from each Arabic sentence to its meaning.', sample: 4,
      pairs: [
        [AR.rain, EN.rain], [AR.plants, EN.plants], [AR.creatures, EN.creatures], [AR.blessings, EN.blessings],
        [AR.foodDrink, EN.foodDrink], [AR.hearingSight, EN.hearingSight], [AR.many, EN.many], [AR.razzaq, 'Allah is the Provider.'],
      ] },
    { k: 'listen', title: 'Listen and Choose', hint: 'Listen to the question, then choose the answer that fits it.',
      items: [{ qAr: AR.rainQ, aAr: AR.rain }, { qAr: AR.creaturesQ, aAr: AR.creatures }, { qAr: AR.blessingsQ, aAr: AR.blessings }] },
    { k: 'build', title: 'Build the Sentence', hint: 'Drag the words into order.',
      sentences: [['Allah', 'sends down', 'the rain', 'from the sky'], ['Allah', 'provides', 'for', 'all creatures'], ['Allah', 'provided', 'me', 'food and drink']] },
    { k: 'speak', title: 'Speak', hint: 'Record your answer, then compare it with the model.',
      items: [
        { prompt: 'You have finished eating. What do you say?', image: 'art/tawheed3/meal.jpg', modelAr: AR.hamd },
        { prompt: 'Rain is falling. What do you say?', image: 'art/tawheed3/rain.jpg', modelAr: AR.rainDua },
        { prompt: 'Who sends down the rain from the sky?', promptAr: AR.rainQ, modelAr: AR.rain },
        { prompt: 'Who provides for all creatures?', promptAr: AR.creaturesQ, modelAr: AR.creatures },
        { prompt: 'Who provided for you?', promptAr: AR.meQ, modelAr: AR.blessings },
        { prompt: 'Now say the promise.', modelAr: AR.promise },
      ] },
    { k: 'blessings', title: 'Count the Blessings', hint: 'Tap the things around you. There is no timer and no end.',
      intro: 'Look around this home. Tap everything you can find that Allah has given.',
      image: 'art/tawheed3/blessings.jpg',
      // boxes are [x, y, w, h] in % of the illustration, located by Gemini and checked by eye
      spots: [
        { id: 'bread', label: 'Bread', ar: 'طَعَام', box: [18.6, 70.8, 10.2, 8.7] },
        { id: 'dates', label: 'Dates', box: [31.9, 78, 9.8, 6.7] },
        { id: 'water', label: 'Water', ar: 'شَرَاب', box: [33.9, 60.9, 7.1, 15.6] },
        { id: 'cup', label: 'A cup to drink from', box: [39.6, 72.2, 3.3, 6.8] },
        { id: 'fruit', label: 'Fruit', box: [43.5, 68.3, 9.7, 11.1] },
        { id: 'lamp', label: 'Light', box: [64.7, 38.3, 7.1, 17.2] },
        { id: 'books', label: 'Books to learn from', box: [68.6, 44.9, 13.3, 36.9] },
        { id: 'flowers', label: 'Flowers', box: [81.2, 34.2, 8.6, 20.3] },
        { id: 'plant', label: 'A green plant', box: [57.6, 60.3, 9.8, 27.5] },
        { id: 'bed', label: 'A bed to sleep in', box: [76.2, 53.5, 23.7, 45.4] },
        { id: 'blanket', label: 'A warm blanket', box: [82, 65.5, 18, 31.4] },
        { id: 'air', label: 'Fresh air', box: [9.7, 4.8, 40.6, 65.8] },
        { id: 'trees', label: 'Trees', box: [15, 11.6, 26.5, 53.4] },
        { id: 'birds', label: 'Birds', box: [18.7, 17, 18.9, 43.7] },
        { id: 'clouds', label: 'Clouds', box: [29.8, 16.4, 15.4, 10.4] },
        { id: 'rug', label: 'A soft rug', box: [50.1, 89.4, 37.8, 10.6] },
      ],
      self: [{ id: 'eyes', label: 'My eyes', ar: 'عَيْن' }, { id: 'ears', label: 'My ears', ar: 'أُذُن' }],
      after: 10, line: EN.many, thank: AR.hamd },
  ],

  quickCheck: {
    scene: { ...WORLD, shot: 'wide', glow: 1.05 }, final: { glow: 1.3, settled: true },
    release: true,
    questions: [
      { qEn: 'Who provides for all creatures?', aEn: EN.creatures, aAr: AR.creatures },
      { qEn: 'Who provided you food and drink?', aEn: EN.foodDrink, aAr: AR.foodDrink },
      { qEn: 'What do we say to thank Allah?', aEn: EN.hamd, aAr: AR.hamd },
    ],
    badge: 'Level 3 Complete',
    summaryAr: [AR.promise, AR.hamd],
    summary: 'My Lord is Allah. He created me, and He provides for me.',
  },
};
