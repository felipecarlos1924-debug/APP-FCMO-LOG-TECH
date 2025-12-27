
import React from 'react';
import { LayoutDashboard, Truck, Droplets, Wrench, Disc, Settings, LogOut, History, FileBarChart, Users, X } from 'lucide-react';
import { ViewState, User } from './types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  currentUser: User;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, currentUser, onClose }) => {
  const p = currentUser.permissions || [];

  const menuItems = [
    p.includes('VIEW_DASHBOARD') && { id: 'dashboard', label: 'Dashboard Inteligente', icon: LayoutDashboard },
    p.includes('VIEW_FLEET') && { id: 'fleet', label: 'Monitoramento GPS', icon: Truck },
    p.includes('MANAGE_USERS') && { id: 'employees', label: 'Gestão de Equipe', icon: Users },
    p.includes('MANAGE_FUEL') && { id: 'fuel', label: 'Controle de Diesel', icon: Droplets },
    (p.includes('MANAGE_MAINTENANCE') || p.includes('APPROVE_MAINTENANCE')) && { id: 'maintenance', label: 'Oficina & O.S.', icon: Wrench },
    p.includes('MANAGE_TIRES') && { id: 'tires', label: 'Gestão de Pneus', icon: Disc },
    p.includes('VIEW_DASHBOARD') && { id: 'reports', label: 'Relatórios BI', icon: FileBarChart },
    p.includes('VIEW_HISTORY') && { id: 'history', label: 'Log de Operações', icon: History },
  ].filter(Boolean);

  return (
    <div className="flex w-72 bg-[#0a1120] text-white flex-col h-full shadow-2xl z-20 shrink-0 border-r border-white/5">
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-blue-500 leading-none">
            FCMO<span className="text-white">LOG</span>
          </h1>
          <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.3em] font-black">Enterprise Solution</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-8 scrollbar-hide">
        <ul className="space-y-2 px-4">
          {menuItems.map((item: any) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onChangeView(item.id as ViewState);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                  <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-white/5 space-y-3 bg-[#080e1a]">
        <button 
          onClick={() => {
            onChangeView('settings');
            if (onClose) onClose();
          }}
          className={`flex items-center gap-3 px-5 py-3.5 w-full rounded-xl text-xs font-black uppercase tracking-wider transition-colors
            ${currentView === 'settings' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-white hover:bg-white/5'}
          `}
        >
          <Settings size={16} />
          <span>Configurações</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-5 py-3.5 w-full text-red-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors text-xs font-black uppercase tracking-widest"
        >
          <LogOut size={16} />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </div>
  );
};
