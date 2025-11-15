import React, { useState, useEffect } from 'react';
import { UploadPhoto } from '../UploadPhoto';

interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  genero: string;
  edad: number;
  peso: number;
  fecha_ultima_vacuna: string;
  historial_medico: string;
  url_foto: string;
  fecha_de_nacimiento: string;
}

interface Cliente {
  id: string;
  nombre: string;
}

interface MascotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mascotaData: any) => void;
  mascota: Mascota | null;
  clientes: Cliente[];
  initialClienteId?: string;
}

const MascotaModal: React.FC<MascotaModalProps> = ({ isOpen, onClose, onSave, mascota, clientes, initialClienteId }) => {
  const [formData, setFormData] = useState({
    id_cliente: '',
    nombre: '',
    especie: '',
    raza: '',
    genero: 'Macho',
    fecha_de_nacimiento: '',
    peso: 0,
    url_foto: '',
    historial_medico: '',
    fecha_ultima_vacuna: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mascota) {
        setFormData({
          id_cliente: (mascota as any).id_cliente || initialClienteId || '',
          nombre: mascota.nombre || '',
          especie: mascota.especie || '',
          raza: mascota.raza || '',
          genero: mascota.genero || 'Macho',
          fecha_de_nacimiento: mascota.fecha_de_nacimiento ? new Date(mascota.fecha_de_nacimiento).toISOString().split('T')[0] : '',
          peso: mascota.peso || 0,
          url_foto: mascota.url_foto || '',
          historial_medico: mascota.historial_medico || '',
          fecha_ultima_vacuna: mascota.fecha_ultima_vacuna ? new Date(mascota.fecha_ultima_vacuna).toISOString().split('T')[0] : '',
        });
      } else {
        setFormData({
          id_cliente: initialClienteId || '',
          nombre: '',
          especie: '',
          raza: '',
          genero: 'Macho',
          fecha_de_nacimiento: '',
          peso: 0,
          url_foto: '',
          historial_medico: '',
          fecha_ultima_vacuna: '',
        });
      }
    }
  }, [mascota, isOpen, initialClienteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (filePath: string) => {
    setFormData(prev => ({ ...prev, url_foto: filePath }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">{mascota ? 'Editar Mascota' : 'Nueva Mascota'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Cliente</label>
              <select name="id_cliente" value={formData.id_cliente} onChange={handleChange} required className="w-full p-2 border rounded">
                <option value="">Seleccionar cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>

              <label className="block mt-4 mb-2">Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre de la mascota" required className="w-full p-2 border rounded"/>

              <label className="block mt-4 mb-2">Especie</label>
              <input type="text" name="especie" value={formData.especie} onChange={handleChange} placeholder="Ej. Perro, Gato" required className="w-full p-2 border rounded"/>

              <label className="block mt-4 mb-2">Raza</label>
              <input type="text" name="raza" value={formData.raza} onChange={handleChange} placeholder="Ej. Labrador, Siamés" required className="w-full p-2 border rounded"/>

              <label className="block mt-4 mb-2">Género</label>
              <select name="genero" value={formData.genero} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Foto</label>
              <UploadPhoto onUpload={handlePhotoUpload} />
              {formData.url_foto && <img src={formData.url_foto} alt="Mascota" className="w-32 h-32 object-cover rounded-full mt-4"/>}

              <label className="block mt-4 mb-2">Fecha de Nacimiento</label>
              <input type="date" name="fecha_de_nacimiento" value={formData.fecha_de_nacimiento} onChange={handleChange} className="w-full p-2 border rounded"/>

              <label className="block mt-4 mb-2">Peso (kg)</label>
              <input type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} placeholder="Peso en kg" className="w-full p-2 border rounded"/>

              <label className="block mt-4 mb-2">Fecha Última Vacuna</label>
              <input type="date" name="fecha_ultima_vacuna" value={formData.fecha_ultima_vacuna} onChange={handleChange} className="w-full p-2 border rounded"/>
            </div>
          </div>

          <div className="mt-6">
            <label className="block mb-2">Historial Médico / Notas</label>
            <textarea name="historial_medico" value={formData.historial_medico} onChange={handleChange} placeholder="Alergias, condiciones, etc." className="w-full p-2 border rounded" rows={4}></textarea>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MascotaModal;