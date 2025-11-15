import { useEffect, useState } from 'react';
import { supabaseAdmin, type Reserva, type Cliente, type Mascota, type Servicio, type TarifaPeso, type ServicioExtra, type Alimento } from '../lib/supabase';
import { Calendar as CalendarIcon, Plus, Filter, Edit3, Trash2 } from 'lucide-react';

export function Reservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [tarifasPeso, setTarifasPeso] = useState<TarifaPeso[]>([]);
  const [serviciosExtra, setServiciosExtra] = useState<ServicioExtra[]>([]);
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('Todas');
  const [showNewReservaForm, setShowNewReservaForm] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [reservasRes, clientesRes, mascotasRes, serviciosRes, tarifasRes, extrasRes, alimentosRes] = await Promise.all([
        supabaseAdmin.from('reservas').select('*').order('fecha_inicio', { ascending: false }),
        supabaseAdmin.from('clientes').select('*'),
        supabaseAdmin.from('mascotas').select('*'),
        supabaseAdmin.from('servicios').select('*'),
        supabaseAdmin.from('tarifas_peso').select('*').order('peso_min', { ascending: true }),
        supabaseAdmin.from('servicios_extra').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('alimentos').select('*').order('nombre', { ascending: true }),
      ]);

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
                          {new Date(reserva.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(reserva.fecha_fin).toLocaleDateString('es-ES')}
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
    metodo_pago_anticipo: 'Pendiente',
    monto_anticipo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [costos, setCostos] = useState({ subtotal: 0, iva: 0, total: 0, dias: 0 });

  const clientesFiltrados = clienteSearch.trim()
    ? clientes.filter(c => c.nombre.toLowerCase().includes(clienteSearch.trim().toLowerCase()))
    : clientes;

  const mascotasDelCliente = formData.id_cliente
    ? mascotas.filter(m => m.id_cliente === formData.id_cliente)
    : [];

  const servicioSeleccionado = servicios.find(s => s.id === formData.id_servicio);
  const clienteSeleccionado = clientes.find(c => c.id === formData.id_cliente);
  const mascotaSeleccionada = mascotas.find(m => m.id === formData.id_mascota);

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
      const { subtotal, iva, total, dias } = calcularCostosReserva(
        formData,
        servicioSeleccionado,
        mascotaSeleccionada,
        tarifasPeso,
        serviciosExtra
      );

      if (total === 0 || dias === 0) {
        throw new Error('Fechas inválidas o datos incompletos para calcular el costo.');
      }

      let alimentoId = formData.id_alimento;
      if (alimentoId === 'otro' && formData.nuevo_alimento) {
        const { data: nuevoAlimento, error: alimentoError } = await supabaseAdmin
          .from('alimentos')
          .insert({ nombre: formData.nuevo_alimento })
          .select()
          .single();
        if (alimentoError) throw alimentoError;
        alimentoId = nuevoAlimento.id;
      }

      const reservaData = {
        id_cliente: formData.id_cliente,
        id_mascota: formData.id_mascota,
        id_servicio: formData.id_servicio,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        notas: formData.notas,
        pertenencias: formData.pertenencias,
        id_alimento: alimentoId,
        alimento_cantidad: formData.alimento_cantidad,
        alimento_frecuencia: formData.alimento_frecuencia,
        alimento_horarios: formData.alimento_horarios,
        costo_total: total,
        costo_iva: iva,
        solicita_factura: formData.solicita_factura,
        estado: 'Confirmada',
      };

      const { data: reserva, error: reservaError } = await supabaseAdmin
        .from('reservas')
        .insert(reservaData)
        .select()
        .single();

      if (reservaError) throw reservaError;

      const nuevaReserva = reserva;

      // --- INICIO DE CORRECCIÓN (NOM-151) ---
      try {
        // Simulación de la generación del contrato
        const urlDocumentoSimulada = `/api/contratos/generar?id=${nuevaReserva.id}`;

        await supabaseAdmin.from('contratos').insert([
          {
            id_reserva: nuevaReserva.id,
            url_documento: urlDocumentoSimulada,
            estado_firma: 'Pendiente',
          },
        ]);

      } catch (contratoError) {
        console.error('Error al generar contrato:', contratoError);
        // No se detiene la reserva, solo se registra el fallo
      }
      // --- FIN DE CORRECCIÓN ---

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
      
      const transaccionData = {
        id_reserva: reserva.id,
        id_cliente: formData.id_cliente,
        tipo: 'Ingreso',
        descripcion: `Reserva #${reserva.id} - ${servicioSeleccionado?.nombre}`,
        monto: total,
        subtotal: subtotal,
        iva: iva,
        metodo_pago: 'Pendiente',
        estado_pago: 'Pendiente',
      };

      const { error: transaccionError } = await supabaseAdmin.from('transacciones').insert(transaccionData);
      if (transaccionError) throw transaccionError;
      
      if (formData.monto_anticipo && Number(formData.monto_anticipo) > 0) {
        const anticipoData = {
          id_reserva: reserva.id,
          id_cliente: formData.id_cliente,
          tipo: 'Ingreso',
          descripcion: `Anticipo Reserva #${reserva.id}`,
          monto: Number(formData.monto_anticipo),
          subtotal: Number(formData.monto_anticipo) / (formData.solicita_factura ? 1.16 : 1),
          iva: formData.solicita_factura ? Number(formData.monto_anticipo) - (Number(formData.monto_anticipo) / 1.16) : 0,
          metodo_pago: formData.metodo_pago_anticipo,
          estado_pago: 'Pagado',
        };
        const { error: anticipoError } = await supabaseAdmin.from('transacciones').insert(anticipoData);
        if (anticipoError) throw anticipoError;
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
                  onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value, id_mascota: '' })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mascota*</label>
                  <select
                    required
                    value={formData.id_mascota}
                    onChange={(e) => setFormData({ ...formData, id_mascota: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar mascota</option>
                    {mascotasDelCliente.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre} ({m.especie})</option>
                    ))}
                  </select>
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
                  {servicios.map((s) => {
                    const displayName = s.nombre === 'Pensión' ? 'Hotel/Pensión' : s.nombre;
                    return (
                      <option key={s.id} value={s.id}>
                        {`${displayName} - $${Number(s.precio_base).toLocaleString('es-MX')}/día`}
                      </option>
                    );
                  })}
                </select>
              </div>

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
            </>
          )}

          {step === 2 && (
            <>
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
                    <select
                      value={formData.id_alimento}
                      onChange={(e) => setFormData({ ...formData, id_alimento: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar alimento</option>
                      {alimentos.map((a) => (
                        <option key={a.id} value={a.id}>{a.nombre}</option>
                      ))}
                      <option value="otro">Otro (especificar)</option>
                    </select>
                  </div>
                  {formData.id_alimento === 'otro' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Marca de Alimento</label>
                      <input
                        type="text"
                        required
                        value={formData.nuevo_alimento}
                        onChange={(e) => setFormData({ ...formData, nuevo_alimento: e.target.value })}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia (veces al día)</label>
                      <input
                        type="number"
                        value={formData.alimento_frecuencia}
                        onChange={(e) => setFormData({ ...formData, alimento_frecuencia: e.target.value })}
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

                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({costos.dias} {costos.dias === 1 ? 'día' : 'días'}):</span>
                    <span className="font-medium">${costos.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anticipo</label>
                    <input
                      type="number"
                      placeholder="Monto"
                      value={formData.monto_anticipo}
                      onChange={e => setFormData({...formData, monto_anticipo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                    <select
                      value={formData.metodo_pago_anticipo}
                      onChange={e => setFormData({...formData, metodo_pago_anticipo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Pendiente</option>
                      <option>Efectivo</option>
                      <option>Transferencia</option>
                      <option>Tarjeta</option>
                    </select>
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
                disabled={!formData.id_cliente || !formData.id_mascota || !formData.id_servicio || !formData.fecha_inicio || !formData.fecha_fin}
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [costos, setCostos] = useState({ subtotal: 0, iva: 0, total: 0, dias: 0 });

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
          seleccionados[item.id_servicio_extra] = true;
        });
      }
      setFormData(prev => ({ ...prev, servicios_extra_seleccionados: seleccionados }));
    };
    fetchServicios();
  }, [reserva.id]);

  const mascotaSeleccionada = mascotas.find(m => m.id === formData.id_mascota);
  const servicioSeleccionado = servicios.find(s => s.id === formData.id_servicio);

  // Recalcular costos
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
      const { subtotal, iva, total, dias } = calcularCostosReserva(
        formData,
        servicioSeleccionado,
        mascotaSeleccionada,
        tarifasPeso,
        serviciosExtra
      );

      const reservaUpdate = {
        ...formData,
        costo_total: total,
        costo_iva: iva,
      };
      
      delete (reservaUpdate as any).servicios_extra_seleccionados;

      const { error: updateError } = await supabaseAdmin
        .from('reservas')
        .update(reservaUpdate)
        .eq('id', reserva.id);

      if (updateError) throw updateError;

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
              value={formData.estado}
              onChange={e => setFormData({...formData, estado: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Confirmada">Confirmada</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          {/* ... otros campos ... */}

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
    return { subtotal: 0, iva: 0, total: 0, dias: 0 };
  }

  try {
    const inicio = new Date(formData.fecha_inicio);
    const fin = new Date(formData.fecha_fin);
    if (fin < inicio) return { subtotal: 0, iva: 0, total: 0, dias: 0 };

    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Tarifa por peso
    let tarifaDiaria = servicioSeleccionado.precio_base;
    const peso = mascotaSeleccionada.peso || 0;
    const tarifaData = tarifasPeso.find(t => peso > t.peso_min && peso <= t.peso_max);
    if (tarifaData) {
      if (servicioSeleccionado.nombre === 'Pensión') tarifaDiaria = tarifaData.tarifa_noche;
      else if (servicioSeleccionado.nombre === 'Guardería') tarifaDiaria = tarifaData.tarifa_guarderia;
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
    return { subtotal, iva, total, dias };

  } catch (err) {
    return { subtotal: 0, iva: 0, total: 0, dias: 0 };
  }
}
