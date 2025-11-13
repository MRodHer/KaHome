-- Reseteo de datos de prueba (¡Destructivo!)
-- Ejecuta este script manualmente en el editor SQL de Supabase.
-- ADVERTENCIA: borra todos los registros y reinicia IDs.

TRUNCATE TABLE
  reservas,
  mascotas,
  clientes,
  transacciones_financieras
RESTART IDENTITY CASCADE;

-- Si existen otras tablas de prueba como 'personal' y 'contratos',
-- puedes incluirlas en el TRUNCATE anterior.
-- Ejemplo:
-- TRUNCATE TABLE
--   reservas,
--   mascotas,
--   clientes,
--   transacciones_financieras,
--   personal,
--   contratos
-- RESTART IDENTITY CASCADE;