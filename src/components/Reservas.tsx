import { useEffect, useState } from 'react';
import { supabaseAdmin, type Reserva, type Cliente, type Mascota, type Servicio, type TarifaPeso, type ServicioExtra, type Alimento } from '../lib/supabase';
import { Calendar as CalendarIcon, Plus, Filter, Edit3, Trash2, CheckCircle, CreditCard } from 'lucide-react';

export function Reservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [tarifasPeso, setTarifasPeso] = useState<TarifaPeso[]>([]);
  const [serviciosExtra, setServiciosExtra] = useState<ServicioExtra[]>([]);
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('Todas');
  const [showNewReservaForm, setShowNewReservaForm] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [closingReserva, setClosingReserva] = useState<Reserva | null>(null);

  // Formateo seguro de fechas para evitar errores de "Invalid time value"
  const formatDateSafe = (value?: string | null) => {
    try {
      if (!value) return '-';
      const d = new Date(value);
      return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setLoadError(null);
    try {
      const TIMEOUT_MS = 8000;
      const fetchPromise = Promise.all([
        supabaseAdmin.from('reservas').select('*').order('fecha_inicio', { ascending: false }),
        supabaseAdmin.from('clientes').select('*'),
        supabaseAdmin.from('mascotas').select('*'),
        supabaseAdmin.from('servicios').select('*'),
        supabaseAdmin.from('tarifas_peso').select('*').order('peso_min', { ascending: true }),
        supabaseAdmin.from('servicios_extra').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('alimentos').select('*').order('nombre', { ascending: true }),
      ]);
      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Tiempo de carga excedido')), TIMEOUT_MS));
      const [reservasRes, clientesRes, mascotasRes, serviciosRes, tarifasRes, extrasRes, alimentosRes] = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (reservasRes.data) setReservas(reservasRes.data);
      if (clientesRes.data) setClientes(clientesRes.data);
      if (mascotasRes.data) setMascotas(mascotasRes.data);
      if (serviciosRes.data) {
        console.log('Servicios cargados:', serviciosRes.data);
        setServicios(serviciosRes.data);
      }
      if (tarifasRes.data) setTarifasPeso(tarifasRes.data);
      if (extrasRes.data) setServiciosExtra(extrasRes.data);
      if (alimentosRes.data) setAlimentos(alimentosRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadError(error instanceof Error ? error.message : 'Error desconocido al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteReserva = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      try {
        // También podrías querer eliminar registros relacionados en otras tablas
        // (transacciones, contratos, etc.) o manejarlo con políticas de Supabase (ON DELETE CASCADE)
        await supabaseAdmin.from('reservas').delete().eq('id', id);
        setReservas(reservas.filter(r => r.id !== id));
        alert('Reserva eliminada con éxito.');
      } catch (error: any) {
        alert(`Error al eliminar la reserva: ${error.message}`);
      }
    }
  };

  const reservasFiltradas = reservas.filter(r =>
    filtroEstado === 'Todas' || r.estado === filtroEstado
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          <p className="font-semibold">No se pudieron cargar los datos.</p>
          <p className="text-sm">Detalle: {loadError}. Intenta recargar o reintentar la carga.</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar carga
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
        <button
          onClick={() => setShowNewReservaForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Reserva
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Todas">Todas las reservas</option>
            <option value="Confirmada">Confirmadas</option>
            <option value="Completada">Completadas</option>
            <option value="Cancelada">Canceladas</option>
            <option value="PendienteCierre">Pendientes por cerrar</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {reservasFiltradas.map((reserva) => {
            const cliente = clientes.find(c => c.id === reserva.id_cliente);
            const mascota = mascotas.find(m => m.id === reserva.id_mascota);
            const servicio = servicios.find(s => s.id === reserva.id_servicio);

            return (
              <div
                key={reserva.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {mascota?.nombre || 'Mascota no encontrada'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        reserva.estado === 'Confirmada' ? 'bg-green-100 text-green-700' :
                        reserva.estado === 'Completada' ? 'bg-blue-100 text-blue-700' :
                        reserva.estado === 'PendienteCierre' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {reserva.estado}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Cliente</p>
                        <p className="font-medium text-gray-900">{cliente?.nombre || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Servicio</p>
                        <p className="font-medium text-gray-900">{servicio?.nombre || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fechas</p>
                        <p className="font-medium text-gray-900">
                          {formatDateSafe(reserva.fecha_inicio)} - {formatDateSafe(reserva.fecha_fin)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Costo Total</p>
                        <p className="font-medium text-gray-900">
                          ${Number(reserva.costo_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    {reserva.notas && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">{reserva.notas}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                      <CalendarIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setClosingReserva(reserva)}
                      className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded"
                      title="Cerrar / Entregar"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setEditingReserva(reserva)}
                      className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteReserva(reserva.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {reservasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay reservas para mostrar</p>
          </div>
        )}
      </div>

      {showNewReservaForm && (
        <NewReservaModal
          clientes={clientes}
          mascotas={mascotas}
          servicios={servicios}
          tarifasPeso={tarifasPeso}
          serviciosExtra={serviciosExtra}
          alimentos={alimentos}
          onClose={() => setShowNewReservaForm(false)}
          onSuccess={loadData}
        />
      )}

      {editingReserva && (
        <EditReservaModal
          reserva={editingReserva}
          clientes={clientes}
          mascotas={mascotas}
          servicios={servicios}
          tarifasPeso={tarifasPeso}
          serviciosExtra={serviciosExtra}
          alimentos={alimentos}
          onClose={() => setEditingReserva(null)}
          onSuccess={() => {
            setEditingReserva(null);
            loadData();
          }}
        />
      )}

      {closingReserva && (
        <CerrarReservaModal
          reserva={closingReserva}
          onClose={() => setClosingReserva(null)}
          onSuccess={() => {
            setClosingReserva(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function CerrarReservaModal({
  reserva,
  onClose,
  onSuccess,
}: {
  reserva: Reserva;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [metodoPago, setMetodoPago] = useState<string>('');
  const [aceptaCondiciones, setAceptaCondiciones] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const residual = Math.max(Number(reserva.monto_restante || 0), 0);

  const cerrarConPago = async () => {
    try {
      setSubmitting(true);
      const allowedMethods = ['Efectivo', 'Transferencia', 'Tarjeta'];
      if (!aceptaCondiciones) {
        throw new Error('Debes aceptar las condiciones de entrega.');
      }
      if (residual > 0 && !allowedMethods.includes(metodoPago)) {
        throw new Error('Selecciona el método de pago: Efectivo, Transferencia o Tarjeta.');
      }

      // Registrar pago final si hay residual
      if (residual > 0) {
        const { error: txError } = await supabaseAdmin.from('transacciones_financieras').insert({
          id_reserva: reserva.id,
          id_ubicacion: (reserva as any).id_ubicacion ?? null,
          categoria: 'Pago final',
          tipo: 'Ingreso',
          descripcion: `Pago final Reserva #${reserva.id}`,
          monto: residual,
          fecha: new Date().toISOString(),
          metodo_pago: metodoPago,
        } as any);
        if (txError) throw txError;
      }

      // Actualizar estado de la reserva a Completada y marcar entrega
      const { error: updateError } = await supabaseAdmin
        .from('reservas')
        .update({
          estado: 'Completada',
          monto_restante: 0,
          acepta_condiciones_entrega: true,
          fecha_entrega: new Date().toISOString(),
        } as any)
        .eq('id', reserva.id);
      if (updateError) throw updateError;

      alert('Reserva cerrada correctamente.');
      onSuccess();
    } catch (err: any) {
      alert(`No se pudo cerrar la reserva: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const entregarConPendiente = async () => {
    try {
      setSubmitting(true);
      if (!aceptaCondiciones) {
        throw new Error('Debes aceptar las condiciones de entrega.');
      }

      const { error: updateError } = await supabaseAdmin
        .from('reservas')
        .update({
          estado: 'PendienteCierre',
          acepta_condiciones_entrega: true,
          fecha_entrega: new Date().toISOString(),
        } as any)
        .eq('id', reserva.id);
      if (updateError) throw updateError;

      alert('Reserva marcada como entregada con pago pendiente.');
      onSuccess();
    } catch (err: any) {
      alert(`No se pudo actualizar la reserva: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cerrar / Entregar Reserva</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-gray-600">Cliente</div>
              <div className="text-gray-900 font-semibold">{reserva.id_cliente ?? '-'}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-gray-600">Mascota</div>
              <div className="text-gray-900 font-semibold">{reserva.id_mascota ?? '-'}</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Saldo pendiente</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${residual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
          </div>

          {residual > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="metodo_pago_cierre" value="Efectivo" checked={metodoPago==='Efectivo'} onChange={e=>setMetodoPago(e.target.value)} />
                  <span>Efectivo</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="metodo_pago_cierre" value="Transferencia" checked={metodoPago==='Transferencia'} onChange={e=>setMetodoPago(e.target.value)} />
                  <span>Transferencia</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="metodo_pago_cierre" value="Tarjeta" checked={metodoPago==='Tarjeta'} onChange={e=>setMetodoPago(e.target.value)} />
                  <span>Tarjeta</span>
                </label>
              </div>
            </div>
          )}

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={aceptaCondiciones}
              onChange={e => setAceptaCondiciones(e.target.checked)}
            />
            <span>
              Acepto las condiciones de entrega y reconozco que la responsabilidad de KaHome respecto a la mascota termina en este momento, independientemente de pagos pendientes.
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={entregarConPendiente}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400"
              disabled={submitting || !aceptaCondiciones}
            >
              Entregar con pago pendiente
            </button>
            <button
              type="button"
              onClick={cerrarConPago}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              disabled={submitting || !aceptaCondiciones || (residual > 0 && !metodoPago)}
            >
              Cerrar y pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewReservaModal({
  clientes,
  mascotas,
  servicios,
  tarifasPeso,
  serviciosExtra,
  alimentos,
  onClose,
  onSuccess,
}: {
  clientes: Cliente[];
  mascotas: Mascota[];
  servicios: Servicio[];
  tarifasPeso: TarifaPeso[];
  serviciosExtra: ServicioExtra[];
  alimentos: Alimento[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [clienteSearch, setClienteSearch] = useState('');
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_mascota: '',
    selected_mascotas: [] as string[],
    id_servicio: '',
    fecha_inicio: '',
    fecha_fin: '',
    notas: '',
    pertenencias: {
      correa: false,
      pechera: false,
      platos: false,
      cama: false,
      cobija: false,
      juguetes: false,
      ropa: false,
      collar: false,
      vaso_medidor: false,
    },
    id_alimento: '',
    nuevo_alimento: '',
    alimento_cantidad: '',
    alimento_frecuencia: '',
    alimento_horarios: '',
    servicios_extra_seleccionados: {} as Record<string, boolean>,
    solicita_factura: false,
    metodo_pago_anticipo: '',
    monto_anticipo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [costos, setCostos] = useState({ subtotal: 0, iva: 0, total: 0, dias: 0, tarifa_diaria: 0 });
  const [usarProtocoloMascota, setUsarProtocoloMascota] = useState(false);
  const [mostrarCuidadosEspeciales, setMostrarCuidadosEspeciales] = useState(false);

  // Listas estáticas proporcionadas por el usuario
  const ALIMENTOS_GATO = [
    'Pro Plan Cat',
    'Royal Canin Feline',
    "Hill's Science Diet Feline",
    'Whiskas',
    'Cat Chow',
    'Felix',
    'Gati',
    'Minino / Minino Plus',
    'Nucat',
    'Gatina',
    'Nupec Felino',
    'Kirkland',
  ];
  const ALIMENTOS_PERRO = [
    'Royal Canin',
    'Purina Pro Plan',
    "Hill's Science Diet",
    'Eukanuba',
    'Nupec',
    'Pedigree',
    'Purina Dog Chow',
    'Ganador',
    'Purina Beneful',
    'Kirkland Signature',
    'Purina Campeón',
    'Nucan (de Nupec)',
    'Purina One',
    'Whole Hearted',
    'Grand Pet',
    'Fulltrust (o Full Life)',
    'Instinct',
    'Tiër Holistic',
  ];

  const clientesFiltrados = clienteSearch.trim()
    ? clientes.filter(c => c.nombre.toLowerCase().includes(clienteSearch.trim().toLowerCase()))
    : clientes;

  const mascotasDelCliente = formData.id_cliente
    ? mascotas.filter(m => m.id_cliente === formData.id_cliente)
    : [];

const servicioSeleccionado = (() => {
  if (!formData.id_servicio) return undefined;
  if (formData.id_servicio === 'pension') return servicios.find(s => s.nombre === 'Pensión');
  if (formData.id_servicio === 'guarderia') return servicios.find(s => s.nombre === 'Guardería');
  return servicios.find(s => s.id === formData.id_servicio);
})();
  const clienteSeleccionado = clientes.find(c => c.id === formData.id_cliente);
  const mascotasSeleccionadas = (formData.selected_mascotas || [])
    .map(id => mascotas.find(m => m.id === id))
    .filter(Boolean) as Mascota[];
  const mascotaSeleccionada = mascotasSeleccionadas[0] || mascotas.find(m => m.id === formData.id_mascota);

  const [detalleCostosMascotas, setDetalleCostosMascotas] = useState<Record<string, { subtotal: number; iva: number; total: number; dias: number; tarifa_diaria: number }>>({});
  // Recalcular costos por mascota y totales combinados
  useEffect(() => {
    if (!servicioSeleccionado || !formData.fecha_inicio || !formData.fecha_fin) {
      setDetalleCostosMascotas({});
      setCostos({ subtotal: 0, iva: 0, total: 0, dias: 0, tarifa_diaria: 0 });
      return;
    }
    const seleccion = mascotasSeleccionadas.length > 0
      ? mascotasSeleccionadas
      : (formData.id_mascota ? [mascotas.find(m => m.id === formData.id_mascota)].filter(Boolean) as Mascota[] : []);
    if (seleccion.length === 0) {
      setDetalleCostosMascotas({});
      setCostos({ subtotal: 0, iva: 0, total: 0, dias: 0, tarifa_diaria: 0 });
      return;
    }
    const det: Record<string, { subtotal: number; iva: number; total: number; dias: number; tarifa_diaria: number }> = {};
    let subtotal = 0, iva = 0, total = 0, dias = 0;
    for (const pet of seleccion) {
      const c = calcularCostosReserva(
        { ...formData, id_mascota: pet.id },
        servicioSeleccionado,
        pet,
        tarifasPeso,
        serviciosExtra
      );
      det[pet.id] = c;
      subtotal += c.subtotal;
      iva += c.iva;
      total += c.total;
      dias = c.dias; // mismo rango de fechas para todas
    }
    setDetalleCostosMascotas(det);
    setCostos({ subtotal, iva, total, dias, tarifa_diaria: 0 });
  }, [
    formData.fecha_inicio,
    formData.fecha_fin,
    formData.id_servicio,
    formData.id_mascota,
    formData.selected_mascotas,
    formData.solicita_factura,
    formData.servicios_extra_seleccionados,
    servicioSeleccionado,
    tarifasPeso,
    serviciosExtra,
  ]);

  // Sincroniza fechas para Guardería: un solo día (fin = inicio)
  useEffect(() => {
    if (formData.id_servicio === 'guarderia' && formData.fecha_inicio && formData.fecha_fin !== formData.fecha_inicio) {
      setFormData({ ...formData, fecha_fin: formData.fecha_inicio });
    }
  }, [formData.id_servicio, formData.fecha_inicio]);

  // Precarga protocolo de manejo de la mascota seleccionada en Paso 2
  useEffect(() => {
    // Si seleccionó múltiples mascotas, desactivar uso de protocolo automático
    if ((formData.selected_mascotas || []).length > 1) {
      setUsarProtocoloMascota(false);
      return;
    }
    if (step !== 2) return;
    if (!mascotaSeleccionada) return;
    const p: any = mascotaSeleccionada;
    const hasProtocol = !!(p?.id_alimento || p?.alimento_cantidad || p?.alimento_frecuencia || p?.alimento_horarios);
    if (!hasProtocol) {
      setUsarProtocoloMascota(false);
      return;
    }
    // Activar bandera y aplicar protocolo si los campos están vacíos o si ya se estaba usando protocolo
    setUsarProtocoloMascota(prev => {
      const camposVacios = !formData.id_alimento && !formData.alimento_cantidad && !formData.alimento_frecuencia && !formData.alimento_horarios;
      const shouldApply = prev || camposVacios;
      if (shouldApply) {
        setFormData(fd => ({
          ...fd,
          id_alimento: p.id_alimento ?? fd.id_alimento,
          alimento_cantidad: p.alimento_cantidad != null ? String(p.alimento_cantidad) : fd.alimento_cantidad,
          alimento_frecuencia: p.alimento_frecuencia != null ? String(p.alimento_frecuencia) : fd.alimento_frecuencia,
          alimento_horarios: p.alimento_horarios ?? fd.alimento_horarios,
        }));
      }
      return true;
    });
  }, [step, mascotaSeleccionada?.id, formData.selected_mascotas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!servicioSeleccionado) {
        throw new Error('Servicio no configurado. Asegúrate de tener Pensión o Guardería en la tabla servicios.');
      }

      // Validación de método de pago del anticipo
      const montoAnticipoNum = Number(formData.monto_anticipo) || 0;
      const allowedMethods = ['Efectivo', 'Transferencia', 'Tarjeta'];
      if (montoAnticipoNum > 0 && !allowedMethods.includes(formData.metodo_pago_anticipo)) {
        throw new Error('Selecciona el método de pago del anticipo: Efectivo, Transferencia o Tarjeta.');
      }

      let alimentoId = formData.id_alimento;
      if (alimentoId === 'otro' && formData.nuevo_alimento) {
        const { data: nuevoAlimento, error: alimentoError } = await supabaseAdmin
          .from('alimentos')
          .insert({ nombre: formData.nuevo_alimento } as any)
          .select()
          .single();
        if (alimentoError) throw alimentoError;
        alimentoId = nuevoAlimento.id;
      }
      // Recalcular costos por mascota y validar
      const seleccion = (formData.selected_mascotas || []).length > 0
        ? (formData.selected_mascotas || []).map(id => mascotas.find(m => m.id === id)).filter(Boolean) as Mascota[]
        : (formData.id_mascota ? [mascotas.find(m => m.id === formData.id_mascota)].filter(Boolean) as Mascota[] : []);
      const costosPets = seleccion.map(m => ({
        mascota: m,
        costos: calcularCostosReserva(
          { ...formData, id_mascota: m.id },
          servicioSeleccionado,
          m,
          tarifasPeso,
          serviciosExtra
        )
      }));
      const dias = costosPets[0]?.costos.dias || 0;
      const total = costosPets.reduce((sum, c) => sum + c.costos.total, 0);
      const iva = costosPets.reduce((sum, c) => sum + c.costos.iva, 0);
      if (total === 0 || dias === 0) {
        throw new Error('Fechas inválidas o datos incompletos para calcular el costo.');
      }

      // Distribuir anticipo proporcionalmente
      const anticipo = montoAnticipoNum;
      const proporciones = total > 0 ? costosPets.map(c => c.costos.total / total) : costosPets.map(() => 0);
      const sharesRaw = proporciones.map(p => Math.round(p * anticipo * 100) / 100);
      const diff = Math.round((anticipo - sharesRaw.reduce((a,b)=>a+b,0)) * 100) / 100;
      if (sharesRaw.length > 0) sharesRaw[sharesRaw.length - 1] = Math.round((sharesRaw[sharesRaw.length - 1] + diff) * 100) / 100;

      // Crear una reserva por cada mascota seleccionada
      for (let i = 0; i < costosPets.length; i++) {
        const { mascota: m, costos: c } = costosPets[i];
        const shareAnticipo = anticipo > 0 ? sharesRaw[i] : 0;
        const reservaData = {
          id_cliente: formData.id_cliente,
          id_mascota: m.id,
          id_servicio: servicioSeleccionado.id,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          notas: formData.notas,
          pertenencias: formData.pertenencias,
          id_alimento: alimentoId,
          alimento_cantidad: formData.alimento_cantidad,
          alimento_frecuencia: formData.alimento_frecuencia,
          alimento_horarios: formData.alimento_horarios,
          costo_total: c.total,
          costo_iva: c.iva,
          solicita_factura: formData.solicita_factura,
          estado: 'Confirmada',
          monto_anticipo: shareAnticipo > 0 ? shareAnticipo : null,
          metodo_pago_anticipo: shareAnticipo > 0 ? formData.metodo_pago_anticipo : null,
          monto_restante: Math.max(c.total - shareAnticipo, 0),
        } as any;

        const { data: reserva, error: reservaError } = await supabaseAdmin
          .from('reservas')
          .insert(reservaData)
          .select()
          .single();
        if (reservaError) throw reservaError;

        // Generar contrato (simulado)
        try {
          const urlDocumentoSimulada = `/api/contratos/generar?id=${reserva.id}`;
          await supabaseAdmin.from('contratos').insert([
            { id_reserva: reserva.id, url_documento: urlDocumentoSimulada, estado_firma: 'Pendiente' },
          ]);
        } catch (contratoError) {
          console.error('Error al generar contrato:', contratoError);
        }

        // Servicios extra
        const serviciosParaGuardar: { id_reserva: string; id_servicio_extra: string; cantidad: number; precio_cobrado: number }[] = [];
        for (const servicioId in formData.servicios_extra_seleccionados) {
          if (formData.servicios_extra_seleccionados[servicioId]) {
            const extra = serviciosExtra.find(s => s.id === servicioId);
            if (extra) {
              const esPorDia = /\(por día\)/i.test(extra.nombre);
              const cantidad = esPorDia ? dias : 1;
              serviciosParaGuardar.push({
                id_reserva: reserva.id,
                id_servicio_extra: extra.id,
                cantidad,
                precio_cobrado: Number(extra.precio),
              });
            }
          }
        }
        if (serviciosParaGuardar.length > 0) {
          const { error: rseError } = await supabaseAdmin.from('reserva_servicios_extra').insert(serviciosParaGuardar);
          if (rseError) throw rseError;
        }

        // Eliminado: no registrar ingreso por "Reserva" al crearla
        // para evitar doble conteo. Se registrará al cierre.

        // Transacción por anticipo por mascota
        if (shareAnticipo > 0) {
          const anticipoData = {
            id_reserva: reserva.id,
            id_ubicacion: (reserva as any).id_ubicacion ?? null,
            categoria: 'Anticipo',
            tipo: 'Ingreso',
            descripcion: `Anticipo Reserva #${reserva.id} (${m.nombre})`,
            monto: shareAnticipo,
            fecha: new Date().toISOString(),
            metodo_pago: formData.metodo_pago_anticipo,
          } as any;
          const { error: anticipoError } = await supabaseAdmin.from('transacciones_financieras').insert(anticipoData);
          if (anticipoError) throw anticipoError;
        }
      }

      alert('Reserva creada con éxito!');
      onClose();
      onSuccess();
    } catch (error: any) {
      alert(`Error al crear la reserva: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nueva Reserva - Paso {step} de 2</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente*</label>
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  required
                  value={formData.id_cliente}
                  onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value, id_mascota: '', selected_mascotas: [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientesFiltrados.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {formData.id_cliente && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mascotas*</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mascotasDelCliente.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 text-sm border border-gray-200 rounded p-2">
                        <input
                          type="checkbox"
                          checked={(formData.selected_mascotas || []).includes(m.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              selected_mascotas: checked
                                ? [ ...(prev.selected_mascotas || []), m.id ]
                                : (prev.selected_mascotas || []).filter(id => id !== m.id)
                            }));
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-900">
                          {m.nombre}
                          {m.peso != null && (
                            <sub className="ml-1 text-xs text-gray-500">
                              {typeof m.peso === 'number' ? `${m.peso} kg` : String(m.peso)}
                            </sub>
                          )}
                        </span>
                        <span className="text-gray-500">({m.especie})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio*</label>
                <select
                  required
                  value={formData.id_servicio}
                  onChange={(e) => setFormData({ ...formData, id_servicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar servicio</option>
                  <option value="pension">Pensión</option>
                  <option value="guarderia">Guardería</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.id_servicio === 'guarderia' ? (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha*</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_inicio}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormData({ ...formData, fecha_inicio: v, fecha_fin: v });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio*</label>
                      <input
                        type="date"
                        required
                        value={formData.fecha_inicio}
                        onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin*</label>
                      <input
                        type="date"
                        required
                        value={formData.fecha_fin}
                        min={formData.fecha_inicio}
                        onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {mascotaSeleccionada && (
                <div className="flex items-center justify-between p-3 border border-blue-100 bg-blue-50 rounded">
                  <label className="flex items-center gap-2 text-sm text-blue-900">
                    <input
                      type="checkbox"
                      checked={usarProtocoloMascota}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUsarProtocoloMascota(checked);
                        if (checked && mascotaSeleccionada) {
                          const p: any = mascotaSeleccionada;
                          setFormData(fd => ({
                            ...fd,
                            id_alimento: p.id_alimento ?? fd.id_alimento,
                            alimento_cantidad: p.alimento_cantidad != null ? String(p.alimento_cantidad) : fd.alimento_cantidad,
                            alimento_frecuencia: p.alimento_frecuencia != null ? String(p.alimento_frecuencia) : fd.alimento_frecuencia,
                            alimento_horarios: p.alimento_horarios ?? fd.alimento_horarios,
                          }));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Usar protocolo guardado de {mascotaSeleccionada?.nombre}</span>
                  </label>
                  {usarProtocoloMascota && (
                    <button
                      type="button"
                      onClick={() => setUsarProtocoloMascota(false)}
                      className="text-sm text-blue-700 hover:underline"
                    >
                      Modificar
                    </button>
                  )}
                </div>
              )}
              {/* Cuidados especiales de la mascota seleccionada */}
              {mascotaSeleccionada?.cuidados_especiales && (
                <div className="mt-4 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Cuidados Especiales</h3>
                    <button
                      type="button"
                      onClick={() => setMostrarCuidadosEspeciales(prev => !prev)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {mostrarCuidadosEspeciales ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {mostrarCuidadosEspeciales && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Administración de medicamentos</p>
                        <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{(mascotaSeleccionada as any).protocolo_medicamentos || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Dietas Especiales</p>
                        <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{(mascotaSeleccionada as any).protocolo_dietas_especiales || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Cuidado Geriátrico</p>
                        <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{(mascotaSeleccionada as any).protocolo_cuidado_geriatrico || '—'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Instrucciones especiales, cuidados particulares..."
                />
              </div>

              {/* Checklist de pertenencias */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="px-2 text-sm font-semibold text-gray-700">Pertenencias</legend>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.keys(formData.pertenencias).map((key) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(formData.pertenencias as any)[key]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pertenencias: { ...formData.pertenencias, [key]: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Sección de Alimento */}
              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="px-2 text-sm font-semibold text-gray-700">Alimento</legend>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                    {/** Filtra y fusiona listas según especie de la mascota seleccionada */}
                    {(() => {
                      const especie = mascotaSeleccionada?.especie?.toLowerCase();
                      const etiqueta = especie === 'perro' ? 'Perro' : especie === 'gato' ? 'Gato' : undefined;
                      const hasTipo = alimentos.some((a: any) => a && 'tipo_mascota' in a && a.tipo_mascota);
                      const alimentosDb = etiqueta
                        ? (hasTipo ? alimentos.filter((a: any) => a.tipo_mascota === etiqueta) : alimentos)
                        : alimentos;
                      const nombresDb = new Set(alimentosDb.map((a) => a.nombre.toLowerCase()));
                      const staticList = etiqueta === 'Perro' ? ALIMENTOS_PERRO : etiqueta === 'Gato' ? ALIMENTOS_GATO : [];
                      const staticExtras = staticList.filter((n) => !nombresDb.has(n.toLowerCase()));
                      const handleMarcaChange = (val: string) => {
                        if (val.startsWith('static:')) {
                          const nombre = val.replace('static:', '');
                          setFormData({ ...formData, id_alimento: 'otro', nuevo_alimento: nombre });
                        } else {
                          setFormData({ ...formData, id_alimento: val, nuevo_alimento: '' });
                        }
                      };
                      return (
                        <select
                          value={formData.id_alimento === 'otro' && formData.nuevo_alimento ? `static:${formData.nuevo_alimento}` : formData.id_alimento}
                          onChange={(e) => handleMarcaChange(e.target.value)}
                          disabled={usarProtocoloMascota}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar alimento</option>
                          {alimentosDb.map((a) => (
                            <option key={a.id} value={a.id}>{a.nombre}</option>
                          ))}
                          {staticExtras.map((n) => (
                            <option key={`static-${n}`} value={`static:${n}`}>{n}</option>
                          ))}
                          <option value="otro">Otro (especificar)</option>
                        </select>
                      );
                    })()}
                  </div>
                  {formData.id_alimento === 'otro' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Marca de Alimento</label>
                      <input
                        type="text"
                        required
                        value={formData.nuevo_alimento}
                        onChange={(e) => setFormData({ ...formData, nuevo_alimento: e.target.value })}
                        disabled={usarProtocoloMascota}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Escribe la marca"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (tazas)</label>
                      <input
                        type="number"
                        step="0.25"
                        value={formData.alimento_cantidad}
                        onChange={(e) => setFormData({ ...formData, alimento_cantidad: e.target.value })}
                        disabled={usarProtocoloMascota}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia (veces al día)</label>
                      <input
                        type="number"
                        value={formData.alimento_frecuencia}
                        onChange={(e) => setFormData({ ...formData, alimento_frecuencia: e.target.value })}
                        disabled={usarProtocoloMascota}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horarios</label>
                    <input
                      type="text"
                      value={formData.alimento_horarios}
                      onChange={(e) => setFormData({ ...formData, alimento_horarios: e.target.value })}
                      placeholder="Ej. 8:00 AM, 1:00 PM, 7:00 PM"
                      disabled={usarProtocoloMascota}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Servicios Extra */}
              {serviciosExtra.length > 0 && (
                <fieldset className="border border-gray-200 rounded-lg p-4">
                  <legend className="px-2 text-sm font-semibold text-gray-700">Servicios Extra</legend>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {serviciosExtra.map((extra) => (
                      <label key={extra.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!formData.servicios_extra_seleccionados[extra.id]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              servicios_extra_seleccionados: {
                                ...formData.servicios_extra_seleccionados,
                                [extra.id]: e.target.checked,
                              },
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{extra.nombre} - ${Number(extra.precio).toLocaleString('es-MX')}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* Facturación y Resumen */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.solicita_factura}
                    onChange={(e) => setFormData({ ...formData, solicita_factura: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Solicitar Factura (Añade 16% IVA)
                </label>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                  {/* Detalle por mascota */}
                  {(formData.selected_mascotas || []).length > 0 && (
                    <div className="space-y-2">
                      {(formData.selected_mascotas || []).map((id) => {
                        const m = mascotas.find(mm => mm.id === id);
                        const dc = m ? detalleCostosMascotas[id] : undefined;
                        if (!m || !dc) return null;
                        return (
                          <div key={id} className="grid grid-cols-4 gap-4">
                            <div className="border border-gray-200 rounded-lg p-3">
                              <div className="text-gray-600">Mascota</div>
                              <div className="text-gray-900 font-semibold">
                                {m.nombre}
                                {m.peso != null && (
                                  <sub className="ml-1 text-xs text-gray-500">
                                    {typeof m.peso === 'number' ? `${m.peso} kg` : String(m.peso)}
                                  </sub>
                                )}
                              </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-3">
                              <div className="text-gray-600">Días</div>
                              <div className="text-gray-900 font-semibold">{dc.dias}</div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-3">
                              <div className="text-gray-600">Tarifa diaria</div>
                              <div className="text-gray-900 font-semibold">${dc.tarifa_diaria.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-3">
                              <div className="text-gray-600">Subtotal</div>
                              <div className="text-gray-900 font-semibold">${dc.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Totales combinados (mostrar sólo si no es exactamente una mascota) */}
                  {((formData.selected_mascotas || []).length !== 1) && (
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-gray-600">Días</div>
                        <div className="text-gray-900 font-semibold">{costos.dias}</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-gray-600">Subtotal</div>
                        <div className="text-gray-900 font-semibold">${costos.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-gray-600">Total</div>
                        <div className="text-gray-900 font-semibold">${costos.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  )}
                  {formData.solicita_factura && (
                    <div className="flex justify-between">
                      <span>IVA (16%):</span>
                      <span className="font-medium">${costos.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total:</span>
                    <span>${costos.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anticipo</label>
                    <input
                      type="number"
                      placeholder="Monto"
                      value={formData.monto_anticipo}
                      onChange={e => {
                        const val = e.target.value;
                        const amount = Number(val || 0);
                        setFormData(prev => ({
                          ...prev,
                          monto_anticipo: val,
                          ...(amount <= 0 ? { metodo_pago_anticipo: '' } : {})
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {Number(formData.monto_anticipo || 0) > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago del Anticipo</label>
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="metodo_pago_anticipo"
                            value="Efectivo"
                            checked={formData.metodo_pago_anticipo === 'Efectivo'}
                            onChange={e => setFormData({ ...formData, metodo_pago_anticipo: e.target.value })}
                          />
                          <span>Efectivo</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="metodo_pago_anticipo"
                            value="Transferencia"
                            checked={formData.metodo_pago_anticipo === 'Transferencia'}
                            onChange={e => setFormData({ ...formData, metodo_pago_anticipo: e.target.value })}
                          />
                          <span>Transferencia</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="metodo_pago_anticipo"
                            value="Tarjeta"
                            checked={formData.metodo_pago_anticipo === 'Tarjeta'}
                            onChange={e => setFormData({ ...formData, metodo_pago_anticipo: e.target.value })}
                          />
                          <span>Tarjeta</span>
                        </label>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pendiente</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {(() => {
                        const anticipo = Number(formData.monto_anticipo || 0);
                        const pendiente = Math.max((costos.total || 0) - anticipo, 0);
                        return `$${pendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={
                  !formData.id_cliente ||
                  !(formData.selected_mascotas && formData.selected_mascotas.length > 0) ||
                  !formData.id_servicio ||
                  !formData.fecha_inicio ||
                  (formData.id_servicio === 'pension' && !formData.fecha_fin)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Continuar
              </button>
            )}
            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={submitting || costos.total === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {submitting ? 'Guardando...' : 'Confirmar Reserva'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function EditReservaModal({ 
  reserva, 
  clientes, 
  mascotas, 
  servicios, 
  tarifasPeso, 
  serviciosExtra, 
  alimentos, 
  onClose, 
  onSuccess 
}: {
  reserva: Reserva;
  clientes: Cliente[];
  mascotas: Mascota[];
  servicios: Servicio[];
  tarifasPeso: TarifaPeso[];
  serviciosExtra: ServicioExtra[];
  alimentos: Alimento[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    ...reserva,
    fecha_inicio: new Date(reserva.fecha_inicio).toISOString().split('T')[0],
    fecha_fin: new Date(reserva.fecha_fin).toISOString().split('T')[0],
    servicios_extra_seleccionados: {} as Record<string, boolean>,
    nuevo_alimento: '' as string,
  });
  const [submitting, setSubmitting] = useState(false);
  const [costos, setCostos] = useState({ subtotal: 0, iva: 0, total: 0, dias: 0, tarifa_diaria: 0 });
  const [usarProtocoloMascota, setUsarProtocoloMascota] = useState(false);
  const [mostrarCuidadosEspeciales, setMostrarCuidadosEspeciales] = useState(false);
  const defaultPertenencias = {
    correa: false,
    pechera: false,
    platos: false,
    cama: false,
    cobija: false,
    juguetes: false,
    ropa: false,
    collar: false,
    vaso_medidor: false,
  };
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      pertenencias: (prev as any).pertenencias && typeof (prev as any).pertenencias === 'object'
        ? (prev as any).pertenencias
        : defaultPertenencias,
    }));
  }, []);

  // Listas estáticas de alimentos
  const ALIMENTOS_GATO = [
    'Pro Plan Cat',
    'Royal Canin Feline',
    "Hill's Science Diet Feline",
    'Whiskas',
    'Cat Chow',
    'Felix',
    'Gati',
    'Minino / Minino Plus',
    'Nucat',
    'Gatina',
    'Nupec Felino',
    'Kirkland',
  ];
  const ALIMENTOS_PERRO = [
    'Royal Canin',
    'Purina Pro Plan',
    "Hill's Science Diet",
    'Eukanuba',
    'Nupec',
    'Pedigree',
    'Purina Dog Chow',
    'Ganador',
    'Purina Beneful',
    'Kirkland Signature',
    'Purina Campeón',
    'Nucan (de Nupec)',
    'Purina One',
    'Whole Hearted',
    'Grand Pet',
    'Fulltrust (o Full Life)',
    'Instinct',
    'Tiër Holistic',
  ];

  // Lógica para cargar servicios extra existentes
  useEffect(() => {
    const fetchServicios = async () => {
      const { data } = await supabaseAdmin
        .from('reserva_servicios_extra')
        .select('id_servicio_extra')
        .eq('id_reserva', reserva.id);
      
      const seleccionados: Record<string, boolean> = {};
      if (data) {
        data.forEach(item => {
          if (item.id_servicio_extra) {
            seleccionados[item.id_servicio_extra] = true;
          }
        });
      }
      setFormData(prev => ({ ...prev, servicios_extra_seleccionados: seleccionados }));
    };
    fetchServicios();
  }, [reserva.id]);

  const mascotaSeleccionada = mascotas.find(m => m.id === formData.id_mascota);
  const servicioSeleccionado = servicios.find(s => s.id === formData.id_servicio);

  // Recalcular costos cuando cambien inputs relevantes
  useEffect(() => {
    const nuevosCostos = calcularCostosReserva(
      formData,
      servicioSeleccionado,
      mascotaSeleccionada,
      tarifasPeso,
      serviciosExtra
    );
    setCostos(nuevosCostos);
  }, [
    formData.fecha_inicio,
    formData.fecha_fin,
    formData.id_servicio,
    formData.id_mascota,
    formData.solicita_factura,
    formData.servicios_extra_seleccionados,
    servicioSeleccionado,
    mascotaSeleccionada,
    tarifasPeso,
    serviciosExtra,
  ]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { iva, total, dias } = calcularCostosReserva(
        formData,
        servicioSeleccionado,
        mascotaSeleccionada,
        tarifasPeso,
        serviciosExtra
      );

      // Validación de método de pago del anticipo
      const montoAnticipoNum = Number(formData.monto_anticipo) || 0;
      const allowedMethods = ['Efectivo', 'Transferencia', 'Tarjeta'];
      if (montoAnticipoNum > 0 && !allowedMethods.includes((formData as any).metodo_pago_anticipo)) {
        throw new Error('Selecciona el método de pago del anticipo: Efectivo, Transferencia o Tarjeta.');
      }

      // Resolver id_alimento cuando se usa "Otro"
      let alimentoId: any = (formData as any).id_alimento;
      if (alimentoId === 'otro' && (formData as any).nuevo_alimento) {
        const { data: nuevoAlimento, error: alimentoError } = await supabaseAdmin
          .from('alimentos')
          .insert({ nombre: (formData as any).nuevo_alimento } as any)
          .select()
          .single();
        if (alimentoError) throw alimentoError;
        alimentoId = nuevoAlimento.id;
      }

      const reservaUpdate = {
        ...formData,
        id_alimento: alimentoId,
        costo_total: total,
        costo_iva: iva,
        monto_anticipo: montoAnticipoNum > 0 ? montoAnticipoNum : null,
        metodo_pago_anticipo: montoAnticipoNum > 0 ? (formData as any).metodo_pago_anticipo : null,
        monto_restante: Math.max(total - montoAnticipoNum, 0),
      };
      
      delete (reservaUpdate as any).servicios_extra_seleccionados;
      delete (reservaUpdate as any).nuevo_alimento;

      const { error: updateError } = await supabaseAdmin
        .from('reservas')
        .update(reservaUpdate)
        .eq('id', reserva.id);

      if (updateError) throw updateError;

      // Registrar ingreso devengado por el total del servicio
      const { error: devengadoError } = await supabaseAdmin.from('transacciones_financieras').insert({
        id_reserva: reserva.id,
        id_ubicacion: (reserva as any).id_ubicacion ?? null,
        categoria: 'Reserva Devengada',
        tipo: 'Ingreso',
        descripcion: `Ingreso devengado Reserva #${reserva.id}`,
        monto: Number((reserva as any).costo_total ?? 0),
        fecha: new Date().toISOString(),
      } as any);
      if (devengadoError) throw devengadoError;

      // Actualizar servicios extra
      await supabaseAdmin.from('reserva_servicios_extra').delete().eq('id_reserva', reserva.id);
      
      const serviciosParaGuardar: any[] = [];
      for (const servicioId in formData.servicios_extra_seleccionados) {
        if (formData.servicios_extra_seleccionados[servicioId]) {
          const extra = serviciosExtra.find(s => s.id === servicioId);
          if (extra) {
            const esPorDia = /\(por día\)/i.test(extra.nombre);
            const cantidad = esPorDia ? dias : 1;
            serviciosParaGuardar.push({
              id_reserva: reserva.id,
              id_servicio_extra: extra.id,
              cantidad,
              precio_cobrado: Number(extra.precio),
            });
          }
        }
      }

      if (serviciosParaGuardar.length > 0) {
        const { error: rseError } = await supabaseAdmin.from('reserva_servicios_extra').insert(serviciosParaGuardar);
        if (rseError) throw rseError;
      }

      alert('Reserva actualizada con éxito.');
      onSuccess();
    } catch (error: any) {
      alert(`Error al actualizar la reserva: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Editar Reserva</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos del formulario - similares a NewReservaModal pero con valores de formData */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio*</label>
              <input
                type="date"
                required
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin*</label>
              <input
                type="date"
                required
                value={formData.fecha_fin}
                min={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select
          value={formData.estado ?? ''}
          onChange={e => setFormData({...formData, estado: e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option value="Confirmada">Confirmada</option>
      <option value="Completada">Completada</option>
      <option value="Cancelada">Cancelada</option>
      <option value="PendienteCierre">PendienteCierre</option>
    </select>
  </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          value={(formData as any).notas ?? ''}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Instrucciones especiales, cuidados particulares..."
        />
      </div>

      {/* Cuidados especiales de la mascota seleccionada */}
      {mascotaSeleccionada?.cuidados_especiales && (
        <div className="mt-2 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Cuidados Especiales</h3>
            <button
              type="button"
              onClick={() => setMostrarCuidadosEspeciales(prev => !prev)}
              className="text-sm text-blue-600 hover:underline"
            >
              {mostrarCuidadosEspeciales ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {mostrarCuidadosEspeciales && (
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Administración de medicamentos</p>
                <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{(mascotaSeleccionada as any).protocolo_medicamentos || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Dietas Especiales</p>
                <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{(mascotaSeleccionada as any).protocolo_dietas_especiales || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Cuidado Geriátrico</p>
                <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{(mascotaSeleccionada as any).protocolo_cuidado_geriatrico || '—'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pertenencias */}
      <fieldset className="border border-gray-200 rounded-lg p-4">
        <legend className="px-2 text-sm font-semibold text-gray-700">Pertenencias</legend>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {Object.keys((formData as any).pertenencias || defaultPertenencias).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!((formData as any).pertenencias?.[key])}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pertenencias: { ...((formData as any).pertenencias || defaultPertenencias), [key]: e.target.checked },
                  })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Protocolo y Alimento */}
      {mascotaSeleccionada && (
        <div className="flex items-center justify-between p-3 border border-blue-100 bg-blue-50 rounded">
          <label className="flex items-center gap-2 text-sm text-blue-900">
            <input
              type="checkbox"
              checked={usarProtocoloMascota}
              onChange={(e) => {
                const checked = e.target.checked;
                setUsarProtocoloMascota(checked);
                if (checked && mascotaSeleccionada) {
                  const p: any = mascotaSeleccionada;
                  setFormData(fd => ({
                    ...fd,
                    id_alimento: p.id_alimento ?? fd.id_alimento,
                    alimento_cantidad: p.alimento_cantidad != null ? String(p.alimento_cantidad) : fd.alimento_cantidad,
                    alimento_frecuencia: p.alimento_frecuencia != null ? String(p.alimento_frecuencia) : fd.alimento_frecuencia,
                    alimento_horarios: p.alimento_horarios ?? fd.alimento_horarios,
                  }));
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Usar protocolo guardado de {mascotaSeleccionada?.nombre}</span>
          </label>
          {usarProtocoloMascota && (
            <button
              type="button"
              onClick={() => setUsarProtocoloMascota(false)}
              className="text-sm text-blue-700 hover:underline"
            >
              Modificar
            </button>
          )}
        </div>
      )}

      <fieldset className="border border-gray-200 rounded-lg p-4">
        <legend className="px-2 text-sm font-semibold text-gray-700">Alimento</legend>
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            {(() => {
              const especie = mascotaSeleccionada?.especie?.toLowerCase();
                      const etiqueta = especie === 'perro' ? 'Perro' : especie === 'gato' ? 'Gato' : undefined;
                      const hasTipo = alimentos.some((a: any) => a && 'tipo_mascota' in a && a.tipo_mascota);
                      const alimentosDb = etiqueta
                        ? (hasTipo ? alimentos.filter((a: any) => a.tipo_mascota === etiqueta) : alimentos)
                        : alimentos;
              const nombresDb = new Set(alimentosDb.map((a) => a.nombre.toLowerCase()));
              const staticList = etiqueta === 'Perro' ? ALIMENTOS_PERRO : etiqueta === 'Gato' ? ALIMENTOS_GATO : [];
              const staticExtras = staticList.filter((n) => !nombresDb.has(n.toLowerCase()));
              const handleMarcaChange = (val: string) => {
                if (val.startsWith('static:')) {
                  const nombre = val.replace('static:', '');
                  setFormData({ ...formData, id_alimento: 'otro', nuevo_alimento: nombre });
                } else {
                  setFormData({ ...formData, id_alimento: val, nuevo_alimento: '' });
                }
              };
              return (
                <select
                  value={formData.id_alimento === 'otro' && (formData as any).nuevo_alimento ? `static:${(formData as any).nuevo_alimento}` : (formData as any).id_alimento ?? ''}
                  onChange={(e) => handleMarcaChange(e.target.value)}
                  disabled={usarProtocoloMascota}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar alimento</option>
                  {alimentosDb.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                  {staticExtras.map((n) => (
                    <option key={`static-${n}`} value={`static:${n}`}>{n}</option>
                  ))}
                  <option value="otro">Otro (especificar)</option>
                </select>
              );
            })()}
          </div>
          {(formData as any).id_alimento === 'otro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Marca de Alimento</label>
              <input
                type="text"
                required
                value={(formData as any).nuevo_alimento}
                onChange={(e) => setFormData({ ...formData, nuevo_alimento: e.target.value })}
                disabled={usarProtocoloMascota}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe la marca"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (tazas)</label>
              <input
                type="number"
                step="0.25"
                value={(formData as any).alimento_cantidad ?? ''}
                onChange={(e) => setFormData({ ...formData, alimento_cantidad: e.target.value })}
                disabled={usarProtocoloMascota}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia (veces al día)</label>
              <input
                type="number"
                value={(formData as any).alimento_frecuencia ?? ''}
                onChange={(e) => setFormData({ ...formData, alimento_frecuencia: e.target.value })}
                disabled={usarProtocoloMascota}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horarios</label>
            <input
              type="text"
              value={(formData as any).alimento_horarios ?? ''}
              onChange={(e) => setFormData({ ...formData, alimento_horarios: e.target.value })}
              placeholder="Ej. 8:00 AM, 1:00 PM, 7:00 PM"
              disabled={usarProtocoloMascota}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </fieldset>

      {/* Facturación y Resumen */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!formData.solicita_factura}
            onChange={(e) => setFormData({ ...formData, solicita_factura: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Solicitar Factura (Añade 16% IVA)
        </label>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
          {/* Peso ya mostrado como subíndice junto al nombre; se omite aquí para evitar duplicidad */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-gray-600">Tarifa diaria</div>
              <div className="text-gray-900 font-semibold">${costos.tarifa_diaria.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-gray-600">Días</div>
              <div className="text-gray-900 font-semibold">{costos.dias}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-gray-600">Subtotal</div>
              <div className="text-gray-900 font-semibold">${costos.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          {!!formData.solicita_factura && (
            <div className="flex justify-between">
              <span>IVA (16%):</span>
              <span className="font-medium">${costos.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Total:</span>
            <span>${costos.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anticipo</label>
            <input
              type="number"
              placeholder="Monto"
              value={(formData as any).monto_anticipo ?? ''}
              onChange={e => {
                const val = e.target.value;
                const amount = Number(val || 0);
                setFormData(prev => ({
                  ...prev,
                  monto_anticipo: val,
                  ...(amount <= 0 ? { metodo_pago_anticipo: '' } : {})
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {Number(((formData as any).monto_anticipo) || 0) > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago del Anticipo</label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="metodo_pago_anticipo_edit"
                    value="Efectivo"
                    checked={(formData as any).metodo_pago_anticipo === 'Efectivo'}
                    onChange={e => setFormData({ ...formData, metodo_pago_anticipo: e.target.value })}
                  />
                  <span>Efectivo</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="metodo_pago_anticipo_edit"
                    value="Transferencia"
                    checked={(formData as any).metodo_pago_anticipo === 'Transferencia'}
                    onChange={e => setFormData({ ...formData, metodo_pago_anticipo: e.target.value })}
                  />
                  <span>Transferencia</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="metodo_pago_anticipo_edit"
                    value="Tarjeta"
                    checked={(formData as any).metodo_pago_anticipo === 'Tarjeta'}
                    onChange={e => setFormData({ ...formData, metodo_pago_anticipo: e.target.value })}
                  />
                  <span>Tarjeta</span>
                </label>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pendiente</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              {(() => {
                const anticipo = Number((formData as any).monto_anticipo || 0);
                const pendiente = Math.max((costos.total || 0) - anticipo, 0);
                return `$${pendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
              })()}
            </div>
          </div>
        </div>
      </div>


          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function calcularCostosReserva(
  formData: any, // El tipo del estado formData
  servicioSeleccionado: Servicio | undefined,
  mascotaSeleccionada: Mascota | undefined,
  tarifasPeso: TarifaPeso[],
  serviciosExtra: ServicioExtra[]
) {
  if (!servicioSeleccionado || !formData.fecha_inicio || !formData.fecha_fin || !mascotaSeleccionada) {
    return { subtotal: 0, iva: 0, total: 0, dias: 0, tarifa_diaria: 0 };
  }

  try {
    const inicio = new Date(formData.fecha_inicio);
    const fin = new Date(formData.fecha_fin);
    if (fin < inicio) return { subtotal: 0, iva: 0, total: 0, dias: 0, tarifa_diaria: 0 };

    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Tarifa por peso (límite inferior inclusivo, superior exclusivo salvo última banda)
    let tarifaDiaria = servicioSeleccionado.precio_base;
    // Parseo robusto de peso desde la mascota (acepta string, coma decimal y textos)
    const rawPeso: any = (mascotaSeleccionada as any)?.peso;
    let peso = 0;
    if (typeof rawPeso === 'number') {
      peso = rawPeso;
    } else if (typeof rawPeso === 'string') {
      const cleaned = rawPeso.replace(/,/g, '.').match(/-?\d+(?:\.\d+)?/);
      peso = cleaned ? parseFloat(cleaned[0]) : 0;
    }
    // Detección robusta del tipo de servicio: soporta acentos y variaciones
    const nombreLower = (servicioSeleccionado.nombre || '').toLowerCase();
    const tipoLower = (servicioSeleccionado.tipo_servicio || '').toLowerCase();
    const esPension = nombreLower.includes('pensión') || nombreLower.includes('pension') || tipoLower.includes('noct');
    const esGuarderia = nombreLower.includes('guardería') || nombreLower.includes('guarderia') || tipoLower.includes('diar');

    // Override local de bandas y tarifas, según especificación proporcionada
    const overrideBands = [
      { min: 0, max: 5, noche: 250, guarderia: 100 },
      { min: 5, max: 10, noche: 270, guarderia: 120 },
      { min: 10, max: 15, noche: 290, guarderia: 140 },
      { min: 15, max: 20, noche: 310, guarderia: 160 },
      { min: 20, max: 25, noche: 330, guarderia: 180 },
      { min: 25, max: 30, noche: 350, guarderia: 200 },
      { min: 30, max: 35, noche: 370, guarderia: 220 },
      { min: 35, max: 100, noche: 390, guarderia: 240 },
    ];

    const overrideMatch = overrideBands.find((b, i) => {
      const esPrimera = i === 0;
      const cumpleInferior = esPrimera ? peso >= b.min : peso > b.min;
      const cumpleSuperior = peso <= b.max;
      return cumpleInferior && cumpleSuperior;
    });
    if (overrideMatch) {
      tarifaDiaria = esPension ? overrideMatch.noche : esGuarderia ? overrideMatch.guarderia : servicioSeleccionado.precio_base;
    } else {
      const tarifasOrdenadas = [...tarifasPeso].sort((a, b) => a.peso_min - b.peso_min);
      let tarifaData: TarifaPeso | undefined;
      for (let i = 0; i < tarifasOrdenadas.length; i++) {
        const t = tarifasOrdenadas[i];
        const esPrimera = i === 0;
        const cumpleInferior = esPrimera ? peso >= t.peso_min : peso > t.peso_min;
        const cumpleSuperior = peso <= t.peso_max;
        if (cumpleInferior && cumpleSuperior) {
          tarifaData = t;
          break;
        }
      }
      if (tarifaData) {
        if (esPension) tarifaDiaria = tarifaData.tarifa_noche;
        else if (esGuarderia) tarifaDiaria = tarifaData.tarifa_guarderia;
      }
    }
    const costo_base = tarifaDiaria * dias;

    // Servicios extra
    let costo_servicios_extra = 0;
    for (const servicioId in formData.servicios_extra_seleccionados) {
      if (formData.servicios_extra_seleccionados[servicioId]) {
        const extra = serviciosExtra.find(s => s.id === servicioId);
        if (extra) {
          const esPorDia = /\(por día\)/i.test(extra.nombre);
          const cantidad = esPorDia ? dias : 1;
          costo_servicios_extra += Number(extra.precio) * cantidad;
        }
      }
    }

    const subtotal = costo_base + costo_servicios_extra;
    const iva = formData.solicita_factura ? subtotal * 0.16 : 0;
    const total = subtotal + iva;
    return { subtotal, iva, total, dias, tarifa_diaria: tarifaDiaria };

  } catch (err) {
    return { subtotal: 0, iva: 0, total: 0, dias: 0, tarifa_diaria: 0 };
  }
}
