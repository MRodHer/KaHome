/* Poblar la tabla de ubicaciones (ejecutar una sola vez) */
/* Esta es la ubicación por defecto que usará el sistema */
INSERT INTO ubicaciones (nombre, direccion, capacidad_total)
VALUES 
  ('Pensión CDMX Centro', 'Calle Falsa 123, Ciudad de México', 50)
ON CONFLICT (nombre) DO NOTHING;