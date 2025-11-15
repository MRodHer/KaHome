-- supabase/migrations/$(Get-Date -Format 'yyyyMMddHHmmss')_add_rls_to_reservas.sql

-- Habilitar RLS en la tabla de reservas si no está habilitado
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Permitir la lectura de reservas a todos los usuarios
DROP POLICY IF EXISTS "Permitir lectura a todos los usuarios" ON public.reservas;
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.reservas
FOR SELECT
USING (true);