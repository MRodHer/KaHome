# Contribución

## Flujo de trabajo

- Trabajar en ramas feature desde `main`.
- Nombrado sugerido: `feature/<area>-<breve-descripcion>`.
- Abrir Pull Request hacia `main` y solicitar revisión.

## Comandos clave

- Instalación: `npm install`
- Desarrollo: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Build: `npm run build`

## Estándares

- TypeScript estricto, usar tipos de `src/lib/database.types.ts`.
- ESLint activo; corregir advertencias antes de PR.
- Estilos con TailwindCSS.
- Evitar uso de claves de servicio en frontend; usar `supabase` con RLS.

## Migraciones de Base de Datos

- Directorio: `supabase/migrations/`.
- Crear archivos con timestamp: `YYYYMMDDHHMMSS_<descripcion>.sql`.
- Probar en entorno local antes de subir.

## Pull Requests

- Base: `main`.
- Adjuntar descripción clara del cambio y capturas si aplica.
- Incluir referencia a archivos clave modificados y pruebas realizadas.

## Seguridad

- No incluir secretos en commits.
- Variables de entorno deben residir en `.env.local` y estar ignoradas.