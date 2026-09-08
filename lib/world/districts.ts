import * as THREE from 'three'
import type { DistrictKind } from '@/content/world'
import type { QualityProfile } from './quality'

export interface District {
  group: THREE.Group
  /**
   * @param presence 0..1 — how much attention the camera is giving this
   *   location. Districts fade in as the camera approaches and out behind it,
   *   which is what makes the worlds morph into one another rather than
   *   popping.
   * @param time     seconds since scene start
   * @param dt       frame delta, already clamped
   */
  update(presence: number, time: number, dt: number): void
}

export interface BuildCtx {
  accent: THREE.Color
  fg: THREE.Color
  quality: QualityProfile
  /** register a geometry/material for disposal with the scene */
  track: <T extends THREE.BufferGeometry | THREE.Material>(x: T) => T
}

const TMP = new THREE.Object3D()
const scaled = (n: number, q: QualityProfile) => Math.max(3, Math.round(n * q.density))

/** Additive line material — the workhorse for structure that should glow. */
function lineMat(ctx: BuildCtx, color: THREE.Color, opacity: number) {
  return ctx.track(
    new THREE.LineBasicMaterial({
      color: color.clone(),
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
}

function pointMat(ctx: BuildCtx, color: THREE.Color, size: number, opacity: number) {
  return ctx.track(
    new THREE.PointsMaterial({
      color: color.clone(),
      size,
      transparent: true,
      opacity,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
}

function faceMat(ctx: BuildCtx, color: THREE.Color, opacity: number) {
  return ctx.track(
    new THREE.MeshBasicMaterial({
      color: color.clone(),
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
}

/** Collect every material in a group so presence can drive their opacity. */
function fadeable(group: THREE.Group) {
  const mats: Array<THREE.Material & { opacity: number }> = []
  group.traverse((o) => {
    const m = (o as THREE.Mesh).material
    if (!m) return
    const list = Array.isArray(m) ? m : [m]
    for (const mm of list) {
      const fm = mm as THREE.Material & { opacity: number }
      if (fm.userData.baseOpacity === undefined) fm.userData.baseOpacity = fm.opacity
      mats.push(fm)
    }
  })
  return mats
}

function applyPresence(
  mats: Array<THREE.Material & { opacity: number }>,
  presence: number,
) {
  for (const m of mats) {
    m.opacity = (m.userData.baseOpacity as number) * presence
  }
}

/* ========================================================================== */
/* 01 — ENTRY : a gateway. Arches receding into fog, a ground plane, distant    */
/*      structures. The first thing the visitor sees: somewhere, not something. */
/* ========================================================================== */
function gateway(ctx: BuildCtx): District {
  const g = new THREE.Group()
  const { accent, fg, quality } = ctx

  // receding arches — the sense of a threshold being passed through
  const archGeo = ctx.track(new THREE.TorusGeometry(9, 0.06, 6, 64))
  const archMat = lineMat(ctx, accent, 0.5)
  const archMesh = new THREE.InstancedMesh(archGeo, archMat, 7)
  for (let i = 0; i < 7; i++) {
    TMP.position.set(0, 0, -i * 13)
    TMP.rotation.set(0, 0, i * 0.14)
    TMP.scale.setScalar(1 + i * 0.09)
    TMP.updateMatrix()
    archMesh.setMatrixAt(i, TMP.matrix)
  }
  archMesh.instanceMatrix.needsUpdate = true
  g.add(archMesh)

  // ground plane: a grid that reads as terrain without being a literal floor
  const gridSize = 150
  const div = quality.tier === 'low' ? 22 : 40
  const gridPts: number[] = []
  for (let i = 0; i <= div; i++) {
    const t = (i / div - 0.5) * gridSize
    gridPts.push(-gridSize / 2, 0, t, gridSize / 2, 0, t)
    gridPts.push(t, 0, -gridSize / 2, t, 0, gridSize / 2)
  }
  const gridGeo = ctx.track(new THREE.BufferGeometry())
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3))
  const grid = new THREE.LineSegments(gridGeo, lineMat(ctx, fg, 0.09))
  grid.position.y = -12
  g.add(grid)

  // distant monoliths — scale reference, so the space feels large
  const slabGeo = ctx.track(new THREE.BoxGeometry(3, 30, 3))
  const slabMat = ctx.track(
    new THREE.MeshBasicMaterial({
      color: fg.clone(),
      transparent: true,
      opacity: 0.05,
      wireframe: true,
    }),
  )
  const slabs = scaled(14, quality)
  const slabMesh = new THREE.InstancedMesh(slabGeo, slabMat, slabs)
  for (let i = 0; i < slabs; i++) {
    const a = (i / slabs) * Math.PI * 2
    const r = 34 + (i % 4) * 11
    TMP.position.set(Math.cos(a) * r, -12 + ((i * 7) % 13), Math.sin(a) * r - 18)
    TMP.rotation.set(0, a, 0)
    TMP.scale.set(1, 0.5 + ((i * 3) % 10) / 6, 1)
    TMP.updateMatrix()
    slabMesh.setMatrixAt(i, TMP.matrix)
  }
  slabMesh.instanceMatrix.needsUpdate = true
  g.add(slabMesh)

  // a soft light core at the threshold
  const core = new THREE.Points(
    (() => {
      const n = scaled(220, quality)
      const arr = new Float32Array(n * 3)
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.pow(Math.random(), 0.6) * 8
        arr[i * 3] = Math.cos(a) * r
        arr[i * 3 + 1] = (Math.random() - 0.5) * 6
        arr[i * 3 + 2] = Math.sin(a) * r
      }
      const geo = ctx.track(new THREE.BufferGeometry())
      geo.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3))
      return geo
    })(),
    pointMat(ctx, accent, 0.09, 0.55),
  )
  g.add(core)

  const mats = fadeable(g)
  return {
    group: g,
    update(presence, time) {
      applyPresence(mats, presence)
      archMesh.rotation.z = Math.sin(time * 0.12) * 0.04
      core.rotation.y = time * 0.05
      grid.position.y = -12 + Math.sin(time * 0.25) * 0.3
    },
  }
}

/* ========================================================================== */
/* 02 — FRONTEND : interface surfaces. Panels layered in depth, component       */
/*      blocks, a viewport frame. Composition, not decoration.                  */
/* ========================================================================== */
function surfaces(ctx: BuildCtx): District {
  const g = new THREE.Group()
  const { accent, fg, quality } = ctx

  // layered interface panels
  const panelGeo = ctx.track(new THREE.PlaneGeometry(5.2, 3.4))
  const panelMat = faceMat(ctx, accent, 0.07)
  const panelCount = scaled(16, quality)
  const panels = new THREE.InstancedMesh(panelGeo, panelMat, panelCount)
  const edgeGeo = ctx.track(new THREE.EdgesGeometry(panelGeo))
  const edges = new THREE.InstancedMesh(edgeGeo, lineMat(ctx, accent, 0.5), panelCount)
  const seeds: Array<{ x: number; y: number; z: number; ph: number }> = []
  for (let i = 0; i < panelCount; i++) {
    const col = (i % 4) - 1.5
    const row = Math.floor(i / 4) - 1.5
    const s = {
      x: col * 7.2 + (i % 2 ? 1.1 : -1.1),
      y: row * 4.6,
      z: -((i * 5) % 22) - 2,
      ph: i * 0.7,
    }
    seeds.push(s)
  }
  g.add(panels, edges)

  // component blocks — the small parts a layout is assembled from
  const barGeo = ctx.track(new THREE.BoxGeometry(2.6, 0.16, 0.16))
  const barCount = scaled(30, quality)
  const bars = new THREE.InstancedMesh(barGeo, faceMat(ctx, fg, 0.3), barCount)
  for (let i = 0; i < barCount; i++) {
    TMP.position.set(
      ((i * 13) % 30) - 15,
      ((i * 7) % 18) - 9,
      -((i * 11) % 26),
    )
    TMP.rotation.set(0, 0, 0)
    TMP.scale.set(0.4 + ((i * 5) % 10) / 8, 1, 1)
    TMP.updateMatrix()
    bars.setMatrixAt(i, TMP.matrix)
  }
  bars.instanceMatrix.needsUpdate = true
  g.add(bars)

  const mats = fadeable(g)
  return {
    group: g,
    update(presence, time) {
      applyPresence(mats, presence)
      // panels drift and settle — a layout resolving itself
      for (let i = 0; i < panelCount; i++) {
        const s = seeds[i]
        const drift = Math.sin(time * 0.35 + s.ph) * 0.5
        TMP.position.set(s.x, s.y + drift, s.z)
        TMP.rotation.set(0, Math.sin(time * 0.2 + s.ph) * 0.16, 0)
        TMP.scale.setScalar(0.85 + presence * 0.15)
        TMP.updateMatrix()
        panels.setMatrixAt(i, TMP.matrix)
        edges.setMatrixAt(i, TMP.matrix)
      }
      panels.instanceMatrix.needsUpdate = true
      edges.instanceMatrix.needsUpdate = true
      bars.rotation.y = Math.sin(time * 0.15) * 0.1
    },
  }
}

/* ========================================================================== */
/* 03 — BACKEND : services and the traffic between them. Nodes, the edges that  */
/*      connect them, and packets actually moving along those edges.            */
/* ========================================================================== */
function pipelines(ctx: BuildCtx): District {
  const g = new THREE.Group()
  const { accent, fg, quality } = ctx

  const nodeCount = scaled(11, quality)
  const nodes: THREE.Vector3[] = []
  for (let i = 0; i < nodeCount; i++) {
    const a = (i / nodeCount) * Math.PI * 2
    const r = 9 + (i % 3) * 3.5
    nodes.push(
      new THREE.Vector3(Math.cos(a) * r, ((i * 5) % 11) - 5, Math.sin(a) * r - 4),
    )
  }

  const nodeGeo = ctx.track(new THREE.OctahedronGeometry(0.62, 0))
  const nodeMesh = new THREE.InstancedMesh(
    nodeGeo,
    ctx.track(
      new THREE.MeshBasicMaterial({
        color: accent.clone(),
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      }),
    ),
    nodeCount,
  )
  nodes.forEach((p, i) => {
    TMP.position.copy(p)
    TMP.rotation.set(0, 0, 0)
    TMP.scale.setScalar(1)
    TMP.updateMatrix()
    nodeMesh.setMatrixAt(i, TMP.matrix)
  })
  nodeMesh.instanceMatrix.needsUpdate = true
  g.add(nodeMesh)

  // edges: each node wired to the next two — a service graph, not a ring
  const routes: Array<[THREE.Vector3, THREE.Vector3]> = []
  const linePts: number[] = []
  for (let i = 0; i < nodeCount; i++) {
    for (const step of [1, 3]) {
      const a = nodes[i]
      const b = nodes[(i + step) % nodeCount]
      routes.push([a, b])
      linePts.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
  }
  const lineGeo = ctx.track(new THREE.BufferGeometry())
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3))
  g.add(new THREE.LineSegments(lineGeo, lineMat(ctx, fg, 0.16)))

  // packets in flight
  const pkCount = scaled(34, quality)
  const pkGeo = ctx.track(new THREE.BoxGeometry(0.2, 0.2, 0.5))
  const packets = new THREE.InstancedMesh(pkGeo, faceMat(ctx, accent, 0.95), pkCount)
  const pk = Array.from({ length: pkCount }, (_, i) => ({
    route: routes[i % routes.length],
    t: Math.random(),
    speed: 0.16 + Math.random() * 0.24,
  }))
  g.add(packets)

  const mats = fadeable(g)
  return {
    group: g,
    update(presence, time, dt) {
      applyPresence(mats, presence)
      for (let i = 0; i < pkCount; i++) {
        const p = pk[i]
        p.t += dt * p.speed
        if (p.t > 1) p.t -= 1
        const [a, b] = p.route
        TMP.position.lerpVectors(a, b, p.t)
        TMP.lookAt(b)
        TMP.scale.setScalar(1)
        TMP.updateMatrix()
        packets.setMatrixAt(i, TMP.matrix)
      }
      packets.instanceMatrix.needsUpdate = true
      g.rotation.y = Math.sin(time * 0.08) * 0.12
      nodeMesh.rotation.y = time * 0.06
    },
  }
}

/* ========================================================================== */
/* 04 — DATA : layered strata. Storage as architecture — open rings stacked in  */
/*      depth with records descending through them.                             */
/* ========================================================================== */
function strata(ctx: BuildCtx): District {
  const g = new THREE.Group()
  const { accent, fg, quality } = ctx

  const layers = quality.tier === 'low' ? 5 : 8
  const ringGeo = ctx.track(new THREE.CylinderGeometry(6, 6, 0.12, 48, 1, true))
  const ringMat = ctx.track(
    new THREE.MeshBasicMaterial({
      color: accent.clone(),
      wireframe: true,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    }),
  )
  const rings = new THREE.InstancedMesh(ringGeo, ringMat, layers)
  for (let i = 0; i < layers; i++) {
    TMP.position.set(0, 7 - i * 2.1, 0)
    TMP.rotation.set(0, i * 0.24, 0)
    TMP.scale.setScalar(1 - i * 0.055)
    TMP.updateMatrix()
    rings.setMatrixAt(i, TMP.matrix)
  }
  rings.instanceMatrix.needsUpdate = true
  g.add(rings)

  // the shafts that tie the strata together
  const shaftPts: number[] = []
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const x = Math.cos(a) * 6
    const z = Math.sin(a) * 6
    shaftPts.push(x, 7.4, z, x * 0.6, 7.4 - layers * 2.1, z * 0.6)
  }
  const shaftGeo = ctx.track(new THREE.BufferGeometry())
  shaftGeo.setAttribute('position', new THREE.Float32BufferAttribute(shaftPts, 3))
  g.add(new THREE.LineSegments(shaftGeo, lineMat(ctx, fg, 0.13)))

  // records flowing down through the layers
  const recCount = scaled(320, quality)
  const recArr = new Float32Array(recCount * 3)
  const recSeed = new Float32Array(recCount * 3) // angle, radius, speed
  for (let i = 0; i < recCount; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 1 + Math.random() * 5.4
    recSeed[i * 3] = a
    recSeed[i * 3 + 1] = r
    recSeed[i * 3 + 2] = 0.7 + Math.random() * 1.6
    recArr[i * 3] = Math.cos(a) * r
    recArr[i * 3 + 1] = 8 - Math.random() * (layers * 2.1 + 2)
    recArr[i * 3 + 2] = Math.sin(a) * r
  }
  const recGeo = ctx.track(new THREE.BufferGeometry())
  recGeo.setAttribute('position', new THREE.BufferAttribute(recArr, 3))
  const records = new THREE.Points(recGeo, pointMat(ctx, accent, 0.11, 0.85))
  g.add(records)

  const bottom = 7 - layers * 2.1 - 1
  const mats = fadeable(g)
  return {
    group: g,
    update(presence, time, dt) {
      applyPresence(mats, presence)
      const pos = recGeo.attributes.position as THREE.BufferAttribute
      const arr = pos.array as Float32Array
      for (let i = 0; i < recCount; i++) {
        const j = i * 3
        arr[j + 1] -= dt * recSeed[j + 2]
        if (arr[j + 1] < bottom) arr[j + 1] = 8.5
        // records spiral gently as they settle
        const a = recSeed[j] + time * 0.12
        const r = recSeed[j + 1]
        arr[j] = Math.cos(a) * r
        arr[j + 2] = Math.sin(a) * r
      }
      pos.needsUpdate = true
      rings.rotation.y = time * 0.07
    },
  }
}

/* ========================================================================== */
/* 05 — AI : a vector space. Points in a field, a lattice of relations, and an  */
/*      activation travelling prompt → retrieval → reasoning → response.        */
/* ========================================================================== */
function lattice(ctx: BuildCtx): District {
  const g = new THREE.Group()
  const { accent, fg, quality } = ctx

  // the embedding field
  const n = scaled(520, quality)
  const arr = new Float32Array(n * 3)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < n; i++) {
    // clustered rather than uniform — a vector space has structure
    const cluster = i % 5
    const ca = (cluster / 5) * Math.PI * 2
    const cx = Math.cos(ca) * 6
    const cz = Math.sin(ca) * 6
    const cy = (cluster - 2) * 2.4
    const x = cx + (Math.random() - 0.5) * 7
    const y = cy + (Math.random() - 0.5) * 7
    const z = cz + (Math.random() - 0.5) * 7
    arr[i * 3] = x
    arr[i * 3 + 1] = y
    arr[i * 3 + 2] = z
    if (i % 9 === 0) pts.push(new THREE.Vector3(x, y, z))
  }
  const fieldGeo = ctx.track(new THREE.BufferGeometry())
  fieldGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  const field = new THREE.Points(fieldGeo, pointMat(ctx, accent, 0.1, 0.75))
  g.add(field)

  // relations between nearby points
  const relPts: number[] = []
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (pts[i].distanceTo(pts[j]) < 5.4) {
        relPts.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z)
      }
    }
  }
  const relGeo = ctx.track(new THREE.BufferGeometry())
  relGeo.setAttribute('position', new THREE.Float32BufferAttribute(relPts, 3))
  g.add(new THREE.LineSegments(relGeo, lineMat(ctx, fg, 0.11)))

  // the reasoning path: four waypoints, one travelling activation
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-11, -5, 6),
    new THREE.Vector3(-3, 3, -3),
    new THREE.Vector3(5, -2, 4),
    new THREE.Vector3(11, 5, -5),
  ])
  const pathGeo = ctx.track(
    new THREE.BufferGeometry().setFromPoints(path.getPoints(64)),
  )
  const pathLine = new THREE.Line(pathGeo, lineMat(ctx, accent, 0.55))
  g.add(pathLine)

  const agentGeo = ctx.track(new THREE.IcosahedronGeometry(0.4, 0))
  const agent = new THREE.Mesh(
    agentGeo,
    ctx.track(
      new THREE.MeshBasicMaterial({
        color: accent.clone(),
        wireframe: true,
        transparent: true,
        opacity: 1,
      }),
    ),
  )
  g.add(agent)

  let head = 0
  const mats = fadeable(g)
  return {
    group: g,
    update(presence, time, dt) {
      applyPresence(mats, presence)
      head = (head + dt * 0.14) % 1
      agent.position.copy(path.getPointAt(head))
      agent.rotation.set(time * 0.6, time * 0.4, 0)
      field.rotation.y = time * 0.035
      g.rotation.x = Math.sin(time * 0.09) * 0.06
    },
  }
}

/* ========================================================================== */
/* 06 — CLOUD : distributed regions. Clusters of capacity in different places,  */
/*      joined by long arcs. Infrastructure as geography.                       */
/* ========================================================================== */
function regions(ctx: BuildCtx): District {
  const g = new THREE.Group()
  const { accent, fg, quality } = ctx

  const regionCount = quality.tier === 'low' ? 4 : 6
  const centres: THREE.Vector3[] = []
  for (let i = 0; i < regionCount; i++) {
    const a = (i / regionCount) * Math.PI * 2
    centres.push(
      new THREE.Vector3(Math.cos(a) * 13, ((i * 4) % 9) - 4, Math.sin(a) * 13 - 3),
    )
  }

  // each region: a ring platform plus a small stack of instances
  const platGeo = ctx.track(new THREE.TorusGeometry(3.1, 0.045, 6, 40))
  const plats = new THREE.InstancedMesh(platGeo, lineMat(ctx, accent, 0.55), regionCount)
  centres.forEach((c, i) => {
    TMP.position.copy(c)
    TMP.rotation.set(Math.PI / 2, 0, 0)
    TMP.scale.setScalar(1)
    TMP.updateMatrix()
    plats.setMatrixAt(i, TMP.matrix)
  })
  plats.instanceMatrix.needsUpdate = true
  g.add(plats)

  const unitGeo = ctx.track(new THREE.BoxGeometry(0.5, 0.5, 0.5))
  const perRegion = scaled(7, quality)
  const units = new THREE.InstancedMesh(
    unitGeo,
    ctx.track(
      new THREE.MeshBasicMaterial({
        color: accent.clone(),
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      }),
    ),
    regionCount * perRegion,
  )
  let k = 0
  centres.forEach((c) => {
    for (let u = 0; u < perRegion; u++) {
      const a = (u / perRegion) * Math.PI * 2
      TMP.position.set(c.x + Math.cos(a) * 1.7, c.y + 0.6 + (u % 3) * 0.7, c.z + Math.sin(a) * 1.7)
      TMP.rotation.set(0, a, 0)
      TMP.scale.setScalar(1)
      TMP.updateMatrix()
      units.setMatrixAt(k++, TMP.matrix)
    }
  })
  units.instanceMatrix.needsUpdate = true
  g.add(units)

  // deployment arcs between regions
  const arcPts: number[] = []
  for (let i = 0; i < regionCount; i++) {
    const a = centres[i]
    const b = centres[(i + 2) % regionCount]
    const curve = new THREE.CatmullRomCurve3([
      a,
      a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 7, 0)),
      b,
    ])
    const p = curve.getPoints(22)
    for (let s = 0; s < p.length - 1; s++) {
      arcPts.push(p[s].x, p[s].y, p[s].z, p[s + 1].x, p[s + 1].y, p[s + 1].z)
    }
  }
  const arcGeo = ctx.track(new THREE.BufferGeometry())
  arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(arcPts, 3))
  g.add(new THREE.LineSegments(arcGeo, lineMat(ctx, fg, 0.15)))

  const mats = fadeable(g)
  return {
    group: g,
    update(presence, time) {
      applyPresence(mats, presence)
      g.rotation.y = time * 0.045
      units.rotation.y = -time * 0.09
    },
  }
}

/* ========================================================================== */
/* 07 — PROJECTS : monoliths. One standing slab per shipped build.             */
/* ========================================================================== */
function monoliths(ctx: BuildCtx): District {
  const g = new THREE.Group()
  const { accent, fg } = ctx
  const count = 5

  const slabGeo = ctx.track(new THREE.BoxGeometry(3.4, 15, 0.5))
  const slabs = new THREE.InstancedMesh(slabGeo, faceMat(ctx, fg, 0.055), count)
  const edgeGeo = ctx.track(new THREE.EdgesGeometry(slabGeo))
  const edges = new THREE.InstancedMesh(edgeGeo, lineMat(ctx, accent, 0.55), count)
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 1.15 - Math.PI * 0.575
    TMP.position.set(Math.sin(a) * 15, ((i % 2) - 0.5) * 2.4, Math.cos(a) * 15 - 13)
    TMP.rotation.set(0, -a, (i % 2 ? 1 : -1) * 0.03)
    TMP.scale.set(1, 0.75 + (i % 3) * 0.16, 1)
    TMP.updateMatrix()
    slabs.setMatrixAt(i, TMP.matrix)
    edges.setMatrixAt(i, TMP.matrix)
  }
  slabs.instanceMatrix.needsUpdate = true
  edges.instanceMatrix.needsUpdate = true
  g.add(slabs, edges)

  const mats = fadeable(g)
  return {
    group: g,
    update(presence, time) {
      applyPresence(mats, presence)
      g.rotation.y = Math.sin(time * 0.06) * 0.09
      g.position.y = Math.sin(time * 0.22) * 0.4
    },
  }
}

/* ========================================================================== */
/* 08 — EXPERIENCE : an ascent. Two rails converging upward with rungs — the    */
/*      shape of getting further into systems over time.                        */
/* ========================================================================== */
function ascent(ctx: BuildCtx): District {
  const g = new THREE.Group()
  const { accent, fg, quality } = ctx

  const steps = scaled(26, quality)
  const rungGeo = ctx.track(new THREE.BoxGeometry(7, 0.09, 0.09))
  const rungs = new THREE.InstancedMesh(rungGeo, faceMat(ctx, accent, 0.55), steps)
  const railL: number[] = []
  const railR: number[] = []
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const y = -10 + t * 22
    const w = 1 - t * 0.55 // rails converge as the climb goes on
    const z = -t * 16
    TMP.position.set(0, y, z)
    TMP.rotation.set(0, 0, 0)
    TMP.scale.set(w, 1, 1)
    TMP.updateMatrix()
    rungs.setMatrixAt(i, TMP.matrix)
    railL.push(-3.5 * w, y, z)
    railR.push(3.5 * w, y, z)
  }
  rungs.instanceMatrix.needsUpdate = true
  g.add(rungs)

  for (const rail of [railL, railR]) {
    const geo = ctx.track(new THREE.BufferGeometry())
    geo.setAttribute('position', new THREE.Float32BufferAttribute(rail, 3))
    g.add(new THREE.Line(geo, lineMat(ctx, fg, 0.28)))
  }

  const mats = fadeable(g)
  return {
    group: g,
    update(presence, time) {
      applyPresence(mats, presence)
      g.rotation.y = Math.sin(time * 0.07) * 0.14
    },
  }
}

/* ========================================================================== */
/* 09 — CONTACT : convergence. Rings opening outward and particles drawing in   */
/*      to a single point — the world resolving to one place to arrive at.      */
/* ========================================================================== */
function convergence(ctx: BuildCtx): District {
  const g = new THREE.Group()
  const { accent, quality } = ctx

  const ringGeo = ctx.track(new THREE.TorusGeometry(4, 0.045, 6, 56))
  const rings = new THREE.InstancedMesh(ringGeo, lineMat(ctx, accent, 0.6), 5)
  g.add(rings)

  const n = scaled(300, quality)
  const arr = new Float32Array(n * 3)
  const seed = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const e = Math.acos(2 * Math.random() - 1)
    const r = 6 + Math.random() * 12
    seed[i * 3] = a
    seed[i * 3 + 1] = e
    seed[i * 3 + 2] = r
    arr[i * 3] = Math.sin(e) * Math.cos(a) * r
    arr[i * 3 + 1] = Math.cos(e) * r
    arr[i * 3 + 2] = Math.sin(e) * Math.sin(a) * r
  }
  const geo = ctx.track(new THREE.BufferGeometry())
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  const motes = new THREE.Points(geo, pointMat(ctx, accent, 0.12, 0.8))
  g.add(motes)

  const mats = fadeable(g)
  return {
    group: g,
    update(presence, time) {
      applyPresence(mats, presence)
      for (let i = 0; i < 5; i++) {
        const ph = (time * 0.16 + i / 5) % 1
        TMP.position.set(0, 0, -ph * 6)
        TMP.rotation.set(0, 0, time * 0.1 + i)
        TMP.scale.setScalar(0.3 + ph * 2.6)
        TMP.updateMatrix()
        rings.setMatrixAt(i, TMP.matrix)
      }
      rings.instanceMatrix.needsUpdate = true

      // motes breathe inward as presence rises — arrival, not orbit
      const pos = geo.attributes.position as THREE.BufferAttribute
      const a2 = pos.array as Float32Array
      const pull = 1 - presence * 0.45
      for (let i = 0; i < n; i++) {
        const j = i * 3
        const ang = seed[j] + time * 0.06
        const e = seed[j + 1]
        const r = seed[j + 2] * pull
        a2[j] = Math.sin(e) * Math.cos(ang) * r
        a2[j + 1] = Math.cos(e) * r
        a2[j + 2] = Math.sin(e) * Math.sin(ang) * r
      }
      pos.needsUpdate = true
    },
  }
}

const BUILDERS: Record<DistrictKind, (ctx: BuildCtx) => District> = {
  gateway,
  surfaces,
  pipelines,
  strata,
  lattice,
  regions,
  monoliths,
  ascent,
  convergence,
}

export function buildDistrict(kind: DistrictKind, ctx: BuildCtx): District {
  return BUILDERS[kind](ctx)
}
