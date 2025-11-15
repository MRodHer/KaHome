DO $$
BEGIN
  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='mascotas' AND column_name='url_foto') THEN
    ALTER TABLE mascotas ADD COLUMN url_foto TEXT;
  END IF;
END
$$;