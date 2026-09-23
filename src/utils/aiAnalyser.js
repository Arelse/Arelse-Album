import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'

let modelPromise = null
let backendReady = false

async function ensureBackend() {
  if (backendReady) return
  await tf.ready()
  backendReady = true
}

export function getModel() {
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

export async function getEmbedding(dataUrl) {
  const model = await getModel()
  const img = await loadImage(dataUrl)
  const activation = model.infer(img, true)
  const data = await activation.data()
  activation.dispose()
  return Array.from(data)
}

export function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}
