import { cropOf } from '@/content/lab'
import { srcSetFor, optimisedUrl, type ImgWidth } from './img-url'

/** A screenshot cropped to its photographic area — see `imageCrop`. */
export function CroppedImage({
  src,
  alt,
  sizes,
  widths,
  priority = false,
}: {
  src: string
  alt: string
  sizes: string
  widths: ImgWidth[]
  /** above the fold: load now, and first */
  priority?: boolean
}) {
  const c = cropOf(src)
  return (
    <span className="l-crop" style={{ aspectRatio: `${c.aspect}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- see img-url.ts */}
      <img
        src={optimisedUrl(src, widths[widths.length - 1])}
        srcSet={srcSetFor(src, widths)}
        sizes={sizes}
        alt={alt}
        width={1080}
        height={1080}
        loading={priority ? 'eager' : 'lazy'}
        // React 18 passes the attribute through only in lowercase
        {...(priority ? { fetchpriority: 'high' } : {})}
        decoding="async"
        style={{ top: `${(-c.top / c.visible) * 100}%`, height: `${100 / c.visible}%` }}
      />
    </span>
  )
}
