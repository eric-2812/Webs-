# Almíbar · obrador de pastelería

Web de una pastelería ficticia de Valencia, con React + Vite y escenas 3D en React Three Fiber.

**En vivo:** https://eric-2812.github.io/Webs-/ — se vuelve a desplegar sola en cada push (`.github/workflows/pages.yml` → rama `gh-pages`).

- **Portada**: tarta de chocolate y fresas sobre tabla de madera; al bajar, la tarta se despega de la tabla y gira.
- **Del horno a la vitrina**: sección fijada en la que los 7 productos desfilan como en una cinta según haces scroll.
- **La vitrina**: carta por categorías (bollería, tartas, para llevar); al elegir una pieza cambia el modelo 3D, que también gira con el scroll.
- **Encargos**: eliges tarta y tamaño, la vista 3D se actualiza y el formulario muestra un resguardo (sin backend todavía).
- **El obrador / Visítanos**: horario del día, horario semanal con el día actual marcado y estado «abierto/cerrado» en vivo.

## Modelos 3D

Escaneos fotogramétricos reales de [Poly Haven](https://polyhaven.com/models), licencia CC0. Detalle en
[`public/models/CREDITS.md`](public/models/CREDITS.md).

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # typecheck + build de producción en dist/
```

El nombre, la dirección y el teléfono son de ejemplo: cámbialos en `src/App.tsx` y `src/data.ts`.
