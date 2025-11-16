-- Upsert bandas de peso y tarifas actuales
-- Límites: inferior inclusivo, superior exclusivo salvo última banda

INSERT INTO public.tarifas_peso (peso_min, peso_max, tarifa_noche, tarifa_guarderia)
VALUES
  (0, 5, 250.00, 100.00),
  (5, 10, 270.00, 120.00),
  (10, 15, 290.00, 140.00),
  (15, 20, 310.00, 160.00),
  (20, 25, 330.00, 180.00),
  (25, 30, 350.00, 200.00),
  (30, 35, 370.00, 220.00),
  (35, 100, 390.00, 240.00)
ON CONFLICT (peso_min, peso_max)
DO UPDATE SET
  tarifa_noche = EXCLUDED.tarifa_noche,
  tarifa_guarderia = EXCLUDED.tarifa_guarderia;

-- Opcional: eliminar bandas fuera del set actual (descomentar si se requiere limpieza estricta)
-- DELETE FROM public.tarifas_peso t
-- WHERE NOT EXISTS (
--   SELECT 1 FROM (
--     VALUES (0,5), (5,10), (10,15), (15,20), (20,25), (25,30), (30,35), (35,100)
--   ) AS v(pmin, pmax)
--   WHERE v.pmin = t.peso_min AND v.pmax = t.peso_max
-- );