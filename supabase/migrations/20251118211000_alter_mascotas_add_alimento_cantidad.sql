-- Añade columna alimento_cantidad a la tabla mascotas si no existe
-- Esta columna se utiliza para registrar la cantidad de alimento (por ejemplo, tazas por comida)

ALTER TABLE public.mascotas
  ADD COLUMN IF NOT EXISTS alimento_cantidad text NULL;

-- Opcional: si deseas poblarla con un valor por defecto, descomenta la siguiente línea
-- UPDATE public.mascotas SET alimento_cantidad = NULL WHERE alimento_cantidad IS NULL;