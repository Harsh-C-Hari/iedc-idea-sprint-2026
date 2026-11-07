/**
 * SparkScene.jsx — lazy-loaded React Three Fiber scene (plan section C, T19/follow-up #4).
 *
 * This module is NEVER imported directly — only via React.lazy() in IdeaSpark.jsx.
 * That keeps the entire three.js + R3F chunk out of the initial bundle.
 *
 * Scene objects:
 *   Desktop (5 objects): orange cube, lime torus, cream sphere, dark disc, asterisk
 *   Mobile  (3 objects): orange cube, lime torus, cream sphere
 *   (plan section C: ~12 meshes desktop / 6 mobile — asterisk has 3 sub-meshes)
 *
 * Performance rules:
 *   • frameloop="demand" — R3F does NOT render on its own; only renders when
 *     invalidate() is called. The useFrame loops call invalidate() while pieces
 *     are moving and stop once they settle (lerp threshold). Result: zero GPU
 *     cost when the scene is idle or off-screen.
 *   • dpr capped at [1, 1.5]
 *   • No env-map — ambient + two directional lights only
 *   • paused prop: when true (section off-screen) useFrame returns early
 *
 * Generate: incrementing promptSeed scatters pieces to new random positions
 * via target refs; lerp in useFrame eases them smoothly.
 */
import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { isMobile } from './webgl.js'

// ── Colour palette (matches CSS tokens) ────────────────────────────────────
const C = {
  orange:    '#F05A28',
  lime:      '#D9F36A',
  cream:     '#F2EBDD',
  nearBlack: '#171717',
}

// ── Lerp epsilon — stop updating once pieces are close enough ────────────────
const EPS = 0.001

// ── Shared invalidate ref (set from SceneObjects, used by all piece hooks) ──
const sharedInvalidate = { fn: null }

function useLerpFrame(ref, targetPos, speed) {
  useFrame((_, delta) => {
    if (!ref.current) return
    const dist = ref.current.position.distanceTo(targetPos.current)
    if (dist < EPS) return // settled — no invalidate, R3F stays idle
    ref.current.position.lerp(targetPos.current, Math.min(delta * speed, 1))
    sharedInvalidate.fn?.() // request next frame only while moving
  })
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function OrangeCube({ position, targetPos }) {
  const ref = useRef()
  useLerpFrame(ref, targetPos, 2.5)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.3 })
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshLambertMaterial color={C.orange} />
    </mesh>
  )
}

function LimeTorus({ position, targetPos }) {
  const ref = useRef()
  useLerpFrame(ref, targetPos, 2.0)
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * 0.4
    ref.current.rotation.z += delta * 0.2
  })
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.5, 0.18, 12, 48]} />
      <meshLambertMaterial color={C.lime} />
    </mesh>
  )
}

function CreamSphere({ position, targetPos }) {
  const ref = useRef()
  useLerpFrame(ref, targetPos, 1.8)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.25 })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.45, 20, 20]} />
      <meshLambertMaterial color={C.cream} />
    </mesh>
  )
}

function DarkDisc({ position, targetPos }) {
  const ref = useRef()
  useLerpFrame(ref, targetPos, 2.2)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * 0.35 })
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.6, 0.6, 0.08, 28]} />
      <meshStandardMaterial color={C.nearBlack} metalness={0.6} roughness={0.2} />
    </mesh>
  )
}

function Asterisk({ position, targetPos }) {
  const ref = useRef()
  useLerpFrame(ref, targetPos, 2.1)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * 0.5 })
  return (
    <group ref={ref} position={position}>
      <mesh><boxGeometry args={[0.08, 0.9, 0.08]} /><meshLambertMaterial color={C.orange} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 3]}><boxGeometry args={[0.08, 0.9, 0.08]} /><meshLambertMaterial color={C.orange} /></mesh>
      <mesh rotation={[0, 0, -Math.PI / 3]}><boxGeometry args={[0.08, 0.9, 0.08]} /><meshLambertMaterial color={C.orange} /></mesh>
    </group>
  )
}

// ── Random target ────────────────────────────────────────────────────────────
function rp(range = 1.4) {
  return new THREE.Vector3(
    (Math.random() - 0.5) * range * 2,
    (Math.random() - 0.5) * range * 2,
    (Math.random() - 0.5) * 0.6,
  )
}

// ── Scene objects — R3F context required ────────────────────────────────────
function SceneObjects({ promptSeed, mobile }) {
  const tOrange  = useRef(new THREE.Vector3(-0.9,  0.7, 0))
  const tLime    = useRef(new THREE.Vector3( 0.9,  0.5, 0))
  const tCream   = useRef(new THREE.Vector3(-0.6, -0.7, 0))
  const tDisc    = useRef(new THREE.Vector3( 0.7, -0.6, 0))
  const tAsterix = useRef(new THREE.Vector3( 0.0,  0.0, 0.1))
  const { invalidate } = useThree()

  // Wire invalidate so piece hooks can call it
  useEffect(() => { sharedInvalidate.fn = invalidate }, [invalidate])

  // Generate pressed: scatter pieces to new positions, kick a render
  useEffect(() => {
    if (promptSeed === 0) return
    tOrange.current  = rp()
    tLime.current    = rp()
    tCream.current   = rp()
    if (!mobile) {
      tDisc.current    = rp()
      tAsterix.current = rp(0.5)
    }
    invalidate()
  }, [promptSeed, invalidate, mobile])

  return (
    <>
      <OrangeCube  position={[-0.9,  0.7, 0]} targetPos={tOrange}  />
      <LimeTorus   position={[ 0.9,  0.5, 0]} targetPos={tLime}    />
      <CreamSphere position={[-0.6, -0.7, 0]} targetPos={tCream}   />
      {/* Desktop only: disc + asterisk */}
      {!mobile && <DarkDisc   position={[ 0.7, -0.6, 0]} targetPos={tDisc}    />}
      {!mobile && <Asterisk   position={[ 0.0,  0.0, 0]} targetPos={tAsterix} />}
    </>
  )
}

// ── Export ───────────────────────────────────────────────────────────────────
/**
 * @param {object} props
 * @param {number} props.promptSeed — increments each Generate press; scatters pieces
 */
export default function SparkScene({ promptSeed = 0 }) {
  const mobile = isMobile()
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: !mobile, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]}    intensity={1.0} />
      <directionalLight position={[-2, -3, -1]}  intensity={0.35} />
      <SceneObjects promptSeed={promptSeed} mobile={mobile} />
    </Canvas>
  )
}
