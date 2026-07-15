# BookiDesk — Memoria del proyecto

> Contexto esencial para trabajar en este repo sin tener que redescubrirlo.
> Se carga automáticamente en cada sesión (vía `CLAUDE.md`). Mantenlo al día:
> si tomas una decisión o descubres un gotcha, escríbelo aquí.

## Qué es

App web (PWA) para gestionar la **biblioteca física del hogar** de Laura Salazar.
Multiusuario con **base de datos compartida**: todos ven y gestionan la misma
biblioteca; lo personal son las reseñas (firmadas por su autor). Interfaz **100 % en español**.

**Fuentes de verdad:**
- [`PRD.md`](./PRD.md) — requisitos (F1–F9), criterios de aceptación, modelo de datos, decisiones (§8).
- [`design-system/`](./design-system/) — tokens de marca + el diseño original (`source/`).
- Este archivo — el mapa y los porqués.

## Estado

| Fase | Estado | Qué entregó |
|---|---|---|
| 0 — Fundaciones | ✅ | Scaffold, marca, Supabase, auth (F1), navegación (F8), intro animada |
| 1 — Catálogo y alta | ✅ | Alta con Google Books + escáner, portadas, catálogo (F2), ficha, estados (F4) |
| 2 — Opiniones y deseos | ✅ | Reseñas (F5), citas (F9), deseos (F6), Recomendar, búsqueda/filtros (F8) |
| 3 — Préstamos y cierre | ✅ | Préstamos (F7), PWA instalable, exportar CSV |

**Las 9 funcionalidades del PRD (F1–F9) están implementadas y verificadas.**
Falta solo **desplegar**: ver [`DEPLOY.md`](./DEPLOY.md) (requiere la cuenta de Vercel de Laura).

## ⚠️ Stack real: Next.js **16** (no 15)

`AGENTS.md` avisa que Next 16 rompe convenciones. Los cambios que ya nos afectaron
(documentados en `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`):

| Cambio | Cómo está resuelto aquí |
|---|---|
| `middleware.ts` → **`proxy.ts`** (función `proxy`, runtime nodejs) | [`proxy.ts`](./proxy.ts) en la raíz |
| `cookies()`, `params`, `searchParams` son **async** | Siempre `await` (ver `lib/supabase/server.ts`, `biblioteca/[id]/page.tsx`) |
| `images.domains` → **`images.remotePatterns`** | [`next.config.ts`](./next.config.ts): books.google.com, covers.openlibrary.org, supabase |
| Turbopack por defecto; `next lint` eliminado | Scripts estándar; ESLint flat config |

Otros: React 19.2 · Tailwind **4** (CSS-first, sin `tailwind.config`) · shadcn/ui estilo **`radix-nova`** (iconos lucide).

## Mapa del código

```
app/
  (auth)/{login,recuperar,actualizar-clave}/   Login sin registro público, recuperación
  (app)/                                       Layout autenticado (nav + intro gate)
    biblioteca/          Catálogo · biblioteca/[id] = ficha (reseñas, citas, sinopsis)
    deseos/ prestamos/ recomendar/ agregar/ perfil/
  api/books/search/      Proxy a Google Books (oculta la clave, exige sesión)
  auth/confirm/          Verifica el enlace del correo (recuperación)
lib/
  supabase/{client,server,middleware}.ts  Clientes SSR + helper de sesión
  supabase/database.types.ts              Tipos generados (regenerar tras cambios de schema)
  supabase/types.ts                       Alias (Book, Profile…) + labels/colores de estado
  actions/{auth,books,reviews,quotes}.ts  Server Actions (mutaciones)
  books/{queries,schema}.ts               Consultas (server) + validación Zod
  book-metadata.ts                        Google Books + Open Library (searchBooks, lookupByIsbn)
  images.ts                               Compresión canvas + subida al bucket covers
  anim.ts                                 Easing/animate/interpolate (para la intro)
components/
  book/      Tarjetas, portada, estrellas, estado, reseñas, citas, filtros
  add/       Flujo de alta (búsqueda → formulario → destino)
  scanner/   Escáner EAN-13 con ZXing
  intro/     Intro animada (port del diseño) + gate por sesión
  nav/ auth/ profile/ ui/(shadcn)
supabase/migrations/   SQL versionado (espejo de lo aplicado en la nube)
```

## Base de datos (Supabase)

- Proyecto: **`lpjvsdytgfunfactsxwd`** (org propia, separada de VenaDigital). PostgreSQL 17.
- Tablas: `profiles`, `books`, `reviews`, `loans`, `quotes` — **todas con RLS**.
- **`books` es un solo modelo** para biblioteca y deseos: `status = 'owned' | 'wishlist'`
  (§8.2 del PRD). Por eso "¡Ya lo compré!" es solo un cambio de estado que conserva los datos.
- `reading_status` (pendiente/leyendo/leido/abandonado) es **único por libro**, no por usuario (§8.1).
- Reseñas: **una por usuario por libro** (`unique(book_id,user_id)`), editable solo por su autor.
- Citas: **contenido compartido** — cualquiera edita/borra, con autoría informativa (§8.4).
- Préstamo activo = `loans.returned_at IS NULL` (hay índice único: 1 activo por libro).
- Trigger `handle_new_user` crea el perfil al dar de alta un usuario en Auth.
- Bucket **`covers`**: público de lectura, escritura solo autenticados, máx. 2 MB.
- **Advisor**: los warnings `rls_policy_always_true` en `books`/`loans`/`quotes` son
  **intencionales** (biblioteca compartida: cualquier autenticado hace CRUD). No "arreglarlos".
- Regenerar tipos tras cambiar el schema: MCP de Supabase → `generate_typescript_types`.

## Marca y diseño

Estética **biblioteca clásica / academia**. Tokens en [`app/globals.css`](./app/globals.css)
(derivados de `design-system/tokens.css`, convención shadcn + Tailwind 4).

- Vino `#722033` · Dorado `#D4A94E` · Crema `#F6EFE0` · Pizarra `#23374D`
- Fuentes: **Space Grotesk** (display) · **Inter** (cuerpo) · **JetBrains Mono** (ISBN/datos)
- **Decisión clave:** en tema **claro manda el vino** como `primary`; en **oscuro manda el dorado**
  (como el logo). El dorado *como texto* sobre claro usa `--gold-text` (#A5813A) por contraste.
- Tokens de estado: `--status-pending/reading/read/abandoned/loaned` → insignias consistentes.
- La **intro animada** (`components/intro/`) es un port del diseño original; se muestra
  **1 vez por sesión** (gate por `sessionStorage`) y respeta `prefers-reduced-motion`.

## APIs externas

- **Google Books** = principal. La clave vive en `GOOGLE_BOOKS_API_KEY` (`.env.local`, **solo servidor**).
  ⚠️ **Sin clave devuelve 429 desde IPs de datacenter** (proyecto anónimo compartido) — o sea,
  fallaría en Vercel. También tiene **503 intermitentes** ocasionales.
- **Open Library** = respaldo, sin clave, y aguanta bien. `lib/book-metadata.ts` cae solo a él
  cuando Google falla o no hay clave. Esta resiliencia **ya se probó en vivo**.
- **Escáner**: los libros traen **EAN-13, que ES el ISBN** (no QR). ZXing; requiere HTTPS o localhost.

## Convenciones

- Mutaciones → **Server Actions** en `lib/actions/*`; devuelven `{ ok }` / `{ error }` (nunca lanzan al usuario).
- Lecturas → funciones en `lib/books/queries.ts` (crean su propio client de servidor).
- Validación con **Zod** en `lib/books/schema.ts`; validar también en el servidor, no solo en la UI.
- Datos derivados **no se guardan**: promedio de estrellas y "prestado" se calculan al consultar.
- Todo el texto visible, en español (incluidos toasts y errores).
- Tras mutar, `revalidatePath` de las rutas afectadas.

## Cómo correr y verificar

```bash
npm run dev      # o preview_start con el nombre "bookidesk" (.claude/launch.json, puerto 3000)
npm run build    # verificación rápida de tipos + rutas: correrlo antes de cerrar cada fase
```

- Existe un **usuario de prueba desechable** (`test@bookidesk.local`) creado por SQL para verificar.
  **Borrarlo antes de producción.** Para crear otro (sin registro público), vía SQL en Supabase:
  inserta en `auth.users` con `extensions.crypt('CLAVE_TEMPORAL', extensions.gen_salt('bf'))`
  + la fila correspondiente en `auth.identities`.
- **Gotcha de automation:** el navegador automatizado **no dispara submits de formularios React**
  con clic → usar `form.requestSubmit()`. Los clics en botones y opciones normales sí funcionan.
  El `read_page` justo tras `navigate` a veces da "empty/0x0": un screenshot lo despierta.

## Exclusiones deliberadas — NO implementar

Decisiones explícitas de Laura (PRD §2.2). No "mejorar" agregándolas:

- ❌ Fechas de inicio/fin de lectura ni estadísticas de ritmo lector
- ❌ Recordatorios o notificaciones de préstamos vencidos
- ❌ Ranking posicional manual (la recomendación sale del promedio de estrellas)
- ❌ Bibliotecas separadas por usuario
- ❌ Funciones sociales · ❌ Modo offline en v1 · ❌ Registro público de usuarios

## Pendiente de Laura (no lo puede hacer el agente)

- **Cuentas reales del hogar**: se crean a mano en el panel de Supabase (sin registro público, §5.1).
- **SMTP en Supabase** para los correos de recuperación (el default tiene límites).
- **Vercel** (Fase 3): su cuenta + conectar el repo; las variables de entorno se configuran juntos.
- Confirmar que el **registro público está deshabilitado** en Supabase Auth.

## Repo

`https://github.com/pruebavenadigital-stack/Bookidesk` (rama `main`).
El equipo hace push con la cuenta `venadigital`, que es **colaboradora** del repo
(propiedad de `pruebavenadigital-stack`). Si aparece un 403 al empujar, es por eso.
