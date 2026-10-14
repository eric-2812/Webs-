import { lazy, Suspense, useEffect, useMemo, useState, type FormEvent } from 'react'
import { CAKES, cakePrice, DIA, estadoAhora, eur, HORARIO, SIZES, VITRINA, type CakeId, type Size } from './data'

const HeroScene = lazy(() => import('./three/scenes'))
const VitrinaScene = lazy(() => import('./three/scenes').then((m) => ({ default: m.VitrinaScene })))
const CakeScene = lazy(() => import('./three/scenes').then((m) => ({ default: m.CakeScene })))

function StageFallback({ className }: { className: string }) {
  return <div className={`${className} stage--loading`} aria-hidden />
}

/* ---------------- cabecera ---------------- */

function Header() {
  const [estado, setEstado] = useState(() => estadoAhora())
  useEffect(() => {
    const id = setInterval(() => setEstado(estadoAhora()), 60_000)
    return () => clearInterval(id)
  }, [])
  return (
    <header className="top">
      <a href="#inicio" className="brand" aria-label="Almíbar, inicio">
        Almíbar
        <span className="brand__sub">obrador · 1987</span>
      </a>
      <nav className="nav" aria-label="Principal">
        <a href="#vitrina">La vitrina</a>
        <a href="#encargos">Encargos</a>
        <a href="#obrador">El obrador</a>
        <a href="#visita">Visítanos</a>
      </nav>
      <p className={`status ${estado.abierto ? 'status--open' : ''}`}>
        <span className="status__dot" aria-hidden />
        {estado.texto}
      </p>
    </header>
  )
}

/* ---------------- portada ---------------- */

function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="hero__copy">
        <p className="eyebrow">Calle de la Sang, 14 · Valencia</p>
        <h1 className="display">
          Horneamos de madrugada para que tú <em>no tengas</em> que madrugar.
        </h1>
        <p className="lede">
          Pastelería de barrio desde 1987. Masas largas, mantequilla de verdad y tartas que se montan el mismo día
          que te las llevas.
        </p>
        <div className="hero__actions">
          <a href="#encargos" className="btn">
            Encargar una tarta
          </a>
          <a href="#vitrina" className="link">
            Qué hay hoy en la vitrina
          </a>
        </div>
      </div>
      <figure className="hero__figure">
        <Suspense fallback={<StageFallback className="stage stage--hero" />}>
          <HeroScene />
        </Suspense>
        <figcaption className="handnote">
          Tarta de chocolate y fresas.
          <br />
          Arrástrala para darle la vuelta.
        </figcaption>
      </figure>
    </section>
  )
}

/* ---------------- vitrina ---------------- */

function Vitrina() {
  const [sel, setSel] = useState(0)
  const p = VITRINA[sel]
  return (
    <section id="vitrina" className="section vitrina">
      <header className="section__head">
        <p className="eyebrow">01 — La vitrina de hoy</p>
        <h2 className="h2">Lo que sale del horno, se vende ese día. Lo que sobra, se dona a las cuatro.</h2>
      </header>

      <div className="vitrina__grid">
        <ol className="menu" role="listbox" aria-label="Piezas de la vitrina">
          {VITRINA.map((item, i) => (
            <li
              key={item.id}
              role="option"
              aria-selected={i === sel}
              tabIndex={0}
              className="menu__item"
              onClick={() => setSel(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSel(i)
                }
                if (e.key === 'ArrowDown') (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus()
                if (e.key === 'ArrowUp') (e.currentTarget.previousElementSibling as HTMLElement | null)?.focus()
              }}
            >
              <span className="menu__name">{item.name}</span>
              <span className="menu__dots" aria-hidden />
              <span className="menu__price">
                {eur(item.price)} <small>/ {item.unit}</small>
              </span>
            </li>
          ))}
        </ol>

        <div className="vitrina__stage">
          <Suspense fallback={<StageFallback className="stage stage--vitrina" />}>
            <VitrinaScene piece={p.id} label={`Modelo 3D: ${p.name}`} />
          </Suspense>
          <div className="vitrina__card" aria-live="polite">
            <h3 className="h3">{p.name}</h3>
            <p>{p.note}</p>
            <dl className="facts">
              <div>
                <dt>Suele acabarse</dt>
                <dd>{p.soldOutBy}</dd>
              </div>
              <div>
                <dt>Contiene</dt>
                <dd>{p.allergens.join(', ')}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- encargos ---------------- */

function Segmented<T extends string | number>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string
  value: T
  options: { id: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <fieldset className="seg">
      <legend>{legend}</legend>
      <div className="seg__opts">
        {options.map((o) => (
          <label key={String(o.id)} className="seg__opt">
            <input
              type="radio"
              name={legend}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function minPickup() {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  if (d.getDay() === 1) d.setDate(d.getDate() + 1) // los lunes cerramos
  return d.toISOString().slice(0, 10)
}

function Encargos() {
  const [cake, setCake] = useState<CakeId>('chocolate')
  const [size, setSize] = useState<Size>('mediana')
  const [done, setDone] = useState<null | { nombre: string; fecha: string; texto: string }>(null)
  const [fechaError, setFechaError] = useState('')
  const price = cakePrice(cake, size)
  const sz = SIZES.find((x) => x.id === size)!
  const cakeLabel = CAKES.find((c) => c.id === cake)!.label
  const min = useMemo(minPickup, [])

  const label = `Vista previa: ${cakeLabel}, tamaño ${sz.label.toLowerCase()}, para ${sz.servings} personas.`

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const fecha = String(f.get('fecha'))
    if (new Date(fecha + 'T12:00').getDay() === 1) {
      setFechaError('Los lunes el obrador está cerrado. Elige otro día.')
      return
    }
    setDone({ nombre: String(f.get('nombre')).split(' ')[0], fecha, texto: String(f.get('texto') || '') })
  }

  return (
    <section id="encargos" className="section encargos">
      <header className="section__head">
        <p className="eyebrow">02 — Encargos</p>
        <h2 className="h2">Encarga tu tarta entera. Elige cuál y para cuántos; del resto nos encargamos nosotros.</h2>
      </header>

      <div className="encargos__grid">
        <div className="encargos__preview">
          <Suspense fallback={<StageFallback className="stage stage--encargo" />}>
            <CakeScene cake={cake} scale={sz.scale} label={label} />
          </Suspense>
          <div className="ticket" aria-live="polite">
            <span>
              {cakeLabel} · {sz.servings} raciones
            </span>
            <strong>{eur(price)}</strong>
          </div>
        </div>

        <div className="encargos__form">
          {done ? (
            <div className="receipt" role="status">
              <p className="eyebrow">Encargo recibido</p>
              <h3 className="h3">Gracias, {done.nombre}.</h3>
              <p>
                Te llamamos en menos de 24 h para confirmar. Recogida el{' '}
                <strong>
                  {new Date(done.fecha + 'T12:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </strong>
                {done.texto && (
                  <>
                    , con «<em>{done.texto}</em>» escrito encima
                  </>
                )}
                . Se paga al recoger.
              </p>
              <button className="link" onClick={() => setDone(null)}>
                Hacer otro encargo
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="form">
              <Segmented legend="Tarta" value={cake} onChange={setCake} options={CAKES} />
              <Segmented
                legend="Tamaño"
                value={size}
                onChange={setSize}
                options={SIZES.map((x) => ({ id: x.id, label: `${x.label} · ${x.servings}` }))}
              />

              <div className="fields">
                <label className="field">
                  <span>Nombre</span>
                  <input name="nombre" required autoComplete="name" />
                </label>
                <label className="field">
                  <span>Teléfono</span>
                  <input name="tel" type="tel" required autoComplete="tel" inputMode="tel" pattern="[0-9 +]{9,15}" />
                </label>
                <label className="field">
                  <span>Día de recogida</span>
                  <input
                    name="fecha"
                    type="date"
                    required
                    min={min}
                    onChange={() => setFechaError('')}
                    aria-describedby="fecha-hint"
                  />
                  <small id="fecha-hint" className={fechaError ? 'err' : ''}>
                    {fechaError || 'Necesitamos 48 h. Los lunes cerramos.'}
                  </small>
                </label>
                <label className="field">
                  <span>Texto encima (opcional)</span>
                  <input name="texto" maxLength={28} placeholder="Feliz 80, yaya" />
                </label>
              </div>

              <button type="submit" className="btn btn--block">
                Encargar por {eur(price)}
              </button>
              <p className="fine">No cobramos nada ahora. Pagas al recoger, en efectivo o tarjeta.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- el obrador ---------------- */

function Obrador() {
  return (
    <section id="obrador" className="section obrador">
      <header className="section__head">
        <p className="eyebrow">03 — Un día en el obrador</p>
        <h2 className="h2">Somos cinco. Empezamos cuando la ciudad todavía duerme.</h2>
      </header>
      <ol className="day">
        {DIA.map((d) => (
          <li key={d.t} className="day__row">
            <time className="day__time">{d.t}</time>
            <div>
              <h3 className="h3">{d.h}</h3>
              <p>{d.p}</p>
            </div>
          </li>
        ))}
      </ol>
      <blockquote className="quote">
        <p>
          «Mi padre decía que un croissant con prisa se nota en la segunda capa. Llevo treinta años intentando que
          no se note en ninguna.»
        </p>
        <footer>Marga Ferrer, segunda generación</footer>
      </blockquote>
    </section>
  )
}

/* ---------------- visita ---------------- */

function Visita() {
  const today = new Date().getDay()
  return (
    <section id="visita" className="section visita">
      <header className="section__head">
        <p className="eyebrow">04 — Visítanos</p>
        <h2 className="h2">Detrás del Mercado Central. Si huele a mantequilla, vas bien.</h2>
      </header>
      <div className="visita__grid">
        <address className="addr">
          Calle de la Sang, 14
          <br />
          46001 València
          <br />
          <a href="tel:+34960000000">960 00 00 00</a>
        </address>
        <table className="hours">
          <caption className="sr-only">Horario de apertura</caption>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <tr key={d} className={d === today ? 'is-today' : ''}>
                <th scope="row">
                  {HORARIO[d].d}
                  {d === today && <span className="tag">hoy</span>}
                </th>
                <td>{HORARIO[d].h ?? 'Cerrado'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <a href="#vitrina" className="skip">
        Saltar al contenido
      </a>
      <Header />
      <main>
        <Hero />
        <Vitrina />
        <Encargos />
        <Obrador />
        <Visita />
      </main>
      <footer className="foot">
        <span className="brand brand--small">Almíbar</span>
        <span>Obrador de pastelería · València · Desde 1987</span>
        <span>Precios con IVA incluido · Modelos 3D: Poly Haven (CC0)</span>
      </footer>
    </>
  )
}
