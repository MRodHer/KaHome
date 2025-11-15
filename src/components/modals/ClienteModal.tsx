import React, { useState, useEffect } from 'react';

interface Ubicacion {
  id: string;
  nombre: string;
}

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  fecha_registro: string;
  id_ubicacion: string;
  consentimiento_datos: boolean;
  calle_numero?: string;
  colonia?: string;
  codigo_postal?: string;
  municipio?: string;
  estado?: string;
}

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clienteData: any) => void;
  cliente: Cliente | null;
  ubicaciones: Ubicacion[];
}

const ClienteModal: React.FC<ClienteModalProps> = ({ isOpen, onClose, onSave, cliente, ubicaciones }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    id_ubicacion: '',
    consentimiento_datos: false,
    calle_numero: '',
    colonia: '',
    codigo_postal: '',
    municipio: '',
    estado: '',
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        id_ubicacion: cliente.id_ubicacion || '',
        consentimiento_datos: cliente.consentimiento_datos || false,
        calle_numero: cliente.calle_numero || '',
        colonia: cliente.colonia || '',
        codigo_postal: cliente.codigo_postal || '',
        municipio: cliente.municipio || '',
        estado: cliente.estado || '',
      });
    } else {
      // Reset form when opening for a new client
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        id_ubicacion: '',
        consentimiento_datos: false,
        calle_numero: '',
        colonia: '',
        codigo_postal: '',
        municipio: '',
        estado: '',
      });
    }
  }, [cliente, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre completo" required className="p-2 border rounded"/>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="p-2 border rounded"/>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" className="p-2 border rounded"/>
            <select name="id_ubicacion" value={formData.id_ubicacion} onChange={handleChange} required className="p-2 border rounded">
              <option value="">Seleccionar ubicación</option>
              {ubicaciones.map(u => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
            <input type="text" name="calle_numero" value={formData.calle_numero} onChange={handleChange} placeholder="Calle y Número" className="p-2 border rounded"/>
            <input type="text" name="colonia" value={formData.colonia} onChange={handleChange} placeholder="Colonia" className="p-2 border rounded"/>
            <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} placeholder="Código Postal" className="p-2 border rounded"/>
            <input type="text" name="municipio" value={formData.municipio} onChange={handleChange} placeholder="Municipio" className="p-2 border rounded"/>
            <input type="text" name="estado" value={formData.estado} onChange={handleChange} placeholder="Estado" className="p-2 border rounded"/>
          </div>
          <div className="mt-4">
            <label className="flex items-center">
              <input type="checkbox" name="consentimiento_datos" checked={formData.consentimiento_datos} onChange={handleChange} className="mr-2"/>
              <span>El cliente autoriza el tratamiento de sus datos.</span>
            </label>
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

export default ClienteModal;