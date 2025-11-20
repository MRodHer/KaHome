CREATE TABLE IF NOT EXISTS paises (
  id bigserial PRIMARY KEY,
  nombre text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS estados (
  id bigserial PRIMARY KEY,
  id_pais bigint REFERENCES paises(id),
  nombre text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS municipios (
  id bigserial PRIMARY KEY,
  id_estado bigint REFERENCES estados(id),
  nombre text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS localidades (
  id bigserial PRIMARY KEY,
  id_municipio bigint REFERENCES municipios(id),
  nombre text NOT NULL UNIQUE
);

INSERT INTO paises (nombre) VALUES ('México') ON CONFLICT (nombre) DO NOTHING;

DO $$
DECLARE
  mexico_id bigint;
BEGIN
  SELECT id INTO mexico_id FROM paises WHERE nombre = 'México';

  INSERT INTO estados (id_pais, nombre) VALUES (mexico_id, 'Ciudad de México') ON CONFLICT (nombre) DO NOTHING;
  INSERT INTO estados (id_pais, nombre) VALUES (mexico_id, 'Jalisco') ON CONFLICT (nombre) DO NOTHING;
  INSERT INTO estados (id_pais, nombre) VALUES (mexico_id, 'Nuevo León') ON CONFLICT (nombre) DO NOTHING;
END
$$;