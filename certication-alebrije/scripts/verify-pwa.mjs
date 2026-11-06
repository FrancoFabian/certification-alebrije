import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(import.meta.dirname, '../dist')
const manifest = JSON.parse(readFileSync(resolve(dist, 'manifest.webmanifest'), 'utf8'))

if (manifest.display !== 'standalone') throw new Error('PWA must use standalone display mode')
if (manifest.start_url !== '/' || manifest.scope !== '/') throw new Error('PWA must have valid root scope')

const signature = [137, 80, 78, 71, 13, 10, 26, 10]
for (const size of [192, 512]) {
  const entry = manifest.icons.find(icon => icon.sizes === size + 'x' + size && icon.type === 'image/png')
  if (!entry) throw new Error('Missing ' + size + 'px PNG icon in manifest')
  const file = resolve(dist, entry.src.replace(/^\/+/, ''))
  const image = readFileSync(file)
  if (!signature.every((byte, index) => image[index] === byte)) throw new Error('Invalid PNG signature: ' + file)
  if (image.readUInt32BE(16) !== size || image.readUInt32BE(20) !== size) {
    throw new Error('Incorrect PNG dimensions: ' + file)
  }
}

for (const file of ['index.html', 'sw.js', 'icon-180.png', 'manifest.webmanifest']) {
  if (!existsSync(resolve(dist, file))) throw new Error('Missing production PWA asset: ' + file)
}

const index = readFileSync(resolve(dist, 'index.html'), 'utf8')
if (!index.includes('rel="manifest"') || !index.includes('rel="apple-touch-icon"')) {
  throw new Error('The HTML must reference manifest and iOS icon')
}

console.log('PWA manifest and production install assets verified with Bun')
