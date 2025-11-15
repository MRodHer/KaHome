import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
// Nota: Asumo que estos componentes UI están en @/components/ui
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// ... etc.
// Usaré stubs simples si no están disponibles
const Button = ({ children, ...props }: any) => <button {...props}>{children}</button>;
const Input = (props: any) => <input {...props} />;
const Label = (props: any) => <label {...props} />;
const Select = ({ children, ...props }: any) => <select {...props}>{children}</select>;
const SelectContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const SelectItem = ({ children, ...props }: any) => <option {...props}>{children}</option>;
const SelectTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const SelectValue = (props: any) => <span {...props} />;
const Textarea = (props: any) => <textarea {...props} />;
const Dialog = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const DialogContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const DialogHeader = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const DialogTitle = ({ children, ...props }: any) => <h2 {...props}>{children}</h2>;
const DialogFooter = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const Table = ({ children, ...props }: any) => <table {...props}>{children}</table>;
const TableBody = ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>;
const TableCell = ({ children, ...props }: any) => <td {...props}>{children}</td>;
const TableHead = ({ children, ...props }: any) => <th {...props}>{children}</th>;
const TableHeader = ({ children, ...props }: any) => <thead {...props}>{children}</thead>;
const TableRow = ({ children, ...props }: any) => <tr {...props}>{children}</tr>;

import { Search, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
// Asumo que estos modales están importados desde tus archivos
// import { NewClienteModal } from '@/components/modals/ClienteModal'; 
// import { EditClienteModal } from '@/components/modals/ClienteModal';
// ... etc. Por ahora, los defino aquí.

const RAZAS_PERRO = ["Labrador Retriever", "Bulldog Francés", "Golden Retriever", "Pastor Alemán", "Poodle", "Beagle", "Rottweiler", "Yorkshire Terrier", "Boxer", "Dachshund", "Otro"];
const RAZAS_GATO = ["Siamés", "Persa", "Maine Coon", "Ragdoll", "Bengala", "Sphynx", "Abisinio", "Birmano", "Oriental de pelo corto", "Siberiano", "Otro"];

// NOTA: Asumo que los tipos generados están disponibles como en el paso de `supabase.ts`
// Si no, reemplaza esto con tus tipos manuales
type Cliente = any; 
type Mascota = any;
type Ubicacion = any;

const ClientesMascotas = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClienteModalOpen, setNewClienteModalOpen] = useState(false);
  const [isEditClienteModalOpen, setEditClienteModalOpen] = useState(false);
  const [isNewMascotaModalOpen, setNewMascotaModalOpen] = useState(false);
  const [isEditMascotaModalOpen, setEditMascotaModalOpen] = useState(false);
  const [isViewMascotaModalOpen, setViewMascotaModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);

  useEffect(() => {
    fetchClientes();
    fetchMascotas();
    fetchUbicaciones();
  }, []);

  const fetchClientes = async () => {
    // TODO: Asumo que 'apellido' existe en tu tabla final
    const { data, error } = await supabase.from('clientes').select('*');
    if (error) console.error('Error fetching clientes:', error);
    else setClientes(data || []);
  };

  const fetchMascotas = async () => {
    // TODO: Asumo que 'apellido' existe en la tabla 'clientes'
    const { data, error } = await supabase.from('mascotas').select('*, clientes(id, nombre, apellido)');
    if (error) console.error('Error fetching mascotas:', error);
    else setMascotas(data || []);
  };

  const fetchUbicaciones = async () => {
    const { data, error } = await supabase.from('ubicaciones').select('*');
    if (error) console.error('Error fetching ubicaciones:', error);
    else setUbicaciones(data || []);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Asumo que 'apellido' existe
  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.apellido && cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNewClienteModal = () => setNewClienteModalOpen(true);
  const closeNewClienteModal = () => setNewClienteModalOpen(false);

  const openEditClienteModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setEditClienteModalOpen(true);
  };
  const closeEditClienteModal = () => {
    setSelectedCliente(null);
    setEditClienteModalOpen(false);
  };

  const openNewMascotaModal = () => setNewMascotaModalOpen(true);
  const closeNewMascotaModal = () => setNewMascotaModalOpen(false);

  const openEditMascotaModal = (mascota: Mascota) => {
    setSelectedMascota(mascota);
    setEditMascotaModalOpen(true);
  };
  const closeEditMascotaModal = () => {
    setSelectedMascota(null);
    setEditMascotaModalOpen(false);
  };

  const openViewMascotaModal = (mascota: Mascota) => {
    setSelectedMascota(mascota);
    setViewMascotaModalOpen(true);
  };
  const closeViewMascotaModal = () => {
    setSelectedMascota(null);
    setViewMascotaModalOpen(false);
  };

  // --- CORRECCIÓN AQUÍ ---
  const handleDeleteCliente = async (clienteId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente? Todas sus mascotas y reservas asociadas también se eliminarán.')) {
      
      // No es necesario borrar las mascotas primero.
      // La base de datos lo hará automáticamente gracias a "ON DELETE CASCADE".

      const { error: deleteClienteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId);

      if (deleteClienteError) {
        console.error('Error deleting cliente:', deleteClienteError);
        // TODO: Mostrar notificación de error al usuario
      } else {
        // TODO: Mostrar notificación de éxito
        fetchClientes();
        fetchMascotas(); // Refrescar mascotas también, ya que se habrán borrado
      }
    }
  };

  const handleDeleteMascota = async (mascotaId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      const { error } = await supabase.from('mascotas').delete().eq('id', mascotaId);
      if (error) {
        console.error('Error deleting mascota:', error);
      } else {
        fetchMascotas();
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes y Mascotas</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <div>
          <Button onClick={openNewClienteModal} className="mr-2">
            <PlusCircle className="mr-2" size={20} />
            Nuevo Cliente
          </Button>
          <Button onClick={openNewMascotaModal}>
            <PlusCircle className="mr-2" size={20} />
            Nueva Mascota
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Clientes</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente: Cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.nombre} {cliente.apellido}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEditClienteModal(cliente)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCliente(cliente.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Mascotas</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dueño</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mascotas.map((mascota: Mascota) => (
                  <TableRow key={mascota.id}>
                    <TableCell>{mascota.nombre}</TableCell>
                    <TableCell>{mascota.clientes?.nombre} {mascota.clientes?.apellido}</TableCell>
                    <TableCell>{mascota.especie}</TableCell>
                    <TableCell>{mascota.raza}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openViewMascotaModal(mascota)}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditMascotaModal(mascota)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMascota(mascota.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {isNewClienteModalOpen && (
        <NewClienteModal
          onClose={closeNewClienteModal}
          onSuccess={() => {
            fetchClientes();
            closeNewClienteModal();
          }}
          ubicaciones={ubicaciones}
        />
      )}

      {isEditClienteModalOpen && selectedCliente && (
        <EditClienteModal
          cliente={selectedCliente}
          onClose={closeEditClienteModal}
          onSuccess={() => {
            fetchClientes();
            closeEditClienteModal();
          }}
          ubicaciones={ubicaciones}
        />
      )}

      {isNewMascotaModalOpen && (
        <NewMascotaModal
          clientes={clientes}
          onClose={closeNewMascotaModal}
          onSuccess={() => {
            fetchMascotas();
            closeNewMascotaModal();
          }}
        />
      )}

      {isEditMascotaModalOpen && selectedMascota && (
        <EditMascotaModal
          mascota={selectedMascota}
          clientes={clientes}
          onClose={closeEditMascotaModal}
          onSuccess={() => {
            fetchMascotas();
            closeEditMascotaModal();
          }}
        />
      )}

      {isViewMascotaModalOpen && selectedMascota && (
        <ViewMascotaModal
          mascota={selectedMascota}
          onClose={closeViewMascotaModal}
        />
      )}
    </div>
  );
};

// --- MODALES (Definidos aquí por completitud, deberías moverlos a sus propios archivos) ---

const ViewMascotaModal = ({ mascota, onClose }: { mascota: Mascota, onClose: () => void }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Perfil de {mascota.nombre}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <img src={mascota.foto_url || ' `https://via.placeholder.com/150` '} alt={mascota.nombre} className="rounded-lg w-full" />
          </div>
          <div className="col-span-2 grid gap-4 py-4">
            {/* ... (resto de los campos de vista) ... */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueño" className="text-right">Dueño</Label>
              <p id="dueño" className="col-span-3">{mascota.clientes?.nombre} {mascota.clientes?.apellido}</p>
            </div>
             {/* ... (más campos) ... */}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditClienteModal = ({ cliente, ubicaciones, onClose, onSuccess }: { cliente: Cliente, ubicaciones: Ubicacion[], onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    id_ubicacion: cliente.id_ubicacion, // Corregido de 'ubicacion_id'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('clientes')
      .update(formData)
      .eq('id', cliente.id);

    if (error) {
      console.error('Error updating cliente:', error);
    } else {
      onSuccess();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        {/* ... (Formulario de Edición de Cliente) ... */}
      </DialogContent>
    </Dialog>
  );
};

const NewClienteModal = ({ onClose, onSuccess, ubicaciones }: { onClose: () => void, onSuccess: () => void, ubicaciones: Ubicacion[] }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    id_ubicacion: '', // Corregido de 'ubicacion_id'
  });
  
  // ... (handlers) ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('clientes').insert([formData]);
    if (error) {
      console.error('Error creating new cliente:', error);
    } else {
      onSuccess();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      {/* ... (Formulario de Nuevo Cliente) ... */}
    </Dialog>
  );
};

const NewMascotaModal = ({ clientes, onClose, onSuccess }: { clientes: Cliente[], onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    id_cliente: '', // Corregido de 'cliente_id'
    nombre: '',
    especie: 'Perro',
    raza: '',
    fecha_nacimiento: '', // Asumo que este campo existe
    edad_años: 0, // Asumo que este campo existe
    edad_meses: 0, // Asumo que este campo existe
    genero: 'Macho',
    peso_kg: 0, // Asumo que este campo existe
    fecha_ultima_vacuna: '',
    historial_medico: '',
    foto_url: '', // Corregido de 'foto_url'
  });
  const [razas, setRazas] = useState(RAZAS_PERRO);
  const [file, setFile] = useState<File | null>(null);

  // ... (dropzone, handlers) ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fotoUrl = '';
    if (file) {
      const fileName = `${uuidv4()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('fotos-mascotas') // Asegúrate que este bucket exista y tenga permisos
        .upload(fileName, file);
      
      if (error) {
        console.error('Error uploading file:', error);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('fotos-mascotas')
        .getPublicUrl(fileName);
      fotoUrl = publicUrl;
    }

    // Asegúrate que los nombres de campo coincidan 100% con tu BD
    const finalFormData = { ...formData, foto_url: fotoUrl }; 
    
    // Quita los campos que no existan en la BD
    // delete finalFormData.edad_años; 
    // delete finalFormData.edad_meses;
    
    const { error } = await supabase.from('mascotas').insert([finalFormData]);
    if (error) {
      console.error('Error creating new mascota:', error);
    } else {
      onSuccess();
    }
  };

  return (
     <Dialog open={true} onOpenChange={onClose}>
      {/* ... (Formulario de Nueva Mascota) ... */}
    </Dialog>
  );
};

export default ClientesMascotas;
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';

const RAZAS_PERRO = ["Labrador Retriever", "Bulldog Francés", "Golden Retriever", "Pastor Alemán", "Poodle", "Beagle", "Rottweiler", "Yorkshire Terrier", "Boxer", "Dachshund", "Otro"];
const RAZAS_GATO = ["Siamés", "Persa", "Maine Coon", "Ragdoll", "Bengala", "Sphynx", "Abisinio", "Birmano", "Oriental de pelo corto", "Siberiano", "Otro"];

const ClientesMascotas = () => {
  const [clientes, setClientes] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClienteModalOpen, setNewClienteModalOpen] = useState(false);
  const [isEditClienteModalOpen, setEditClienteModalOpen] = useState(false);
  const [isNewMascotaModalOpen, setNewMascotaModalOpen] = useState(false);
  const [isEditMascotaModalOpen, setEditMascotaModalOpen] = useState(false);
  const [isViewMascotaModalOpen, setViewMascotaModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedMascota, setSelectedMascota] = useState(null);

  useEffect(() => {
    fetchClientes();
    fetchMascotas();
    fetchUbicaciones();
  }, []);

  const fetchClientes = async () => {
    const { data, error } = await supabase.from('clientes').select('*');
    if (error) console.error('Error fetching clientes:', error);
    else setClientes(data);
  };

  const fetchMascotas = async () => {
    const { data, error } = await supabase.from('mascotas').select('*, clientes(*)');
    if (error) console.error('Error fetching mascotas:', error);
    else setMascotas(data);
  };

  const fetchUbicaciones = async () => {
    const { data, error } = await supabase.from('ubicaciones').select('*');
    if (error) console.error('Error fetching ubicaciones:', error);
    else setUbicaciones(data);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNewClienteModal = () => setNewClienteModalOpen(true);
  const closeNewClienteModal = () => setNewClienteModalOpen(false);

  const openEditClienteModal = (cliente) => {
    setSelectedCliente(cliente);
    setEditClienteModalOpen(true);
  };
  const closeEditClienteModal = () => {
    setSelectedCliente(null);
    setEditClienteModalOpen(false);
  };

  const openNewMascotaModal = () => setNewMascotaModalOpen(true);
  const closeNewMascotaModal = () => setNewMascotaModalOpen(false);

  const openEditMascotaModal = (mascota) => {
    setSelectedMascota(mascota);
    setEditMascotaModalOpen(true);
  };
  const closeEditMascotaModal = () => {
    setSelectedMascota(null);
    setEditMascotaModalOpen(false);
  };

  const openViewMascotaModal = (mascota) => {
    setSelectedMascota(mascota);
    setViewMascotaModalOpen(true);
  };
  const closeViewMascotaModal = () => {
    setSelectedMascota(null);
    setViewMascotaModalOpen(false);
  };

  const handleDeleteCliente = async (clienteId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente y todas sus mascotas?')) {
      // First, delete mascotas associated with the cliente
      const { error: deleteMascotasError } = await supabase
        .from('mascotas')
        .delete()
        .eq('cliente_id', clienteId);

      if (deleteMascotasError) {
        console.error('Error deleting mascotas:', deleteMascotasError);
        return;
      }

      // Then, delete the cliente
      const { error: deleteClienteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId);

      if (deleteClienteError) {
        console.error('Error deleting cliente:', deleteClienteError);
      } else {
        fetchClientes();
        fetchMascotas();
      }
    }
  };

  const handleDeleteMascota = async (mascotaId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      const { error } = await supabase.from('mascotas').delete().eq('id', mascotaId);
      if (error) {
        console.error('Error deleting mascota:', error);
      } else {
        fetchMascotas();
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes y Mascotas</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <div>
          <Button onClick={openNewClienteModal} className="mr-2">
            <PlusCircle className="mr-2" size={20} />
            Nuevo Cliente
          </Button>
          <Button onClick={openNewMascotaModal}>
            <PlusCircle className="mr-2" size={20} />
            Nueva Mascota
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Clientes</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map(cliente => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.nombre} {cliente.apellido}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEditClienteModal(cliente)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCliente(cliente.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Mascotas</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dueño</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mascotas.map(mascota => (
                  <TableRow key={mascota.id}>
                    <TableCell>{mascota.nombre}</TableCell>
                    <TableCell>{mascota.clientes?.nombre} {mascota.clientes?.apellido}</TableCell>
                    <TableCell>{mascota.especie}</TableCell>
                    <TableCell>{mascota.raza}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openViewMascotaModal(mascota)}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditMascotaModal(mascota)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMascota(mascota.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {isNewClienteModalOpen && (
        <NewClienteModal
          onClose={closeNewClienteModal}
          onSuccess={() => {
            fetchClientes();
            closeNewClienteModal();
          }}
          ubicaciones={ubicaciones}
        />
      )}

      {isEditClienteModalOpen && selectedCliente && (
        <EditClienteModal
          cliente={selectedCliente}
          onClose={closeEditClienteModal}
          onSuccess={() => {
            fetchClientes();
            closeEditClienteModal();
          }}
          ubicaciones={ubicaciones}
        />
      )}

      {isNewMascotaModalOpen && (
        <NewMascotaModal
          clientes={clientes}
          onClose={closeNewMascotaModal}
          onSuccess={() => {
            fetchMascotas();
            closeNewMascotaModal();
          }}
        />
      )}

      {isEditMascotaModalOpen && selectedMascota && (
        <EditMascotaModal
          mascota={selectedMascota}
          clientes={clientes}
          onClose={closeEditMascotaModal}
          onSuccess={() => {
            fetchMascotas();
            closeEditMascotaModal();
          }}
        />
      )}

      {isViewMascotaModalOpen && selectedMascota && (
        <ViewMascotaModal
          mascota={selectedMascota}
          onClose={closeViewMascotaModal}
        />
      )}
    </div>
  );
};

const ViewMascotaModal = ({ mascota, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Perfil de {mascota.nombre}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <img src={mascota.foto_url || 'https://via.placeholder.com/150'} alt={mascota.nombre} className="rounded-lg w-full" />
          </div>
          <div className="col-span-2 grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <p id="nombre" className="col-span-3">{mascota.nombre}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueño" className="text-right">Dueño</Label>
              <p id="dueño" className="col-span-3">{mascota.clientes?.nombre} {mascota.clientes?.apellido}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="especie" className="text-right">Especie</Label>
              <p id="especie" className="col-span-3">{mascota.especie}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="raza" className="text-right">Raza</Label>
              <p id="raza" className="col-span-3">{mascota.raza}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edad" className="text-right">Edad</Label>
              <p id="edad" className="col-span-3">{mascota.edad_años} años, {mascota.edad_meses} meses</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genero" className="text-right">Género</Label>
              <p id="genero" className="col-span-3">{mascota.genero}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="peso" className="text-right">Peso</Label>
              <p id="peso" className="col-span-3">{mascota.peso_kg} kg</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vacuna" className="text-right">Última Vacuna</Label>
              <p id="vacuna" className="col-span-3">{mascota.fecha_ultima_vacuna}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="historial" className="text-right">Historial Médico</Label>
              <p id="historial" className="col-span-3">{mascota.historial_medico}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditClienteModal = ({ cliente, ubicaciones, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    ubicacion_id: cliente.ubicacion_id,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('clientes')
      .update(formData)
      .eq('id', cliente.id);

    if (error) {
      console.error('Error updating cliente:', error);
    } else {
      onSuccess();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apellido" className="text-right">Apellido</Label>
              <Input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefono" className="text-right">Teléfono</Label>
              <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direccion" className="text-right">Dirección</Label>
              <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ubicacion_id" className="text-right">Ubicación</Label>
              <Select name="ubicacion_id" value={formData.ubicacion_id} onValueChange={(value) => handleSelectChange('ubicacion_id', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona una ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {ubicaciones.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const NewClienteModal = ({ onClose, onSuccess, ubicaciones }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    ubicacion_id: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('clientes').insert([formData]);
    if (error) {
      console.error('Error creating new cliente:', error);
    } else {
      onSuccess();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apellido" className="text-right">Apellido</Label>
              <Input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefono" className="text-right">Teléfono</Label>
              <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direccion" className="text-right">Dirección</Label>
              <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ubicacion_id" className="text-right">Ubicación</Label>
              <Select name="ubicacion_id" onValueChange={(value) => handleSelectChange('ubicacion_id', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona una ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {ubicaciones.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Crear Cliente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const NewMascotaModal = ({ clientes, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    cliente_id: '',
    nombre: '',
    especie: 'Perro',
    raza: '',
    fecha_nacimiento: '',
    edad_años: 0,
    edad_meses: 0,
    genero: 'Macho',
    peso_kg: 0,
    fecha_ultima_vacuna: '',
    historial_medico: '',
    foto_url: '',
  });
  const [razas, setRazas] = useState(RAZAS_PERRO);
  const [file, setFile] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'especie') {
      setRazas(value === 'Perro' ? RAZAS_PERRO : RAZAS_GATO);
      setFormData(prev => ({ ...prev, raza: '' }));
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'fecha_nacimiento') {
      const birthDate = new Date(value);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      setFormData(prev => ({ ...prev, edad_años: years, edad_meses: months }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let fotoUrl = '';
    if (file) {
      const fileName = `${uuidv4()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('fotos-mascotas')
        .upload(fileName, file);
      
      if (error) {
        console.error('Error uploading file:', error);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('fotos-mascotas')
        .getPublicUrl(fileName);
      fotoUrl = publicUrl;
    }

    const finalFormData = { ...formData, foto_url: fotoUrl };
    const { error } = await supabase.from('mascotas').insert([finalFormData]);
    if (error) {
      console.error('Error creating new mascota:', error);
    } else {
      onSuccess();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Mascota</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cliente_id" className="text-right">Dueño</Label>
              <Select name="cliente_id" onValueChange={(value) => handleSelectChange('cliente_id', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un dueño" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="especie" className="text-right">Especie</Label>
              <Select name="especie" value={formData.especie} onValueChange={(value) => handleSelectChange('especie', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Perro">Perro</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="raza" className="text-right">Raza</Label>
              <Select name="raza" value={formData.raza} onValueChange={(value) => handleSelectChange('raza', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona una raza" />
                </SelectTrigger>
                <SelectContent>
                  {razas.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha_nacimiento" className="text-right">Fecha de Nacimiento</Label>
              <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleDateChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edad" className="text-right">Edad</Label>
              <p className="col-span-3">{formData.edad_años} años, {formData.edad_meses} meses</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genero" className="text-right">Género</Label>
              <Select name="genero" value={formData.genero} onValueChange={(value) => handleSelectChange('genero', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Macho">Macho</SelectItem>
                  <SelectItem value="Hembra">Hembra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="peso_kg" className="text-right">Peso (kg)</Label>
              <Input id="peso_kg" name="peso_kg" type="number" value={formData.peso_kg} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha_ultima_vacuna" className="text-right">Última Vacuna</Label>
              <Input id="fecha_ultima_vacuna" name="fecha_ultima_vacuna" type="date" value={formData.fecha_ultima_vacuna} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="historial_medico" className="text-right">Historial Médico</Label>
              <Textarea id="historial_medico" name="historial_medico" value={formData.historial_medico} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Foto</Label>
              <div {...getRootProps()} className="col-span-3 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer">
                <input {...getInputProps()} />
                {isDragActive ? <p>Suelta la foto aquí...</p> : <p>Arrastra y suelta una foto, o haz clic para seleccionarla</p>}
                {file && <p className="mt-2 text-sm text-gray-500">{file.name}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Crear Mascota</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientesMascotas;
*/