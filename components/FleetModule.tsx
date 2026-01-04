
import React, { useState } from 'react';
import { Vehicle, VehicleStatus, Checklist, User, Branch, FuelLog, MaintenanceOrder } from '../types';
import { TelemetryModule } from './TelemetryModule';
import { Gauge, MapPin, Calendar, X, Save, ClipboardCheck, Edit2, CheckCircle2, AlertCircle, Clock, Droplets, Building2, LayoutList, Map as MapIcon, Trash2, Camera, Eye, Truck, FileText, Zap, Thermometer, ShieldAlert, Check, UserPlus, Power, User as UserIcon } from 'lucide-react';

interface FleetModuleProps {
  vehicles: Vehicle[];
  checklists: Checklist[];
  fuelLogs: FuelLog[];
  maintenance: MaintenanceOrder[];
  branches: Branch[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onAddChecklist: (checklist: Checklist) => void;
  currentUser: User;
  users: User[]; 
}

export const FleetModule: React.FC<FleetModuleProps> = ({ vehicles, checklists, fuelLogs, maintenance, branches, onAddVehicle, onUpdateVehicle, onDeleteVehicle, onAddChecklist, currentUser, users }) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'MAINTENANCE' | 'STOPPED'>('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  const isDriver = currentUser.role === 'DRIVER';
  const canManage = currentUser.role === 'OWNER' || currentUser.role === 'MANAGER';
  
  let displayedVehicles = isDriver 
    ? vehicles.filter(v => v.driver === currentUser.name)
    : vehicles;

  if (filterStatus !== 'ALL') {
    displayedVehicles = displayedVehicles.filter(v => {
      if (filterStatus === 'ACTIVE') return v.status === VehicleStatus.ACTIVE || v.status === VehicleStatus.TRIP;
      if (filterStatus === 'MAINTENANCE') return v.status === VehicleStatus.MAINTENANCE;
      if (filterStatus === 'STOPPED') return v.status === VehicleStatus.STOPPED;
      return true;
    });
  }

  const [formData, setFormData] = useState<Partial<Vehicle>>({});

  const handleOpenAdd = () => {
    setEditingVehicleId(null);
    setFormData({
       status: VehicleStatus.STOPPED,
       image: 'https://picsum.photos/400/300?random=' + Math.random(),
       lastMaintenance: new Date().toISOString().split('T')[0],
       driver: 'Sem Condutor',
       branchId: branches[0]?.id,
       mileage: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setFormData({ ...vehicle });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model || !formData.plate) return;

    if (editingVehicleId) {
      onUpdateVehicle({ ...(formData as Vehicle), id: editingVehicleId });
    } else {
      onAddVehicle({
        id: Math.random().toString(36).substr(2, 9),
        plate: formData.plate || '',
        model: formData.model || '',
        driver: formData.driver || 'Sem Condutor',
        status: formData.status as VehicleStatus,
        mileage: Number(formData.mileage) || 0,
        lastMaintenance: formData.lastMaintenance || '',
        image: formData.image || 'https://picsum.photos/400/300',
        branchId: formData.branchId,
        currentSpeed: 0,
        latitude: -15.5960,
        longitude: -56.0960
      });
    }
    setIsModalOpen(false);
  };

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.ACTIVE: return 'bg-green-100 text-green-700 border-green-200';
      case VehicleStatus.MAINTENANCE: return 'bg-red-100 text-red-700 border-red-200';
      case VehicleStatus.TRIP: return 'bg-blue-100 text-blue-700 border-blue-200';
      case VehicleStatus.STOPPED: return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className={`flex flex-col h-full w-full transition-all duration-500 ${viewMode === 'map' ? 'fixed inset-0 z-[200] bg-slate-900' : 'space-y-6'}`}>
      
      {viewMode === 'list' ? (
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Gestão de Ativos</h2>
            <p className="text-slate-500 font-medium text-sm mt-2">Frota conectada via satélite.</p>
          </div>
          
          <div className="flex gap-3">
              <div className="bg-slate-100 p-1.5 rounded-2xl flex border border-slate-200 shadow-sm">
                 <button onClick={() => setViewMode('list')} className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all bg-white text-slate-900 shadow-md">
                   <LayoutList size={16} /> Lista
                 </button>
                 <button onClick={() => setViewMode('map')} className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all text-slate-400 hover:text-slate-600">
                   <MapIcon size={16} /> Mapa
                 </button>
              </div>
              {canManage && (
                <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                  + NOVO VEÍCULO
                </button>
              )}
          </div>
        </div>
      ) : (
        <div className="absolute top-6 right-6 z-[3000] flex gap-3 pointer-events-auto">
           <button 
             onClick={() => setViewMode('list')}
             className="bg-white/95 backdrop-blur-xl border border-slate-200 p-4 rounded-3xl shadow-2xl flex items-center gap-3 text-slate-900"
           >
              <LayoutList size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest pr-2">Voltar</span>
           </button>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="flex gap-2 border-b border-slate-200 pb-4 overflow-x-auto scrollbar-hide shrink-0">
            <button onClick={() => setFilterStatus('ALL')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filterStatus === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 bg-white border border-slate-200'}`}>Todos</button>
            <button onClick={() => setFilterStatus('ACTIVE')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filterStatus === 'ACTIVE' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 bg-white border border-slate-200'}`}>Ativos</button>
        </div>
      )}

      <div className={`flex-1 overflow-hidden ${viewMode === 'map' ? 'h-full' : 'overflow-y-auto'}`}>
        {viewMode === 'map' ? (
           <TelemetryModule vehicles={displayedVehicles} currentUser={currentUser} />
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
              {displayedVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                  <div className="h-56 overflow-hidden relative">
                    <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"/>
                    <div className="absolute top-5 right-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(vehicle.status)} backdrop-blur-md`}>
                        {vehicle.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{vehicle.model}</h3>
                        <p className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg inline-block mt-3 tracking-widest uppercase">{vehicle.plate}</p>
                      </div>
                      {canManage && (
                         <div className="flex gap-2">
                            <button onClick={() => handleOpenEdit(vehicle)} className="text-slate-400 hover:text-blue-600 p-2 bg-slate-50 rounded-2xl"><Edit2 size={18} /></button>
                         </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
                         <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400"><Gauge size={20} /></div>
                         <span>{vehicle.mileage.toLocaleString()} KM</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${vehicle.driver === 'Sem Condutor' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                           <UserIcon size={20} />
                         </div>
                         <div className="flex flex-col">
                            <span className={vehicle.driver === 'Sem Condutor' ? 'text-red-600' : 'text-slate-700'}>{vehicle.driver}</span>
                         </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                      <button onClick={() => setViewMode('map')} className="flex-1 bg-slate-950 text-white py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                         VER NO MAPA <MapIcon size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Escalar Veículo</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-400 border border-slate-200"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <input required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-slate-900 font-bold tracking-widest uppercase" placeholder="ABC-1234" value={formData.plate || ''} onChange={e => setFormData({...formData, plate: e.target.value})} />
                <input required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-slate-900 font-bold" placeholder="Modelo" value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-slate-900 font-bold" value={formData.driver || ''} onChange={e => setFormData({...formData, driver: e.target.value})}>
                <option value="Sem Condutor">Sem Condutor</option>
                {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 py-5 bg-slate-950 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl transition-all">SALVAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
