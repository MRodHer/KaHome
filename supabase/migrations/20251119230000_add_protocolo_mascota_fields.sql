-- Protocolo de manejo en perfil de mascotas
-- Fecha: 2025-11-19
-- Agrega campos para registrar alimento preferido y hábitos en mascotas

ALTER TABLE public.mascotas
  ADD COLUMN IF NOT EXISTS id_alimento uuid REFERENCES public.alimentos(id),
  ADD COLUMN IF NOT EXISTS alimento_cantidad text,
  ADD COLUMN IF NOT EXISTS alimento_frecuencia text,
  ADD COLUMN IF NOT EXISTS alimento_horarios text;