# 🧠 Brain Arena

> **Warning: may cause sudden intelligence 🧠⚡**

Brain Arena is a fun (and slightly silly) brain-training website with **5 mini games in one place**, hosted by **Brainy**, an original cartoon brain mascot who reacts live to everything you do. It is a demo project: every game is small but fully playable, polished and family-friendly.

## 🌐 Live demo

- **Live site:** _coming soon (added after the first Vercel deploy)_
- **Source:** https://github.com/DIVYAPRIYADHARSHINI-GIT/brainarena

## 🎮 Games

| Game | What you do | Score |
| --- | --- | --- |
| ➗ **Quick Math** | Solve arithmetic against a **60-second** timer. Easy / Medium / Hard. 3+ correct in a row starts a **combo bonus** (up to x3). Keypad or physical keyboard. | Points |
| 🃏 **Memory Match** | Flip cards to find pairs. Themes: **animals, flags, space** (all custom SVG). Boards **4x4** or **6x6**, with timer and move counter. | Points (fewer moves + faster = more) |
| 🔤 **Word Hunt** | Wordle-style **daily 5-letter word** in 6 guesses, green/yellow/grey hints, on-screen keyboard, **shareable emoji result**, unlimited practice words. | 600 → 100 pts |
| ⚡ **Reaction Time** | Tap when the screen turns **green**. 5 rounds, average reaction time in **milliseconds**. Tap too early: *"Too soon, impatient human!"* | Average ms (lower is better) |
| ❓ **Quiz Blitz** | **10 multiple-choice questions** (science, sports, geography, tech + funny ones) with a **15 s timer** per question and instant feedback. | 100 pts + speed bonus |

Every game has **Pause / Resume**, **Restart** and a **How to play** popup (opens automatically on your first visit).

## ✨ Features

- **Home page**: game cards with custom icon, short description, personal best and Play button, plus your rank and total points.
- **Daily Challenge**: one game per day, picked from the date (every 5-day block plays all 5 games). Playing it extends a **"come back tomorrow" streak** (+50 bonus points), with a live countdown to the next challenge.
- **Scores & progress**: personal best per game, total points, play history (last 50 games) and a **brain-stats radar chart** (speed, memory, logic, knowledge) on the Profile page (Recharts).
- **Local leaderboard**: top 10 scores per game, with your nickname.
- **14 badges**, including *Potato Brain 🥔* (first loss), *Speedy Gonzalez ⚡* (< 300 ms average), *Brain on Fire 🔥* (5 wins in a row), *Night Owl 🦉* (playing after midnight), *Comeback Kid 💪*, *Mind Reader 🔮*, *Elephant Memory 🐘*, *Know-It-All 🤓* and more.
- **Rank titles by total points**: Sleepy Potato 🥔 (0) → Curious Cat 🐱 (300) → Clever Fox 🦊 (1,000) → Brain Wizard 🧙 (2,500) → Galaxy Brain 🌌 (5,000).
- **Sound effects** with a mute toggle: boing, cartoon fail trumpet, crowd cheer, slide whistle, dings and a fanfare. Plus smooth animations and **confetti on wins and new high scores**.
- **3 languages**: English, Tamil (தமிழ்) and Hindi (हिन्दी), with a live language switcher. Word Hunt stays English. Adding a language takes 3 steps (see below).
- **Light / dark mode**, fully responsive (desktop and mobile, touch-friendly), plus loading and empty states.
- Everything is stored in **localStorage**. No accounts, no database.

## 😂 Fun & humor

- **Brainy**, an original SVG mascot with **happy, shocked, sleepy, crying, dancing and thinking** faces. Brainy thinks while you play, cheers your wins, cries at losses, gasps at wrong answers and gets sleepy after midnight.
- **Funny lines everywhere**: 10 per situation per language (win, lose, new best, loading, too soon, correct, wrong, jokes, do-not-press). A shuffle-bag picker uses every line before any repeats.
- **Funny loading messages**: *"Warming up neurons..."*, *"Feeding Brainy some coffee..."*, *"Untangling brain wires..."*
- **Funny quiz questions** (e.g. *"How many legs does a spider have... if it is NOT wearing shoes?"*), and every normal question has one silly wrong option (*"Cute Purple Unicorn 🦄"*).
- **Easter eggs**
  - Poke Brainy **10 times** → Brainy dances (and you unlock *Dance Machine 💃*).
  - Type **LOL** in Word Hunt → Brainy tells you a joke.
  - The footer has a red **"Do not press"** button. It flips the page upside down, rains potatoes, wobbles the page and more (all harmless).
- **Funny 404 page**: *"Brainy lost this page somewhere in its memory"*.
- All humor is friendly, positive and family-safe. The Tamil and Hindi lines are written in natural local style (filter coffee, kadak chai, ladoo...), not word-for-word translations.

## 🛠 Tech stack

- **Next.js 16 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS 4** (purple/teal gradient theme, class-based dark mode)
- **Recharts 3** (brain-stats radar chart)
- **Web Audio API** for all sound effects (synthesized live, no audio files)
- **localStorage** for scores, streaks, leaderboard, badges and preferences
- Fonts: Baloo 2 / Baloo Thambi 2 / Nunito / Noto Sans Tamil / Noto Sans Devanagari (Google Fonts, self-hosted by `next/font`)
- Hosted on **Vercel** (Hobby plan), auto-deployed from GitHub on every push

### Performance & stability notes

- Stores use `useSyncExternalStore` with **cached snapshots**, so components can never enter a render loop.
- The radar chart is drawn at a fixed size measured once (and on debounced window resize). There is **no ResizeObserver feedback loop**.
- Game timers live in a single interval whose callback is held in a ref. Pausing clears it, and nothing restarts on every render.
- Confetti runs one `requestAnimationFrame` loop that **stops itself** after the particles land (max 4 s).
- Corrupted or old localStorage data is sanitized instead of crashing the app.

## 🚀 Setup

Requirements: **Node.js 22.18+** (developed on Node 26).

```bash
cd brainarena
npm install
npm run dev          # http://localhost:3000
```

Useful scripts:

```bash
npm run build        # production build
npm start            # serve the production build
npm run typecheck    # TypeScript
npm test             # unit tests for game logic (node --test)
npm run check:i18n   # every language has every key + 10 lines per pool
npm run words        # regenerate the Word Hunt word list (needs /usr/share/dict/words)
npm run e2e          # browser smoke test (see below)
```

### End-to-end test

`tests/e2e/smoke.mjs` drives your locally installed **Google Chrome** headless through the Chrome DevTools Protocol (no extra npm packages). It plays all 5 games, checks every page on desktop, mobile and dark mode in all 3 languages, and covers the easter eggs, daily challenge, leaderboard, profile chart, reset and 404 page. It also checks that **no page freezes** (a main-thread heartbeat must keep ticking, including during repeated window resizes). Short timeouts and a global watchdog make a stuck page fail fast instead of hanging.

```bash
npm run build && npx next start -p 3200 &
BASE_URL=http://localhost:3200 npm run e2e      # 152 checks
```

Screenshots are written to `tests/e2e/output/` (git-ignored).

## 🌍 Adding a language

1. Copy `src/i18n/en.ts` to `src/i18n/<code>.ts` and translate it (it is typed as `Dict`, so TypeScript flags any missing key).
2. Add the language to `src/i18n/languages.ts` and one import line to `DICTS` in `src/i18n/index.tsx`.
3. Add translations for the quiz questions in `src/lib/quiz.ts`, then run `npm run check:i18n`.

## 📁 Project structure

```
src/
  app/                 # routes: /, /games/*, /leaderboard, /profile, 404, error, loading
  games/               # QuickMath, MemoryMatch, WordHunt, ReactionTime, QuizBlitz
  components/          # Brainy mascot, NavBar, GameShell, charts, confetti, modals...
  i18n/                # en / ta / hi dictionaries + provider
  lib/                 # pure game logic, progress reducer, store, sounds, daily challenge
scripts/               # word-list generator, i18n checker
tests/unit/            # node --test unit tests
tests/e2e/             # headless-Chrome smoke test
```

## 🙏 Credits

- **Sound effects**: all synthesized live in the browser with the Web Audio API (`src/lib/sound.ts`). No third-party audio files are used, so there is nothing to license.
- **Illustrations & icons**: Brainy, the game icons, and the 54 Memory Match card faces (animals, simplified flags, space) are original inline SVGs made for this project. Emoji are rendered by your device's system emoji font.
- **Word list**: answers are a hand-picked list of 402 common, family-friendly words. Valid guesses come from the public-domain `web2` word list shipped with macOS/BSD (`/usr/share/dict/words`, from *Webster's Second International Dictionary*, 1934).
- **Fonts**: [Baloo 2 & Baloo Thambi 2](https://github.com/EkType/Baloo2) (Ek Type), [Nunito](https://github.com/googlefonts/nunito) (Vernon Adams), [Noto Sans Tamil & Devanagari](https://notofonts.github.io/) (Google). All under the SIL Open Font License 1.1, served via Google Fonts.
- **Libraries**: Next.js, React, Tailwind CSS and Recharts (MIT).

## 📄 License

MIT © 2026 Divya Priyadharshini
