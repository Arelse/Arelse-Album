import { classifyImage } from './aiAnalyser.js'

export function newImageId() {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export async function buildImageRecord(dataUrl) {
  let tags = []
  try {
    const result = await classifyImage(dataUrl)
    tags = result.tags
  } catch (e) {
    console.warn('AI classification skipped:', e.message)
  }
  return { id: newImageId(), url: dataUrl, tags, addedAt: Date.now() }
}
