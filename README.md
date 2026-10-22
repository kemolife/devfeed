# BitFeed

Swipe feed for embedded devs: 15 cards a day of C / C++ / Rust / electronics puzzles,
"spot the bug" snippets and firmware PR reviews. Then it tells you to stop.

```
devfeed/
  app/        React + Vite + TS PWA (installable on Android)
    public/cards.json   ← all content lives here
  verifier/   Rust CLI: schema check + compiles and runs code cards
  inbox/      daily generated cards before merge
  GENERATE.md prompt for the daily scheduled Claude task
```

## Run

```bash
cd app && npm install && npm run dev      # http://localhost:5180 (also on your LAN IP)
npm test -- run                           # unit tests
```

## Content pipeline

```
scheduled Claude task ──writes──▶ inbox/<date>.json
        │
        ▼
verifier merge ──compile + run──▶ app/public/cards.json ──git push──▶ hosted app ──▶ phone
```

```bash
cargo run --release --manifest-path verifier/Cargo.toml -- check app/public/cards.json
cargo run --release --manifest-path verifier/Cargo.toml -- merge app/public/cards.json inbox/2026-10-23.json
```

## On Android

Host `app/dist` on any static HTTPS host (GitHub Pages, Cloudflare Pages, Netlify).
Open it in Chrome → menu → **Add to Home screen / Install app**. Works offline.
For a Play Store APK later: wrap the same build with Tauri 2 or Capacitor.
