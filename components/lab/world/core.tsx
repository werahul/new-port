'use client'

/**
 * The core: a living pearl with three glossy moons. It is the visitor's guide
 * — it waits beside the headline, swells and churns in "About", becomes the
 * sun the capability planets orbit, circles the Twinkle portfolio exhibit,
 * and sets on the horizon at the end.
 *
 * One dense sphere, displaced on the GPU by 3D noise patched into the
 * physical material's vertex shader. Normals are rebuilt from two nearby
 * displaced points, so the iridescent clearcoat reflects the real surface.
 */
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { PALETTE } from './environment'
import { live } from './rig'
import { makeGlowTexture } from './textures'
import { world } from './world-state'

// Ashima / Stefan Gustavson 3D simplex noise (MIT).
const NOISE = /* glsl */ `
  vec3 m289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 m289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 perm(vec4 x){return m289(((x*34.0)+1.0)*x);}
  vec4 tis(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
    i=m289(i);
    vec4 p=perm(perm(perm(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`

const HEAD = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  ${NOISE}
  vec3 labShape(vec3 dir) {
    // two broad, slow octaves: a liquid swell, never a crumpled surface
    float n = snoise(dir * 0.9 + vec3(0.0, uTime * 0.16, 0.0)) * 0.8
            + snoise(dir * 1.7 - vec3(uTime * 0.12)) * 0.2;
    return dir * (1.0 + n * uAmp);
  }
`

const NORMAL = /* glsl */ `
  vec3 labDir = normalize(position);
  vec3 labT = normalize(cross(labDir, abs(labDir.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  vec3 labB = cross(labDir, labT);
  vec3 labP = labShape(labDir);
  vec3 labPT = labShape(normalize(labDir + labT * 0.01));
  vec3 labPB = labShape(normalize(labDir + labB * 0.01));
  vec3 objectNormal = normalize(cross(labPT - labP, labPB - labP));
  #ifdef USE_TANGENT
  vec3 objectTangent = vec3(tangent.xyz);
  #endif
`

type Uniforms = { uTime: { value: number }; uAmp: { value: number } }

function makePearl(lowTier: boolean, uniforms: Uniforms) {
  const m = lowTier
    ? new THREE.MeshStandardMaterial({ color: '#F1EAFF', roughness: 0.12, metalness: 0.2, envMapIntensity: 1.6 })
    : new THREE.MeshPhysicalMaterial({
        color: '#F3EDFF',
        roughness: 0.07,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        iridescence: 1,
        iridescenceIOR: 1.35,
        iridescenceThicknessRange: [120, 900],
        envMapIntensity: 1.7,
      })
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = HEAD + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', NORMAL)
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = labP;')
  }
  m.customProgramCacheKey = () => `lab-pearl-${lowTier}`
  return m
}

const MOONS = [
  { color: PALETTE.yellow, r: 0.2, dist: 1.85, speed: 0.55, tilt: 0.35, phase: 0 },
  { color: PALETTE.pink, r: 0.14, dist: 2.25, speed: -0.4, tilt: -0.5, phase: 2.1 },
  { color: PALETTE.cobalt, r: 0.11, dist: 1.6, speed: 0.8, tilt: 1.1, phase: 4.2 },
]

export function Core({ lowTier }: { lowTier: boolean }) {
  const group = useRef<THREE.Group>(null)
  const pearl = useRef<THREE.Mesh>(null)
  const moons = useRef<(THREE.Mesh | null)[]>([])
  const halo = useRef<THREE.Sprite>(null)

  const res = useMemo(() => {
    const uniforms: Uniforms = { uTime: { value: 0 }, uAmp: { value: 0.15 } }
    const geometry = new THREE.IcosahedronGeometry(1, lowTier ? 24 : 48)
    const material = makePearl(lowTier, uniforms)
    const moonGeo = new THREE.SphereGeometry(1, 32, 32)
    const moonMats = MOONS.map(
      (m) => new THREE.MeshPhysicalMaterial({ color: m.color, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 }),
    )
    const haloTex = makeGlowTexture('rgba(190,160,255,1)', 'rgba(255,140,200,0)')
    const haloMat = new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, opacity: 0.5, fog: false })
    return { uniforms, geometry, material, moonGeo, moonMats, haloTex, haloMat }
  }, [lowTier])

  useEffect(
    () => () => {
      res.geometry.dispose()
      res.material.dispose()
      res.moonGeo.dispose()
      res.moonMats.forEach((m) => m.dispose())
      res.haloTex.dispose()
      res.haloMat.dispose()
    },
    [res],
  )

  const tilt = useRef({ x: 0, y: 0 })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 10)
    const g = group.current
    if (!g) return
    g.position.copy(live.core)
    g.scale.setScalar(live.coreScale)
    res.uniforms.uTime.value = live.time
    res.uniforms.uAmp.value = 0.06 + live.morph * 0.12

    const k = 1 - Math.exp(-2 * dt)
    tilt.current.x += (world.pointer.y * 0.3 - tilt.current.x) * k
    tilt.current.y += (world.pointer.x * 0.45 - tilt.current.y) * k
    if (pearl.current) {
      pearl.current.rotation.y += dt * 0.15
      pearl.current.rotation.x = 0.2 + tilt.current.x
      pearl.current.rotation.z = tilt.current.y * 0.3
    }

    MOONS.forEach((m, i) => {
      const mesh = moons.current[i]
      if (!mesh) return
      const a = live.time * m.speed + m.phase
      mesh.position.set(Math.cos(a) * m.dist, Math.sin(a) * m.dist * Math.sin(m.tilt), Math.sin(a) * m.dist * Math.cos(m.tilt))
    })
    if (halo.current) halo.current.scale.setScalar(5.2 + Math.sin(live.time * 0.8) * 0.15)
  })

  return (
    <group ref={group}>
      <sprite ref={halo} material={res.haloMat} renderOrder={-0.5} />
      <mesh ref={pearl} geometry={res.geometry} material={res.material} />
      {MOONS.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => {
            moons.current[i] = el
          }}
          geometry={res.moonGeo}
          material={res.moonMats[i]}
          scale={m.r}
        />
      ))}
    </group>
  )
}
