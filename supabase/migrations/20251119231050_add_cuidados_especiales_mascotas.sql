-- Agregar campos de cuidados especiales al perfil/protocolo de mascotas
-- Fecha: 2025-11-19

ALTER TABLE public.mascotas
  ADD COLUMN IF NOT EXISTS cuidados_especiales boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS protocolo_medicamentos text,
  ADD COLUMN IF NOT EXISTS protocolo_dietas_especiales text,
  ADD COLUMN IF NOT EXISTS protocolo_cuidado_geriatrico text;