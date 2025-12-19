import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FleetModule } from './components/FleetModule';
import { FuelModule } from './components/FuelModule';
import { MaintenanceModule } from './components/MaintenanceModule';
import { ReportsModule } from './components/ReportsModule';
import { TiresModule } from './components/TiresModule';
import { SettingsModule } from './components/SettingsModule';
import { HistoryModule } from './components/HistoryModule';
import { TelemetryModule } from './components/TelemetryModule';
import { EmployeesModule } from './components/EmployeesModule';
import { LoginScreen } from './components/LoginScreen';
import { MOCK_VEHICLES, MOCK_FUEL_LOGS, MOCK_MAINTENANCE, MOCK_TIRES, MOCK_CHECKLISTS, MOCK_USERS, MOCK_AUDIT_LOGS, MOCK_BRANCHES } from './constants';
import { ViewState, Vehicle, FuelLog, MaintenanceOrder, Tire, Checklist, User, AuditLogEntry, Branch } from './types';
import { Bell, Search, User as UserIcon, LogOut, X, CheckCircle, AlertCircle, Info, Settings, ChevronDown, Trash2, RefreshCw } from 'lucide-react';

function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'VEHICLE' | 'FUEL' | 'MAINTENANCE' | 'TIRE' | 'USER' | 'BRANCH' } | null>(null);

  const [users, setUsers] = useStickyState<User[]>(MOCK_USERS, 'fcmo_users');
  const [branches, setBranches] = useStickyState<Branch[]>(MOCK_BRANCHES, 'fcmo_branches');
  const [vehicles, setVehicles] = useStickyState<Vehicle[]>(MOCK_VEHICLES, 'fcmo_vehicles');
  const [fuelLogs, setFuelLogs] = useStickyState<FuelLog[]>(MOCK_FUEL_LOGS, 'fcmo_fuel_logs');
  const [maintenance, setMaintenance] = useStickyState<MaintenanceOrder[]>(MOCK_MAINTENANCE, 'fcmo_maintenance');
  const [tires, setTires] = useStickyState<Tire[]>(MOCK_TIRES, 'fcmo_tires');
  const [checklists, setChecklists] = useStickyState<Checklist[]>(MOCK_CHECKLISTS, 'fcmo_checklists');
  const [auditLogs, setAuditLogs] = useStickyState<AuditLogEntry[]>(MOCK_AUDIT_LOGS, 'fcmo_audit_logs');

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
      case 'reports': return <ReportsModule vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      case 'history': return <HistoryModule logs={auditLogs} />;
      case 'settings': return <SettingsModule currentUser={currentUser} users={users} branches={branches} onAddUser={u => setUsers(prev => [...prev, u])} onUpdateUser={u => setUsers(prev => prev.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setDeleteTarget({id, type: 'USER'})} onAddBranch={b => setBranches(prev => [...prev, b])} onUpdateBranch={b => setBranches(prev => prev.map(x => x.id === b.id ? b : x))} onDeleteBranch={id => setDeleteTarget({id, type: 'BRANCH'})} />;
      default: return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} onLogout={() => setCurrentUser(null)} currentUser={currentUser} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar no sistema..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            {currentUser.role === 'OWNER' && (
              <button onClick={handleResetData} className="text-slate-400 hover:text-red-600 transition-colors" title="Resetar Banco de Dados">
                <RefreshCw size={20} />
              </button>
            )}
            <button onClick={() => setShowNotifications(!showNotifications)} className="text-slate-500 hover:text-slate-700 relative">
              <Bell size={20} />
              {auditLogs.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500 uppercase">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 overflow-hidden">
                {currentUser.avatar ? <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={20} />}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">{renderContent()}</div>

        {toast && (
          <div className="absolute bottom-8 right-8 animate-bounce-in z-[100]">
             <div className="flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border bg-white border-blue-200 text-blue-700">
                <CheckCircle size={24} className="text-blue-500" />
                <p className="font-bold text-sm">{toast.msg}</p>
             </div>
          </div>
        )}

        {deleteTarget && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                 <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Registro?</h3>
                 <p className="text-slate-500 text-sm mb-6">Esta ação não pode ser desfeita.</p>
                 <div className="flex gap-3">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-lg border border-slate-300 font-bold">Cancelar</button>
                    <button onClick={handleConfirmDelete} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold">Excluir</button>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}