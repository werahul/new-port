/**
 * The social card, shared by the site's and each case study's
 * opengraph-image. It is the site in miniature: the sky, a white panel and
 * the pearl. Colours are literal — `ImageResponse` cannot read CSS custom
 * properties.
 */
export const ogSize = { width: 1200, height: 630 }

const INK = '#16161f'
const TAG_COLOURS = ['#ffd60a', '#ff63a8', '#4dd9ff', '#3ddc97']

export function OgCard({
  kicker,
  title,
  line,
  tags,
}: {
  kicker?: string
  title: string
  line: string
  tags: string[]
}) {
  // a name fits at display size; a project title needs room for two lines
  const titleSize = title.length > 24 ? 58 : 92
  return (
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
          background: TAG_COLOURS[0],
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
          {kicker && (
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: '#5b3df5', marginBottom: 18 }}>
              {kicker}
            </div>
          )}
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 700,
              color: INK,
              letterSpacing: titleSize > 60 ? -3 : -1.5,
              lineHeight: titleSize > 60 ? 0.95 : 1.05,
              display: 'flex',
            }}
          >
            {title}
          </div>
          <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.35, color: '#323242', display: 'flex' }}>
            {line}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 'auto', paddingTop: 26 }}>
            {tags.map((t, i) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  fontSize: 20,
                  fontWeight: 800,
                  color: INK,
                  background: TAG_COLOURS[i % TAG_COLOURS.length],
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
  )
}
