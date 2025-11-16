import React, { useEffect, useMemo, useState } from 'react';
import { supabaseAdmin } from '../lib/supabase';
import { PencilIcon, TrashIcon, PlusIcon, SearchIcon } from '@heroicons/react/24/outline';
import MascotaModal from './modals/MascotaModal';
import { useNotification } from '../context/NotificationContext';

interface Mascota {
  id: string;
  id_cliente: string | null;
  nombre: string;
  especie: string;
  raza: string | null;
  genero: string | null;
  peso: number | null;
  url_foto: string | null;
}

interface Cliente { id: string; nombre: string }

const ITEMS_PER_PAGE = 12;

export const MascotasDashboard: React.FC = () => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addNotification } = useNotification();

  async function loadData() {
    setLoading(true);
    try {
      const [mascotasRes, clientesRes] = await Promise.all([
        supabaseAdmin.from('mascotas').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('clientes').select('id, nombre').order('nombre', { ascending: true }),
      ]);
      setMascotas(mascotasRes.data || []);
      setClientes(clientesRes.data || []);
    } catch (error: any) {
      addNotification('Error al cargar mascotas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const clientesById = useMemo(() => {
    const map = new Map<string, string>();
    clientes.forEach(c => map.set(c.id, c.nombre));
    return map;
  }, [clientes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mascotas;
    return mascotas.filter(m =>
      m.nombre.toLowerCase().includes(q) ||
      (m.especie && m.especie.toLowerCase().includes(q)) ||
      (m.raza && m.raza.toLowerCase().includes(q)) ||
      (m.id_cliente && (clientesById.get(m.id_cliente)?.toLowerCase() || '').includes(q))
    );
  }, [mascotas, search, clientesById]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  const openNew = () => { setSelectedMascota(null); setIsModalOpen(true); };
  const openEdit = (m: Mascota) => { setSelectedMascota(m); setIsModalOpen(true); };
  const closeModal = () => { setSelectedMascota(null); setIsModalOpen(false); };

  const handleSave = async (data: any) => {
    const tryPersist = async (payload: any) => {
      if (selectedMascota) {
        const { error } = await supabaseAdmin.from('mascotas').update(payload).eq('id', selectedMascota.id);
        if (error) throw error;
        addNotification(`Mascota '${payload.nombre}' actualizada`, 'success');
      } else {
        const { error } = await supabaseAdmin.from('mascotas').insert([payload]);
        if (error) throw error;
        addNotification(`Mascota '${payload.nombre}' creada`, 'success');
      }
    };

    try {
      await tryPersist(data);
      closeModal();
      loadData();
    } catch (err: any) {
      const msg: string = String(err?.message || 'Error desconocido');
      addNotification('Error al guardar mascota: ' + msg, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta mascota? Esta acción es permanente.')) return;
    try {
      const { error } = await supabaseAdmin.from('mascotas').delete().eq('id', id);
      if (error) throw error;
      addNotification('Mascota eliminada', 'success');
      loadData();
    } catch (err: any) {
      addNotification('Error al eliminar: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por nombre, especie, raza o cliente"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-80 max-w-full sm:max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={openNew} className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          Nueva Mascota
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Cargando mascotas...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No hay mascotas para mostrar</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {paginated.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
                {m.url_foto ? (
                  <img src={m.url_foto} alt={m.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin foto</div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{m.nombre}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="p-1.5 sm:p-2 text-blue-500 hover:bg-blue-50 rounded">
                      <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded">
                      <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">{m.especie}{m.raza ? ` • ${m.raza}` : ''}</p>
                <p className="text-xs sm:text-sm text-gray-600">Peso: {m.peso ?? 0} kg</p>
                <p className="text-xs sm:text-sm text-gray-600">Dueño: {m.id_cliente ? (clientesById.get(m.id_cliente) || '-') : '-'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-2 sm:px-3 py-2 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-xs sm:text-sm text-gray-600">Página {page} de {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-2 sm:px-3 py-2 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      <MascotaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        mascota={selectedMascota as any}
        clientes={clientes}
      />
    </div>
  );
};

export default MascotasDashboard;