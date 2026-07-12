# Sistema de diseño de BookiDesk

Marca derivada de la animación del logo ("Pokédex de libros"). Estética de
**biblioteca clásica / academia**: vino profundo, dorado y crema, con Space Grotesk
de display e Inter de cuerpo.

## Archivos

- **`tokens.css`** — la fuente de verdad. Tokens en 3 capas (primitivos → semánticos → utilidades Tailwind), con tema claro y oscuro.
- **Guía de estilo visual** — página navegable publicada como Artifact (ver el enlace que te compartí en el chat).

## Paleta

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo | Crema `#F6EFE0` | Vino casi negro `#1D0A0F` |
| Texto | Vino `#2A1016` | Crema `#F2E7CF` |
| Acción principal (`primary`) | **Vino** `#722033` | **Dorado** `#D4A94E` |
| Acento (`accent`) | Dorado `#D4A94E` | Vino `#722033` |
| Foco / estrellas | Dorado `#D4A94E` | Dorado `#D4A94E` |

> **Decisión de marca:** en tema **claro manda el vino** como color de acción; en
> **oscuro manda el dorado** (tal como el logo, donde el dorado brilla sobre el vino).

## Tipografía

- **Display / marca:** `Space Grotesk` (500/600/700) — títulos, logo, encabezados.
- **Cuerpo:** `Inter` (400/500/600/700) — texto general, formularios.
- **Mono:** `JetBrains Mono` — ISBN, datos técnicos.

## Estados de lectura y préstamo

Tokens dedicados para insignias consistentes (PRD CA-4.5):
`--status-pending` · `--status-reading` · `--status-read` · `--status-abandoned` · `--status-loaned`.

## Cómo se usa

Los tokens siguen la convención de **shadcn/ui**, así que al montar la app
(Next.js + Tailwind 4 + shadcn) el tema ya queda listo:

```css
/* app/globals.css */
@import "tailwindcss";
/* … pega aquí el contenido de design-system/tokens.css … */
```

```tsx
// Y en los componentes se usan como utilidades Tailwind:
<button className="bg-primary text-primary-foreground rounded-lg font-display">
  Agregar libro
</button>
<span className="text-muted-foreground">Pendiente por leer</span>
```

En producción, las fuentes se cargarán con `next/font` en vez del `@import` de
Google Fonts (mejor rendimiento); el `@import` del archivo es para uso standalone.
