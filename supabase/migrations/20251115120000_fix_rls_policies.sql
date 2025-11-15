-- Habilitar RLS para todas las tablas relevantes si aún no está hecho
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para empezar de cero y evitar conflictos
DROP POLICY IF EXISTS "Permitir lectura a todos los usuarios" ON public.clientes;
DROP POLICY IF EXISTS "Permitir inserción a todos los usuarios" ON public.clientes;
DROP POLICY IF EXISTS "Permitir actualización a todos los usuarios" ON public.clientes;
DROP POLICY IF EXISTS "Permitir borrado a todos los usuarios" ON public.clientes;

DROP POLICY IF EXISTS "Permitir lectura a todos los usuarios" ON public.mascotas;
DROP POLICY IF EXISTS "Permitir inserción a todos los usuarios" ON public.mascotas;
DROP POLICY IF EXISTS "Permitir actualización a todos los usuarios" ON public.mascotas;
DROP POLICY IF EXISTS "Permitir borrado a todos los usuarios" ON public.mascotas;

DROP POLICY IF EXISTS "Permitir lectura a todos los usuarios" ON public.reservas;
DROP POLICY IF EXISTS "Permitir inserción a todos los usuarios" ON public.reservas;
DROP POLICY IF EXISTS "Permitir actualización a todos los usuarios" ON public.reservas;
DROP POLICY IF EXISTS "Permitir borrado a todos los usuarios" ON public.reservas;

-- Políticas para la tabla de clientes (CRUD completo para todos)
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Permitir inserción a todos los usuarios" ON public.clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización a todos los usuarios" ON public.clientes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir borrado a todos los usuarios" ON public.clientes FOR DELETE USING (true);

-- Políticas para la tabla de mascotas (CRUD completo para todos)
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.mascotas FOR SELECT USING (true);
CREATE POLICY "Permitir inserción a todos los usuarios" ON public.mascotas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización a todos los usuarios" ON public.mascotas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir borrado a todos los usuarios" ON public.mascotas FOR DELETE USING (true);

-- Políticas para la tabla de reservas (CRUD completo para todos)
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.reservas FOR SELECT USING (true);
CREATE POLICY "Permitir inserción a todos los usuarios" ON public.reservas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización a todos los usuarios" ON public.reservas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir borrado a todos los usuarios" ON public.reservas FOR DELETE USING (true);