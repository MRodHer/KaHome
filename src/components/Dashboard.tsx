import { useEffect, useState, type ReactNode } from 'react';
import { supabaseAdmin } from '../lib/supabase';
import { type View } from '../App';
import { Users, Calendar, DollarSign, AlertCircle } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string | number;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

interface QuickActionProps {
  text: string;
  onClick: () => void;
}

function QuickAction({ text, onClick }: QuickActionProps) {
  return (
    <button onClick={onClick} className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
      {text}
    </button>
  );
}

export const Dashboard = ({ setCurrentView }: { setCurrentView: (view: View) => void }) => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalMascotas: 0,
    reservasActivas: 0,
    ingresosMes: 0,
    mascotasVacunasVencidas: 0,
  });
  const [quickInfo, setQuickInfo] = useState({
    tasaOcupacion: 0,
    nuevosClientesMes: 0,
    serviciosCompletadosMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      const [
        clientesRes,
        mascotasRes,
        reservasActivasRes,
        transaccionesRes,
        nuevosClientesRes,
        serviciosCompletadosRes,
      ] = await Promise.all([
        supabaseAdmin.from('clientes').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('mascotas').select('*'),
        supabaseAdmin.from('reservas').select('id', { count: 'exact', head: true }).eq('estado', 'Confirmada'),
        supabaseAdmin.from('transacciones_financieras').select('monto').eq('tipo', 'Ingreso').gte('fecha', firstDayOfMonth),
        supabaseAdmin.from('clientes').select('id', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
        supabaseAdmin.from('reservas').select('id', { count: 'exact', head: true }).eq('estado', 'Completada').gte('fecha_inicio', firstDayOfMonth),
      ]);

      const hoy = new Date();
      const mascotasVencidas = mascotasRes.data?.filter((m: { fecha_ultima_vacuna?: string }) => {
        if (!m.fecha_ultima_vacuna) return false;
        const fechaVacuna = new Date(m.fecha_ultima_vacuna);
        const mesesDesdeVacuna = (hoy.getTime() - fechaVacuna.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
        return mesesDesdeVacuna >= 11;
      }).length || 0;

      const ingresos = transaccionesRes.data?.reduce((sum: number, t: { monto: string | number }) => sum + Number(t.monto), 0) || 0;

      setStats({
        totalClientes: clientesRes.count || 0,
        totalMascotas: mascotasRes.data?.length || 0,
        reservasActivas: reservasActivasRes.count || 0,
        ingresosMes: ingresos,
        mascotasVacunasVencidas: mascotasVencidas,
      });

      const capacidadTotal = 50;
      const tasaOcupacion = reservasActivasRes.count ? (reservasActivasRes.count / capacidadTotal) * 100 : 0;

      setQuickInfo({
        tasaOcupacion: tasaOcupacion,
        nuevosClientesMes: nuevosClientesRes.count || 0,
        serviciosCompletadosMes: serviciosCompletadosRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="w-6 h-6" />} title="Total Clientes" value={stats.totalClientes} color="bg-blue-500" />
        <StatCard icon={<Users className="w-6 h-6" />} title="Total Mascotas" value={stats.totalMascotas} color="bg-green-500" />
        <StatCard icon={<Calendar className="w-6 h-6" />} title="Reservas Activas" value={stats.reservasActivas} color="bg-purple-500" />
        <StatCard icon={<DollarSign className="w-6 h-6" />} title="Ingresos del Mes" value={`$${stats.ingresosMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} color="bg-emerald-500" />
      </div>

      {stats.mascotasVacunasVencidas > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">Alertas de Vacunación</h3>
              <p className="text-amber-700 mt-1">
                {stats.mascotasVacunasVencidas} mascota{stats.mascotasVacunasVencidas > 1 ? 's' : ''}
                {' '}requiere{stats.mascotasVacunasVencidas > 1 ? 'n' : ''} actualización de vacunas.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Rápida</h2>
          <div className="space-y-3">
            <InfoRow label="Tasa de Ocupación" value={`${quickInfo.tasaOcupacion.toFixed(0)}%`} />
            <InfoRow label="Nuevos Clientes (mes)" value={quickInfo.nuevosClientesMes} />
            <InfoRow label="Servicios Completados" value={quickInfo.serviciosCompletadosMes} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <QuickAction text="Ver Calendario" onClick={() => setCurrentView('reservas')} />
            <QuickAction text="Nueva Reserva" onClick={() => setCurrentView('reservas')} />
            <QuickAction text="Registrar Cliente" onClick={() => setCurrentView('clientes')} />
          </div>
        </div>
      </div>
    </div>
  );
};