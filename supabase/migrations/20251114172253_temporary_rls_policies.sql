-- Habilitar RLS y crear políticas de lectura para todos los usuarios

-- Tabla de ubicaciones
ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.ubicaciones FOR SELECT USING (true);

-- Tabla de clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.clientes FOR SELECT USING (true);

-- Tabla de mascotas
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.mascotas FOR SELECT USING (true);