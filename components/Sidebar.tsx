import React from 'react';
import { LayoutDashboard, Truck, Droplets, Wrench, Disc, Settings, LogOut, History, FileBarChart, Users, BookOpen, X } from 'lucide-react';
import { ViewState, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  currentUser: User;
  onClose?: () => void; // Adicionado para mobile
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, currentUser, onClose }) => {
  const p = currentUser.permissions || [];

  const menuItems = [
    p.includes('VIEW_DASHBOARD') && { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    p.includes('VIEW_FLEET') && { id: 'fleet', label: 'Frota & GPS', icon: Truck },
    p.includes('MANAGE_USERS') && { id: 'employees', label: 'Equipe', icon: Users },
    p.includes('MANAGE_FUEL') && { id: 'fuel', label: 'Combustível', icon: Droplets },
    (p.includes('MANAGE_MAINTENANCE') || p.includes('APPROVE_MAINTENANCE')) && { id: 'maintenance', label: 'Manutenção', icon: Wrench },
    p.includes('MANAGE_TIRES', ) && { id: 'tires', label: 'Pneus', icon: Disc },
    p.includes('VIEW_DASHBOARD', ) && { id: 'reports', label: 'Relatórios', icon: FileBarChart },
    p.includes('VIEW_HISTORY') && { id: 'history', label: 'Audit Log', icon: History },
  ].filter(Boolean);

  return (
    <div className="flex w-64 bg-slate-900 text-white flex-col h-full shadow-2xl z-20 shrink-0">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-blue-500">FCMO<span className="text-white">LOG</span></h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-bold">Intelligent Logistics</p>
        </div>
        {/* Botão de fechar visível apenas no mobile (quando onClose é passado) */}
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        )}
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/30">
        <button 
          onClick={() => onChangeView('techdocs')}
          className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold transition-colors
            ${currentView === 'techdocs' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800'}
          `}
        >
          <BookOpen size={18} />
          <span>Docs Técnicos</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors mt-2 text-sm font-black uppercase tracking-widest"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};