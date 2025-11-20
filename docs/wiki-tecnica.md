# Wiki Técnica

## Arquitectura del Sistema

- Frontend SPA en `React + TypeScript` con `Vite` y `TailwindCSS`.
- Backend administrado por `Supabase` (PostgREST, Auth, Storage, SQL migrations y RLS).
- Cliente Supabase inicializado en `src/lib/supabase.ts:1–25` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Principales módulos:
  - `Dashboard` operativo (`src/components/Dashboard.tsx:75–90`).
  - Gestión de clientes y mascotas (`src/components/ClientesMascotas.tsx:72–114`).
  - Reservas y protocolos por mascota (`src/components/Reservas.tsx:880–899`, `src/components/Reservas.tsx:1142–1216`).
  - Finanzas y transacciones (`src/components/Finanzas.tsx`).
  - Calendario (`src/components/CalendarioReservas.tsx`).
  - Portal/Barra de autenticación (`src/components/PortalCliente.tsx:1–26`, `src/components/AuthBar.tsx:1–20`).

### Diagrama de Componentes (ASCII)

```
[React SPA]
  ├─ App.tsx → Router/Views
  │   ├─ Dashboard
  │   ├─ ClientesMascotas
  │   ├─ MascotasDashboard
  │   ├─ Reservas
  │   ├─ Finanzas
  │   ├─ CalendarioReservas
  │   └─ Notificaciones/AuthBar/PortalCliente
  └─ NotificationContext

[Supabase]
  ├─ Auth (email+password)
  ├─ PostgREST (RLS policies)
  ├─ Storage (fotos mascotas)
  └─ SQL Migrations (versionado)
```

## Stack Tecnológico

- `React` `^18.3.1`
- `TypeScript` `^5.5.3`
- `Vite` `^5.4.2`
- `TailwindCSS` `^3.4.1` + `postcss` `^8.4.35` + `autoprefixer` `^10.4.18`
- `@supabase/supabase-js` `^2.57.4`
- UI libs: `@heroicons/react` `^2.2.0`, `lucide-react` `^0.344.0`, `@fullcalendar/*` `^6.1.19`
- Linter: `eslint` `^9.9.1` + `@eslint/js`, `typescript-eslint` `^8.3.0`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

Referencias: `package.json:1–42`.

## Configuraciones de Entorno

- Variables requeridas:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Cliente: `src/lib/supabase.ts:1–25` valida presencia y lanza error si faltan.
- Supabase local: `supabase/config.toml:1–20` (puertos de `studio`, `api`, `db`, `pooler`, `inbucket`).
- Git ignore: `.env` está ignorado (`.gitignore:1–26`).

## Flujos de CI/CD

- Estado actual: no hay pipelines definidos en repo.
- Recomendado (GitHub Actions):
  - Job de `lint` y `typecheck`:
    - `npm ci`
    - `npm run typecheck`
    - `npm run lint`
  - Job de build: `npm run build` con `node 20`.
  - Job de Supabase migrations (preview): ejecutar `supabase migration validate` en PR.
  - Job de deploy (staging/prod): publicar artefacto y aplicar migraciones en entorno administrado.

## Guía de Instalación y Configuración Local

- Requisitos:
  - Node.js 20+
  - NPM
  - Cuenta Supabase (o instancia local)
- Pasos:
  - `npm install`
  - Crear `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
  - `npm run dev` para levantar `Vite`.
  - Opcional: levantar Supabase local y aplicar migraciones `supabase/migrations/*`.

## Estándares de Código y Convenciones

- TypeScript: tipos fuertes a través de `src/lib/database.types.ts:1–884`.
- Estructura de carpetas:
  - `src/components` para vistas y UI.
  - `src/lib` para clientes y tipos.
  - `supabase/migrations` para DDL/RLS.
- Lint: `npm run lint` (ESLint 9). Reglas: hooks y refresh.
- Estilos: `TailwindCSS` utilitario.
- Datos:
  - Acceso vía `supabaseAdmin` alias a `supabase` en frontend (`src/lib/supabase.ts:1–25`).
  - RLS define permisos por tabla (migraciones `20251118160000_secure_rls_policies.sql`, `20251118174000_definitive_rls_policies.sql`).