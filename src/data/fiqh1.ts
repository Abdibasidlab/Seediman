// SeedIman — Fiqh Level 1: Purity and Cleanliness (pages 9 to 11 of the book, with the toilet etiquette on page 10).
// A new style for Fiqh: the Presentation is a calm walkthrough of a 3D room (world: 'room'), objects, water and light only.
// Arabic comes only from the content file, copied exactly. Before launch, per the content file: compare the vowel marks of
// the two duas with the print, have a scholar confirm the English of الخبث والخبائث, and have the whole level reviewed.
// Written here, not in the content file: the Quick Check answers, the Ready Room's closing line, and the word meanings of
// the ayah. No person is ever shown near a bathroom; the toilet topic uses objects only.
// Interface copy written here uses no hyphens or dashes.
import type { Evidence, ImmersiveLesson } from './lessonTypes';

const TAHARA = 'الطَّهَارَة';
const WUDU = 'الْوُضُوء';
const IZALA = 'إِزَالَةُ النَّجَاسَةِ';
const ISTINJA = 'اسْتِنْجَاءً';
const ISTIJMAR = 'اسْتِجْمَارًا';
const ENTER = 'بِسْمِ اللهِ اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ';
const ENTER_EN = 'In the name of Allah. O Allah, I seek Your protection from evil and evil things.';
const GHUF = 'غُفْرَانَكَ';
const GHUF_EN = 'I ask for Your forgiveness.';

const MUDDATHTHIR_4: Evidence = {
  audio: 'audio/quran/074004.mp3',
  words: [{ ar: 'وَثِيَابَكَ', en: 'And your clothes', t: 0.1 }, { ar: 'فَطَهِّرْ', en: 'purify', t: 1.2 }],
  en: '“And purify your clothes.”',
  ref: 'Surah Al Muddaththir, 74:4',
};

export const FIQH_1: ImmersiveLesson = {
  id: 'fiqh-1', level: 1, topic: 'Fiqh', title: 'Purity and Cleanliness', minutes: 12, world: 'room',

  pillars: [
    {
      key: 'duty', icon: 'sprout', image: 'art/fiqh1/duty.jpg',
      word: { ar: TAHARA, tr: 'taharah', en: 'Purity. Being clean in the way Allah taught us, so we are ready to pray.' },
      qEn: 'Why do Muslims clean themselves before they pray?',
      aEn: 'Because Allah commanded us to be pure. Purity is a duty from Allah, and prayer needs it.',
      lines: [{ lead: 'Think', kind: 'turn', en: 'When you obey Allah’s command about something small, like washing, what are you showing Him?' }],
      evidence: MUDDATHTHIR_4,
    },
    {
      key: 'two', icon: 'sprout', image: 'art/fiqh1/two.jpg',
      word: [
        { ar: WUDU, tr: 'wudu', en: 'The washing we do with clean water before prayer.' },
        { ar: IZALA, tr: 'izalat an najasah', en: 'Removing impurity. Cleaning away what makes our body, clothes or prayer place unfit for prayer.' },
      ],
      qEn: 'What do we do to be pure before prayer?',
      aEn: 'Two things. First, we make wudu: we wash with clean water before we pray. Second, we remove impurity from our body, our clothes and the place where we pray, using water.',
      lines: [{ lead: 'Think', kind: 'turn', en: 'Which one of these have you already seen someone you love do?' }],
      parentsNote: 'Wudu is taught step by step in Level 3. This level only gives the idea, so your child knows what is coming.',
    },
    {
      key: 'toilet', icon: 'sprout', image: 'art/fiqh1/toilet.jpg',
      word: [
        { ar: ISTINJA, tr: 'istinja', en: 'Cleaning with water.' },
        { ar: ISTIJMAR, tr: 'istijmar', en: 'Cleaning with stones or tissue.' },
      ],
      qEn: 'After we use the toilet, how do we become clean again?',
      aEn: 'We clean the place until the impurity is gone. With water, this is istinja. With stones or tissue, this is istijmar.',
      lines: [{ lead: 'Think', kind: 'turn', en: 'Why do we keep cleaning until the impurity is really gone, and not just a little?' }],
      parentsNote: 'This topic is taught briefly, plainly and without any picture of a person. Children may ask questions. Please answer them in your own way, with calm and privacy.',
    },
    {
      key: 'duas', icon: 'sprout', image: 'art/fiqh1/door.jpg',
      qEn: 'What do we say before we go into the bathroom, and when we come out?',
      aEn: 'Before going into the bathroom, we ask Allah for protection from evil and evil things. When we come out, we ask for His forgiveness.',
      lines: [
        { lead: 'Think', kind: 'turn', en: 'Which dua do you want to remember first? Say it out loud once.' },
        { lead: 'When entering', kind: 'name', ar: ENTER, en: ENTER_EN, note: 'Narrated by Bukhari (142) and Muslim (122).' },
        { lead: 'When leaving', kind: 'name', ar: GHUF, en: GHUF_EN, note: 'Narrated by Abu Dawud (30) and Tirmidhi (7), who said it is hasan gharib.' },
      ],
    },
  ],

  presentation: {
    predict: 'What do you think?',
    start: { light: 0.35, focus: 'room', tap: false, panels: 0, shelf: 0, tags: 0, door: 0, matOpen: false, roomLit: 0 },
    beats: [
      { k: 'say', solo: true, cue: { light: 0.6 }, lines: ['Before you meet someone important, you get ready. You wash. You tidy up. You stand properly.', 'Five times every day, Muslims stand before Allah in prayer. So Allah taught us how to get ready for it.'] },
      { k: 'say', lines: ['That getting ready has a name.'], cue: { focus: 'tap', tap: true } },
      { k: 'state', ar: TAHARA, en: 'Purity.', cue: { tap: false } },
      { k: 'state', en: 'Purity is a duty. Allah commanded it.', cue: { focus: 'room', light: 0.7 } },
      { k: 'say', lines: ['Allah did not leave us guessing. He told us in the Quran to keep ourselves pure.'] },
      { k: 'recite', evidence: MUDDATHTHIR_4 },
      { k: 'say', lines: ['There are two parts to purity that we learn first.'] },
      { k: 'state', en: 'Wudu. The washing we do before prayer.', cue: { panels: 1, tap: true } },
      { k: 'state', en: 'Removing impurity. Cleaning our body, our clothes and our prayer place with water.', cue: { panels: 2, tap: false } },
      { k: 'say', lines: ['We use clean water for both. The steps of wudu come in a later level. Today we learn the idea.'] },
      { k: 'say', lines: ['When we use the toilet, we clean the place where the urine or the stool left the body, until the impurity is gone.'], cue: { panels: 0, focus: 'shelf', shelf: 4 } },
      { k: 'state', lead: 'If we use water, this is called', ar: ISTINJA, en: 'Istinja.', cue: { tags: 1 } },
      { k: 'state', lead: 'If we use stones or tissues, this is called', ar: ISTIJMAR, en: 'Istijmar.', cue: { tags: 2 } },
      { k: 'say', lines: ['The Prophet ﷺ taught us what to say before we go in, and when we come out.'], cue: { focus: 'door', shelf: 0, tags: 0, door: 1 } },
      { k: 'state', ar: ENTER, en: ENTER_EN, sub: 'Said when entering.' },
      { k: 'state', ar: GHUF, en: GHUF_EN, sub: 'Said when leaving.', cue: { door: 2 } },
      { k: 'say', lines: ['Purity comes first, and then the prayer. Next, you will learn exactly how.'], cue: { focus: 'mat', door: 0, matOpen: true, light: 1 } },
    ],
  },

  reading: {
    title: 'Aisha Gets Ready',
    paras: [
      { parts: [{ text: 'It was almost time for Dhuhr. Aisha put down her book and went to find her little sister, Hana.' }] },
      { parts: [{ text: '“Are you ready to pray?” asked Aisha.' }] },
      { parts: [{ text: '“I am,” said Hana. “I have my hijab.”' }] },
      { parts: [
        { text: '“That’s a good start,” said Aisha, smiling. “But first we need to be pure. ' },
        { tap: 'Allah commanded us to be pure, and the prayer needs it.”', note: 'Allah says in the Quran, “And purify your clothes.” Being pure is a duty, not a choice.' },
      ] },
      { parts: [{ text: '“What do we do?” asked Hana.' }] },
      { parts: [
        { text: '“Two things,” said Aisha, counting on her fingers. “' },
        { tap: 'We make wudu with clean water.', note: 'Wudu is the washing we do before prayer. You will learn every step soon.' },
        { text: ' And we make sure our body, our clothes and our prayer place are free of impurity.”' },
      ] },
      { parts: [
        { text: 'Aisha thought of what Mum had taught her. “And when we use the toilet, we clean ourselves until the impurity is gone. ' },
        { tap: 'If we use water, it is called istinja. If we use stones or tissue, it is called istijmar.”', note: 'Both ways are correct. The point is that the impurity is really gone.' },
      ] },
      { parts: [
        { text: '“And there are two duas,” said Aisha. “Before going in, we say, Bismillah, O Allah, I seek Your protection from evil and evil things. When we come out, we say ' },
        { tap: `${GHUF}.”`, note: 'Ghufranaka means “I ask for Your forgiveness.”' },
      ] },
      { parts: [{ text: '“I want to learn them,” said Hana.' }] },
      { parts: [{ text: '“We will practise together,” said Aisha. “Today, let’s start with wudu.”' }] },
      { parts: [{ text: 'They walked to the sink side by side, ready to learn.' }] },
    ],
    remember: [
      { en: 'Purity is a duty from Allah.' },
      { en: 'I make wudu and remove impurity with clean water.' },
      { en: 'I say a dua when I go in and when I come out.' },
    ],
  },

  activities: [
    { k: 'sort', title: 'Sort the Actions', hint: 'Drag each action into the box where it belongs.', bins: ['Wudu', 'Removing impurity', 'A dua'],
      items: [
        { en: 'Washing with clean water before prayer', bin: 0 },
        { en: 'Rinsing a garment with clean water', bin: 1 },
        { en: 'Cleaning the prayer place with water', bin: 1 },
        { en: `Saying ${GHUF} when I come out`, bin: 2 },
        { en: 'Asking Allah for protection before going in', bin: 2 },
      ] },
    { k: 'wordbank', title: 'Complete the Sentence', hint: 'Drag each word into the sentence where it belongs. Each word is used once.',
      items: [
        { before: 'Purity is a', after: 'from Allah.', answer: 'duty' },
        { before: 'We use clean', after: 'to make wudu.', answer: 'water' },
        { before: 'Cleaning with water is called', after: '.', answer: 'istinja' },
        { before: 'Cleaning with stones or tissue is called', after: '.', answer: 'istijmar' },
      ] },
    { k: 'hear', title: 'Hear the Dua, Find the Meaning', hint: 'Listen, then choose what it means. You do not need to read the Arabic.',
      items: [
        { ar: GHUF, en: 'I ask for Your forgiveness.' },
        { ar: ENTER, en: 'I seek Your protection from evil and evil things.' },
        { ar: MUDDATHTHIR_4.words.map(w => w.ar).join(' '), en: 'And purify your clothes.', evidence: MUDDATHTHIR_4 },
      ] },
    { k: 'scenes', title: 'Listen and Choose', hint: 'Listen to the scene, then choose what it shows.', sample: 2,
      statements: ['Removing impurity', 'Making wudu', 'Saying a dua'],
      items: [
        { scene: 'A girl is rinsing a garment with clean water until it is clean.', answer: 0 },
        { scene: 'A boy stands by the sink and washes with clean water before prayer.', answer: 1 },
      ] },
    { k: 'build', title: 'Build the Sentence', hint: 'Drag the words into the right order.',
      sentences: [['Purity', 'is', 'a', 'duty', 'from', 'Allah'], ['I', 'make', 'wudu', 'with', 'clean', 'water'], ['O Allah', 'I seek', 'Your protection', 'from evil', 'and evil things']] },
    { k: 'speak', title: 'Say It', hint: 'Listen, record yourself, then play it back.',
      items: [
        { prompt: 'Listen to the dua for going in, then say it back.', modelAr: ENTER, seconds: 20 },
        { prompt: 'Listen to the dua for coming out, then say it back.', modelAr: GHUF, seconds: 10 },
        { prompt: 'Tell a grown up when you will say this dua.', keep: true, seconds: 30 },
      ] },
    { k: 'moments', title: 'The Ready Room', hint: 'Take your time. There is no score and no end.', aspect: 16 / 9,
      intro: 'Tap each object to hear what it teaches.',
      image: 'art/fiqh1/room.jpg', alt: 'Four objects in a calm room: a tap with a water drop, a folded clean garment, a wooden door and a folded prayer mat',
      line: 'Everything is ready. Purity comes first, and then the prayer.',
      spots: [
        { id: 'tap', label: 'The tap', line: 'We use clean water to be pure.', ar: WUDU, box: [0, 0, 25, 100] },
        { id: 'garment', label: 'The garment', line: 'We remove impurity from our clothes.', ar: IZALA, box: [25, 0, 25, 100] },
        { id: 'door', label: 'The door', line: 'We say a dua when we go in and when we come out.', box: [50, 0, 25, 100] },
        { id: 'mat', label: 'The prayer mat', line: 'Purity comes first, and then the prayer.', box: [75, 0, 25, 100] },
      ] },
  ],

  quickCheck: {
    scene: { light: 0.3, focus: 'room', tap: false, panels: 0, shelf: 0, tags: 0, door: 0, matOpen: false, roomLit: 0 },
    final: { light: 1, matOpen: true, roomLit: 3, focus: 'mat' },
    room: true,
    questions: [
      { qEn: 'Who commanded us to be pure?', aEn: 'Allah commanded us to be pure.' },
      { qEn: 'What are the two ways we become pure before prayer?', aEn: 'We make wudu, and we remove impurity from our body, clothes and prayer place.' },
      { qEn: 'What is cleaning with water called, and what is cleaning with stones or tissue called?', aEn: 'Cleaning with water is istinja. Cleaning with stones or tissue is istijmar.' },
    ],
    badge: 'Level 1 Complete',
    summary: 'Purity is a duty from Allah. I make wudu and remove impurity with clean water. I say a dua when I go in and when I come out.',
  },
};
