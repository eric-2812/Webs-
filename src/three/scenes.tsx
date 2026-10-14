// Escenas listas para usar; se cargan en diferido para que el texto pinte primero.
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Board, Model, Product, useBoardHeight, type ModelId, type ProductId } from './models'
import { PopIn, ScrollRig, Stage, useScrollProgress } from './Stage'

/* ---------- portada ---------- */

// Al bajar, la tarta se despega de la tabla, gira media vuelta y la tabla se inclina hacia ti.
function HeroRig() {
  const boardH = useBoardHeight()
  const all = useRef<THREE.Group>(null)
  const cake = useRef<THREE.Group>(null)
  const p = useScrollProgress('exit', 5)
  useFrame(() => {
    if (!all.current || !cake.current || p.current < 0) return
    const t = p.current
    all.current.rotation.x = 0.35 * t
    all.current.position.y = -0.25 * t
    cake.current.position.y = boardH + 0.55 * Math.sin(Math.min(t * 1.8, 1) * Math.PI * 0.5)
    cake.current.rotation.y = t * Math.PI * 1.2
    cake.current.rotation.z = 0.12 * t
  })
  return (
    <group ref={all}>
      <Board />
      <group ref={cake} position={[0, boardH, 0]}>
        <Model id="chocolate" width={1.65} />
      </group>
    </group>
  )
}

export default function HeroScene() {
  return (
    <Stage
      className="stage stage--hero"
      label="Tarta de chocolate con fresas sobre una tabla de madera. Se puede girar arrastrando."
      camera={[0, 2.9, 7.4]}
      target={0.45}
      shadowScale={6}
      track="inicio"
    >
      <HeroRig />
    </Stage>
  )
}

/* ---------- cinta del obrador: los productos desfilan con el scroll ---------- */

export const CINTA_GAP = 3.2

function Conveyor({ items }: { items: ProductId[] }) {
  const belt = useRef<THREE.Group>(null)
  const pieces = useRef<(THREE.Group | null)[]>([])
  const p = useScrollProgress('pinned', 4)
  // En pantallas estrechas encogemos toda la cinta para que se vea la pieza entera.
  const k = useThree((s) => THREE.MathUtils.clamp(s.size.width / s.size.height / 1.4, 0.5, 1))
  useFrame((state) => {
    if (!belt.current || p.current < 0) return
    const x = -p.current * (items.length - 1) * CINTA_GAP
    belt.current.position.x = x
    pieces.current.forEach((g, i) => {
      if (!g) return
      const d = i * CINTA_GAP + x // distancia al centro
      const focus = Math.max(0, 1 - Math.abs(d) / CINTA_GAP)
      g.rotation.y = d * 0.55 + state.clock.elapsedTime * 0.15
      g.position.y = 0.25 * focus
      g.position.z = -1.2 * (1 - focus)
      g.scale.setScalar(0.72 + 0.28 * focus)
    })
  })
  return (
    <group scale={k}>
      <group ref={belt}>
        {items.map((id, i) => (
          <group key={id} position={[i * CINTA_GAP, 0, 0]}>
            <group ref={(g) => void (pieces.current[i] = g)}>
              <Product id={id} />
            </group>
          </group>
        ))}
      </group>
    </group>
  )
}

export function CintaScene({ items, label }: { items: ProductId[]; label: string }) {
  return (
    <Stage
      className="stage stage--cinta"
      label={label}
      camera={[0, 2.1, 6.8]}
      fov={34}
      target={0.55}
      spin={0}
      shadowScale={(items.length + 2) * CINTA_GAP}
      track="cinta"
      controls={false}
    >
      <Conveyor items={items} />
    </Stage>
  )
}

/* ---------- vitrina ---------- */

export function VitrinaScene({ piece, label }: { piece: ProductId; label: string }) {
  return (
    <Stage
      className="stage stage--vitrina"
      label={label}
      camera={[0, 2.4, 4.8]}
      target={0.35}
      spin={0.12}
      shadowScale={4}
    >
      <ScrollRig rotate={Math.PI * 1.5} lift={0.15} enterScale={0.6}>
        <PopIn key={piece}>
          <Product id={piece} />
        </PopIn>
      </ScrollRig>
    </Stage>
  )
}

/* ---------- encargos ---------- */

export function CakeScene({ cake, scale, label }: { cake: ModelId; scale: number; label: string }) {
  const s = useRef<THREE.Group>(null)
  return (
    <Stage
      className="stage stage--encargo"
      label={label}
      camera={[0, 2.9, 7.2]}
      target={0.95}
      spin={0.12}
      shadowScale={5}
    >
      <ScrollRig rotate={Math.PI} tilt={0.25} enterScale={0.55}>
        <PopIn key={cake}>
          <SmoothScale target={scale} ref={s}>
            <Model id={cake} width={2.2} />
          </SmoothScale>
        </PopIn>
      </ScrollRig>
    </Stage>
  )
}

// Cambia de tamaño con suavidad al elegir pequeña / mediana / grande.
function SmoothScale({
  target,
  children,
  ref,
}: {
  target: number
  children: React.ReactNode
  ref: React.RefObject<THREE.Group | null>
}) {
  useFrame((_, dt) => {
    if (ref.current) ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, target, 8, dt))
  })
  return <group ref={ref}>{children}</group>
}
