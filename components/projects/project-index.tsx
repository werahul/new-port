'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ScrollReveal } from '@/components/motion'
import { useGsapScope } from '@/lib/animation/use-gsap-scope'
import { MQ } from '@/lib/animation/config'
import { featuredProjects, secondaryProjects } from '@/content/projects'
import { TransitionLink } from './transition-link'
import { ProjectVisual } from './project-visual'

/** How far ahead of the viewport the preview images start loading. */
const PRELOAD_MARGIN = '700px 0px'

export function ProjectIndex() {
  const containerRef = useRef<HTMLDivElement>(null)
  /**
   * The preview is `position: fixed`, so its images are *always* in the
   * viewport and `loading="lazy"` would fetch all five during first paint —
   * competing with the content the visitor is actually looking at. Rendering
   * them only once the list is within a screen or so of view means they are
   * decoded long before a hover is physically possible, and cost nothing on a
   * visit that never scrolls this far.
   */
  const [previewReady, setPreviewReady] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Coarse pointers never see the preview at all.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPreviewReady(true)
          io.disconnect()
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /**
   * THE CURSOR PREVIEW.
   *
   * Rewritten around one rAF loop with GSAP quickSetters and *no tweens at all*
   * for position, rotation, opacity or scale. That is the whole fix:
   *
   *  - There are no competing tweens, so nothing can land `visibility: hidden`
   *    on the layer that is supposed to be showing. Sweeping the cursor down
   *    five rows in 200ms used to leave ~25 `autoAlpha` tweens fighting over
   *    five nodes, and whichever stale one finished last won.
   *  - The hovered row is resolved by hit-testing cached, *document-relative*
   *    rects against the last pointer position, every frame. So it is correct
   *    when the cursor is already parked on a row before the listeners attach
   *    (`pointerenter` never fires in that case), and it stays correct while
   *    Lenis glides the list underneath a stationary cursor, when no pointer
   *    events fire at all.
   *  - Because the rects are the rows' layout positions rather than their
   *    animated ones, the entrance stagger sliding rows under the cursor can no
   *    longer select a row the visitor is not looking at.
   */
  const scopeRef = useGsapScope<HTMLDivElement>(
    ({ gsap, scope, mm }) => {
      mm.add(
        {
          hover: '(hover: hover) and (pointer: fine)',
          desktop: MQ.desktop,
          reduce: MQ.reduce,
        },
        (c) => {
          const cond = c.conditions ?? {}
          // `desktop` has to agree with the `hidden lg:block` on the preview, or
          // the whole machine runs against a `display: none` node.
          if (cond.reduce || !cond.hover || !cond.desktop) return

          const preview = scope.querySelector<HTMLElement>('[data-preview]')
          const depth = scope.querySelector<HTMLElement>('[data-preview-depth]')
          const list = scope.querySelector<HTMLElement>('[data-project-list]')
          if (!preview || !depth || !list) return

          const layers = gsap.utils.toArray<HTMLElement>(
            scope.querySelectorAll('[data-preview-layer]'),
          )
          const rows = gsap.utils.toArray<HTMLElement>(
            scope.querySelectorAll('[data-project-row]'),
          )
          if (!layers.length || !rows.length) return

          gsap.set(preview, {
            xPercent: -50,
            yPercent: -55,
            transformPerspective: 900,
            opacity: 0,
            scale: 0.94,
          })
          gsap.set(layers, { opacity: 0 })
          preview.style.visibility = 'hidden'

          const setX = gsap.quickSetter(preview, 'x', 'px')
          const setY = gsap.quickSetter(preview, 'y', 'px')
          const setRY = gsap.quickSetter(preview, 'rotationY', 'deg')
          const setRX = gsap.quickSetter(preview, 'rotationX', 'deg')
          const setScale = gsap.quickSetter(preview, 'scale')
          const setOpacity = gsap.quickSetter(preview, 'opacity')
          const setDepthX = gsap.quickSetter(depth, 'x', 'px')
          const setDepthY = gsap.quickSetter(depth, 'y', 'px')
          const setLayer = layers.map((l) => gsap.quickSetter(l, 'opacity'))

          // ---- geometry cache, in document coordinates ---------------------
          // Document-relative means scrolling does not invalidate it, which is
          // what lets a stationary cursor track rows sliding past underneath.
          let boxes: Array<{ top: number; bottom: number; left: number; right: number }> =
            []
          const measure = () => {
            const sx = window.scrollX
            const sy = window.scrollY
            boxes = rows.map((row) => {
              const r = row.getBoundingClientRect()
              return {
                top: r.top + sy,
                bottom: r.bottom + sy,
                left: r.left + sx,
                right: r.right + sx,
              }
            })
          }
          measure()

          // ---- pointer -----------------------------------------------------
          let px = -1
          let py = -1
          let hasPointer = false

          const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return
            px = e.clientX
            py = e.clientY
            hasPointer = true
          }
          const forget = () => {
            hasPointer = false
          }

          window.addEventListener('pointermove', onMove, { passive: true })
          window.addEventListener('pointercancel', forget, { passive: true })
          window.addEventListener('blur', forget)
          document.addEventListener('visibilitychange', forget)
          // A pointer that leaves the document entirely never reports again.
          document.addEventListener('pointerleave', forget)

          const onResize = () => measure()
          window.addEventListener('resize', onResize, { passive: true })
          // Layout settles late — fonts, images, the reveal. ScrollTrigger
          // already knows when that happens.
          const ro = new ResizeObserver(measure)
          ro.observe(list)

          // ---- the loop ----------------------------------------------------
          let x = 0
          let y = 0
          let seeded = false
          let opacity = 0
          let scale = 0.94
          let active = -1
          const layerOpacity = layers.map(() => 0)
          let raf = 0

          const frame = () => {
            raf = requestAnimationFrame(frame)

            // resolve the hovered row from geometry, every frame
            let next = -1
            if (hasPointer) {
              const dx = px + window.scrollX
              const dy = py + window.scrollY
              for (let i = 0; i < boxes.length; i++) {
                const b = boxes[i]
                if (dx >= b.left && dx <= b.right && dy >= b.top && dy <= b.bottom) {
                  next = i
                  break
                }
              }
            }
            active = next

            // seed on first appearance so it fades in *where the cursor is*
            // rather than sliding across the screen from wherever it was left
            if (active >= 0 && !seeded && hasPointer) {
              x = px
              y = py
              seeded = true
            }
            if (active < 0 && opacity < 0.01) seeded = false

            const targetOpacity = active >= 0 ? 1 : 0
            const targetScale = active >= 0 ? 1 : 0.94

            if (hasPointer) {
              x += (px - x) * 0.2
              y += (py - y) * 0.2
            }
            opacity += (targetOpacity - opacity) * 0.16
            scale += (targetScale - scale) * 0.16

            // The lag between cursor and panel *is* the velocity, so the tilt
            // comes free and is always in the direction of travel.
            const lagX = px - x
            const lagY = py - y

            setX(x)
            setY(y)
            setScale(scale)
            setOpacity(opacity)
            setRY(Math.max(-14, Math.min(14, lagX * 0.16)))
            setRX(Math.max(-10, Math.min(10, -lagY * 0.12)))
            // the image drifts against the tilt — parallax inside the frame
            setDepthX(Math.max(-16, Math.min(16, -lagX * 0.1)))
            setDepthY(Math.max(-16, Math.min(16, -lagY * 0.1)))

            preview.style.visibility = opacity < 0.004 ? 'hidden' : 'visible'

            for (let i = 0; i < layers.length; i++) {
              const target = i === active ? 1 : 0
              const o = layerOpacity[i] + (target - layerOpacity[i]) * 0.18
              layerOpacity[i] = o
              setLayer[i](o)
            }
          }
          raf = requestAnimationFrame(frame)

          // `mm.add` must return its own cleanup. Registering this through the
          // hook's `onCleanup` instead — as this block used to — meant that a
          // matchMedia flip (an OS motion toggle, docking a mouse, dragging the
          // window to another display) reverted the GSAP context but left every
          // listener bound to a dead closure, and two loops then fought over
          // the same element. That was the guaranteed-stuck case.
          return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointercancel', forget)
            window.removeEventListener('blur', forget)
            window.removeEventListener('resize', onResize)
            document.removeEventListener('visibilitychange', forget)
            document.removeEventListener('pointerleave', forget)
            ro.disconnect()
          }
        },
      )
    },
    [previewReady],
  )

  return (
    <div ref={containerRef}>
      <div ref={scopeRef} className="rhythm-lead">
        {/* cursor-following preview — desktop pointer only, never interactive */}
        <div
          data-preview
          aria-hidden
          className="pointer-events-none invisible fixed left-0 top-0 z-[45] hidden aspect-[4/3] w-[min(28vw,400px)] overflow-hidden rounded-xl border border-line bg-surface-2 opacity-0 shadow-raised lg:block"
        >
          <div data-preview-depth className="absolute inset-[-6%]">
            {previewReady &&
              featuredProjects.map((p) => (
                <div key={p.slug} data-preview-layer className="absolute inset-0">
                  <ProjectVisual project={p} sizes="400px" />
                </div>
              ))}
          </div>
          {/* a hairline of the world's light across the top edge */}
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{ boxShadow: 'inset 0 1px 0 0 rgb(var(--fg) / 0.09)' }}
          />
        </div>

        <div data-project-list>
          <ScrollReveal as="ul" stagger variant="fade-up" distance={22}>
            {featuredProjects.map((p) => (
              <li
                key={p.slug}
                data-project-row
                className="border-t border-line last:border-b"
              >
                <TransitionLink
                  href={`/projects/${p.slug}`}
                  className="group relative grid grid-cols-1 gap-5 py-9 outline-none lg:grid-cols-[4.5rem_1fr_auto] lg:items-center lg:gap-10 lg:py-12"
                >
                  {/* index + (mobile) category */}
                  <div className="flex items-center justify-between lg:block">
                    <span className="font-display text-[2rem] font-normal leading-none text-faint transition-colors duration-500 ease-editorial group-hover:text-muted-foreground lg:text-[2.75rem]">
                      {p.number}
                    </span>
                    <span className="type-metadata lg:hidden">{p.category}</span>
                  </div>

                  {/* mobile visual — the whole row is the tap target, so this
                      never needs a hover behaviour of its own */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface-2 lg:hidden">
                    <ProjectVisual project={p} sizes="(min-width: 640px) 90vw, 100vw" />
                  </div>

                  {/* main */}
                  <div className="min-w-0">
                    <div className="type-metadata hidden lg:block">
                      {p.category}
                      <span className="text-faint"> · {p.context}</span>
                    </div>
                    <h3 className="type-project mt-2.5 text-foreground transition-transform duration-500 ease-editorial group-hover:translate-x-2">
                      {p.title}
                    </h3>
                    <p className="mt-3 max-w-prose text-sm leading-[1.7] text-muted-foreground">
                      {p.outcome}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-3.5 gap-y-1.5">
                      {p.tech.map((t) => (
                        <li
                          key={t}
                          className="type-technology text-faint transition-colors duration-500 ease-editorial group-hover:text-muted-foreground"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* cta */}
                  <div className="mt-1 flex items-center gap-2 text-sm font-medium tracking-tight text-muted-foreground transition-colors duration-500 ease-editorial group-hover:text-foreground lg:mt-0 lg:flex-col lg:items-end lg:gap-3">
                    <span className="whitespace-nowrap">View case study</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>

                  {/* hover underline */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent-strong transition-transform duration-700 ease-editorial group-hover:scale-x-100"
                  />
                </TransitionLink>
              </li>
            ))}
          </ScrollReveal>
        </div>

        {/* secondary work */}
        <div className="rhythm-block border-t border-line pt-12">
          <div className="type-metadata">Also shipped</div>
          <ul className="mt-6 grid gap-x-12 sm:grid-cols-2">
            {secondaryProjects.map((p) => (
              <li key={p.slug}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-baseline justify-between gap-4 border-b border-line/70 py-4"
                >
                  <span className="min-w-0">
                    <span className="text-sm font-medium text-foreground transition-colors group-hover:text-accent-strong">
                      {p.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {p.category}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 translate-y-1 text-faint transition-all duration-300 ease-editorial group-hover:-translate-y-0 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
