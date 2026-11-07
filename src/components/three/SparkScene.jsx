/**
 * SparkScene.jsx — lazy-loaded React Three Fiber scene (plan section C, T19).
 *
 * This module is NEVER imported directly — only via React.lazy() in IdeaSpark.jsx.
 * That keeps the entire three.js + R3F chunk out of the initial bundle.
 *
 * Scene objects (plan section C):
 *   • Orange semi-gloss rounded cube  (BoxGeometry)
 *   • Matte lime torus
 *   • Cream sphere
 *   • Dark reflective disc (flat CylinderGeometry)
 *   • Asterisk from 3 crossed rounded boxes (3 × BoxGeometry)
 *
 * Performance rules (plan section C):
 *   • frameloop="demand" — only renders when props change or user interacts
 *   • dpr capped at [1, 1.5]
 *   • No env-map download — ambient + two directional lights only
 *   • Paused when off-screen (IntersectionObserver in parent)
 *
 * Pressing Generate (from parent) updates `promptSeed` prop →
 * triggers a gentle position ease on the pieces via useRef + useFrame lerp.
 */
import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  orange:    '#F05A28',
  lime:      '#D9F36A',
  cream:     '#F2EBDD',
  nearBlack: '#171717',
}

// ── Individual pieces ────────────────────────────────────────────────────────

function OrangeCube({ position, targetPos }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.position.lerp(targetPos.current, Math.min(delta * 2.5, 1))
    ref.current.rotation.y += delta * 0.3
    ref.current.rotation.x += delta * 0.15
  })
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshLambertMaterial color={C.orange} />
    </mesh>
  )
}

function LimeTorus({ position, targetPos }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.position.lerp(targetPos.current, Math.min(delta * 2, 1))
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
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.position.lerp(targetPos.current, Math.min(delta * 1.8, 1))
    ref.current.rotation.y += delta * 0.25
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.45, 24, 24]} />
      <meshLambertMaterial color={C.cream} />
    </mesh>
  )
}

function DarkDisc({ position, targetPos }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.position.lerp(targetPos.current, Math.min(delta * 2.2, 1))
    ref.current.rotation.z += delta * 0.35
  })
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.6, 0.6, 0.08, 36]} />
      <meshStandardMaterial color={C.nearBlack} metalness={0.6} roughness={0.2} />
    </mesh>
  )
}

function Asterisk({ position, targetPos }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.position.lerp(targetPos.current, Math.min(delta * 2.1, 1))
    ref.current.rotation.z += delta * 0.5
  })
  return (
    <group ref={ref} position={position}>
      <mesh>
        <boxGeometry args={[0.08, 0.9, 0.08]} />
        <meshLambertMaterial color={C.orange} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 3]}>
        <boxGeometry args={[0.08, 0.9, 0.08]} />
        <meshLambertMaterial color={C.orange} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 3]}>
        <boxGeometry args={[0.08, 0.9, 0.08]} />
        <meshLambertMaterial color={C.orange} />
      </mesh>
    </group>
  )
}

// ── Random target position ───────────────────────────────────────────────────
function rp(range = 1.4) {
  return new THREE.Vector3(
    (Math.random() - 0.5) * range * 2,
    (Math.random() - 0.5) * range * 2,
    (Math.random() - 0.5) * 0.6,
  )
}

// ── Scene objects — needs R3F context ───────────────────────────────────────
function SceneObjects({ promptSeed }) {
  const tOrange   = useRef(new THREE.Vector3(-0.9,  0.7, 0))
  const tLime     = useRef(new THREE.Vector3( 0.9,  0.5, 0))
  const tCream    = useRef(new THREE.Vector3(-0.6, -0.7, 0))
  const tDisc     = useRef(new THREE.Vector3( 0.7, -0.6, 0))
  const tAsterix  = useRef(new THREE.Vector3( 0.0,  0.0, 0.1))
  const { invalidate } = useThree()

  useEffect(() => {
    if (promptSeed === 0) return // skip initial position
    tOrange.current  = rp()
    tLime.current    = rp()
    tCream.current   = rp()
    tDisc.current    = rp()
    tAsterix.current = rp(0.5)
    invalidate()
  }, [promptSeed, invalidate])

  return (
    <>
      <OrangeCube  position={[-0.9,  0.7, 0]} targetPos={tOrange}  />
      <LimeTorus   position={[ 0.9,  0.5, 0]} targetPos={tLime}    />
      <CreamSphere position={[-0.6, -0.7, 0]} targetPos={tCream}   />
      <DarkDisc    position={[ 0.7, -0.6, 0]} targetPos={tDisc}    />
      <Asterisk    position={[ 0.0,  0.0, 0]} targetPos={tAsterix} />
    </>
  )
}

// ── Export ───────────────────────────────────────────────────────────────────
export default function SparkScene({ promptSeed = 0 }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]}   intensity={1.0} />
      <directionalLight position={[-2, -3, -1]} intensity={0.35} />
      <SceneObjects promptSeed={promptSeed} />
    </Canvas>
  )
}
