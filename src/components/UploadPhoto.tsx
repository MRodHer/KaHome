import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

interface UploadPhotoProps {
  bucket: string;
  onUpload: (url: string) => void;
  initialUrl?: string | null;
}

export function UploadPhoto({ bucket, onUpload, initialUrl }: UploadPhotoProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);

  useEffect(() => {
    if (initialUrl) {
      setPreviewUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;
      setPreviewUrl(publicUrl);
      onUpload(publicUrl);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la foto.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    onUpload('');
  };

  return (
    <div className="w-full">
      {previewUrl ? (
        <div className="relative w-32 h-32 mx-auto">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
          <button 
            type="button"
            onClick={removePhoto} 
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center text-gray-500 hover:text-blue-600">
            <Plus size={32} />
            <span>Subir Foto</span>
          </label>
          <input 
            id="photo-upload" 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            accept="image/*" 
            disabled={uploading}
          />
        </div>
      )}
      {uploading && <p className="text-center text-sm text-gray-500 mt-2">Subiendo...</p>}
    </div>
  );
}