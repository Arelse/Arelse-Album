# Arelse Album

A full-stack-style album manager for organizing manhwa pages, meme dumps,
and real photos from your device — with an on-device AI analyser that
tells comic/illustrated pages apart from memes and screenshots.

## What's real here

- **Gallery import is real.** It uses Capacitor's official Camera plugin,
  which opens Android's actual native photo picker — your whole gallery —
  and lets you multi-select real photos to bring into an album.
- **The AI analyser is real.** It runs MobileNet (a real trained neural
  network) fully on-device via TensorFlow.js to classify each image and
  generate tags from genuine predictions, not hand-typed keywords.
- **No more demo data.** The app starts empty. Every album and photo in it
  is something you actually added.

## Honest limits

- MobileNet knows ~1000 general real-world ImageNet categories. It was
  never trained on manhwa art, so it can't name a specific series. What
  it's genuinely good at: telling comic/illustration-style pages apart
  from photos, screenshots, or meme-style images. Extend `MANHWA_DB` in
  `src/data/seed.js` with your own keywords for closer-to-series matching.
- The AI model (~16MB) needs a network connection the first time it runs;
  after that the browser cache usually makes it fast and often works
  offline too, until that cache is cleared.
- All data lives on-device: albums/images in IndexedDB (localStorage is
  too small for real photos), auth as a simple local account system.
- Debug-signed APK — fine for your own device, not Play Store ready.

## Run it as a website

npm install
npm run dev

## Get the APK

Push to GitHub, open the Actions tab, download the `arelse-album-apk`
artifact when the workflow finishes, and install it on your phone.
