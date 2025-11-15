-- Secure RLS migration: add user_id to clientes and replace insecure policies
-- This migration fixes prior policies that used USING (true) by enforcing auth.uid()-based ownership.

-- 1) Ensure clientes has user_id linked to auth.users(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.clientes ADD COLUMN user_id uuid;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clientes_user_id_fkey'
  ) THEN
    ALTER TABLE public.clientes
    ADD CONSTRAINT clientes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);

-- 2) Enable RLS on relevant tables (idempotent)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones_financieras ENABLE ROW LEVEL SECURITY;

-- 3) Drop insecure/temporary policies if they exist
-- Clientes
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='Usuarios autenticados pueden ver clientes'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden ver clientes" ON public.clientes'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='Usuarios autenticados pueden crear clientes'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden crear clientes" ON public.clientes'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='Usuarios autenticados pueden actualizar clientes'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden actualizar clientes" ON public.clientes'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='Permitir lectura a todos los usuarios'
  ) THEN EXECUTE 'DROP POLICY "Permitir lectura a todos los usuarios" ON public.clientes'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='Permitir inserción a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir inserción a todos los usuarios autenticados" ON public.clientes'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='Permitir actualización a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir actualización a todos los usuarios autenticados" ON public.clientes'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='Permitir borrado a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir borrado a todos los usuarios autenticados" ON public.clientes'; END IF;
END $$;

-- Mascotas
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' AND policyname='Usuarios autenticados pueden ver mascotas'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden ver mascotas" ON public.mascotas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' AND policyname='Usuarios autenticados pueden crear mascotas'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden crear mascotas" ON public.mascotas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' AND policyname='Usuarios autenticados pueden actualizar mascotas'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden actualizar mascotas" ON public.mascotas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' AND policyname='Permitir lectura a todos los usuarios'
  ) THEN EXECUTE 'DROP POLICY "Permitir lectura a todos los usuarios" ON public.mascotas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' AND policyname='Permitir inserción a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir inserción a todos los usuarios autenticados" ON public.mascotas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' AND policyname='Permitir actualización a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir actualización a todos los usuarios autenticados" ON public.mascotas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' AND policyname='Permitir borrado a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir borrado a todos los usuarios autenticados" ON public.mascotas'; END IF;
END $$;

-- Reservas
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reservas' AND policyname='Usuarios autenticados pueden ver reservas'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden ver reservas" ON public.reservas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reservas' AND policyname='Usuarios autenticados pueden crear reservas'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden crear reservas" ON public.reservas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reservas' AND policyname='Usuarios autenticados pueden actualizar reservas'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden actualizar reservas" ON public.reservas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reservas' AND policyname='Permitir lectura a todos los usuarios'
  ) THEN EXECUTE 'DROP POLICY "Permitir lectura a todos los usuarios" ON public.reservas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reservas' AND policyname='Permitir inserción a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir inserción a todos los usuarios autenticados" ON public.reservas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reservas' AND policyname='Permitir actualización a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir actualización a todos los usuarios autenticados" ON public.reservas'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reservas' AND policyname='Permitir borrado a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir borrado a todos los usuarios autenticados" ON public.reservas'; END IF;
END $$;

-- Transacciones Financieras
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transacciones_financieras' AND policyname='Usuarios autenticados pueden ver transacciones'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden ver transacciones" ON public.transacciones_financieras'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transacciones_financieras' AND policyname='Usuarios autenticados pueden crear transacciones'
  ) THEN EXECUTE 'DROP POLICY "Usuarios autenticados pueden crear transacciones" ON public.transacciones_financieras'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transacciones_financieras' AND policyname='Permitir lectura a todos los usuarios'
  ) THEN EXECUTE 'DROP POLICY "Permitir lectura a todos los usuarios" ON public.transacciones_financieras'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transacciones_financieras' AND policyname='Permitir inserción a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir inserción a todos los usuarios autenticados" ON public.transacciones_financieras'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transacciones_financieras' AND policyname='Permitir actualización a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir actualización a todos los usuarios autenticados" ON public.transacciones_financieras'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transacciones_financieras' AND policyname='Permitir borrado a todos los usuarios autenticados'
  ) THEN EXECUTE 'DROP POLICY "Permitir borrado a todos los usuarios autenticados" ON public.transacciones_financieras'; END IF;
END $$;

-- 4) Create secure, ownership-based policies

-- Clientes: a user can only access their own row
CREATE POLICY "Usuarios pueden ver sus propios clientes"
  ON public.clientes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear su propio cliente"
  ON public.clientes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios clientes"
  ON public.clientes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden borrar sus propios clientes"
  ON public.clientes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Mascotas: access only if mascota belongs to a cliente owned by the user
CREATE POLICY "Usuarios pueden ver sus propias mascotas"
  ON public.mascotas FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.mascotas.id_cliente AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear sus propias mascotas"
  ON public.mascotas FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.mascotas.id_cliente AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden actualizar sus propias mascotas"
  ON public.mascotas FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.mascotas.id_cliente AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.mascotas.id_cliente AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden borrar sus propias mascotas"
  ON public.mascotas FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.mascotas.id_cliente AND c.user_id = auth.uid()
    )
  );

-- Reservas: access only if reserva belongs to a cliente owned by the user
CREATE POLICY "Usuarios pueden ver sus propias reservas"
  ON public.reservas FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.reservas.id_cliente AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear sus propias reservas"
  ON public.reservas FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.reservas.id_cliente AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden actualizar sus propias reservas"
  ON public.reservas FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.reservas.id_cliente AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.reservas.id_cliente AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden borrar sus propias reservas"
  ON public.reservas FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.reservas.id_cliente AND c.user_id = auth.uid()
    )
  );

-- Transacciones financieras: access only if linked to a reserva owned by the user's cliente
CREATE POLICY "Usuarios pueden ver sus propias transacciones"
  ON public.transacciones_financieras FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reservas r
      JOIN public.clientes c ON c.id = r.id_cliente
      WHERE r.id = public.transacciones_financieras.id_reserva
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear sus propias transacciones"
  ON public.transacciones_financieras FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reservas r
      JOIN public.clientes c ON c.id = r.id_cliente
      WHERE r.id = public.transacciones_financieras.id_reserva
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden actualizar sus propias transacciones"
  ON public.transacciones_financieras FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reservas r
      JOIN public.clientes c ON c.id = r.id_cliente
      WHERE r.id = public.transacciones_financieras.id_reserva
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reservas r
      JOIN public.clientes c ON c.id = r.id_cliente
      WHERE r.id = public.transacciones_financieras.id_reserva
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden borrar sus propias transacciones"
  ON public.transacciones_financieras FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reservas r
      JOIN public.clientes c ON c.id = r.id_cliente
      WHERE r.id = public.transacciones_financieras.id_reserva
        AND c.user_id = auth.uid()
    )
  );

-- NOTE: For other tables like ubicaciones, tarifas_peso, servicios_extra, reserva_servicios_extra, alimentos,
-- define policies based on your ownership/visibility model. For now, we avoid permissive USING (true).