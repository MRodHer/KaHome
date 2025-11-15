import { useState, useEffect } from 'react';
import { supabase, type Mascota, type Alimento } from '../lib/supabase';

// Define the type for a consumption record
interface Consumo {
  id: number;
  id_mascota: number;
  id_alimento: number;
  cantidad: number;
  fecha: string;
  notas: string | null;
  created_at: string;
  mascotas: { nombre: string };
  alimentos: { marca: string };
}

export function ConsumoAlimentos() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [selectedMascota, setSelectedMascota] = useState<string>('');
  const [consumoHistory, setConsumoHistory] = useState<Consumo[]>([]);
  const [formData, setFormData] = useState({
    id_mascota: '',
    id_alimento: '',
    cantidad: '',
    fecha: new Date().toISOString().split('T')[0], // Default to today
    notas: '',
  });
  const [newAlimento, setNewAlimento] = useState('');
  const [showNewAlimentoInput, setShowNewAlimentoInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingConsumo, setEditingConsumo] = useState<Consumo | null>(null);

  useEffect(() => {
    fetchMascotas();
    fetchAlimentos();
  }, []);

  useEffect(() => {
    if (selectedMascota) {
      fetchConsumoHistory(selectedMascota);
    }
  }, [selectedMascota]);

  const fetchMascotas = async () => {
    const { data, error } = await supabase.from('mascotas').select('id, nombre');
    if (error) console.error('Error fetching mascotas:', error);
    else setMascotas(data || []);
  };

  const fetchAlimentos = async () => {
    const { data, error } = await supabase.from('alimentos').select('id, marca');
    if (error) console.error('Error fetching alimentos:', error);
    else setAlimentos(data || []);
  };

  const fetchConsumoHistory = async (mascotaId: string) => {
    const { data, error } = await supabase
      .from('consumo_alimentos')
      .select(`
        id, id_mascota, id_alimento, cantidad, fecha, notas, created_at,
        mascotas (nombre),
        alimentos (marca)
      `)
      .eq('id_mascota', mascotaId)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching consumo history:', error);
    } else {
      setConsumoHistory(data as Consumo[] || []);
    }
  };

  const handleAlimentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === 'otro') {
      setShowNewAlimentoInput(true);
      setFormData({ ...formData, id_alimento: 'otro' });
    } else {
      setShowNewAlimentoInput(false);
      setNewAlimento(''); // Clear the new alimento input if a brand is selected
      setFormData({ ...formData, id_alimento: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.id_mascota ||
      (formData.id_alimento === 'otro' && !newAlimento.trim()) ||
      (formData.id_alimento === '') ||
      !formData.cantidad
    ) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    setSubmitting(true);

    try {
      let alimentoIdToInsert: number;

      if (formData.id_alimento === 'otro') {
        // Insert the new food and get its ID
        const { data: newAlimentoData, error: newAlimentoError } = await supabase
          .from('alimentos')
          .insert({ marca: newAlimento.trim() })
          .select('id')
          .single();

        if (newAlimentoError) throw newAlimentoError;
        alimentoIdToInsert = newAlimentoData.id;
        
        // Refresh food list in the background
        fetchAlimentos();
      } else {
        alimentoIdToInsert = parseInt(formData.id_alimento);
      }

      const { error } = await supabase.from('consumo_alimentos').insert([
        {
          id_mascota: parseInt(formData.id_mascota),
          id_alimento: alimentoIdToInsert,
          cantidad: parseFloat(formData.cantidad),
          fecha: formData.fecha,
          notas: formData.notas,
        },
      ]);

      if (error) throw error;

      alert('Consumo registrado con éxito!');
      // Reset form and refresh history
      setFormData(prev => ({ ...prev, id_alimento: '', cantidad: '', notas: '' }));
      setShowNewAlimentoInput(false);
      setNewAlimento('');
      if (selectedMascota === formData.id_mascota) {
        fetchConsumoHistory(selectedMascota);
      }
    } catch (error) {
      console.error('Error saving consumo:', error);
      alert('Ocurrió un error al registrar el consumo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConsumo = async (consumoId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro de consumo?')) {
      const { error } = await supabase.from('consumo_alimentos').delete().eq('id', consumoId);
      if (error) {
        console.error('Error deleting consumo:', error);
        alert('Error al eliminar el registro.');
      } else {
        alert('Registro de consumo eliminado.');
        fetchConsumoHistory(selectedMascota);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Consumo de Alimentos</h1>

      {/* Registration Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Registrar Consumo</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mascota*</label>
            <select
              required
              value={formData.id_mascota}
              onChange={(e) => setFormData({ ...formData, id_mascota: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione una mascota</option>
              {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alimento*</label>
            <select
              required
              value={formData.id_alimento}
              onChange={handleAlimentoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione un alimento</option>
              {alimentos.map(a => <option key={a.id} value={a.id}>{a.marca}</option>)}
              <option value="otro">Otro (especificar)</option>
            </select>
          </div>
          {showNewAlimentoInput && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Marca de Alimento*</label>
              <input
                type="text"
                required
                value={newAlimento}
                onChange={(e) => setNewAlimento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Escriba la nueva marca"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (gramos)*</label>
            <input
              type="number"
              required
              step="0.1"
              value={formData.cantidad}
              onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha*</label>
            <input
              type="date"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. Comió con buen apetito, se añadió un poco de pollo..."
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {submitting ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>

      {/* Consumption History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Historial de Consumo</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Mascota</label>
          <select
            value={selectedMascota}
            onChange={(e) => setSelectedMascota(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione una mascota para ver su historial</option>
            {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad (gr)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consumoHistory.length > 0 ? (
                consumoHistory.map(consumo => (
                  <tr key={consumo.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{new Date(consumo.fecha + 'T00:00:00').toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{consumo.alimentos.marca}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{consumo.cantidad}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{consumo.notas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => setEditingConsumo(consumo)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                      <button onClick={() => handleDeleteConsumo(consumo.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Seleccione una mascota para ver su historial o registre un nuevo consumo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingConsumo && (
        <EditConsumoModal
          consumo={editingConsumo}
          onClose={() => setEditingConsumo(null)}
          onSave={() => {
            setEditingConsumo(null);
            fetchConsumoHistory(selectedMascota);
          }}
          alimentos={alimentos}
        />
      )}
    </div>
  );
}

interface EditConsumoModalProps {
  consumo: Consumo;
  onClose: () => void;
  onSave: () => void;
  alimentos: Alimento[];
}

function EditConsumoModal({ consumo, onClose, onSave, alimentos }: EditConsumoModalProps) {
  const [formData, setFormData] = useState({
    id_alimento: consumo.id_alimento.toString(),
    cantidad: consumo.cantidad.toString(),
    fecha: consumo.fecha,
    notas: consumo.notas || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('consumo_alimentos')
        .update({
          id_alimento: parseInt(formData.id_alimento),
          cantidad: parseFloat(formData.cantidad),
          fecha: formData.fecha,
          notas: formData.notas,
        })
        .eq('id', consumo.id);

      if (error) throw error;

      alert('Registro de consumo actualizado.');
      onSave();
    } catch (error) {
      console.error('Error updating consumo:', error);
      alert('Error al actualizar el registro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Registro de Consumo</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alimento</label>
            <select
              value={formData.id_alimento}
              onChange={(e) => setFormData({ ...formData, id_alimento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {alimentos.map(a => <option key={a.id} value={a.id}>{a.marca}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (gramos)</label>
            <input
              type="number"
              step="0.1"
              value={formData.cantidad}
              onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}