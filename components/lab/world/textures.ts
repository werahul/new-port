/**
 * Textures the world makes for itself.
 *
 * Text is drawn to a 2D canvas in the page's own (self-hosted) faces
 * rather than through drei <Text>, which fetches a font from a CDN that the
 * site's CSP blocks. Screenshots go through Next's image optimiser, so a
 * 1.6 MB PNG arrives as a ~100 KB WebP/AVIF at the size the scene needs.
 */
import * as THREE from 'three'
import { optimisedUrl } from '../img-url'

function family(name: 'sans' | 'mono') {
  const v = getComputedStyle(document.body).getPropertyValue(`--font-${name}`).trim()
  return v || (name === 'mono' ? 'ui-monospace, monospace' : 'system-ui, sans-serif')
}

/**
 * Draw now, and again once the web font has arrived — the world can mount
 * before JetBrains Mono finishes loading, and canvas text never re-renders on
 * its own. `draw` must fit whatever it draws into the canvas it was given.
 */
function whenFontReady(font: string, tex: THREE.Texture, draw: () => void) {
  draw()
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
  fonts
    ?.load(font)
    .then(() => {
      draw()
      tex.needsUpdate = true
    })
    .catch(() => {})
}

/** A crisp single-line label. Returns the texture and its aspect (w / h). */
export function makeLabelTexture(text: string, color = '#16161F') {
  const pad = 24
  const size = 56
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d') as CanvasRenderingContext2D
  const font = `600 ${size}px ${family('sans')}`
  // letter-spacing is not in every canvas implementation; space it by hand
  const chars = text.split('')
  const tracking = size * -0.01
  const measure = () => chars.reduce((w, ch) => w + ctx.measureText(ch).width + tracking, 0) - tracking
  ctx.font = font
  c.width = Math.ceil(measure() + pad * 2)
  c.height = size + pad * 2
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  whenFontReady(font, tex, () => {
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.font = font
    // the real face may run wider than the fallback the canvas was sized for
    const fit = Math.min(1, (c.width - pad * 2) / measure())
    ctx.save()
    ctx.translate(pad, c.height / 2)
    ctx.scale(fit, 1)
    ctx.fillStyle = color
    ctx.textBaseline = 'middle'
    let x = 0
    for (const ch of chars) {
      ctx.fillText(ch, x, 0)
      x += ctx.measureText(ch).width + tracking
    }
    ctx.restore()
  })
  return { texture: tex, aspect: c.width / c.height }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** The three window dots every editor and browser wears. */
function trafficLights(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const dots = ['#FF5F57', '#FEBC2E', '#28C840']
  dots.forEach((c, i) => {
    ctx.beginPath()
    ctx.arc(x + i * r * 3, y, r, 0, Math.PI * 2)
    ctx.fillStyle = c
    ctx.fill()
  })
}

/** A browser's top bar for the device exhibits: dots and the site's address. */
export function makeChromeTexture(host: string, aspect: number) {
  const W = 1024
  const H = Math.max(48, Math.round(W / aspect))
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d') as CanvasRenderingContext2D
  const face = family('sans')
  const size = Math.round(H * 0.38)
  const font = `600 ${size}px ${face}`
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  whenFontReady(font, tex, () => {
    ctx.clearRect(0, 0, W, H)
    const r = H * 0.13
    trafficLights(ctx, r * 1.8, H / 2, r)
    const pillW = W * 0.56
    const px = (W - pillW) / 2
    roundRect(ctx, px, H * 0.16, pillW, H * 0.68, H * 0.34)
    ctx.fillStyle = 'rgba(255,255,255,0.13)'
    ctx.fill()
    ctx.textBaseline = 'middle'
    ctx.font = font
    const tw = Math.min(ctx.measureText(host).width, pillW - H)
    const dot = H * 0.09
    const start = W / 2 - (tw + dot * 4) / 2
    ctx.beginPath()
    ctx.arc(start + dot, H / 2, dot, 0, Math.PI * 2)
    ctx.fillStyle = '#5EE6A8'
    ctx.fill()
    ctx.fillStyle = '#ECE9FB'
    ctx.fillText(host, start + dot * 4, H / 2 + 1, pillW - H)
  })
  return tex
}

/** Soft radial falloff for additive glows. */
export function makeGlowTexture(inner = 'rgba(255,184,102,1)', outer = 'rgba(255,184,102,0)') {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d') as CanvasRenderingContext2D
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, inner)
  g.addColorStop(0.25, inner.replace(/[\d.]+\)$/, '0.45)'))
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export interface Crop {
  bottom: number
  visible: number
  aspect: number
}

/**
 * Load a screenshot, cropped to its photographic area (see `imageCrop` in
 * content/lab.ts). Resolves with the texture and the visible region's aspect.
 */
export function loadScreenTexture(src: string, width: 828 | 1080 | 1200, crop: Crop) {
  return new THREE.TextureLoader().loadAsync(optimisedUrl(src, width)).then((tex) => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.repeat.set(1, crop.visible)
    tex.offset.set(0, crop.bottom)
    tex.needsUpdate = true
    return { texture: tex, aspect: crop.aspect }
  })
}
