import { useEffect, useState } from 'react';
import { supabase, type Reserva, type Cliente, type Mascota, type Servicio } from '../lib/supabase';
import { Calendar as CalendarIcon, Plus, Filter } from 'lucide-react';

export function Reservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('Todas');
  const [showNewReservaForm, setShowNewReservaForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [reservasRes, clientesRes, mascotasRes, serviciosRes] = await Promise.all([
        supabase.from('reservas').select('*').order('fecha_inicio', { ascending: false }),
        supabase.from('clientes').select('*'),
        supabase.from('mascotas').select('*'),
        supabase.from('servicios').select('*'),
      ]);

      if (reservasRes.data) setReservas(reservasRes.data);
      if (clientesRes.data) setClientes(clientesRes.data);
      if (mascotasRes.data) setMascotas(mascotasRes.data);
      if (serviciosRes.data) setServicios(serviciosRes.data);
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
  onClose,
  onSuccess,
}: {
  clientes: Cliente[];
  mascotas: Mascota[];
  servicios: Servicio[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_mascota: '',
    id_servicio: '',
    fecha_inicio: '',
    fecha_fin: '',
    notas: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const mascotasDelCliente = formData.id_cliente
    ? mascotas.filter(m => m.id_cliente === formData.id_cliente)
    : [];

  const servicioSeleccionado = servicios.find(s => s.id === formData.id_servicio);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!servicioSeleccionado) return;

    setSubmitting(true);

    try {
      const inicio = new Date(formData.fecha_inicio);
      const fin = new Date(formData.fecha_fin);
      const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const costoTotal = servicioSeleccionado.precio_base * dias;

      const { error: reservaError } = await supabase.from('reservas').insert([
        {
          ...formData,
          id_ubicacion: '11111111-1111-1111-1111-111111111111',
          costo_total: costoTotal,
          estado: 'Confirmada',
        },
      ]);

      if (reservaError) throw reservaError;

      await supabase.from('transacciones_financieras').insert([
        {
          tipo: 'Ingreso',
          monto: costoTotal,
          fecha: formData.fecha_inicio,
          descripcion: `Reserva de ${servicioSeleccionado.nombre}`,
          id_ubicacion: '11111111-1111-1111-1111-111111111111',
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
            <select
              required
              value={formData.id_cliente}
              onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value, id_mascota: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((c) => (
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
