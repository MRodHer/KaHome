# Wiki Comercial

## Propuesta de Valor

- Plataforma integral para pensiones/guarderías de mascotas que centraliza clientes, mascotas, reservas, protocolos de alimentación/cuidados y finanzas.
- Soporta reservas multi-mascota en una sola operación, con configuración específica por mascota (protocolo, pertenencias y notas) (`src/components/Reservas.tsx:1142–1216`, `src/components/Reservas.tsx:880–899`).

## Público Objetivo y Casos de Uso

- Negocios de hospedaje canino/felino, veterinarias con servicio de guardería y hoteles de mascotas.
- Casos de uso:
  - Gestión de clientes y fichas de mascotas (datos, raza, vacunas, foto).
  - Reservas por fechas con cálculo automático por peso/servicio.
  - Protocolos de alimentación y cuidados especiales por mascota.
  - Cierre de reserva y registros financieros.

## Modelo de Negocio y Estrategia Comercial

- Posibles modelos:
  - Suscripción mensual por sede/usuarios.
  - Tarifa por reserva activa.
  - Add-ons premium (reportes avanzados, integración pagos online, portal cliente).
- Estrategia:
  - Pilotos con 2–3 pensiones para validación.
  - Enfoque en bioseguridad y trazabilidad de cuidados como diferenciador.

## Ventajas Competitivas

- Reserva multi-mascota con configuración granular por mascota.
- Integración directa con Supabase (Auth, PostgREST, RLS, Storage).
- Tipado fuerte del esquema para minimizar errores (`src/lib/database.types.ts`).
- UI moderna con `React + Vite + Tailwind` y calendarios (`@fullcalendar/*`).

## Roadmap de Producto

- Corto plazo:
  - Pulir flujo de cierre de reservas y conciliación de pertenencias (`src/components/Reservas.tsx:423–438`).
  - Reportes operativos por ubicación.
- Medio plazo:
  - Portal de cliente completo (autogestión de reservas y pagos).
  - Pasarela de pago e integración facturación.
  - Alertas y notificaciones push.
- Largo plazo:
  - Multi-sede, roles avanzados y auditoría.
  - APIs públicas para partners.