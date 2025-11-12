import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Cliente = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  fecha_registro: string;
  id_ubicacion: string | null;
  consentimiento_datos: boolean;
  created_at: string;
};

export type Mascota = {
  id: string;
  id_cliente: string;
  codigo_unico: string;
  nombre: string;
  especie: string;
  raza: string | null;
  genero: string | null;
  edad: number | null;
  fecha_ultima_vacuna: string | null;
  historial_medico: string;
  url_foto: string | null;
  created_at: string;
};

export type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  duracion_estimada: number;
  activo: boolean;
  created_at: string;
};

export type Reserva = {
  id: string;
  id_cliente: string;
  id_mascota: string;
  id_servicio: string;
  id_ubicacion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'Confirmada' | 'Cancelada' | 'Completada';
  costo_total: number;
  notas: string | null;
  created_at: string;
};

export type TransaccionFinanciera = {
  id: string;
  tipo: 'Ingreso' | 'Egreso';
  monto: number;
  fecha: string;
  descripcion: string | null;
  id_reserva: string | null;
  id_ubicacion: string | null;
  categoria: string | null;
  created_at: string;
};

export type Ubicacion = {
  id: string;
  nombre: string;
  direccion: string;
  capacidad_total: number;
  created_at: string;
};
