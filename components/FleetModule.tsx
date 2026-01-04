
import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleStatus, Checklist, User, Branch, FuelLog, MaintenanceOrder } from '../types';
import { TelemetryModule } from './TelemetryModule';
import { Gauge, MapPin, Calendar, X, Save, Edit2, CheckCircle2, AlertCircle, Clock, Droplets, Building2, LayoutList, Map as MapIcon, Trash2, Camera, Eye, Truck, FileText, Zap, Thermometer, ShieldAlert, Check, UserPlus, Power, User as UserIcon, Activity, Radio, Wrench } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  const canManage = currentUser.role === 'OWNER' || currentUser.role === 'MANAGER';
  const isDriver = currentUser.role === 'DRIVER';
  
  const displayedVehicles = isDriver 
    ? vehicles.filter(v => v.driver.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
    : vehicles;

  const [formData, setFormData] = useState<Partial<Vehicle>>({});

  const isTrulyLive = (vehicle: Vehicle) => {
    if (!vehicle.lastUpdate) return false;
    try {
      const lastUpdateDate = new Date(vehicle.lastUpdate).getTime();
      const now = new Date().getTime();
      return (now - lastUpdateDate) < 40000; 
    } catch (e) {
      return false;
    }
  };

  const handleOpenAdd = () => {
    // Corrected setEditingUserId to setEditingVehicleId as setEditingUserId is not defined.
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
        plate: formData.plate.toUpperCase() || '',
        model: formData.model || '',
        driver: formData.driver || 'Sem Condutor',
        status: formData.status as VehicleStatus,
        mileage: Number(formData.mileage) || 0,
        lastMaintenance: formData.lastMaintenance || '',
        image: formData.image || 'https://picsum.photos/400/300',
        branchId: formData.branchId,
        currentSpeed: 0,
        latitude: -15.5960,
        longitude: -56.0960,
        lastUpdate: ''
      });
    }
    setIsModalOpen(false);
  };

  const getStatusInfo = (vehicle: Vehicle) => {
    const isLive = isTrulyLive(vehicle);
    if (!isLive && vehicle.status !== VehicleStatus.MAINTENANCE) {
      return { label: 'DESLIGADO', color: 'bg-slate-400 text-white', icon: <Power size={14} /> };
    }
    switch (vehicle.status) {
      case VehicleStatus.TRIP: return { label: 'EM MOVIMENTO', color: 'bg-green-600 text-white', icon: <Activity size={14} className="animate-pulse" /> };
      case VehicleStatus.ACTIVE: return { label: 'PARADO (LIGADO)', color: 'bg-blue-600 text-white', icon: <Radio size={14} className="animate-pulse" /> };
      case VehicleStatus.MAINTENANCE: return { label: 'EM OFICINA', color: 'bg-red-500 text-white', icon: <Wrench size={14} /> };
      default: return { label: 'DESLIGADO', color: 'bg-slate-400 text-white', icon: <Power size={14} /> };
    }
  };

  return (
    <div className={`flex flex-col h-full w-full transition-all duration-500 ${viewMode === 'map' ? 'fixed inset-0 z-[200] bg-slate-900' : 'space-y-6 pb-24'}`}>
      
      {viewMode === 'list' && (
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Monitoramento Real</h2>
            <p className="text-slate-500 font-bold mt-2">Dados transmitidos via GPS.</p>
          </div>
          <div className="flex gap-3">
              <div className="bg-slate-100 p-1.5 rounded-2xl flex border border-slate-200 shadow-sm">
                 <button onClick={() => setViewMode('list')} className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>
                   <LayoutList size={16} /> Lista
                 </button>
                 <button onClick={() => setViewMode('map')} className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>
                   <MapIcon size={16} /> Mapa
                 </button>
              </div>
              {canManage && (
                <button onClick={() => { setEditingVehicleId(null); setFormData({ status: VehicleStatus.STOPPED, driver: 'Sem Condutor' }); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95">+ NOVO VEÍCULO</button>
              )}
          </div>
        </div>
      )}

      <div className={`flex-1 overflow-hidden ${viewMode === 'map' ? 'h-full' : 'overflow-y-auto'}`}>
        {viewMode === 'map' ? (
           <TelemetryModule vehicles={vehicles} currentUser={currentUser} onBack={() => setViewMode('list')} onUpdateVehicle={onUpdateVehicle} />
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
              {displayedVehicles.map((vehicle) => {
                const info = getStatusInfo(vehicle);
                const isOnline = isTrulyLive(vehicle);
                
                return (
                  <div key={vehicle.id} className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 group relative">
                    <div className="h-56 overflow-hidden relative">
                      <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"/>
                      <div className="absolute top-5 left-5 flex gap-2">
                         <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl backdrop-blur-md ${info.color}`}>
                           {info.icon} {info.label}
                         </span>
                         {isOnline && (
                           <span className="bg-green-500 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest animate-pulse shadow-xl flex items-center gap-1">
                             <Radio size={10} /> TRANSMITINDO
                           </span>
                         )}
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{vehicle.model}</h3>
                          <div className="flex items-center gap-3 mt-4">
                             <p className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl tracking-widest uppercase border border-blue-100">{vehicle.plate}</p>
                             {isOnline && vehicle.currentSpeed !== undefined && (
                               <span className="text-xl font-black text-slate-900">{Math.round(vehicle.currentSpeed)} <span className="text-[10px] text-slate-400">KM/H</span></span>
                             )}
                          </div>
                        </div>
                        {canManage && (
                           <button onClick={() => handleOpenEdit(vehicle)} className="text-slate-400 hover:text-blue-600 p-3 bg-slate-50 rounded-2xl transition-all active:scale-90 border border-slate-100"><Edit2 size={18} /></button>
                        )}
                      </div>
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
                           <div className="w-12 h-12 rounded-[18px] bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"><Gauge size={22} /></div>
                           <div>
                              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Odômetro</p>
                              <span className="text-lg font-black text-slate-900">{vehicle.mileage.toLocaleString()} KM</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
                           <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center border ${vehicle.driver === 'Sem Condutor' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}><UserIcon size={22} /></div>
                           <div>
                              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Condutor Escala</p>
                              <span className={`text-lg font-black ${vehicle.driver === 'Sem Condutor' ? 'text-red-600' : 'text-slate-900'}`}>{vehicle.driver}</span>
                           </div>
                        </div>
                      </div>
                      <div className="mt-8 pt-8 border-t border-slate-100 flex gap-3">
                        <button onClick={() => setViewMode('map')} className="flex-1 bg-slate-950 text-white py-5 rounded-[22px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-blue-600">ABRIR RASTREADOR <MapIcon size={14} /></button>
                        <button className="p-5 bg-slate-100 text-slate-400 rounded-[22px] hover:bg-slate-200 transition-all"><FileText size={18} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-xl overflow-hidden animate-slide-up border border-white/20">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{editingVehicleId ? 'Editar Ativo' : 'Novo Ativo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-16 h-16 flex items-center justify-center bg-white rounded-3xl text-slate-400 border border-slate-200 active:scale-90 transition-all hover:text-red-600"><X size={28} /></button>
            </div>
            {/* ADIÇÃO DE OVERFLOW PARA ROLAGEM NO FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="p-12 space-y-10 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Placa</label>
                  <input required type="text" className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-slate-900 font-black tracking-widest uppercase focus:bg-white focus:border-blue-500 outline-none transition-all" value={formData.plate || ''} onChange={e => setFormData({...formData, plate: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modelo</label>
                  <input required type="text" className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-slate-950 font-black focus:bg-white focus:border-blue-500 outline-none transition-all" value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condutor Principal</label>
                  <select className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-slate-950 font-black focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none" value={formData.driver || ''} onChange={e => setFormData({...formData, driver: e.target.value})}>
                    <option value="Sem Condutor">Sem Condutor</option>
                    {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quilometragem (KM)</label>
                <input type="number" className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-slate-950 font-black focus:bg-white focus:border-blue-500 outline-none transition-all" value={formData.mileage || 0} onChange={e => setFormData({...formData, mileage: Number(e.target.value)})} />
              </div>

              <button type="submit" className="w-full py-7 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 hover:bg-blue-600">SALVAR DADOS</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
