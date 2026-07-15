# Poner BookiDesk en producción

Checklist para publicar la app y usarla desde el celular. El código ya está listo;
esto son pasos de cuentas y configuración que hace **Laura** (implican credenciales).

## 1. Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) con tu cuenta y elige **Add New → Project**.
2. Importa el repo **`pruebavenadigital-stack/Bookidesk`**. Vercel detecta Next.js solo.
3. En **Environment Variables**, agrega las tres (los valores están en tu `.env.local`):

   | Variable | Notas |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | La URL del proyecto de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La clave *publishable* (es pública por diseño; RLS protege los datos) |
   | `GOOGLE_BOOKS_API_KEY` | **Solo servidor** — sin el prefijo `NEXT_PUBLIC_`, para que no llegue al navegador |

4. **Deploy**. Quedará en `https://<algo>.vercel.app` (puedes ponerle un dominio propio después).

> ⚠️ La clave de Google Books **es obligatoria en producción**: sin ella, Google
> responde 429 desde los servidores de Vercel y la búsqueda solo funcionaría con
> Open Library (el respaldo).

## 2. Configurar Supabase para el dominio nuevo

En el panel de Supabase → **Authentication → URL Configuration**:

- **Site URL**: la URL de Vercel.
- **Redirect URLs**: agrega `https://TU-DOMINIO/auth/confirm` — sin esto, el enlace de
  recuperación de contraseña no funciona.

En **Authentication → Providers → Email**: confirma que **"Enable sign ups" está apagado**
(la app no tiene registro público; las cuentas se crean a mano — PRD §5.1).

## 3. Correo de recuperación (recomendado)

El SMTP por defecto de Supabase tiene límites bajos y a veces no entrega. Para que
"¿Olvidaste tu contraseña?" sea confiable, configura un SMTP propio en
**Project Settings → Authentication → SMTP Settings** (Resend, Brevo o Gmail sirven).

## 4. Crear las cuentas del hogar

En Supabase → **Authentication → Users → Add user**:

1. Correo + contraseña temporal, y marca **Auto Confirm User**.
2. Repite por cada miembro de la casa.
3. Al primer ingreso, cada quien entra a **Editar perfil** y pone su nombre y color.
   (El perfil se crea solo gracias al trigger `handle_new_user`.)

## 5. Limpieza antes de estrenar

- **Borrar el usuario de prueba** `test@bookidesk.local` (Authentication → Users → Delete).
  Los libros que agregó se conservan; solo queda sin autor el registro de "quién lo agregó".
- Revisa los libros de prueba en la biblioteca y bórralos desde la app si no los quieres.

## 6. Instalar la app en el celular

Con la app abierta en el navegador del celular (ya en HTTPS):

- **iPhone (Safari)**: Compartir → *Añadir a pantalla de inicio*.
- **Android (Chrome)**: menú ⋮ → *Instalar aplicación*.

Quedará con el ícono del libro y abrirá en pantalla completa. **La cámara (portadas y
escáner de código de barras) solo funciona en HTTPS**, así que hasta este punto no se
podía probar de verdad.

## 7. Prueba de estreno (sugerida)

1. Inicia sesión en el celular con tu cuenta real.
2. **Escanea el código de barras** de un libro que tengas a mano → debe precargarse solo.
3. Guárdalo, márcalo como leído y déjale una reseña con estrellas.
4. Exporta el CSV (menú del avatar → *Exportar biblioteca*) para tener tu primer respaldo.
