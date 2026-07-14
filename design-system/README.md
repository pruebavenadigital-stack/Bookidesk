# Sistema de diseño de BookiDesk · v2

**Fuente canónica:** el [proyecto de Claude Design de Laura](https://claude.ai/design/p/b363b449-f8f6-427a-9df9-ba280b27179a)
("Pokédex de libros intro"). Una copia versionada del diseño vive en
[`source/`](./source/) (handoff bundle exportado desde claude.ai/design).

Estética de **biblioteca clásica / academia**: vino profundo, dorado y crema,
con Space Grotesk de display e Inter de cuerpo.

## Archivos

- **`tokens.css`** — la fuente de verdad en código. Tokens en 3 capas (primitivos → semánticos → utilidades Tailwind), tema claro/oscuro, y ahora también **tokens de movimiento** derivados de la animación.
- **`source/`** — el diseño original (prototipo HTML/JSX de la intro + logo). Es *prototipo*, no código de producción: al implementar, se recrea el resultado visual con el stack de la app.

## Paleta

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo | Crema `#F6EFE0` | Vino casi negro `#1D0A0F` |
| Texto | Vino `#2A1016` | Crema `#F2E7CF` |
| Acción principal (`primary`) | **Vino** `#722033` | **Dorado** `#D4A94E` |
| Acento (`accent`) | Dorado `#D4A94E` | Vino `#722033` |
| Dorado como TEXTO (`gold-text`) | Dorado oscuro `#A5813A` | Dorado `#D4A94E` |
| Foco / estrellas | Dorado `#D4A94E` | Dorado `#D4A94E` |

> **Decisiones tomadas del propio diseño:** en tema claro manda el vino y en
> oscuro manda el dorado (como el logo). Y cuando el dorado es *texto* sobre
> fondo claro, se usa la versión oscura `#A5813A` — exactamente lo que hace el
> wordmark de la animación (`deskColor`) para mantener contraste.

## Tipografía

- **Display / marca:** `Space Grotesk` (500/600/700) — títulos, logo, encabezados.
- **Cuerpo:** `Inter` (400/500/600/700) — texto general, formularios.
- **Mono:** `JetBrains Mono` — ISBN, datos técnicos.
- **Tagline:** mayúsculas con tracking `0.34em` (`tracking-tagline`).

## Movimiento (nuevo en v2)

El carácter de la animación del logo, disponible como tokens:

| Token | Valor | Uso |
|---|---|---|
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | Pops y entradas con resorte (easeOutBack) |
| `--ease-out-quad` | `cubic-bezier(.25,.46,.45,.94)` | Desplazamientos que llegan suave |
| `--ease-in-out-quad` | `cubic-bezier(.455,.03,.515,.955)` | Transiciones simétricas |
| `--duration-fast/base/slow` | `150/250/400ms` | Micro-feedback / UI / paneles |

Con `prefers-reduced-motion` todo se desactiva (accesibilidad).

## Estados de lectura y préstamo

Tokens dedicados para insignias consistentes (PRD CA-4.5):
`--status-pending` · `--status-reading` · `--status-read` · `--status-abandoned` · `--status-loaned`.

## La intro animada

`source/project/BookiDesk Intro.dc.html` es el **splash de la app** (3.5 s,
1080×1920: el libro cae, se abre, la lente escanea, nace el icono y entra el
wordmark). Se implementará como pantalla de bienvenida cuando exista la app
(fase de UI), recreando el prototipo con React.

## Cómo se usa

Los tokens siguen la convención de **shadcn/ui**, así que al montar la app
(Next.js + Tailwind 4 + shadcn) el tema ya queda listo:

```css
/* app/globals.css */
@import "tailwindcss";
/* … pega aquí el contenido de design-system/tokens.css … */
```

```tsx
<button className="bg-primary text-primary-foreground rounded-lg font-display">
  Agregar libro
</button>
<h1 className="font-display">Booki<span className="text-gold-text">Desk</span></h1>
<span className="uppercase tracking-tagline text-muted-foreground">Tu colección de libros</span>
```

En producción, las fuentes se cargarán con `next/font` en vez del `@import` de
Google Fonts (mejor rendimiento); el `@import` del archivo es para uso standalone.
