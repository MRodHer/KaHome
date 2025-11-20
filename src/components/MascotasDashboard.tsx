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
  fecha_de_nacimiento?: string | null;
  fecha_ultima_vacuna?: string | null;
  // Nuevos campos
  activo?: boolean | null;
  esterilizado?: boolean | null;
  motivo_inactivo?: string | null;
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
  // Filtros avanzados
  const [filtroEspecie, setFiltroEspecie] = useState<'Todas'|'Perro'|'Gato'>('Todas');
  const [edadMin, setEdadMin] = useState<string>('');
  const [filtroVacuna, setFiltroVacuna] = useState<'Todas'|'PorVencer'|'Vencidas'|'SinRegistro'>('Todas');
  const [umbralDias, setUmbralDias] = useState<number>(30);
  // Nuevo filtro de estado (activas/inactivas)
  const [filtroEstado, setFiltroEstado] = useState<'SoloActivas'|'Todas'|'SoloInactivas'>('SoloActivas');

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
    const base = q
      ? mascotas.filter(m =>
          m.nombre.toLowerCase().includes(q) ||
          (m.especie && m.especie.toLowerCase().includes(q)) ||
          (m.raza && m.raza.toLowerCase().includes(q)) ||
          (m.id_cliente && (clientesById.get(m.id_cliente)?.toLowerCase() || '').includes(q))
        )
      : mascotas;

    const edadMinNum = edadMin ? parseInt(edadMin, 10) : null;
    const hoy = new Date();
    const fil = base.filter(m => {
      // Filtro por estado (activas/inactivas)
      if (filtroEstado === 'SoloActivas') {
        if (typeof m.activo === 'boolean' && m.activo === false) return false;
      } else if (filtroEstado === 'SoloInactivas') {
        // Mostrar solo las inactivas (activo === false)
        if (!(typeof m.activo === 'boolean' && m.activo === false)) return false;
      }
      // Especie
      if (filtroEspecie !== 'Todas' && m.especie?.toLowerCase() !== filtroEspecie.toLowerCase()) return false;
      // Edad mínima (en años), se excluyen los que no tienen fecha de nacimiento válida
      if (edadMinNum && edadMinNum > 0) {
        if (!m.fecha_de_nacimiento) return false;
        const f = new Date(m.fecha_de_nacimiento);
        if (isNaN(f.getTime())) return false;
        let years = hoy.getFullYear() - f.getFullYear();
        const mDiff = hoy.getMonth() - f.getMonth();
        const dDiff = hoy.getDate() - f.getDate();
        if (mDiff < 0 || (mDiff === 0 && dDiff < 0)) years -= 1;
        if (years < edadMinNum) return false;
      }
      // Vigencia de vacuna
      if (filtroVacuna !== 'Todas') {
        const fechaVac = m.fecha_ultima_vacuna ? new Date(m.fecha_ultima_vacuna) : null;
        if (filtroVacuna === 'SinRegistro') {
          // incluir solo sin registro
          if (fechaVac && !isNaN(fechaVac.getTime())) return false;
        } else {
          if (!fechaVac || isNaN(fechaVac.getTime())) return false; // sin registro quedan fuera cuando se filtra por vencidas/por vencer
          const vence = new Date(fechaVac);
          vence.setDate(vence.getDate() + 365);
          const diasRest = Math.ceil((vence.getTime() - hoy.getTime()) / (1000*60*60*24));
          const esVencida = diasRest < 0;
          if (filtroVacuna === 'Vencidas' && !esVencida) return false;
          if (filtroVacuna === 'PorVencer' && !(diasRest >= 0 && diasRest <= umbralDias)) return false;
        }
      }
      return true;
    });
    return fil;
      }, [mascotas, search, clientesById, filtroEspecie, edadMin, filtroVacuna, umbralDias, filtroEstado]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  function calcularEdadTexto(fechaISO?: string | null): string {
    if (!fechaISO) return '-';
    const fechaNac = new Date(fechaISO);
    if (isNaN(fechaNac.getTime())) return '-';
    const hoy = new Date();

    let años = hoy.getFullYear() - fechaNac.getFullYear();
    let meses = hoy.getMonth() - fechaNac.getMonth();
    const dias = hoy.getDate() - fechaNac.getDate();

    if (meses < 0 || (meses === 0 && dias < 0)) {
      años -= 1;
      meses += 12;
      if (dias < 0) {
        // Ajuste fino: si aún no ha llegado el día del mes, restamos un mes
        meses = (meses + 11) % 12; // asegura 0..11
      }
    }

    if (meses < 0) meses += 12;
    if (años < 0) años = 0;

    const txtAños = `${años} ${años === 1 ? 'año' : 'años'}`;
    const txtMeses = `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    return `${txtAños} ${txtMeses}`;
  }

  const openNew = () => { setSelectedMascota(null); setIsModalOpen(true); };
  const openEdit = (m: Mascota) => { setSelectedMascota(m); setIsModalOpen(true); };
  const closeModal = () => { setSelectedMascota(null); setIsModalOpen(false); };

  const handleSave = async (data: any) => {
    // Omitimos temporalmente campos de protocolo por el problema de caché de esquema en el API
    const omitFields = (obj: any, keys: string[]) => {
      const clone = { ...obj };
      for (const k of keys) delete clone[k];
      return clone;
    };
    const sanitizePayload = (obj: any) => {
      const p = { ...obj };
      // Fechas: vacío → null
      if (p.fecha_de_nacimiento === '') p.fecha_de_nacimiento = null;
      if (p.fecha_ultima_vacuna === '') p.fecha_ultima_vacuna = null;
      // Números: vacío → null, string → number
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
    const payloadSinProtocolo = omitFields(data, [
      'id_alimento','alimento_cantidad','alimento_frecuencia','alimento_horarios',
      'cuidados_especiales','protocolo_medicamentos','protocolo_dietas_especiales','protocolo_cuidado_geriatrico'
    ]);
    const payloadSanitizado = sanitizePayload(payloadSinProtocolo);

    const tryPersist = async (payload: any) => {
      if (selectedMascota) {
        const { error } = await supabaseAdmin.from('mascotas').update(payload, { returning: 'minimal' }).eq('id', selectedMascota.id);
        if (error) throw error;
        addNotification(`Mascota '${payload.nombre}' actualizada`, 'success');
      } else {
        const { error } = await supabaseAdmin.from('mascotas').insert([payload], { returning: 'minimal' });
        if (error) throw error;
        addNotification(`Mascota '${payload.nombre}' creada`, 'success');
      }
    };

    const isColumnCacheError = (msg?: string) => {
      if (!msg) return false;
      const m = msg.toLowerCase();
      return (
        m.includes("could not find the 'activo' column") ||
        m.includes('column \"activo\" does not exist') ||
        m.includes('column \"esterilizado\" does not exist') ||
        m.includes('column \"motivo_inactivo\" does not exist') ||
        m.includes('schema cache') ||
        m.includes('unknown column')
      );
    };

    try {
      await tryPersist(payloadSanitizado);
      closeModal();
      loadData();
    } catch (err: any) {
      const msg: string = String(err?.message || 'Error desconocido');
      // Fallback: si el API no reconoce las nuevas columnas de estado, reintentar sin ellas
      if (isColumnCacheError(msg)) {
        const payloadSinEstado = omitFields(payloadSanitizado, ['activo','esterilizado','motivo_inactivo']);
        try {
          await tryPersist(payloadSinEstado);
          closeModal();
          loadData();
          addNotification(`Mascota guardada sin campos de estado por caché de esquema. Reinicia el API de Supabase para habilitar todos los campos.`, 'warning');
        } catch (err2: any) {
          const msg2: string = String(err2?.message || 'Error desconocido');
          // Segundo fallback: quitar además campos de texto de protocolo/manejo
          const payloadMinimo = omitFields(payloadSinEstado, ['cuidados_especiales', 'protocolo_medicamentos', 'protocolo_dietas_especiales', 'protocolo_cuidado_geriatrico', 'observaciones', 'protocolo_manejo']);
          try {
            await tryPersist(payloadMinimo);
            closeModal();
            loadData();
            addNotification(`Mascota guardada con campos mínimos. (Reinicia el API de Supabase para habilitar todos los campos.)`, 'warning');
          } catch (err3: any) {
            const msg3: string = String(err3?.message || 'Error desconocido');
            addNotification('Error al guardar mascota (reintento mínimo): ' + msg3 + ' | Error original: ' + msg2, 'error');
          }
        }
      } else {
        addNotification('Error al guardar mascota: ' + msg, 'error');
      }
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

      {/* Filtros avanzados */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Especie</label>
          <select
            value={filtroEspecie}
            onChange={e => { setFiltroEspecie(e.target.value as any); setPage(1); }}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="Todas">Todas</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Edad mínima (años)</label>
          <input
            type="number"
            min={0}
            value={edadMin}
            onChange={e => { setEdadMin(e.target.value); setPage(1); }}
            placeholder="Ej. 6"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <p className="text-[11px] text-gray-500 mt-1">Mascotas sin fecha de nacimiento quedarán fuera si estableces un mínimo.</p>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Vigencia de vacuna</label>
          <select
            value={filtroVacuna}
            onChange={e => { setFiltroVacuna(e.target.value as any); setPage(1); }}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="Todas">Todas</option>
            <option value="PorVencer">Por vencer (≤ umbral)</option>
            <option value="Vencidas">Vencidas</option>
            <option value="SinRegistro">Sin registro</option>
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Selecciona "Sin registro" para ver mascotas sin fecha de última vacuna.</p>
          {filtroVacuna === 'PorVencer' && (
            <div className="mt-2">
              <label className="block text-xs text-gray-600 mb-1">Umbral (días)</label>
              <select
                value={umbralDias}
                onChange={e => { setUmbralDias(parseInt(e.target.value, 10)); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
                <option value={60}>60</option>
                <option value={90}>90</option>
              </select>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Estado</label>
          <select
            value={filtroEstado}
            onChange={e => { setFiltroEstado(e.target.value as any); setPage(1); }}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="SoloActivas">Solo activas</option>
            <option value="Todas">Mostrar todas</option>
            <option value="SoloInactivas">Solo inactivas</option>
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Usa "Solo inactivas" para localizar mascotas desactivadas.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Cargando mascotas...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No hay mascotas para mostrar</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {paginated.map(m => {
            const inactiva = typeof m.activo === 'boolean' && m.activo === false;
            const cardBase = 'border rounded-lg p-3 sm:p-4 flex gap-3 sm:gap-4';
            const cardClasses = inactiva
              ? `bg-gray-50 border-gray-300 opacity-90 ${cardBase}`
              : `bg-white border-gray-200 ${cardBase}`;
            const badgeClasses = inactiva
              ? 'bg-gray-200 text-gray-800 border border-gray-300'
              : 'bg-green-100 text-green-700 border border-green-200';
            const badgeText = inactiva ? 'Inactiva' : 'Activa';
            return (
            <div key={m.id} className={cardClasses}>
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
                {m.url_foto ? (
                  <img src={m.url_foto} alt={m.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin foto</div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{m.nombre}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded-full ${badgeClasses}`}>{badgeText}</span>
                  </div>
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
                {m.fecha_de_nacimiento ? (
                  <p className="text-xs sm:text-sm text-gray-600">Edad: {calcularEdadTexto(m.fecha_de_nacimiento)}</p>
                ) : null}
                {inactiva && m.motivo_inactivo ? (
                  <p className="text-[11px] text-gray-500 italic">Motivo inactivo: {m.motivo_inactivo}</p>
                ) : null}
                {(() => {
                  const f = m.fecha_ultima_vacuna ? new Date(m.fecha_ultima_vacuna) : null;
                  if (!f || isNaN(f.getTime())) return null;
                  const vence = new Date(f);
                  vence.setDate(vence.getDate() + 365);
                  const hoy = new Date();
                  const dias = Math.ceil((vence.getTime() - hoy.getTime()) / (1000*60*60*24));
                  const vencida = dias < 0;
                  const txt = vencida ? `Vacuna vencida hace ${Math.abs(dias)} días` : `Vacuna: ${dias} días restantes`;
                  const classes = vencida
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : (dias <= umbralDias ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-green-100 text-green-700 border border-green-200');
                  return (
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 text-[11px] rounded-full ${classes}`}>{txt}</span>
                    </div>
                  );
                })()}
                {/* Esterilización */}
                <p className="text-xs sm:text-sm text-gray-600">
                  { (m.esterilizado ?? false) ? 'Esterilizada' : 'No esterilizada' }
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Dueño: {m.id_cliente ? (clientesById.get(m.id_cliente) || '-') : '-'}</p>
              </div>
            </div>
          );
          })}
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