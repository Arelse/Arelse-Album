# Arelsync

An album manager for manhwa pages, memes, and real photos from your
device — with a persistent "Whole Gallery" library, a real on-device AI
analyser, and a visual-similarity Recognizer that can auto-sort your
gallery into per-series albums.

## What's real here

- Custom icon, generated at build time from `assets/icon.png`.
- Gallery import via Capacitor's official Camera plugin — opens Android's
  actual native photo picker.
- Whole Gallery (sidebar): a persistent library — every photo you import
  sticks around here permanently, independent of any album.
- The AI analyser and Recognizer both run MobileNet, a real trained
  neural network, entirely on-device via TensorFlow.js.
- Edit cover lets you set any album's cover to one of its own photos, or
  import a fresh one.
- 14 themes, real Guest login, real local email/password accounts.
- Registers an Android intent-filter so the app shows up in "Open with"
  when viewing images elsewhere on the phone.

## Two honest limits

**"Set as default gallery"**: Android controls default-app behavior at the
OS level (Settings → Apps → Default apps), not something an app can force.
Arelsync registers as a genuine "Open with" option for images instead.

**Real Gmail/Google sign-in**: genuine Google OAuth needs a client ID you
create yourself in Google Cloud Console, tied to this app's package name
and signing certificate. Local email/password accounts and Guest mode are
real and implemented instead.

## The Recognizer, honestly

MobileNet was trained on ~1000 general ImageNet categories, never on
manhwa art, so it can't name a series from nothing. The Recognizer
compares the visual fingerprint of gallery photos against example images
you label per series — real similarity search, but accuracy depends on
how visually distinct your examples are. Treat matches as suggestions.

"Whole gallery" scope: doesn't silently mirror your entire phone library
in the background. Every photo you explicitly import via "+ Import" is
added permanently, building a real, complete library over time.

## Run it as a website

npm install
npm run dev

## Get the APK

Push to GitHub, open the Actions tab, download the `arelsync-apk`
artifact when the workflow finishes, and install it.

## Other notes

- Debug-signed APK — fine for your own device, not Play Store ready.
- All data lives on-device: albums/gallery/reference series in IndexedDB,
  auth as a local account system.
