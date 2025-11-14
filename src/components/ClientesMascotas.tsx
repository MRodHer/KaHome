import { useEffect, useState } from 'react';
import { supabase, type Cliente, type Mascota, type Ubicacion } from '../lib/supabase';
import { Plus, Search, Edit2, Eye } from 'lucide-react';

export function ClientesMascotas() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewClienteForm, setShowNewClienteForm] = useState(false);
  const [showNewMascotaForm, setShowNewMascotaForm] = useState(false);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<Mascota | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [clientesRes, mascotasRes, ubicacionesRes] = await Promise.all([
        supabase.from('clientes').select('*').order('created_at', { ascending: false }),
        supabase.from('mascotas').select('*').order('created_at', { ascending: false }),
        supabase.from('ubicaciones').select('*').order('created_at', { ascending: false }),
      ]);

      if (clientesRes.data) setClientes(clientesRes.data);
      if (mascotasRes.data) setMascotas(mascotasRes.data);
      if (ubicacionesRes.data) setUbicaciones(ubicacionesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMascotas = mascotas.filter(m =>
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.codigo_unico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.especie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Clientes y Mascotas</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewClienteForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
          <button
            onClick={() => setShowNewMascotaForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Mascota
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o especie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mascotas Registradas</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Foto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código Único</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Especie</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Raza</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Edad</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Última Vacuna</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMascotas.map((mascota) => {
                  const cliente = clientes.find(c => c.id === mascota.id_cliente);
                  const diasDesdeVacuna = mascota.fecha_ultima_vacuna
                    ? Math.floor((new Date().getTime() - new Date(mascota.fecha_ultima_vacuna).getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  const vacunaVencida = diasDesdeVacuna && diasDesdeVacuna > 330;

                  return (
                    <tr key={mascota.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {mascota.url_foto ? (
                          <img
                            src={mascota.url_foto}
                            alt={mascota.nombre}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg font-semibold">
                              {mascota.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-gray-900">{mascota.codigo_unico}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{mascota.nombre}</p>
                          <p className="text-sm text-gray-500">{cliente?.nombre || 'Sin cliente'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{mascota.especie}</td>
                      <td className="px-4 py-3 text-gray-700">{mascota.raza || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{mascota.edad ? `${mascota.edad} años` : '-'}</td>
                      <td className="px-4 py-3">
                        {mascota.fecha_ultima_vacuna ? (
                          <div>
                            <p className={vacunaVencida ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                              {new Date(mascota.fecha_ultima_vacuna).toLocaleDateString('es-MX')}
                            </p>
                            {vacunaVencida && (
                              <span className="text-xs text-red-600">¡Vencida!</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" onClick={() => setMascotaSeleccionada(mascota)}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Clientes Registrados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientes.map((cliente) => {
              const mascotasCliente = mascotas.filter(m => m.id_cliente === cliente.id);
              return (
                <div key={cliente.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900">{cliente.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">{cliente.email}</p>
                  <p className="text-sm text-gray-600">{cliente.telefono}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      {mascotasCliente.length} mascota{mascotasCliente.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Registrado: {new Date(cliente.fecha_registro).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showNewClienteForm && (
        <NewClienteModal ubicaciones={ubicaciones} onClose={() => setShowNewClienteForm(false)} onSuccess={loadData} />
      )}
      {showNewMascotaForm && (
        <NewMascotaModal clientes={clientes} onClose={() => setShowNewMascotaForm(false)} onSuccess={loadData} />
      )}\n      {mascotaSeleccionada && <ViewMascotaModal mascota={mascotaSeleccionada} onClose={() => setMascotaSeleccionada(null)} />}
    </div>
  );
}

function ViewMascotaModal({ mascota, onClose }: { mascota: Mascota; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{mascota.nombre}</h2>
        <p><strong>Especie:</strong> {mascota.especie}</p>
        <p><strong>Raza:</strong> {mascota.raza}</p>
        <p><strong>Edad:</strong> {mascota.edad} años</p>
        <p><strong>Peso:</strong> {mascota.peso} kg</p>
        <p><strong>Última vacuna:</strong> {mascota.fecha_ultima_vacuna ? new Date(mascota.fecha_ultima_vacuna).toLocaleDateString('es-MX') : 'N/A'}</p>
        <div className="mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function NewClienteModal({ ubicaciones, onClose, onSuccess }: { ubicaciones: Ubicacion[]; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    id_ubicacion: '',
    consentimiento_datos: false,
    calle_numero: '', // <-- Nuevo
    colonia: '',      // <-- Nuevo
    codigo_postal: '', // <-- Nuevo
    municipio: '',    // <-- Nuevo
    estado: '',       // <-- Nuevo
  });
  const [submitting, setSubmitting] = useState(false);

  // Si solo hay una ubicación disponible, seleccionarla por defecto
  useEffect(() => {
    if (ubicaciones.length === 1 && !formData.id_ubicacion) {
      setFormData((prev) => ({ ...prev, id_ubicacion: ubicaciones[0].id }));
    }
  }, [ubicaciones, formData.id_ubicacion]);

  // --- INICIO DE MODIFICACIÓN: Función para Código Postal ---
  const handlePostalCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cp = e.target.value;
    setFormData({ ...formData, codigo_postal: cp });

    if (cp.length === 5) {
      try {
        setSubmitting(true);
        const response = await fetch(`https://api.sepomex.com/v2/info_cp/${cp}`);
        const data = await response.json();

        if (data && data.cp) {
          setFormData(prev => ({
            ...prev,
            colonia: data.colonias.join(', '),
            municipio: data.municipio,
            estado: data.estado,
          }));
        } else {
          throw new Error('Código Postal no encontrado');
        }
      } catch (error) {
        console.error('Error al buscar CP:', error);
        setFormData(prev => ({ ...prev, colonia: '', municipio: '', estado: '' }));
      } finally {
        setSubmitting(false);
      }
    }
  };
  // --- FIN DE MODIFICACIÓN ---

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // --- INICIO DE MODIFICACIÓN: Datos de Submit ---
      const { error } = await supabase.from('clientes').insert([
        {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          id_ubicacion: formData.id_ubicacion || (ubicaciones.length === 1 ? ubicaciones[0].id : null), // Asegura la ubicación única
          consentimiento_datos: formData.consentimiento_datos,
          fecha_registro: new Date().toISOString().split('T')[0],
          calle_numero: formData.calle_numero,
          colonia: formData.colonia,
          codigo_postal: formData.codigo_postal,
          municipio: formData.municipio,
          estado: formData.estado,
        },
      ]);
      // --- FIN DE MODIFICACIÓN ---

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating cliente:', error);
      alert('Error al crear cliente');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuevo Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* --- INICIO DE MODIFICACIÓN: Lógica de Ubicaciones --- */}
          {ubicaciones.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación*</label>
              <select
                required
                value={formData.id_ubicacion}
                onChange={(e) => setFormData({ ...formData, id_ubicacion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar ubicación</option>
                {ubicaciones.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {ubicaciones.length === 0 && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> No hay ubicaciones configuradas. Ejecuta el script SQL de ubicaciones.
              </p>
            </div>
          )}
          {/* Si hay 1 ubicación, el campo se oculta y se auto-selecciona */}
          {/* --- FIN DE MODIFICACIÓN --- */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo*</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* --- INICIO DE MODIFICACIÓN: Campos de Dirección --- */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Dirección</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calle y Número</label>
                <input
                  type="text"
                  value={formData.calle_numero}
                  onChange={(e) => setFormData({ ...formData, calle_numero: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={formData.codigo_postal}
                    onChange={handlePostalCodeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colonia</label>
                  <input
                    type="text"
                    value={formData.colonia}
                    onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* --- FIN DE MODIFICACIÓN --- */}

          <div className="flex items-start">
            <input
              type="checkbox"
              required
              checked={formData.consentimiento_datos}
              onChange={(e) => setFormData({ ...formData, consentimiento_datos: e.target.checked })}
              className="mt-1 mr-2"
            />
            <label className="text-sm text-gray-700">
              Acepto el tratamiento de mis datos personales conforme a la LFPDPPP*
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || ubicaciones.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewMascotaModal({ clientes, onClose, onSuccess }: { clientes: Cliente[]; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    id_cliente: '',
    nombre: '',
    especie: 'Perro',
    raza: 'Mestizo',
    raza_otra: '',
    genero: 'Macho',
    edad: '',
    peso: '',
    fecha_ultima_vacuna: '',
    historial_medico: '',
    url_foto: '', // Nuevo
  });
  const [submitting, setSubmitting] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const razaParaGuardar = formData.raza === 'Otro' ? formData.raza_otra : formData.raza;

      const { error } = await supabase.from('mascotas').insert([
        {
          id_cliente: formData.id_cliente,
          nombre: formData.nombre,
          especie: formData.especie,
          raza: razaParaGuardar || null,
          genero: formData.genero,
          edad: formData.edad ? parseInt(formData.edad) : null,
          peso: formData.peso ? parseFloat(formData.peso) : null,
          fecha_ultima_vacuna: formData.fecha_ultima_vacuna || null,
          historial_medico: formData.historial_medico || '',
          url_foto: formData.url_foto || null, // Nuevo
        },
      ]);
 
      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating mascota:', error);
      alert('Error al crear mascota');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nueva Mascota</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente*</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                required
                value={formData.id_cliente}
                onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cliente</option>
                {clientes
                  .filter((c) => c.nombre.toLowerCase().includes(clientSearch.toLowerCase()))
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especie*</label>
              <select
                required
                value={formData.especie}
                onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Género*</label>
              <select
                required
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <select
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Mestizo">Mestizo</option>
                <option value="Chihuahua">Chihuahua</option>
                <option value="Schnauzer">Schnauzer</option>
                <option value="Labrador Retriever">Labrador Retriever</option>
                <option value="Golden Retriever">Golden Retriever</option>
                <option value="Pug">Pug</option>
                <option value="Poodle (Caniche)">Poodle (Caniche)</option>
                <option value="Bulldog Francés">Bulldog Francés</option>
                <option value="Pastor Alemán">Pastor Alemán</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad (años)</label>
              <input
                type="number"
                min="0"
                value={formData.edad}
                onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {formData.raza === 'Otro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especificar otra raza*</label>
              <input
                type="text"
                required
                value={formData.raza_otra}
                onChange={(e) => setFormData({ ...formData, raza_otra: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)*</label>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={formData.peso}
              onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Última Vacuna</label>
            <input
              type="date"
              value={formData.fecha_ultima_vacuna}
              onChange={(e) => setFormData({ ...formData, fecha_ultima_vacuna: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Historial Médico</label>
            <textarea
              value={formData.historial_medico}
              onChange={(e) => setFormData({ ...formData, historial_medico: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Alergias, medicamentos, condiciones especiales..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de la Foto</label>
            <input
              type="url"
              value={formData.url_foto}
              onChange={(e) => setFormData({ ...formData, url_foto: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
