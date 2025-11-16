-- Update reservas table to support closing workflow and delivery acceptance
-- 1) Allow new status 'PendienteCierre'
-- 2) Add delivery acceptance fields
-- 3) Allow 'Tarjeta' for metodo_pago_anticipo

begin;

-- Add new columns for delivery acceptance
alter table public.reservas
  add column if not exists acepta_condiciones_entrega boolean default false,
  add column if not exists fecha_entrega timestamptz null;

-- Relax/replace estado CHECK to include 'PendienteCierre'
do $$
declare
  _constraint text;
begin
  -- Try to drop common auto-named constraint if present
  for _constraint in
    select conname from pg_constraint
    where conrelid = 'public.reservas'::regclass
      and contype = 'c'
      and conname like 'reservas_%estado%_check'
  loop
    execute format('alter table public.reservas drop constraint %I', _constraint);
  end loop;
exception when others then null;
end $$;

alter table public.reservas
  add constraint reservas_estado_valid
  check (
    estado is null or estado in ('Confirmada','Cancelada','Completada','PendienteCierre')
  );

-- Update metodo_pago_anticipo CHECK to allow 'Tarjeta'
do $$
declare
  _constraint text;
begin
  for _constraint in
    select conname from pg_constraint
    where conrelid = 'public.reservas'::regclass
      and contype = 'c'
      and conname like 'reservas_%metodo_pago_anticipo%_check'
  loop
    execute format('alter table public.reservas drop constraint %I', _constraint);
  end loop;
exception when others then null;
end $$;

alter table public.reservas
  add constraint reservas_metodo_pago_anticipo_valid
  check (
    metodo_pago_anticipo is null or metodo_pago_anticipo in ('Efectivo','Transferencia','Tarjeta','Pendiente')
  );

commit;