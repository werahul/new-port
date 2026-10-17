/**
 * A JSON-LD data block. `<` is escaped so a string in the data can never close
 * the script element; a data block isn't executed, so the CSP doesn't apply.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
