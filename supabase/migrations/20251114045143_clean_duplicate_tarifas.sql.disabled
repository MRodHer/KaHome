DELETE FROM tarifas_peso
WHERE created_at NOT IN (
    SELECT MIN(created_at)
    FROM tarifas_peso
    GROUP BY peso_min, peso_max
);