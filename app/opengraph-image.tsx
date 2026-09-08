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
          background: '#f6f4ef',
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
            color: '#75726b',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: '#5e7a93' }} />
          Full-Stack Engineer
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 92, color: '#1a1a18', letterSpacing: -3, lineHeight: 1.05 }}>
            {siteName}
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 29,
              lineHeight: 1.4,
              color: '#75726b',
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
            color: '#75726b',
            fontFamily: 'monospace',
            borderTop: '1px solid #e4e0d5',
            paddingTop: 26,
          }}
        >
          <span>React</span>
          <span style={{ color: '#cdc8e4' }}>·</span>
          <span>Next.js</span>
          <span style={{ color: '#cdc8e4' }}>·</span>
          <span>Node</span>
          <span style={{ color: '#cdc8e4' }}>·</span>
          <span>TypeScript</span>
        </div>
      </div>
    ),
    size,
  )
}
