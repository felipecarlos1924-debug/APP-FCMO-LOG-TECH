
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { FleetModule } from './components/FleetModule.tsx';
import { FuelModule } from './components/FuelModule.tsx';
import { MaintenanceModule } from './components/MaintenanceModule.tsx';
import { ReportsModule } from './components/ReportsModule.tsx';
import { TiresModule } from './components/TiresModule.tsx';
import { SettingsModule } from './components/SettingsModule.tsx';
import { HistoryModule } from './components/HistoryModule.tsx';
import { EmployeesModule } from './components/EmployeesModule.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { MOCK_VEHICLES, MOCK_FUEL_LOGS, MOCK_MAINTENANCE, MOCK_TIRES, MOCK_CHECKLISTS, MOCK_USERS, MOCK_AUDIT_LOGS, MOCK_BRANCHES, MOCK_NOTIFICATIONS } from './constants.ts';
import { ViewState, Vehicle, FuelLog, MaintenanceOrder, Tire, Checklist, User, AuditLogEntry, Branch, AppNotification } from './types.ts';
import { Menu, Search, Bell, X, AlertCircle, CheckCircle, Info, Clock, Check } from 'lucide-react';

function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default function App() {
  const [currentUser, setCurrentUser] = useStickyState<User | null>(null, 'fcmo_session_user');
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [users, setUsers] = useStickyState<User[]>(MOCK_USERS, 'fcmo_users');
  const [branches, setBranches] = useStickyState<Branch[]>(MOCK_BRANCHES, 'fcmo_branches');
  const [vehicles, setVehicles] = useStickyState<Vehicle[]>(MOCK_VEHICLES, 'fcmo_vehicles');
  const [fuelLogs, setFuelLogs] = useStickyState<FuelLog[]>(MOCK_FUEL_LOGS, 'fcmo_fuel_logs');
  const [maintenance, setMaintenance] = useStickyState<MaintenanceOrder[]>(MOCK_MAINTENANCE, 'fcmo_maintenance');
  const [tires, setTires] = useStickyState<Tire[]>(MOCK_TIRES, 'fcmo_tires');
  const [checklists, setChecklists] = useStickyState<Checklist[]>(MOCK_CHECKLISTS, 'fcmo_checklists');
  const [auditLogs, setAuditLogs] = useStickyState<AuditLogEntry[]>(MOCK_AUDIT_LOGS, 'fcmo_audit_logs');
  const [notifications, setNotifications] = useStickyState<AppNotification[]>(MOCK_NOTIFICATIONS, 'fcmo_notifications');

  const unreadCount = notifications.filter(n => !n.read).length;
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return <LoginScreen users={users} onLogin={setCurrentUser} />;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      case 'fleet': return <FleetModule vehicles={vehicles} checklists={checklists} fuelLogs={fuelLogs} maintenance={maintenance} branches={branches} onAddVehicle={v => setVehicles(prev => [...prev, v])} onUpdateVehicle={v => setVehicles(prev => prev.map(x => x.id === v.id ? v : x))} onDeleteVehicle={id => setVehicles(prev => prev.filter(v => v.id !== id))} onAddChecklist={c => setChecklists(prev => [c, ...prev])} currentUser={currentUser} users={users} />;
      case 'fuel': return <FuelModule logs={fuelLogs} vehicles={vehicles} onAddFuelLog={l => setFuelLogs(prev => [l, ...prev])} onApproveLog={id => setFuelLogs(prev => prev.map(l => l.id === id ? {...l, status: 'Aprovado'} : l))} onDeleteLog={id => setFuelLogs(prev => prev.filter(l => l.id !== id))} currentUser={currentUser} />;
      case 'maintenance': return <MaintenanceModule maintenance={maintenance} vehicles={vehicles} onAddMaintenance={m => setMaintenance(prev => [m, ...prev])} onUpdateMaintenance={m => setMaintenance(prev => prev.map(x => x.id === m.id ? m : x))} onApproveMaintenance={id => setMaintenance(prev => prev.map(m => m.id === id ? {...m, status: 'Aprovado'} : m))} onDeleteMaintenance={id => setMaintenance(prev => prev.filter(m => m.id !== id))} currentUser={currentUser} />;
      case 'tires': return <TiresModule tires={tires} vehicles={vehicles} onAddTire={t => setTires(prev => [...prev, t])} onUpdateTire={t => setTires(prev => prev.map(x => x.id === t.id ? t : x))} onDeleteTire={id => setTires(prev => prev.filter(t => t.id !== id))} currentUser={currentUser} />;
      case 'employees': return <EmployeesModule users={users} branches={branches} currentUser={currentUser} onAddUser={u => setUsers(prev => [...prev, u])} onUpdateUser={u => setUsers(prev => prev.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setUsers(prev => prev.filter(u => u.id !== id))} />;
      case 'reports': return <ReportsModule vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      case 'history': return <HistoryModule logs={auditLogs} />;
      case 'settings': return <SettingsModule currentUser={currentUser} users={users} branches={branches} onAddUser={u => setUsers(prev => [...prev, u])} onUpdateUser={u => setUsers(prev => prev.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setUsers(prev => prev.filter(u => u.id !== id))} onAddBranch={b => setBranches(prev => [...prev, b])} onUpdateBranch={b => setBranches(prev => prev.map(x => x.id === b.id ? b : x))} onDeleteBranch={id => setBranches(prev => prev.filter(x => x.id !== id))} />;
      default: return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <div 
        className={`fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      <div className={`fixed md:relative inset-y-0 left-0 z-[110] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          currentView={currentView} 
          onChangeView={(v) => { setCurrentView(v); setSidebarOpen(false); }} 
          onLogout={() => setCurrentUser(null)} 
          currentUser={currentUser}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0 z-[90]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="md:hidden p-2.5 text-slate-800 bg-slate-100 rounded-xl transition-all"
            >
               <Menu size={24} />
            </button>
            <div className="hidden md:block relative w-64 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar no sistema..." 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-900" 
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 border-r border-slate-200 pr-4 mr-1">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase mt-1 tracking-widest">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                <img src={currentUser.avatar} alt="Perfil" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl transition-all border ${showNotifications ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-600 bg-slate-100 border-slate-200 hover:border-slate-300'}`}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-white text-[9px] font-black text-white flex items-center justify-center shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up z-[100]">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Central de Avisos</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest flex items-center gap-1">
                        <Check size={12}/> Ler tudo
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <Bell className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-sm text-slate-400 font-bold uppercase">Nenhuma notificação nova</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {[...notifications].reverse().map(notif => (
                          <div key={notif.id} className={`p-5 hover:bg-slate-50 transition-colors flex gap-4 items-start ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                            <div className={`p-2.5 rounded-2xl shrink-0 ${
                              notif.type === 'alert' ? 'bg-red-100 text-red-600' : 
                              notif.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {notif.type === 'alert' ? <AlertCircle size={20} /> : 
                               notif.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-slate-900 leading-tight">{notif.title}</h4>
                              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{notif.message}</p>
                              <div className="flex items-center gap-2 mt-3">
                                <Clock size={12} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <button onClick={() => removeNotification(notif.id)} className="text-slate-300 hover:text-slate-600 p-1 bg-slate-50 rounded-lg">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50 scrollbar-hide">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {renderContent()}
          </div>
        </div>
      </main>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up { animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
