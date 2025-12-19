
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
import { Bell, Search, User as UserIcon, LogOut, X, CheckCircle, AlertCircle, Info, Settings, ChevronDown, Trash2 } from 'lucide-react';

// Hook for persistent state
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default function App() {
  // Persist Current User Session
  const [currentUser, setCurrentUser] = useStickyState<User | null>(null, 'fcmo_session_user');
  
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Global Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'VEHICLE' | 'FUEL' | 'MAINTENANCE' | 'TIRE' | 'USER' | 'BRANCH' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // State Management for Data with Persistence
  const [users, setUsers] = useStickyState<User[]>(MOCK_USERS, 'fcmo_users');
  const [branches, setBranches] = useStickyState<Branch[]>(MOCK_BRANCHES, 'fcmo_branches');
  // Drivers state removed as Ranking/Gamification was removed
  const [vehicles, setVehicles] = useStickyState<Vehicle[]>(MOCK_VEHICLES, 'fcmo_vehicles');
  const [fuelLogs, setFuelLogs] = useStickyState<FuelLog[]>(MOCK_FUEL_LOGS, 'fcmo_fuel_logs');
  const [maintenance, setMaintenance] = useStickyState<MaintenanceOrder[]>(MOCK_MAINTENANCE, 'fcmo_maintenance');
  const [tires, setTires] = useStickyState<Tire[]>(MOCK_TIRES, 'fcmo_tires');
  const [checklists, setChecklists] = useStickyState<Checklist[]>(MOCK_CHECKLISTS, 'fcmo_checklists');
  const [auditLogs, setAuditLogs] = useStickyState<AuditLogEntry[]>(MOCK_AUDIT_LOGS, 'fcmo_audit_logs');

  // Sync session user with users list in case of updates
  useEffect(() => {
    if (currentUser) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedUser);
      }
    }
  }, [users, currentUser]);

  // Notifications (derived from Audit Logs for demo)
  const notifications = auditLogs.slice(0, 8).map(log => ({
    id: log.id,
    title: log.action.replace(/_/g, ' '),
    time: log.timestamp,
    read: false,
    details: log.details
  }));

  // Helper to log actions
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
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'DRIVER') {
      setCurrentView('fleet');
    } else {
      setCurrentView('dashboard');
    }
    showToast(`Bem-vindo, ${user.name}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowUserMenu(false);
    window.localStorage.removeItem('fcmo_session_user');
  };

  // --- GLOBAL DELETE HANDLER ---
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const { id, type } = deleteTarget;

    switch (type) {
      case 'VEHICLE':
        const v = vehicles.find(x => x.id === id);
        setVehicles(prev => prev.filter(item => item.id !== id));
        logAction('EXCLUIR_VEICULO', `Removeu veículo ${v?.plate}`, 'Frota');
        showToast('Veículo excluído com sucesso.', 'info');
        break;
      case 'FUEL':
        const log = fuelLogs.find(l => l.id === id);
        setFuelLogs(prev => prev.filter(l => l.id !== id));
        logAction('EXCLUIR_COMBUSTIVEL', `Removeu abastecimento do veículo ${log?.vehicleId}`, 'Combustível');
        showToast('Abastecimento excluído.', 'info');
        break;
      case 'MAINTENANCE':
        const order = maintenance.find(m => m.id === id);
        setMaintenance(prev => prev.filter(m => m.id !== id));
        logAction('EXCLUIR_OS', `Removeu OS ${order?.description}`, 'Manutenção');
        showToast('OS excluída.', 'info');
        break;
      case 'TIRE':
        const tire = tires.find(t => t.id === id);
        setTires(prev => prev.filter(t => t.id !== id));
        logAction('EXCLUIR_PNEU', `Removeu Pneu ${tire?.serialNumber}`, 'Pneus');
        showToast('Pneu excluído.', 'info');
        break;
      case 'USER':
        const u = users.find(x => x.id === id);
        setUsers(users.filter(u => u.id !== id));
        logAction('EXCLUIR_USUARIO', `Removeu usuário ${u?.name}`, 'Funcionários');
        showToast('Usuário removido.', 'info');
        break;
      case 'BRANCH':
        const b = branches.find(x => x.id === id);
        setBranches(branches.filter(x => x.id !== id));
        logAction('EXCLUIR_FILIAL', `Removeu unidade: ${b?.name}`, 'Configurações');
        showToast('Filial removida.', 'info');
        break;
    }
    setDeleteTarget(null);
  };

  // --- Branch Management ---
  const handleAddBranch = (branch: Branch) => {
    setBranches([...branches, branch]);
    logAction('CRIAR_FILIAL', `Nova unidade: ${branch.name}`, 'Configurações');
    showToast('Filial adicionada com sucesso!');
  };

  const handleUpdateBranch = (updatedBranch: Branch) => {
    setBranches(branches.map(b => b.id === updatedBranch.id ? updatedBranch : b));
    logAction('EDITAR_FILIAL', `Atualizou unidade: ${updatedBranch.name}`, 'Configurações');
    showToast('Filial atualizada!');
  };

  // --- User Management ---
  const handleAddUser = (user: User) => {
    setUsers([...users, user]);
    logAction('CRIAR_USUARIO', `Criou usuário ${user.name}`, 'Funcionários');
    showToast('Usuário criado com sucesso!');
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    logAction('EDITAR_USUARIO', `Atualizou usuário ${updatedUser.name}`, 'Funcionários');
    showToast('Dados do usuário atualizados.');
  };

  // --- Handlers: Vehicles ---
  const handleAddVehicle = (newVehicle: Vehicle) => {
    setVehicles([...vehicles, newVehicle]);
    logAction('CRIAR_VEICULO', `Novo veículo placa ${newVehicle.plate}`, 'Frota');
    showToast('Veículo cadastrado com sucesso!', 'success');
  };

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    logAction('EDITAR_VEICULO', `Atualizou veículo ${updatedVehicle.plate}`, 'Frota');
    showToast('Veículo atualizado!', 'success');
  };

  // --- Handlers: Checklists ---
  const handleAddChecklist = (newChecklist: Checklist) => {
    setChecklists([newChecklist, ...checklists]);
    logAction('NOVO_CHECKLIST', `Checklist realizado no veiculo ${newChecklist.vehicleId}`, 'Frota');
    showToast('Checklist enviado com sucesso!', 'success');
  };

  // --- Handlers: Fuel ---
  const handleAddFuelLog = (newLog: FuelLog) => {
    setFuelLogs([newLog, ...fuelLogs]);
    logAction('REGISTRAR_COMBUSTIVEL', `${newLog.liters}L em ${newLog.vehicleId}`, 'Combustível');
    showToast('Abastecimento registrado!', 'success');
  };

  const handleApproveFuelLog = (id: string) => {
    if (!currentUser) return;

    if (currentUser.role === 'OWNER') {
       setFuelLogs(fuelLogs.map(log => 
         log.id === id ? { ...log, status: 'Aprovado' } : log
       ));
       logAction('APROVAR_COMBUSTIVEL', `Aprovação direta ID ${id}`, 'Combustível');
       showToast('Abastecimento aprovado!', 'success');
    } else if (currentUser.role === 'MANAGER') {
       setFuelLogs(fuelLogs.map(log => 
         log.id === id ? { ...log, status: 'Aguardando Dono' } : log
       ));
       logAction('SOLICITAR_APROVACAO', `Solicitou aprovação ID ${id}`, 'Combustível');
       showToast('Solicitação enviada ao Dono.', 'info');
    }
  };

  // --- Handlers: Maintenance ---
  const handleAddMaintenance = (newOrder: MaintenanceOrder) => {
    setMaintenance([newOrder, ...maintenance]);
    logAction('CRIAR_OS', `Nova OS ${newOrder.type} para ${newOrder.vehicleId}`, 'Manutenção');
    showToast('Ordem de Serviço criada!', 'success');
  };

  const handleUpdateMaintenance = (updatedOrder: MaintenanceOrder) => {
    setMaintenance(maintenance.map(order => order.id === updatedOrder.id ? updatedOrder : order));
    logAction('ATUALIZAR_OS', `Atualizou OS ${updatedOrder.description}`, 'Manutenção');
    showToast('OS Atualizada.', 'success');
  };

  const handleApproveMaintenance = (id: string) => {
    if (!currentUser) return;
    
    if (currentUser.role === 'OWNER') {
        setMaintenance(maintenance.map(order => 
          order.id === id ? { ...order, status: 'Aprovado' } : order
        ));
        logAction('APROVAR_OS', `Aprovou OS ${id}`, 'Manutenção');
        showToast('Orçamento aprovado!', 'success');
    } else if (currentUser.role === 'MANAGER') {
        setMaintenance(maintenance.map(order => 
            order.id === id ? { ...order, status: 'Aguardando Dono' } : order
        ));
        logAction('SOLICITAR_APROVACAO_OS', `Solicitou aprovação OS ${id}`, 'Manutenção');
        showToast('Solicitação enviada.', 'info');
    }
  };

  // --- Handlers: Tires ---
  const handleAddTire = (newTire: Tire) => {
    setTires([...tires, newTire]);
    logAction('CRIAR_PNEU', `Cadastrou pneu ${newTire.serialNumber}`, 'Pneus');
    showToast('Pneu cadastrado!', 'success');
  };

  const handleUpdateTire = (updatedTire: Tire) => {
    setTires(tires.map(t => t.id === updatedTire.id ? updatedTire : t));
    logAction('ATUALIZAR_PNEU', `Atualizou pneu ${updatedTire.serialNumber}`, 'Pneus');
    showToast('Dados do pneu atualizados.', 'success');
  };

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      case 'fleet':
        return <FleetModule 
          vehicles={vehicles} 
          checklists={checklists} 
          fuelLogs={fuelLogs}
          maintenance={maintenance}
          branches={branches} 
          onAddVehicle={handleAddVehicle} 
          onUpdateVehicle={handleUpdateVehicle} 
          onDeleteVehicle={(id) => setDeleteTarget({id, type: 'VEHICLE'})}
          onAddChecklist={handleAddChecklist}
          currentUser={currentUser} 
          users={users} 
        />;
      case 'fuel':
        return <FuelModule 
          logs={fuelLogs} 
          vehicles={vehicles} 
          onAddFuelLog={handleAddFuelLog} 
          onApproveLog={handleApproveFuelLog} 
          onDeleteLog={(id) => setDeleteTarget({id, type: 'FUEL'})}
          currentUser={currentUser} 
        />;
      case 'maintenance':
        return <MaintenanceModule 
          maintenance={maintenance} 
          vehicles={vehicles} 
          onAddMaintenance={handleAddMaintenance} 
          onUpdateMaintenance={handleUpdateMaintenance} 
          onApproveMaintenance={handleApproveMaintenance} 
          onDeleteMaintenance={(id) => setDeleteTarget({id, type: 'MAINTENANCE'})}
          currentUser={currentUser} 
        />;
      case 'tires':
        return <TiresModule 
          tires={tires} 
          vehicles={vehicles} 
          onAddTire={handleAddTire} 
          onUpdateTire={handleUpdateTire} 
          onDeleteTire={(id) => setDeleteTarget({id, type: 'TIRE'})}
          currentUser={currentUser} 
        />;
      case 'employees':
        return <EmployeesModule
          users={users}
          branches={branches}
          currentUser={currentUser}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={(id) => setDeleteTarget({id, type: 'USER'})}
        />;
      case 'reports':
        return <ReportsModule vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
      case 'settings':
        return <SettingsModule 
          currentUser={currentUser} 
          users={users} 
          branches={branches} 
          onAddUser={handleAddUser} 
          onUpdateUser={handleUpdateUser} 
          onDeleteUser={(id) => setDeleteTarget({id, type: 'USER'})}
          onAddBranch={handleAddBranch}
          onUpdateBranch={handleUpdateBranch}
          onDeleteBranch={(id) => setDeleteTarget({id, type: 'BRANCH'})}
        />;
      case 'history':
        return <HistoryModule logs={auditLogs} />;
      case 'telemetry':
        return <TelemetryModule vehicles={vehicles} />;
      default:
        return <Dashboard vehicles={vehicles} fuelLogs={fuelLogs} maintenance={maintenance} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10 relative">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar veículo, motorista ou O.S..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-slate-500 hover:text-slate-700 transition-colors p-1"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                   <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
              
              {showNotifications && (
                 <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center bg-slate-50">
                        <span>Notificações</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">{notifications.length} Novas</span>
                          <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                               <Bell size={24} className="mx-auto mb-2 opacity-50" />
                               Nenhuma notificação nova.
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors cursor-pointer group">
                                   <div className="flex justify-between items-start mb-1">
                                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{n.title}</p>
                                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(n.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                   </div>
                                   <p className="text-xs text-slate-500 line-clamp-2">{n.details}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                        <button 
                           onClick={() => setShowNotifications(false)}
                           className="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                           Marcar todas como lidas
                        </button>
                    </div>
                 </div>
              )}
            </div>

            <div className="relative border-l border-slate-200 pl-6">
               <button 
                 onClick={() => setShowUserMenu(!showUserMenu)}
                 className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg transition-colors"
               >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 uppercase">{
                      currentUser.role === 'OWNER' ? 'Dono' : 
                      currentUser.role === 'MANAGER' ? 'Gestor' : 
                      currentUser.role === 'MECHANIC' ? 'Mecânico' : 'Motorista'
                    }</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 overflow-hidden border border-slate-300">
                     {currentUser.avatar ? <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
               </button>

               {showUserMenu && (
                 <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                    <button 
                       onClick={() => { setCurrentView('settings'); setShowUserMenu(false); }}
                       className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50"
                    >
                       <Settings size={16} /> Meu Perfil
                    </button>
                    <button 
                       onClick={handleLogout}
                       className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                       <LogOut size={16} /> Sair do Sistema
                    </button>
                 </div>
               )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          {renderContent()}
        </div>

        {/* Global Toast Notification */}
        {toast && (
          <div className="absolute bottom-8 right-8 z-[100] animate-bounce-in">
             <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
               toast.type === 'success' ? 'bg-white border-green-200 text-green-700' :
               toast.type === 'error' ? 'bg-white border-red-200 text-red-700' :
               'bg-white border-blue-200 text-blue-700'
             }`}>
                {toast.type === 'success' && <CheckCircle size={24} className="text-green-500" />}
                {toast.type === 'error' && <AlertCircle size={24} className="text-red-500" />}
                {toast.type === 'info' && <Info size={24} className="text-blue-500" />}
                <div>
                   <p className="font-bold text-sm">{toast.msg}</p>
                </div>
                <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 ml-2"><X size={16} /></button>
             </div>
          </div>
        )}

        {/* GLOBAL DELETE CONFIRMATION MODAL */}
        {deleteTarget && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                 <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmar Exclusão</h3>
                 <p className="text-slate-500 text-sm mb-6">
                   Tem certeza que deseja excluir este registro permanentemente? Esta ação não pode ser desfeita e ficará registrada no histórico.
                 </p>
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setDeleteTarget(null)}
                      className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleConfirmDelete}
                      className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                      Sim, Excluir
                    </button>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}
