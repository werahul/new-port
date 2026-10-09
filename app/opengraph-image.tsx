import { ImageResponse } from 'next/og'
import { siteDescription, siteName } from '@/lib/site'

// The edge runtime is the supported path for ImageResponse; the node build of
// @vercel/og cannot resolve its bundled assets on Windows.
export const runtime = 'edge'

export const alt = `${siteName} — Full-Stack Engineer`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * The social card is generated at build time rather than shipped as a binary,
 * so it can never drift from the copy it advertises. Colours are the palette's
 * literal values — `ImageResponse` cannot read CSS custom properties.
 */
const INK = '#0a0a0a'
const CREAM = '#fff4e0'
const YELLOW = '#ffd60a'
const PINK = '#ff63a8'
const CYAN = '#4dd9ff'
const LIME = '#b8ff3c'

export default function OpengraphImage() {
  const tags = [
    { t: 'React', c: YELLOW },
    { t: 'Next.js', c: PINK },
    { t: 'Node', c: CYAN },
    { t: 'TypeScript', c: LIME },
  ]
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: CREAM,
          padding: 48,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#ffffff',
            border: `6px solid ${INK}`,
            boxShadow: `16px 16px 0 0 ${INK}`,
            padding: '44px 52px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: INK,
              background: LIME,
              border: `4px solid ${INK}`,
              padding: '8px 16px',
              transform: 'rotate(-3deg)',
            }}
          >
            Full-Stack Engineer
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 120,
                fontWeight: 900,
                color: INK,
                letterSpacing: -6,
                lineHeight: 0.9,
                textTransform: 'uppercase',
              }}
            >
              {siteName}
            </div>
            <div
              style={{
                marginTop: 24,
                fontSize: 30,
                lineHeight: 1.35,
                color: '#46423c',
                maxWidth: 820,
              }}
            >
              {siteDescription.split(' — ')[0]}.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            {tags.map(({ t, c }) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  fontSize: 22,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: INK,
                  background: c,
                  border: `4px solid ${INK}`,
                  padding: '6px 14px',
                }}
              >
                {t}
              </div>
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              right: 52,
              top: 44,
              width: 150,
              height: 150,
              background: YELLOW,
              border: `6px solid ${INK}`,
              transform: 'rotate(12deg)',
              display: 'flex',
            }}
          />
        </div>
      </div>
    ),
    size,
  )
}
