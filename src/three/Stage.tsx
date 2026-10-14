import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'

export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Solo pintamos cuando el lienzo está a la vista: tres canvases a 60fps no tienen sentido.
function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

// Giro lento sobre sí mismo, como una tarta en el expositor giratorio.
function Turntable({ speed = 0.18, children }: { speed?: number; children: ReactNode }) {
  const g = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (g.current && !prefersReducedMotion) g.current.rotation.y += dt * speed
  })
  return <group ref={g}>{children}</group>
}

// Entrada suave cuando cambia la pieza (se usa con `key` para remontar).
export function PopIn({ children }: { children: ReactNode }) {
  const g = useRef<THREE.Group>(null)
  const t = useRef(prefersReducedMotion ? 1 : 0)
  useFrame((_, dt) => {
    if (!g.current) return
    t.current = THREE.MathUtils.damp(t.current, 1, 7, dt)
    const s = t.current
    g.current.scale.setScalar(0.85 + 0.15 * s)
    g.current.position.y = (1 - s) * 0.35
  })
  return <group ref={g}>{children}</group>
}

// Iluminación de obrador: ventana grande a un lado, rebote cálido del mármol.
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[3.5, 5, 2.5]}
        intensity={2.1}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-3, 3, 3, -3, 0.5, 14]} />
      </directionalLight>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#fff3e0" position={[4, 3, 2]} scale={[4, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.9} color="#ffd9b0" position={[-5, 1, -1]} scale={[3, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={0.6} color="#ffffff" position={[0, 6, 0]} scale={4} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.5} color="#c98a5a" position={[0, -3, 4]} scale={[8, 1, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  )
}

export function Stage({
  children,
  camera = [0, 2.4, 5.2],
  fov = 30,
  target = 0.7,
  spin = 0.18,
  shadowScale = 6,
  label,
  className,
}: {
  children: ReactNode
  camera?: [number, number, number]
  fov?: number
  target?: number
  spin?: number
  shadowScale?: number
  label: string
  className?: string
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={className} role="img" aria-label={label}>
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: camera, fov }}
        onCreated={({ camera }) => camera.lookAt(0, target, 0)}
      >
        <Suspense fallback={null}>
          <Lighting />
          <PresentationControls
            global={false}
            cursor
            snap
            speed={1.4}
            polar={[-0.15, 0.25]}
            azimuth={[-Infinity, Infinity]}
          >
            <Turntable speed={spin}>{children}</Turntable>
          </PresentationControls>
          <ContactShadows position={[0, 0, 0]} opacity={0.42} scale={shadowScale} blur={2.6} far={3} color="#3a2416" />
        </Suspense>
      </Canvas>
    </div>
  )
}
