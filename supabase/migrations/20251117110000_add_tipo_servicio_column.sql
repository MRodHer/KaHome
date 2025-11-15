-- Ensure tipo_servicio column exists for servicios table to support core services seed
ALTER TABLE public.servicios
  ADD COLUMN IF NOT EXISTS tipo_servicio TEXT;