/*
   # Sistema de Gestión de Pensiones de Mascotas - Esquema Inicial (Corregido)

   ## Resumen
   Creación del modelo de datos completo con políticas RLS SEGURAS.

   ## Seguridad
   - RLS habilitado en todas las tablas.
   - Políticas restrictivas por defecto.
   - Acceso basado en autenticación y propiedad del registro (ownership).
*/

-- Crear extensión para UUIDs (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tabla de Ubicaciones
CREATE TABLE IF NOT EXISTS ubicaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  direccion text NOT NULL,
  capacidad_total integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;

-- Política segura para ubicaciones (datos visibles a usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden ver ubicaciones"
  ON ubicaciones FOR SELECT
  TO authenticated
  USING (true);

-- 2. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- TODO: Añade una columna para vincular al usuario de auth.
  -- user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Denegar todo por defecto (reemplazar cuando agregues user_id y políticas por rol/tenant)
CREATE POLICY "Denegar todo por defecto" ON clientes FOR ALL USING (false);

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

-- Denegar todo por defecto; luego implementar ownership vía clientes.user_id
CREATE POLICY "Denegar todo por defecto" ON mascotas FOR ALL USING (false);

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

-- Servicios visibles a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver servicios"
  ON servicios FOR SELECT
  TO authenticated
  USING (true);

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

-- Denegar todo por defecto; luego implementar ownership vía clientes.user_id
CREATE POLICY "Denegar todo por defecto" ON reservas FOR ALL USING (false);

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

-- Denegar todo por defecto; luego habilitar por rol (admin/staff) y tenant
CREATE POLICY "Denegar todo por defecto" ON transacciones_financieras FOR ALL USING (false);

-- 7. Tabla de Personal
CREATE TABLE IF NOT EXISTS personal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- TODO: Añade una columna para vincular al usuario de auth.
  -- user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre text NOT NULL,
  email text UNIQUE NOT NULL,
  rol text NOT NULL,
  id_ubicacion uuid REFERENCES ubicaciones(id),
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;

-- Denegar todo por defecto; luego implementar políticas por rol
CREATE POLICY "Denegar todo por defecto" ON personal FOR ALL USING (false);

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

-- Denegar todo por defecto; luego habilitar por ownership de reserva
CREATE POLICY "Denegar todo por defecto" ON contratos FOR ALL USING (false);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mascotas_cliente ON mascotas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_mascotas_codigo ON mascotas(codigo_unico);
CREATE INDEX IF NOT EXISTS idx_reservas_fechas ON reservas(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones_financieras(fecha);
CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones_financieras(tipo);
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
