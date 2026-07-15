# BookiDesk

Aplicación web para la gestión de la biblioteca del hogar: un inventario compartido de todos los libros de la casa, con estados de lectura, calificaciones y reseñas, lista de deseos y control de préstamos.

## ¿Qué hace?

- **Biblioteca** — catálogo compartido con portada, autor y datos de cada libro, clasificados por estado de lectura (pendiente, leyendo, leído, abandonado).
- **Calificaciones y reseñas** — cada miembro del hogar puntúa con estrellas y escribe su crítica personal; el libro muestra el promedio.
- **Citas** — guarda los pasajes que no quieres olvidar, con su página.
- **Lista de deseos** — libros por comprar, con foto y título, que pasan a la biblioteca con un clic al comprarlos.
- **Préstamos** — registro de qué libro se prestó, a quién y cuándo, con su historial.

Es una aplicación **multiusuario con base de datos compartida**: no hay bibliotecas individuales, sino una sola biblioteca del hogar.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos / UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Metadatos de libros | Google Books API (+ Open Library como respaldo de portadas) |
| Despliegue | Vercel (PWA responsive) |

## Documentación

- [`MEMORY.md`](./MEMORY.md) — **empieza aquí**: el mapa del proyecto, las decisiones y sus porqués, y los gotchas del stack. Se carga solo en cada sesión de Claude Code.
- [`PRD.md`](./PRD.md) — requisitos completos: funcionalidades (F1–F9), modelo de datos y decisiones de diseño.
- [`DEPLOY.md`](./DEPLOY.md) — checklist para publicar la app y usarla desde el celular.
- [`design-system/`](./design-system/) — tokens de marca y el diseño original del logo.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # verifica tipos y rutas
```

Las variables de entorno van en `.env.local` (ver [`.env.example`](./.env.example)).

## Estado

**Las 9 funcionalidades del PRD (F1–F9) están implementadas y verificadas**: autenticación,
catálogo, alta asistida por Google Books + escáner, estados de lectura, reseñas, citas,
lista de deseos, préstamos, búsqueda/filtros, PWA instalable y exportación a CSV.

Falta **desplegar** para poder usarla desde el celular — ver [`DEPLOY.md`](./DEPLOY.md).
