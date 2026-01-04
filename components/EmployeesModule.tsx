
import React, { useState } from 'react';
import { User, UserRole, Permission, Branch } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants';
import { Users, UserPlus, Search, Filter, Edit, Trash2, Shield, Mail, Building2, Save, X, CheckSquare, Square, Wrench, Truck, Briefcase, CheckCircle, Clock, Lock, Eye, EyeOff } from 'lucide-react';

interface EmployeesModuleProps {
  users: User[];
  branches: Branch[];
  currentUser: User;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const PERMISSOES_DISPONIVEIS: { key: Permission; label: string; description: string }[] = [
  { key: 'VIEW_DASHBOARD', label: 'Dashboard', description: 'Visão geral.' },
  { key: 'MANAGE_FLEET', label: 'Frota', description: 'Gerir veículos.' },
  { key: 'VIEW_TELEMETRY', label: 'GPS', description: 'Monitorar tempo real.' },
  { key: 'MANAGE_FUEL', label: 'Combustível', description: 'Lançar abastecimentos.' },
  { key: 'MANAGE_MAINTENANCE', label: 'Oficina', description: 'Ordens de serviço.' },
  { key: 'MANAGE_TIRES', label: 'Pneus', description: 'Controle de sulcos.' },
  { key: 'MANAGE_USERS', label: 'Usuários', description: 'Gestão de equipe.' },
];

export const EmployeesModule: React.FC<EmployeesModuleProps> = ({ users, branches, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [filterRole, setFilterRole] = useState<'ALL' | 'PENDING' | UserRole>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [userForm, setUserForm] = useState({ 
    name: '', 
    email: '', 
    role: 'DRIVER' as UserRole, 
    password: '',
    permissions: ROLE_DEFAULT_PERMISSIONS.DRIVER,
    isActive: true,
    branchId: branches[0]?.id || '1'
  });

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'ALL' || (filterRole === 'PENDING' ? !u.isActive : u.role === filterRole);
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleRoleChange = (role: UserRole) => {
    setUserForm({
      ...userForm,
      role,
      permissions: ROLE_DEFAULT_PERMISSIONS[role]
    });
  };

  const togglePermission = (perm: Permission) => {
    setUserForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleOpenEdit = (user: User) => {
    // Gestores e Donos podem abrir o editor
    if (currentUser.role !== 'OWNER' && currentUser.role !== 'MANAGER') return;
    
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || '',
      permissions: user.permissions || [],
      isActive: user.isActive,
      branchId: user.branchId || '1'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'OWNER' && currentUser.role !== 'MANAGER') return;

    if (editingUserId) {
       const originalUser = users.find(u => u.id === editingUserId);
       if (originalUser) {
         onUpdateUser({ 
           ...originalUser, 
           ...userForm,
           password: userForm.password || originalUser.password 
         });
       }
    } else {
       onAddUser({
          id: Math.random().toString(36).substr(2, 9),
          ...userForm,
          avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
       });
    }
    setIsModalOpen(false);
    setShowPassword(false);
  };

  const canEditUsers = currentUser.role === 'OWNER' || currentUser.role === 'MANAGER';

  const canDeleteUser = (targetUser: User) => {
    if (targetUser.id === currentUser.id) return false;
    if (targetUser.role === 'OWNER') return false; 
    
    if (currentUser.role === 'OWNER') return true; 
    if (currentUser.role === 'MANAGER') {
      return targetUser.role === 'DRIVER' || targetUser.role === 'MECHANIC';
    }
    return false;
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col pb-20 font-sans">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Equipe Corporativa</h2>
          <p className="text-slate-500 font-bold mt-2">Administração de usuários e controle de acessos.</p>
        </div>
        {canEditUsers && (
          <button onClick={() => { setEditingUserId(null); setIsModalOpen(true); setUserForm({...userForm, password: '', permissions: ROLE_DEFAULT_PERMISSIONS.DRIVER}); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3">
            <UserPlus size={18} /> NOVO FUNCIONÁRIO
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-2 rounded-[24px] border border-slate-200 shrink-0">
         <div className="flex gap-2 overflow-x-auto p-1">
            <button onClick={() => setFilterRole('ALL')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRole === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Todos</button>
            <button onClick={() => setFilterRole('PENDING')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filterRole === 'PENDING' ? 'bg-orange-600 text-white' : 'text-orange-500 bg-orange-50'}`}>
               <Clock size={14} /> Pendentes ({users.filter(u => !u.isActive).length})
            </button>
         </div>
         <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input type="text" placeholder="Buscar..." className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
               <div key={user.id} className="bg-white rounded-[32px] border border-slate-200 p-6 hover:shadow-2xl transition-all relative group">
                  {!user.isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Novo Cadastro</div>}
                  <div className="flex justify-between items-start mb-6">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${user.isActive ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {user.isActive ? <Shield size={14} /> : <Clock size={14} />} {user.role}
                     </span>
                     <div className="flex gap-1">
                        {canEditUsers && (
                          <button onClick={() => handleOpenEdit(user)} className="p-2 text-slate-300 hover:text-blue-600 transition-all"><Edit size={18} /></button>
                        )}
                        {canDeleteUser(user) && (
                          <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-300 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                        )}
                     </div>
                  </div>
                  <div className="flex items-center gap-5 mb-8">
                     <div className="w-16 h-16 rounded-[24px] bg-slate-100 overflow-hidden border-4 border-slate-50 shadow-inner">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <h3 className="font-black text-slate-900 text-xl uppercase">{user.name}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">{user.email}</p>
                     </div>
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
                     {!user.isActive && currentUser.role !== 'DRIVER' && (
                        <button onClick={() => onUpdateUser({...user, isActive: true})} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-[18px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"><CheckCircle size={18} /> APROVAR ACESSO</button>
                     )}
                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <div className="flex items-center gap-2 uppercase tracking-widest"><Building2 size={14} /> Matriz</div>
                        <div className="uppercase tracking-widest">{user.permissions?.length || 0} Permissões</div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 overflow-y-auto">
          <div className="bg-white rounded-[44px] shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up my-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-black text-slate-950 uppercase">{editingUserId ? 'Editar' : 'Novo'} Funcionário</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-400 border active:scale-90 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-hide">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
                     <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[22px] font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail Corporativo</label>
                     <input type="email" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[22px] font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                  </div>
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha de Acesso</label>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-14 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-[22px] font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500" 
                      placeholder={editingUserId ? "••••••••" : "Nova senha"}
                      value={userForm.password} 
                      onChange={e => setUserForm({...userForm, password: e.target.value})} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-all">
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cargo</label>
                     <select 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[22px] font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500" 
                        value={userForm.role} 
                        onChange={e => handleRoleChange(e.target.value as UserRole)}
                     >
                        <option value="DRIVER">Motorista</option>
                        <option value="MECHANIC">Mecânico</option>
                        <option value="MANAGER">Gestor</option>
                        <option value="OWNER">Dono</option>
                     </select>
                  </div>
                  <div className="space-y-2 text-center pt-8">
                     <label className="inline-flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={userForm.isActive} onChange={e => setUserForm({...userForm, isActive: e.target.checked})} className="w-6 h-6 text-blue-600 rounded-lg" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Ativo</span>
                     </label>
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Permissões de Segurança</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {PERMISSOES_DISPONIVEIS.map(perm => (
                        <div 
                           key={perm.key} 
                           onClick={() => togglePermission(perm.key)}
                           className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${userForm.permissions.includes(perm.key) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-900'}`}
                        >
                           {userForm.permissions.includes(perm.key) ? <CheckSquare size={20} /> : <Square size={20} />}
                           <div className="text-left">
                              <p className="font-black text-[10px] uppercase leading-none">{perm.label}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl transition-all hover:bg-blue-600 active:scale-95">SALVAR ALTERAÇÕES</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
