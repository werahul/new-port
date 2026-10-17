import Script from 'next/script'

/**
 * Google Analytics 4. Loaded after hydration so it never competes with the
 * first paint; the layout renders it only on the indexable production domain,
 * so previews and `next dev` stay out of the reports. Its origins are allowed
 * through the CSP in next.config.js.
 */
export const GA_MEASUREMENT_ID = 'G-94K24GJXBD'

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  )
}
