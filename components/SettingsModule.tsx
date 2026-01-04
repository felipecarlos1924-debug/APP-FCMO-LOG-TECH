
import React, { useState } from 'react';
import { User, UserRole, Permission, Branch } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants';
import { Settings, Save, Bell, Shield, Truck, DollarSign, UserPlus, Trash2, Key, Edit, CheckSquare, Square, Building2, MapPin, User as UserIcon, Lock, Camera, Upload, AlertCircle, ShieldCheck, X, Globe, Phone, FileText, Eye, EyeOff } from 'lucide-react';

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

const PERMISSOES_DISPONIVEIS: { key: Permission; label: string; description: string }[] = [
  { key: 'VIEW_DASHBOARD', label: 'Dashboard Estratégico', description: 'Acesso total aos gráficos de performance e KPI.' },
  { key: 'MANAGE_FLEET', label: 'Controle de Ativos', description: 'Capacidade de adicionar, editar e remover veículos.' },
  { key: 'VIEW_TELEMETRY', label: 'Monitoramento GPS', description: 'Visualização da telemetria em tempo real via satélite.' },
  { key: 'MANAGE_FUEL', label: 'Gestão de Diesel', description: 'Controle rigoroso de abastecimentos e custos.' },
  { key: 'MANAGE_MAINTENANCE', label: 'Gestão de Oficina', description: 'Criação de preventivas e ordens de serviço.' },
  { key: 'MANAGE_TIRES', label: 'Módulo de Pneus', description: 'Aferição de sulcos e controle de recapagem.' },
  { key: 'MANAGE_USERS', label: 'Administração de Contas', description: 'Gerenciar equipe e níveis de acesso.' },
];

export const SettingsModule: React.FC<SettingsModuleProps> = ({ currentUser, users, branches, onAddUser, onUpdateUser, onDeleteUser, onUpdateBranch }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'security'>('profile');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'DRIVER' as UserRole,
    password: '',
    permissions: ROLE_DEFAULT_PERMISSIONS.DRIVER,
    branchId: '',
    isActive: true
  });

  const handleOpenAdd = () => {
    if (currentUser.role !== 'OWNER') return;
    setEditingUserId(null);
    setUserForm({
      name: '',
      email: '',
      role: 'DRIVER',
      password: '',
      permissions: ROLE_DEFAULT_PERMISSIONS.DRIVER,
      branchId: branches[0]?.id || '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    if (currentUser.role !== 'OWNER') return;
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || '',
      permissions: user.permissions || [],
      branchId: user.branchId || '',
      isActive: user.isActive
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
    setUserForm(prev => ({
      ...prev,
      role,
      permissions: ROLE_DEFAULT_PERMISSIONS[role]
    }));
  };

  const togglePermission = (perm: Permission) => {
    setUserForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'OWNER') return;

    if (editingUserId) {
      const original = users.find(u => u.id === editingUserId);
      if (original) {
        onUpdateUser({
          ...original,
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          password: userForm.password || original.password,
          permissions: userForm.permissions,
          branchId: userForm.branchId,
          isActive: userForm.isActive
        });
      }
    } else {
      onAddUser({
        id: Math.random().toString(36).substr(2, 9),
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        permissions: userForm.permissions,
        branchId: userForm.branchId,
        isActive: userForm.isActive,
        password: userForm.password || '123456',
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
      });
    }
    setIsModalOpen(false);
    setShowPassword(false);
  };

  // Regras de Visualização/Ação
  const canEditUsers = currentUser.role === 'OWNER';

  const canDeleteUser = (targetUser: User) => {
    if (targetUser.id === currentUser.id) return false;
    if (targetUser.role === 'OWNER') return false; 
    if (currentUser.role === 'OWNER') return true;
    if (currentUser.role === 'MANAGER' && (targetUser.role === 'DRIVER' || targetUser.role === 'MECHANIC')) return true;
    return false;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
            Configurações do <span className="text-blue-600">Sistema</span>
          </h2>
          <p className="text-slate-500 font-bold mt-4 text-lg">Administração central de segurança e identidade corporativa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-3">
           <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-6 py-5 rounded-[24px] font-black uppercase text-[10px] tracking-widest flex items-center gap-4 transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30' : 'text-slate-400 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'}`}
          >
            <UserIcon size={18} /> Meu Perfil
          </button>
          
          <button 
            onClick={() => setActiveTab('system')}
            className={`w-full text-left px-6 py-5 rounded-[24px] font-black uppercase text-[10px] tracking-widest flex items-center gap-4 transition-all ${activeTab === 'system' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30' : 'text-slate-400 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'}`}
          >
            <Building2 size={18} /> Dados da Empresa
          </button>

          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-6 py-5 rounded-[24px] font-black uppercase text-[10px] tracking-widest flex items-center gap-4 transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30' : 'text-slate-400 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'}`}
          >
            <ShieldCheck size={18} /> Equipe & Segurança
          </button>
        </div>

        <div className="lg:col-span-3 bg-white rounded-[44px] shadow-sm border border-slate-200 overflow-hidden relative">
          
          {activeTab === 'profile' && (
             <div className="p-12 space-y-12 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-center gap-10 border-b border-slate-100 pb-12">
                   <div className="relative group cursor-pointer">
                      <div className="w-40 h-40 bg-slate-100 rounded-[48px] overflow-hidden border-8 border-slate-50 shadow-2xl">
                         <img src={currentUser.avatar || "https://i.pravatar.cc/150"} alt="Perfil" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-slate-950/60 rounded-[48px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                         <Camera className="text-white" size={32} />
                      </div>
                   </div>
                   <div className="text-center sm:text-left">
                      <h3 className="text-4xl font-black text-slate-950 tracking-tight leading-none uppercase">{currentUser.name}</h3>
                      <p className="text-slate-500 font-bold text-xl mt-3">{currentUser.email}</p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-6">
                        <span className="bg-slate-950 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-lg">{currentUser.role}</span>
                        <span className="bg-green-100 text-green-700 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-green-200">Verificado via E-mail</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Exibição</label>
                      <input type="text" defaultValue={currentUser.name} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-slate-950 font-black focus:bg-white focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Corporativa</label>
                      <button className="w-full px-6 py-5 bg-slate-950 text-white border border-slate-200 rounded-3xl text-xs font-black uppercase tracking-widest text-left flex justify-between items-center group">
                        •••••••••••• 
                        <span className="opacity-0 group-hover:opacity-100 text-blue-400 transition-all">ALTERAR</span>
                      </button>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'system' && (
             <div className="p-12 space-y-12 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-10">
                   <div>
                      <h3 className="text-3xl font-black text-slate-950 tracking-tight uppercase leading-none">Identidade Corporativa</h3>
                      <p className="text-slate-500 font-bold mt-3">Dados fiscais e presença digital da FCMO LOG.</p>
                   </div>
                   <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-3">
                      <ShieldCheck className="text-blue-600" size={20} />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Empresa Verificada</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-1 space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logotipo Matriz</label>
                      <div className="aspect-square bg-slate-50 border-4 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all cursor-pointer group">
                         <Upload size={32} className="mb-3 group-hover:scale-110 transition-transform" />
                         <span className="text-[9px] font-black uppercase">Upload Logo</span>
                      </div>
                   </div>
                   <div className="md:col-span-2 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                           <div className="relative">
                              <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                              <input type="text" defaultValue="FCMO LOGÍSTICA E TRANSPORTES LTDA" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ Corporativo</label>
                           <div className="relative">
                              <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                              <input type="text" defaultValue="00.000.000/0001-00" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500" />
                           </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website Oficial</label>
                        <div className="relative">
                           <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                           <input type="text" defaultValue="www.fcmolog.com.br" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500" />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 space-y-8">
                   <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-4">Endereço de Faturamento (Matriz)</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logradouro</label>
                         <div className="relative">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input type="text" defaultValue="Av. das Torres, 1200 - Distrito Industrial" className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-500" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade / UF</label>
                         <input type="text" defaultValue="Cuiabá - MT" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-500" />
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone Central</label>
                         <div className="relative">
                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input type="text" defaultValue="(65) 3000-0000" className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-500" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Administrativo</label>
                         <input type="text" defaultValue="contato@fcmolog.com.br" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-500" />
                      </div>
                   </div>
                </div>

                <div className="pt-6 flex justify-end">
                   <button className="bg-slate-950 text-white px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-blue-600 transition-all active:scale-95">
                      <Save size={18} /> SALVAR ALTERAÇÕES DA EMPRESA
                   </button>
                </div>
             </div>
          )}

          {activeTab === 'security' && (
             <div className="p-12 space-y-12 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-10">
                   <div>
                      <h3 className="text-3xl font-black text-slate-950 tracking-tight uppercase leading-none">Gestão de Equipe</h3>
                      <p className="text-slate-500 font-bold mt-3">Controle granular de usuários e permissões.</p>
                   </div>
                   {canEditUsers && (
                    <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-8 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                        <UserPlus size={18} /> NOVO USUÁRIO
                    </button>
                   )}
                </div>

                <div className="space-y-4">
                   {users.map(u => (
                     <div key={u.id} className="group p-6 bg-white border border-slate-200 rounded-[36px] hover:shadow-2xl hover:border-blue-300 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="w-20 h-20 rounded-3xl bg-slate-100 overflow-hidden relative shadow-inner border-4 border-slate-50">
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-4 border-white ${u.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                           </div>
                           <div>
                              <p className="text-2xl font-black text-slate-950 tracking-tight uppercase leading-none">{u.name}</p>
                              <div className="flex items-center gap-4 mt-3">
                                 <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">{u.role}</span>
                                 <span className="text-xs font-bold text-slate-400">{u.email}</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           {canEditUsers && (
                            <button onClick={() => handleOpenEdit(u)} className="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-3xl transition-all active:scale-90 border border-transparent hover:border-blue-100">
                                <Edit size={24} />
                            </button>
                           )}
                           {canDeleteUser(u) && (
                              <button onClick={() => onDeleteUser(u.id)} className="p-4 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-3xl transition-all active:scale-90 border border-transparent hover:border-red-100">
                                 <Trash2 size={24} />
                              </button>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-6">
          <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-4xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col border border-white/20">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tight">
                {editingUserId ? 'Alterar Funcionário' : 'Novo Funcionário'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-16 h-16 flex items-center justify-center bg-white rounded-3xl text-slate-400 border border-slate-200 active:scale-90 transition-all hover:text-red-600"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input required type="text" className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-slate-950 font-black focus:bg-white focus:border-blue-500 outline-none transition-all" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                  <input required type="email" className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-slate-950 font-black focus:bg-white focus:border-blue-500 outline-none transition-all" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo e Responsabilidade</label>
                  <select 
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-slate-950 font-black focus:bg-white outline-none" 
                    value={userForm.role} 
                    onChange={e => handleRoleChange(e.target.value as UserRole)}
                  >
                    <option value="DRIVER">Motorista Operacional</option>
                    <option value="MECHANIC">Técnico de Manutenção</option>
                    <option value="MANAGER">Gestor de Frota</option>
                    <option value="OWNER">Administrador Geral</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-14 pr-16 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-slate-950 font-black outline-none focus:bg-white focus:border-blue-500" 
                      placeholder={editingUserId ? "••••••••" : "Nova senha"}
                      value={userForm.password} 
                      onChange={e => setUserForm({...userForm, password: e.target.value})} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-all">
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permissões de Segurança</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERMISSOES_DISPONIVEIS.map(perm => (
                    <div 
                      key={perm.key} 
                      onClick={() => togglePermission(perm.key)}
                      className={`p-6 rounded-[32px] border-4 cursor-pointer transition-all flex items-start gap-5 ${userForm.permissions.includes(perm.key) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-900'}`}
                    >
                      <div className="mt-1">
                        {userForm.permissions.includes(perm.key) ? <CheckSquare size={24} /> : <Square size={24} />}
                      </div>
                      <div>
                        <p className="font-black text-xs uppercase tracking-tight">{perm.label}</p>
                        <p className={`text-[10px] font-bold leading-relaxed mt-2 ${userForm.permissions.includes(perm.key) ? 'text-white/70' : 'text-slate-400'}`}>{perm.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button type="submit" className="w-full py-7 bg-slate-950 text-white rounded-[32px] font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 hover:bg-blue-600">
                <Save size={24} /> FINALIZAR ALTERAÇÕES
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
