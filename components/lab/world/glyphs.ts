/**
 * Code punctuation as solid objects — </>, { }, ( ), [ ] — for the floating
 * field. Each glyph is drawn with a round "pen": straight strokes are
 * cylinders with ball joints, curved ones are tubes with ball caps, merged
 * into one geometry so a glyph is a single instanced draw.
 *
 * Built in a unit box roughly 2 wide and 1.1 tall, centred on the origin.
 */
import * as THREE from 'three'
import { mergeBufferGeometries } from 'three-stdlib'

type P = [number, number]

const UP = new THREE.Vector3(0, 1, 0)

function ball(at: THREE.Vector3, r: number, detail: number) {
  return new THREE.SphereGeometry(r, detail, Math.max(6, detail >> 1)).translate(at.x, at.y, at.z)
}

/** A polyline drawn with a round pen. */
function straight(points: P[], r: number, detail: number) {
  const v = points.map(([x, y]) => new THREE.Vector3(x, y, 0))
  const parts: THREE.BufferGeometry[] = v.map((p) => ball(p, r, detail))
  for (let i = 0; i < v.length - 1; i++) {
    const a = v[i]
    const b = v[i + 1]
    const dir = b.clone().sub(a)
    const len = dir.length()
    const cyl = new THREE.CylinderGeometry(r, r, len, detail, 1, true)
    cyl.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()))
    const mid = a.clone().add(b).multiplyScalar(0.5)
    cyl.translate(mid.x, mid.y, mid.z)
    parts.push(cyl)
  }
  return parts
}

/** A smooth curve through the points, drawn with a round pen. */
function curved(points: P[], r: number, detail: number) {
  const v = points.map(([x, y]) => new THREE.Vector3(x, y, 0))
  const curve = new THREE.CatmullRomCurve3(v, false, 'centripetal')
  return [
    new THREE.TubeGeometry(curve, detail * 3, r, detail, false),
    ball(v[0], r, detail),
    ball(v[v.length - 1], r, detail),
  ]
}

const mirror = (pts: P[]): P[] => pts.map(([x, y]) => [-x, y])

function merge(parts: THREE.BufferGeometry[]) {
  // every part is indexed with position / normal / uv, so they merge cleanly
  const g = mergeBufferGeometries(parts) ?? new THREE.BufferGeometry()
  parts.forEach((p) => p.dispose())
  g.computeBoundingSphere()
  return g
}

export function makeGlyphs(lowTier: boolean) {
  const d = lowTier ? 8 : 14
  const r = 0.085

  const chevron: P[] = [
    [-0.42, 0.42],
    [-0.88, 0],
    [-0.42, -0.42],
  ]
  const slash: P[] = [
    [0.17, 0.52],
    [-0.17, -0.52],
  ]
  const tag = merge([...straight(chevron, r, d), ...straight(slash, r, d), ...straight(mirror(chevron), r, d)])

  const braceL: P[] = [
    [-0.18, 0.56],
    [-0.36, 0.5],
    [-0.4, 0.2],
    [-0.44, 0.05],
    [-0.62, 0],
    [-0.44, -0.05],
    [-0.4, -0.2],
    [-0.36, -0.5],
    [-0.18, -0.56],
  ]
  const braces = merge([...curved(braceL, r, d), ...curved(mirror(braceL), r, d)])

  const arc = (cx: number, from: number, to: number): P[] =>
    Array.from({ length: 7 }, (_, i) => {
      const a = from + ((to - from) * i) / 6
      return [cx + Math.cos(a) * 0.62, Math.sin(a) * 0.62]
    })
  const parens = merge([
    ...curved(arc(0.12, Math.PI * 0.66, Math.PI * 1.34), r, d),
    ...curved(arc(-0.12, Math.PI * 0.34, -Math.PI * 0.34), r, d),
  ])

  const bracketL: P[] = [
    [-0.2, 0.56],
    [-0.5, 0.56],
    [-0.5, -0.56],
    [-0.2, -0.56],
  ]
  const brackets = merge([...straight(bracketL, r, d), ...straight(mirror(bracketL), r, d)])

  return [tag, braces, parens, brackets]
}
