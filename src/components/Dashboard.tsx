import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Users, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Users, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { type View } from '../App';

export function Dashboard({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalMascotas: 0,
    reservasActivas: 0,
    ingresosMes: 0,
    mascotasVacunasVencidas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [clientesRes, mascotasRes, reservasRes, transaccionesRes] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        supabase.from('mascotas').select('*'),
        supabase
          .from('reservas')
          .select('id', { count: 'exact', head: true })
          .eq('estado', 'Confirmada'),
        supabase
          .from('transacciones_financieras')
          .select('monto, tipo')
          .eq('tipo', 'Ingreso')
          .gte('fecha', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      ]);

      const hoy = new Date();
      const mascotasVencidas = mascotasRes.data?.filter((m: any) => {
        if (!m.fecha_ultima_vacuna) return false;
        const fechaVacuna = new Date(m.fecha_ultima_vacuna);
        const mesesDesdeVacuna = (hoy.getTime() - fechaVacuna.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return mesesDesdeVacuna >= 11;
      }).length || 0;

      const ingresos = transaccionesRes.data?.reduce((sum: number, t: any) => sum + Number(t.monto), 0) || 0;

      setStats({
        totalClientes: clientesRes.count || 0,
        totalMascotas: mascotasRes.data?.length || 0,
        reservasActivas: reservasRes.count || 0,
        ingresosMes: ingresos,
        mascotasVacunasVencidas: mascotasVencidas,
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
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Clientes"
          value={stats.totalClientes}
          color="bg-blue-500"
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Total Mascotas"
          value={stats.totalMascotas}
          color="bg-green-500"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title="Reservas Activas"
          value={stats.reservasActivas}
          color="bg-purple-500"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Ingresos del Mes"
          value={`$${stats.ingresosMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          color="bg-emerald-500"
        />
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
            <InfoRow label="Tasa de Ocupación" value="65%" />
            <InfoRow label="Nuevos Clientes (mes)" value="12" />
            <InfoRow label="Servicios Completados" value="45" />
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
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
      <div className={`${color} text-white p-3 rounded-lg mr-4 flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function QuickAction({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      {text}
    </button>
  );
}
export function Dashboard() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalMascotas: 0,
    reservasActivas: 0,
    ingresosMes: 0,
    mascotasVacunasVencidas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [clientesRes, mascotasRes, reservasRes, transaccionesRes] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        supabase.from('mascotas').select('*'),
        supabase.from('reservas').select('id', { count: 'exact', head: true }).eq('estado', 'Confirmada'),
        supabase.from('transacciones_financieras').select('monto, tipo')
          .eq('tipo', 'Ingreso')
          .gte('fecha', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      ]);

      const hoy = new Date();
      const mascotasVencidas = mascotasRes.data?.filter(m => {
        if (!m.fecha_ultima_vacuna) return false;
        const fechaVacuna = new Date(m.fecha_ultima_vacuna);
        const mesesDesdeVacuna = (hoy.getTime() - fechaVacuna.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return mesesDesdeVacuna >= 11;
      }).length || 0;

      const ingresos = transaccionesRes.data?.reduce((sum, t) => sum + Number(t.monto), 0) || 0;

      setStats({
        totalClientes: clientesRes.count || 0,
        totalMascotas: mascotasRes.data?.length || 0,
        reservasActivas: reservasRes.count || 0,
        ingresosMes: ingresos,
        mascotasVacunasVencidas: mascotasVencidas,
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
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Clientes"
          value={stats.totalClientes}
          color="bg-blue-500"
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Total Mascotas"
          value={stats.totalMascotas}
          color="bg-green-500"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title="Reservas Activas"
          value={stats.reservasActivas}
          color="bg-purple-500"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Ingresos del Mes"
          value={`$${stats.ingresosMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          color="bg-emerald-500"
        />
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
            <InfoRow label="Tasa de Ocupación" value="65%" />
            <InfoRow label="Nuevos Clientes (mes)" value="12" />
            <InfoRow label="Servicios Completados" value="45" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <QuickAction text="Ver Calendario" />
            <QuickAction text="Nueva Reserva" />
            <QuickAction text="Registrar Cliente" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function QuickAction({ text }: { text: string }) {
  return (
    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
      {text}
    </button>
  );
}
