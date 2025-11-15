DO $$
BEGIN
  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='reservas' AND column_name='monto_anticipo') THEN
    ALTER TABLE public.reservas ADD COLUMN monto_anticipo numeric;
  END IF;
  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='reservas' AND column_name='monto_restante') THEN
    ALTER TABLE public.reservas ADD COLUMN monto_restante numeric;
  END IF;
  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='reservas' AND column_name='metodo_pago_anticipo') THEN
    ALTER TABLE public.reservas ADD COLUMN metodo_pago_anticipo text;
  END IF;
END
$$;