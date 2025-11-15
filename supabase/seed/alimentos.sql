/* Poblar alimentos (basado en marcas comunes en México) */
INSERT INTO alimentos (nombre)
VALUES 
  ('Pro Plan'),
  ('Royal Canin'),
  ('Hill\'s Science Diet'),
  ('Nupec'),
  ('Ganador'),
  ('Pedigree'),
  ('Eukanuba')
ON CONFLICT (nombre) DO NOTHING;