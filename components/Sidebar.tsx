
import React from 'react';
import { LayoutDashboard, Truck, Droplets, Wrench, Disc, Settings, LogOut, History, FileBarChart, Users, BookOpen } from 'lucide-react';
import { ViewState, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, currentUser }) => {
  const p = currentUser.permissions || [];

  const menuItems = [
    p.includes('VIEW_DASHBOARD') && { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    p.includes('VIEW_FLEET') && { id: 'fleet', label: 'Frota & GPS', icon: Truck },
    p.includes('MANAGE_USERS') && { id: 'employees', label: 'Equipe', icon: Users },
    p.includes('MANAGE_FUEL') && { id: 'fuel', label: 'Combustível', icon: Droplets },
    (p.includes('MANAGE_MAINTENANCE') || p.includes('APPROVE_MAINTENANCE')) && { id: 'maintenance', label: 'Manutenção', icon: Wrench },
    p.includes('MANAGE_TIRES') && { id: 'tires', label: 'Pneus', icon: Disc },
    p.includes('VIEW_DASHBOARD') && { id: 'reports', label: 'Relatórios', icon: FileBarChart },
    p.includes('VIEW_HISTORY') && { id: 'history', label: 'Audit Log', icon: History },
  ].filter(Boolean);

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl z-20">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-black tracking-tighter text-blue-500">FCMO<span className="text-white">LOG</span></h1>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-bold">Intelligent Logistics</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 scrollbar-hide">
        <ul className="space-y-1.5 px-3">
          {menuItems.map((item: any) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onChangeView(item.id as ViewState)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1 bg-slate-900/50">
        <button 
          onClick={() => onChangeView('techdocs')}
          className={`flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium transition-colors
            ${currentView === 'techdocs' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800'}
          `}
        >
          <BookOpen size={18} />
          <span>Docs Técnicos</span>
        </button>

        {p.includes('MANAGE_USERS') && (
          <button 
            onClick={() => onChangeView('settings')}
            className={`flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium transition-colors
              ${currentView === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800'}
            `}
          >
            <Settings size={18} />
            <span>Configurações</span>
          </button>
        )}
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors mt-2 text-sm font-bold"
        >
          <LogOut size={18} />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </div>
  );
};