import { profile } from '@/content/lab'

/** The page's last line, on every route. */
export function LabFooter({ topHref = '#top' }: { topHref?: string }) {
  const year = new Date().getFullYear()
  return (
    <footer className="l-wrap l-foot">
      <span>
        © {year} {profile.fullName}
      </span>
      <span>Designed &amp; built in Next.js and React Three Fiber</span>
      <a href={topHref}>
        Back to top <span aria-hidden="true">↑</span>
      </a>
    </footer>
  )
}
