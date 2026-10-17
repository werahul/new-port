'use client'

/**
 * The space everything lives in.
 *
 *   sky    — a saturated daylight gradient that shifts hue as the visitor
 *            travels (violet → rose → azure → mint → orchid → sunset), with a
 *            low sun glowing ahead of the journey
 *   floor  — an endless blueprint grid, the developer's ground plane: minor
 *            lines every unit, major lines in the stage's accent, a pool of
 *            colour under the core, dissolving into the horizon
 *   haze   — fog in the horizon's colour, so distance melts into the sky
 *   studio — colourful Lightformers on a deep indigo, baked once into an
 *            environment map: what makes every glossy surface read as candy
 *            with real contrast rather than white-on-white
 */
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { FLOOR_Y } from './keyframes'
import { live } from './rig'

/** The live site's colours, as materials — plus two deeper notes for depth. */
export const PALETTE = {
  ink: '#16161F',
  cream: '#FFF6EA',
  yellow: '#FFD60A',
  pink: '#FF63A8',
  violet: '#8B6BFF',
  lilac: '#B69CFF',
  cobalt: '#4F7BFF',
  cyan: '#4DD9FF',
  emerald: '#3DDC97',
  coral: '#FF8A3D',
  grape: '#6C4CFF',
  hot: '#FF3D7F',
}

/** One stop of the journey's light. `live.sky` moves through them. */
interface Stop {
  top: string
  horizon: string
  glow: string
  floor: string
  accent: string
}
const SKY: Stop[] = [
  // 0 intro — violet over rose
  { top: '#7E5BFF', horizon: '#FFC4E1', glow: '#FFF0F8', floor: '#D3C2FF', accent: '#6C4CFF' },
  // 1 about — rose over peach
  { top: '#FF6FAE', horizon: '#FFD1B8', glow: '#FFF3D9', floor: '#FFC0DA', accent: '#FF3D7F' },
  // 2 capabilities — azure
  { top: '#3F7BFF', horizon: '#BFE4FF', glow: '#F4FBFF', floor: '#B4CCFF', accent: '#2F5BEA' },
  // 3 work — mint under teal
  { top: '#22B8A0', horizon: '#CFF8E6', glow: '#FFFAD8', floor: '#ABEBD2', accent: '#0F9E78' },
  // 4 approach — orchid
  { top: '#7A4DFF', horizon: '#F2C2FF', glow: '#FFE6F6', floor: '#D7BDFF', accent: '#8B3DFF' },
  // 5 contact — sunset
  { top: '#6A3FE0', horizon: '#FFAF7E', glow: '#FFE7A1', floor: '#FFB79A', accent: '#FF4F6A' },
]
type StopColors = Record<keyof Stop, THREE.Color>
const STOPS: StopColors[] = SKY.map(
  (s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, new THREE.Color(v)])) as StopColors,
)

/** Write the light at palette position `t` into `out`. */
export function skyAt(t: number, out: StopColors) {
  const i = Math.max(0, Math.min(STOPS.length - 2, Math.floor(t)))
  const f = Math.max(0, Math.min(1, t - i))
  const a = STOPS[i]
  const b = STOPS[i + 1]
  for (const k of Object.keys(out) as (keyof Stop)[]) out[k].copy(a[k]).lerp(b[k], f)
}

const FOG_DENSITY = 0.0145

/* ---- sky ----------------------------------------------------------------- */

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vDir = normalize(wp.xyz - cameraPosition);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  varying vec3 vDir;
  void main() {
    float y = vDir.y;
    // the colour starts low, so a level camera sees the sky, not a white band
    vec3 c = mix(uHorizon, uTop, smoothstep(0.0, 0.5, y));
    vec3 sunDir = normalize(vec3(0.15, 0.1, -1.0));
    float sun = max(dot(vDir, sunDir), 0.0);
    c = mix(c, uGlow, pow(sun, 8.0) * 0.5 + pow(sun, 90.0) * 0.45);
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`

/* ---- floor --------------------------------------------------------------- */

const floorVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const floorFragment = /* glsl */ `
  uniform vec3 uFloor;
  uniform vec3 uAccent;
  uniform vec3 uHorizon;
  uniform vec3 uCore;
  uniform float uDensity;
  uniform float uTime;
  varying vec3 vWorld;

  float gridLine(vec2 p, float cell, float width) {
    vec2 q = p / cell;
    vec2 d = abs(fract(q - 0.5) - 0.5) / fwidth(q);
    return 1.0 - clamp(min(d.x, d.y) / width, 0.0, 1.0);
  }

  void main() {
    vec2 p = vWorld.xz;
    float dist = distance(vWorld, cameraPosition);
    vec3 c = uFloor;

    // a pool of the accent under the core, breathing slowly
    vec2 toCore = p - uCore.xz;
    float pool = exp(-dot(toCore, toCore) * 0.07) * (0.85 + 0.15 * sin(uTime * 0.8));
    c = mix(c, uAccent, pool * 0.35);

    // minor lines fade early so the far floor never shimmers
    float minor = gridLine(p, 1.0, 1.0) * (1.0 - smoothstep(14.0, 46.0, dist));
    float major = gridLine(p, 5.0, 1.4);
    c = mix(c, vec3(0.09, 0.09, 0.14), minor * 0.16);
    c = mix(c, uAccent, major * 0.5);

    // a slow pulse travelling down the journey's axis, like a signal on a trace
    float trace = 1.0 - clamp(abs(p.x) / (fwidth(p.x) * 2.2), 0.0, 1.0);
    float pulse = smoothstep(0.92, 1.0, sin(p.y * 0.18 + uTime * 1.6));
    c = mix(c, vec3(1.0), trace * pulse * 0.8);

    float fog = 1.0 - exp(-pow(dist * uDensity, 2.0));
    c = mix(c, uHorizon, fog);
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`

function Atmosphere() {
  const sky = useRef<THREE.Mesh>(null)
  const floor = useRef<THREE.Mesh>(null)
  const camera = useThree((s) => s.camera)
  const scene = useThree((s) => s.scene)

  const res = useMemo(() => {
    const now: StopColors = {
      top: new THREE.Color(),
      horizon: new THREE.Color(),
      glow: new THREE.Color(),
      floor: new THREE.Color(),
      accent: new THREE.Color(),
    }
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uTop: { value: now.top }, uHorizon: { value: now.horizon }, uGlow: { value: now.glow } },
    })
    const floorMat = new THREE.ShaderMaterial({
      vertexShader: floorVertex,
      fragmentShader: floorFragment,
      fog: false,
      extensions: { derivatives: true } as THREE.ShaderMaterial['extensions'],
      uniforms: {
        uFloor: { value: now.floor },
        uAccent: { value: now.accent },
        uHorizon: { value: now.horizon },
        uCore: { value: live.core },
        uDensity: { value: FOG_DENSITY },
        uTime: { value: 0 },
      },
    })
    const floorGeo = new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2)
    return { now, skyMat, floorMat, floorGeo }
  }, [])

  useEffect(
    () => () => {
      res.skyMat.dispose()
      res.floorMat.dispose()
      res.floorGeo.dispose()
    },
    [res],
  )

  useFrame(() => {
    skyAt(live.sky, res.now)
    sky.current?.position.copy(camera.position)
    // the floor follows the visitor; its grid is drawn in world space, so it doesn't slide
    floor.current?.position.set(camera.position.x, FLOOR_Y, camera.position.z)
    res.floorMat.uniforms.uTime.value = live.time
    if (scene.fog) (scene.fog as THREE.FogExp2).color.copy(res.now.horizon)
  })

  return (
    <>
      <mesh ref={sky} material={res.skyMat} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[600, 32, 16]} />
      </mesh>
      <mesh ref={floor} geometry={res.floorGeo} material={res.floorMat} frustumCulled={false} />
    </>
  )
}

function Lights() {
  const key = useRef<THREE.DirectionalLight>(null)
  const rim = useRef<THREE.DirectionalLight>(null)
  const camera = useThree((s) => s.camera)

  useFrame(() => {
    const p = camera.position
    // both lights travel with the visitor so every exhibit is lit alike
    if (key.current) {
      key.current.position.set(p.x + 6, p.y + 9, p.z + 6)
      key.current.target.position.set(p.x, p.y - 1, p.z - 10)
      key.current.target.updateMatrixWorld()
    }
    // a coloured light from beyond the subjects: candy edges, never flat discs
    if (rim.current) {
      rim.current.position.set(p.x - 6, p.y + 5, p.z - 22)
      rim.current.target.position.set(p.x, p.y, p.z - 4)
      rim.current.target.updateMatrixWorld()
    }
  })

  return (
    <>
      <hemisphereLight args={['#E6DAFF', '#FFC3DC', 0.75]} />
      <directionalLight ref={key} intensity={2.1} color="#FFFFFF" />
      <directionalLight ref={rim} intensity={1.6} color="#FF8FD0" />
    </>
  )
}

export function World({ lowTier }: { lowTier: boolean }) {
  return (
    <>
      <fogExp2 attach="fog" args={['#FFC4E1', FOG_DENSITY]} />
      <Atmosphere />
      <Lights />

      {/* Reflections only — a colourful studio on deep indigo, baked once. */}
      <Environment resolution={lowTier ? 64 : 256} frames={1}>
        <color attach="background" args={['#3B2F86']} />
        <Lightformer form="rect" intensity={3.2} color="#FFFFFF" position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={3} color={PALETTE.pink} position={[-8, 2, 2]} rotation-y={Math.PI / 2} scale={[4, 8, 1]} />
        <Lightformer form="rect" intensity={3} color={PALETTE.cyan} position={[8, 2, 2]} rotation-y={-Math.PI / 2} scale={[4, 8, 1]} />
        <Lightformer form="ring" intensity={2.6} color={PALETTE.yellow} position={[0, 2, -9]} scale={5} />
        <Lightformer form="rect" intensity={2} color={PALETTE.coral} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[14, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color={PALETTE.lilac} position={[0, 2, 10]} rotation-y={Math.PI} scale={[10, 4, 1]} />
      </Environment>
    </>
  )
}
