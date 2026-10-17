/**
 * Google Analytics 4, as Google's own snippet in <head>: a real
 * `<script async src>` in the HTML, which is what Google's tag checker looks
 * for (next/script only preloads it and injects it from JavaScript). `async`
 * keeps it off the critical path. The layout renders it only on the indexable
 * production domain, so previews and `next dev` stay out of the reports. Its
 * origins are allowed through the CSP in next.config.js.
 */
export const GA_MEASUREMENT_ID = 'G-94K24GJXBD'

const init = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`

export function GoogleAnalytics() {
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <script dangerouslySetInnerHTML={{ __html: init }} />
    </>
  )
}
