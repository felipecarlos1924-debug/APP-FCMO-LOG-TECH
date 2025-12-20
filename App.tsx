import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { FleetModule } from './components/FleetModule.tsx';
import { FuelModule } from './components/FuelModule.tsx';
import { MaintenanceModule } from './components/MaintenanceModule.tsx';
import { ReportsModule } from './components/ReportsModule.tsx';
import { TiresModule } from './components/TiresModule.tsx';
import { SettingsModule } from './components/SettingsModule.tsx';
import { HistoryModule } from './components/HistoryModule.tsx';
import { EmployeesModule } from './components/EmployeesModule.tsx';
import { TechDocsModule } from './components/TechDocsModule.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { MOCK_VEHICLES, MOCK_FUEL_LOGS, MOCK_MAINTENANCE, MOCK_TIRES, MOCK_CHECKLISTS, MOCK_USERS, MOCK_AUDIT_LOGS, MOCK_BRANCHES } from './constants.ts';
import { ViewState, Vehicle, FuelLog, MaintenanceOrder, Tire, Checklist, User, AuditLogEntry, Branch } from './types.ts';
import { Menu, Search, User as UserIcon, Bell, X } from 'lucide-react';

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
  
  // States
  const [users, setUsers] = useStickyState<User[]>(MOCK_USERS, 'fcmo_users');
  const [branches, setBranches] = useStickyState<Branch[]>(MOCK_BRANCHES, 'fcmo_branches');
  const [vehicles, setVehicles] = useStickyState<Vehicle[]>(MOCK_VEHICLES, 'fcmo_vehicles');
  const [fuelLogs, setFuelLogs] = useStickyState<FuelLog[]>(MOCK_FUEL_LOGS, 'fcmo_fuel_logs');
  const [maintenance, setMaintenance] = useStickyState<MaintenanceOrder[]>(MOCK_MAINTENANCE, 'fcmo_maintenance');
  const [tires, setTires] = useStickyState<Tire[]>(MOCK_TIRES, 'fcmo_tires');
  const [checklists, setChecklists] = useStickyState<Checklist[]>(MOCK_CHECKLISTS, 'fcmo_checklists');
  const [auditLogs, setAuditLogs] = useStickyState<AuditLogEntry[]>(MOCK_AUDIT_LOGS, 'fcmo_audit_logs');

  if (!currentUser) return <LoginScreen users={users} onLogin={setCurrentUser} />;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      case 'fleet': return <FleetModule vehicles={vehicles} checklists={checklists} fuelLogs={fuelLogs} maintenance={maintenance} branches={branches} onAddVehicle={v => setVehicles(prev => [...prev, v])} onUpdateVehicle={v => setVehicles(prev => prev.map(x => x.id === v.id ? v : x))} onDeleteVehicle={id => setVehicles(prev => prev.filter(v => v.id !== id))} onAddChecklist={c => setChecklists(prev => [c, ...prev])} currentUser={currentUser} users={users} />;
      case 'fuel': return <FuelModule logs={fuelLogs} vehicles={vehicles} onAddFuelLog={l => setFuelLogs(prev => [l, ...prev])} onApproveLog={id => setFuelLogs(prev => prev.map(l => l.id === id ? {...l, status: 'Aprovado'} : l))} onDeleteLog={id => setFuelLogs(prev => prev.filter(l => l.id !== id))} currentUser={currentUser} />;
      case 'maintenance': return <MaintenanceModule maintenance={maintenance} vehicles={vehicles} onAddMaintenance={m => setMaintenance(prev => [m, ...prev])} onUpdateMaintenance={m => setMaintenance(prev => prev.map(x => x.id === m.id ? m : x))} onApproveMaintenance={id => setMaintenance(prev => prev.map(m => m.id === id ? {...m, status: 'Aprovado'} : m))} onDeleteMaintenance={id => setMaintenance(prev => prev.filter(m => m.id !== id))} currentUser={currentUser} />;
      case 'tires': return <TiresModule tires={tires} vehicles={vehicles} onAddTire={t => setTires(prev => [...prev, t])} onUpdateTire={t => setTires(prev => prev.map(x => x.id === t.id ? t : x))} onDeleteTire={id => setTires(prev => prev.filter(t => t.id !== id))} currentUser={currentUser} />;
      case 'employees': return <EmployeesModule users={users} branches={branches} currentUser={currentUser} onAddUser={u => setUsers(prev => [...prev, u])} onUpdateUser={u => setUsers(prev => prev.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setUsers(prev => prev.filter(u => u.id !== id))} />;
      case 'techdocs': return <TechDocsModule />;
      case 'reports': return <ReportsModule vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      case 'history': return <HistoryModule logs={auditLogs} />;
      case 'settings': return <SettingsModule currentUser={currentUser} users={users} branches={branches} onAddUser={u => setUsers(prev => [...prev, u])} onUpdateUser={u => setUsers(prev => prev.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setUsers(prev => prev.filter(u => u.id !== id))} onAddBranch={b => setBranches(prev => [...prev, b])} onUpdateBranch={b => setBranches(prev => prev.map(x => x.id === b.id ? b : x))} onDeleteBranch={id => setBranches(prev => prev.filter(x => x.id !== id))} />;
      default: return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Desktop e Menu Mobile */}
      <div className={`fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      
      <div className={`fixed md:relative inset-y-0 left-0 z-[110] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar currentView={currentView} onChangeView={(v) => { setCurrentView(v); setSidebarOpen(false); }} onLogout={() => setCurrentUser(null)} currentUser={currentUser} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header Responsivo */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0 z-[90]">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-600 active:bg-slate-100 rounded-xl transition-colors">
               <Menu size={26} />
            </button>
            <div className="hidden md:block relative w-64 lg:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
              <input type="text" placeholder="Pesquisar frota..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 mr-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none tracking-tighter">{currentUser.name}</p>
                <p className="text-[10px] text-blue-500 font-black uppercase mt-1 tracking-widest">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                <img src={currentUser.avatar} alt="P" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <button className="text-slate-500 hover:text-blue-600 relative p-2 rounded-xl active:bg-slate-100 transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Área de Conteúdo */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}