-- Eliminar catálogos de códigos postales y políticas asociadas
-- Idempotente y seguro: borra tablas si existen.

DO $$ BEGIN
  -- Primero eliminar políticas si existen
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cat_cp') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Permitir lectura pública de códigos postales" ON public.cat_cp';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cat_municipios') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Permitir lectura pública de municipios" ON public.cat_municipios';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cat_estados') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Permitir lectura pública de estados" ON public.cat_estados';
  END IF;
END $$;

-- Dropear tablas respetando dependencias
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='cat_cp') THEN
    EXECUTE 'DROP TABLE public.cat_cp CASCADE';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='cat_municipios') THEN
    EXECUTE 'DROP TABLE public.cat_municipios CASCADE';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='cat_estados') THEN
    EXECUTE 'DROP TABLE public.cat_estados CASCADE';
  END IF;
END $$;