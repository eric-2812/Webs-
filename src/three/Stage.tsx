import { createContext, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'

export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Solo pintamos cuando el lienzo está a la vista: varios canvases a 60fps no tienen sentido.
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

/* ---------- progreso de scroll ---------- */

/*
 * Modos de medir el scroll sobre el elemento seguido:
 *  - through: 0 cuando asoma por abajo, 1 cuando sale por arriba.
 *  - exit:    0 con el elemento arriba del todo, 1 cuando ya ha salido (portada).
 *  - pinned:  0..1 mientras una sección alta con contenido sticky está fijada.
 */
export type ScrollMode = 'through' | 'exit' | 'pinned'

const TrackCtx = createContext<{ current: HTMLElement | null }>({ current: null })

export function scrollProgress(el: HTMLElement, mode: ScrollMode) {
  const r = el.getBoundingClientRect()
  const vh = window.innerHeight
  const raw =
    mode === 'pinned'
      ? -r.top / Math.max(1, r.height - vh)
      : mode === 'exit'
        ? -r.top / Math.max(1, r.height)
        : (vh - r.top) / (vh + r.height)
  return THREE.MathUtils.clamp(raw, 0, 1)
}

// Devuelve una ref con el progreso suavizado; se actualiza en cada frame.
export function useScrollProgress(mode: ScrollMode = 'through', lambda = 6) {
  const track = useContext(TrackCtx)
  const p = useRef(-1)
  useFrame((_, dt) => {
    const el = track.current
    if (!el) return
    const target = scrollProgress(el, mode)
    p.current = p.current < 0 || prefersReducedMotion ? target : THREE.MathUtils.damp(p.current, target, lambda, dt)
  })
  return p
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3)

// Animación genérica ligada al scroll: giro, elevación, inclinación y entrada en escala.
export function ScrollRig({
  mode = 'through',
  rotate = Math.PI,
  lift = 0,
  tilt = 0,
  enterScale = 0.7,
  children,
}: {
  mode?: ScrollMode
  rotate?: number
  lift?: number
  tilt?: number
  enterScale?: number
  children: ReactNode
}) {
  const g = useRef<THREE.Group>(null)
  const p = useScrollProgress(mode)
  useFrame(() => {
    if (!g.current || p.current < 0) return
    const t = p.current
    const enter = ease(THREE.MathUtils.clamp(t * 2.4, 0, 1))
    g.current.rotation.y = (t - 0.5) * rotate
    g.current.rotation.x = tilt * Math.sin(t * Math.PI)
    g.current.position.y = lift * Math.sin(t * Math.PI)
    g.current.scale.setScalar(enterScale + (1 - enterScale) * enter)
  })
  return <group ref={g}>{children}</group>
}

/* ---------- utilidades de escena ---------- */

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
  track,
  controls = true,
  label,
  className,
}: {
  children: ReactNode
  camera?: [number, number, number]
  fov?: number
  target?: number
  spin?: number
  shadowScale?: number
  /** id del elemento cuyo scroll anima la escena (por defecto, el propio lienzo) */
  track?: string
  controls?: boolean
  label: string
  className?: string
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const trackRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    trackRef.current = (track && document.getElementById(track)) || ref.current
  }, [track, ref])

  const scene = <Turntable speed={spin}>{children}</Turntable>

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
        <TrackCtx.Provider value={trackRef}>
          <Suspense fallback={null}>
            <Lighting />
            {controls ? (
              <PresentationControls
                global={false}
                cursor
                snap
                speed={1.4}
                polar={[-0.15, 0.25]}
                azimuth={[-Infinity, Infinity]}
              >
                {scene}
              </PresentationControls>
            ) : (
              scene
            )}
            <ContactShadows position={[0, 0, 0]} opacity={0.42} scale={shadowScale} blur={2.6} far={3} color="#3a2416" />
          </Suspense>
        </TrackCtx.Provider>
      </Canvas>
    </div>
  )
}
