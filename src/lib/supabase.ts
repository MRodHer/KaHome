import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or ANON KEY');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
// En frontend, evitamos usar SERVICE_KEY. Para compatibilidad, alias supabaseAdmin a supabase.
export const supabaseAdmin = supabase;

// Tipos derivados del esquema generado automáticamente
export type Cliente = Database['public']['Tables']['clientes']['Row'];
export type Mascota = Database['public']['Tables']['mascotas']['Row'];
export type Servicio = Database['public']['Tables']['servicios']['Row'];
export type Reserva = Database['public']['Tables']['reservas']['Row'];
export type TransaccionFinanciera = Database['public']['Tables']['transacciones_financieras']['Row'];
export type Ubicacion = Database['public']['Tables']['ubicaciones']['Row'];
export type TarifaPeso = Database['public']['Tables']['tarifas_peso']['Row'];
export type ServicioExtra = Database['public']['Tables']['servicios_extra']['Row'];
export type ReservaServicioExtra = Database['public']['Tables']['reserva_servicios_extra']['Row'];
export type Alimento = Database['public']['Tables']['alimentos']['Row'];
