import { useState, useEffect } from 'react';
import { supabaseAdmin } from '../lib/supabase';
import { Bell } from 'lucide-react';

interface Notificacion {
  id: number;
  mensaje: string;
  leida: boolean;
  created_at: string;
}

export function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    setLoading(true);
    const { data, error } = await supabaseAdmin
      .from('notificaciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notificaciones:', error);
    } else {
      setNotificaciones(data as Notificacion[]);
    }
    setLoading(false);
  };

  const markAsRead = async (id: number) => {
    const { error } = await supabaseAdmin
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
    } else {
      setNotificaciones(notificaciones.map(n => n.id === id ? { ...n, leida: true } : n));
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Bell className="mr-2" /> Notificaciones
      </h2>
      {loading ? (
        <p>Cargando notificaciones...</p>
      ) : (
        <div className="space-y-4">
          {notificaciones.map((notificacion) => (
            <div key={notificacion.id} className={`p-4 rounded-lg ${notificacion.leida ? 'bg-gray-100' : 'bg-blue-50'}`}>
              <p className="text-sm text-gray-800">{notificacion.mensaje}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">{new Date(notificacion.created_at).toLocaleString()}</p>
                {!notificacion.leida && (
                  <button 
                    onClick={() => markAsRead(notificacion.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Marcar como leída
                  </button>
                )}
              </div>
            </div>
          ))}
          {notificaciones.length === 0 && <p>No hay notificaciones nuevas.</p>}
        </div>
      )}
    </div>
  );
}