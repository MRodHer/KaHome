-- Restaurar tabla personal, funciones de rol y políticas de lectura para administradores

-- 1) Crear tabla personal vinculada a auth.users
CREATE TABLE IF NOT EXISTS public.personal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre text NOT NULL,
  email text UNIQUE NOT NULL,
  rol text NOT NULL DEFAULT 'empleado' CHECK (rol IN ('admin','empleado')),
  id_ubicacion uuid REFERENCES public.ubicaciones(id),
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.personal ENABLE ROW LEVEL SECURITY;

-- 2) Funciones auxiliares de rol y ownership
-- get_my_role: devuelve el rol del usuario actual (admin/empleado) o NULL si no existe
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT p.rol FROM public.personal p
    WHERE p.user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- is_client_owner: verifica si el usuario actual es dueño del cliente indicado
CREATE OR REPLACE FUNCTION public.is_client_owner(client_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = client_id AND c.user_id = auth.uid()
  );
END;
$$;

-- 3) Políticas RLS en personal
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='personal' AND policyname='Admins pueden ver personal'
  ) THEN
    CREATE POLICY "Admins pueden ver personal"
      ON public.personal FOR SELECT TO authenticated
      USING ((SELECT public.get_my_role()) = 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='personal' AND policyname='Empleados pueden ver su propio perfil'
  ) THEN
    CREATE POLICY "Empleados pueden ver su propio perfil"
      ON public.personal FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4) Políticas de lectura para administradores en tablas clave del dashboard
-- Clientes: admins pueden ver todos
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='Admins pueden ver todos los clientes'
  ) THEN
    CREATE POLICY "Admins pueden ver todos los clientes"
      ON public.clientes FOR SELECT TO authenticated
      USING ((SELECT public.get_my_role()) = 'admin');
  END IF;
END $$;

-- Mascotas: admins pueden ver todas
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mascotas' AND policyname='Admins pueden ver todas las mascotas'
  ) THEN
    CREATE POLICY "Admins pueden ver todas las mascotas"
      ON public.mascotas FOR SELECT TO authenticated
      USING ((SELECT public.get_my_role()) = 'admin');
  END IF;
END $$;

-- Reservas: admins pueden ver todas
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reservas' AND policyname='Admins pueden ver todas las reservas'
  ) THEN
    CREATE POLICY "Admins pueden ver todas las reservas"
      ON public.reservas FOR SELECT TO authenticated
      USING ((SELECT public.get_my_role()) = 'admin');
  END IF;
END $$;

-- Transacciones Financieras: admins pueden ver todas
ALTER TABLE public.transacciones_financieras ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transacciones_financieras' AND policyname='Admins pueden ver todas las transacciones'
  ) THEN
    CREATE POLICY "Admins pueden ver todas las transacciones"
      ON public.transacciones_financieras FOR SELECT TO authenticated
      USING ((SELECT public.get_my_role()) = 'admin');
  END IF;
END $$;

-- Contratos: admins pueden ver todos
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contratos' AND policyname='Admins pueden ver todos los contratos'
  ) THEN
    CREATE POLICY "Admins pueden ver todos los contratos"
      ON public.contratos FOR SELECT TO authenticated
      USING ((SELECT public.get_my_role()) = 'admin');
  END IF;
END $$;

-- Nota: mantenemos las políticas de ownership existentes (auth.uid() a través de clientes)
-- Estas nuevas políticas sólo añaden bypass de lectura para usuarios con rol 'admin'.