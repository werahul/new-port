/**
 * URLs for Next's image optimiser, built by hand — so the 3D world's textures,
 * the cropped <img> fallbacks and the loader's preloads all ask for exactly
 * the same URL, and share one cached response.
 *
 * Widths must be in next.config's default deviceSizes / imageSizes.
 */
export type ImgWidth = 384 | 640 | 828 | 1080 | 1200

export function optimisedUrl(src: string, width: ImgWidth = 1200, quality = 72) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
}

export function srcSetFor(src: string, widths: ImgWidth[]) {
  return widths.map((w) => `${optimisedUrl(src, w)} ${w}w`).join(', ')
}

/** The width the 3D screens load their screenshots at, by device tier. */
export function screenTextureWidth(lowTier: boolean): 828 | 1200 {
  return lowTier ? 828 : 1200
}
