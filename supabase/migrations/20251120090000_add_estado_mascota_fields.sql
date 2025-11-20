-- Agrega campos de estado/actividad y esterilización al perfil de mascotas
-- Fecha: 2025-11-20

ALTER TABLE public.mascotas
  ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS esterilizado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS motivo_inactivo text;

COMMENT ON COLUMN public.mascotas.activo IS 'Indica si el perfil está activo y debe mostrarse en listados';
COMMENT ON COLUMN public.mascotas.esterilizado IS 'Indica si la mascota está esterilizada';
COMMENT ON COLUMN public.mascotas.motivo_inactivo IS 'Razón de inactividad (por ejemplo, difunto, transferido, etc.)';