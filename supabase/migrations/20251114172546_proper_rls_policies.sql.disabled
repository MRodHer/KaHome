-- Eliminar políticas anteriores
DROP POLICY IF EXISTS "Permitir lectura a todos los usuarios" ON public.ubicaciones;
DROP POLICY IF EXISTS "Permitir lectura a todos los usuarios" ON public.clientes;
DROP POLICY IF EXISTS "Permitir lectura a todos los usuarios" ON public.mascotas;

-- Políticas para la tabla de ubicaciones (solo lectura para todos)
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.ubicaciones FOR SELECT USING (true);

-- Políticas para la tabla de clientes (lectura e inserción para todos)
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Permitir inserción a todos los usuarios" ON public.clientes FOR INSERT WITH CHECK (true);

-- Políticas para la tabla de mascotas (lectura e inserción para todos)
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.mascotas FOR SELECT USING (true);
CREATE POLICY "Permitir inserción a todos los usuarios" ON public.mascotas FOR INSERT WITH CHECK (true);