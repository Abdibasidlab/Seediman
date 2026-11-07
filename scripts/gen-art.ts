// Generates lesson illustrations with Gemini image models from the art prompts in each level's doc.
// Run: npm run art                   (skips images that already exist; delete the master in art/ to regenerate one)
// Icons are asked for on plain white, which the app blends into the card (mix-blend-mode: multiply) —
// image models paint a fake checkerboard when asked for "transparent".
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const key = process.env.GEMINI_API_KEY ?? /GEMINI_API_KEY=(.+)/.exec(readFileSync('.env.local', 'utf8'))?.[1]?.trim();
const MODELS = ['gemini-3.1-flash-image', 'nano-banana-pro-preview', 'gemini-2.5-flash-image'];
// 2K masters live in art/ (not shipped); the app loads web-sized copies from public/art/ (icons 600 px, scenes 1600 px)
const MASTER = join(import.meta.dirname, '..', 'art');
const OUT = join(import.meta.dirname, '..', 'public', 'art');
const webCopy = (src: string, dst: string, aspect: string) => {
  mkdirSync(dirname(dst), { recursive: true });
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', src, '-vf', `scale=${aspect === '1:1' ? 600 : 1600}:-2:flags=lanczos`, '-q:v', '3', dst]);
};

const STYLE_ICON = 'flat vector illustration style, clean bold outline, no gradients, centred on a plain pure white background with generous empty margin, square image, children\'s educational app icon, calm and gentle, no people, no text, no letters, no writing';
const STYLE_SCENE = 'warm flat vector illustration, clean bold outlines, warm muted palette of cream, terracotta, sage green, dusty blue, soft brown and gold, flat shading, no gradients, no people, no faces, no text, no letters, no writing anywhere';

export const ART: { file: string; aspect: '1:1' | '16:9' | '4:3'; prompt: string }[] = [
  // Tawheed Level 3 — Learn card icons
  { file: 'tawheed3/icon-food.jpg', aspect: '1:1', prompt: `A small icon showing a short curved line joining three small shapes in order, a rain cloud, a green sprout and a round loaf of bread, dusty blue, sage green and warm brown tones, ${STYLE_ICON}.` },
  { file: 'tawheed3/icon-creatures.jpg', aspect: '1:1', prompt: `A small icon showing a small bird carrying a single seed in its beak, warm terracotta, cream and sage green tones, ${STYLE_ICON}.` },
  { file: 'tawheed3/icon-bowl.jpg', aspect: '1:1', prompt: `A small icon showing a simple wooden bowl of fruit with a soft glowing light above it, warm terracotta, sage green and gold tones, ${STYLE_ICON}.` },
  { file: 'tawheed3/icon-jar.jpg', aspect: '1:1', prompt: `A small icon showing a small clay jar with many tiny glowing lights rising out of it, more lights than could be counted, warm gold, cream and terracotta tones, ${STYLE_ICON}.` },
  // Tawheed Level 3 — Count the Blessings exploration scene
  { file: 'tawheed3/blessings.jpg', aspect: '16:9', prompt: `A cosy home interior in soft morning light, with an open window looking onto a garden with trees, birds and a clear sky. Inside, a wooden table holds a loaf of bread, a small plate of dates, a clay water jug with a cup and a bowl of fruit, with a lamp, a shelf of closed books with blank spines, a potted plant, and a bed with a folded blanket in the corner. Many small distinct objects, each clearly separated from the others so it can be tapped. ${STYLE_SCENE}. 16:9 landscape.` },
  // Tawheed Level 3 — Speak prompts
  { file: 'tawheed3/meal.jpg', aspect: '4:3', prompt: `A cloth laid on grass in morning gold light holding a round loaf of bread, a small bowl of dates and a clay jug of water, simple and calm, seen from slightly above. ${STYLE_SCENE}.` },
  // Tawheed Level 4 — one wide scene per Learn panel, and the three lights for Panel 5
  { file: 'tawheed4/day-night.jpg', aspect: '16:9', prompt: `A wide calm panorama. On the left, a low sun rising over a hill in warm gold and cream. On the right, a dusk sky with a crescent moon and a few first stars over the same hills. Soft palm trees on the hills, a lot of open sky. ${STYLE_SCENE}. 16:9 landscape.` },
  { file: 'tawheed4/life.jpg', aspect: '16:9', prompt: `Three small calm scenes side by side in one landscape: a seed sprouting from brown soil, an egg cracking with a small chick stepping out, and a wilted flower lifting its petals under gentle rain. Lots of empty space around each scene. ${STYLE_SCENE}. 16:9 landscape.` },
  { file: 'tawheed4/mountain.jpg', aspect: '16:9', prompt: `A great snow-capped mountain with a separate grey rain cloud drifting across the sky above and to one side of it, rain falling from the cloud, the cloud clearly not touching or coming out of the peak (not a volcano), and a distant city skyline with a few small lights coming on at the horizon. Lots of open sky. ${STYLE_SCENE}. 16:9 landscape.` },
  { file: 'tawheed4/dawn.jpg', aspect: '16:9', prompt: `A quiet, wide dawn over gentle green hills with a few trees and a soft golden light on the horizon, a lot of calm open sky. ${STYLE_SCENE}. 16:9 landscape.` },
  { file: 'tawheed4/icon-lights.jpg', aspect: '1:1', prompt: `A small icon showing three small glowing lights in a row joined by a thin curved line, warm gold and cream tones, abstract, ${STYLE_ICON}.` },
  // Tawheed Level 5 — Learn panel icons (calmer and more refined than earlier levels) and the A Day of Worship panorama
  { file: 'tawheed5/icon-dua.jpg', aspect: '1:1', prompt: `A small icon showing two open hands raised together, palms up, with a soft glow above them, only the hands with no arms or body, warm terracotta, cream and gold tones, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed5/icon-love.jpg', aspect: '1:1', prompt: `A small icon showing a traditional lantern with a soft heart shaped flame inside, warm gold and terracotta tones, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed5/icon-words.jpg', aspect: '1:1', prompt: `A small icon showing a simple empty speech bubble beside an open hand, only the hand with no arm or body, sage green and cream tones, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed5/icon-tawakkul.jpg', aspect: '1:1', prompt: `A small icon showing a young tree with deep visible roots under the ground, standing steady while a gentle wind bends the grass beside it, sage green, soft brown and dusty blue tones, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed5/day.jpg', aspect: '16:9', prompt: `A wide flat vector illustration of a calm neighbourhood from morning to night in one panorama, the sky changing from sunrise on the left to a starry night on the right. From left to right, clearly separated: a house at sunrise with an open door and a small figure stepping out; two figures greeting each other on a neighbour's front step; a school gate with a small figure carrying a school bag; a small figure holding a broken cup, standing beside a grown up; a small figure carrying shopping bags into a house; a small mosque with a dome, a minaret and a garden; a small figure sitting alone on a bench with a book, looking worried; and on the right a home window glowing warmly at dusk under a starry sky. The few human figures are small, modestly dressed, and completely faceless: no eyes, no nose, no mouth drawn, just smooth plain heads. Calm and refined, less bouncy than a cartoon. Warm muted palette of cream, terracotta, sage green, dusty blue and gold, clean bold outlines, flat shading, no gradients, no text, no letters, no writing on any sign. 16:9 landscape.` },
  // Tawheed Level 6 — Learn panel icons and the A Year in the Life panorama (boys and men only: one gender per scene)
  { file: 'tawheed6/icon-door.jpg', aspect: '1:1', prompt: `A small icon showing a simple open doorway with warm light coming through it, cream and gold tones, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed6/icon-pillars.jpg', aspect: '1:1', prompt: `A small icon showing five simple pillars of equal height standing on a low base and supporting a plain flat roof, cream, sage green and soft brown tones, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed6/icon-compass.jpg', aspect: '1:1', prompt: `A small icon showing a simple round compass with a gold needle pointing steadily, dusty blue and gold tones, no letters or markings on the dial, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed6/icon-heart.jpg', aspect: '1:1', prompt: `A small icon showing a small heart resting calmly on a firm round stone, terracotta, cream and sage green tones, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed6/year.jpg', aspect: '16:9', prompt: `A wide flat vector illustration in five connected vignettes across one landscape, moving left to right through a year, each vignette clearly separated. First, a man standing calmly with his right index finger raised in quiet declaration, outdoors in morning light. Second, a man praying on a prayer mat at dawn beside a window. Third, a crescent moon over a rooftop, with a table laid for a quiet evening meal of dates and water below. Fourth, a boy placing coins into a small wooden charity box. Fifth, a distant view of the Kaaba as a simple black cube with a gold band in a white courtyard, with small male pilgrims in white circling it, drawn simply and respectfully. All figures are boys and men only, modestly dressed, and completely faceless: no eyes, no nose, no mouth drawn, just smooth plain heads. Calm and refined. Warm muted palette of cream, terracotta, sage green, dusty blue and gold, clean bold outlines, flat shading, no gradients, no text, no calligraphy, no letters, no writing anywhere. 16:9 landscape.` },
  // Tawheed Level 7 — Learn panel icons and the A Day With the Prophet's Guidance panorama (girls and women only: one gender per scene)
  { file: 'tawheed7/icon-book.jpg', aspect: '1:1', prompt: `A small icon showing an open book with a soft glow rising from its pages, cream, terracotta and gold tones, no writing inside the book, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed7/icon-globe.jpg', aspect: '1:1', prompt: `A small icon showing a simple globe outline with a few soft light rays radiating outward from one point, dusty blue, cream and gold tones, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed7/icon-lantern.jpg', aspect: '1:1', prompt: `A small icon showing a plain simple lantern with a steady humble flame, no ornamentation, warm terracotta and cream tones, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed7/icon-seal.jpg', aspect: '1:1', prompt: `A small icon showing a single door with a gentle seal or wax stamp shape beside it, sage green, gold and cream tones, abstract, calm and refined, ${STYLE_ICON}.` },
  { file: 'tawheed7/day.jpg', aspect: '16:9', prompt: `A wide flat vector illustration of a calm home and neighbourhood scene in soft daylight, from morning on the left to evening on the right in one panorama. The layout is one single horizontal row of exactly six tall narrow columns of identical width, each column running the full height of the image, separated by thin cream lines. There is only one row, never two rows, and no scene is repeated. A single faceless girl, modestly dressed in a headscarf, appears in every vignette. First, at a breakfast table greeting her mother and sisters. Second, in the kitchen speaking honestly with her mother beside a small broken cup. Third, at a neighbour's doorstep handing a plate of food to an elderly woman. Fourth, sitting on her knees on a small prayer mat in the sitting position of Muslim salah, her hands resting flat on her thighs, her palms apart and never pressed together. Fifth, sitting patiently beside her younger sister and helping her with a puzzle. Sixth, by a window at dusk with her hands resting calmly. Every person is female, faceless and modestly dressed, with no facial features at all. No men or boys. Warm muted palette of cream, terracotta, sage green, dusty blue and gold, clean bold outlines, flat shading, no gradients, no text, no letters, no writing anywhere. 16:9 landscape.` },
  { file: 'tawheed3/rain.jpg', aspect: '4:3', prompt: `Gentle rain falling from soft grey-blue clouds onto a green field with young plants, calm and peaceful, a little warm light breaking through. ${STYLE_SCENE}.` },
];

async function generate(prompt: string, aspect: string) {
  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key! },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect, imageSize: '2K' } } }),
      }).catch(() => null);
      const j = res ? await res.json().catch(() => null) : null;
      const part = j?.candidates?.[0]?.content?.parts?.find((p: { inlineData?: unknown }) => p.inlineData);
      if (part) return { data: Buffer.from(part.inlineData.data, 'base64'), model };
      await new Promise(r => setTimeout(r, 2500));
    }
  }
  return null;
}

const only = process.argv.slice(2);
for (const a of ART) {
  if (only.length && !only.some(o => a.file.includes(o))) continue;
  const master = join(MASTER, a.file), web = join(OUT, a.file);
  if (!existsSync(master)) {
    mkdirSync(dirname(master), { recursive: true });
    const img = await generate(a.prompt, a.aspect);
    if (!img) { console.log(`✗ ${a.file}`); continue; }
    writeFileSync(master, img.data); console.log(`✓ ${a.file} (${img.model})`);
  }
  if (!existsSync(web)) webCopy(master, web, a.aspect);
}
