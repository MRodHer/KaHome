import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabaseAdmin, type Reserva } from '../lib/supabase';
import { useEffect, useMemo, useState } from 'react';

export function CalendarioReservas() {
  const [events, setEvents] = useState([]);
  const [selectedReserva, setSelectedReserva] = useState<any | null>(null);
  const [alimentosMap, setAlimentosMap] = useState<Record<string, string>>({});
  const [showCuidadosEspeciales, setShowCuidadosEspeciales] = useState(false);

  useEffect(() => {
    fetchReservas();
    fetchAlimentos();
  }, []);

  async function fetchReservas() {
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .select('*, mascotas(*), clientes(*), servicios(*)');

    if (error) {
      console.error('Error fetching reservas:', error);
      return;
    }

    const formattedEvents = data.map((reserva: any) => ({
      id: reserva.id,
      title: `${reserva.mascotas.nombre} (${reserva.clientes.nombre})`,
      start: reserva.fecha_inicio,
      end: reserva.fecha_fin,
      extendedProps: { reserva },
    }));

    setEvents(formattedEvents);
  }

  async function fetchAlimentos() {
    const { data, error } = await supabaseAdmin
      .from('alimentos')
      .select('*');

    if (error) {
      console.error('Error fetching alimentos:', error);
      return;
    }
    const map: Record<string, string> = {};
    data?.forEach((a: any) => {
      map[String(a.id)] = a.nombre;
    });
    setAlimentosMap(map);
  }

  function handleEventClick(clickInfo) {
    setSelectedReserva(clickInfo.event.extendedProps.reserva);
    setShowCuidadosEspeciales(false);
  }

   return (
     <div className="p-4">
       <FullCalendar
         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
         initialView="dayGridMonth"
         headerToolbar={{
           left: 'prev,next today',
           center: 'title',
           right: 'dayGridMonth,timeGridWeek,timeGridDay'
         }}
       events={events}
       eventClick={handleEventClick}
        eventDidMount={(info) => {
          const r: any = info.event.extendedProps?.reserva;
          if (!r) return;
          const alimentoNombre = r.id_alimento && alimentosMap[String(r.id_alimento)]
            ? alimentosMap[String(r.id_alimento)]
            : '—';
          const horarios = Array.isArray(r.alimento_horarios) && r.alimento_horarios.length > 0
            ? r.alimento_horarios.join(', ')
            : '—';
          const pertenencias = r.pertenencias && typeof r.pertenencias === 'object'
            ? Object.entries(r.pertenencias)
                .filter(([_, v]) => Boolean(v))
                .map(([k]) => String(k).replace(/_/g, ' '))
                .join(', ')
            : '';
          const titulo = `Alimento: ${alimentoNombre} • Cantidad: ${r.alimento_cantidad ?? '—'} • Frecuencia: ${r.alimento_frecuencia ?? '—'} • Horarios: ${horarios}` + (pertenencias ? ` • Pertenencias: ${pertenencias}` : '');
          info.el.title = titulo;
        }}
       />

      {selectedReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Detalles de la Reserva</h2>
            <p><strong>Cliente:</strong> {selectedReserva.clientes.nombre}</p>
            <p><strong>Mascota:</strong> {selectedReserva.mascotas.nombre}</p>
            <p><strong>Servicio:</strong> {selectedReserva.servicios.nombre}</p>
            <p><strong>Fecha de inicio:</strong> {new Date(selectedReserva.fecha_inicio).toLocaleDateString()}</p>
            <p><strong>Fecha de fin:</strong> {new Date(selectedReserva.fecha_fin).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> {selectedReserva.estado}</p>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Protocolo de Alimentación</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <strong>Alimento:</strong>{' '}
                  {selectedReserva.id_alimento && alimentosMap[String(selectedReserva.id_alimento)]
                    ? alimentosMap[String(selectedReserva.id_alimento)]
                    : 'No especificado'}
                </p>
                <p>
                  <strong>Cantidad:</strong>{' '}
                  {selectedReserva.alimento_cantidad ? `${selectedReserva.alimento_cantidad} taza(s)` : '—'}
                </p>
                <p>
                  <strong>Frecuencia:</strong>{' '}
                  {selectedReserva.alimento_frecuencia || '—'}
                </p>
                <p>
                  <strong>Horarios:</strong>{' '}
                  {Array.isArray(selectedReserva.alimento_horarios) && selectedReserva.alimento_horarios.length > 0
                    ? selectedReserva.alimento_horarios.join(', ')
                    : '—'}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pertenencias</h3>
              <div className="flex flex-wrap gap-2">
                {selectedReserva.pertenencias && typeof selectedReserva.pertenencias === 'object'
                  ? Object.entries(selectedReserva.pertenencias)
                      .filter(([_, v]) => Boolean(v))
                      .map(([k]) => (
                        <span key={k} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {k.replace(/_/g, ' ')}
                        </span>
                      ))
                  : <span className="text-sm text-gray-600">Sin pertenencias registradas</span>
                }
              </div>
            </div>

            {selectedReserva.mascotas?.cuidados_especiales && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Cuidados Especiales</h3>
                  <button
                    type="button"
                    onClick={() => setShowCuidadosEspeciales(v => !v)}
                    className="text-sm text-blue-700 hover:underline"
                  >
                    {showCuidadosEspeciales ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {showCuidadosEspeciales && (
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Administración de medicamentos:</strong>{' '}
                      {selectedReserva.mascotas?.protocolo_medicamentos || '—'}
                    </p>
                    <p>
                      <strong>Dietas Especiales:</strong>{' '}
                      {selectedReserva.mascotas?.protocolo_dietas_especiales || '—'}
                    </p>
                    <p>
                      <strong>Cuidado Geriátrico:</strong>{' '}
                      {selectedReserva.mascotas?.protocolo_cuidado_geriatrico || '—'}
                    </p>
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setSelectedReserva(null)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Cerrar</button>
          </div>
        </div>
      )}
     </div>
   );
 }