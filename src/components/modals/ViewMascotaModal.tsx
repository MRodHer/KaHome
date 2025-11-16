import React, { useState } from 'react';

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
  // Campos opcionales de cuidados especiales y protocolo
  cuidados_especiales?: boolean | null;
  protocolo_medicamentos?: string | null;
  protocolo_dietas_especiales?: string | null;
  protocolo_cuidado_geriatrico?: string | null;
}

interface ViewMascotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mascota: Mascota | null;
}

const ViewMascotaModal: React.FC<ViewMascotaModalProps> = ({ isOpen, onClose, mascota }) => {
  if (!isOpen || !mascota) return null;

  const [mostrarCuidados, setMostrarCuidados] = useState(false);

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold mb-4">Detalles de la Mascota</h2>
          <button onClick={onClose} className="text-black text-2xl">&times;</button>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex flex-col items-center">
            <img src={mascota.url_foto || 'https://via.placeholder.com/150'} alt={mascota.nombre} className="w-40 h-40 object-cover rounded-full mb-4"/>
            <h3 className="text-xl font-semibold">{mascota.nombre}</h3>
          </div>
          <div className="md:w-2/3 grid grid-cols-2 gap-4">
            <p><strong>Especie:</strong> {mascota.especie}</p>
            <p><strong>Raza:</strong> {mascota.raza}</p>
            <p><strong>Género:</strong> {mascota.genero}</p>
            <p><strong>Edad:</strong> {calcularEdad(mascota.fecha_de_nacimiento)} años</p>
            <p><strong>Peso:</strong> {mascota.peso} kg</p>
            <p><strong>Fecha de Nacimiento:</strong> {mascota.fecha_de_nacimiento ? new Date(mascota.fecha_de_nacimiento).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Última Vacuna:</strong> {mascota.fecha_ultima_vacuna ? new Date(mascota.fecha_ultima_vacuna).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="font-semibold">Historial Médico y Notas:</h4>
          <p className="mt-2 p-4 bg-gray-100 rounded">{mascota.historial_medico || 'Sin historial registrado.'}</p>
        </div>

        {mascota.cuidados_especiales && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Cuidados Especiales</h3>
              <button
                type="button"
                onClick={() => setMostrarCuidados((prev) => !prev)}
                className="text-sm text-blue-600 hover:underline"
              >
                {mostrarCuidados ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {mostrarCuidados && (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Administración de medicamentos</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{mascota.protocolo_medicamentos || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Dietas Especiales</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{mascota.protocolo_dietas_especiales || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Cuidado Geriátrico</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded p-3">{mascota.protocolo_cuidado_geriatrico || '—'}</p>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ViewMascotaModal;