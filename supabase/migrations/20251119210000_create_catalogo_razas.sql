-- Catálogo de razas para especies (Perro/Gato/Otro)
CREATE TABLE IF NOT EXISTS catalogo_razas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  especie text NOT NULL CHECK (especie IN ('Perro','Gato','Otro')),
  nombre text NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Índice único por especie + nombre (case-insensitive)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = current_schema() AND indexname = 'uq_catalogo_razas_especie_nombre'
  ) THEN
    CREATE UNIQUE INDEX uq_catalogo_razas_especie_nombre
    ON catalogo_razas (especie, lower(nombre));
  END IF;
END $$;

ALTER TABLE catalogo_razas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas: usuarios autenticados pueden leer e insertar
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'catalogo_razas' AND policyname = 'Authenticated can select catalogo_razas'
  ) THEN
    CREATE POLICY "Authenticated can select catalogo_razas"
      ON catalogo_razas FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'catalogo_razas' AND policyname = 'Authenticated can insert catalogo_razas'
  ) THEN
    CREATE POLICY "Authenticated can insert catalogo_razas"
      ON catalogo_razas FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;