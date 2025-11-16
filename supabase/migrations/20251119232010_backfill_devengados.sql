-- Backfill de ingresos devengados para reservas completadas
-- Inserta un "Ingreso" con categoria "Reserva Devengada" por el costo total
-- para reservas que estén en estado Completada y que no tengan ya un devengado registrado.

BEGIN;

INSERT INTO public.transacciones_financieras (
  id_reserva,
  id_ubicacion,
  categoria,
  tipo,
  descripcion,
  monto,
  fecha
)
SELECT
  r.id AS id_reserva,
  r.id_ubicacion,
  'Reserva Devengada' AS categoria,
  'Ingreso' AS tipo,
  'Ingreso devengado Reserva #' || r.id AS descripcion,
  r.costo_total AS monto,
  COALESCE(r.fecha_entrega, r.fecha_fin, now()) AS fecha
FROM public.reservas r
LEFT JOIN public.transacciones_financieras tf
  ON tf.id_reserva = r.id
 AND tf.tipo = 'Ingreso'
 AND tf.categoria IN ('Reserva Devengada', 'Reserva')
WHERE r.estado = 'Completada'
  AND tf.id IS NULL
  AND r.costo_total IS NOT NULL
  AND r.costo_total > 0;

COMMIT;