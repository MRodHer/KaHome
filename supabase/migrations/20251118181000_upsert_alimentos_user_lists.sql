-- Upsert listas de alimentos proporcionadas por el usuario, por especie
-- Asegura nombres exactos y etiqueta correcta en tipo_mascota

-- Gato
-- Gato: primero actualizar existentes, luego insertar faltantes
WITH gato(nombre, tipo_mascota) AS (
  VALUES
    ('Pro Plan Cat', 'Gato'),
    ('Royal Canin Feline', 'Gato'),
    ('Hill''s Science Diet Feline', 'Gato'),
    ('Whiskas', 'Gato'),
    ('Cat Chow', 'Gato'),
    ('Felix', 'Gato'),
    ('Gati', 'Gato'),
    ('Minino / Minino Plus', 'Gato'),
    ('Nucat', 'Gato'),
    ('Gatina', 'Gato'),
    ('Nupec Felino', 'Gato'),
    ('Kirkland', 'Gato')
)
UPDATE public.alimentos a
SET tipo_mascota = g.tipo_mascota
FROM gato g
WHERE a.nombre = g.nombre;

INSERT INTO public.alimentos (nombre, tipo_mascota)
SELECT g.nombre, g.tipo_mascota
FROM gato g
WHERE NOT EXISTS (
  SELECT 1 FROM public.alimentos a WHERE a.nombre = g.nombre
);

-- Perro
-- Perro: primero actualizar existentes, luego insertar faltantes
WITH perro(nombre, tipo_mascota) AS (
  VALUES
    ('Royal Canin', 'Perro'),
    ('Purina Pro Plan', 'Perro'),
    ('Hill''s Science Diet', 'Perro'),
    ('Eukanuba', 'Perro'),
    ('Nupec', 'Perro'),
    ('Pedigree', 'Perro'),
    ('Purina Dog Chow', 'Perro'),
    ('Ganador', 'Perro'),
    ('Purina Beneful', 'Perro'),
    ('Kirkland Signature', 'Perro'),
    ('Purina Campeón', 'Perro'),
    ('Nucan (de Nupec)', 'Perro'),
    ('Purina One', 'Perro'),
    ('Whole Hearted', 'Perro'),
    ('Grand Pet', 'Perro'),
    ('Fulltrust (o Full Life)', 'Perro'),
    ('Instinct', 'Perro'),
    ('Tiër Holistic', 'Perro')
)
UPDATE public.alimentos a
SET tipo_mascota = p.tipo_mascota
FROM perro p
WHERE a.nombre = p.nombre;

INSERT INTO public.alimentos (nombre, tipo_mascota)
SELECT p.nombre, p.tipo_mascota
FROM perro p
WHERE NOT EXISTS (
  SELECT 1 FROM public.alimentos a WHERE a.nombre = p.nombre
);