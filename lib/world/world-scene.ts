import * as THREE from 'three'
import { stations, stationCount } from '@/content/world'
import { buildDistrict, type BuildCtx, type District } from './districts'
import { readPalette, refreshPalette, type AccentKey } from './palette'
import type { QualityProfile } from './quality'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2)

export interface WorldHandle {
  /** 0..1 along the camera path; written every scroll frame */
  setPath(t: number): void
  start(): void
  stop(): void
  resize(): void
  dispose(): void
  /** current station index as a float, for the UI to read */
  readonly stationF: number
}

export interface WorldOptions {
  canvas: HTMLCanvasElement
  quality: QualityProfile
  /** run the establishing shot before handing the camera to the scroll */
  intro: boolean
  reduced: boolean
  onQualityDrop?: (dpr: number) => void
}

/**
 * ONE WORLD.
 *
 * A single persistent scene holding all nine districts in one coordinate
 * space. The camera flies a Catmull-Rom spline threaded through them, so
 * scrolling is literally travel: districts approach, pass through the frame and
 * recede behind you. Nothing is rebuilt between sections — only the camera, the
 * fog and each district's presence change.
 */
export function createWorld({
  canvas,
  quality,
  intro,
  reduced,
  onQualityDrop,
}: WorldOptions): WorldHandle | null {
  const parent = canvas.parentElement
  if (!parent) return null

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality.antialias,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    })
  } catch {
    return null
  }

  const size = () => ({
    w: parent.clientWidth || window.innerWidth,
    h: parent.clientHeight || window.innerHeight,
  })
  let { w, h } = size()
  let dpr = Math.min(window.devicePixelRatio || 1, quality.dpr)
  renderer.setPixelRatio(dpr)
  renderer.setSize(w, h, false)
  renderer.setClearAlpha(0)

  const palette = readPalette()
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(palette.base.getHex(), quality.fogDensity)

  const camera = new THREE.PerspectiveCamera(52, w / h, 0.5, 400)

  // A little light for the few standard materials; most of the world is
  // unlit/additive, which is both cheaper and easier to keep on-palette.
  // Intensity + hue are driven by the journey in the frame loop, so arriving at
  // a district visibly lifts the light and tints it toward that world's accent.
  const ambient = new THREE.AmbientLight(0xffffff, 0.9)
  scene.add(ambient)
  const key = new THREE.DirectionalLight(0xffffff, 0.5)
  key.position.set(6, 12, 8)
  scene.add(key)
  const ambientBase = 0.9
  const keyBase = 0.5
  const litHue = new THREE.Color(0xffffff)

  // ---- disposal bookkeeping ------------------------------------------------
  const trash: Array<THREE.BufferGeometry | THREE.Material> = []
  const track = <T extends THREE.BufferGeometry | THREE.Material>(x: T) => {
    trash.push(x)
    return x
  }
  // materials whose colour must follow the theme: [material, accent key | 'fg']
  const themed: Array<[THREE.Material & { color: THREE.Color }, AccentKey | 'fg']> = []

  // ---- the path ------------------------------------------------------------
  const camPts = stations.map((s) => new THREE.Vector3(...s.camera))
  const focusPts = stations.map((s) => new THREE.Vector3(...s.position))
  const camCurve = new THREE.CatmullRomCurve3(camPts, false, 'catmullrom', 0.4)
  const focusCurve = new THREE.CatmullRomCurve3(focusPts, false, 'catmullrom', 0.4)

  // ---- districts -----------------------------------------------------------
  // Each district lives inside a `holder` group. The district animates its own
  // contents freely; the holder is the *choreography* channel — the scene loop
  // slides, turns and scales it as the camera approaches, settles and passes, so
  // every location has an authored entrance and exit rather than a plain fade.
  interface DistrictSlot {
    d: District
    holder: THREE.Group
    centre: THREE.Vector3
    enterPos: THREE.Vector3
    enterRotY: number
    exitPos: THREE.Vector3
    exitRotY: number
    accentColor: THREE.Color
  }
  const districts: DistrictSlot[] = stations.map((s, i) => {
    const accent = palette.accents[s.accent]
    const ctx: BuildCtx = { accent, fg: palette.fg, quality, track }
    const d = buildDistrict(s.kind, ctx)
    // tag every material so the theme observer can recolour it
    d.group.traverse((o) => {
      const m = (o as THREE.Mesh).material
      if (!m) return
      const list = (Array.isArray(m) ? m : [m]) as Array<
        THREE.Material & { color: THREE.Color }
      >
      for (const mm of list) {
        if (!mm.color) continue
        // structure lines were built from fg, everything else from the accent
        const isFg = mm.color.getHex() === palette.fg.getHex()
        themed.push([mm, isFg ? 'fg' : s.accent])
      }
    })
    const holder = new THREE.Group()
    holder.position.set(...s.position)
    holder.add(d.group)
    scene.add(holder)

    const side = i % 2 === 0 ? 1 : -1
    return {
      d,
      holder,
      centre: new THREE.Vector3(...s.position),
      // swings in from the side, a little above and ahead of the path
      enterPos: new THREE.Vector3(side * 15, 7, 12),
      enterRotY: side * 0.55,
      // recedes and sinks away behind the camera as it is left behind
      exitPos: new THREE.Vector3(-side * 7, -9, -16),
      exitRotY: -side * 0.4,
      accentColor: accent,
    }
  })

  // ---- the connective stream ----------------------------------------------
  // Particles running the whole length of the path. This is what makes the
  // worlds read as one continuous environment: interface fragments become
  // packets, packets become records, records become activations, all along the
  // same line the camera is travelling.
  const streamN = quality.streamCount
  const streamPos = new Float32Array(streamN * 3)
  const streamCol = new Float32Array(streamN * 3)
  const streamT = new Float32Array(streamN)
  const streamOff = new Float32Array(streamN * 3)
  const tmpC = new THREE.Color()
  for (let i = 0; i < streamN; i++) {
    const t = Math.random()
    streamT[i] = t
    streamOff[i * 3] = (Math.random() - 0.5) * 16
    streamOff[i * 3 + 1] = (Math.random() - 0.5) * 12
    streamOff[i * 3 + 2] = (Math.random() - 0.5) * 16
    // colour blends between the two stations this particle sits between
    const f = t * (stationCount - 1)
    const i0 = Math.min(stationCount - 1, Math.floor(f))
    const i1 = Math.min(stationCount - 1, i0 + 1)
    tmpC
      .copy(palette.accents[stations[i0].accent])
      .lerp(palette.accents[stations[i1].accent], f - i0)
    streamCol[i * 3] = tmpC.r
    streamCol[i * 3 + 1] = tmpC.g
    streamCol[i * 3 + 2] = tmpC.b
  }
  const streamGeo = track(new THREE.BufferGeometry())
  streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos, 3))
  streamGeo.setAttribute('color', new THREE.BufferAttribute(streamCol, 3))
  const streamMat = track(
    new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      transparent: true,
      opacity: 0.62,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  const stream = new THREE.Points(streamGeo, streamMat)
  stream.frustumCulled = false
  scene.add(stream)

  const writeStream = () => {
    const p = streamGeo.attributes.position as THREE.BufferAttribute
    const arr = p.array as Float32Array
    const v = new THREE.Vector3()
    for (let i = 0; i < streamN; i++) {
      v.copy(camCurve.getPointAt(clamp(streamT[i])))
      arr[i * 3] = v.x + streamOff[i * 3]
      arr[i * 3 + 1] = v.y + streamOff[i * 3 + 1]
      arr[i * 3 + 2] = v.z + streamOff[i * 3 + 2]
    }
    p.needsUpdate = true
  }
  writeStream()

  // ---- state ---------------------------------------------------------------
  let pathTarget = 0
  let pathSmooth = 0
  let stationF = 0
  let running = false
  let raf = 0
  let introT = intro && !reduced ? 0 : 1
  const clock = new THREE.Clock()
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

  const camPos = new THREE.Vector3()
  const lookAt = new THREE.Vector3()
  const tmpV = new THREE.Vector3()

  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2
  }
  if (quality.cameraSway && !reduced) {
    window.addEventListener('pointermove', onPointer, { passive: true })
  }

  // ---- frame ---------------------------------------------------------------
  let slowFrames = 0
  let ema = 16

  const frame = () => {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    const time = clock.elapsedTime

    // adaptive quality: sustained slow frames shed resolution before they
    // shed frames the visitor can feel
    ema = ema * 0.92 + dt * 1000 * 0.08
    if (ema > 24 && dpr > 1) {
      if (++slowFrames > 90) {
        slowFrames = 0
        dpr = Math.max(1, dpr - 0.25)
        renderer.setPixelRatio(dpr)
        onQualityDrop?.(dpr)
      }
    } else slowFrames = 0

    // scroll is smoothed so a flicked wheel never snaps the camera
    pathSmooth += (pathTarget - pathSmooth) * Math.min(1, dt * 4.5)
    if (introT < 1) introT = Math.min(1, introT + dt / 2.6)

    const t = clamp(pathSmooth)
    stationF = t * (stationCount - 1)

    camCurve.getPointAt(t, camPos)
    focusCurve.getPointAt(Math.min(1, t + 0.045), lookAt)

    // establishing shot: begin pulled back and above, settle onto the path
    if (introT < 1) {
      const e = easeInOut(introT)
      camPos.z += (1 - e) * 46
      camPos.y += (1 - e) * 20
      camPos.x += (1 - e) * -8
    }

    if (quality.cameraSway && !reduced) {
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 2.2)
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 2.2)
      camPos.x += pointer.x * 1.5 + Math.sin(time * 0.21) * 0.5
      camPos.y += -pointer.y * 1.0 + Math.cos(time * 0.17) * 0.35
    }

    camera.position.copy(camPos)
    camera.lookAt(lookAt)
    // a whisper of roll as the path banks — cinematic, never nauseating
    camera.rotation.z = Math.sin(t * Math.PI * 3) * 0.02

    // districts: presence by distance along the station axis, plus culling, plus
    // an authored entrance/exit envelope on each holder.
    let nearestPresence = 0
    let nearestIdx = 0
    for (let i = 0; i < districts.length; i++) {
      const slot = districts[i]
      const { d, holder, centre } = slot
      const near = camera.position.distanceTo(centre)
      if (near > quality.cullDistance) {
        if (holder.visible) holder.visible = false
        continue
      }
      holder.visible = true

      // signed distance along the station axis: <0 ahead of the camera, >0 passed
      const rel = stationF - i
      const presence = clamp(1 - Math.abs(rel) / 1.25)
      if (presence > nearestPresence) {
        nearestPresence = presence
        nearestIdx = i
      }

      // choreography: swing in from the entrance pose, settle at the station,
      // then drift out along the exit pose once the camera is past.
      let ox = 0
      let oy = 0
      let oz = 0
      let ry = 0
      let scl = 1
      if (rel < 0) {
        const k = easeInOut(clamp(1 + rel / 1.6)) // 0 far ahead → 1 settled
        const inv = 1 - k
        ox = slot.enterPos.x * inv
        oy = slot.enterPos.y * inv
        oz = slot.enterPos.z * inv
        ry = slot.enterRotY * inv
        scl = 0.82 + 0.18 * k
      } else {
        const k = easeInOut(clamp(rel / 1.6)) // 0 settled → 1 fully behind
        ox = slot.exitPos.x * k
        oy = slot.exitPos.y * k
        oz = slot.exitPos.z * k
        ry = slot.exitRotY * k
        scl = 1 - 0.12 * k
      }
      holder.position.set(centre.x + ox, centre.y + oy, centre.z + oz)
      holder.rotation.y = ry
      holder.scale.setScalar(scl)

      d.update(easeInOut(clamp(presence * 1.15)), time, dt)
    }

    // lighting responds to the journey: brighter and tinted toward the active
    // world's accent when the camera is at a district, dimmer in the space
    // between; the fog opens up slightly on arrival.
    const litT = easeInOut(nearestPresence)
    ambient.intensity += (ambientBase * (0.62 + 0.5 * litT) - ambient.intensity) * Math.min(1, dt * 3)
    key.intensity += (keyBase * (0.7 + 0.7 * litT) - key.intensity) * Math.min(1, dt * 3)
    litHue.set(0xffffff).lerp(districts[nearestIdx].accentColor, 0.32 * litT)
    key.color.lerp(litHue, Math.min(1, dt * 2.5))
    ;(scene.fog as THREE.FogExp2).density +=
      (quality.fogDensity * (1.16 - 0.28 * litT) - (scene.fog as THREE.FogExp2).density) *
      Math.min(1, dt * 2)

    streamMat.opacity = 0.62 * (0.35 + 0.65 * introT)
    stream.rotation.y = Math.sin(time * 0.03) * 0.02

    renderer.render(scene, camera)
  }

  // ---- lifecycle -----------------------------------------------------------
  const start = () => {
    if (running) return
    running = true
    clock.getDelta()
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  const applyFraming = () => {
    camera.aspect = w / h
    // Push the world right on desktop; centre it on phones, where the text
    // column spans the full width and there is no side to vacate.
    const shift = w / h > 1.25 ? w * 0.17 : 0
    if (shift > 0) camera.setViewOffset(w, h, -shift, 0, w, h)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
  }

  const resize = () => {
    const s = size()
    w = s.w
    h = s.h
    applyFraming()
    renderer.setSize(w, h, false)
    if (!running) renderer.render(scene, camera)
  }
  applyFraming()

  // theme change → relight the whole world from the CSS tokens
  const themeObserver = new MutationObserver(() => {
    refreshPalette(palette)
    ;(scene.fog as THREE.FogExp2).color.copy(palette.base)
    for (const [m, keyName] of themed) {
      m.color.copy(keyName === 'fg' ? palette.fg : palette.accents[keyName])
    }
    for (let i = 0; i < streamN; i++) {
      const f = streamT[i] * (stationCount - 1)
      const i0 = Math.min(stationCount - 1, Math.floor(f))
      const i1 = Math.min(stationCount - 1, i0 + 1)
      tmpC
        .copy(palette.accents[stations[i0].accent])
        .lerp(palette.accents[stations[i1].accent], f - i0)
      streamCol[i * 3] = tmpC.r
      streamCol[i * 3 + 1] = tmpC.g
      streamCol[i * 3 + 2] = tmpC.b
    }
    ;(streamGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true
    if (!running) renderer.render(scene, camera)
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  const onContextLost = (e: Event) => {
    e.preventDefault()
    stop()
  }
  canvas.addEventListener('webglcontextlost', onContextLost)

  // Development-only introspection. Draw calls and triangle counts are the
  // hardware-independent measure of what this world actually costs; being able
  // to read them without a profiler is worth the three lines.
  if (process.env.NODE_ENV !== 'production') {
    ;(window as unknown as Record<string, unknown>).__world = {
      info: () => ({
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        points: renderer.info.render.points,
        lines: renderer.info.render.lines,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        programs: renderer.info.programs?.length ?? 0,
        dpr,
        tier: quality.tier,
        path: +pathSmooth.toFixed(3),
        target: +pathTarget.toFixed(3),
        stationF: +stationF.toFixed(2),
        visible: districts.filter((x) => x.holder.visible).length,
        cam: camera.position.toArray().map((n) => +n.toFixed(1)),
      }),
    }
  }

  // first frame so the world is present before the scroll listener attaches
  camCurve.getPointAt(0, camPos)
  focusCurve.getPointAt(0.045, lookAt)
  camera.position.copy(camPos)
  camera.lookAt(lookAt)
  renderer.render(scene, camera)

  return {
    setPath(t: number) {
      pathTarget = clamp(t)
    },
    get stationF() {
      return stationF
    },
    start,
    stop,
    resize,
    dispose() {
      stop()
      themeObserver.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      window.removeEventListener('pointermove', onPointer)
      scene.traverse((o) => {
        const im = o as THREE.InstancedMesh
        if (im.isInstancedMesh) im.dispose()
      })
      for (const x of trash) x.dispose()
      renderer.dispose()
      try {
        renderer.forceContextLoss()
      } catch {
        /* noop */
      }
      void tmpV
    },
  }
}
