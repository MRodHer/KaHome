# Wiki Funcional

## Manual de Usuario

- Inicio de sesión (`src/components/PortalCliente.tsx:1–26`, `src/components/AuthBar.tsx:1–20`).
- Vistas principales desde `App` (`src/App.tsx:117–150`):
  - `Dashboard`: estado de protocolos y reservas.
  - `Clientes y Mascotas`: creación/edición, foto y datos.
  - `Reservas`: gestión de reservas, protocolos por mascota, servicios extra.
  - `Finanzas`: transacciones y conciliaciones.
  - `Calendario`: agenda visual.

## Funcionalidades Detalladas

- Clientes/Mascotas:
  - CRUD de clientes y mascotas, con foto en Storage.
  - Campos de protocolos y cuidados especiales en mascotas (`src/components/EditMascotaModal.tsx:416–440`).
- Reservas:
  - Alta de reserva por rango de fechas, servicio y ubicación.
  - Modo multi-mascota: notas, pertenencias y protocolo por cada mascota (`src/components/Reservas.tsx:1142–1216`).
  - Persistencia individual por mascota (`src/components/Reservas.tsx:880–899`).
  - Servicios extra asociados a la reserva.
  - Cierre de reserva con registro de pertenencias entregadas/devueltas (`src/components/Reservas.tsx:423–438`).
- Finanzas:
  - Registro de movimientos vinculados a reservas y ubicaciones (`src/lib/database.types.ts:669–722`).

## Flujos Principales

- Crear Reserva Multi-mascota:
  - Selecciona cliente y múltiples mascotas.
  - Configura por mascota: protocolo, pertenencias y notas.
  - Distribuye anticipo proporcionalmente y confirma.
  - Se crean reservas separadas por mascota.
- Cerrar Reserva:
  - Revisa costos, pertenencias entregadas y devueltas.
  - Actualiza y cierra con estado.

## Requisitos del Sistema y Compatibilidades

- Navegador moderno (Chrome/Firefox/Edge).
- Node.js 20+ para desarrollo.
- Cuenta Supabase y claves válidas.

## Limitaciones Conocidas y Workarounds

- Errores de TypeScript en `src/pages/ClientesMascotas.tsx` por código experimental sin tipado estricto; se recomienda migrar a componentes estables en `src/components/ClientesMascotas.tsx`.
- Caché de esquema en PostgREST: se incluye migración `reload_postgrest_cache.sql` (`supabase/migrations/20251120093000_reload_postgrest_cache.sql`).
- Operaciones privilegiadas en frontend usan alias `supabaseAdmin = supabase` por RLS; en producción, migrar a Edge Functions cuando se requiera servicio key.