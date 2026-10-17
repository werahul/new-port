# Twinkle Khandelwal — UI/UX Designer Portfolio

A portfolio site for **Twinkle Khandelwal**, UI/UX designer at Melange Digital, based in West Bengal, India. The design system is light mode, minimal layout and **neobrutalism**: thick ink borders, hard offset shadows, draggable stickers and a multi-colour accent palette. Her **Behance projects are pulled in live** and refresh automatically.

Built with Next.js 15 (App Router), Tailwind CSS 4, GSAP + ScrollTrigger, Framer Motion and Lenis.

Repository: https://github.com/werahul/twinkle-ux-portfolio

---

## ✨ Features

- **Live Behance integration.** Projects are read from Behance's public RSS feed on the server, refreshed every 6 hours (ISR), with a static fallback so the work grid is never empty.
- **Animated intro with a real loader.** Her name drops in as bouncy colour letter tiles while a progress bar, cycling status lines and a 0→100 counter run. The counter tracks real work happening behind it: fonts, the page's resources and the key Behance covers (anything marked `data-preload`). It reaches 100 only when they've loaded, with a 1.6s minimum and a 10s safety cap. It ends on an **"Enter with sound / In silence"** choice. On entry the tiles scatter, the page lifts away and stacked colour panels wipe out. Shown once per browser session.
- **Generative background music.** A soft lo-fi ambient loop (chord pads, bass, a randomised pluck melody, delay, reverb and tape hiss) synthesised live with the Web Audio API. There are no audio files or licensing, and it never repeats exactly. An equaliser button in the nav mutes and unmutes it. The choice is remembered, and the music pauses when the tab is hidden.
- **Kinetic hero name.** Each letter of her name is driven by the variable font's weight and width axes. Letters near the cursor swell wide and thin, lift and tilt away, and outlined "KHANDELWAL" letters flood with colour. Without a cursor (touch, or mouse elsewhere) a soft wave drifts through the name. Scrolling pulls the two lines apart. Colour glows chase the cursor, and **draggable stickers** sit beside the name.
- **Stack → spread cards.** Research / Design / Prototype cards fan out as they scroll into view.
- **Crossed skill tapes.** Two tilted marquees running in opposite directions.
- **Scroll-scrubbed manifesto.** Words fade in as you scroll, and key words land in coloured highlighter boxes.
- **Featured case study.** Her latest Behance project grows from a small tilted frame to full screen.
- **Horizontal work gallery.** A pinned sideways scroll of project cards with mouse-tracked 3D tilt, a progress bar and animated stat counters.
- **Client work list.** All 7 client projects from her résumé (RWC, NeoTrader, DevBoost, Seamless DMC, Kalon, Aartech Solonics, Melange Digital). Rows flood with colour on hover and expand to show highlights, tags and details. Projects that also exist on Behance (such as NeoTrader) link to the case study automatically.
- **Experience timeline.** Roles and education on a timeline whose line draws itself on scroll, next to pinned impact tiles (30+ pages, +25% engagement, +30% navigation efficiency, −15% inconsistencies).
- **Colour-flood process section.** A pinned word switcher (Users / Clarity / Delight) where the whole screen changes colour per step.
- **Toolbox bento grid.** Asymmetric, multi-colour skill tiles.
- **Contact.** A copy-to-clipboard email and brutalist social buttons.
- **Footer.** A giant multi-colour marquee and a back-to-top button.
- **Context cursor.** A spring-following cursor that shows labels like "View ↗", "Drag me" and "Copy" over interactive elements.
- **Accessible by default.** The custom cursor is off on touch devices, and `prefers-reduced-motion` turns off the preloader, scroll pinning and marquees. Focus rings are visible.

## 🛠️ Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15.5 (App Router, server components, ISR) |
| Language | JavaScript / JSX |
| Styling | Tailwind CSS 4 (`@theme` design tokens, custom `@utility` classes) |
| Animation | GSAP 3 + ScrollTrigger, Framer Motion 12 |
| Smooth scroll | Lenis (driven by the GSAP ticker so pins stay in sync) |
| Fonts | Bricolage Grotesque (display), Inter Tight (body), JetBrains Mono (labels), all via `next/font` |
| Icons | Lucide React |

## 🎨 Design System

All tokens live in [`app/globals.css`](app/globals.css).

**Colours**

| Token | Hex | Use |
| --- | --- | --- |
| `paper` | `#FBF8F1` | Page background |
| `ink` | `#0B0B0B` | Text, borders, shadows |
| `yellow` | `#FFE14D` | Primary accent |
| `pink` | `#FF8FC8` | Accent |
| `blue` | `#6B8CFF` | Accent / links |
| `mint` | `#7FE0B0` | Accent / success |
| `orange` | `#FF7A3D` | Accent |
| `lilac` | `#C7A6FF` | Accent |

**Utilities**

- `brutal`: a 2.5px solid ink border.
- `shadow-brutal-sm` / `shadow-brutal` / `shadow-brutal-lg` / `shadow-brutal-xl`: hard offset shadows (3 / 5 / 10 / 16px).
- `highlight`: a highlighter box for emphasised words.
- `text-stroke`: hollow outlined display text. It fills with the surface colour and draws the stroke underneath, so variable-font contours stay clean. Override it with `--stroke-fill` and `--stroke-color`.
- `animate-marquee` / `animate-marquee-reverse`: seamless marquee. Set the speed with `--marquee-duration`.

**Interaction pattern:** buttons lift on hover (bigger shadow) and press flat on click (shadow goes to 0).

## 📁 Project Structure

```
├── app/
│   ├── icon.svg             # Favicon: brutalist "T" tile with a sparkle
│   ├── apple-icon.js        # 180×180 home-screen icon (generated PNG)
│   ├── layout.js            # Fonts, metadata, grid background, grain, cursor, Lenis
│   ├── page.js              # Async server component: fetches Behance, renders sections
│   └── globals.css          # Design tokens + utilities
├── components/
│   ├── Preloader.jsx        # Animated intro + sound gate (fires "intro:done")
│   ├── SoundProvider.jsx    # Music context: play / pause / toggle
│   ├── SoundToggle.jsx      # Equaliser mute button (in the nav)
│   ├── Nav.jsx              # Floating pill nav, hides on scroll down
│   ├── HeroSection.jsx      # Name, cursor glow, stickers, pillar cards
│   ├── SkillsTicker.jsx     # Crossed marquees
│   ├── Manifesto.jsx        # Scroll-scrubbed about text with highlights
│   ├── FeaturedCase.jsx     # Latest Behance project, grow-to-full-screen
│   ├── BehanceWork.jsx      # Horizontal pinned gallery + stats
│   ├── ClientWork.jsx       # Expandable client project list (auto-links Behance)
│   ├── Experience.jsx       # Timeline + impact metrics
│   ├── Process.jsx          # Pinned word switcher with colour flood
│   ├── Toolbox.jsx          # Bento grid of skills
│   ├── Contact.jsx          # Headline, copy-email, social buttons
│   ├── Footer.jsx           # Marquee, links, back-to-top
│   ├── InteractiveBg.jsx    # Animated canvas grid
│   ├── LenisProvider.jsx    # Lenis ↔ GSAP ScrollTrigger sync
│   └── ui/
│       ├── BrutalButton.jsx
│       ├── Sticker.jsx      # Draggable rotated badge
│       ├── Marquee.jsx
│       ├── RevealText.jsx   # Letter-by-letter spring reveal
│       ├── CountUp.jsx
│       └── smooth-cursor.jsx
├── content/
│   ├── site.js              # ⭐ All personal copy lives here
│   └── behance-fallback.js  # Snapshot of Behance projects (used if the feed fails)
├── lib/
│   ├── ambient.js           # Generative Web Audio music engine
│   ├── behance.js           # RSS fetch + parser
│   └── utils.js             # cn() class helper
└── next.config.mjs          # Allows Behance CDN images
```

## ✏️ Editing Content

Everything personal is in **[`content/site.js`](content/site.js)**, sourced from Twinkle's résumé. Every section reads from this one file, so you don't need to touch any components.

| Key | Drives |
| --- | --- |
| `name`, `role`, `company`, `location`, `intro`, `status` | Hero, nav, footer, page metadata |
| `manifesto` | About section |
| `email`, `socials` | Contact, footer, nav |
| `skills` | Skill tapes |
| `pillars` | Hero cards |
| `clients` | Client work list |
| `experience`, `education`, `impact` | Experience timeline + impact tiles |
| `process`, `toolbox` | Process and Toolbox sections |
| `stats`, `behanceUser` | Behance stats + feed |

- In the manifesto, wrap a word or phrase in `[[double brackets]]` to give it a coloured highlighter box.
- Colours are referenced by token name (`"yellow"`, `"pink"`, …).
- Give a client a `behance` keyword that matches a Behance project title to link its case study.
- Her phone number is intentionally **not** published on the site.

## 🔗 How the Behance Integration Works

Behance shut down its public API, so the site uses the profile's RSS feed:

```
https://www.behance.net/feeds/user?username=twinkle1803
```

1. `getBehanceProjects()` in [`lib/behance.js`](lib/behance.js) fetches the feed on the server with a browser-like User-Agent (Behance returns an empty body without one).
2. A small regex parser (no extra dependency) extracts each project's title, link, date and cover. The cover is upgraded from the 404px to the 808px CDN variant.
3. The page is statically generated and **revalidated every 6 hours**, so new Behance uploads show up automatically.
4. If the feed fails or comes back empty, the site uses [`content/behance-fallback.js`](content/behance-fallback.js) instead.

To show a different Behance user, change `behanceUser` in `content/site.js`.

**Limitations**

- The feed lists the latest projects only, with no view or appreciation counts. The stats on the page (`stats` in `content/site.js`) are updated by hand.
- Covers load through `next/image` from `mir-s3-cdn-cf.behance.net`. That domain is allowed in `next.config.mjs`.

## 🚀 Getting Started

**Prerequisites:** Node.js 18.18+ and npm.

```bash
git clone https://github.com/werahul/twinkle-ux-portfolio.git
cd twinkle-ux-portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> In development, the preloader shows once per browser session. Open a new tab or clear `sessionStorage` to see it again.

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (static + ISR) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## 🚀 Deployment

Deploy on [Vercel](https://vercel.com/new) with zero configuration. ISR revalidation for the Behance feed works out of the box. Any Node.js host also works:

```bash
npm run build
npm run start
```

## 🎵 Background Music

Browsers block audio until the visitor interacts with the page, so music only ever starts from a click: the intro's **Enter with sound** button or the equaliser button in the nav.

- The engine lives in [`lib/ambient.js`](lib/ambient.js). Change the chords in `CHORDS`, the tempo in `BPM` and the loudness in `VOLUME`.
- If the visitor left sound on last time, it resumes on their first click or keypress.
- Music fades out when the tab is hidden and fades back in when it returns.

## ♿ Accessibility & Performance

- `prefers-reduced-motion` turns off the intro, scroll pinning, the cursor and marquees, and shows content in its final state. Music never plays without a click.
- The custom cursor only runs on fine pointers (mouse/trackpad). Touch devices keep native behaviour.
- Outlined and split text keep an `aria-label` with the readable string.
- Behance covers are optimised by `next/image`. Scroll animations are cleaned up on unmount via `gsap.context` / `gsap.matchMedia`.

## 📄 License

This project is private and proprietary. All rights reserved. Project images and case studies belong to Twinkle Khandelwal.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) · [Tailwind CSS](https://tailwindcss.com/) · [GSAP](https://gsap.com/) · [Framer Motion](https://motion.dev/) · [Lenis](https://github.com/darkroomengineering/lenis) · [Lucide](https://lucide.dev/)
- Work showcased from [Twinkle's Behance](https://www.behance.net/twinkle1803)
