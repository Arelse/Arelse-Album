import { Camera } from '@capacitor/camera'

// Opens the device's actual native photo picker — your real gallery, not a
// mock — and lets you multi-select photos. On Android this uses the
// system Photo Picker (Android 11+), which doesn't even require a storage
// permission prompt. Also works in a plain browser preview (falls back to
// a standard multi-file input there), so you can test it with `npm run dev`.
export async function pickFromGallery() {
  const result = await Camera.pickImages({ quality: 85 })
  const photos = result?.photos || []
  const dataUrls = []
  for (const photo of photos) {
    const res = await fetch(photo.webPath)
    const blob = await res.blob()
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    dataUrls.push(dataUrl)
  }
  return dataUrls
}
