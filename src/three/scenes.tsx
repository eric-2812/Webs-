// Escenas listas para usar; se cargan en diferido para que el texto pinte primero.
import { CakeOnBoard, Model, type ModelId } from './models'
import { PopIn, Stage } from './Stage'

export default function HeroScene() {
  return (
    <Stage
      className="stage stage--hero"
      label="Tarta de chocolate con fresas sobre una tabla de madera. Se puede girar arrastrando."
      camera={[0, 2.9, 7.4]}
      target={0.45}
      shadowScale={6}
    >
      <CakeOnBoard cake="chocolate" />
    </Stage>
  )
}

export type PieceId = 'croissant' | 'chocolate' | 'zanahoria' | 'te'

const VITRINA_WIDTH: Record<PieceId, number> = { croissant: 2.4, chocolate: 2, zanahoria: 2, te: 2.8 }

export function VitrinaScene({ piece, label }: { piece: PieceId; label: string }) {
  return (
    <Stage className="stage stage--vitrina" label={label} camera={[0, 2.4, 4.8]} target={0.35} spin={0.25} shadowScale={4}>
      <PopIn key={piece}>
        <Model id={piece} width={VITRINA_WIDTH[piece]} />
      </PopIn>
    </Stage>
  )
}

export function CakeScene({ cake, scale, label }: { cake: ModelId; scale: number; label: string }) {
  return (
    <Stage className="stage stage--encargo" label={label} camera={[0, 2.9, 7.2]} target={0.95} spin={0.22} shadowScale={5}>
      <PopIn key={cake}>
        <group scale={scale}>
          <Model id={cake} width={2.2} />
        </group>
      </PopIn>
    </Stage>
  )
}
