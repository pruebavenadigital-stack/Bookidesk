# BookiDesk — Documento de Requisitos del Producto (PRD)

| Campo | Valor |
|---|---|
| Producto | BookiDesk — Gestión de la biblioteca del hogar |
| Versión del documento | 1.0 |
| Fecha | 12 de julio de 2026 |
| Propietaria del producto | Laura Salazar |
| Estado | Aprobado para desarrollo |

---

## 1. Visión del producto

BookiDesk es una aplicación web responsive para gestionar la biblioteca física de un hogar. Centraliza en un solo lugar todos los libros de la casa y permite saber en todo momento: qué libros tenemos, cuáles ya se leyeron, cuáles están pendientes, qué opinamos de cada uno, qué libros queremos comprar y qué libros están prestados y a quién.

Es una aplicación **compartida entre los miembros del hogar**: todos ven y gestionan la misma biblioteca (no hay bibliotecas individuales). Cada miembro tiene su propia cuenta para que las reseñas y calificaciones queden firmadas por quien las escribió.

### 1.1 Problema que resuelve

- No hay un inventario centralizado de los libros de la casa: se compran libros repetidos o se olvida qué se tiene.
- No queda registro de la opinión sobre los libros leídos, lo que dificulta recomendar.
- Los libros prestados se olvidan y no vuelven.
- Los libros que se quieren comprar se anotan en lugares dispersos (notas, fotos sueltas, memoria).

### 1.2 Principio rector de la experiencia

**Agregar un libro debe tomar segundos, no minutos.** El flujo principal de alta usa búsqueda automática de metadatos (Google Books); el ingreso manual y la foto propia son caminos de respaldo. Si agregar libros es lento, la app se abandona.

---

## 2. Objetivos y no-objetivos

### 2.1 Objetivos

1. Inventario completo y compartido de los libros del hogar, con portada, autor y datos básicos.
2. Clasificación por estado de lectura: pendiente, leyendo, leído, abandonado.
3. Calificación con estrellas y reseña personal por cada miembro del hogar, para apoyar recomendaciones.
4. Lista de deseos (libros por comprar) con foto y título, con conversión a biblioteca en un clic.
5. Registro de préstamos: a quién se prestó cada libro, cuándo, y su historial.
6. Uso cómodo desde el celular (responsive + instalable como PWA) y desde el computador.

### 2.2 No-objetivos (decisiones explícitas de la propietaria)

Estas exclusiones son deliberadas y no deben implementarse:

- **No** se registran fechas de inicio y fin de lectura, ni estadísticas de ritmo lector.
- **No** hay recordatorios ni notificaciones de préstamos vencidos.
- **No** hay ranking posicional manual (top 10 editable); la recomendación se apoya solo en las estrellas y en vistas ordenadas por calificación.
- **No** hay bibliotecas separadas por usuario: la base de datos es una sola, compartida por el hogar.
- **No** hay funciones sociales (compartir públicamente, seguir a otros lectores, etc.).
- **No** se requiere modo offline completo en la primera versión (la PWA requiere conexión).
- **No** hay registro público de usuarios: las cuentas se crean manualmente (ver §5.1).

---

## 3. Usuarios

| Perfil | Descripción |
|---|---|
| Miembro del hogar | Persona con cuenta en la app. Todos los miembros tienen exactamente los mismos permisos: pueden agregar, editar y eliminar libros, gestionar préstamos y la lista de deseos. No hay roles jerárquicos ni administrador funcional dentro de la app. |
| Prestatario (externo) | Persona a la que se le presta un libro (amigo, familiar). **No tiene cuenta**: se registra solo como texto (su nombre) dentro del préstamo. |

Escala esperada: 2 a 6 usuarios, cientos a pocos miles de libros. Esto permite priorizar simplicidad sobre optimización prematura.

---

## 4. Funcionalidades detalladas

Cada funcionalidad incluye historias de usuario (HU) y criterios de aceptación (CA).

### F1. Autenticación y cuentas

**HU-1.1** — Como miembro del hogar, quiero iniciar sesión con mi correo y contraseña para que mis reseñas queden a mi nombre.

Criterios de aceptación:
- CA-1.1: Inicio de sesión con correo + contraseña (Supabase Auth).
- CA-1.2: El registro público está deshabilitado; las cuentas se crean manualmente desde el panel de Supabase (ver §5.1). La pantalla de login no ofrece "crear cuenta".
- CA-1.3: Cada usuario tiene un perfil con nombre para mostrar y un color/avatar simple que lo identifica visualmente en reseñas y registros.
- CA-1.4: La sesión persiste entre visitas (no pedir login cada vez); opción de cerrar sesión.
- CA-1.5: Recuperación de contraseña por correo (flujo estándar de Supabase).
- CA-1.6: Ninguna pantalla de la app es accesible sin sesión iniciada.

### F2. Catálogo de libros (módulo central)

**HU-2.1** — Como miembro del hogar, quiero ver todos los libros de la casa en una sola vista para saber qué tenemos.

**HU-2.2** — Como miembro del hogar, quiero abrir un libro y ver toda su información en una ficha de detalle.

Criterios de aceptación:
- CA-2.1: Vista principal en **cuadrícula de portadas** (la biblioteca se "ve" como biblioteca) con alternativa de vista en lista. La preferencia se recuerda en el dispositivo.
- CA-2.2: Cada tarjeta muestra: portada, título, autor, estado de lectura (indicador visual) y calificación promedio en estrellas.
- CA-2.3: Insignia visible de **"Prestado"** sobre la portada cuando el libro tiene un préstamo activo.
- CA-2.4: Ficha de detalle del libro con: portada grande, título, autor, género, editorial, año, ISBN, sinopsis, etiquetas, estado de lectura, calificación promedio, todas las reseñas (con autor y fecha), estado de préstamo actual e historial de préstamos.
- CA-2.5: Desde la ficha se puede: cambiar estado de lectura, calificar/reseñar, editar datos, registrar préstamo/devolución, eliminar el libro.
- CA-2.6: Eliminar un libro pide confirmación explícita y elimina en cascada sus reseñas y préstamos.
- CA-2.7: Campos del libro: título (obligatorio), autor, ISBN, portada, género, editorial, año de publicación, sinopsis, etiquetas libres (múltiples), quién lo agregó y cuándo (automático).
- CA-2.8: La cuadrícula carga con imágenes optimizadas y scroll fluido con al menos 1.000 libros.

### F3. Agregar libros (flujo asistido por API)

**HU-3.1** — Como miembro del hogar, quiero buscar un libro por título, autor o ISBN y agregarlo con todos sus datos autocompletados, para no digitar nada a mano.

**HU-3.2** — Como miembro del hogar, quiero poder agregar un libro manualmente cuando la búsqueda no lo encuentre (libros raros, ediciones locales, libros artesanales).

Criterios de aceptación:
- CA-3.1: Buscador integrado contra **Google Books API**: al escribir título/autor/ISBN muestra resultados con portada, título, autor y año para elegir el correcto.
- CA-3.2: Al seleccionar un resultado se precargan automáticamente: título, autor, ISBN, portada, editorial, año, sinopsis y género (cuando la API los provea). Todos los campos son editables antes de guardar.
- CA-3.3: Al guardar se elige el destino: **"A la biblioteca"** (con estado de lectura inicial: pendiente por defecto, o directamente leído/leyendo) o **"A la lista de deseos"**.
- CA-3.4: Camino manual: formulario vacío con los mismos campos; solo el título es obligatorio.
- CA-3.5: La portada puede provenir de: (a) la API automáticamente — camino principal; (b) foto tomada con la cámara del celular; (c) imagen subida desde el dispositivo. Los caminos (b) y (c) son respaldo, no el flujo principal.
- CA-3.6: Las imágenes propias se almacenan en Supabase Storage y se comprimen/redimensionan en el cliente antes de subir (máx. ~1200 px de alto) para no agotar almacenamiento.
- CA-3.7: Si Google Books no responde o no tiene portada, se intenta la portada por ISBN en **Open Library Covers** como respaldo; si tampoco existe, se muestra una portada genérica generada con el título (placeholder con color + iniciales).
- CA-3.8: Detección de duplicados: si ya existe un libro con el mismo ISBN (o mismo título+autor si no hay ISBN), la app lo advierte antes de guardar ("Este libro ya está en la biblioteca / en la lista de deseos") y permite continuar solo con confirmación (puede haber dos ejemplares a propósito).

### F4. Estados de lectura

**HU-4.1** — Como miembro del hogar, quiero clasificar cada libro según si está pendiente, en lectura, leído o abandonado, para saber qué nos falta por leer.

Criterios de aceptación:
- CA-4.1: Estados posibles (aplican solo a libros de la biblioteca, no a deseados): `Pendiente por leer` · `Leyendo` · `Leído` · `Abandonado`.
- CA-4.2: El estado es **único por libro** (refleja la situación del ejemplar en la casa) y cualquier miembro puede cambiarlo. Ver decisión de diseño en §8.1.
- CA-4.3: Cambio de estado en un solo toque desde la tarjeta o la ficha del libro.
- CA-4.4: Al marcar un libro como **Leído**, la app abre inmediatamente el paso de calificación y reseña (F5). Este paso puede omitirse y completarse después.
- CA-4.5: El estado se refleja con un código visual consistente en toda la app (color/insignia por estado).

### F5. Calificaciones y reseñas

**HU-5.1** — Como miembro del hogar, quiero calificar un libro con estrellas y escribir mi percepción/crítica, para que quede guardada y sirva al recomendar.

**HU-5.2** — Como miembro del hogar, quiero ver las reseñas de los demás miembros de la casa sobre un mismo libro.

Criterios de aceptación:
- CA-5.1: Calificación de **0.5 a 5 estrellas, en pasos de media estrella**.
- CA-5.2: **Una calificación + una reseña por usuario por libro.** Cada miembro puede tener la suya; se muestran todas en la ficha con nombre del autor y fecha.
- CA-5.3: La reseña es texto libre (hasta ~5.000 caracteres), opcional. Se puede calificar sin reseñar y viceversa no aplica (la reseña siempre acompaña una calificación del mismo usuario o puede guardarse sola con calificación pendiente — regla simple: el registro admite estrellas sin texto y texto sin estrellas, pero al menos uno de los dos).
- CA-5.4: Cada usuario puede **editar o eliminar solo su propia** reseña/calificación (las ajenas se ven pero no se tocan).
- CA-5.5: En tarjetas y listados se muestra el **promedio** de las calificaciones del hogar; en la ficha se ven además las individuales.
- CA-5.6: Se puede calificar/reseñar cualquier libro de la biblioteca sin importar su estado (p. ej., un libro abandonado puede calificarse con 1 estrella y una reseña explicando por qué).
- CA-5.7: Vista **"Recomendar"**: listado de libros ordenado por calificación promedio descendente, filtrable por género, pensado para responder rápido "¿qué me recomiendas?".

### F6. Lista de deseos (libros por comprar)

**HU-6.1** — Como miembro del hogar, quiero anotar libros que quiero comprar, con su foto y título, para no olvidarlos.

**HU-6.2** — Como miembro del hogar, quiero pasar un libro deseado a la biblioteca cuando lo compre, sin volver a digitarlo.

Criterios de aceptación:
- CA-6.1: La lista de deseos es una **sección propia en la navegación**, visualmente separada del catálogo, pero técnicamente el libro deseado es el mismo modelo de dato con estado `Deseado` (ver §8.2).
- CA-6.2: Alta de un libro deseado por los tres caminos de F3: búsqueda en Google Books (principal), foto con cámara del celular, o imagen subida. Único campo obligatorio: título.
- CA-6.3: Campo opcional de nota libre del deseo: dónde lo vi, precio aproximado, quién lo recomendó.
- CA-6.4: Botón **"¡Ya lo compré!"** en cada libro deseado: lo convierte en libro de biblioteca con estado `Pendiente por leer`, conservando todos sus datos (incluida la foto). Es la acción principal de la tarjeta.
- CA-6.5: Los libros deseados no aparecen en el catálogo, ni en búsquedas del catálogo (salvo indicación explícita del filtro), ni pueden prestarse ni calificarse.
- CA-6.6: Un libro deseado puede eliminarse (ya no lo quiero) con confirmación.

### F7. Préstamos

**HU-7.1** — Como miembro del hogar, quiero registrar que presté un libro y a quién, para saber siempre dónde están mis libros.

**HU-7.2** — Como miembro del hogar, quiero ver el historial de préstamos de un libro.

Criterios de aceptación:
- CA-7.1: Registrar préstamo desde la ficha del libro: nombre del prestatario (texto libre, obligatorio), fecha del préstamo (por defecto hoy, editable), nota opcional.
- CA-7.2: Un libro solo puede tener **un préstamo activo** a la vez; mientras lo tenga, muestra la insignia "Prestado" y el nombre de quien lo tiene.
- CA-7.3: Acción **"Marcar devuelto"**: cierra el préstamo con la fecha de devolución (por defecto hoy, editable). El préstamo pasa al historial.
- CA-7.4: Sección **"Préstamos"** en la navegación con la lista de préstamos activos: libro, prestatario, fecha, días transcurridos (dato informativo, sin alertas ni recordatorios).
- CA-7.5: En la ficha del libro se ve el historial completo de préstamos (a quién, cuándo, cuándo volvió).
- CA-7.6: Solo se prestan libros de la biblioteca (no deseados). El estado de lectura no cambia por prestarse.
- CA-7.7: Autocompletado del nombre del prestatario con nombres usados antes (para consistencia: "Juan" vs "Juan Pérez").

### F8. Búsqueda, filtros y navegación

**HU-8.1** — Como miembro del hogar, quiero buscar y filtrar mi biblioteca para encontrar un libro o decidir qué leer.

Criterios de aceptación:
- CA-8.1: Búsqueda por texto sobre título y autor, con resultados al escribir (sin recargar página).
- CA-8.2: Filtros combinables: estado de lectura, género, etiqueta, calificación mínima, prestado sí/no.
- CA-8.3: Ordenamientos: recién agregados, título A-Z, autor A-Z, mejor calificados.
- CA-8.4: Navegación principal con 4 secciones: **Biblioteca** (catálogo), **Lista de deseos**, **Préstamos**, **Recomendar** (vista F5/CA-5.7). En móvil, barra de navegación inferior fija.
- CA-8.5: Contadores visibles: total de libros, leídos, pendientes (dan la foto general de la biblioteca).

---

## 5. Reglas de negocio y operación

### 5.1 Alta de usuarios (sin registro público)

La app es privada para el hogar. Para evitar que terceros creen cuentas:

1. El registro (sign-up) queda **deshabilitado** en Supabase Auth.
2. Los usuarios del hogar se crean manualmente desde el panel de Supabase (correo + contraseña temporal o invitación por correo).
3. Al primer ingreso, el usuario completa su perfil (nombre para mostrar y color de avatar).
4. Procedimiento documentado en el README para agregar un nuevo miembro en el futuro.

### 5.2 Matriz de permisos

| Acción | Regla |
|---|---|
| Ver todo (libros, reseñas, préstamos) | Cualquier usuario autenticado |
| Crear/editar/eliminar libros, deseos y préstamos | Cualquier usuario autenticado |
| Crear reseña/calificación | Cualquier usuario autenticado (una por libro) |
| Editar/eliminar reseña | **Solo su autor** |
| Editar perfil | Solo el dueño del perfil |
| Sin sesión | Sin acceso a ningún dato |

Estas reglas se implementan en la base de datos con **Row Level Security (RLS)** de Supabase, no solo en la interfaz.

### 5.3 Ciclo de vida de un libro

```
                    ┌──────────────┐
                    │   Deseado    │  (lista de deseos)
                    └──────┬───────┘
                           │  "¡Ya lo compré!"
                           ▼
   ┌─────────────────────────────────────────────┐
   │                 En biblioteca               │
   │                                             │
   │  Pendiente ⇄ Leyendo ⇄ Leído ⇄ Abandonado   │   (estado de lectura,
   │                                             │    libre entre estados)
   │  + Prestado / Disponible (independiente,    │
   │    derivado del préstamo activo)            │
   └─────────────────────────────────────────────┘
```

- El estado de préstamo es **ortogonal** al de lectura: un libro leído puede estar prestado.
- Un libro también puede crearse directamente "En biblioteca" sin pasar por deseado.

---

## 6. Stack tecnológico (framework y justificación)

### 6.1 Resumen del stack

| Capa | Tecnología | Rol |
|---|---|---|
| Framework web | **Next.js 15+ (App Router) con React y TypeScript** | Estructura de la app, rutas, renderizado |
| Estilos / UI | **Tailwind CSS 4 + shadcn/ui** | Diseño responsive y componentes accesibles (diálogos, formularios, menús) |
| Backend como servicio | **Supabase** | Base de datos PostgreSQL, autenticación, almacenamiento de imágenes, seguridad RLS |
| Cliente Supabase | `@supabase/supabase-js` + `@supabase/ssr` | Conexión segura desde servidor y navegador |
| Validación | **Zod** | Validación de formularios y datos |
| Metadatos de libros | **Google Books API** (principal) + **Open Library Covers** (respaldo de portadas) | Autocompletado de datos y portadas |
| PWA | Web App Manifest + service worker básico | Instalable en el celular con ícono propio |
| Imágenes propias | Compresión en el cliente (canvas) → Supabase Storage | Fotos de cámara y subidas |
| Hosting | **Vercel** (plan gratuito) | Despliegue con HTTPS (requisito para usar la cámara) |

### 6.2 Justificación de las decisiones

**¿Por qué Next.js y no una SPA simple (Vite) u otra opción?**
- Integración de primera clase con Supabase (librería oficial `@supabase/ssr`, guías oficiales, manejo correcto de sesión en servidor y cliente).
- Despliegue en Vercel en minutos, con HTTPS incluido — indispensable porque los navegadores solo permiten usar la cámara bajo HTTPS.
- Server Components y Server Actions reducen la cantidad de código de "plomería" (estados de carga, endpoints) para una app CRUD como esta.
- Optimización de imágenes integrada (`next/image`), importante para una cuadrícula con cientos de portadas.
- Es el framework React con mayor comunidad y documentación, lo que facilita mantenimiento futuro.

**¿Por qué Supabase (confirmado por la propietaria)?**
- Una sola base PostgreSQL compartida encaja exactamente con el requisito de "biblioteca del hogar, no bibliotecas individuales".
- Auth incluido con manejo de usuarios desde su panel (alineado con §5.1, sin registro público).
- Storage incluido para las fotos de portadas con reglas de acceso.
- RLS permite que las reglas de permisos (§5.2) vivan en la base de datos: aunque hubiera un error en la interfaz, los datos quedan protegidos.
- Plan gratuito suficiente para la escala del proyecto (500 MB de base de datos, 1 GB de storage).

**¿Por qué Google Books API?**
- Gratuita y sin autenticación para búsquedas básicas de volúmenes.
- Devuelve título, autores, ISBN, portada, editorial, fecha, categorías y sinopsis en una sola llamada.
- Buen catálogo en español. Open Library queda como respaldo de portadas por ISBN porque su cobertura de portadas complementa la de Google.

**¿Por qué PWA y no app nativa/tiendas?**
- La cámara funciona desde el navegador (`<input type="file" capture="environment">`) sin permisos especiales ni publicación en App Store / Play Store.
- Un solo código para computador y celular.
- Instalable en la pantalla de inicio del teléfono con ícono y pantalla completa.

### 6.3 Estructura de carpetas prevista

```
bookidesk/
├── app/                        # Rutas (App Router)
│   ├── (auth)/login/           # Login (fuera del layout principal)
│   ├── (app)/                  # Layout autenticado con navegación
│   │   ├── biblioteca/         # Catálogo + ficha de libro ([id])
│   │   ├── deseos/             # Lista de deseos
│   │   ├── prestamos/          # Préstamos activos
│   │   ├── recomendar/         # Vista ordenada por calificación
│   │   └── agregar/            # Flujo de alta (búsqueda API / manual)
│   └── api/books/search/       # Proxy a Google Books (evita CORS y centraliza)
├── components/                 # Componentes UI (tarjetas, estrellas, formularios)
├── lib/
│   ├── supabase/               # Clientes browser/server, tipos generados
│   ├── google-books.ts         # Cliente de la API de libros
│   └── images.ts               # Compresión de imágenes en cliente
├── supabase/
│   └── migrations/             # SQL versionado del esquema
└── public/                     # Manifest PWA, íconos
```

---

## 7. Modelo de datos

### 7.1 Diagrama de entidades

```
profiles (miembros del hogar)
    │ 1
    │
    │ N                    N │ 1
reviews ────────► books ◄──────── loans
(reseña+estrellas   (libro único:      (préstamos e
 por usuario)        biblioteca o       historial)
                     deseado)
```

### 7.2 Esquema SQL (PostgreSQL / Supabase)

```sql
-- Perfiles: uno por miembro del hogar, ligado a Supabase Auth
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_color text not null default '#6366f1',
  created_at   timestamptz not null default now()
);

-- Libros: modelo único para biblioteca y lista de deseos
create table books (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  author         text,
  isbn           text,
  cover_url      text,              -- URL de API o de Supabase Storage
  genre          text,
  publisher      text,
  published_year int,
  synopsis       text,
  tags           text[] not null default '{}',
  status         text not null default 'owned'
                 check (status in ('owned', 'wishlist')),
  reading_status text
                 check (reading_status in
                        ('pendiente', 'leyendo', 'leido', 'abandonado')),
  wishlist_note  text,              -- dónde lo vi / precio / quién lo recomendó
  added_by       uuid references profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- un deseado no tiene estado de lectura; un libro en biblioteca sí
  constraint reading_status_matches_status check (
    (status = 'wishlist' and reading_status is null) or
    (status = 'owned'    and reading_status is not null)
  )
);

-- Reseñas y calificaciones: una por usuario por libro
create table reviews (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references books(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  rating      numeric(2,1)
              check (rating >= 0.5 and rating <= 5 and (rating * 2) = floor(rating * 2)),
  review_text text check (char_length(review_text) <= 5000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (book_id, user_id),
  -- al menos estrellas o texto
  constraint rating_or_text check (rating is not null or review_text is not null)
);

-- Préstamos: activo = returned_at IS NULL; el resto es historial
create table loans (
  id            uuid primary key default gen_random_uuid(),
  book_id       uuid not null references books(id) on delete cascade,
  borrower_name text not null,
  loaned_at     date not null default current_date,
  returned_at   date,
  notes         text,
  created_by    uuid references profiles(id) on delete set null,
  constraint returned_after_loaned check (returned_at is null or returned_at >= loaned_at)
);

-- Máximo un préstamo activo por libro
create unique index one_active_loan_per_book
  on loans (book_id) where returned_at is null;

-- Índices de consulta frecuente
create index books_status_idx  on books (status, reading_status);
create index books_title_idx   on books using gin (to_tsvector('spanish', title || ' ' || coalesce(author, '')));
create index reviews_book_idx  on reviews (book_id);
create index loans_book_idx    on loans (book_id);
```

### 7.3 Políticas RLS (resumen)

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | autenticados | el propio usuario | el propio usuario | — |
| `books` | autenticados | autenticados | autenticados | autenticados |
| `reviews` | autenticados | autenticados (con `user_id = auth.uid()`) | solo autor | solo autor |
| `loans` | autenticados | autenticados | autenticados | autenticados |

Storage: bucket `covers` — lectura para autenticados, escritura para autenticados, tamaño máximo por archivo 2 MB.

### 7.4 Datos derivados (no se almacenan)

- **Calificación promedio del libro** = promedio de `reviews.rating` (calculado en consulta o vista).
- **Libro prestado** = existe `loan` con `returned_at IS NULL`.
- **Contadores del tablero** (total, leídos, pendientes) = agregaciones sobre `books`.

---

## 8. Decisiones de diseño documentadas

### 8.1 Estado de lectura único por libro (no por usuario)

**Decisión:** el estado de lectura (`pendiente/leyendo/leido/abandonado`) es una propiedad del libro, compartida por el hogar; cualquier miembro lo cambia.

**Razón:** mantiene la app simple y coincide con el modelo mental de "control de los libros de la casa". La dimensión individual (que dos personas opinen distinto del mismo libro) se cubre con las **reseñas y calificaciones por usuario** (F5), que es donde la opinión personal realmente importa.

**Alternativa descartada:** estado de lectura por usuario. Se descartó por duplicar la complejidad de interfaz y base de datos con poco beneficio para el caso de uso doméstico. Si más adelante se necesitara, la tabla `reviews` ya identifica quién leyó qué, y se podría evolucionar.

### 8.2 La lista de deseos comparte el modelo de datos del catálogo

Un libro deseado es un registro de `books` con `status = 'wishlist'`. Beneficio directo: el botón "¡Ya lo compré!" es un simple cambio de estado que conserva foto, título y notas, sin duplicar ni migrar datos. En la interfaz sí son secciones separadas (requisito de la propietaria).

### 8.3 Sin campo de "ranking" adicional

La recomendación se resuelve con la vista "Recomendar" ordenada por promedio de estrellas (CA-5.7). No existe ningún dato de posición manual.

---

## 9. Requisitos no funcionales

| Categoría | Requisito |
|---|---|
| Responsive | Diseño mobile-first; usable desde 360 px de ancho hasta escritorio. Navegación inferior en móvil, lateral/superior en escritorio. |
| PWA | Instalable (manifest + íconos + service worker mínimo). Requiere conexión (sin modo offline en v1). |
| Idioma | Toda la interfaz en **español**. |
| Rendimiento | Carga inicial de la biblioteca < 3 s en 4G; imágenes lazy-load y optimizadas; búsqueda local sin recarga. |
| Seguridad | RLS activo en todas las tablas; claves de servicio nunca en el cliente; acceso solo autenticado; HTTPS obligatorio. |
| Privacidad | Datos visibles solo para los miembros del hogar. Sin analítica de terceros. |
| Respaldo | Exportación de la biblioteca a CSV desde la app (fase 2) + respaldos automáticos de Supabase. |
| Costo | Objetivo costo $0/mes: planes gratuitos de Vercel y Supabase son suficientes para la escala del hogar. |
| Compatibilidad | Últimas 2 versiones de Chrome, Safari (iOS incluido), Edge y Firefox. |

---

## 10. Plan de implementación por fases

### Fase 0 — Fundaciones
- Crear proyecto Next.js + Tailwind + shadcn/ui.
- Crear proyecto Supabase; aplicar esquema SQL y políticas RLS; crear bucket `covers`.
- Autenticación completa (login, sesión, perfiles, recuperación de contraseña); crear cuentas del hogar.
- Layout base con navegación responsive (4 secciones).

### Fase 1 — Catálogo y alta de libros (el corazón)
- Búsqueda en Google Books + formulario de alta con precarga y edición.
- Alta manual; foto con cámara / subida de imagen con compresión; respaldo Open Library; placeholder de portada.
- Cuadrícula y lista del catálogo; ficha de detalle; edición y eliminación; detección de duplicados.
- Estados de lectura con cambio rápido.

### Fase 2 — Opiniones y deseos
- Calificación con medias estrellas + reseñas por usuario; promedios; flujo "al marcar Leído".
- Vista "Recomendar".
- Lista de deseos completa con "¡Ya lo compré!".
- Búsqueda, filtros, ordenamientos y contadores.

### Fase 3 — Préstamos y cierre
- Registro de préstamos, devoluciones, historial, sección de préstamos activos, insignias.
- PWA (manifest, íconos, instalación).
- Exportación CSV.
- Despliegue en Vercel con dominio, pruebas en celulares del hogar, carga inicial de libros reales.

**Criterio de terminado de cada fase:** funcionalidad usable de punta a punta desde un celular real, con datos en Supabase.

---

## 11. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Google Books no encuentra libros (ediciones locales/antiguas) | Alta manual frecuente | Camino manual pulido + respaldo Open Library + placeholder digno |
| Límites de tasa de Google Books (sin API key) | Búsqueda falla esporádicamente | Proxy propio con caché corto; opción de agregar API key gratuita si se vuelve frecuente |
| Carga inicial de la biblioteca existente es tediosa | Abandono antes de empezar | El flujo de alta debe permitir agregar un libro en <15 s; sesión de carga asistida al estrenar la app |
| Fotos pesadas llenan el storage gratuito | Costo o bloqueo | Compresión obligatoria en cliente + límite 2 MB en bucket |
| Contraseñas olvidadas en un sistema sin registro público | Usuario bloqueado | Flujo de recuperación por correo habilitado desde el día 1 |

---

## 12. Glosario

- **Biblioteca / Catálogo:** conjunto de libros físicos que la casa posee (`status = owned`).
- **Deseado:** libro que se quiere comprar (`status = wishlist`).
- **Préstamo activo:** préstamo sin fecha de devolución.
- **PWA:** aplicación web instalable en el teléfono como si fuera una app.
- **RLS:** reglas de seguridad a nivel de fila en PostgreSQL; garantizan permisos aunque falle la interfaz.
