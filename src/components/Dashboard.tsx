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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reservasHoy, setReservasHoy] = useState<any[]>([]);
  const [alimentosMap, setAlimentosMap] = useState<Record<string, string>>({});
  const [showProtocolosIncompletos, setShowProtocolosIncompletos] = useState(false);
  const [sortByEstado, setSortByEstado] = useState(false);
  const [expandedCuidados, setExpandedCuidados] = useState<Record<string, boolean>>({});

  function protocoloCompleto(r: any): boolean {
    const horariosOk = Array.isArray(r.alimento_horarios) && r.alimento_horarios.length > 0;
    return Boolean(r.id_alimento && r.alimento_cantidad && r.alimento_frecuencia && horariosOk);
  }

  function protocoloEstado(r: any): 'completo' | 'parcial' | 'faltante' {
    const tieneAlguno = Boolean(r.id_alimento || r.alimento_cantidad || r.alimento_frecuencia || (Array.isArray(r.alimento_horarios) && r.alimento_horarios.length > 0));
    if (protocoloCompleto(r)) return 'completo';
    if (tieneAlguno) return 'parcial';
    return 'faltante';
  }

  function estadoRank(r: any): number {
    const est = protocoloEstado(r);
    return est === 'faltante' ? 0 : est === 'parcial' ? 1 : 2;
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const todayIso = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

      const fetchPromise = Promise.all([
        supabaseAdmin.from('clientes').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('mascotas').select('*'),
        supabaseAdmin.from('reservas').select('id', { count: 'exact', head: true }).eq('estado', 'Confirmada'),
        supabaseAdmin
          .from('transacciones_financieras')
          .select('monto, categoria')
          .eq('tipo', 'Ingreso')
          .gte('fecha', firstDayOfMonth)
          .in('categoria', ['Reserva Devengada', 'Reserva']),
        supabaseAdmin.from('clientes').select('id', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
        supabaseAdmin.from('reservas').select('id', { count: 'exact', head: true }).eq('estado', 'Completada').gte('fecha_inicio', firstDayOfMonth),
        supabaseAdmin.from('reservas').select('*, mascotas(*), clientes(*)')
          .lte('fecha_inicio', todayIso)
          .gte('fecha_fin', todayIso),
        supabaseAdmin.from('alimentos').select('*'),
      ]);
      const TIMEOUT_MS = 8000;
      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Tiempo de carga del panel excedido')), TIMEOUT_MS));
      const [
        clientesRes,
        mascotasRes,
        reservasActivasRes,
        transaccionesRes,
        nuevosClientesRes,
        serviciosCompletadosRes,
        reservasHoyRes,
        alimentosRes,
      ] = await Promise.race([fetchPromise, timeoutPromise]) as any;

      const hoy = new Date();
      const mascotasVencidas = mascotasRes.data?.filter((m: { fecha_ultima_vacuna?: string }) => {
        if (!m.fecha_ultima_vacuna) return false;
        const fechaVacuna = new Date(m.fecha_ultima_vacuna);
        const mesesDesdeVacuna = (hoy.getTime() - fechaVacuna.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
        return mesesDesdeVacuna >= 11;
      }).length || 0;

      const ingresos = transaccionesRes.data?.reduce((sum: number, t: { monto: string | number; categoria?: string | null }) => sum + Number(t.monto), 0) || 0;

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

      setReservasHoy(reservasHoyRes.data || []);
      const amap: Record<string, string> = {};
      alimentosRes.data?.forEach((a: any) => { amap[String(a.id)] = a.nombre; });
      setAlimentosMap(amap);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Error desconocido cargando el panel');
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

  if (errorMsg) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          <p className="font-semibold">No se pudo cargar el panel.</p>
          <p className="text-sm">Detalle: {errorMsg}. Puedes reintentar la carga.</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Reservas Activas Hoy</h2>
            <span className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-800 border border-amber-200" title="Cantidad de reservas con protocolo incompleto">
              Incompletos: {reservasHoy.filter((r) => !protocoloCompleto(r)).length}
            </span>
          </div>
          <button
            onClick={() => setShowProtocolosIncompletos((v) => !v)}
            className={`px-3 py-1 rounded-lg border ${showProtocolosIncompletos ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-gray-300 text-gray-700'} hover:bg-gray-50`}
            title="Mostrar sólo reservas con protocolo incompleto"
          >
            {showProtocolosIncompletos ? 'Protocolos incompletos: ON' : 'Protocolos incompletos: OFF'}
          </button>
          <button
            onClick={() => setSortByEstado((v) => !v)}
            className={`ml-2 px-3 py-1 rounded-lg border ${sortByEstado ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-gray-300 text-gray-700'} hover:bg-gray-50`}
            title="Ordenar por estado del protocolo"
          >
            {sortByEstado ? 'Orden por estado: ON' : 'Orden por estado: OFF'}
          </button>
        </div>
        {reservasHoy.length === 0 ? (
          <p className="text-gray-600">No hay reservas activas hoy.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {(() => {
              const base = showProtocolosIncompletos
                ? reservasHoy.filter((r: any) => !r.id_alimento || !r.alimento_cantidad || !r.alimento_frecuencia || !Array.isArray(r.alimento_horarios) || r.alimento_horarios.length === 0)
                : reservasHoy;
              const sorted = sortByEstado ? [...base].sort((a, b) => estadoRank(a) - estadoRank(b)) : base;
              return sorted.slice(0, 10).map((r: any) => (
              <li key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-800">
                  <span className="font-semibold">{r.mascotas?.nombre}</span>{' '}({r.clientes?.nombre})
                  <span className="ml-2 text-gray-600">#{r.id}</span>
                  {(() => {
                    const est = protocoloEstado(r);
                    const styles = est === 'completo'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : est === 'parcial'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200';
                    const label = est === 'completo' ? 'Protocolo completo' : est === 'parcial' ? 'Protocolo parcial' : 'Protocolo faltante';
                    return (
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded border ${styles}`}>{label}</span>
                    );
                  })()}
                </div>
                <div className="mt-2 sm:mt-0 text-sm text-gray-700">
                  <span className="font-medium">Alimento:</span>{' '}
                  {r.id_alimento && alimentosMap[String(r.id_alimento)] ? alimentosMap[String(r.id_alimento)] : '—'}
                  {' · '}
                  <span className="font-medium">Cantidad:</span>{' '}{r.alimento_cantidad ?? '—'}
                  {' · '}
                  <span className="font-medium">Frecuencia:</span>{' '}{r.alimento_frecuencia ?? '—'}
                  {' · '}
                  <span className="font-medium">Horarios:</span>{' '}
                  {Array.isArray(r.alimento_horarios) && r.alimento_horarios.length > 0 ? r.alimento_horarios.join(', ') : '—'}
                </div>
                {r.pertenencias && typeof r.pertenencias === 'object' && (
                  <div className="mt-2 sm:mt-0 flex flex-wrap gap-1">
                    {Object.entries(r.pertenencias).filter(([_, v]) => Boolean(v)).map(([k]) => (
                      <span key={k} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {String(k).replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
                {r.mascotas && r.mascotas.cuidados_especiales && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setExpandedCuidados(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                      className="text-sm text-blue-700 hover:underline"
                    >
                      {expandedCuidados[r.id] ? 'Ocultar cuidados especiales' : 'Ver cuidados especiales'}
                    </button>
                    {expandedCuidados[r.id] && (
                      <div className="mt-2 border border-blue-100 rounded p-2 bg-blue-50">
                        <div className="text-xs text-gray-700">
                          <div>
                            <span className="font-medium">Administración de medicamentos:</span>{' '}
                            {r.mascotas.protocolo_medicamentos || '—'}
                          </div>
                          <div>
                            <span className="font-medium">Dietas Especiales:</span>{' '}
                            {r.mascotas.protocolo_dietas_especiales || '—'}
                          </div>
                          <div>
                            <span className="font-medium">Cuidado Geriátrico:</span>{' '}
                            {r.mascotas.protocolo_cuidado_geriatrico || '—'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
              ));
            })()}
          </ul>
        )}
      </div>
    </div>
  );
};