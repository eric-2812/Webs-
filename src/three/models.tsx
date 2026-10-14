/*
 * Modelos 3D reales: escaneos fotogramétricos de Poly Haven (CC0).
 * https://polyhaven.com/models — ver public/models/CREDITS.md
 */
import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const base = import.meta.env.BASE_URL
const url = (dir: string) => `${base}models/${dir}/model.gltf`

export const MODELS = {
  croissant: url('croissant'),
  chocolate: url('strawberry_chocolate_cake'),
  zanahoria: url('carrot_cake'),
  te: url('tea_set_01'),
  tabla: url('wooden_cutting_board'),
  bollos: url('hamburger_buns'),
  cesta: url('wicker_basket_01'),
  jarra: url('jug_01'),
  limon: url('lemon'),
  manzana: url('food_apple_01'),
} as const

export type ModelId = keyof typeof MODELS

// Clona el modelo, lo escala para que su lado mayor en planta mida `width`
// y lo apoya en y = 0. Devuelve también la altura final, para apilar piezas.
export function useFitted(id: ModelId, width: number) {
  const { scene } = useGLTF(MODELS[id])
  return useMemo(() => {
    const obj = scene.clone(true)
    obj.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    const box = new THREE.Box3().setFromObject(obj)
    const size = box.getSize(new THREE.Vector3())
    const s = width / Math.max(size.x, size.z)
    const center = box.getCenter(new THREE.Vector3())
    const group = new THREE.Group()
    obj.position.set(-center.x, -box.min.y, -center.z)
    group.add(obj)
    group.scale.setScalar(s)
    return { object: group, height: size.y * s }
  }, [scene, width])
}

type V3 = [number, number, number]

export function Model({ id, width, position, rotation }: { id: ModelId; width: number; position?: V3; rotation?: V3 }) {
  const { object } = useFitted(id, width)
  return (
    <group position={position} rotation={rotation}>
      <primitive object={object} />
    </group>
  )
}

// Tarta sobre tabla de madera (portada). La tarta se separa de la tabla con el scroll.
export function useBoardHeight() {
  return useFitted('tabla', 2.9).height
}

export function Board() {
  const { object } = useFitted('tabla', 2.9)
  return <primitive object={object} />
}

// Cesta de desayuno: cesta de mimbre con croissant, bollos y una manzana asomando.
function Cesta() {
  const basket = useFitted('cesta', 2)
  const h = basket.height
  return (
    <group>
      <primitive object={basket.object} />
      <Model id="bollos" width={1.25} position={[-0.15, h * 0.55, -0.2]} rotation={[0.15, 0.4, 0]} />
      <Model id="croissant" width={1.3} position={[0.15, h * 0.72, 0.25]} rotation={[-0.25, -0.5, 0.1]} />
      <Model id="manzana" width={0.42} position={[0.55, h * 0.78, -0.3]} />
    </group>
  )
}

// Limonada: jarra de cerámica con dos limones al lado.
function Limonada() {
  return (
    <group>
      <Model id="jarra" width={1.3} position={[-0.2, 0, 0]} rotation={[0, 0.6, 0]} />
      <Model id="limon" width={0.5} position={[0.95, 0, 0.35]} rotation={[0, 0.3, 1.4]} />
      <Model id="limon" width={0.46} position={[0.55, 0, 0.95]} rotation={[0.4, 1.2, 0]} />
    </group>
  )
}

export type ProductId = 'croissant' | 'bollos' | 'chocolate' | 'zanahoria' | 'cesta' | 'limonada' | 'te'

const WIDTH: Record<Exclude<ProductId, 'cesta' | 'limonada'>, number> = {
  croissant: 2.3,
  bollos: 2.1,
  chocolate: 2,
  zanahoria: 2,
  te: 2.8,
}

export function Product({ id }: { id: ProductId }) {
  if (id === 'cesta') return <Cesta />
  if (id === 'limonada') return <Limonada />
  return <Model id={id} width={WIDTH[id]} />
}

