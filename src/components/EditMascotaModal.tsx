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
  });
  const [submitting, setSubmitting] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

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
      const { error } = await supabaseAdmin
        .from('mascotas')
        .update({ ...formData, url_foto: fotoUrl })
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
            <input
              type="text"
              required
              value={formData.especie}
              onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <select
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una raza</option>
                {RAZAS_PERRO.map(raza => (
                  <option key={raza} value={raza}>{raza}</option>
                ))}
              </select>
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