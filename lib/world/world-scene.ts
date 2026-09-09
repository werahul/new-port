import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { stations, stationCount } from '@/content/world'
import { buildDistrict, type BuildCtx, type District } from './districts'
import { readPalette } from './palette'
import type { QualityProfile } from './quality'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
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
  /** fired once, from inside the render loop, after the first completed frame */
  onFirstFrame?: () => void
  onQualityDrop?: (dpr: number) => void
}

/* ---------------------------------------------------------------------------
   CONSTRAINED ORBIT

   The scroll owns the camera's position on the spline — that is the journey and
   it is not negotiable. What the pointer owns is a bounded offset *around* that
   position: yaw and pitch about the focus point, plus a little dolly. Released,
   it springs home.

   This is deliberately not OrbitControls. Free orbit would give the camera two
   owners, and on touch it would capture the gestures the page needs in order to
   scroll at all.
   -------------------------------------------------------------------------- */
const ORBIT = {
  /** pointer-position influence, always on */
  hoverYaw: 0.07, // ~4°
  hoverPitch: 0.035, // ~2°
  /** drag influence, additive on top of hover */
  dragYaw: 0.21, // ~12°
  dragPitch: 0.122, // ~7°
  dragDolly: 2.5,
  /** pixels of travel that map to the full drag range */
  dragSpan: 520,
  stiffness: 70,
  damping: 13,
} as const

/** Controls and text keep their own gestures; the world only takes what is left. */
const ORBIT_BLOCKING =
  'a,button,input,textarea,select,summary,label,[role="button"],[data-no-orbit],' +
  'p,h1,h2,h3,h4,h5,h6,li,dt,dd,blockquote,code,pre,figcaption'

/**
 * ONE WORLD.
 *
 * A single persistent scene holding all nine districts in one coordinate
 * space. The camera flies a Catmull-Rom spline threaded through them, so
 * scrolling is literally travel: districts approach, pass through the frame and
 * recede behind you. Nothing is rebuilt between sections — only the camera, the
 * lighting, the fog and each district's presence change.
 */
export function createWorld({
  canvas,
  quality,
  intro,
  onFirstFrame,
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

  // ---- render pipeline -----------------------------------------------------
  // ACES is what stops saturated accent light clipping to flat colour where two
  // glows overlap. It is the difference between "bright pixels" and "exposed
  // film", and it costs one tone-map in the fragment shader.
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  // ACES rolls off highlights, which is exactly what stops two overlapping
  // additive glows clipping to flat white — but it also pulls the additive
  // linework down, and that linework *is* the look. The exposure lift puts the
  // punch back without giving up the roll-off.
  renderer.toneMappingExposure = 1.22
  renderer.setClearAlpha(0)

  const size = () => ({
    w: Math.max(1, parent.clientWidth),
    h: Math.max(1, parent.clientHeight),
  })
  let { w, h } = size()
  const dprCeiling = quality.dpr
  const dprFloor = Math.min(quality.dprFloor, window.devicePixelRatio || 1)
  let dpr = Math.min(window.devicePixelRatio || 1, dprCeiling)
  renderer.setPixelRatio(dpr)
  renderer.setSize(w, h, false)

  const palette = readPalette()
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(palette.base.getHex(), quality.fogDensity)

  // A generated interior probe — real specular response and a believable
  // falloff on every standard material, with no texture to download.
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const envRT = pmrem.fromScene(room, 0.04)
  scene.environment = envRT.texture
  // Both the probe scene and the generator have done their job the moment the
  // cubemap exists; only the render target needs to outlive them.
  room.dispose()
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(52, w / h, 0.5, 400)

  /* ---- the light rig ------------------------------------------------------
     Cinematic rather than bright: a low ambient floor, a warm key high and off
     axis, a much weaker cool fill, and a rim that sits behind whatever the
     camera is looking at. The rim is what separates geometry from the fog and
     does most of the work that shadow maps would otherwise be asked for — at a
     fraction of the cost, and without a depth pass over instanced wireframe
     geometry that would barely register. */
  const lightTarget = new THREE.Object3D()
  scene.add(lightTarget)

  const ambient = new THREE.AmbientLight(0xdfe6ff, 0.22)
  scene.add(ambient)

  // Doubles as the cool fill, which is why there is no separate fill light:
  // every additional light multiplies the per-fragment cost of every standard
  // material in the frame, and that cost was being paid in resolution.
  const hemi = new THREE.HemisphereLight(0xaec4ff, 0x0a0b10, 0.42)
  scene.add(hemi)

  const key = new THREE.DirectionalLight(0xfff1dd, 2.1)
  key.target = lightTarget
  scene.add(key)

  const rim = new THREE.DirectionalLight(0xffffff, 2.4)
  rim.target = lightTarget
  scene.add(rim)

  // The district's own hue, arriving as light rather than as pigment.
  const accentLight = new THREE.PointLight(0xffffff, 0, 70, 2)
  scene.add(accentLight)

  const ambientBase = 0.22
  const keyBase = 2.1
  const rimBase = 2.4
  const litHue = new THREE.Color(0xffffff)

  // ---- disposal bookkeeping ------------------------------------------------
  const trash: Array<THREE.BufferGeometry | THREE.Material> = []
  const track = <T extends THREE.BufferGeometry | THREE.Material>(x: T) => {
    trash.push(x)
    return x
  }

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
      // matches ADDITIVE_GAIN in districts.ts — same reason
      opacity: 0.64,
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
  let firstFrameSent = false
  let introT = intro ? 0 : 1
  const clock = new THREE.Clock()

  const camPos = new THREE.Vector3()
  const lookAt = new THREE.Vector3()
  const orbitVec = new THREE.Vector3()
  const rightAxis = new THREE.Vector3()
  const UP = new THREE.Vector3(0, 1, 0)

  /* ---- pointer input ------------------------------------------------------ */
  const orbit = {
    hx: 0,
    hy: 0,
    dragX: 0,
    dragY: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    yaw: 0,
    pitch: 0,
    dolly: 0,
    vYaw: 0,
    vPitch: 0,
    vDolly: 0,
  }

  const interactive = quality.cameraSway

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    orbit.hx = (e.clientX / window.innerWidth - 0.5) * 2
    orbit.hy = (e.clientY / window.innerHeight - 0.5) * 2
    if (orbit.dragging) {
      orbit.dragX = clamp((e.clientX - orbit.startX) / ORBIT.dragSpan, -1, 1)
      orbit.dragY = clamp((e.clientY - orbit.startY) / ORBIT.dragSpan, -1, 1)
    }
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const t = e.target
    // Never take a gesture that belongs to a control or to selectable text.
    if (t instanceof Element && t.closest(ORBIT_BLOCKING)) return
    orbit.dragging = true
    orbit.startX = e.clientX
    orbit.startY = e.clientY
    document.body.dataset.orbiting = 'true'
  }

  const releaseDrag = () => {
    if (!orbit.dragging) return
    orbit.dragging = false
    orbit.dragX = 0
    orbit.dragY = 0
    delete document.body.dataset.orbiting
  }

  if (interactive) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', releaseDrag, { passive: true })
    window.addEventListener('pointercancel', releaseDrag, { passive: true })
    window.addEventListener('blur', releaseDrag)
  }

  /** Critically-ish damped spring — a little overshoot, settles in ~0.6s. */
  const springStep = (cur: number, vel: number, target: number, dt: number) => {
    const a = (target - cur) * ORBIT.stiffness - vel * ORBIT.damping
    const v = vel + a * dt
    return [cur + v * dt, v] as const
  }

  // ---- frame ---------------------------------------------------------------
  let slowFrames = 0
  let ema = 16

  const frame = () => {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    const time = clock.elapsedTime

    /* Adaptive quality, deliberately reluctant.
       The old version tripped at 24ms (~41fps) after only 90 frames and had a
       floor of 1.0, so a scene that was merely *working hard* would walk its
       own resolution down to 1x and stay there — which is what "it looks
       blurry and pixelated now" actually was. It now waits for a genuinely
       unacceptable frame time, needs it sustained for ~2.5s, and can never
       drop below the tier's floor. Better to run at 40fps and look sharp than
       at 60fps and look cheap. */
    ema = ema * 0.92 + dt * 1000 * 0.08
    if (ema > 34 && dpr > dprFloor) {
      if (++slowFrames > 150) {
        slowFrames = 0
        dpr = Math.max(dprFloor, dpr - 0.25)
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

    // A slow, pointer-independent drift. Without it a still cursor produces a
    // perfectly locked-off camera, which reads as a render rather than a place.
    camPos.x += Math.sin(time * 0.21) * 0.45
    camPos.y += Math.cos(time * 0.17) * 0.3

    // ---- constrained orbit, applied *around the focus point* ---------------
    if (interactive) {
      const targetYaw =
        orbit.hx * ORBIT.hoverYaw + orbit.dragX * ORBIT.dragYaw
      const targetPitch =
        orbit.hy * ORBIT.hoverPitch + orbit.dragY * ORBIT.dragPitch
      const targetDolly = orbit.dragging ? orbit.dragY * ORBIT.dragDolly : 0

      ;[orbit.yaw, orbit.vYaw] = springStep(orbit.yaw, orbit.vYaw, targetYaw, dt)
      ;[orbit.pitch, orbit.vPitch] = springStep(
        orbit.pitch,
        orbit.vPitch,
        targetPitch,
        dt,
      )
      ;[orbit.dolly, orbit.vDolly] = springStep(
        orbit.dolly,
        orbit.vDolly,
        targetDolly,
        dt,
      )

      orbitVec.subVectors(camPos, lookAt)
      const reach = orbitVec.length()
      // A zero-length view vector, or one parallel to world up, would make the
      // normalisations below produce NaN and take the whole camera with them.
      if (reach > 0.001) {
        orbitVec.applyAxisAngle(UP, orbit.yaw)
        rightAxis.crossVectors(orbitVec, UP)
        if (rightAxis.lengthSq() > 1e-6) {
          rightAxis.normalize()
          orbitVec.applyAxisAngle(rightAxis, orbit.pitch)
        }
        orbitVec.setLength(Math.max(3, reach + orbit.dolly))
        camPos.copy(lookAt).add(orbitVec)
      }
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

    /* ---- lighting follows the journey -------------------------------------
       The rig travels with the camera and aims at whatever it is looking at, so
       the key stays off-axis and the rim stays *behind* the subject no matter
       where on the spline we are. Arriving at a district lifts the light and
       tints it toward that world's hue; the fog opens a little on arrival. */
    const litT = easeInOut(nearestPresence)
    const active = districts[nearestIdx]
    lightTarget.position.copy(active.centre)
    lightTarget.updateMatrixWorld()

    key.position.set(camPos.x + 14, camPos.y + 20, camPos.z + 10)
    // opposite the camera, past the subject — the separation light
    orbitVec.subVectors(camPos, active.centre)
    if (orbitVec.lengthSq() > 1e-6) {
      rim.position.copy(active.centre).sub(orbitVec.setLength(26))
      rim.position.y += 9
    }

    ambient.intensity +=
      (ambientBase * (0.7 + 0.7 * litT) - ambient.intensity) * Math.min(1, dt * 3)
    key.intensity +=
      (keyBase * (0.55 + 0.75 * litT) - key.intensity) * Math.min(1, dt * 3)
    rim.intensity +=
      (rimBase * (0.4 + 0.9 * litT) - rim.intensity) * Math.min(1, dt * 3)

    litHue.set(0xffffff).lerp(active.accentColor, 0.4 * litT)
    key.color.lerp(litHue, Math.min(1, dt * 2.5))

    // the accent, arriving as coloured light in the district's own space
    accentLight.position.lerpVectors(active.centre, camPos, 0.32)
    accentLight.color.lerp(active.accentColor, Math.min(1, dt * 3))
    accentLight.intensity += (140 * litT - accentLight.intensity) * Math.min(1, dt * 3)

    ;(scene.fog as THREE.FogExp2).density +=
      (quality.fogDensity * (1.16 - 0.28 * litT) - (scene.fog as THREE.FogExp2).density) *
      Math.min(1, dt * 2)

    streamMat.opacity = 0.64 * (0.35 + 0.65 * introT)
    stream.rotation.y = Math.sin(time * 0.03) * 0.02

    renderer.render(scene, camera)

    if (!firstFrameSent) {
      firstFrameSent = true
      onFirstFrame?.()
    }
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
    const aspect = w / h
    camera.aspect = aspect
    // Back to the reference framing. A 40mm-equivalent lens compressed the
    // districts nicely but magnified them too, and magnifying low-poly geometry
    // is a direct trade against apparent quality — the thing being asked for
    // here. Phones still get a wider field or the district will not fit.
    camera.fov = aspect > 1.25 ? 52 : 60
    // Push the world right on desktop; centre it on phones, where the text
    // column spans the full width and there is no side to vacate.
    const shift = aspect > 1.25 ? w * 0.17 : 0
    if (shift > 0) camera.setViewOffset(w, h, -shift, 0, w, h)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
  }

  const resize = () => {
    const s = size()
    w = s.w
    h = s.h
    // DPR is not fixed for the life of a page: dragging a window between a
    // retina and a non-retina display changes it, and the old code never
    // re-read it. Never climb back above whatever the adaptive step settled on.
    const next = Math.min(window.devicePixelRatio || 1, dprCeiling)
    if (next !== dpr && next >= dprFloor) {
      dpr = next
      renderer.setPixelRatio(dpr)
    }
    applyFraming()
    renderer.setSize(w, h, false)
    if (!running) renderer.render(scene, camera)
  }
  applyFraming()

  // ---- context loss --------------------------------------------------------
  // `preventDefault` on loss is what lets three.js re-initialise on restore.
  // Without the restore half, a driver reset or a backgrounded GPU process
  // killed the world permanently.
  const onContextLost = (e: Event) => {
    e.preventDefault()
    stop()
  }
  const onContextRestored = () => {
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    start()
  }
  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.addEventListener('webglcontextrestored', onContextRestored)

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

  // Prime the camera so the very first frame the loop renders is already in the
  // right place — the establishing shot starts from a composed image, not from
  // whatever the default camera was pointing at.
  camCurve.getPointAt(0, camPos)
  focusCurve.getPointAt(0.045, lookAt)
  camera.position.copy(camPos)
  camera.lookAt(lookAt)

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
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      if (interactive) {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerdown', onPointerDown)
        window.removeEventListener('pointerup', releaseDrag)
        window.removeEventListener('pointercancel', releaseDrag)
        window.removeEventListener('blur', releaseDrag)
      }
      delete document.body.dataset.orbiting
      scene.traverse((o) => {
        const im = o as THREE.InstancedMesh
        if (im.isInstancedMesh) im.dispose()
      })
      for (const x of trash) x.dispose()
      envRT.dispose()
      pmrem.dispose()
      scene.environment = null
      renderer.dispose()
      try {
        renderer.forceContextLoss()
      } catch {
        /* noop */
      }
    },
  }
}
