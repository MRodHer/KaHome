-- PetCare Kahome! v1.2 – Actualización de esquema
-- Fecha: 2025-11-13
-- Esta migración añade:
-- 1. Campos de dirección estructurada en clientes (Request 2)
-- 2. Campos de anticipo y método de pago en reservas (Request 5 y 6)

-- 1. Actualización de la tabla clientes para dirección estructurada
ALTER TABLE clientes 
  DROP COLUMN IF EXISTS direccion,
  ADD COLUMN IF NOT EXISTS calle_numero text,
  ADD COLUMN IF NOT EXISTS colonia text,
  ADD COLUMN IF NOT EXISTS codigo_postal text,
  ADD COLUMN IF NOT EXISTS municipio text,
  ADD COLUMN IF NOT EXISTS estado text;

-- 2. Actualización de la tabla reservas para anticipos y pago
ALTER TABLE reservas 
  ADD COLUMN IF NOT EXISTS metodo_pago_anticipo text CHECK (metodo_pago_anticipo IN ('Efectivo', 'Transferencia', 'Pendiente')) DEFAULT 'Pendiente',
  ADD COLUMN IF NOT EXISTS monto_anticipo decimal(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS monto_restante decimal(10,2) DEFAULT 0.00;