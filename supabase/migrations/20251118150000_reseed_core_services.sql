-- supabase/migrations/20251118150000_reseed_core_services.sql

-- Re-seed core services to ensure they exist, avoiding errors if they are already present.
INSERT INTO services (nombre, descripcion, precio_base, tipo_servicio) VALUES
('Guardería', 'Cuidado diario para mascotas con socialización y actividades.', 250.00, 'Diario'),
('Pensión', 'Alojamiento nocturno para mascotas con todas las comodidades.', 400.00, 'Nocturno')
ON CONFLICT (nombre) DO NOTHING;