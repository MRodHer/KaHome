INSERT INTO public.servicios (nombre, descripcion, precio_base, tipo_servicio)
VALUES
    ('Guardería', 'Cuidado diario de la mascota, sin pernocta.', 250.00, 'Diario'),
    ('Pensión', 'Alojamiento nocturno para la mascota.', 350.00, 'Nocturno')
ON CONFLICT (nombre) DO NOTHING;