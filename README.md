# KaHome – Gestión de Pensión y Guardería para Mascotas

KaHome es una aplicación web para administrar clientes, mascotas, reservas y finanzas de un negocio de pensión/guardería para mascotas. Está construida con React + TypeScript (Vite) y usa Supabase como backend (Base de datos, Auth y REST).

## Objetivos

- Registrar y mantener información de clientes y sus mascotas.
- Administrar reservas de servicios (pensión, guardería, baño, etc.).
- Llevar control de protocolos de cuidado y alimentación de cada mascota.
- Gestionar catálogos (razas, alimentos) y tarifas.
- Contar con un flujo de cierre de reservas y registros financieros.

## Stack Tecnológico

- Frontend: React 18 + TypeScript + Vite
- Estilos: Tailwind CSS
- Backend: Supabase (Postgres, Auth, PostgREST, Storage)
- Herramientas: Supabase CLI, Git

## Estructura de Carpetas (resumen)

- `src/` código del frontend
  - `components/` componentes principales (Clientes, Mascotas, Reservas, Finanzas, etc.)
  - `pages/` páginas de navegación
  - `lib/` cliente de Supabase y tipos de BD
  - `context/` notificaciones
- `supabase/` configuración y migraciones de BD
  - `config.toml` proyecto local
  - `migrations/` SQL de cambios de esquema y seeds
  - `seed/` datos de carga inicial (alimentos, servicios, ubicaciones, tarifas)
- `ZipCodesMX/` scripts y datos para catálogos de códigos postales (referencial)

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

El cliente de Supabase valida estas variables en `src/lib/supabase.ts`.

## Instalación y Ejecución

1) Instalar dependencias

```
npm install
```

2) Desarrollo local (Vite)

```
npm run dev
```

Se abrirá en `http://localhost:5173/`.

3) Build de producción y vista previa

```
npm run build
npm run preview
```

## Modelo de Datos (principal)

- `clientes`: datos del cliente (nombre, contacto, dirección)
- `mascotas`: datos de mascotas asociadas al cliente
  - Alimentación: `id_alimento` (FK), `alimento_cantidad`, `alimento_frecuencia`, `alimento_horarios`
  - Cuidados/Protocolos: `cuidados_especiales` (boolean), `protocolo_medicamentos` (text), `protocolo_dietas_especiales` (text), `protocolo_cuidado_geriatrico` (text)
- `reservas`: servicio, fechas, estado, cierre
- `servicios`: catálogo de servicios con `tipo_servicio`
- `alimentos`: catálogo de alimentos
- `tarifas_peso`: tarifas por rango de peso
- `transacciones_financieras`: registros económico-financieros relacionados con reservas

## Migraciones Clave (Supabase)

Las columnas de protocolos y cuidados de mascotas están incorporadas en migraciones:

- `supabase/migrations/20251119230000_add_protocolo_mascota_fields.sql`
- `supabase/migrations/20251119231050_add_cuidados_especiales_mascotas.sql`

Además, existen seeds y migraciones para catálogos, servicios principales, RLS y políticas.

### ¿Cómo aplicar las migraciones?

- Local (con Supabase CLI):
  - Inicia servicios locales con `supabase start` (opcional).
  - Ejecuta `supabase db reset` para reconstruir desde migraciones (destruye datos locales).
  - O bien `supabase db lint` para revisar, y `supabase db diff` para generar nuevas.

- Producción (Supabase Cloud):
  - Copia el contenido de las migraciones relevantes y aplícalo en SQL Editor de Supabase.
  - Alternativamente, usa `psql` contra la BD gestionada.
  - Si PostgREST no refleja cambios, reinicia el servicio REST desde la UI de Supabase o actualiza el esquema cache con un restart.

### Checklist Backend (Supabase)

- Las columnas de `mascotas` existen y están visibles:
  - `id_alimento`, `alimento_cantidad`, `alimento_frecuencia`, `alimento_horarios`
  - `cuidados_especiales` (boolean por defecto `false`)
  - `protocolo_medicamentos`, `protocolo_dietas_especiales`, `protocolo_cuidado_geriatrico`
- Políticas RLS están configuradas para `clientes`, `mascotas`, `reservas` y otras tablas.
- Índices y restricciones activas (por ejemplo, `servicios.nombre` único).
- Catálogos básicos creados y con datos: `alimentos`, `catalogo_razas`, `servicios` principales, `tarifas_peso`.

## Funcionalidades Principales

- Gestión de Clientes y Mascotas
  - Crear/editar clientes y sus mascotas.
  - Cargar foto de la mascota.
  - Asignar alimentación y protocolos de cuidado.
- Catálogos
  - Razas y alimentos.
  - Servicios base (pensión/guardería, etc.).
- Reservas
  - Crear, editar, listar y cerrar reservas.
  - Flujo de cierre con devengados.
- Finanzas
  - Registro de transacciones vinculadas a reservas.

## Flujos Comunes

1) Alta de Cliente y Mascota
   - Crear cliente en Clientes.
   - Registrar mascota en Mascotas: alimentación y protocolos.

2) Crear Reserva
   - Desde Reservas, seleccionar cliente/mascota, rango de fechas, tipo de servicio.

3) Cierre de Reserva
   - Completar información, confirmar devengados y registrar transacción.

## Despliegue

- Desarrollo: `npm run dev`.
- Producción: construir con `npm run build` y servir `dist/` en tu plataforma.
- Backend: asegúrate de que las migraciones y políticas estén aplicadas en Supabase Cloud.

## Convenciones de Git

- Ramas de trabajo: `feature/...`, `fix/...`, `chore/...`.
- Se usaron, por ejemplo, `feature/pension-guarderia-ui-restored` y `latest`.
- Commits descriptivos con el impacto (UI, migraciones, políticas, etc.).

## Notas de Implementación

- Frontend usa el cliente de Supabase (`src/lib/supabase.ts`) y tipos definidos en `src/lib/database.types.ts`.
- Los formularios de mascotas incluyen los campos de alimentación y protocolos; los errores de guardado se reportan directamente si el backend no tiene columnas.
- Tailwind está configurado en `tailwind.config.js`.

## Troubleshooting

- Error "column not found" al guardar mascota
  - Confirma que las columnas existen en `public.mascotas`.
  - Si fueron añadidas recientemente, reinicia el servicio REST en Supabase para refrescar el cache de PostgREST.

- RLS bloquea operaciones
  - Revisa políticas actuales y ajusta según el rol del usuario. Hay migraciones de políticas en `supabase/migrations/`.

## Roadmap

- Portal de cliente (autogestión de reservas y datos).
- Notificaciones automáticas.
- Reportes operativos y financieros.
- Integraciones de pago.

## Contribución

1) Crear rama desde `main`.
2) Desarrollar y probar localmente.
3) Abrir Pull Request con descripción clara (incluye notas de migración si aplica).

---

Para dudas o mejoras, abre un issue o un PR. ¡Gracias por contribuir a KaHome!