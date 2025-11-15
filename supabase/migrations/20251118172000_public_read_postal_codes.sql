-- Habilitar RLS y políticas de lectura pública para cat_cp, cat_estados y cat_municipios

-- Asegurar que RLS esté habilitado
ALTER TABLE IF EXISTS public.cat_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cat_municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cat_cp ENABLE ROW LEVEL SECURITY;

-- Políticas idempotentes para permitir SELECT a anon y authenticated
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cat_estados' AND policyname='Permitir lectura pública de estados'
  ) THEN
    CREATE POLICY "Permitir lectura pública de estados"
      ON public.cat_estados FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cat_municipios' AND policyname='Permitir lectura pública de municipios'
  ) THEN
    CREATE POLICY "Permitir lectura pública de municipios"
      ON public.cat_municipios FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cat_cp' AND policyname='Permitir lectura pública de códigos postales'
  ) THEN
    CREATE POLICY "Permitir lectura pública de códigos postales"
      ON public.cat_cp FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Nota: Estas tablas son catálogos públicos; sólo se concede SELECT.
-- Si en el futuro se requiere INSERT/UPDATE/DELETE, defina políticas específicas y restrictivas.