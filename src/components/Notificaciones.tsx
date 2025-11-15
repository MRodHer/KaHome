import { Bell } from 'lucide-react';
import { useNotification, type NotificationStatus } from '../context/NotificationContext';

export function Notificaciones() {
  const { notifications, addNotification, removeNotification } = useNotification();

  const addDemo = (status: NotificationStatus) => {
    addNotification('Notificación de ejemplo', status);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Bell className="mr-2" /> Notificaciones
      </h2>

      <div className="mb-4 flex gap-2">
        <button onClick={() => addDemo('info')} className="px-3 py-1 bg-blue-600 text-white rounded">Añadir info</button>
        <button onClick={() => addDemo('success')} className="px-3 py-1 bg-green-600 text-white rounded">Añadir éxito</button>
        <button onClick={() => addDemo('warning')} className="px-3 py-1 bg-yellow-500 text-white rounded">Añadir aviso</button>
        <button onClick={() => addDemo('error')} className="px-3 py-1 bg-red-600 text-white rounded">Añadir error</button>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-800">{n.message}</p>
              <span className="text-xs font-medium text-gray-600">{new Date(n.id).toLocaleString()}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">{n.status}</span>
              <button onClick={() => removeNotification(n.id)} className="text-xs text-blue-600 hover:underline">Eliminar</button>
            </div>
          </div>
        ))}

        {notifications.length === 0 && <p className="text-gray-600">No hay notificaciones.</p>}
      </div>
    </div>
  );
}