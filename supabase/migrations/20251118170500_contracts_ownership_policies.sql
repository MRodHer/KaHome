-- RLS de contratos basada en ownership via reservas -> clientes.user_id
-- Compatible con migración 20251118160000_secure_rls_policies.sql que ya agrega clientes.user_id

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

-- SELECT: propietarios pueden ver sus contratos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contratos' AND policyname='Usuarios pueden ver sus propios contratos'
  ) THEN
    CREATE POLICY "Usuarios pueden ver sus propios contratos"
      ON public.contratos FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.reservas r
          JOIN public.clientes c ON c.id = r.id_cliente
          WHERE r.id = public.contratos.id_reserva
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- INSERT: propietarios pueden crear contratos de sus reservas
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contratos' AND policyname='Usuarios pueden crear sus propios contratos'
  ) THEN
    CREATE POLICY "Usuarios pueden crear sus propios contratos"
      ON public.contratos FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.reservas r
          JOIN public.clientes c ON c.id = r.id_cliente
          WHERE r.id = public.contratos.id_reserva
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- UPDATE: propietarios pueden actualizar sus contratos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contratos' AND policyname='Usuarios pueden actualizar sus propios contratos'
  ) THEN
    CREATE POLICY "Usuarios pueden actualizar sus propios contratos"
      ON public.contratos FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.reservas r
          JOIN public.clientes c ON c.id = r.id_cliente
          WHERE r.id = public.contratos.id_reserva
            AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.reservas r
          JOIN public.clientes c ON c.id = r.id_cliente
          WHERE r.id = public.contratos.id_reserva
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- DELETE: propietarios pueden borrar sus contratos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contratos' AND policyname='Usuarios pueden borrar sus propios contratos'
  ) THEN
    CREATE POLICY "Usuarios pueden borrar sus propios contratos"
      ON public.contratos FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.reservas r
          JOIN public.clientes c ON c.id = r.id_cliente
          WHERE r.id = public.contratos.id_reserva
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;