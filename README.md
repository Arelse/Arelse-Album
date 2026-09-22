# Arelse Album

A full-stack-style album manager for organizing manhwa pages, meme dumps, and
more — with an on-device "album analyser" that guesses which manhwa an album
is from (or flags it as a meme collection).

## What's actually inside

Because this ships as a standalone installable APK (no server to call home
to), all data lives **on-device** in local storage rather than in a remote
database — that's the "persistent storage" layer here. Auth is a local
account system (register/login), not tied to any backend. The analyser is a
lightweight on-device heuristic (tag/keyword matching against a small
reference set), not a hosted ML model — swap `src/utils/analyser.js` for a
real API call if you want true image recognition.

## Run it as a website (fastest way to try it)

npm install
npm run dev

## Get the APK

Push this repo to GitHub, open the Actions tab, download the
`arelse-album-apk` artifact when the workflow finishes, and install it on
your phone (allow "install from unknown sources" if prompted).

## Notes / honest limitations
- Debug-signed APK — fine for your own device, not Play Store ready.
- Data is local to the device; no cross-device sync or real backend.
- The manhwa/meme detection is a heuristic demo, not a trained vision model.
