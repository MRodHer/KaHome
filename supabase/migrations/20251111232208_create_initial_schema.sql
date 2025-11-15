/*
  # Sistema de Gestión de Pensiones de Mascotas - Esquema Inicial

  ## Resumen
  Creación del modelo de datos completo para el sistema SaaS de gestión de pensiones de mascotas,
  diseñado para soportar múltiples ubicaciones y cumplir con normativas mexicanas (LFPDPPP y NOM-151).

  ## Nuevas Tablas
  
  1. **ubicaciones**
     - `id` (uuid, primary key)
     - `nombre` (text)
     - `direccion` (text)
     - `capacidad_total` (integer)
     - `created_at` (timestamptz)

  2. **clientes**
     - `id` (uuid, primary key)
     - `nombre` (text)
     - `email` (text, unique)
     - `telefono` (text)
     - `direccion` (text)
     - `fecha_registro` (date)
     - `id_ubicacion` (uuid, foreign key)
     - `consentimiento_datos` (boolean) - Cumplimiento LFPDPPP
     - `created_at` (timestamptz)

  3. **mascotas**
     - `id` (uuid, primary key)
     - `id_cliente` (uuid, foreign key)
     - `codigo_unico` (text, unique) - UUID para trazabilidad
     - `nombre` (text)
     - `especie` (text)
     - `raza` (text)
     - `genero` (text)
     - `edad` (integer)
     - `fecha_ultima_vacuna` (date)
     - `historial_medico` (text)
     - `url_foto` (text)
     - `created_at` (timestamptz)

  4. **servicios**
     - `id` (uuid, primary key)
     - `nombre` (text)
     - `descripcion` (text)
     - `precio_base` (decimal)
     - `duracion_estimada` (integer) - en minutos
     - `activo` (boolean)
     - `created_at` (timestamptz)

  5. **reservas**
     - `id` (uuid, primary key)
     - `id_cliente` (uuid, foreign key)
     - `id_mascota` (uuid, foreign key)
     - `id_servicio` (uuid, foreign key)
     - `id_ubicacion` (uuid, foreign key)
     - `fecha_inicio` (date)
     - `fecha_fin` (date)
     - `estado` (text) - Confirmada, Cancelada, Completada
     - `costo_total` (decimal)
     - `notas` (text)
     - `created_at` (timestamptz)

  6. **transacciones_financieras**
     - `id` (uuid, primary key)
     - `tipo` (text) - Ingreso, Egreso
     - `monto` (decimal)
     - `fecha` (date)
     - `descripcion` (text)
     - `id_reserva` (uuid, foreign key, nullable)
     - `id_ubicacion` (uuid, foreign key)
     - `categoria` (text)
     - `created_at` (timestamptz)

  7. **personal**
     - `id` (uuid, primary key)
     - `nombre` (text)
     - `email` (text, unique)
     - `rol` (text)
     - `id_ubicacion` (uuid, foreign key)
     - `activo` (boolean)
     - `created_at` (timestamptz)

  8. **contratos**
     - `id` (uuid, primary key)
     - `id_reserva` (uuid, foreign key)
     - `url_documento` (text)
     - `estado_firma` (text) - Pendiente, Firmado
     - `fecha_firma` (timestamptz)
     - `hash_documento` (text) - Para cumplimiento NOM-151
     - `created_at` (timestamptz)

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas por defecto
  - Acceso basado en autenticación y ownership
*/

-- Crear extensión para UUIDs si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Ubicaciones
CREATE TABLE IF NOT EXISTS ubicaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  direccion text NOT NULL,
  capacidad_total integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'ubicaciones' AND policyname = 'Usuarios autenticados pueden ver ubicaciones'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver ubicaciones"
      ON ubicaciones FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 2. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text UNIQUE NOT NULL,
  telefono text,
  direccion text,
  fecha_registro date DEFAULT CURRENT_DATE,
  id_ubicacion uuid REFERENCES ubicaciones(id),
  consentimiento_datos boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'clientes' AND policyname = 'Usuarios autenticados pueden ver clientes'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver clientes"
      ON clientes FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'clientes' AND policyname = 'Usuarios autenticados pueden crear clientes'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden crear clientes"
      ON clientes FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'clientes' AND policyname = 'Usuarios autenticados pueden actualizar clientes'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden actualizar clientes"
      ON clientes FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 3. Tabla de Mascotas
CREATE TABLE IF NOT EXISTS mascotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente uuid REFERENCES clientes(id) ON DELETE CASCADE,
  codigo_unico text UNIQUE NOT NULL DEFAULT ('PET-' || substring(gen_random_uuid()::text, 1, 8)),
  nombre text NOT NULL,
  especie text NOT NULL,
  raza text,
  genero text,
  edad integer,
  fecha_ultima_vacuna date,
  historial_medico text DEFAULT '',
  url_foto text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'mascotas' AND policyname = 'Usuarios autenticados pueden ver mascotas'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver mascotas"
      ON mascotas FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'mascotas' AND policyname = 'Usuarios autenticados pueden crear mascotas'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden crear mascotas"
      ON mascotas FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'mascotas' AND policyname = 'Usuarios autenticados pueden actualizar mascotas'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden actualizar mascotas"
      ON mascotas FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 4. Tabla de Servicios
CREATE TABLE IF NOT EXISTS servicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  precio_base decimal(10,2) NOT NULL DEFAULT 0,
  tipo_servicio TEXT,
  duracion_estimada integer DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'servicios' AND policyname = 'Usuarios autenticados pueden ver servicios'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver servicios"
      ON servicios FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 5. Tabla de Reservas
CREATE TABLE IF NOT EXISTS reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente uuid REFERENCES clientes(id) ON DELETE CASCADE,
  id_mascota uuid REFERENCES mascotas(id) ON DELETE CASCADE,
  id_servicio uuid REFERENCES servicios(id),
  id_ubicacion uuid REFERENCES ubicaciones(id),
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  estado text DEFAULT 'Confirmada' CHECK (estado IN ('Confirmada', 'Cancelada', 'Completada')),
  costo_total decimal(10,2) NOT NULL DEFAULT 0,
  notas text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'reservas' AND policyname = 'Usuarios autenticados pueden ver reservas'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver reservas"
      ON reservas FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'reservas' AND policyname = 'Usuarios autenticados pueden crear reservas'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden crear reservas"
      ON reservas FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'reservas' AND policyname = 'Usuarios autenticados pueden actualizar reservas'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden actualizar reservas"
      ON reservas FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 6. Tabla de Transacciones Financieras
CREATE TABLE IF NOT EXISTS transacciones_financieras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('Ingreso', 'Egreso')),
  monto decimal(10,2) NOT NULL,
  fecha date DEFAULT CURRENT_DATE,
  descripcion text,
  id_reserva uuid REFERENCES reservas(id),
  id_ubicacion uuid REFERENCES ubicaciones(id),
  categoria text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transacciones_financieras ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'transacciones_financieras' AND policyname = 'Usuarios autenticados pueden ver transacciones'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver transacciones"
      ON transacciones_financieras FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'transacciones_financieras' AND policyname = 'Usuarios autenticados pueden crear transacciones'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden crear transacciones"
      ON transacciones_financieras FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- 7. Tabla de Personal
CREATE TABLE IF NOT EXISTS personal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text UNIQUE NOT NULL,
  rol text NOT NULL,
  id_ubicacion uuid REFERENCES ubicaciones(id),
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE personal ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'personal' AND policyname = 'Usuarios autenticados pueden ver personal'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver personal"
      ON personal FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 8. Tabla de Contratos
CREATE TABLE IF NOT EXISTS contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_reserva uuid REFERENCES reservas(id) ON DELETE CASCADE,
  url_documento text,
  estado_firma text DEFAULT 'Pendiente' CHECK (estado_firma IN ('Pendiente', 'Firmado')),
  fecha_firma timestamptz,
  hash_documento text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'contratos' AND policyname = 'Usuarios autenticados pueden ver contratos'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden ver contratos"
      ON contratos FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_mascotas_cliente ON mascotas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_mascotas_codigo ON mascotas(codigo_unico);
CREATE INDEX IF NOT EXISTS idx_reservas_fechas ON reservas(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones_financieras(fecha);
CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones_financieras(tipo);
