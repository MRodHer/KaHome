import React, { useState, useEffect } from 'react';
import { UploadPhoto } from '../UploadPhoto';
import { supabaseAdmin } from '../../lib/supabase';

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
  // Nuevos campos opcionales para protocolo
  id_alimento?: string;
  alimento_cantidad?: string;
  alimento_frecuencia?: string;
  alimento_horarios?: string;
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
    // Estado
    esterilizado: false,
    activo: true,
    motivo_inactivo: '',
    // Protocolo de manejo
    id_alimento: '',
    alimento_cantidad: '',
    alimento_frecuencia: '',
    alimento_horarios: '',
    cuidados_especiales: false,
    protocolo_medicamentos: '',
    protocolo_dietas_especiales: '',
    protocolo_cuidado_geriatrico: '',
  });
  // Lista extensa de razas de perro (coincide con el modal de edición)
  const RAZAS_PERRO = [
    "Mestizo","Affenpinscher","Airedale Terrier","Akita","Akita Americano","Alaskan Malamute","American Bully","American Eskimo Dog","American Foxhound","American Pit Bull Terrier","American Staffordshire Terrier","Australian Cattle Dog","Australian Shepherd","Basenji","Basset Hound","Beagle","Bedlington Terrier","Bernese Mountain Dog","Bichon Frise","Black and Tan Coonhound","Bloodhound","Border Collie","Border Terrier","Borzoi","Boston Terrier","Boxer","Boykin Spaniel","Braco Alemán de Pelo Corto","Braco Húngaro (Vizsla)","Brittany","Bull Terrier","Bulldog","Bulldog Francés","Bullmastiff","Cairn Terrier","Canaan Dog","Cane Corso","Cardigan Welsh Corgi","Cavalier King Charles Spaniel","Chesapeake Bay Retriever","Chihuahua","Chinese Crested","Chinese Shar-Pei","Chow Chow","Cocker Spaniel","Collie","Cotton de Tulear","Dachshund","Dalmatian","Doberman Pinscher","Dogo de Burdeos","English Cocker Spaniel","English Setter","English Springer Spaniel","Eurasier","Field Spaniel","Finnish Lapphund","Fox Terrier","Galgo","German Shorthaired Pointer","Giant Schnauzer","Glen of Imaal Terrier","Golden Retriever","Goldendoodle","Gordon Setter","Great Dane","Great Pyrenees","Greater Swiss Mountain Dog","Greyhound","Havanese","Irish Setter","Irish Terrier","Irish Wolfhound","Italian Greyhound","Jack Russell Terrier","Japanese Chin","Keeshond","Kerry Blue Terrier","Komondor","Kuvasz","Labradoodle","Labrador Retriever","Lakeland Terrier","Leonberger","Lhasa Apso","Lowchen","Maltese","Manchester Terrier","Mastiff","Miniature Bull Terrier","Miniature Pinscher","Miniature Schnauzer","Newfoundland","Norfolk Terrier","Norwegian Elkhound","Norwich Terrier","Nova Scotia Duck Tolling Retriever","Old English Sheepdog","Papillon","Parson Russell Terrier","Pekingese","Pembroke Welsh Corgi","Petit Basset Griffon Vendéen","Pharaoh Hound","Pointer","Pomeranian","Poodle (Miniature)","Poodle (Standard)","Poodle (Toy)","Portuguese Water Dog","Pug","Rat Terrier","Rhodesian Ridgeback","Rottweiler","Russell Terrier","Saint Bernard","Saluki","Samoyed","Schipperke","Schnauzer","Scottish Deerhound","Scottish Terrier","Sealyham Terrier","Shetland Sheepdog","Shiba Inu","Shih Tzu","Siberian Husky","Silky Terrier","Skye Terrier","Smooth Fox Terrier","Soft Coated Wheaten Terrier","Stabyhoun","Staffordshire Bull Terrier","Standard Schnauzer","Sussex Spaniel","Swedish Vallhund","Tibetan Mastiff","Tibetan Spaniel","Tibetan Terrier","Toy Fox Terrier","Treeing Walker Coonhound","Vizsla","Weimaraner","Welsh Springer Spaniel","Welsh Terrier","West Highland White Terrier","Whippet","Wire Fox Terrier","Wirehaired Pointing Griffon","Xoloitzcuintli","Yorkshire Terrier","Otro"
  ];
  // Lista de razas de gato
  const RAZAS_GATO = [
    "Mestizo","Siamés","Persa","Maine Coon","Ragdoll","Bengala","Sphynx","Abisinio","Birmano","Oriental de pelo corto","Siberiano","British Shorthair","Scottish Fold","Bombay","Himalayo","Azul Ruso","Chartreux","Cornish Rex","Devon Rex","Somalí","Manx","American Shorthair","American Curl","European Shorthair","Noruego de Bosque","Selkirk Rex","Savannah","Pixie-bob","Ocicat","Tonkinés","Angora Turco","Van Turco","Peterbald","Nebelung","LaPerm","Serengeti","Exótico de pelo corto","Otro"
  ];
  const [razasPerro, setRazasPerro] = useState<string[]>(RAZAS_PERRO);
  const [razasGato, setRazasGato] = useState<string[]>(RAZAS_GATO);
  const [especieSeleccion, setEspecieSeleccion] = useState<string>('');
  const [especieOtro, setEspecieOtro] = useState<string>('');
  const [razaOtra, setRazaOtra] = useState<string>('');
  const [alimentosCatalogo, setAlimentosCatalogo] = useState<{ id: string; nombre: string; tipo_mascota?: string | null }[]>([]);

  // Fallback local de alimentos por especie en caso de catálogo vacío o incompleto
  const ALIMENTOS_FALLBACK: { id: string; nombre: string; tipo_mascota?: string | null }[] = [
    // Perro
    { id: 'fallback-perro-pro-plan', nombre: 'Purina Pro Plan', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-dog-chow', nombre: 'Purina Dog Chow', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-royal-canin', nombre: 'Royal Canin', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-hills', nombre: 'Hill\'s Science Diet', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-eukanuba', nombre: 'Eukanuba', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-nupec', nombre: 'Nupec', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-pedigree', nombre: 'Pedigree', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-orijen', nombre: 'Orijen', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-acana', nombre: 'Acana', tipo_mascota: 'Perro' },
    // Gato
    { id: 'fallback-gato-pro-plan', nombre: 'Purina Pro Plan', tipo_mascota: 'Gato' },
    { id: 'fallback-gato-cat-chow', nombre: 'Purina Cat Chow', tipo_mascota: 'Gato' },
    { id: 'fallback-gato-royal-canin', nombre: 'Royal Canin', tipo_mascota: 'Gato' },
    { id: 'fallback-gato-hills', nombre: 'Hill\'s Science Diet', tipo_mascota: 'Gato' },
    { id: 'fallback-gato-whiskas', nombre: 'Whiskas', tipo_mascota: 'Gato' },
    { id: 'fallback-gato-nupec', nombre: 'Nupec', tipo_mascota: 'Gato' },
    { id: 'fallback-gato-orijen', nombre: 'Orijen', tipo_mascota: 'Gato' },
    { id: 'fallback-gato-acana', nombre: 'Acana', tipo_mascota: 'Gato' },
    { id: 'fallback-gato-felix', nombre: 'Felix', tipo_mascota: 'Gato' },
    { id: 'fallback-gato-fancy-feast', nombre: 'Fancy Feast', tipo_mascota: 'Gato' },
  ];

  const mergeUnique = (base: string[], extra: string[]) => {
    const set = new Set(base);
    extra.forEach(e => { if (e && !set.has(e)) set.add(e); });
    return Array.from(set);
  };

  const cargarCatalogo = async () => {
    try {
      const [perrosRes, gatosRes] = await Promise.all([
        supabaseAdmin.from('catalogo_razas').select('nombre').eq('especie', 'Perro').eq('activo', true).order('nombre', { ascending: true }),
        supabaseAdmin.from('catalogo_razas').select('nombre').eq('especie', 'Gato').eq('activo', true).order('nombre', { ascending: true }),
      ]);
      const perros = Array.isArray(perrosRes.data) ? perrosRes.data.map((d: any) => d.nombre).filter(Boolean) : [];
      const gatos = Array.isArray(gatosRes.data) ? gatosRes.data.map((d: any) => d.nombre).filter(Boolean) : [];
      setRazasPerro(mergeUnique(RAZAS_PERRO, perros));
      setRazasGato(mergeUnique(RAZAS_GATO, gatos));
    } catch {
      // Si falla, mantenemos las listas base
      setRazasPerro(RAZAS_PERRO);
      setRazasGato(RAZAS_GATO);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (mascota) {
        // Asegurar que los campos de fecha queden en ISO (YYYY-MM-DD) para que el input tipo "date" muestre el mini calendario correctamente
        const toISODate = (v?: string) => {
          if (!v) return '';
          const s = String(v);
          if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
          try { return new Date(s).toISOString().slice(0,10); } catch { return ''; }
        };
        setFormData({
          id_cliente: (mascota as any).id_cliente || initialClienteId || '',
          nombre: mascota.nombre || '',
          especie: mascota.especie || '',
          raza: mascota.raza || '',
          genero: mascota.genero || 'Macho',
          fecha_de_nacimiento: toISODate(mascota.fecha_de_nacimiento),
          peso: mascota.peso || 0,
          url_foto: mascota.url_foto || '',
          historial_medico: mascota.historial_medico || '',
          fecha_ultima_vacuna: toISODate(mascota.fecha_ultima_vacuna),
          esterilizado: Boolean((mascota as any).esterilizado) || false,
          activo: (typeof (mascota as any).activo === 'boolean') ? (mascota as any).activo : true,
          motivo_inactivo: (mascota as any).motivo_inactivo || '',
          id_alimento: (mascota as any).id_alimento || '',
          alimento_cantidad: (mascota as any).alimento_cantidad || '',
          alimento_frecuencia: (mascota as any).alimento_frecuencia || '',
          alimento_horarios: (mascota as any).alimento_horarios || '',
          cuidados_especiales: Boolean((mascota as any).cuidados_especiales) || false,
          protocolo_medicamentos: (mascota as any).protocolo_medicamentos || '',
          protocolo_dietas_especiales: (mascota as any).protocolo_dietas_especiales || '',
          protocolo_cuidado_geriatrico: (mascota as any).protocolo_cuidado_geriatrico || '',
        });
        const esp = mascota.especie || '';
        if (esp === 'Perro' || esp === 'Gato') {
          setEspecieSeleccion(esp);
          setEspecieOtro('');
        } else if (esp) {
          setEspecieSeleccion('Otro');
          setEspecieOtro(esp);
        } else {
          setEspecieSeleccion('');
          setEspecieOtro('');
        }
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
          esterilizado: false,
          activo: true,
          motivo_inactivo: '',
          id_alimento: '',
          alimento_cantidad: '',
          alimento_frecuencia: '',
          alimento_horarios: '',
          cuidados_especiales: false,
          protocolo_medicamentos: '',
          protocolo_dietas_especiales: '',
          protocolo_cuidado_geriatrico: '',
        });
        setEspecieSeleccion('');
        setEspecieOtro('');
        setRazaOtra('');
      }
      // Cargar catálogo desde Supabase (fallback a listas base)
      cargarCatalogo();
    }
  }, [mascota, isOpen, initialClienteId]);

  // Utilidades para fechas en formato dd/mm/aaaa
  const toISOFromDisplay = (s: string): string | null => {
    const m = s.match(/^([0-3]\d)\/([0-1]\d)\/(\d{4})$/);
    if (!m) return null;
    const dd = m[1];
    const mm = m[2];
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  };

  // Generador de horarios de 7:00 AM a 9:00 PM en intervalos de 30 min
  const generateTimeSlots = (): { label: string; value: string }[] => {
    const slots: { label: string; value: string }[] = [];
    const startMinutes = 7 * 60; // 07:00
    const endMinutes = 21 * 60;  // 21:00
    for (let m = startMinutes; m <= endMinutes; m += 30) {
      const hh = Math.floor(m / 60);
      const mm = m % 60;
      const value = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      const hour12 = ((hh % 12) || 12);
      const ampm = hh < 12 ? 'AM' : 'PM';
      const label = `${hour12}:${String(mm).padStart(2, '0')} ${ampm}`;
      slots.push({ label, value });
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const raw = (formData.alimento_horarios || '').trim();
      const arr = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
      setSelectedHorarios(arr);
    }
  }, [isOpen]);

  // Ajustar selección si se reduce la frecuencia
  useEffect(() => {
    const freq = parseInt(String(formData.alimento_frecuencia || '0'), 10) || 0;
    if (freq > 0 && selectedHorarios.length > freq) {
      const sliced = selectedHorarios.slice(0, freq);
      setSelectedHorarios(sliced);
      setFormData(prev => ({ ...prev, alimento_horarios: sliced.join(',') }));
    }
  }, [formData.alimento_frecuencia]);
  
  const cargarAlimentos = async () => {
    try {
      const { data, error } = await supabaseAdmin.from('alimentos').select('*').order('nombre', { ascending: true });
      if (error) throw error;
      const dbItems = Array.isArray(data) ? data : [];
      // Si hay muy pocos ítems, complementar con el fallback local
      const nombreSet = new Set<string>(dbItems.map((d: any) => (d.nombre || '').trim()));
      const merged = [...dbItems];
      if (merged.length < 5) {
        for (const f of ALIMENTOS_FALLBACK) {
          const nom = (f.nombre || '').trim();
          if (!nombreSet.has(nom)) {
            merged.push(f);
          }
        }
      }
      setAlimentosCatalogo(merged as any);
    } catch {
      // Si falla la carga desde DB, usar fallback
      setAlimentosCatalogo(ALIMENTOS_FALLBACK);
    }
  };
  useEffect(() => {
    if (isOpen) {
      cargarAlimentos();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    const target = e.target as HTMLInputElement;
    if (target.type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      const value = (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (filePath: string) => {
    setFormData(prev => ({ ...prev, url_foto: filePath }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const especieFinal = especieSeleccion === 'Otro' ? (especieOtro || '').trim() : especieSeleccion || formData.especie;
    // Resolver raza final y persistir en lista si es nueva
    let razaFinal = formData.raza;
    const isPerro = especieFinal === 'Perro';
    const isGato = especieFinal === 'Gato';
    if ((isPerro || isGato) && formData.raza === 'Otro' && razaOtra.trim()) {
      razaFinal = razaOtra.trim();
      try {
        // Insertar en catálogo (ignorar error por duplicado)
        await supabaseAdmin.from('catalogo_razas').insert([{ especie: especieFinal, nombre: razaFinal, activo: true }]);
        // Refrescar catálogo en memoria
        if (isPerro) {
          setRazasPerro(prev => mergeUnique(prev, [razaFinal]));
        } else if (isGato) {
          setRazasGato(prev => mergeUnique(prev, [razaFinal]));
        }
      } catch {
        // noop
      }
    }
    // Resolver alimento: si es un ítem de fallback, crear/obtener en DB
    let idAlimentoFinal = formData.id_alimento;
    try {
      if (idAlimentoFinal && idAlimentoFinal.startsWith('fallback-')) {
        const sel = alimentosCatalogo.find(a => a.id === idAlimentoFinal);
        if (sel) {
          const nombre = sel.nombre;
          const tipo = (especieFinal === 'Perro' || especieFinal === 'Gato') ? especieFinal : sel.tipo_mascota || null;
          const { data: existe } = await supabaseAdmin.from('alimentos').select('id').eq('nombre', nombre).limit(1);
          let realId = Array.isArray(existe) && existe.length > 0 ? (existe[0] as any).id : null;
          if (!realId) {
            const { data: insertado, error: insErr } = await supabaseAdmin.from('alimentos').insert([{ nombre, tipo_mascota: tipo }]).select('id').single();
            if (insErr) throw insErr;
            realId = (insertado as any).id;
          }
          idAlimentoFinal = realId || '';
        }
      }
    } catch {
      // Si falla, mantenemos el id original (vacío o inválido) sin bloquear el guardado
    }

    // Sanitizar y mitigar: convertir fechas vacías a null, números vacíos a null; convertir dd/mm/aaaa → ISO; omitir campos de protocolo mientras se refresca el esquema del API
    const sanitize = (obj: any) => {
      const p = { ...obj };
      if (p.fecha_de_nacimiento === '') p.fecha_de_nacimiento = null; else if (typeof p.fecha_de_nacimiento === 'string') { const iso = toISOFromDisplay(p.fecha_de_nacimiento); if (iso) p.fecha_de_nacimiento = iso; }
      if (p.fecha_ultima_vacuna === '') p.fecha_ultima_vacuna = null; else if (typeof p.fecha_ultima_vacuna === 'string') { const iso = toISOFromDisplay(p.fecha_ultima_vacuna); if (iso) p.fecha_ultima_vacuna = iso; }
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
    const payloadFull = { ...formData, especie: especieFinal, raza: razaFinal, id_alimento: idAlimentoFinal } as any;
    const omit = (obj: any, keys: string[]) => { const c = { ...obj }; for (const k of keys) delete c[k]; return c; };
    const payloadSinProtocolo = omit(sanitize(payloadFull), [
      'id_alimento','alimento_cantidad','alimento_frecuencia','alimento_horarios',
      'cuidados_especiales','protocolo_medicamentos','protocolo_dietas_especiales','protocolo_cuidado_geriatrico'
    ]);
    // Enviamos los campos de estado (activo, esterilizado, motivo_inactivo) para que el guardado pueda persistirlos
    // Si el API aún no refleja estas columnas, el componente padre hará fallback automático.
    onSave(payloadSinProtocolo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start sm:items-center overflow-y-auto py-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xl sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{mascota ? 'Editar Mascota' : 'Nueva Mascota'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
              <select
                name="especie"
                value={especieSeleccion}
                onChange={(e) => {
                  const val = e.target.value;
                  setEspecieSeleccion(val);
                  // Sincronizar también con formData para consistencia
                  setFormData(prev => ({ ...prev, especie: val === 'Otro' ? '' : val }));
                  if (val !== 'Otro') setEspecieOtro('');
                }}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar especie</option>
                <option value="Gato">Gato</option>
                <option value="Perro">Perro</option>
                <option value="Otro">Otro</option>
              </select>
              {especieSeleccion === 'Otro' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={especieOtro}
                    onChange={(e) => setEspecieOtro(e.target.value)}
                    placeholder="Especie personalizada"
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}

              <label className="block mt-4 mb-2">Raza</label>
              {especieSeleccion === 'Perro' ? (
                <select
                  name="raza"
                  value={formData.raza}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccione una raza</option>
                  {razasPerro.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              ) : especieSeleccion === 'Gato' ? (
                <>
                  <select
                    name="raza"
                    value={formData.raza}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Seleccione una raza</option>
                    {razasGato.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </>
              ) : (
                <input
                  type="text"
                  name="raza"
                  value={formData.raza}
                  onChange={handleChange}
                  placeholder="Ej. Labrador, Siamés"
                  className="w-full p-2 border rounded"
                />
              )}
              {(formData.raza === 'Otro') && (especieSeleccion === 'Perro' || especieSeleccion === 'Gato') && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={razaOtra}
                    onChange={(e) => setRazaOtra(e.target.value)}
                    placeholder="Escribe la raza"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              )}

              <label className="block mt-4 mb-2">Género</label>
              <select name="genero" value={formData.genero} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>

              {/* Esterilización */}
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="esterilizado"
                    checked={Boolean(formData.esterilizado)}
                    onChange={handleChange}
                  />
                  <span>Esterilizada</span>
                </label>
              </div>

              {/* Estado de ficha (activo/inactivo) */}
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={Boolean(formData.activo)}
                    onChange={handleChange}
                  />
                  <span>Perfil activo</span>
                </label>
                {!formData.activo && (
                  <div className="mt-2">
                    <label className="block mb-1 text-sm text-gray-700">Motivo (cuando está inactivo)</label>
                    <select
                      name="motivo_inactivo"
                      value={formData.motivo_inactivo}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Seleccione motivo</option>
                      <option value="difunto">Difunto</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-2">Foto</label>
              <UploadPhoto bucket="fotos-mascotas" initialUrl={formData.url_foto || undefined} onUpload={handlePhotoUpload} />
              {/* Eliminamos el preview duplicado; UploadPhoto ya muestra la previsualización */}

              <label className="block mt-4 mb-2">Fecha de Nacimiento</label>
              <input type="date" name="fecha_de_nacimiento" value={formData.fecha_de_nacimiento} onChange={handleChange} className="w-full p-2 border rounded"/>

              <label className="block mt-4 mb-2">Peso (kg)</label>
              <input type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} placeholder="Peso en kg" className="w-full p-2 border rounded"/>

              <label className="block mt-4 mb-2">Fecha Última Vacuna</label>
              <input type="date" name="fecha_ultima_vacuna" value={formData.fecha_ultima_vacuna} onChange={handleChange} className="w-full p-2 border rounded"/>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <label className="block mb-2">Historial Médico / Notas</label>
            <textarea name="historial_medico" value={formData.historial_medico} onChange={handleChange} placeholder="Alergias, condiciones, etc." className="w-full p-2 border rounded" rows={4}></textarea>
          </div>

          {/* Bloque: Protocolo de manejo */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Protocolo de manejo</h3>
            {/* Cuidados especiales */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="cuidados_especiales"
                  checked={formData.cuidados_especiales}
                  onChange={handleChange}
                />
                <span className="font-medium">Cuidados especiales</span>
              </label>

              {formData.cuidados_especiales && (
                <div className="grid grid-cols-1 gap-4 mt-3">
                  <div>
                    <label className="block mb-2">Administración de medicamentos</label>
                    <textarea
                      name="protocolo_medicamentos"
                      value={formData.protocolo_medicamentos}
                      onChange={handleChange}
                      placeholder="Detalles de medicamentos, dosis y horarios"
                      className="w-full p-2 border rounded min-h-[90px]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Dietas Especiales</label>
                    <textarea
                      name="protocolo_dietas_especiales"
                      value={formData.protocolo_dietas_especiales}
                      onChange={handleChange}
                      placeholder="Restricciones, recetas o indicaciones específicas"
                      className="w-full p-2 border rounded min-h-[90px]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Cuidado Geriátrico</label>
                    <textarea
                      name="protocolo_cuidado_geriatrico"
                      value={formData.protocolo_cuidado_geriatrico}
                      onChange={handleChange}
                      placeholder="Rutinas, precauciones y necesidades específicas"
                      className="w-full p-2 border rounded min-h-[90px]"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Marca/Alimento preferido</label>
                <select
                  name="id_alimento"
                  value={formData.id_alimento}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Sin especificar</option>
                  {alimentosCatalogo
                    .filter(a => {
                      if (!especieSeleccion || especieSeleccion === '') return true;
                      const hasTipo = a && 'tipo_mascota' in a && a.tipo_mascota;
                      if (!hasTipo) return true;
                      return a.tipo_mascota === especieSeleccion;
                    })
                    .map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">Cantidad (tazas)</label>
                <input
                  type="number"
                  step="0.25"
                  name="alimento_cantidad"
                  value={formData.alimento_cantidad}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Frecuencia (veces al día)</label>
                <input
                  type="number"
                  name="alimento_frecuencia"
                  value={formData.alimento_frecuencia}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2">Horarios de consumo (selecciona según frecuencia)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {timeSlots.map(slot => {
                    const freq = parseInt(String(formData.alimento_frecuencia || '0'), 10) || 0;
                    const isSelected = selectedHorarios.includes(slot.value);
                    const limitReached = freq > 0 && selectedHorarios.length >= freq && !isSelected;
                    return (
                      <label key={slot.value} className={`flex items-center gap-2 p-2 border rounded ${limitReached ? 'opacity-50' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={limitReached}
                          onChange={() => {
                            let next = [...selectedHorarios];
                            if (isSelected) {
                              next = next.filter(v => v !== slot.value);
                            } else {
                              if (limitReached) return; // no permitir superar el límite
                              next.push(slot.value);
                            }
                            setSelectedHorarios(next);
                            setFormData(prev => ({ ...prev, alimento_horarios: next.join(',') }));
                          }}
                        />
                        <span>{slot.label}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">Frecuencia seleccionada: {formData.alimento_frecuencia || 0} veces al día • Selecciones: {selectedHorarios.length}</p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-3 sm:pt-4 mt-4 sm:mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 border-t flex justify-end gap-2 sm:gap-4">
            <button type="button" onClick={onClose} className="px-3 sm:px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
            <button type="submit" className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MascotaModal;