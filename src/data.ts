import type { PieceId } from './three/scenes'

export type Piece = {
  id: PieceId
  name: string
  note: string
  price: number
  unit: string
  soldOutBy: string
  allergens: string[]
}

export const VITRINA: Piece[] = [
  {
    id: 'croissant',
    name: 'Croissant de mantequilla',
    note: 'Tres días de masa: se lamina el lunes y se hornea el miércoles. 27 capas, mantequilla de Soria.',
    price: 2.1,
    unit: 'ud.',
    soldOutBy: '11:30',
    allergens: ['gluten', 'lácteos', 'huevo'],
  },
  {
    id: 'chocolate',
    name: 'Tarta de chocolate y fresas',
    note: 'Bizcocho de cacao, ganache al 70 % y fresas de Huelva puestas a mano justo antes de abrir.',
    price: 4.6,
    unit: 'porción',
    soldOutBy: '13:00',
    allergens: ['gluten', 'lácteos', 'huevo'],
  },
  {
    id: 'zanahoria',
    name: 'Carrot cake',
    note: 'Zanahoria rallada esa mañana, nueces tostadas y crema de queso poco dulce. La que más repite la gente.',
    price: 4.4,
    unit: 'porción',
    soldOutBy: '13:30',
    allergens: ['gluten', 'lácteos', 'huevo', 'frutos secos'],
  },
  {
    id: 'te',
    name: 'Merienda en la barra',
    note: 'Té en tetera de verdad y una pieza del día. De 17:00 a 19:00, mientras queden sillas (hay seis).',
    price: 5.5,
    unit: 'persona',
    soldOutBy: '—',
    allergens: ['según la pieza'],
  },
]

export type CakeId = 'chocolate' | 'zanahoria'
export type Size = 'pequena' | 'mediana' | 'grande'

export const CAKES: { id: CakeId; label: string }[] = [
  { id: 'chocolate', label: 'Chocolate y fresas' },
  { id: 'zanahoria', label: 'Carrot cake' },
]

export const SIZES: { id: Size; label: string; servings: string; scale: number }[] = [
  { id: 'pequena', label: 'Pequeña', servings: '6–8', scale: 0.82 },
  { id: 'mediana', label: 'Mediana', servings: '10–12', scale: 1 },
  { id: 'grande', label: 'Grande', servings: '16–20', scale: 1.18 },
]

const PRICES: Record<CakeId, Record<Size, number>> = {
  chocolate: { pequena: 28, mediana: 38, grande: 54 },
  zanahoria: { pequena: 26, mediana: 35, grande: 50 },
}

export function cakePrice(cake: CakeId, size: Size) {
  return PRICES[cake][size]
}

export const DIA = [
  { t: '03:30', h: 'Se enciende el horno de piso', p: 'Tarda una hora en llegar a 230 °C. Mientras, se sacan las masas que llevan toda la noche en la cámara.' },
  { t: '05:00', h: 'Primera hornada', p: 'Croissants, napolitanas y ensaimadas. Lo que no sale bien se queda para el equipo; no se vende.' },
  { t: '08:00', h: 'Abrimos la persiana', p: 'La vitrina está llena. Es la mejor hora si quieres elegir, y la peor si tienes prisa.' },
  { t: '11:00', h: 'Montaje de tartas', p: 'Las tartas de encargo se montan el mismo día que se recogen. Nunca la víspera.' },
  { t: '14:00', h: 'Cerramos a mediodía', p: 'Comemos juntos, limpiamos y preparamos las masas de mañana. Vuelve por la tarde.' },
]

// 0 = domingo
export const HORARIO: { d: string; h: string | null }[] = [
  { d: 'Domingo', h: '08:00 – 14:00' },
  { d: 'Lunes', h: null },
  { d: 'Martes', h: '08:00 – 14:00 · 17:00 – 20:30' },
  { d: 'Miércoles', h: '08:00 – 14:00 · 17:00 – 20:30' },
  { d: 'Jueves', h: '08:00 – 14:00 · 17:00 – 20:30' },
  { d: 'Viernes', h: '08:00 – 14:00 · 17:00 – 20:30' },
  { d: 'Sábado', h: '08:00 – 14:30' },
]

const TRAMOS: Record<number, [number, number][]> = {
  0: [[8, 14]],
  1: [],
  2: [[8, 14], [17, 20.5]],
  3: [[8, 14], [17, 20.5]],
  4: [[8, 14], [17, 20.5]],
  5: [[8, 14], [17, 20.5]],
  6: [[8, 14.5]],
}

function fmt(h: number) {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function estadoAhora(now = new Date()) {
  const day = now.getDay()
  const h = now.getHours() + now.getMinutes() / 60
  const abierto = TRAMOS[day].find(([a, b]) => h >= a && h < b)
  if (abierto) return { abierto: true, texto: `Abierto · cierra a las ${fmt(abierto[1])}` }
  for (let i = 0; i < 7; i++) {
    const d = (day + i) % 7
    const next = TRAMOS[d].find(([a]) => i > 0 || a > h)
    if (next) {
      const cuando = i === 0 ? 'hoy' : i === 1 ? 'mañana' : HORARIO[d].d.toLowerCase()
      return { abierto: false, texto: `Cerrado · abrimos ${cuando} a las ${fmt(next[0])}` }
    }
  }
  return { abierto: false, texto: 'Cerrado' }
}

export const eur = (n: number) =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0 })
