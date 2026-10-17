import { ImageResponse } from 'next/og'
import { siteDescription, siteName } from '@/lib/site'

// The edge runtime is the supported path for ImageResponse; the node build of
// @vercel/og cannot resolve its bundled assets on Windows.
export const runtime = 'edge'

export const alt = `${siteName} — Full-Stack Engineer & Creative Developer`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * The social card is generated at build time rather than shipped as a binary,
 * so it can never drift from the copy it advertises. It is the site in
 * miniature: the sky, a white panel and the pearl.
 * Colours are literal — `ImageResponse` cannot read CSS custom properties.
 */
const INK = '#16161f'
const PINK = '#ff63a8'
const YELLOW = '#ffd60a'
const CYAN = '#4dd9ff'
const EMERALD = '#3ddc97'

export default function OpengraphImage() {
  const tags = [
    { t: 'React', c: YELLOW },
    { t: 'Next.js', c: PINK },
    { t: 'Three.js', c: CYAN },
    { t: 'Node', c: EMERALD },
  ]
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          padding: 48,
          fontFamily: 'sans-serif',
          background: 'linear-gradient(180deg, #7e5bff 0%, #b48cff 34%, #ffc4e1 70%, #d3c2ff 100%)',
          position: 'relative',
        }}
      >
        {/* the pearl, with a moon */}
        <div
          style={{
            position: 'absolute',
            right: 70,
            top: 120,
            width: 330,
            height: 330,
            borderRadius: 330,
            display: 'flex',
            background:
              'radial-gradient(circle at 34% 28%, #ffffff 0%, rgba(255,255,255,0) 34%), linear-gradient(135deg, #ffb3dd 0%, #b9c8ff 35%, #a9f5dc 65%, #ffe58f 100%)',
            boxShadow: '0 60px 90px -40px rgba(60,30,150,0.6)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 64,
            top: 470,
            width: 46,
            height: 46,
            borderRadius: 46,
            display: 'flex',
            background: YELLOW,
          }}
        />

        <div
          style={{
            width: 760,
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            borderRadius: 32,
            boxShadow: '0 40px 90px -40px rgba(60,30,150,0.7)',
            overflow: 'hidden',
          }}
        >

          <div style={{ display: 'flex', flexDirection: 'column', padding: '34px 44px 40px', flex: 1 }}>

            <div
              style={{
                fontSize: 92,
                fontWeight: 700,
                color: INK,
                letterSpacing: -3,
                lineHeight: 0.95,
                display: 'flex',
              }}
            >
              {siteName}
            </div>
            <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.35, color: '#323242', display: 'flex' }}>
              {siteDescription.split(' — ')[0]}.
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 'auto', paddingTop: 26 }}>
              {tags.map(({ t, c }) => (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    fontSize: 20,
                    fontWeight: 800,
                    color: INK,
                    background: c,
                    borderRadius: 999,
                    padding: '8px 18px',
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
