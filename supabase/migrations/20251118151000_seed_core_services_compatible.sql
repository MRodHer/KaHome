-- Seed core services with compatibility for schemas without tipo_servicio column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'servicios' 
      AND column_name = 'tipo_servicio'
  ) THEN
    INSERT INTO public.servicios (nombre, descripcion, precio_base, tipo_servicio)
    VALUES
      ('Guardería', 'Cuidado diario para mascotas con socialización y actividades.', 250.00, 'Diario'),
      ('Pensión', 'Alojamiento nocturno para mascotas con todas las comodidades.', 400.00, 'Nocturno')
    ON CONFLICT (nombre) DO NOTHING;
  ELSE
    INSERT INTO public.servicios (nombre, descripcion, precio_base)
    VALUES
      ('Guardería', 'Cuidado diario para mascotas con socialización y actividades.', 250.00),
      ('Pensión', 'Alojamiento nocturno para mascotas con todas las comodidades.', 400.00)
    ON CONFLICT (nombre) DO NOTHING;
  END IF;
END $$;