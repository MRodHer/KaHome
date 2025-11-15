-- Asigna rol 'admin' al usuario autenticado actual.
-- Ejecutar en el SQL Editor de Supabase estando autenticado con el usuario deseado.
-- Idempotente: crea o actualiza el registro en public.personal.

DO $$
DECLARE
  current_uid uuid := auth.uid();
  current_email text := (SELECT email FROM auth.users WHERE id = auth.uid());
BEGIN
  IF current_uid IS NULL THEN
    RAISE EXCEPTION 'No hay usuario autenticado (auth.uid() = NULL)';
  END IF;

  INSERT INTO public.personal (user_id, nombre, email, rol, activo)
  VALUES (
    current_uid,
    COALESCE(current_email, 'Admin'),
    COALESCE(current_email, 'admin@example.com'),
    'admin',
    true
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    rol = 'admin',
    activo = true,
    nombre = EXCLUDED.nombre,
    email = EXCLUDED.email;
END $$;