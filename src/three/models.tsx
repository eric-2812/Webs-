/*
 * Modelos 3D reales: escaneos fotogramétricos de Poly Haven (CC0).
 * https://polyhaven.com/models — ver public/models/CREDITS.md
 */
import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const base = import.meta.env.BASE_URL

export const MODELS = {
  croissant: `${base}models/croissant/model.gltf`,
  chocolate: `${base}models/strawberry_chocolate_cake/model.gltf`,
  zanahoria: `${base}models/carrot_cake/model.gltf`,
  te: `${base}models/tea_set_01/model.gltf`,
  tabla: `${base}models/wooden_cutting_board/model.gltf`,
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

export function Model({ id, width, position }: { id: ModelId; width: number; position?: [number, number, number] }) {
  const { object } = useFitted(id, width)
  return (
    <group position={position}>
      <primitive object={object} />
    </group>
  )
}

// Tarta sobre tabla de madera (portada).
export function CakeOnBoard({ cake = 'chocolate' as ModelId }) {
  const board = useFitted('tabla', 2.9)
  return (
    <group>
      <primitive object={board.object} />
      <Model id={cake} width={1.65} position={[0, board.height, 0]} />
    </group>
  )
}

Object.values(MODELS).forEach((url) => useGLTF.preload(url))
