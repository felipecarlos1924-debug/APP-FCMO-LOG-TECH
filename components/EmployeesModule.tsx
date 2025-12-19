
import React, { useState } from 'react';
import { User, UserRole, Permission, Branch } from '../types';
import { Users, UserPlus, Search, Filter, Edit, Trash2, Shield, Mail, Building2, Save, X, CheckSquare, Square, Wrench, Truck, Briefcase } from 'lucide-react';

interface EmployeesModuleProps {
  users: User[];
  branches: Branch[];
  currentUser: User;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const AVAILABLE_PERMISSIONS: { key: Permission; label: string; description: string }[] = [
  { key: 'VIEW_DASHBOARD', label: 'Ver Dashboard', description: 'Acesso aos gráficos gerais e KPIs.' },
  { key: 'MANAGE_FLEET', label: 'Gerenciar Frota', description: 'Adicionar e editar veículos.' },
  { key: 'VIEW_FLEET', label: 'Ver Frota', description: 'Visualizar lista de veículos.' },
  { key: 'MANAGE_FUEL', label: 'Lançar Combustível', description: 'Registrar abastecimentos.' },
  { key: 'MANAGE_MAINTENANCE', label: 'Gerenciar Manutenção', description: 'Criar e editar ordens de serviço.' },
  { key: 'MANAGE_TIRES', label: 'Gerenciar Pneus', description: 'Controle de sulcos e trocas.' },
  { key: 'MANAGE_USERS', label: 'Gerenciar Usuários', description: 'Criar, editar e excluir usuários.' },
];

export const EmployeesModule: React.FC<EmployeesModuleProps> = ({ users, branches, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [filterRole, setFilterRole] = useState<'ALL' | UserRole>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const defaultUserForm = { 
    name: '', 
    email: '', 
    role: 'DRIVER' as UserRole, 
    password: '',
    permissions: [] as Permission[],
    isActive: true,
    branchId: ''
  };
  const [userForm, setUserForm] = useState(defaultUserForm);

  // Filter Logic
  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'OWNER': return { color: 'bg-purple-100 text-purple-700', icon: <Shield size={14} />, label: 'Dono' };
      case 'MANAGER': return { color: 'bg-blue-100 text-blue-700', icon: <Briefcase size={14} />, label: 'Gestor' };
      case 'MECHANIC': return { color: 'bg-orange-100 text-orange-700', icon: <Wrench size={14} />, label: 'Mecânico' };
      case 'DRIVER': return { color: 'bg-green-100 text-green-700', icon: <Truck size={14} />, label: 'Motorista' };
      default: return { color: 'bg-gray-100 text-gray-700', icon: <Users size={14} />, label: role };
    }
  };

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setUserForm(defaultUserForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || '',
      permissions: user.permissions || [],
      isActive: user.isActive,
      branchId: user.branchId || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // This triggers the global delete modal in App.tsx
    onDeleteUser(id); 
  };

  const handleRoleChange = (role: UserRole) => {
    let defaultPerms: Permission[] = [];
    if (role === 'DRIVER') defaultPerms = ['VIEW_FLEET', 'MANAGE_FUEL'];
    if (role === 'MECHANIC') defaultPerms = ['VIEW_FLEET', 'MANAGE_MAINTENANCE', 'MANAGE_TIRES'];
    if (role === 'MANAGER') defaultPerms = ['VIEW_DASHBOARD', 'MANAGE_FLEET', 'VIEW_FLEET', 'MANAGE_FUEL', 'MANAGE_MAINTENANCE', 'MANAGE_TIRES', 'VIEW_HISTORY'];
    if (role === 'OWNER') defaultPerms = AVAILABLE_PERMISSIONS.map(p => p.key);

    setUserForm(prev => ({ ...prev, role, permissions: defaultPerms }));
  };

  const togglePermission = (perm: Permission) => {
    setUserForm(prev => {
      const hasPerm = prev.permissions.includes(perm);
      if (hasPerm) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== perm) };
      } else {
        return { ...prev, permissions: [...prev.permissions, perm] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUserId) {
       const originalUser = users.find(u => u.id === editingUserId);
       if (!originalUser) return;

       onUpdateUser({
         ...originalUser,
         name: userForm.name,
         email: userForm.email,
         role: userForm.role,
         permissions: userForm.permissions,
         isActive: userForm.isActive,
         branchId: userForm.branchId || undefined,
         password: userForm.password || originalUser.password 
       });
    } else {
       if (userForm.name && userForm.email) {
        onAddUser({
          id: Math.random().toString(36).substr(2, 9),
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          password: userForm.password || '123456',
          avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
          isActive: userForm.isActive, 
          permissions: userForm.permissions,
          branchId: userForm.branchId || undefined
        });
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in relative h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Funcionários</h2>
          <p className="text-slate-500">Gerencie sua equipe, permissões e acessos.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <UserPlus size={18} /> Novo Funcionário
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
            <div>
               <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
               <p className="text-xl font-bold text-slate-800">{users.length}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Truck size={24} /></div>
            <div>
               <p className="text-xs text-slate-500 font-bold uppercase">Motoristas</p>
               <p className="text-xl font-bold text-slate-800">{users.filter(u => u.role === 'DRIVER').length}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Wrench size={24} /></div>
            <div>
               <p className="text-xs text-slate-500 font-bold uppercase">Mecânicos</p>
               <p className="text-xl font-bold text-slate-800">{users.filter(u => u.role === 'MECHANIC').length}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Briefcase size={24} /></div>
            <div>
               <p className="text-xs text-slate-500 font-bold uppercase">Gestão</p>
               <p className="text-xl font-bold text-slate-800">{users.filter(u => u.role === 'MANAGER' || u.role === 'OWNER').length}</p>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-2 rounded-lg border border-slate-200 shrink-0">
         <div className="flex gap-2 overflow-x-auto">
            <button 
               onClick={() => setFilterRole('ALL')}
               className={`px-4 py-2 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${filterRole === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               Todos
            </button>
            <button 
               onClick={() => setFilterRole('DRIVER')}
               className={`px-4 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${filterRole === 'DRIVER' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <Truck size={14} /> Motoristas
            </button>
            <button 
               onClick={() => setFilterRole('MECHANIC')}
               className={`px-4 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${filterRole === 'MECHANIC' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <Wrench size={14} /> Mecânicos
            </button>
            <button 
               onClick={() => setFilterRole('MANAGER')}
               className={`px-4 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${filterRole === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <Briefcase size={14} /> Gestores
            </button>
         </div>
         <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
               type="text" 
               placeholder="Buscar funcionário..." 
               className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Users Grid */}
      <div className="flex-1 overflow-y-auto pb-4">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => {
               const badge = getRoleBadge(user.role);
               return (
                  <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow relative group">
                     <div className="flex justify-between items-start mb-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${badge.color}`}>
                           {badge.icon} {badge.label}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Editar"
                           >
                              <Edit size={16} />
                           </button>
                           {user.id !== currentUser.id && (
                              <button 
                                 onClick={(e) => handleDelete(e, user.id)}
                                 className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                 title="Excluir"
                              >
                                 <Trash2 size={16} />
                              </button>
                           )}
                        </div>
                     </div>

                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-50 relative">
                           <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                           <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-800 text-lg">{user.name}</h3>
                           <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Mail size={12} /> {user.email}
                           </p>
                        </div>
                     </div>

                     <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5 text-slate-600">
                           <Building2 size={14} className="text-slate-400" />
                           <span>{branches.find(b => b.id === user.branchId)?.name || 'Matriz'}</span>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                           {user.permissions.length} Permissões
                        </span>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-slate-800">
                {editingUserId ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                     <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={userForm.name}
                        onChange={e => setUserForm({...userForm, name: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                     <input 
                        type="email" 
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={userForm.email}
                        onChange={e => setUserForm({...userForm, email: e.target.value})}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Cargo / Função</label>
                     <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white"
                        value={userForm.role}
                        onChange={e => handleRoleChange(e.target.value as UserRole)}
                     >
                        <option value="DRIVER">Motorista</option>
                        <option value="MECHANIC">Mecânico</option>
                        <option value="MANAGER">Gestor</option>
                        <option value="OWNER">Dono</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                     <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white"
                        value={userForm.branchId}
                        onChange={e => setUserForm({...userForm, branchId: e.target.value})}
                     >
                        <option value="">Selecione...</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Senha de Acesso</label>
                     <input 
                        type="text" 
                        placeholder={editingUserId ? "Deixe em branco p/ manter" : "Senha Inicial"}
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={userForm.password}
                        onChange={e => setUserForm({...userForm, password: e.target.value})}
                     />
                  </div>
                  <div className="flex items-center pt-6">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                           type="checkbox" 
                           checked={userForm.isActive}
                           onChange={e => setUserForm({...userForm, isActive: e.target.checked})}
                           className="w-5 h-5 text-blue-600 rounded"
                        />
                        <span className="text-sm font-bold text-slate-700">Conta Ativa</span>
                     </label>
                  </div>
               </div>

               <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                     <Shield size={16} /> Permissões do Sistema
                  </h4>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                     {AVAILABLE_PERMISSIONS.map(perm => (
                        <div 
                           key={perm.key}
                           onClick={() => togglePermission(perm.key)}
                           className={`flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white transition-colors ${userForm.permissions.includes(perm.key) ? 'text-blue-700' : 'text-slate-500'}`}
                        >
                           <div className="mt-0.5">
                              {userForm.permissions.includes(perm.key) ? <CheckSquare size={16} /> : <Square size={16} />}
                           </div>
                           <div className="text-xs">
                              <span className="font-bold block">{perm.label}</span>
                              <span className="opacity-75">{perm.description}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </form>

            <div className="p-6 border-t border-slate-100 shrink-0 bg-white">
               <button 
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
               >
                  <Save size={18} /> {editingUserId ? 'Salvar Alterações' : 'Criar Funcionário'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
