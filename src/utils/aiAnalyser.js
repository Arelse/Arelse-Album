import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'

// Real on-device image classification (MobileNet, trained on ImageNet).
// This is a genuine trained neural network doing genuine inference on the
// device — not a lookup table. Two honest limits worth knowing:
// 1. It needs network access the first time it runs, to fetch the ~16MB
//    model weights. The browser cache then makes later runs fast, and
//    often work offline too, until that cache gets cleared.
// 2. MobileNet knows ~1000 general real-world ImageNet categories (dog
//    breeds, furniture, food, vehicles...). It was never trained on manhwa
//    art, so it can't name a specific series. What it's genuinely good at
//    is telling comic/illustration art apart from photos, screenshots, or
//    meme-style images — which is what the album analyser uses it for.
let modelPromise = null
let backendReady = false

async function ensureBackend() {
  if (backendReady) return
  await tf.ready()
  backendReady = true
}

function getModel() {
  if (!modelPromise) {
    modelPromise = ensureBackend().then(() => mobilenet.load())
  }
  return modelPromise
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not decode image for AI analysis'))
    img.src = src
  })
}

// Classifies one image and returns lowercase keyword tags derived from the
// model's real predictions (kept if confidence >= 8%).
export async function classifyImage(dataUrl) {
  const model = await getModel()
  const img = await loadImage(dataUrl)
  const predictions = await model.classify(img)
  const tags = new Set()
  for (const p of predictions) {
    if (p.probability < 0.08) continue
    p.className.split(',').forEach(part => {
      part.trim().toLowerCase().split(' ').forEach(word => {
        if (word.length > 2) tags.add(word)
      })
    })
  }
  return { tags: [...tags], raw: predictions }
}
