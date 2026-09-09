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
 * so it can never drift from the copy it advertises.
 *
 * Colours are the site's own tokens, written literally because `ImageResponse`
 * renders outside the document and cannot read CSS custom properties:
 *   --base 14 15 19 · --fg 240 241 245 · --fg-muted 154 159 172
 *   --line 40 44 55 · --violet 149 108 255
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          // the graphite ground, lifted toward the top edge the way the site is
          backgroundColor: '#0e0f13',
          backgroundImage:
            'radial-gradient(1000px 520px at 22% -12%, rgba(149,108,255,0.20), transparent 68%), radial-gradient(760px 420px at 104% 112%, rgba(74,137,255,0.14), transparent 70%)',
          padding: '72px 80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#9a9fac',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: '#956cff' }} />
          Full-Stack Engineer
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 92, color: '#f0f1f5', letterSpacing: -3, lineHeight: 1.05 }}>
            {siteName}
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 29,
              lineHeight: 1.4,
              color: '#9a9fac',
              maxWidth: 900,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {siteDescription.split(' — ')[0]}.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 14,
            fontSize: 20,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#9a9fac',
            fontFamily: 'monospace',
            borderTop: '1px solid #282c37',
            paddingTop: 26,
          }}
        >
          <span>React</span>
          <span style={{ color: '#956cff' }}>·</span>
          <span>Next.js</span>
          <span style={{ color: '#956cff' }}>·</span>
          <span>Node</span>
          <span style={{ color: '#956cff' }}>·</span>
          <span>TypeScript</span>
        </div>
      </div>
    ),
    size,
  )
}
