INSERT INTO public.alimentos (nombre, tipo_mascota)
VALUES
    ('Pro Plan', 'Perro'),
    ('Royal Canin', 'Perro'),
    ('Hill''s Science Diet', 'Perro'),
    ('Eukanuba', 'Perro'),
    ('Nupec', 'Perro'),
    ('Pedigree', 'Perro'),
    ('Dog Chow', 'Perro'),
    ('Beneful', 'Perro'),
    ('Ganador', 'Perro'),
    ('Kirkland', 'Perro'),
    ('Cesar', 'Perro'),
    ('Campeón', 'Perro'),
    ('Pal', 'Perro'),
    ('Nucan', 'Perro'),
    ('Taste of the Wild', 'Perro'),
    ('Instinct', 'Perro'),
    ('Solid Gold', 'Perro'),
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
ON CONFLICT DO NOTHING;

-- Rehabilitar RLS
ALTER TABLE public.alimentos ENABLE ROW LEVEL SECURITY;
-- Deshabilitar RLS temporalmente para insertar semillas de alimentos
ALTER TABLE public.alimentos DISABLE ROW LEVEL SECURITY;