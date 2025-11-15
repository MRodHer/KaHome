-- Poblar la tabla tarifas_peso (ejecutar una sola vez)
INSERT INTO tarifas_peso (peso_min, peso_max, tarifa_noche, tarifa_guarderia)
VALUES
  (0, 5, 250.00, 100.00),
  (5, 10, 270.00, 120.00),
  (10, 15, 290.00, 140.00),
  (15, 20, 310.00, 160.00),
  (20, 25, 330.00, 180.00),
  (25, 30, 350.00, 200.00),
  (30, 35, 370.00, 220.00),
  (35, 100, 390.00, 240.00)
ON CONFLICT (peso_min, peso_max) DO NOTHING;