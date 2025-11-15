import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ClientesMascotas } from './components/ClientesMascotas';
import { Reservas } from './components/Reservas';
import { Finanzas } from './components/Finanzas';
import { ConsumoAlimentos } from './components/ConsumoAlimentos';
import { DashboardConsumo } from './components/DashboardConsumo';
import { CalendarioReservas } from './components/CalendarioReservas';
import { PortalCliente } from './components/PortalCliente';
import { Notificaciones } from './components/Notificaciones';
import { LayoutDashboard, Users, Calendar, DollarSign, Menu, X, Dog, BarChart2, Bell } from 'lucide-react';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContainer from './components/NotificationContainer';

// Exportar el tipo View para que otros componentes lo puedan usar
export type View = 'dashboard' | 'clientes' | 'reservas' | 'finanzas' | 'consumo' | 'dashboard-consumo' | 'calendario' | 'notificaciones';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { id: 'dashboard' as View, name: 'Panel de Control', icon: LayoutDashboard },
    { id: 'clientes' as View, name: 'Clientes y Mascotas', icon: Users },
    { id: 'reservas' as View, name: 'Reservas', icon: Calendar },
    { id: 'finanzas' as View, name: 'Finanzas', icon: DollarSign },
    { id: 'consumo' as View, name: 'Consumo Alimentos', icon: Dog },
    { id: 'dashboard-consumo' as View, name: 'Dashboard Consumo', icon: BarChart2 },
    { id: 'calendario' as View, name: 'Calendario', icon: Calendar },
    { id: 'notificaciones' as View, name: 'Notificaciones', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen && (
              <div>
                <div className="flex items-center gap-2">
                  <Dog className="w-6 h-6 text-blue-700" />
                  <h1 className="text-xl font-bold text-gray-900">PetCare Kahome!</h1>
                </div>
                <p className="text-xs text-gray-500 ml-8">Gestión de Pensiones</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
             {sidebarOpen ? (
               <div className="text-xs text-gray-500">
                 <p className="font-semibold text-gray-700 mb-1">Sistema v1.2</p>
                 <p>Cumplimiento LFPDPPP y NOM-151</p>
               </div>
            ) : (
              <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find(n => n.id === currentView)?.name}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Pensión Metepec</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
            {currentView === 'clientes' && <ClientesMascotas />}
            {currentView === 'reservas' && <Reservas />}
            {currentView === 'finanzas' && <Finanzas />}
            {currentView === 'consumo' && <ConsumoAlimentos />}
            {currentView === 'dashboard-consumo' && <DashboardConsumo />}
            {currentView === 'calendario' && <CalendarioReservas />}
            {currentView === 'notificaciones' && <Notificaciones />}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
      <NotificationContainer />
    </NotificationProvider>
  );
}

export default App;