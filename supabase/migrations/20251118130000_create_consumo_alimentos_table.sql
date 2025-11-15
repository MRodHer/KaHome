CREATE TABLE IF NOT EXISTS consumo_alimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_mascota uuid REFERENCES mascotas(id) ON DELETE CASCADE,
  id_alimento uuid REFERENCES alimentos(id),
  cantidad decimal(10,2) NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  notas text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consumo_alimentos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'consumo_alimentos' AND policyname = 'Usuarios autenticados pueden gestionar el consumo de alimentos'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden gestionar el consumo de alimentos"
      ON consumo_alimentos FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;