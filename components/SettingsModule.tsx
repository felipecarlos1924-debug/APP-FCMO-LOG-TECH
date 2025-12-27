
import React, { useState, useRef } from 'react';
import { User, UserRole, Permission, Branch } from '../types';
import { Settings, Save, Bell, Shield, Truck, DollarSign, UserPlus, Trash2, Key, Edit, CheckSquare, Square, Building2, MapPin, User as UserIcon, Lock, Camera, Upload, AlertCircle, ShieldCheck } from 'lucide-react';

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
  { key: 'VIEW_DASHBOARD', label: 'Monitoramento Geral', description: 'Acesso total aos gráficos e indicadores financeiros.' },
  { key: 'MANAGE_FLEET', label: 'Controle de Ativos', description: 'Adicionar, editar e remover veículos da frota.' },
  { key: 'VIEW_TELEMETRY', label: 'Rastreamento Crítico', description: 'Visualização da telemetria e localização GPS real.' },
  { key: 'MANAGE_FUEL', label: 'Lançamentos de Diesel', description: 'Registrar e gerenciar abastecimentos.' },
  { key: 'MANAGE_MAINTENANCE', label: 'Gestão de Oficina', description: 'Criar Ordens de Serviço e preventivas.' },
  { key: 'MANAGE_TIRES', label: 'Módulo de Pneus', description: 'Aferição de sulcos e controle de recapagem.' },
  { key: 'MANAGE_USERS', label: 'Administração de Contas', description: 'Gerenciar equipe e níveis de acesso.' },
];

export const SettingsModule: React.FC<SettingsModuleProps> = ({ currentUser, users, branches, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'security'>('profile');
  const [companyName, setCompanyName] = useState('FCMO Logística Avançada');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Configurações <span className="text-blue-600">Gerais</span>
          </h2>
          <p className="text-slate-500 font-medium mt-3 text-lg">Ajustes de conta, empresa e permissões de segurança.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation - High Contrast Sidebar */}
        <div className="lg:col-span-1 space-y-2">
           <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-4 transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'}`}
          >
            <UserIcon size={20} /> Meu Perfil
          </button>
          
          <button 
            onClick={() => setActiveTab('system')}
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-4 transition-all ${activeTab === 'system' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'}`}
          >
            <Building2 size={20} /> Dados da Empresa
          </button>

          {currentUser.permissions.includes('MANAGE_USERS') && (
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-4 transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'}`}
            >
              <ShieldCheck size={20} /> Equipe & Acessos
            </button>
          )}
        </div>

        {/* Content Area - White background, High Contrast Text */}
        <div className="lg:col-span-3 bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
          
          {activeTab === 'profile' && (
             <div className="p-10 space-y-10 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-center gap-8 border-b border-slate-100 pb-10">
                   <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-32 h-32 bg-slate-100 rounded-[36px] overflow-hidden border-4 border-slate-50 shadow-md">
                         <img src={currentUser.avatar || "https://i.pravatar.cc/150"} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-[36px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                         <Camera className="text-white" size={32} />
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                   </div>
                   <div className="text-center sm:text-left">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{currentUser.name}</h3>
                      <p className="text-slate-500 font-bold text-lg">{currentUser.email}</p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                        <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">{currentUser.role}</span>
                        <span className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-green-100">Verificado</span>
                      </div>
                   </div>
                </div>

                <div className="max-w-xl space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome de Exibição</label>
                        <input type="text" defaultValue={currentUser.name} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                        <input type="email" defaultValue={currentUser.email} disabled className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 font-bold cursor-not-allowed" />
                      </div>
                   </div>
                   
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl text-slate-800 shadow-sm"><Key size={24}/></div>
                        <div>
                          <p className="font-black text-slate-900">Segurança de Acesso</p>
                          <p className="text-sm text-slate-500 font-medium">Troque sua senha periodicamente.</p>
                        </div>
                      </div>
                      <button className="bg-white hover:bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 transition-all">Alterar Senha</button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'system' && (
            <div className="p-10 space-y-10 animate-fade-in">
              <div className="border-b border-slate-100 pb-8">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identidade Visual da Empresa</h3>
                 <p className="text-slate-500 font-medium mt-1">Configure os dados que aparecerão em relatórios e documentos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                  <input type="text" defaultValue="12.345.678/0001-90" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sede Matriz</label>
                <div className="relative">
                  <MapPin size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" defaultValue="Avenida das Indústrias, 442 - Cuiabá, MT" className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold outline-none transition-all" />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-slate-900/20 active:scale-95 transition-all">Salvar Dados Corporativos</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
             <div className="p-10 space-y-10 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Equipe</h3>
                      <p className="text-slate-500 font-medium">Controle de acesso granular para todos os usuários.</p>
                   </div>
                   <button className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all">
                      <UserPlus size={18} /> Novo Usuário
                   </button>
                </div>

                <div className="space-y-4">
                   {users.map(u => (
                     <div key={u.id} className="group p-5 bg-white border border-slate-200 rounded-[32px] hover:shadow-xl hover:border-blue-200 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden relative shadow-inner">
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${u.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                           </div>
                           <div>
                              <p className="text-xl font-black text-slate-900 tracking-tight">{u.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                 <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                                   u.role === 'OWNER' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                   u.role === 'MANAGER' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                   'bg-slate-100 text-slate-600 border border-slate-200'
                                 }`}>{u.role}</span>
                                 <span className="text-xs font-bold text-slate-400">{u.email}</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                              <Edit size={22} />
                           </button>
                           {u.id !== currentUser.id && (
                              <button onClick={() => onDeleteUser(u.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                                 <Trash2 size={22} />
                              </button>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
                
                <div className="bg-blue-50 p-8 rounded-[40px] border border-blue-100 flex items-start gap-6">
                   <div className="p-4 bg-white rounded-3xl text-blue-600 shadow-sm"><Shield size={32} /></div>
                   <div>
                      <h4 className="text-lg font-black text-blue-900">Segurança de Dados</h4>
                      <p className="text-blue-700 font-medium leading-relaxed max-w-xl">
                        As permissões são aplicadas instantaneamente. O administrador tem visão total de todas as filiais, enquanto operadores são restritos às suas unidades designadas.
                      </p>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
