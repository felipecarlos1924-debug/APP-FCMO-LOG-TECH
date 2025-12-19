
import React, { useState, useRef } from 'react';
import { User, UserRole, Permission, Branch } from '../types';
import { Settings, Save, Bell, Shield, Truck, DollarSign, UserPlus, Trash2, Key, Edit, CheckSquare, Square, Building2, MapPin, User as UserIcon, Lock, Camera, Upload } from 'lucide-react';

interface SettingsModuleProps {
  currentUser: User;
  users: User[];
  branches: Branch[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddBranch: (branch: Branch) => void;
  onUpdateBranch: (branch: Branch) => void;
  onDeleteBranch: (id: string) => void;
}

const AVAILABLE_PERMISSIONS: { key: Permission; label: string; description: string }[] = [
  { key: 'VIEW_DASHBOARD', label: 'Ver Dashboard', description: 'Acesso aos gráficos gerais e KPIs.' },
  { key: 'VIEW_FINANCIAL', label: 'Ver Financeiro', description: 'Ver custos, DRE e valores monetários.' },
  { key: 'MANAGE_FLEET', label: 'Gerenciar Frota', description: 'Adicionar e editar veículos.' },
  { key: 'VIEW_FLEET', label: 'Ver Frota', description: 'Visualizar lista de veículos.' },
  { key: 'MANAGE_FUEL', label: 'Lançar Combustível', description: 'Registrar abastecimentos.' },
  { key: 'APPROVE_FUEL', label: 'Aprovar Combustível', description: 'Aprovar registros pendentes.' },
  { key: 'MANAGE_MAINTENANCE', label: 'Gerenciar Manutenção', description: 'Criar e editar ordens de serviço.' },
  { key: 'APPROVE_MAINTENANCE', label: 'Aprovar Manutenção', description: 'Autorizar orçamentos.' },
  { key: 'MANAGE_TIRES', label: 'Gerenciar Pneus', description: 'Controle de sulcos e trocas.' },
  { key: 'MANAGE_USERS', label: 'Gerenciar Usuários', description: 'Criar, editar e excluir usuários.' },
  { key: 'VIEW_HISTORY', label: 'Ver Histórico', description: 'Acesso ao log de auditoria.' },
];

export const SettingsModule: React.FC<SettingsModuleProps> = ({ currentUser, users, branches, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'notifications' | 'security'>('profile');
  const [companyName, setCompanyName] = useState('FCMO Transportes LTDA');
  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ 
    name: '', 
    email: '', 
    role: 'DRIVER' as UserRole, 
    password: '',
    permissions: [] as Permission[],
    isActive: true,
    branchId: ''
  });

  // --- Profile Picture Handler ---
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      // Update the current user immediately
      const updatedUser = { ...currentUser, avatar: imageUrl };
      onUpdateUser(updatedUser);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // --- User Handlers ---
  const handleEditUser = (user: User) => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setUserForm({ name: '', email: '', role: 'DRIVER', password: '', permissions: [], isActive: true, branchId: '' });
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

  const handleRoleChange = (role: UserRole) => {
    let defaultPerms: Permission[] = [];
    if (role === 'DRIVER') defaultPerms = ['VIEW_FLEET', 'MANAGE_FUEL'];
    if (role === 'MECHANIC') defaultPerms = ['VIEW_FLEET', 'MANAGE_MAINTENANCE', 'MANAGE_TIRES'];
    if (role === 'MANAGER') defaultPerms = ['VIEW_DASHBOARD', 'MANAGE_FLEET', 'VIEW_FLEET', 'MANAGE_FUEL', 'MANAGE_MAINTENANCE', 'MANAGE_TIRES', 'VIEW_HISTORY'];
    if (role === 'OWNER') defaultPerms = AVAILABLE_PERMISSIONS.map(p => p.key);

    setUserForm(prev => ({ ...prev, role, permissions: defaultPerms }));
  };

  const handleSubmitUser = (e: React.FormEvent) => {
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
       if (userForm.name && userForm.email && userForm.password) {
        onAddUser({
          id: Math.random().toString(36).substr(2, 9),
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          password: userForm.password,
          avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
          isActive: false, 
          permissions: userForm.permissions,
          branchId: userForm.branchId || undefined
        });
      }
    }
    
    setEditingUserId(null);
    setUserForm({ name: '', email: '', role: 'DRIVER', password: '', permissions: [], isActive: true, branchId: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
          <p className="text-slate-500">Gerencie seu perfil, sistema e segurança.</p>
        </div>
        <button 
          onClick={() => alert('Configurações salvas!')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Save size={18} /> Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Navigation */}
        <div className="space-y-2">
           <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-white border border-slate-200 shadow-sm text-blue-600' : 'text-slate-600 hover:bg-white hover:text-slate-800'}`}
          >
            <UserIcon size={18} /> Meu Perfil
          </button>
          
          <button 
            onClick={() => setActiveTab('system')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${activeTab === 'system' ? 'bg-white border border-slate-200 shadow-sm text-blue-600' : 'text-slate-600 hover:bg-white hover:text-slate-800'}`}
          >
            <Truck size={18} /> Dados da Empresa
          </button>

          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${activeTab === 'notifications' ? 'bg-white border border-slate-200 shadow-sm text-blue-600' : 'text-slate-600 hover:bg-white hover:text-slate-800'}`}
          >
            <Bell size={18} /> Notificações
          </button>

          {currentUser.permissions.includes('MANAGE_USERS') && (
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${activeTab === 'security' ? 'bg-white border border-slate-200 shadow-sm text-blue-600' : 'text-slate-600 hover:bg-white hover:text-slate-800'}`}
            >
              <Shield size={18} /> Segurança & Usuários
            </button>
          )}
        </div>

        {/* Right Col - Content */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
          
          {activeTab === 'profile' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-6 border-b border-slate-100 pb-6">
                   <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                      <div className="w-24 h-24 bg-slate-200 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm">
                         <img src={currentUser.avatar || "https://i.pravatar.cc/150"} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="text-white" size={24} />
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                      />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-800">{currentUser.name}</h3>
                      <p className="text-slate-500">{currentUser.email}</p>
                      <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{currentUser.role}</span>
                      <p className="text-xs text-slate-400 mt-1">Clique na foto para alterar</p>
                   </div>
                </div>
                <div className="space-y-4 max-w-md">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                      <input type="text" defaultValue={currentUser.name} className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" disabled />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                      <input type="email" defaultValue={currentUser.email} className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" disabled />
                   </div>
                   <div className="pt-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-2">
                         <Key size={16} /> Alterar Senha de Acesso
                      </button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">Dados da Transportadora</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                  <input 
                    type="text" 
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Principal</label>
                <input 
                  type="text" 
                  defaultValue="Rodovia Presidente Dutra, km 200 - São Paulo, SP" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
             <div className="space-y-6 animate-fade-in">
                <h3 className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">Preferências de Alerta</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                      <div>
                         <h4 className="font-bold text-slate-800">Manutenções Críticas</h4>
                         <p className="text-sm text-slate-500">Alertar quando uma OS atrasar ou for reprovada.</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                   </div>
                   <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                      <div>
                         <h4 className="font-bold text-slate-800">Combustível</h4>
                         <p className="text-sm text-slate-500">Notificar novos abastecimentos pendentes.</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                   </div>
                   <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                      <div>
                         <h4 className="font-bold text-slate-800">Pneus</h4>
                         <p className="text-sm text-slate-500">Alertar pneus com sulco crítico (menor que 3mm).</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'security' && (
             <div className="space-y-8 animate-fade-in">
               <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-lg text-slate-800 mb-4 pb-2 border-b border-slate-200">
                    {editingUserId ? 'Editar Usuário e Permissões' : 'Cadastrar Novo Usuário'}
                  </h3>
                  <form onSubmit={handleSubmitUser} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Nome Completo"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                        value={userForm.name}
                        onChange={e => setUserForm({...userForm, name: e.target.value})}
                      />
                      <input 
                        type="email" 
                        placeholder="E-mail de Acesso"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                        value={userForm.email}
                        onChange={e => setUserForm({...userForm, email: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <select 
                          className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white"
                          value={userForm.role}
                          onChange={e => handleRoleChange(e.target.value as UserRole)}
                        >
                          <option value="DRIVER">Modelo: Motorista</option>
                          <option value="MECHANIC">Modelo: Mecânico</option>
                          <option value="MANAGER">Modelo: Gestor</option>
                          <option value="OWNER">Modelo: Dono</option>
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Selecionar um modelo pré-define as permissões.</p>
                      </div>
                      <select 
                          className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white"
                          value={userForm.branchId}
                          onChange={e => setUserForm({...userForm, branchId: e.target.value})}
                        >
                          <option value="">Selecione a Unidade (Opcional)</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder={editingUserId ? "Senha (deixe em branco)" : "Senha Inicial"}
                        required={!editingUserId}
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none"
                        value={userForm.password}
                        onChange={e => setUserForm({...userForm, password: e.target.value})}
                      />
                      {/* Active Status */}
                      <div className="flex items-center gap-2">
                         <input 
                           type="checkbox" 
                           id="isActive"
                           checked={userForm.isActive}
                           onChange={e => setUserForm({...userForm, isActive: e.target.checked})}
                           className="w-4 h-4 text-blue-600 rounded"
                         />
                         <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Conta Ativa (E-mail verificado)</label>
                      </div>
                    </div>

                    {/* Granular Permissions */}
                    <div>
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                         <Shield size={16} /> Permissões de Acesso
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {AVAILABLE_PERMISSIONS.map(perm => (
                           <div 
                             key={perm.key} 
                             onClick={() => togglePermission(perm.key)}
                             className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                               userForm.permissions.includes(perm.key) 
                                 ? 'bg-blue-50 border-blue-200' 
                                 : 'bg-white border-slate-200 hover:bg-slate-50'
                             }`}
                           >
                             <div className={`mt-0.5 ${userForm.permissions.includes(perm.key) ? 'text-blue-600' : 'text-slate-300'}`}>
                                {userForm.permissions.includes(perm.key) ? <CheckSquare size={18} /> : <Square size={18} />}
                             </div>
                             <div>
                               <p className={`text-sm font-bold ${userForm.permissions.includes(perm.key) ? 'text-blue-800' : 'text-slate-600'}`}>
                                 {perm.label}
                               </p>
                               <p className="text-xs text-slate-400">{perm.description}</p>
                             </div>
                           </div>
                         ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      {editingUserId && (
                        <button 
                          type="button" 
                          onClick={handleCancelEdit}
                          className="flex-1 bg-slate-200 text-slate-700 py-2 rounded hover:bg-slate-300 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      <button type="submit" className={`flex-1 ${editingUserId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-900'} text-white py-2 rounded transition-colors flex items-center justify-center gap-2`}>
                        {editingUserId ? <Save size={16} /> : <UserPlus size={16} />} 
                        {editingUserId ? 'Atualizar Dados' : 'Criar Usuário'}
                      </button>
                    </div>
                  </form>
               </div>

               <div>
                 <h3 className="font-bold text-lg text-slate-800 mb-4">Usuários do Sistema</h3>
                 <div className="space-y-3">
                   {users.map(u => (
                     <div key={u.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                             <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                             {!u.isActive && (
                               <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                 <span className="text-[8px] text-white font-bold bg-red-500 px-1 rounded">PEND</span>
                               </div>
                             )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                            {u.branchId && (
                               <p className="text-[10px] text-blue-600 font-bold uppercase mt-0.5">
                                 {branches.find(b => b.id === u.branchId)?.name || 'Unidade'}
                               </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className={`text-xs font-bold px-2 py-1 rounded ${
                             u.role === 'OWNER' ? 'bg-purple-100 text-purple-700' :
                             u.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                             u.role === 'MECHANIC' ? 'bg-orange-100 text-orange-700' :
                             'bg-green-100 text-green-700'
                           }`}>
                             {u.permissions.length} Permissões
                           </span>
                           <div className="flex gap-1">
                             <button 
                                onClick={() => handleEditUser(u)} 
                                className="text-blue-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded"
                                title="Editar Usuário/Cargo"
                             >
                               <Edit size={16} />
                             </button>
                             {u.id !== currentUser.id && (
                               <button 
                                  onClick={() => onDeleteUser(u.id)} 
                                  className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"
                                  title="Excluir Usuário"
                               >
                                 <Trash2 size={16} />
                               </button>
                             )}
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
