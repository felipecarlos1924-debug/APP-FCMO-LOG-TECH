
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
import { MOCK_VEHICLES, MOCK_FUEL_LOGS, MOCK_MAINTENANCE, MOCK_TIRES, MOCK_CHECKLISTS, MOCK_USERS, MOCK_AUDIT_LOGS, MOCK_BRANCHES, MOCK_DRIVERS } from './constants.ts';
import { ViewState, Vehicle, FuelLog, MaintenanceOrder, Tire, Checklist, User, AuditLogEntry, Branch, DriverProfile } from './types.ts';
import { Bell, Search, User as UserIcon, HelpCircle, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';

function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.warn(`Erro ao carregar chave ${key} do localStorage:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar chave ${key} no localStorage:`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default function App() {
  const [currentUser, setCurrentUser] = useStickyState<User | null>(null, 'fcmo_session_user');
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: string } | null>(null);

  // States
  const [users, setUsers] = useStickyState<User[]>(MOCK_USERS, 'fcmo_users');
  const [branches, setBranches] = useStickyState<Branch[]>(MOCK_BRANCHES, 'fcmo_branches');
  const [vehicles, setVehicles] = useStickyState<Vehicle[]>(MOCK_VEHICLES, 'fcmo_vehicles');
  const [fuelLogs, setFuelLogs] = useStickyState<FuelLog[]>(MOCK_FUEL_LOGS, 'fcmo_fuel_logs');
  const [maintenance, setMaintenance] = useStickyState<MaintenanceOrder[]>(MOCK_MAINTENANCE, 'fcmo_maintenance');
  const [tires, setTires] = useStickyState<Tire[]>(MOCK_TIRES, 'fcmo_tires');
  const [checklists, setChecklists] = useStickyState<Checklist[]>(MOCK_CHECKLISTS, 'fcmo_checklists');
  const [auditLogs, setAuditLogs] = useStickyState<AuditLogEntry[]>(MOCK_AUDIT_LOGS, 'fcmo_audit_logs');
  const [drivers, setDrivers] = useStickyState<DriverProfile[]>(MOCK_DRIVERS, 'fcmo_drivers');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetData = () => {
    if (confirm("Resetar sistema para as configurações de fábrica? Todos os dados salvos serão perdidos.")) {
      window.localStorage.clear();
      window.location.reload();
    }
  };

  const logAction = (action: string, details: string, module: string) => {
    if (!currentUser) return;
    const newLog: AuditLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      timestamp: new Date().toISOString(),
      module
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    switch (type) {
      case 'VEHICLE': setVehicles(prev => prev.filter(v => v.id !== id)); break;
      case 'FUEL': setFuelLogs(prev => prev.filter(l => l.id !== id)); break;
      case 'MAINTENANCE': setMaintenance(prev => prev.filter(m => m.id !== id)); break;
      case 'TIRE': setTires(prev => prev.filter(t => t.id !== id)); break;
      case 'USER': setUsers(prev => prev.filter(u => u.id !== id)); break;
      case 'BRANCH': setBranches(prev => prev.filter(b => b.id !== id)); break;
    }
    logAction('EXCLUIR_REGISTRO', `Removeu ${type} ID ${id}`, type);
    setDeleteTarget(null);
    showToast('Registro removido com sucesso.');
  };

  if (!currentUser) return <LoginScreen users={users} onLogin={setCurrentUser} />;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      case 'fleet': return <FleetModule vehicles={vehicles} checklists={checklists} fuelLogs={fuelLogs} maintenance={maintenance} branches={branches} onAddVehicle={v => setVehicles(prev => [...prev, v])} onUpdateVehicle={v => setVehicles(prev => prev.map(x => x.id === v.id ? v : x))} onDeleteVehicle={id => setDeleteTarget({id, type: 'VEHICLE'})} onAddChecklist={c => setChecklists(prev => [c, ...prev])} currentUser={currentUser} users={users} />;
      case 'fuel': return <FuelModule logs={fuelLogs} vehicles={vehicles} onAddFuelLog={l => setFuelLogs(prev => [l, ...prev])} onApproveLog={id => setFuelLogs(prev => prev.map(l => l.id === id ? {...l, status: 'Aprovado'} : l))} onDeleteLog={id => setDeleteTarget({id, type: 'FUEL'})} currentUser={currentUser} />;
      case 'maintenance': return <MaintenanceModule maintenance={maintenance} vehicles={vehicles} onAddMaintenance={m => setMaintenance(prev => [m, ...prev])} onUpdateMaintenance={m => setMaintenance(prev => prev.map(x => x.id === m.id ? m : x))} onApproveMaintenance={id => setMaintenance(prev => prev.map(m => m.id === id ? {...m, status: 'Aprovado'} : m))} onDeleteMaintenance={id => setDeleteTarget({id, type: 'MAINTENANCE'})} currentUser={currentUser} />;
      case 'tires': return <TiresModule tires={tires} vehicles={vehicles} onAddTire={t => setTires(prev => [...prev, t])} onUpdateTire={t => setTires(prev => prev.map(x => x.id === t.id ? t : x))} onDeleteTire={id => setDeleteTarget({id, type: 'TIRE'})} currentUser={currentUser} />;
      case 'employees': return <EmployeesModule users={users} branches={branches} currentUser={currentUser} onAddUser={u => setUsers(prev => [...prev, u])} onUpdateUser={u => setUsers(prev => prev.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setDeleteTarget({id, type: 'USER'})} />;
      case 'techdocs': return <TechDocsModule />;
      case 'reports': return <ReportsModule vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      case 'history': return <HistoryModule logs={auditLogs} />;
      case 'settings': return <SettingsModule currentUser={currentUser} users={users} branches={branches} onAddUser={u => setUsers(prev => [...prev, u])} onUpdateUser={u => setUsers(prev => prev.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setDeleteTarget({id, type: 'USER'})} onAddBranch={b => setBranches(prev => [...prev, b])} onUpdateBranch={b => setBranches(prev => prev.map(x => x.id === b.id ? b : x))} onDeleteBranch={id => setDeleteTarget({id, type: 'BRANCH'})} />;
      default: return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} onLogout={() => setCurrentUser(null)} currentUser={currentUser} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0 z-10">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input type="text" placeholder="Pesquisar..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('techdocs')} className="text-slate-400 hover:text-blue-600 p-2 rounded-lg transition-colors" title="Ajuda">
               <HelpCircle size={20} />
            </button>
            {currentUser.role === 'OWNER' && (
              <button onClick={handleResetData} className="text-slate-400 hover:text-red-500 p-2 rounded-lg transition-colors" title="Resetar Dados">
                <RefreshCw size={20} />
              </button>
            )}
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button onClick={() => setShowNotifications(!showNotifications)} className="text-slate-500 hover:text-blue-600 relative p-2 rounded-lg">
              <Bell size={20} />
              {auditLogs.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-blue-500 font-bold uppercase mt-1 tracking-wide">{currentUser.role}</p>
              </div>
              <div className="w-9 h-9 bg-slate-100 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center">
                {currentUser.avatar ? <img src={currentUser.avatar} alt="P" className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-slate-400" />}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>

        {showNotifications && (
          <div className="absolute top-16 right-8 w-80 bg-white shadow-2xl rounded-2xl border border-slate-200 z-50 animate-fade-in">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-bold text-slate-800">Atividades Recentes</h4>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Fechar</button>
             </div>
             <div className="max-h-96 overflow-y-auto p-2">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="p-3 hover:bg-slate-50 rounded-xl transition-colors mb-1 border-b border-slate-50 last:border-0">
                     <p className="text-xs font-bold text-slate-800">{log.action}</p>
                     <p className="text-[10px] text-slate-500 mt-1">{log.details}</p>
                     <p className="text-[9px] text-slate-400 mt-2">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {toast && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
             <div className="flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border bg-slate-900 text-white border-slate-700">
                <CheckCircle size={20} className="text-green-400" />
                <p className="font-bold text-sm tracking-tight">{toast.msg}</p>
             </div>
          </div>
        )}

        {deleteTarget && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
                 <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
                 <h3 className="text-2xl font-bold text-slate-800 mb-2">Excluir?</h3>
                 <p className="text-slate-500 text-sm mb-8 leading-relaxed">Deseja remover este registro permanentemente?</p>
                 <div className="flex gap-4">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button onClick={handleConfirmDelete} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Excluir</button>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}