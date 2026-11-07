# SeedIman

Islamic learning app for children 8–12. Built from the Claude Design handoff (`SeedIman Prototype.dc.html`) with **Tawheed Level 1: Allah is My Lord** as the first full immersive lesson.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/ (works offline, fonts and audio bundled)
npm run narration  # (re)generate narration audio with Gemini TTS
```

## Structure

| Path | What |
| --- | --- |
| `src/data/lessonTypes.ts` | The shape of an immersive lesson (cards, scene cues, evidence, activities) |
| `src/data/tawheed1.ts` … `tawheed7.ts` | Each level's content as one data object; add the next level as `tawheed8.ts` and list it in `lessons.ts` and `scripts/gen-narration.ts` |
| `src/data/topics.ts` | The six topics, their paths, and the sample lessons for the other five |
| `src/lesson/` | The five phases (`Presentation`, `LearnCards`, `Reading`, `Practice` (activities one after another), `QuickCheck`) plus `LookAround`; they render whichever lesson they're given |
| `src/components/DawnScene.tsx` | Three.js scene; lessons drive it with cues: light glow and lift, land lighting up, wider view, tree, birds, animal |
| `src/lib/audio.ts` | Narration, word highlighting, Quran word-by-word playback, sound effects |
| `scripts/gen-narration.ts` | Gemini TTS → `public/audio/narration/*.wav` + `manifest.json` |

## Audio

- **Narration**: generated with Gemini TTS (voice *Kore*, model `gemini-3.1-flash-tts-preview`). The key is read from `.env.local` (`GEMINI_API_KEY=…`, git-ignored) at generation time only and is never shipped to the browser. After editing any lesson text, re-run `npm run narration`: it records only new or changed lines and deletes recordings of lines that no longer exist. If the main model's daily quota runs out, the script continues on `gemini-2.5-pro-preview-tts` (same Kore voice) and tags those lines; run `npm run narration -- --upgrade` on a later day to re-record them with the main model. The device's built-in voice is never used; a line without a recording is highlighted silently (and logged in the console).
- **Quran recitation**: Mishary Alafasy for every ayah, from everyayah.com (`https://everyayah.com/data/Alafasy_128kbps/SSSAAA.mp3`, found via UmmahAPI's free `/api/quran/audio/{surah}/{ayah}`, no key needed), saved in `public/audio/quran/SSSAAA.mp3`. For a new ayah: download it, add `audio` to the lesson's evidence with every word of the ayah, then run `npm run align-quran -- --write` and spot-check any boundary marked "no clear dip". Ayat are always complete: every word is shown with its meaning and lit as it is recited, and the recording plays to its natural end. Word start times (`t`) live in the lesson data; adjust one there if a highlight feels early or late. After the recitation, the English translation is narrated (Gemini) with each word lit.

## Deep links (for demos)

`#onboarding`, `#home`, `#learn`, `#progress`, `#parent`, `#tawheed/0` … `#tawheed/4` (Level 1: Presentation … Quick Check), `#tawheedN/0` … `#tawheedN/4` for Level N (1 to 7).

## Content guardrails

Nothing depicts Allah or the Prophet ﷺ. Icons are abstract: light for Lord, a crescent for religion, a lantern for the Prophet ﷺ. In recall prompts and the Quick Check, answers are offered as full sentences, never as "Allah" set among created things.

- Ayat are always complete — never a phrase cut from an ayah.
- Narration stays with the curriculum's wording ("Allah created…"); nothing that could read as creation being Allah.
- A question never has several true options with only one accepted; when all are true, "All of the above" is the answer.
