/**
 * SparkScene.jsx — lazy-loaded React Three Fiber scene (Phase 1.6 fix 3).
 *
 * Performance & Animation:
 *   • frameloop="always" while visible; "never" when paused/off-screen (0% GPU/CPU)
 *   • frameloop="demand" under prefers-reduced-motion (single static frame)
 *   • Continuous infinite motion: each piece has a target anchor + perpetual sine
 *     idle float on y, x/z drift, and continuous rotation that never freezes.
 *   • "Generate" smoothly eases anchors to new positions without interrupting idle motion.
 *   • Objects strictly contained inside canvas bounds.
 *   • Brightened 3-point lighting to keep materials crisp and vibrant (no muddy tones).
 */
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isMobile } from './webgl.js'

// ── Palette tokens ───────────────────────────────────────────────────────────
const C = {
  orange:    '#F05A28',
  lime:      '#D9F36A',
  cream:     '#F2EBDD',
  nearBlack: '#262626', // slightly lifted from #171717 so specular highlights pop
}

// ── Overlap-aware random scatter ─────────────────────────────────────────────
// Each piece has a "visual radius" (how much screen space it really covers while
// spinning: thin pieces like the disc/asterisk need less than the cube).
// Generate still picks RANDOM positions, but we draw many candidate layouts and
// keep the first whose closest pair has a clear gap; if none does, we keep the
// layout with the biggest gap. Pieces also stay fully inside the square canvas.
const VISUAL_RADIUS = { orange: 0.52, lime: 0.50, cream: 0.40, disc: 0.38, asterisk: 0.34 }
const Z_RANGE       = { orange: 0.10, lime: 0.10, cream: 0.10, disc: 0.10, asterisk: 0.10 }
const HALF_EXTENT   = 1.5   // safe half-size of the visible area at z≈0 (canvas is square, true value ≈1.57)
const EDGE_PAD      = 0.12  // room for the idle float so pieces never touch the canvas edge
const TARGET_GAP    = 0.10  // clear space we aim for between any two pieces
const MAX_TRIES     = 1200

function scatterLayout(names) {
  let best = null
  let bestGap = -Infinity
  for (let k = 0; k < MAX_TRIES; k++) {
    const layout = {}
    for (const n of names) {
      const lim = HALF_EXTENT - VISUAL_RADIUS[n] - EDGE_PAD
      layout[n] = new THREE.Vector3(
        (Math.random() * 2 - 1) * lim,
        (Math.random() * 2 - 1) * lim,
        (Math.random() * 2 - 1) * Z_RANGE[n]
      )
    }
    let gap = Infinity
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = names[i], b = names[j]
        const d =
          Math.hypot(layout[a].x - layout[b].x, layout[a].y - layout[b].y) -
          (VISUAL_RADIUS[a] + VISUAL_RADIUS[b])
        if (d < gap) gap = d
      }
    }
    if (gap > bestGap) { bestGap = gap; best = layout }
    if (gap >= TARGET_GAP) break
  }
  return best
}

// ── Reusable piece component with anchor lerp + continuous idle float ────────
function FloatingPiece({
  initialPos,
  targetAnchor,
  freq = 1.0,
  phase = 0,
  ampY = 0.10,
  ampX = 0.05,
  ampZ = 0.04,
  rotSpeed = { x: 0.2, y: 0.3, z: 0.1 },
  children,
}) {
  const meshRef = useRef(null)
  const currentAnchor = useRef(new THREE.Vector3(...initialPos))

  useFrame((state, delta) => {
    if (!meshRef.current) return
    // Smoothly glide current anchor towards target anchor (eased on Generate)
    currentAnchor.current.lerp(targetAnchor.current, Math.min(delta * 2.2, 1))

    // Continuous perpetual idle motion (never stops)
    const t = state.clock.elapsedTime
    const x = currentAnchor.current.x + Math.sin(t * (freq * 0.75) + phase) * ampX
    const y = currentAnchor.current.y + Math.sin(t * freq + phase) * ampY
    const z = currentAnchor.current.z + Math.cos(t * (freq * 0.6) + phase) * ampZ

    meshRef.current.position.set(x, y, z)

    // Continuous rotation
    meshRef.current.rotation.x += rotSpeed.x * delta
    meshRef.current.rotation.y += rotSpeed.y * delta
    meshRef.current.rotation.z += rotSpeed.z * delta
  })

  return (
    <group ref={meshRef} position={initialPos}>
      {children}
    </group>
  )
}

// ── Scene pieces ─────────────────────────────────────────────────────────────

function OrangeCube({ targetAnchor }) {
  return (
    <FloatingPiece
      initialPos={[-0.65, 0.55, 0]}
      targetAnchor={targetAnchor}
      freq={1.1}
      phase={0.2}
      ampY={0.09}
      ampX={0.04}
      ampZ={0.03}
      rotSpeed={{ x: 0.25, y: 0.35, z: 0.15 }}
    >
      <mesh>
        <boxGeometry args={[0.75, 0.75, 0.75]} />
        <meshStandardMaterial
          color={C.orange}
          roughness={0.28}
          metalness={0.08}
        />
      </mesh>
    </FloatingPiece>
  )
}

function LimeTorus({ targetAnchor }) {
  return (
    <FloatingPiece
      initialPos={[0.65, 0.45, 0]}
      targetAnchor={targetAnchor}
      freq={0.95}
      phase={1.8}
      ampY={0.10}
      ampX={0.05}
      ampZ={0.04}
      rotSpeed={{ x: 0.35, y: 0.20, z: 0.30 }}
    >
      <mesh>
        <torusGeometry args={[0.42, 0.15, 16, 48]} />
        <meshStandardMaterial
          color={C.lime}
          roughness={0.24}
          metalness={0.08}
        />
      </mesh>
    </FloatingPiece>
  )
}

function CreamSphere({ targetAnchor }) {
  return (
    <FloatingPiece
      initialPos={[-0.55, -0.5, 0]}
      targetAnchor={targetAnchor}
      freq={1.05}
      phase={3.4}
      ampY={0.08}
      ampX={0.05}
      ampZ={0.03}
      rotSpeed={{ x: 0.15, y: 0.25, z: 0.10 }}
    >
      <mesh>
        <sphereGeometry args={[0.4, 28, 28]} />
        <meshStandardMaterial
          color={C.cream}
          roughness={0.32}
          metalness={0.05}
        />
      </mesh>
    </FloatingPiece>
  )
}

function DarkDisc({ targetAnchor }) {
  return (
    <FloatingPiece
      initialPos={[0.55, -0.45, 0]}
      targetAnchor={targetAnchor}
      freq={1.2}
      phase={4.8}
      ampY={0.08}
      ampX={0.04}
      ampZ={0.05}
      rotSpeed={{ x: 0.2, y: 0.15, z: 0.4 }}
    >
      <mesh>
        <cylinderGeometry args={[0.48, 0.48, 0.1, 32]} />
        <meshStandardMaterial
          color={C.nearBlack}
          roughness={0.22}
          metalness={0.35}
        />
      </mesh>
    </FloatingPiece>
  )
}

function Asterisk({ targetAnchor }) {
  return (
    <FloatingPiece
      initialPos={[0.0, 0.05, 0.1]}
      targetAnchor={targetAnchor}
      freq={1.35}
      phase={2.2}
      ampY={0.06}
      ampX={0.04}
      ampZ={0.03}
      rotSpeed={{ x: 0.12, y: 0.18, z: 0.5 }}
    >
      <group>
        <mesh>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color={C.orange} roughness={0.25} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 3]}>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color={C.orange} roughness={0.25} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 3]}>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color={C.orange} roughness={0.25} />
        </mesh>
      </group>
    </FloatingPiece>
  )
}

// ── Scene composition ────────────────────────────────────────────────────────
function SceneObjects({ promptSeed, mobile }) {
  const tOrange   = useRef(new THREE.Vector3(-0.65,  0.55, 0))
  const tLime     = useRef(new THREE.Vector3( 0.65,  0.45, 0))
  const tCream    = useRef(new THREE.Vector3(-0.55, -0.50, 0))
  const tDisc     = useRef(new THREE.Vector3( 0.55, -0.45, 0))
  const tAsterisk = useRef(new THREE.Vector3( 0.0,   0.05, 0.1))

  // Scatter anchors when promptSeed increments (random, but overlap-aware)
  useEffect(() => {
    if (promptSeed === 0) return
    const names = mobile
      ? ['orange', 'lime', 'cream']
      : ['orange', 'lime', 'cream', 'disc', 'asterisk']
    const L = scatterLayout(names)
    tOrange.current.copy(L.orange)
    tLime.current.copy(L.lime)
    tCream.current.copy(L.cream)
    if (!mobile) {
      tDisc.current.copy(L.disc)
      tAsterisk.current.copy(L.asterisk)
    }
  }, [promptSeed, mobile])

  return (
    <>
      <OrangeCube targetAnchor={tOrange} />
      <LimeTorus targetAnchor={tLime} />
      <CreamSphere targetAnchor={tCream} />
      {!mobile && <DarkDisc targetAnchor={tDisc} />}
      {!mobile && <Asterisk targetAnchor={tAsterisk} />}
    </>
  )
}

// ── Export ───────────────────────────────────────────────────────────────────
/**
 * @param {object} props
 * @param {number} props.promptSeed — increments each Generate click; shifts anchors
 * @param {boolean} props.paused — pauses rendering when section is off-screen or tab hidden
 */
export default function SparkScene({ promptSeed = 0, paused = false }) {
  const mobile = isMobile()
  const [docHidden, setDocHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false
  )

  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  // Under reduced motion: render one static frame ('demand')
  // When off-screen or tab hidden: 'never' (0% GPU/CPU)
  // When active: 'always' (continuous fluid motion)
  const loopMode = reducedMotion
    ? 'demand'
    : (paused || docHidden)
    ? 'never'
    : 'always'

  return (
    <Canvas
      frameloop={loopMode}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3.8], fov: 45 }}
      gl={{ antialias: !mobile, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      {/* Crisp 3-point lighting — prevents dark muddy materials */}
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 5, 3]} intensity={1.7} />
      <directionalLight position={[-3, -2, 2]} intensity={0.9} color="#FFFDF5" />
      <pointLight position={[0, 0, 2]} intensity={0.5} color="#FFFFFF" />

      <SceneObjects promptSeed={promptSeed} mobile={mobile} />
    </Canvas>
  )
}
