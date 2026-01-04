
import { useState, useEffect, useCallback } from 'react';
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
import { MOCK_VEHICLES, MOCK_FUEL_LOGS, MOCK_MAINTENANCE, MOCK_TIRES, MOCK_CHECKLISTS, MOCK_USERS, MOCK_AUDIT_LOGS, MOCK_BRANCHES, MOCK_NOTIFICATIONS, ALL_PERMISSIONS } from './constants.ts';
import { ViewState, Vehicle, FuelLog, MaintenanceOrder, Tire, Checklist, User, Branch, AppNotification, UserRole } from './types.ts';
import { Menu, Search, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';

const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'DONO',
  MANAGER: 'GESTOR',
  DRIVER: 'MOTORISTA',
  MECHANIC: 'MECÂNICO'
};

function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao carregar ${key}:`, error);
      return defaultValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      window.dispatchEvent(new CustomEvent('fcmo_sync', { detail: { key, value: valueToStore } }));
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
    }
  };

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail && e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };
    window.addEventListener('fcmo_sync', handleSync);
    return () => window.removeEventListener('fcmo_sync', handleSync);
  }, [key]);

  return [storedValue, setValue];
}

export default function App() {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('fcmo_user_session', null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const [users, setUsers] = useLocalStorage<User[]>('fcmo_db_users', MOCK_USERS);
  const [branches, setBranches] = useLocalStorage<Branch[]>('fcmo_db_branches', MOCK_BRANCHES);
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('fcmo_db_vehicles', MOCK_VEHICLES);
  const [fuelLogs, setFuelLogs] = useLocalStorage<FuelLog[]>('fcmo_db_fuel', MOCK_FUEL_LOGS);
  const [maintenance, setMaintenance] = useLocalStorage<MaintenanceOrder[]>('fcmo_db_maint', MOCK_MAINTENANCE);
  const [tires, setTires] = useLocalStorage<Tire[]>('fcmo_db_tires', MOCK_TIRES);
  const [checklists, setChecklists] = useLocalStorage<Checklist[]>('fcmo_db_checklists', MOCK_CHECKLISTS);
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>('fcmo_db_notifications', MOCK_NOTIFICATIONS);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    window.localStorage.removeItem('fcmo_user_session');
  }, [setCurrentUser]);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleRegister = (newUser: User) => setUsers(prev => [...prev, newUser]);

  useEffect(() => {
    if (!currentUser) return;
    const freshUser = users.find(u => u.id === currentUser.id || u.email === currentUser.email);
    if (freshUser) {
      if (!freshUser.isActive) {
        handleLogout();
      } else if (JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(freshUser);
      }
    }
  }, [users, currentUser?.id, handleLogout, setCurrentUser]);

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const renderContent = () => {
    const commonProps = { currentUser, users };
    switch (currentView) {
      case 'dashboard': return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      case 'fleet': return <FleetModule {...commonProps} vehicles={vehicles} checklists={checklists} fuelLogs={fuelLogs} maintenance={maintenance} branches={branches} onAddVehicle={v => setVehicles(p => [...p, v])} onUpdateVehicle={v => setVehicles(p => p.map(x => x.id === v.id ? v : x))} onDeleteVehicle={id => setVehicles(p => p.filter(x => x.id !== id))} onAddChecklist={c => setChecklists(p => [c, ...p])} />;
      case 'fuel': return <FuelModule {...commonProps} logs={fuelLogs} vehicles={vehicles} onAddFuelLog={l => setFuelLogs(p => [l, ...p])} onApproveLog={id => setFuelLogs(p => p.map(l => l.id === id ? {...l, status: 'Aprovado'} : l))} onDeleteLog={id => setFuelLogs(p => p.filter(x => x.id !== id))} />;
      case 'maintenance': return <MaintenanceModule {...commonProps} maintenance={maintenance} vehicles={vehicles} onAddMaintenance={m => setMaintenance(p => [m, ...p])} onUpdateMaintenance={m => setMaintenance(p => p.map(x => x.id === m.id ? m : x))} onApproveMaintenance={id => setMaintenance(p => p.map(m => m.id === id ? {...m, status: 'Aprovado'} : m))} onDeleteMaintenance={id => setMaintenance(p => p.filter(x => x.id !== id))} />;
      case 'tires': return <TiresModule {...commonProps} tires={tires} vehicles={vehicles} onAddTire={t => setTires(p => [...p, t])} onUpdateTire={t => setTires(p => p.map(x => x.id === t.id ? t : x))} onDeleteTire={id => setTires(p => p.filter(x => x.id !== id))} />;
      case 'employees': return <EmployeesModule {...commonProps} users={users} branches={branches} onAddUser={u => setUsers(p => [...p, u])} onUpdateUser={u => setUsers(p => p.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setUsers(p => p.filter(x => x.id !== id))} />;
      case 'history': return <HistoryModule logs={MOCK_AUDIT_LOGS} />;
      case 'settings': return <SettingsModule {...commonProps} users={users} branches={branches} onAddUser={u => setUsers(p => [...p, u])} onUpdateUser={u => setUsers(p => p.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setUsers(p => p.filter(x => x.id !== id))} onAddBranch={b => setBranches(p => [...p, b])} onUpdateBranch={b => setBranches(p => p.map(x => x.id === b.id ? b : x))} onDeleteBranch={id => setBranches(p => p.filter(x => x.id !== id))} />;
      case 'reports': return <ReportsModule vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      default: return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-950">
      <div className={`fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`fixed md:relative inset-y-0 left-0 z-[110] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar currentView={currentView} onChangeView={(v) => { setCurrentView(v); setSidebarOpen(false); }} onLogout={handleLogout} currentUser={currentUser} onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0 z-[150] relative">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-3 text-slate-950 bg-slate-100 rounded-2xl transition-all active:scale-95"><Menu size={24} /></button>
            <div className="hidden lg:flex relative w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Procurar em todo o sistema..." className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView('settings')}
              className="flex items-center gap-4 border-r border-slate-200 pr-6 mr-2 hover:bg-slate-50 p-2 rounded-2xl transition-all group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-950 leading-none uppercase group-hover:text-blue-600 transition-colors">{currentUser.name}</p>
                <p className="text-[10px] text-blue-600 font-black uppercase mt-1 tracking-widest">{ROLE_LABELS[currentUser.role]}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-xl ring-2 ring-white group-hover:ring-blue-100 transition-all">
                <img src={currentUser.avatar} alt="Perfil" className="w-full h-full object-cover" />
              </div>
            </button>

            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-3.5 border rounded-2xl transition-all relative ${notificationsOpen ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20' : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-white hover:text-blue-600'}`}
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-4 w-96 bg-white rounded-[32px] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.2)] border border-slate-100 z-50 overflow-hidden animate-slide-up">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notificações</h3>
                       <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Marcar todas como lidas</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                       {notifications.length === 0 ? (
                         <div className="p-10 text-center">
                            <Bell className="mx-auto text-slate-200 mb-4" size={40} />
                            <p className="text-xs font-bold text-slate-400 uppercase">Nenhuma notificação</p>
                         </div>
                       ) : (
                         notifications.map(notif => (
                           <div key={notif.id} className={`p-6 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'alert' ? 'bg-red-100 text-red-600' : notif.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                 {notif.type === 'alert' ? <AlertCircle size={20} /> : notif.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
                              </div>
                              <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-none mb-1">{notif.title}</p>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 </div>
                                 <p className="text-xs font-medium text-slate-500 leading-relaxed mt-1">{notif.message}</p>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto p-10">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}
