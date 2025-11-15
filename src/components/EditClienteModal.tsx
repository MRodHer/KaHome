import { useState, useEffect } from 'react';
import { supabase, type Cliente, type Ubicacion } from '../lib/supabase';

interface EditClienteModalProps {
  cliente: Cliente;
  ubicaciones: Ubicacion[];
  onClose: () => void;
  onSuccess: () => void;
}

export function EditClienteModal({ cliente, ubicaciones, onClose, onSuccess }: EditClienteModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    id_ubicacion: '',
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        id_ubicacion: cliente.id_ubicacion?.toString() || '',
      });
    }
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Update logic will be implemented here
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="id_ubicacion" className="block text-sm font-medium text-gray-700">Ubicación</label>
            <select
              id="id_ubicacion"
              name="id_ubicacion"
              value={formData.id_ubicacion}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecciona una ubicación</option>
              {ubicaciones.map(u => (
                <option key={u.id} value={u.id}>{u.nombre_ubicacion}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}