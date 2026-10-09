'use client'

import * as THREE from 'three'
import { C } from './palette'

/**
 * The poster ink line: the same geometry, scaled up a touch and drawn back
 * faces only in flat ink. Seen from the front, only the rim that sticks out
 * past the shape survives — a thick, even outline with no post-processing.
 *
 * Render as a child of the mesh it outlines so it inherits every transform.
 */
const inkMaterial = new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide })

export function InkHull({
  geometry,
  scale = 1.07,
}: {
  geometry: THREE.BufferGeometry
  scale?: number
}) {
  return <mesh geometry={geometry} material={inkMaterial} scale={scale} raycast={() => null} />
}
