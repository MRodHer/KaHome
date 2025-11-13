-- PetCare SaaS v1.1 – Actualización de esquema
-- Fecha: 2025-11-13
-- Esta migración añade columnas y tablas necesarias para:
-- - Peso de mascotas
-- - Tarifas por peso
-- - Servicios extra y relación con reservas
-- - Catálogo de alimentos
-- - Campos adicionales en reservas (IVA, pertenencias, alimentación)

-- 1.2) Modificación de la tabla mascotas: agregar peso
ALTER TABLE mascotas
  ADD COLUMN IF NOT EXISTS peso decimal(5,2) DEFAULT 0.00;

-- 1.3) Creación de la tabla tarifas_peso
CREATE TABLE IF NOT EXISTS tarifas_peso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  peso_min integer NOT NULL,
  peso_max integer NOT NULL,
  tarifa_noche decimal(10,2) NOT NULL DEFAULT 0,
  tarifa_guarderia decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS y políticas de lectura
ALTER TABLE tarifas_peso ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'tarifas_peso' AND policyname = 'Usuarios autenticados pueden ver tarifas'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver tarifas"
      ON tarifas_peso FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 1.4) Servicios extra y relación con reservas
CREATE TABLE IF NOT EXISTS servicios_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  precio decimal(10,2) NOT NULL DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE servicios_extra ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'servicios_extra' AND policyname = 'Usuarios autenticados pueden ver servicios extra'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver servicios extra"
      ON servicios_extra FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

/* Tabla de unión para vincular servicios extra a reservas */
CREATE TABLE IF NOT EXISTS reserva_servicios_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_reserva uuid REFERENCES reservas(id) ON DELETE CASCADE,
  id_servicio_extra uuid REFERENCES servicios_extra(id),
  cantidad integer DEFAULT 1,
  precio_cobrado decimal(10,2) NOT NULL
);

ALTER TABLE reserva_servicios_extra ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'reserva_servicios_extra' AND policyname = 'Usuarios autenticados pueden gestionar servicios de reserva'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden gestionar servicios de reserva"
      ON reserva_servicios_extra FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 1.5) Tabla alimentos
CREATE TABLE IF NOT EXISTS alimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alimentos ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'alimentos' AND policyname = 'Usuarios autenticados pueden ver alimentos'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver alimentos"
      ON alimentos FOR SELECT
      TO authenticated
      USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'alimentos' AND policyname = 'Usuarios autenticados pueden agregar alimentos'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden agregar alimentos"
      ON alimentos FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- 1.6) Modificación de la tabla reservas: campos adicionales
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS pertenencias jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS solicita_factura boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS costo_iva decimal(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS id_alimento uuid REFERENCES alimentos(id),
  ADD COLUMN IF NOT EXISTS alimento_cantidad text,
  ADD COLUMN IF NOT EXISTS alimento_frecuencia text,
  ADD COLUMN IF NOT EXISTS alimento_horarios text;

-- Opcional: población inicial de tarifas_peso (ejecutar una sola vez)
-- Descomenta el bloque siguiente si deseas insertar las tarifas por defecto.
-- INSERT INTO tarifas_peso (peso_min, peso_max, tarifa_noche, tarifa_guarderia)
-- VALUES
--   (0, 5, 250.00, 100.00),
--   (5, 10, 270.00, 120.00),
--   (10, 15, 290.00, 140.00),
--   (15, 20, 310.00, 160.00),
--   (20, 25, 330.00, 180.00),
--   (25, 30, 350.00, 200.00),
--   (30, 35, 370.00, 220.00),
--   (35, 100, 390.00, 240.00);