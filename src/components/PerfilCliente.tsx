import React from 'react';
import { Cliente, Mascota } from '../lib/supabase';
import { X } from 'lucide-react';

interface PerfilClienteProps {
  cliente: Cliente;
  mascotas: Mascota[];
  onBack: () => void;
}

const PerfilCliente: React.FC<PerfilClienteProps> = ({ cliente, mascotas, onBack }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button onClick={onBack} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-start gap-8">
          <div className="w-1/3">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{cliente.nombre}</h2>
            <p className="text-sm text-gray-600">ID: {cliente.id}</p>
            <p className="text-sm text-gray-600">Email: {cliente.email}</p>
            <p className="text-sm text-gray-600">Teléfono: {cliente.telefono}</p>
            <p className="text-sm text-gray-600">Dirección: {cliente.direccion}</p>
            <p className="text-sm text-gray-500 mt-4">Registrado desde: {new Date(cliente.fecha_registro).toLocaleDateString('es-ES')}</p>
          </div>
          <div className="w-2/3">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Mascotas ({mascotas.length})</h3>
            <div className="space-y-4">
              {mascotas.map(mascota => (
                <div key={mascota.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={mascota.url_foto || 'https://via.placeholder.com/80'}
                    alt={mascota.nombre} 
                    className="w-20 h-20 rounded-md object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-lg">{mascota.nombre}</h4>
                    <p className="text-sm text-gray-600">{mascota.especie} - {mascota.raza}</p>
                    <p className="text-sm text-gray-600">{mascota.edad} años</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilCliente;