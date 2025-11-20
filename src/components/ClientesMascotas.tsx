import React, { useState, useEffect, useMemo } from 'react';
import { supabaseAdmin } from '../lib/supabase';
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import { UploadPhoto } from './UploadPhoto';
import ClienteModal from './modals/ClienteModal';
import MascotaModal from './modals/MascotaModal';
import ViewMascotaModal from './modals/ViewMascotaModal';
import { useNotification } from '../context/NotificationContext';

// Interfaces
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
  mascotas: Mascota[];
  ubicaciones: {
    nombre: string;
  };
}

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

interface Ubicacion {
  id: string;
  nombre: string;
}

// Constantes
const ITEMS_PER_PAGE = 10;

// Componente Principal
export const ClientesMascotas: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof Cliente | 'mascotas_count'>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedClienteId, setExpandedClienteId] = useState<string | null>(null);

  const [isClienteModalOpen, setClienteModalOpen] = useState(false);
  const [isMascotaModalOpen, setMascotaModalOpen] = useState(false);
  const [isViewMascotaModalOpen, setViewMascotaModalOpen] = useState(false);
  
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const { addNotification } = useNotification();

  async function fetchUbicaciones() {
    const { data, error } = await supabaseAdmin.from('ubicaciones').select('id, nombre');
    if (error) {
      console.error('Error fetching ubicaciones:', error);
    } else {
      setUbicaciones(data || []);
    }
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    addNotification('Cargando datos...', 'info');

    try {
      const { data: clientesData, error: clientesError } = await supabaseAdmin
        .from('clientes')
        .select(`
          id, nombre, email, telefono, fecha_registro, id_ubicacion, consentimiento_datos, calle_numero, colonia, codigo_postal, municipio, estado,
          ubicaciones (nombre)
        `);

      if (clientesError) throw clientesError;

      const { data: mascotasData, error: mascotasError } = await supabaseAdmin
        .from('mascotas')
        .select('*');

      if (mascotasError) throw mascotasError;

      const clientesConMascotas = clientesData.map(cliente => ({
        ...cliente,
        mascotas: mascotasData.filter(mascota => mascota.id_cliente === cliente.id),
      }));

      setClientes(clientesConMascotas);
    } catch (err: any) {
      setError(err.message);
      addNotification('Error al cargar los datos: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    fetchUbicaciones();
  }, []);

  const handleSort = (column: keyof Cliente | 'mascotas_count') => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);
  };

  const sortedClientes = useMemo(() => {
    return [...clientes].sort((a, b) => {
      const aValue = sortColumn === 'mascotas_count' ? a.mascotas.length : a[sortColumn];
      const bValue = sortColumn === 'mascotas_count' ? b.mascotas.length : b[sortColumn];

      if (aValue == null || bValue == null) return 0;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [clientes, sortColumn, sortDirection]);

  const filteredClientes = useMemo(() => {
    return sortedClientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.telefono && cliente.telefono.includes(searchTerm))
    );
  }, [sortedClientes, searchTerm]);

  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClientes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClientes, currentPage]);

  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);

  const openClienteModal = () => {
    setSelectedCliente(null);
    setClienteModalOpen(true);
  };

  const closeClienteModal = () => {
    setClienteModalOpen(false);
    setSelectedCliente(null);
  };

  const openMascotaModal = (cliente?: Cliente) => {
    if (cliente) {
      setSelectedCliente(cliente);
    }
    setSelectedMascota(null);
    setMascotaModalOpen(true);
  };

  const closeMascotaModal = () => {
    setMascotaModalOpen(false);
    setSelectedMascota(null);
    setSelectedCliente(null); 
  };

  const handleSaveCliente = async (clienteData: Omit<Cliente, 'id' | 'fecha_registro' | 'mascotas_count' | 'mascotas'>) => {
    try {
      let response;
      if (selectedCliente) {
        response = await supabaseAdmin.from('clientes').update(clienteData).eq('id', selectedCliente.id);
      } else {
        response = await supabaseAdmin.from('clientes').insert([clienteData]);
      }
      if (response.error) throw response.error;
      fetchData();
      closeClienteModal();
      addNotification(`Cliente '${(clienteData as any).nombre}' guardado con éxito`, 'success');
    } catch (error: any) {
      addNotification('Error al guardar el cliente: ' + error.message, 'error');
    }
  };

  const handleSaveMascota = async (mascotaData: any) => {
    const omitFields = (obj: any, keys: string[]) => {
      const clone = { ...obj };
      for (const k of keys) delete clone[k];
      return clone;
    };
    const sanitizePayload = (obj: any) => {
      const p = { ...obj };
      // Normalizar fechas: vacío → null
      if (p.fecha_de_nacimiento === '') p.fecha_de_nacimiento = null;
      if (p.fecha_ultima_vacuna === '') p.fecha_ultima_vacuna = null;
      // Normalizar números: vacío → null
      if (p.peso === '' || p.peso === undefined) {
        p.peso = null;
      } else if (typeof p.peso === 'string') {
        const num = parseFloat(p.peso);
        p.peso = Number.isFinite(num) ? num : null;
      }
      if (p.edad === '' || p.edad === undefined) {
        p.edad = null;
      } else if (typeof p.edad === 'string') {
        const num = parseInt(p.edad, 10);
        p.edad = Number.isFinite(num) ? num : null;
      }
      return p;
    };
    const tryPersist = async (payload: any) => {
      if (selectedMascota) {
        // Evitar representación completa para no disparar el error de caché de esquema en PostgREST
        return await supabaseAdmin.from('mascotas').update(payload, { returning: 'minimal' }).eq('id', selectedMascota.id);
      } else {
        return await supabaseAdmin.from('mascotas').insert([payload], { returning: 'minimal' });
      }
    };

    // Mitigación proactiva: mientras la API de Supabase no refresque la caché de esquema,
    // omitimos SIEMPRE los campos de protocolo de alimento para evitar el error de "schema cache".
    // Una vez que reinicies el API/recargues el esquema, podremos volver a enviar estos campos.
    const payloadSinProtocolo = omitFields(mascotaData, [
      'id_alimento','alimento_cantidad','alimento_frecuencia','alimento_horarios',
      // Omitir también los nuevos campos de protocolo hasta que el esquema esté refrescado
      'cuidados_especiales','protocolo_medicamentos','protocolo_dietas_especiales','protocolo_cuidado_geriatrico'
    ]);
    const payloadSanitizado = sanitizePayload(payloadSinProtocolo);

    try {
      const res = await tryPersist(payloadSanitizado);
      if (res.error) throw res.error;
      fetchData();
      closeMascotaModal();
      // Advertimos que los campos de protocolo se omitieron
      const omitioCampos = ['id_alimento','alimento_cantidad','alimento_frecuencia','alimento_horarios','cuidados_especiales','protocolo_medicamentos','protocolo_dietas_especiales','protocolo_cuidado_geriatrico'].some(k => k in mascotaData);
      if (omitioCampos) {
        addNotification(`Mascota '${mascotaData.nombre}' guardada (se omitieron temporalmente los campos de protocolo alimento_* por caché de esquema).`, 'warning');
      } else {
        addNotification(`Mascota '${mascotaData.nombre}' guardada con éxito`, 'success');
      }
    } catch (error: any) {
      const msg: string = String(error?.message || 'Error desconocido');
      const isColumnCacheError = (m?: string) => {
        if (!m) return false;
        const l = m.toLowerCase();
        return (
          l.includes("could not find the 'activo' column") ||
          l.includes('column \"activo\" does not exist') ||
          l.includes('column \"esterilizado\" does not exist') ||
          l.includes('column \"motivo_inactivo\" does not exist') ||
          l.includes('schema cache') ||
          l.includes('unknown column')
        );
      };

      if (isColumnCacheError(msg)) {
        // Fallback: reintentar sin los campos de estado si el API no los reconoce todavía
        const payloadSinEstado = omitFields(payloadSanitizado, ['activo','esterilizado','motivo_inactivo']);
        try {
          const res2 = await tryPersist(payloadSinEstado);
          if (res2.error) throw res2.error;
          fetchData();
          closeMascotaModal();
          addNotification(`Mascota '${mascotaData.nombre}' guardada sin campos de estado por caché de esquema. Reinicia el API de Supabase para habilitar todos los campos.`, 'warning');
        } catch (error2: any) {
          const msg2 = String(error2?.message || 'Error desconocido');
          // Segundo fallback: quitar además campos de texto de protocolo/manejo
          const payloadMinimo = omitFields(payloadSinEstado, ['observaciones', 'protocolo_manejo']);
          try {
            const res3 = await tryPersist(payloadMinimo);
            if (res3.error) throw res3.error;
            fetchData();
            closeMascotaModal();
            addNotification(`Mascota '${mascotaData.nombre}' guardada con campos mínimos. (Reinicia el API de Supabase para habilitar todos los campos.)`, 'warning');
          } catch (error3: any) {
            addNotification('Error al guardar la mascota (reintento mínimo): ' + String(error3?.message || msg2), 'error');
          }
        }
      } else {
        addNotification('Error al guardar la mascota: ' + msg, 'error');
      }
    }
  };

  const toggleClienteExpansion = (clienteId: string) => {
    setExpandedClienteId(expandedClienteId === clienteId ? null : clienteId);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setClienteModalOpen(true);
  };

  const handleDeleteCliente = async (clienteId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente y todas sus mascotas?')) {
      const originalClientes = [...clientes];
      const clienteAEliminar = clientes.find(c => c.id === clienteId);
      
      setClientes(prev => prev.filter(c => c.id !== clienteId));
      addNotification(`Cliente '${clienteAEliminar?.nombre}' eliminado.`, 'warning');

      try {
        const { error: mascotasError } = await supabaseAdmin.from('mascotas').delete().eq('id_cliente', clienteId);
        if (mascotasError) throw mascotasError;
        const { error: clienteError } = await supabaseAdmin.from('clientes').delete().eq('id', clienteId);
        if (clienteError) throw clienteError;
        addNotification('Cliente eliminado permanentemente', 'success');
      } catch (error: any) {
        addNotification('Error al eliminar el cliente: ' + error.message, 'error');
        setClientes(originalClientes);
      }
    }
  };

  const handleViewMascota = (mascota: Mascota) => {
    setSelectedMascota(mascota);
    setViewMascotaModalOpen(true);
  };

  const handleDeleteMascota = async (mascotaId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      const originalClientes = [...clientes];
      const mascotaAEliminar = clientes.flatMap(c => c.mascotas).find(m => m.id === mascotaId);

      const nuevosClientes = clientes.map(c => ({
        ...c,
        mascotas: c.mascotas.filter(m => m.id !== mascotaId)
      }));
      setClientes(nuevosClientes);
      addNotification(`Mascota '${mascotaAEliminar?.nombre}' eliminada.`, 'warning');

      try {
        const { error } = await supabaseAdmin.from('mascotas').delete().eq('id', mascotaId);
        if (error) throw error;
        addNotification('Mascota eliminada permanentemente', 'success');
      } catch (error: any) {
        addNotification('Error al eliminar la mascota: ' + error.message, 'error');
        setClientes(originalClientes);
      }
    }
  };

  if (loading) return <div className="p-4">Cargando datos...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
          <div className="flex gap-2">
            <button
              onClick={() => openClienteModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Nuevo Cliente
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                  <th onClick={() => handleSort('nombre')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Nombre {sortColumn === 'nombre' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('email')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Email {sortColumn === 'email' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('telefono')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Teléfono {sortColumn === 'telefono' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('mascotas_count')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Mascotas {sortColumn === 'mascotas_count' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('fecha_registro')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Registro {sortColumn === 'fecha_registro' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedClientes.map(cliente => (
                  <React.Fragment key={cliente.id}>
                    <tr className={`${expandedClienteId === cliente.id ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => toggleClienteExpansion(cliente.id)} className="text-blue-600 hover:text-blue-800">
                          {expandedClienteId === cliente.id ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.telefono}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{cliente.mascotas.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(cliente.fecha_registro).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditCliente(cliente)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleDeleteCliente(cliente.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedClienteId === cliente.id && (
                      <tr>
                        <td colSpan={7} className="p-4 bg-gray-50">
                          <div className="pl-12">
                            <h4 className="font-semibold text-gray-700 mb-2">Mascotas de {cliente.nombre}:</h4>
                            {cliente.mascotas.length > 0 ? (
                              <ul className="divide-y divide-gray-200">
                                {cliente.mascotas.map(mascota => (
                                  <li key={mascota.id} className="py-2 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <img src={mascota.url_foto || '/placeholder-mascota.png'} alt={mascota.nombre} className="h-10 w-10 rounded-full object-cover" />
                                      <div>
                                        <p className="font-medium">{mascota.nombre} <span className="text-xs text-gray-500">({mascota.especie} - {mascota.raza})</span></p>
                                        <p className="text-sm text-gray-600">{mascota.edad} años, {mascota.peso} kg</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <button onClick={() => handleViewMascota(mascota)} className="text-blue-600 hover:text-blue-800"><EyeIcon className="h-5 w-5" /></button>
                                      <button onClick={() => handleDeleteMascota(mascota.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5" /></button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">Este cliente no tiene mascotas registradas.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <ClienteModal
        isOpen={isClienteModalOpen}
        onClose={closeClienteModal}
        onSave={handleSaveCliente}
        cliente={selectedCliente}
        ubicaciones={ubicaciones}
        onAddMascotaToExisting={() => {
          if (selectedCliente) {
            setClienteModalOpen(false);
            setMascotaModalOpen(true);
          }
        }}
        onCreateAndAddMascota={async (clienteData: any) => {
          try {
            const { data, error } = await supabaseAdmin
              .from('clientes')
              .insert([clienteData])
              .select()
              .single();
            if (error) throw error;
            addNotification(`Cliente '${clienteData.nombre}' creado. Ahora añade una mascota.`, 'success');
            setSelectedCliente(data);
            setClienteModalOpen(false);
            setMascotaModalOpen(true);
            // Refrescar lista
            fetchData();
          } catch (err: any) {
            addNotification('Error al crear el cliente y abrir mascota: ' + err.message, 'error');
          }
        }}
      />

      <MascotaModal
        isOpen={isMascotaModalOpen}
        onClose={closeMascotaModal}
        onSave={handleSaveMascota}
        mascota={selectedMascota}
        clientes={clientes}
        initialClienteId={selectedCliente?.id}
      />

      <ViewMascotaModal
        isOpen={isViewMascotaModalOpen}
        onClose={() => setViewMascotaModalOpen(false)}
        mascota={selectedMascota}
      />
    </div>
  );
};

export default ClientesMascotas;