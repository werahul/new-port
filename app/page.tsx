import { Loader } from '@/components/lab/loader'
import { loaderScript } from '@/components/lab/loader-script'
import { ProgressRail } from '@/components/lab/progress-rail'
import { About } from '@/components/lab/sections/about'
import { Approach } from '@/components/lab/sections/approach'
import { Capabilities } from '@/components/lab/sections/capabilities'
import { Contact } from '@/components/lab/sections/contact'
import { Hero } from '@/components/lab/sections/hero'
import { Work } from '@/components/lab/sections/work'
import { WorldHost } from '@/components/lab/world/world-host'
import { railStages, sceneData } from '@/content/lab'

/**
 * Before paint on a first visit: expect the world unless motion is reduced, so the DOM fallbacks (screenshots, diagrams)
 * are not downloaded for nothing. WorldHost confirms or corrects it.
 */
const expectWorld = `(function(){try{var r=document.currentScript.parentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;r.setAttribute('data-world','pending')}catch(e){}})()`

/**
 * One continuous journey through one world:
 *
 *   Intro → About → Capabilities → Work → Approach → Contact
 *   (the pearl) (it swells) (the planets) (sky gallery) (the portals) (sunset)
 *
 * The world is a fixed layer behind the sections (WorldHost); every section is
 * server-rendered, so the page is complete before — and without — any 3D.
 * On the first visit of a session the intro loader covers it while the world
 * loads and warms up (components/lab/loader.tsx).
 * `data-world` lives on this page's own root, so it leaves with the page.
 */
export default function Home() {
  const scene = sceneData()
  return (
    <div data-world="off" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
      <script dangerouslySetInnerHTML={{ __html: expectWorld }} />
      <Loader screens={scene.screens.map((s) => s.src)} />
      <WorldHost scene={scene} />
      <ProgressRail stages={railStages} />
      <div className="l-content">
        <Hero />
        <About />
        <Capabilities />
        <Work />
        <Approach />
        <Contact />
      </div>
    </div>
  )
}
