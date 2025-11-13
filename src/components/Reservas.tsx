import { useEffect, useState } from 'react';
import { supabase, type Reserva, type Cliente, type Mascota, type Servicio, type TarifaPeso, type ServicioExtra, type Alimento } from '../lib/supabase';
import { Calendar as CalendarIcon, Plus, Filter } from 'lucide-react';

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

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [reservasRes, clientesRes, mascotasRes, serviciosRes, tarifasRes, extrasRes, alimentosRes] = await Promise.all([
        supabase.from('reservas').select('*').order('fecha_inicio', { ascending: false }),
        supabase.from('clientes').select('*'),
        supabase.from('mascotas').select('*'),
        supabase.from('servicios').select('*'),
        supabase.from('tarifas_peso').select('*').order('peso_min', { ascending: true }),
        supabase.from('servicios_extra').select('*').order('created_at', { ascending: false }),
        supabase.from('alimentos').select('*').order('nombre', { ascending: true }),
      ]);

      if (reservasRes.data) setReservas(reservasRes.data);
      if (clientesRes.data) setClientes(clientesRes.data);
      if (mascotasRes.data) setMascotas(mascotasRes.data);
      if (serviciosRes.data) setServicios(serviciosRes.data);
      if (tarifasRes.data) setTarifasPeso(tarifasRes.data);
      if (extrasRes.data) setServiciosExtra(extrasRes.data);
      if (alimentosRes.data) setAlimentos(alimentosRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

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
                          {new Date(reserva.fecha_inicio).toLocaleDateString('es-MX')} - {new Date(reserva.fecha_fin).toLocaleDateString('es-MX')}
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
                  <button className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                    <CalendarIcon className="w-5 h-5" />
                  </button>
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [costos, setCostos] = useState({ subtotal: 0, iva: 0, total: 0 });

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
    try {
      if (!servicioSeleccionado || !formData.fecha_inicio || !formData.fecha_fin) {
        setCostos({ subtotal: 0, iva: 0, total: 0 });
        return;
      }

      const inicio = new Date(formData.fecha_inicio);
      const fin = new Date(formData.fecha_fin);
      const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Tarifa por peso
      let tarifaDiaria = servicioSeleccionado.precio_base;
      if (mascotaSeleccionada && tarifasPeso.length > 0) {
        const peso = mascotaSeleccionada.peso || 0;
        const tarifaData = tarifasPeso.find(t => peso > t.peso_min && peso <= t.peso_max);
        if (tarifaData) {
          if (servicioSeleccionado.nombre === 'Pensión') {
            tarifaDiaria = tarifaData.tarifa_noche;
          } else if (servicioSeleccionado.nombre === 'Guardería') {
            tarifaDiaria = tarifaData.tarifa_guarderia;
          }
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
      setCostos({ subtotal, iva, total });
    } catch (err) {
      setCostos({ subtotal: 0, iva: 0, total: 0 });
    }
  }, [formData, servicioSeleccionado, mascotaSeleccionada, tarifasPeso, serviciosExtra]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validaciones básicas
      if (!servicioSeleccionado || !mascotaSeleccionada || !clienteSeleccionado) {
        throw new Error('Debe seleccionar cliente, mascota y servicio');
      }

      const inicio = new Date(formData.fecha_inicio);
      const fin = new Date(formData.fecha_fin);
      if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin < inicio) {
        throw new Error('Fechas inválidas');
      }
      const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Tarifa por peso
      const peso = mascotaSeleccionada.peso || 0;
      const tarifaData = tarifasPeso.find(t => peso > t.peso_min && peso <= t.peso_max);
      let tarifaDiaria = servicioSeleccionado.precio_base;
      if (tarifaData) {
        if (servicioSeleccionado.nombre === 'Pensión') {
          tarifaDiaria = tarifaData.tarifa_noche;
        } else if (servicioSeleccionado.nombre === 'Guardería') {
          tarifaDiaria = tarifaData.tarifa_guarderia;
        }
      }
      const costo_base = tarifaDiaria * dias;

      // Servicios extra
      let costo_servicios_extra = 0;
      const serviciosParaGuardar: { id_servicio_extra: string; cantidad: number; precio_cobrado: number }[] = [];
      for (const servicioId in formData.servicios_extra_seleccionados) {
        if (formData.servicios_extra_seleccionados[servicioId]) {
          const extra = serviciosExtra.find(s => s.id === servicioId);
          if (extra) {
            const esPorDia = /\(por día\)/i.test(extra.nombre);
            const cantidad = esPorDia ? dias : 1;
            const precio = Number(extra.precio) * cantidad;
            costo_servicios_extra += precio;
            serviciosParaGuardar.push({ id_servicio_extra: extra.id, cantidad, precio_cobrado: Number(extra.precio) });
          }
        }
      }

      // IVA
      const subtotal = costo_base + costo_servicios_extra;
      const costo_iva = formData.solicita_factura ? subtotal * 0.16 : 0;
      const costo_total = subtotal + costo_iva;

      // Manejo de alimentos: si el usuario selecciona "otro", crear/usar marca
      let id_alimento_reserva: string | null = null;
      if (formData.id_alimento === 'otro' && formData.nuevo_alimento.trim()) {
        const nombreNuevo = formData.nuevo_alimento.trim();
        // Intentar insertar, si ya existe, recuperar ID
        const insertRes = await supabase.from('alimentos').insert([{ nombre: nombreNuevo }]).select();
        if (insertRes.error) {
          // Intentar seleccionar por nombre (por conflicto de unique)
          const selRes = await supabase.from('alimentos').select('*').eq('nombre', nombreNuevo).limit(1);
          if (selRes.error || !selRes.data || selRes.data.length === 0) {
            throw insertRes.error;
          }
          id_alimento_reserva = selRes.data[0].id;
        } else if (insertRes.data && insertRes.data[0]) {
          id_alimento_reserva = insertRes.data[0].id;
        }
      } else if (formData.id_alimento) {
        id_alimento_reserva = formData.id_alimento;
      }

      // Insertar reserva y obtener ID
      const reservaInsert = await supabase
        .from('reservas')
        .insert([
          {
            id_cliente: formData.id_cliente,
            id_mascota: formData.id_mascota,
            id_servicio: formData.id_servicio,
            id_ubicacion: clienteSeleccionado.id_ubicacion,
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin,
            estado: 'Confirmada',
            costo_total,
            notas: formData.notas || '',
            pertenencias: formData.pertenencias,
            solicita_factura: formData.solicita_factura,
            costo_iva,
            id_alimento: id_alimento_reserva,
            alimento_cantidad: formData.alimento_cantidad || null,
            alimento_frecuencia: formData.alimento_frecuencia || null,
            alimento_horarios: formData.alimento_horarios || null,
          },
        ])
        .select();

      if (reservaInsert.error || !reservaInsert.data || reservaInsert.data.length === 0) {
        throw reservaInsert.error || new Error('No se pudo crear la reserva');
      }

      const nuevaReserva = reservaInsert.data[0];

      // Insertar servicios extra asociados
      for (const item of serviciosParaGuardar) {
        await supabase.from('reserva_servicios_extra').insert([
          {
            id_reserva: nuevaReserva.id,
            id_servicio_extra: item.id_servicio_extra,
            cantidad: item.cantidad,
            precio_cobrado: item.precio_cobrado,
          },
        ]);
      }

      // Registrar transacción financiera
      await supabase.from('transacciones_financieras').insert([
        {
          tipo: 'Ingreso',
          monto: costo_total,
          fecha: formData.fecha_inicio,
          descripcion: `Reserva de ${servicioSeleccionado.nombre}`,
          id_reserva: nuevaReserva.id,
          id_ubicacion: clienteSeleccionado.id_ubicacion,
          categoria: 'Servicios',
        },
      ]);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating reserva:', error);
      alert('Error al crear reserva');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nueva Reserva</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} - ${Number(s.precio_base).toLocaleString('es-MX')}/día
                </option>
              ))}
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
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                min={formData.fecha_inicio}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

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
                    onChange={(e) => setFormData({
                      ...formData,
                      pertenencias: { ...formData.pertenencias, [key]: e.target.checked },
                    })}
                  />
                  {key}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Sección de Alimento */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Alimento</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <select
                  value={formData.id_alimento}
                  onChange={(e) => setFormData({ ...formData, id_alimento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Seleccionar</option>
                  {alimentos.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                  <option value="otro">Otro (especificar)</option>
                </select>
                {formData.id_alimento === 'otro' && (
                  <input
                    type="text"
                    placeholder="Escribe la marca..."
                    value={formData.nuevo_alimento}
                    onChange={(e) => setFormData({ ...formData, nuevo_alimento: e.target.value })}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (tazas)</label>
                <input
                  type="text"
                  value={formData.alimento_cantidad}
                  onChange={(e) => setFormData({ ...formData, alimento_cantidad: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia (veces al día)</label>
                <input
                  type="text"
                  value={formData.alimento_frecuencia}
                  onChange={(e) => setFormData({ ...formData, alimento_frecuencia: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Horarios</label>
                <input
                  type="text"
                  placeholder="Ej. 8:00 AM, 1:00 PM, 7:00 PM"
                  value={formData.alimento_horarios}
                  onChange={(e) => setFormData({ ...formData, alimento_horarios: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Sección de Servicios Extra */}
          <fieldset className="border border-gray-200 rounded-lg p-4">
            <legend className="px-2 text-sm font-semibold text-gray-700">Servicios Extra</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {serviciosExtra.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.servicios_extra_seleccionados[s.id])}
                    onChange={(e) => setFormData({
                      ...formData,
                      servicios_extra_seleccionados: {
                        ...formData.servicios_extra_seleccionados,
                        [s.id]: e.target.checked,
                      },
                    })}
                  />
                  {s.nombre} - ${Number(s.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Sección de Facturación */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.solicita_factura}
                onChange={(e) => setFormData({ ...formData, solicita_factura: e.target.checked })}
              />
              <span className="text-sm">Solicitar Factura (Añade 16% IVA)</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Subtotal</p>
                <p className="font-semibold text-gray-900">${costos.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-gray-500">IVA</p>
                <p className="font-semibold text-gray-900">${costos.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-semibold text-gray-900">${costos.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
