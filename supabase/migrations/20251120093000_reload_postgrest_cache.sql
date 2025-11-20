-- Force PostgREST to reload its schema cache after recent table changes
-- This helps resolve errors like: "Could not find the 'activo' column in the schema cache"

DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END $$;

-- Optional: normalize existing data defaults if columns are present
-- (Will do nothing if columns already have values)
-- Using IF EXISTS checks via dynamic SQL to avoid failures if run out of order
DO $$
DECLARE
  col_activo_exists boolean := EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'mascotas' AND column_name = 'activo'
  );
  col_esterilizado_exists boolean := EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'mascotas' AND column_name = 'esterilizado'
  );
BEGIN
  IF col_activo_exists THEN
    EXECUTE 'UPDATE public.mascotas SET activo = COALESCE(activo, true)';
  END IF;
  IF col_esterilizado_exists THEN
    EXECUTE 'UPDATE public.mascotas SET esterilizado = COALESCE(esterilizado, false)';
  END IF;
END $$;