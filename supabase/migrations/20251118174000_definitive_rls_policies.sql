-- Paso 3: Políticas RLS definitivas (Admins vs Clientes)
-- Limpia políticas previas y establece un modelo claro:
--  - Admins: acceso total (SELECT/INSERT/UPDATE/DELETE)
--  - Clientes: acceso sólo a lo propio (ownership)

-- Asegurar RLS habilitado
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones_financieras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tarifas_peso ENABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes en tablas clave para evitar conflictos
DO $$ BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='clientes' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.clientes';
  END LOOP;
END $$;

DO $$ BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.mascotas';
  END LOOP;
END $$;

DO $$ BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='reservas' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.reservas';
  END LOOP;
END $$;

DO $$ BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='transacciones_financieras' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.transacciones_financieras';
  END LOOP;
END $$;

DO $$ BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='ubicaciones' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.ubicaciones';
  END LOOP;
END $$;

DO $$ BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='servicios' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.servicios';
  END LOOP;
END $$;

DO $$ BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='alimentos' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.alimentos';
  END LOOP;
END $$;

DO $$ BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='tarifas_peso' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.tarifas_peso';
  END LOOP;
END $$;

-- --- Tabla: clientes ---
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='Admins pueden gestionar TODOS los clientes'
  ) THEN
    CREATE POLICY "Admins pueden gestionar TODOS los clientes"
      ON public.clientes FOR ALL TO authenticated
      USING ((SELECT public.get_my_role()) = 'admin')
      WITH CHECK ((SELECT public.get_my_role()) = 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='Clientes pueden ver y actualizar su PROPIO perfil'
  ) THEN
    CREATE POLICY "Clientes pueden ver y actualizar su PROPIO perfil"
      ON public.clientes FOR SELECT, UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- --- Tabla: mascotas ---
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' AND policyname='Admins pueden gestionar TODAS las mascotas'
  ) THEN
    CREATE POLICY "Admins pueden gestionar TODAS las mascotas"
      ON public.mascotas FOR ALL TO authenticated
      USING ((SELECT public.get_my_role()) = 'admin')
      WITH CHECK ((SELECT public.get_my_role()) = 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' AND policyname='Clientes pueden gestionar sus PROPIAS mascotas'
  ) THEN
    CREATE POLICY "Clientes pueden gestionar sus PROPIAS mascotas"
      ON public.mascotas FOR ALL TO authenticated
      USING (public.is_client_owner(id_cliente))
      WITH CHECK (public.is_client_owner(id_cliente));
  END IF;
END $$;

-- --- Tabla: reservas ---
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reservas' AND policyname='Admins pueden gestionar TODAS las reservas'
  ) THEN
    CREATE POLICY "Admins pueden gestionar TODAS las reservas"
      ON public.reservas FOR ALL TO authenticated
      USING ((SELECT public.get_my_role()) = 'admin')
      WITH CHECK ((SELECT public.get_my_role()) = 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reservas' AND policyname='Clientes pueden gestionar sus PROPIAS reservas'
  ) THEN
    CREATE POLICY "Clientes pueden gestionar sus PROPIAS reservas"
      ON public.reservas FOR ALL TO authenticated
      USING (public.is_client_owner(id_cliente))
      WITH CHECK (public.is_client_owner(id_cliente));
  END IF;
END $$;

-- --- Tabla: transacciones_financieras ---
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transacciones_financieras' AND policyname='SOLO Admins pueden gestionar finanzas'
  ) THEN
    CREATE POLICY "SOLO Admins pueden gestionar finanzas"
      ON public.transacciones_financieras FOR ALL TO authenticated
      USING ((SELECT public.get_my_role()) = 'admin')
      WITH CHECK ((SELECT public.get_my_role()) = 'admin');
  END IF;
END $$;

-- --- Tablas públicas (catálogos): lectura para autenticados ---
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ubicaciones' AND policyname='Usuarios autenticados pueden ver ubicaciones'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver ubicaciones"
      ON public.ubicaciones FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='servicios' AND policyname='Usuarios autenticados pueden ver servicios'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver servicios"
      ON public.servicios FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='alimentos' AND policyname='Usuarios autenticados pueden ver alimentos'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver alimentos"
      ON public.alimentos FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tarifas_peso' AND policyname='Usuarios autenticados pueden ver tarifas_peso'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver tarifas_peso"
      ON public.tarifas_peso FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

-- Nota: cat_cp, cat_estados y cat_municipios ya tienen lectura pública (anon/authenticated) en 20251118172000_public_read_postal_codes.sql
-- Paso 4 (manual): asignar rol admin al usuario actual via SQL en el editor, usando auth.uid().