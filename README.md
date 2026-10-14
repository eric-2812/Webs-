# Almíbar · obrador de pastelería

Web de una pastelería ficticia de Valencia, con React + Vite y escenas 3D en React Three Fiber.

- **Portada**: tarta de chocolate y fresas sobre tabla de madera; se gira arrastrando.
- **La vitrina**: carta del día; al elegir una pieza cambia el modelo 3D.
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
