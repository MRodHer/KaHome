ALTER TABLE public.mascotas
DROP CONSTRAINT mascotas_id_cliente_fkey;

ALTER TABLE public.mascotas
ADD CONSTRAINT mascotas_id_cliente_fkey
FOREIGN KEY (id_cliente)
REFERENCES public.clientes(id)
ON DELETE CASCADE;