import { useEffect, useState } from 'react'; 
import { supabase, type TransaccionFinanciera, type Ubicacion } from '../lib/supabase'; 
import { DollarSign, TrendingUp, TrendingDown, Plus, Edit, Trash2 } from 'lucide-react'; 

export function Finanzas() { 
   const [transacciones, setTransacciones] = useState<TransaccionFinanciera[]>([]); 
   const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]); 
   const [loading, setLoading] = useState(true); 
   const [filtroTipo, setFiltroTipo] = useState<string>('Todos'); 
   const [showNewTransaccion, setShowNewTransaccion] = useState(false); 
   const [editingTransaccion, setEditingTransaccion] = useState<TransaccionFinanciera | null>(null);
 
   useEffect(() => { 
     loadData(); 
   }, []); 
 
   async function loadData() { 
     try { 
       const [transaccionesRes, ubicacionesRes] = await Promise.all([ 
         supabase.from('transacciones_financieras').select('*').order('fecha', { ascending: false }), 
         supabase.from('ubicaciones').select('*'), 
       ]); 
 
       if (transaccionesRes.error) throw transaccionesRes.error; 
       if (ubicacionesRes.error) throw ubicacionesRes.error; 
 
       if (transaccionesRes.data) setTransacciones(transaccionesRes.data); 
       if (ubicacionesRes.data) setUbicaciones(ubicacionesRes.data); 
     } catch (error) { 
       console.error('Error loading data:', error); 
     } finally { 
       setLoading(false); 
     } 
   } 
 
   const transaccionesFiltradas = transacciones.filter(t => 
     filtroTipo === 'Todos' || t.tipo === filtroTipo 
   ); 
 
   const totalIngresos = transacciones 
     .filter(t => t.tipo === 'Ingreso') 
     .reduce((sum, t) => sum + Number(t.monto), 0); 
 
   const totalEgresos = transacciones 
     .filter(t => t.tipo === 'Egreso') 
     .reduce((sum, t) => sum + Number(t.monto), 0); 
 
   const balance = totalIngresos - totalEgresos; 
 
   const mesActual = new Date().getMonth(); 
   const anoActual = new Date().getFullYear(); 
 
   const ingresosMesActual = transacciones 
     .filter(t => { 
       const fecha = new Date(t.fecha); 
       return t.tipo === 'Ingreso' && fecha.getMonth() === mesActual && fecha.getFullYear() === anoActual; 
     }) 
     .reduce((sum, t) => sum + Number(t.monto), 0); 
 
   const egresosMesActual = transacciones 
     .filter(t => { 
       const fecha = new Date(t.fecha); 
       return t.tipo === 'Egreso' && fecha.getMonth() === mesActual && fecha.getFullYear() === anoActual; 
     }) 
     .reduce((sum, t) => sum + Number(t.monto), 0); 

   async function handleDeleteTransaccion(id: string) {
     if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
       try {
         const { error } = await supabase
           .from('transacciones_financieras')
           .delete()
           .eq('id', id);

         if (error) throw error;

         setTransacciones(transacciones.filter((t) => t.id !== id));
       } catch (error) {
         console.error('Error deleting transaction:', error);
         alert('Error al eliminar la transacción.');
       }
     }
   }

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
         <h1 className="text-3xl font-bold text-gray-900">Gestión Financiera</h1> 
         <button 
           onClick={() => setShowNewTransaccion(true)} 
           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" 
         > 
           <Plus className="w-4 h-4" /> 
           Nueva Transacción 
         </button> 
       </div> 
 
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
         <FinanceCard 
           title="Ingresos Totales" 
           amount={totalIngresos} 
           icon={<TrendingUp className="w-6 h-6" />} 
           color="text-green-600" 
           bgColor="bg-green-100" 
         /> 
         <FinanceCard 
           title="Egresos Totales" 
           amount={totalEgresos} 
           icon={<TrendingDown className="w-6 h-6" />} 
           color="text-red-600" 
           bgColor="bg-red-100" 
         /> 
         <FinanceCard 
           title="Balance General" 
           amount={balance} 
           icon={<DollarSign className="w-6 h-6" />} 
           color={balance >= 0 ? 'text-blue-600' : 'text-red-600'} 
           bgColor={balance >= 0 ? 'bg-blue-100' : 'bg-red-100'} 
         /> 
         <FinanceCard 
           title="Ganancia del Mes" 
           amount={ingresosMesActual - egresosMesActual} 
           icon={<DollarSign className="w-6 h-6" />} 
           color="text-purple-600" 
           bgColor="bg-purple-100" 
         /> 
       </div> 
 
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> 
         <div className="flex items-center justify-between mb-6"> 
           <h2 className="text-xl font-semibold text-gray-900">Historial de Transacciones</h2> 
           <select 
             value={filtroTipo} 
             onChange={(e) => setFiltroTipo(e.target.value)} 
             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
           > 
             <option value="Todos">Todas</option> 
             <option value="Ingreso">Ingresos</option> 
             <option value="Egreso">Egresos</option> 
           </select> 
         </div> 
 
         <div className="overflow-x-auto"> 
           <table className="w-full"> 
             <thead> 
               <tr className="border-b border-gray-200 bg-gray-50"> 
                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th> 
                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th> 
                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th> 
                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th> 
                 <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ubicación</th> 
                 <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monto</th> 
                 <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
               </tr> 
             </thead> 
             <tbody> 
               {transaccionesFiltradas.map((transaccion) => { 
                 const ubicacion = ubicaciones.find(u => u.id === transaccion.id_ubicacion); 
                 return ( 
                   <tr key={transaccion.id} className="border-b border-gray-100 hover:bg-gray-50"> 
                     <td className="px-4 py-3 text-gray-700"> 
                       {new Date(transaccion.fecha).toLocaleDateString('es-ES')} 
                     </td> 
                     <td className="px-4 py-3"> 
                       <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${ 
                         transaccion.tipo === 'Ingreso' 
                           ? 'bg-green-100 text-green-700' 
                           : 'bg-red-100 text-red-700' 
                       }`}> 
                         {transaccion.tipo === 'Ingreso' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} 
                         {transaccion.tipo} 
                       </span> 
                     </td> 
                     <td className="px-4 py-3 text-gray-700"> 
                       {transaccion.descripcion || '-'} 
                     </td> 
                     <td className="px-4 py-3 text-gray-600"> 
                       {transaccion.categoria || '-'} 
                     </td> 
                     <td className="px-4 py-3 text-gray-600"> 
                       {ubicacion ? ubicacion.nombre : 'N/A'} 
                     </td> 
                     <td className={`px-4 py-3 text-right font-semibold ${ 
                       transaccion.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600' 
                     }`}> 
                     {transaccion.tipo === 'Ingreso' ? '+' : '-'}$ 
                     {Number(transaccion.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })} 
                   </td> 
                   <td className="px-4 py-3 text-right">
                   <button
                        onClick={() => setEditingTransaccion(transaccion)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                   <button
                        onClick={() => handleDeleteTransaccion(transaccion.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                 </tr> 
               )})} 
             </tbody> 
           </table> 
         </div> 
 
         {transaccionesFiltradas.length === 0 && ( 
           <div className="text-center py-12"> 
             <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" /> 
             <p className="text-gray-500">No hay transacciones para mostrar</p> 
           </div> 
         )} 
       </div> 
 
       {showNewTransaccion && ( 
         <NewTransaccionModal 
           onClose={() => setShowNewTransaccion(false)} 
           onSuccess={loadData} 
           ubicaciones={ubicaciones} 
         /> 
       )} 

       {editingTransaccion && (
         <EditTransaccionModal
           transaccion={editingTransaccion}
           onClose={() => setEditingTransaccion(null)}
           onSuccess={() => {
             setEditingTransaccion(null);
             loadData();
           }}
           ubicaciones={ubicaciones}
         />
       )}
     </div> 
   ); 
 }

 
 
 function FinanceCard({ 
   title, 
   amount, 
   icon, 
   color, 
   bgColor, 
 }: { 
   title: string; 
   amount: number; 
   icon: React.ReactNode; 
   color: string; 
   bgColor: string; 
 }) { 
   return ( 
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> 
       <div className="flex items-center justify-between"> 
         <div> 
           <p className="text-sm font-medium text-gray-600">{title}</p> 
           <p className="text-2xl font-bold text-gray-900 mt-2"> 
             ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} 
           </p> 
         </div> 
         <div className={`${bgColor} ${color} p-3 rounded-lg`}> 
           {icon} 
         </div> 
       </div> 
     </div> 
   ); 
 } 
 
 function EditTransaccionModal({ transaccion, onClose, onSuccess, ubicaciones }) {
  const [formData, setFormData] = useState({
    ...transaccion,
    fecha: new Date(transaccion.fecha).toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('transacciones_financieras')
        .update({ ...formData, monto: parseFloat(formData.monto) })
        .eq('id', transaccion.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error al actualizar la transacción.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Editar Transacción</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo*</label>
            <select
              required
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Ingreso' | 'Egreso' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto*</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha*</label>
            <input
              type="date"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar</option>
              <option value="Servicios">Servicios</option>
              <option value="Nómina">Nómina</option>
              <option value="Insumos">Insumos</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Servicios Públicos">Servicios Públicos</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación*</label>
            <select
              required
              value={formData.id_ubicacion}
              onChange={(e) => setFormData({ ...formData, id_ubicacion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={ubicaciones.length === 0}
            >
              <option value="">Seleccionar ubicación</option>
              {ubicaciones.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción*</label>
            <textarea
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe la transacción..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

 function NewTransaccionModal({ 
   onClose, 
   onSuccess, 
   ubicaciones, 
 }: { 
   onClose: () => void; 
   onSuccess: () => void; 
   ubicaciones: Ubicacion[]; 
 }) { 
   const [formData, setFormData] = useState({ 
     tipo: 'Egreso' as 'Ingreso' | 'Egreso', 
     monto: '', 
     fecha: new Date().toISOString().split('T')[0], 
     descripcion: '', 
     categoria: '', 
     id_ubicacion: ubicaciones.length === 1 ? ubicaciones[0].id : '', 
   }); 
   const [submitting, setSubmitting] = useState(false); 
 
   async function handleSubmit(e: React.FormEvent) { 
     e.preventDefault(); 
     setSubmitting(true); 
 
     try { 
       const { error } = await supabase.from('transacciones_financieras').insert([ 
         { 
           ...formData, 
           monto: parseFloat(formData.monto), 
         }, 
       ]); 
 
       if (error) throw error; 
 
       onSuccess(); 
       onClose(); 
     } catch (error) { 
       console.error('Error creating transaccion:', error); 
       alert('Error al crear transacción'); 
     } finally { 
       setSubmitting(false); 
     } 
   } 
 
   return ( 
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> 
       <div className="bg-white rounded-lg p-6 w-full max-w-md"> 
         <h2 className="text-2xl font-bold text-gray-900 mb-4">Nueva Transacción</h2> 
         <form onSubmit={handleSubmit} className="space-y-4"> 
           <div> 
             <label className="block text-sm font-medium text-gray-700 mb-1">Tipo*</label> 
             <select 
               required 
               value={formData.tipo} 
               onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Ingreso' | 'Egreso' })} 
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
             > 
               <option value="Ingreso">Ingreso</option> 
               <option value="Egreso">Egreso</option> 
             </select> 
           </div> 
 
           <div> 
             <label className="block text-sm font-medium text-gray-700 mb-1">Monto*</label> 
             <div className="relative"> 
               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span> 
               <input 
                 type="number" 
                 required 
                 step="0.01" 
                 min="0" 
                 value={formData.monto} 
                 onChange={(e) => setFormData({ ...formData, monto: e.target.value })} 
                 className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                 placeholder="0.00" 
               /> 
             </div> 
           </div> 
 
           <div> 
             <label className="block text-sm font-medium text-gray-700 mb-1">Fecha*</label> 
             <input 
               type="date" 
               required 
               value={formData.fecha} 
               onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} 
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
             /> 
           </div> 
 
           <div> 
             <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label> 
             <select 
               value={formData.categoria} 
               onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} 
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
             > 
               <option value="">Seleccionar</option> 
               <option value="Servicios">Servicios</option> 
               <option value="Nómina">Nómina</option> 
               <option value="Insumos">Insumos</option> 
               <option value="Mantenimiento">Mantenimiento</option> 
               <option value="Servicios Públicos">Servicios Públicos</option> 
               <option value="Otros">Otros</option> 
             </select> 
           </div> 
 
           <div> 
             <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación*</label> 
             <select 
               required 
               value={formData.id_ubicacion} 
               onChange={(e) => setFormData({ ...formData, id_ubicacion: e.target.value })} 
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
               disabled={ubicaciones.length === 0} 
             > 
               <option value="">Seleccionar ubicación</option> 
               {ubicaciones.map((u) => ( 
                 <option key={u.id} value={u.id}>{u.nombre}</option> 
               ))} 
             </select> 
           </div>
 
           <div> 
             <label className="block text-sm font-medium text-gray-700 mb-1">Descripción*</label> 
             <textarea 
               required 
               value={formData.descripcion} 
               onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
               rows={3} 
               placeholder="Describe la transacción..." 
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