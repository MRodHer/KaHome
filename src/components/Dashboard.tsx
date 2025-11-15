import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { type View } from '../App';
import ClientesMascotas from './ClientesMascotas';
import Reservas from './Reservas';
import ConsumoAlimentos from './ConsumoAlimentos';
import Finanzas from './Finanzas';
import { Notificaciones } from './Notificaciones';
import { LayoutDashboard, Users, Calendar, DollarSign, Menu, X, BarChart2, Bell, AlertCircle, Dog } from 'lucide-react';

// Define MenuItem type
interface MenuItem {
  id: View;
  label: string;
  icon: React.ElementType;
}

// --- DashboardContent Component ---
const DashboardContent = ({ setCurrentView }: { setCurrentView: (view: View) => void }) => {
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
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        supabase.from('mascotas').select('*'),
        supabase.from('reservas').select('id', { count: 'exact', head: true }).eq('estado', 'Confirmada'),
        supabase.from('transacciones_financieras').select('monto').eq('tipo', 'Ingreso').gte('fecha', firstDayOfMonth),
        supabase.from('clientes').select('id', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
        supabase.from('reservas').select('id', { count: 'exact', head: true }).eq('estado', 'Completada').gte('fecha_inicio', firstDayOfMonth),
      ]);

      const hoy = new Date();
      const mascotasVencidas = mascotasRes.data?.filter((m: { fecha_ultima_vacuna?: string }) => {
        if (!m.fecha_ultima_vacuna) return false;
        const fechaVacuna = new Date(m.fecha_ultima_vacuna);
        const mesesDesdeVacuna = (hoy.getTime() - fechaVacuna.getTime()) / (1000 * 60 * 60 * 24 * 30.44); // More precise
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

      const capacidadTotal = 50; // Assuming a total capacity of 50 spaces
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
                {' '''}requiere{stats.mascotasVacunasVencidas > 1 ? 'n' : ''} actualización de vacunas.
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

// --- Helper Components ---
function StatCard({ icon, title, value, color }: { icon: ReactNode; title: string; value: string | number; color: string }) {
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

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function QuickAction({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
      {text}
    </button>
  );
}

// --- Main Dashboard Component ---
const Dashboard: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isMenuOpen, setMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes y Mascotas', icon: Users },
    { id: 'reservas', label: 'Reservas', icon: Calendar },
    { id: 'consumo', label: 'Consumo', icon: BarChart2 },
    { id: 'finanzas', label: 'Finanzas', icon: DollarSign },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  ];

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardContent setCurrentView={setView} />;
      case 'clientes':
        return <ClientesMascotas />;
      case 'reservas':
        return <Reservas />;
      case 'consumo':
        return <ConsumoAlimentos />;
      case 'finanzas':
        return <Finanzas />;
      case 'notificaciones':
        return <Notificaciones />;
      default:
        return <DashboardContent setCurrentView={setView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${isMenuOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col`}>
        <div className="flex items-center justify-center h-20 border-b border-gray-200">
          <Dog className={`text-blue-600 h-8 w-8 transition-transform duration-300 ${!isMenuOpen && 'rotate-45'}`} />
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                view === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className={`ml-4 transition-opacity ${!isMenuOpen && 'opacity-0 hidden'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex items-center justify-between p-4">
          <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-900 md:hidden">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Ka-Home</h1>
          <div>{/* Placeholder for user menu or other actions */}</div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;