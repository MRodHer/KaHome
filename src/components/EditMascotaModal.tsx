import { useState, useEffect } from 'react';
import { supabaseAdmin, type Mascota } from '../lib/supabase';

const RAZAS_PERRO = [
  "Mestizo",
  "Affenpinscher",
  "Airedale Terrier",
  "Akita",
  "Akita Americano",
  "Alaskan Malamute",
  "American Bully",
  "American Eskimo Dog",
  "American Foxhound",
  "American Pit Bull Terrier",
  "American Staffordshire Terrier",
  "Australian Cattle Dog",
  "Australian Shepherd",
  "Basenji",
  "Basset Hound",
  "Beagle",
  "Bedlington Terrier",
  "Bernese Mountain Dog",
  "Bichon Frise",
  "Black and Tan Coonhound",
  "Bloodhound",
  "Border Collie",
  "Border Terrier",
  "Borzoi",
  "Boston Terrier",
  "Boxer",
  "Boykin Spaniel",
  "Braco Alemán de Pelo Corto",
  "Braco Húngaro (Vizsla)",
  "Brittany",
  "Bull Terrier",
  "Bulldog",
  "Bulldog Francés",
  "Bullmastiff",
  "Cairn Terrier",
  "Canaan Dog",
  "Cane Corso",
  "Cardigan Welsh Corgi",
  "Cavalier King Charles Spaniel",
  "Chesapeake Bay Retriever",
  "Chihuahua",
  "Chinese Crested",
  "Chinese Shar-Pei",
  "Chow Chow",
  "Cocker Spaniel",
  "Collie",
  "Cotton de Tulear",
  "Dachshund",
  "Dalmatian",
  "Doberman Pinscher",
  "Dogo de Burdeos",
  "English Cocker Spaniel",
  "English Setter",
  "English Springer Spaniel",
  "Eurasier",
  "Field Spaniel",
  "Finnish Lapphund",
  "Fox Terrier",
  "Galgo",
  "German Shorthaired Pointer",
  "Giant Schnauzer",
  "Glen of Imaal Terrier",
  "Golden Retriever",
  "Goldendoodle",
  "Gordon Setter",
  "Great Dane",
  "Great Pyrenees",
  "Greater Swiss Mountain Dog",
  "Greyhound",
  "Havanese",
  "Irish Setter",
  "Irish Terrier",
  "Irish Wolfhound",
  "Italian Greyhound",
  "Jack Russell Terrier",
  "Japanese Chin",
  "Keeshond",
  "Kerry Blue Terrier",
  "Komondor",
  "Kuvasz",
  "Labradoodle",
  "Labrador Retriever",
  "Lakeland Terrier",
  "Leonberger",
  "Lhasa Apso",
  "Lowchen",
  "Maltese",
  "Manchester Terrier",
  "Mastiff",
  "Miniature Bull Terrier",
  "Miniature Pinscher",
  "Miniature Schnauzer",
  "Newfoundland",
  "Norfolk Terrier",
  "Norwegian Elkhound",
  "Norwich Terrier",
  "Nova Scotia Duck Tolling Retriever",
  "Old English Sheepdog",
  "Papillon",
  "Parson Russell Terrier",
  "Pekingese",
  "Pembroke Welsh Corgi",
  "Petit Basset Griffon Vendéen",
  "Pharaoh Hound",
  "Pointer",
  "Pomeranian",
  "Poodle (Miniature)",
  "Poodle (Standard)",
  "Poodle (Toy)",
  "Portuguese Water Dog",
  "Pug",
  "Rat Terrier",
  "Rhodesian Ridgeback",
  "Rottweiler",
  "Russell Terrier",
  "Saint Bernard",
  "Saluki",
  "Samoyed",
  "Schipperke",
  "Schnauzer",
  "Scottish Deerhound",
  "Scottish Terrier",
  "Sealyham Terrier",
  "Shetland Sheepdog",
  "Shiba Inu",
  "Shih Tzu",
  "Siberian Husky",
  "Silky Terrier",
  "Skye Terrier",
  "Smooth Fox Terrier",
  "Soft Coated Wheaten Terrier",
  "Stabyhoun",
  "Staffordshire Bull Terrier",
  "Standard Schnauzer",
  "Sussex Spaniel",
  "Swedish Vallhund",
  "Tibetan Mastiff",
  "Tibetan Spaniel",
  "Tibetan Terrier",
  "Toy Fox Terrier",
  "Treeing Walker Coonhound",
  "Vizsla",
  "Weimaraner",
  "Welsh Springer Spaniel",
  "Welsh Terrier",
  "West Highland White Terrier",
  "Whippet",
  "Wire Fox Terrier",
  "Wirehaired Pointing Griffon",
  "Xoloitzcuintli",
  "Yorkshire Terrier",
  "Otro"
];
const RAZAS_GATO = [
  "Mestizo","Siamés","Persa","Maine Coon","Ragdoll","Bengala","Sphynx","Abisinio","Birmano","Oriental de pelo corto","Siberiano","British Shorthair","Scottish Fold","Bombay","Himalayo","Azul Ruso","Chartreux","Cornish Rex","Devon Rex","Somalí","Manx","American Shorthair","American Curl","European Shorthair","Noruego de Bosque","Selkirk Rex","Savannah","Pixie-bob","Ocicat","Tonkinés","Angora Turco","Van Turco","Peterbald","Nebelung","LaPerm","Serengeti","Exótico de pelo corto","Otro"
];

export function EditMascotaModal({ mascota, onClose, onSuccess }: { mascota: Mascota; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    nombre: mascota.nombre,
    especie: mascota.especie,
    raza: mascota.raza || '',
    edad: mascota.edad || '',
    peso: mascota.peso || '',
    fecha_ultima_vacuna: mascota.fecha_ultima_vacuna || '',
    fecha_de_nacimiento: mascota.fecha_de_nacimiento || '',
    url_foto: mascota.url_foto || '',
    // Protocolo de manejo
    id_alimento: (mascota as any).id_alimento || '',
    alimento_cantidad: (mascota as any).alimento_cantidad || '',
    alimento_frecuencia: (mascota as any).alimento_frecuencia || '',
    alimento_horarios: (mascota as any).alimento_horarios || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [especieSeleccion, setEspecieSeleccion] = useState<string>(() => {
    const esp = mascota.especie || '';
    return esp === 'Perro' || esp === 'Gato' ? esp : esp ? 'Otro' : '';
  });
  const [especieOtro, setEspecieOtro] = useState<string>(() => {
    const esp = mascota.especie || '';
    return esp === 'Perro' || esp === 'Gato' ? '' : esp;
  });
  const [razasPerro, setRazasPerro] = useState<string[]>(RAZAS_PERRO);
  const [razasGato, setRazasGato] = useState<string[]>(RAZAS_GATO);
  const [razaOtra, setRazaOtra] = useState<string>('');
  const [alimentosCatalogo, setAlimentosCatalogo] = useState<{ id: string; nombre: string; tipo_mascota?: string | null }[]>([]);

  const mergeUnique = (base: string[], extra: string[]) => {
    const set = new Set(base);
    extra.forEach(e => { if (e && !set.has(e)) set.add(e); });
    return Array.from(set);
  };

  useEffect(() => {
    // Cargar catálogo de razas desde Supabase al abrir
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
        setRazasPerro(RAZAS_PERRO);
        setRazasGato(RAZAS_GATO);
      }
    };
    cargarCatalogo();
  }, []);

  // Fallback local de alimentos por especie en caso de catálogo vacío o incompleto
  const ALIMENTOS_FALLBACK: { id: string; nombre: string; tipo_mascota?: string | null }[] = [
    { id: 'fallback-perro-pro-plan', nombre: 'Purina Pro Plan', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-dog-chow', nombre: 'Purina Dog Chow', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-royal-canin', nombre: 'Royal Canin', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-hills', nombre: 'Hill\'s Science Diet', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-eukanuba', nombre: 'Eukanuba', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-nupec', nombre: 'Nupec', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-pedigree', nombre: 'Pedigree', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-orijen', nombre: 'Orijen', tipo_mascota: 'Perro' },
    { id: 'fallback-perro-acana', nombre: 'Acana', tipo_mascota: 'Perro' },
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

  useEffect(() => {
    const cargarAlimentos = async () => {
      try {
        const { data, error } = await supabaseAdmin.from('alimentos').select('*').order('nombre', { ascending: true });
        if (error) throw error;
        const dbItems = Array.isArray(data) ? data : [];
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
        setAlimentosCatalogo(ALIMENTOS_FALLBACK);
      }
    };
    cargarAlimentos();
  }, []);

  useEffect(() => {
    if (formData.fecha_de_nacimiento) {
      const birthDate = new Date(formData.fecha_de_nacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, edad: age.toString() }));
    }
  }, [formData.fecha_de_nacimiento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let fotoUrl = mascota.url_foto;

      if (fotoFile) {
        const fileExt = fotoFile.name.split('.').pop();
        const fileName = `${mascota.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from('fotos-mascotas')
          .upload(fileName, fotoFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabaseAdmin.storage.from('fotos-mascotas').getPublicUrl(fileName);
        fotoUrl = urlData.publicUrl;
      }
      const especieFinal = especieSeleccion === 'Otro' ? (especieOtro || '').trim() : especieSeleccion || formData.especie;
      let razaFinal = formData.raza;
      const isPerro = especieFinal === 'Perro';
      const isGato = especieFinal === 'Gato';
      if ((isPerro || isGato) && formData.raza === 'Otro' && razaOtra.trim()) {
        razaFinal = razaOtra.trim();
        try {
          await supabaseAdmin.from('catalogo_razas').insert([{ especie: especieFinal, nombre: razaFinal, activo: true }]);
          if (isPerro) {
            setRazasPerro(prev => mergeUnique(prev, [razaFinal]));
          } else if (isGato) {
            setRazasGato(prev => mergeUnique(prev, [razaFinal]));
          }
        } catch {
          // ignorar duplicados
        }
      }
      // Resolver alimento: si el usuario eligió un fallback, crear/obtener en DB
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
        // continuar aunque falle la creación del alimento
      }

      const { error } = await supabaseAdmin
        .from('mascotas')
        .update({ ...formData, especie: especieFinal, raza: razaFinal, url_foto: fotoUrl, id_alimento: idAlimentoFinal })
        .eq('id', mascota.id);

      if (error) {
        throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating pet:', error);
      alert('Ocurrió un error al actualizar la mascota.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Editar Mascota</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especie*</label>
            <select
              value={especieSeleccion}
              onChange={(e) => {
                const val = e.target.value;
                setEspecieSeleccion(val);
                if (val !== 'Otro') setEspecieOtro('');
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar especie</option>
              <option value="Gato">Gato</option>
              <option value="Perro">Perro</option>
              <option value="Otro">Otro</option>
            </select>
            {especieSeleccion === 'Otro' && (
              <input
                type="text"
                value={especieOtro}
                onChange={(e) => setEspecieOtro(e.target.value)}
                placeholder="Especie personalizada"
                required
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
            {especieSeleccion === 'Perro' ? (
              <select
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una raza</option>
                {razasPerro.map(raza => (
                  <option key={raza} value={raza}>{raza}</option>
                ))}
              </select>
            ) : especieSeleccion === 'Gato' ? (
              <select
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una raza</option>
                {razasGato.map(raza => (
                  <option key={raza} value={raza}>{raza}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
                placeholder="Raza"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
            {(formData.raza === 'Otro') && (especieSeleccion === 'Perro' || especieSeleccion === 'Gato') && (
              <input
                type="text"
                value={razaOtra}
                onChange={(e) => setRazaOtra(e.target.value)}
                placeholder="Escribe la raza"
                required
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
            <input
              type="number"
              value={formData.edad}
              onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
            <input
              type="date"
              value={formData.fecha_de_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_de_nacimiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.peso}
              onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Última Vacuna</label>
            <input
              type="date"
              value={formData.fecha_ultima_vacuna}
              onChange={(e) => setFormData({ ...formData, fecha_ultima_vacuna: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Bloque: Protocolo de manejo */}
          <div className="md:col-span-2 mt-2">
            <h3 className="text-md font-semibold text-gray-900 mb-2">Protocolo de manejo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca/Alimento preferido</label>
                <select
                  value={formData.id_alimento}
                  onChange={(e) => setFormData({ ...formData, id_alimento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (tazas)</label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.alimento_cantidad}
                  onChange={(e) => setFormData({ ...formData, alimento_cantidad: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia (veces al día)</label>
                <input
                  type="number"
                  value={formData.alimento_frecuencia}
                  onChange={(e) => setFormData({ ...formData, alimento_frecuencia: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Horarios</label>
                <input
                  type="text"
                  value={formData.alimento_horarios}
                  onChange={(e) => setFormData({ ...formData, alimento_horarios: e.target.value })}
                  placeholder="Ej. 8:00 y 19:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoFile(e.target.files ? e.target.files[0] : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {formData.url_foto && !fotoFile && (
              <img src={formData.url_foto} alt="Foto actual" className="mt-2 w-20 h-20 object-cover rounded-lg" />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}