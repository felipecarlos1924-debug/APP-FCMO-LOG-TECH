
import React from 'react';
import { LayoutDashboard, Truck, Droplets, Wrench, Disc, Settings, LogOut, History, FileBarChart, Users } from 'lucide-react';
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
    // Dashboard
    p.includes('VIEW_DASHBOARD') && { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    
    // Core Modules (Fleet includes Telemetry now)
    p.includes('VIEW_FLEET') && { id: 'fleet', label: 'Minha Frota & GPS', icon: Truck },
    
    // Employees (New)
    p.includes('MANAGE_USERS') && { id: 'employees', label: 'Funcionários', icon: Users },

    p.includes('MANAGE_FUEL') && { id: 'fuel', label: 'Combustível', icon: Droplets },
    
    // Maintenance
    (p.includes('MANAGE_MAINTENANCE') || p.includes('APPROVE_MAINTENANCE')) && { id: 'maintenance', label: 'Manutenção', icon: Wrench },
    
    p.includes('MANAGE_TIRES') && { id: 'tires', label: 'Gestão de Pneus', icon: Disc },

    // Reports
    p.includes('VIEW_DASHBOARD') && { id: 'reports', label: 'Relatórios', icon: FileBarChart },
    
    // History (Audit)
    p.includes('VIEW_HISTORY') && { id: 'history', label: 'Histórico', icon: History },
  ].filter(Boolean); // Remove false values

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl z-20">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold tracking-tighter text-blue-400">FCMO<span className="text-white">LOG</span></h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Tech Logistics</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item: any) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onChangeView(item.id as ViewState)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-1">
        {p.includes('MANAGE_USERS') && (
          <button 
            onClick={() => onChangeView('settings')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors
              ${currentView === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
            `}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </button>
        )}
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors mt-2"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};
