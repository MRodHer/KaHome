-- Verificar el estado de RLS para tablas específicas
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled,
  relforcerowsecurity AS rls_forced
FROM
  pg_class
WHERE
  relname IN ('clientes', 'mascotas', 'ubicaciones');