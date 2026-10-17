# Holidays Journey

Website for Holidays Journey, a tours and travel company based in Haridwar, Uttarakhand, specialising in the Char Dham Yatra, Uttarakhand holidays, pilgrimage journeys and customised tours across India.

> **Travel Beyond Destinations.**

## Getting started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL for the environment
npm run dev
```

Open <http://localhost:3000>.

| Script              | Purpose                                |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Development server                     |
| `npm run build`     | Production build                       |
| `npm run start`     | Serve the production build             |
| `npm run lint`      | ESLint                                 |
| `npm run typecheck` | TypeScript                             |
| `npm run format`    | Prettier (with Tailwind class sorting) |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Radix UI · Lucide · GSAP · Motion

## Project structure

```
src/
├── app/            Root layout, foundation page, not-found, sitemap, robots, global CSS tokens
├── components/
│   ├── layout/     Container, Section, SectionHeading
│   ├── motion/     MotionProvider, Reveal, GSAP registration
│   ├── seo/        JsonLd
│   ├── ui/         shadcn/ui primitives
│   └── …           navigation, hero, destinations, packages, gallery, forms, testimonials, sections (next phases)
├── config/         site.ts (business identity), brand.ts (messaging), navigation.ts, fonts.ts
├── data/           destinations, packages, categories, gallery, faqs, testimonials
├── lib/            content.ts (data access), seo.ts, structured-data.ts, motion.ts, format.ts, utils.ts
└── types/          Content schemas (Destination, Package, Itinerary, GalleryItem, Testimonial, FAQ, BlogPost)
public/images/      Public-domain/CC0 stock (see SOURCES.tsv) + the agency's own photos; stock replaced 1:1 by client photography
```

Conventions for contributors and AI tooling are in [CLAUDE.md](./CLAUDE.md).

## Deploying to production

Node 20+ (matching the hosting runtime). The steps, in order:

1. **Environment.** Set every variable from `.env.example` on the host (Vercel → Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SITE_URL`: the production origin. A Vercel production build fails without it, because canonicals, the sitemap, Open Graph and JSON-LD are built from it.
   - Email: `EMAIL_PROVIDER` (`resend` | `smtp` | `sendgrid` | `ses`), `CONTACT_EMAIL` and `FROM_EMAIL`, plus that provider's credentials. Verify the sending domain with the provider (SPF and DKIM records, and a DMARC policy). In production, an enquiry that is neither emailed nor saved to the database is reported to the visitor as a failure, so they fall back to WhatsApp or phone.
   - `DATABASE_URL` and `DIRECT_DATABASE_URL` (Supabase), plus `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the admin login.
   - Optional: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Set both or neither: a secret without a site key rejects every submission.
2. **Database.** Run these against the production database: `npm run db:migrate`, then `npm run db:seed`. Once `DATABASE_URL` is set, packages are read **only** from the database, so an unseeded database means empty listings.
3. **First owner.** Create the user in Supabase → Authentication, then run `npm run admin:grant -- --email … --name "…" --role owner`.
4. **Build and deploy.** `npm run typecheck && npm run lint && npm test && npm run build`.
5. **Smoke test.** Submit a real enquiry and check that the email arrives and the enquiry shows in `/admin/enquiries`. Check that `/design-system` returns 404.

| Script                | Purpose                               |
| --------------------- | ------------------------------------- |
| `npm test`            | Vitest (database tests run on PGlite) |
| `npm run db:migrate`  | Apply `drizzle/` migrations           |
| `npm run db:seed`     | Load categories, packages and fleet   |
| `npm run admin:grant` | Grant a Supabase user a staff role    |

## Replacing development assets

Stock images under `public/images/**` are Public Domain or CC0 photographs from Wikimedia Commons (no credit or licence conditions), recorded in `public/images/SOURCES.tsv`. Replace them in place (same paths) with the agency's own photography as it arrives and update that file. Business contact details are entered once in `src/config/site.ts`.
