ALTER TABLE public.reservas
ADD COLUMN monto_anticipo numeric,
ADD COLUMN monto_restante numeric,
ADD COLUMN metodo_pago_anticipo text;