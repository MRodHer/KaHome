import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabaseAdmin, type Reserva } from '../lib/supabase';
import { useEffect, useState } from 'react';

export function CalendarioReservas() {
  const [events, setEvents] = useState([]);
  const [selectedReserva, setSelectedReserva] = useState<any | null>(null);

  useEffect(() => {
    fetchReservas();
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

  function handleEventClick(clickInfo) {
    setSelectedReserva(clickInfo.event.extendedProps.reserva);
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
            <button onClick={() => setSelectedReserva(null)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Cerrar</button>
          </div>
        </div>
      )}
     </div>
   );
 }