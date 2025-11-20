# Documentación de Base de Datos

## Diagrama Entidad–Relación (ASCII)

```
clientes (id) 1─* mascotas (id)
reservas (id) ──┬─(id_cliente → clientes.id)
                ├─(id_mascota → mascotas.id)
                ├─(id_servicio → servicios.id)
                └─(id_ubicacion → ubicaciones.id)

reservas 1─* reserva_servicios_extra (id)
reservas 1─* transacciones_financieras (id)

alimentos (id) ──* reservas (id_alimento)

ubicaciones (id) ──* clientes, ──* transacciones_financieras, ──* reservas

cat_estados (idestado) 1─* cat_municipios (idmunicipio)
cat_municipios (idmunicipio,idestado) 1─* cat_cp (idcp)
```

## Tablas y Campos Principales

- `clientes`: datos de contacto y dirección (`src/lib/database.types.ts:118–173`).
- `mascotas`: datos clínicos, protocolos y estado (`src/lib/database.types.ts:264–358`).
- `reservas`: rangos de fecha, costos, protocolo alimentario, pertenencias (`src/lib/database.types.ts:477–584`).
- `servicios` y `servicios_extra`: catálogo de servicios y extras (`src/lib/database.types.ts:585–641`).
- `reserva_servicios_extra`: relación N a N reservas–extras con precio cobrado (`src/lib/database.types.ts:438–476`).
- `transacciones_financieras`: movimientos vinculados a reservas y ubicaciones (`src/lib/database.types.ts:669–722`).
- `tarifas_peso`: tarifas por rangos de peso (`src/lib/database.types.ts:642–668`).
- `ubicaciones`: sedes (`src/lib/database.types.ts:723–747`).
- `alimentos`: catálogo de alimentos (`src/lib/database.types.ts:17–37`).
- Catálogos geográficos (`cat_estados`, `cat_municipios`, `cat_cp`) (`src/lib/database.types.ts:77–117`, `38–76`).

## Relaciones Importantes

- `reservas.id_cliente → clientes.id` (`src/lib/database.types.ts:556–561`).
- `reservas.id_mascota → mascotas.id` (`src/lib/database.types.ts:562–568`).
- `reservas.id_servicio → servicios.id` (`src/lib/database.types.ts:569–575`).
- `reservas.id_ubicacion → ubicaciones.id` (`src/lib/database.types.ts:576–583`).
- `reservas.id_alimento → alimentos.id` (`src/lib/database.types.ts:547–554`).
- `reserva_servicios_extra.* → reservas/servicios_extra` (`src/lib/database.types.ts:460–475`).
- `transacciones_financieras.* → reservas/ubicaciones` (`src/lib/database.types.ts:706–721`).

## Funciones/Triggers/Procedimientos

- No se definen funciones SQL públicas en el esquema (`src/lib/database.types.ts:751–759`).
- Políticas RLS y roles gestionados por migraciones:
  - `20251118160000_secure_rls_policies.sql`
  - `20251118174000_definitive_rls_policies.sql`
  - `20251118173000_admin_roles_and_policies.sql`

## Backup y Recuperación

- Recomendado:
  - Backups automáticos de la base de datos (daily) a Storage.
  - Versionado de migraciones en `supabase/migrations/*` y restauración reproducible.
  - Exportar Storage (fotos mascotas) periódicamente.

## Migraciones y Versionado

- Directorio: `supabase/migrations/` (`supabase/migrations`).
- Hitos relevantes:
  - `20251119230000_add_protocolo_mascota_fields.sql`: añade campos de protocolo en mascotas.
  - `20251119231050_add_cuidados_especiales_mascotas.sql`: bandera y descriptores de cuidados.
  - `20251118211000_alter_mascotas_add_alimento_cantidad.sql`: soporte cantidad en protocolo.
  - `20251119190000_upsert_tarifas_peso_current.sql`: tarifas vigentes.
  - `20251119220000_update_reservas_close_flow.sql`: flujo de cierre con pertenencias.
  - `20251120093000_reload_postgrest_cache.sql`: recarga de caché de PostgREST.