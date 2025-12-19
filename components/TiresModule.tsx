
import React, { useState } from 'react';
import { Tire, Vehicle, TireStatus, User } from '../types';
import { Disc, AlertTriangle, CheckCircle2, CircleDashed, Plus, X, Save, Ruler, Edit, Trash2 } from 'lucide-react';

interface TiresModuleProps {
  tires: Tire[];
  vehicles: Vehicle[];
  onAddTire: (tire: Tire) => void;
  onUpdateTire: (tire: Tire) => void;
  onDeleteTire: (id: string) => void;
  currentUser: User;
}

export const TiresModule: React.FC<TiresModuleProps> = ({ tires, vehicles, onAddTire, onUpdateTire, onDeleteTire, currentUser }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null);
  const [editingTireId, setEditingTireId] = useState<string | null>(null);

  const isDriver = currentUser.role === 'DRIVER';
  const canDelete = currentUser.role === 'OWNER' || currentUser.role === 'MANAGER';

  // Filter tires for Driver
  const displayedTires = isDriver
    ? tires.filter(t => {
        // Find if the tire is on a vehicle owned by the driver
        const vehicle = vehicles.find(v => v.id === t.vehicleId);
        return vehicle && vehicle.driver === currentUser.name;
    })
    : tires;

  // Stats (calculated from displayed tires)
  const criticalTires = displayedTires.filter(t => t.status === 'Crítico').length;
  const inUseTires = displayedTires.filter(t => t.location === 'Veículo').length;
  const stockTires = displayedTires.filter(t => t.location === 'Estoque').length;

  // New/Edit Tire Form State
  const defaultTireState: Partial<Tire> = {
    status: 'Novo',
    location: 'Estoque',
    originalTreadDepth: 18,
    treadDepth: 18
  };
  const [formData, setFormData] = useState<Partial<Tire>>(defaultTireState);

  // Measurement Form State
  const [currentMeasurement, setCurrentMeasurement] = useState<number>(0);

  const handleOpenAdd = () => {
    setEditingTireId(null);
    setFormData(defaultTireState);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (tire: Tire) => {
    setEditingTireId(tire.id);
    setFormData({ ...tire });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.serialNumber) return;

    if (editingTireId) {
      // Update existing
      const updatedTire: Tire = {
         ...(formData as Tire),
         id: editingTireId
      };
      onUpdateTire(updatedTire);
    } else {
      // Create new
      const tireToAdd: Tire = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        brand: formData.brand,
        model: formData.model || 'Padrão',
        size: formData.size || '295/80R22.5',
        serialNumber: formData.serialNumber,
        status: 'Novo',
        treadDepth: Number(formData.originalTreadDepth),
        originalTreadDepth: Number(formData.originalTreadDepth),
        location: formData.location as 'Veículo' | 'Estoque',
        vehicleId: formData.location === 'Veículo' ? formData.vehicleId : undefined,
        position: formData.location === 'Veículo' ? formData.position : undefined,
        lifespan: 100
      };
      onAddTire(tireToAdd);
    }

    setIsFormModalOpen(false);
  };

  const openMeasureModal = (tire: Tire) => {
    setSelectedTire(tire);
    setCurrentMeasurement(tire.treadDepth);
    setIsMeasureModalOpen(true);
  };

  const handleMeasureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTire) return;

    // Calculate new status and lifespan
    const max = selectedTire.originalTreadDepth;
    const min = 3; // Minimum safe depth
    const newDepth = Number(currentMeasurement);
    
    let newLifespan = Math.round(((newDepth - 2) / (max - 2)) * 100); // 2mm is trash
    if (newLifespan < 0) newLifespan = 0;
    if (newLifespan > 100) newLifespan = 100;

    let newStatus: TireStatus = selectedTire.status;
    if (newDepth <= 3) newStatus = 'Crítico';
    else if (newDepth <= 6) newStatus = 'Regular';
    else newStatus = 'Bom';
    
    if(selectedTire.status === 'Recapado') newStatus = 'Recapado'; // Keep recapped status unless critical

    const updatedTire: Tire = {
      ...selectedTire,
      treadDepth: newDepth,
      lifespan: newLifespan,
      status: newStatus
    };

    onUpdateTire(updatedTire);
    setIsMeasureModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Novo': return 'bg-blue-100 text-blue-700';
      case 'Bom': return 'bg-green-100 text-green-700';
      case 'Regular': return 'bg-yellow-100 text-yellow-700';
      case 'Crítico': return 'bg-red-100 text-red-700';
      case 'Recapado': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTreadColor = (depth: number, max: number) => {
    const percentage = (depth / max) * 100;
    if (percentage < 20) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Pneus</h2>
          <p className="text-slate-500">Controle de sulcos, vida útil e estoque.</p>
        </div>
        {!isDriver && (
          <button 
            onClick={handleOpenAdd}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Novo Pneu
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pneus em Uso</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{inUseTires}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Disc size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Em Estoque</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stockTires}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className={`bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between ${criticalTires > 0 ? 'border-red-200 bg-red-50/50' : 'border-slate-200'}`}>
          <div>
            <p className={`text-sm font-medium ${criticalTires > 0 ? 'text-red-600' : 'text-slate-500'}`}>Troca Necessária</p>
            <h3 className={`text-3xl font-bold mt-1 ${criticalTires > 0 ? 'text-red-700' : 'text-slate-800'}`}>{criticalTires}</h3>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${criticalTires > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Tires List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Inventário de Pneus</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">ID / Serial</th>
                <th className="px-6 py-4">Marca/Modelo</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4 text-center">Sulco (mm)</th>
                <th className="px-6 py-4 text-center">Vida Útil</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedTires.length === 0 ? (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                        Nenhum pneu encontrado.
                    </td>
                </tr>
              ) : displayedTires.map((tire) => (
                <tr key={tire.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">#{tire.id}</div>
                    <div className="text-xs text-slate-500 font-mono">{tire.serialNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800">{tire.brand} {tire.model}</div>
                    <div className="text-xs text-slate-500">{tire.size}</div>
                  </td>
                  <td className="px-6 py-4">
                    {tire.location === 'Veículo' ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">
                           {vehicles.find(v => v.id === tire.vehicleId)?.plate || tire.vehicleId}
                        </span>
                        <span className="text-xs text-slate-500">{tire.position}</span>
                      </div>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Em Estoque</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono font-bold text-lg">{tire.treadDepth}</span>
                    <span className="text-xs text-slate-400 ml-1">/ {tire.originalTreadDepth}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 mx-auto">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold">{tire.lifespan}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full ${getTreadColor(tire.treadDepth, tire.originalTreadDepth)}`} 
                          style={{ width: `${tire.lifespan}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(tire.status)}`}>
                      {tire.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                     <button 
                       onClick={() => openMeasureModal(tire)}
                       title="Atualizar Sulco"
                       className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full"
                     >
                       <Ruler size={20} />
                     </button>
                     {!isDriver && (
                       <button 
                         onClick={() => handleOpenEdit(tire)}
                         title="Editar Pneu"
                         className="text-slate-400 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-full"
                       >
                         <Edit size={20} />
                       </button>
                     )}
                     {/* Delete Logic - Owner & Manager */}
                     {canDelete && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteTire(tire.id); }}
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full group"
                            title="Excluir Pneu"
                        >
                            <Trash2 size={20} className="group-hover:stroke-red-600 pointer-events-none" />
                        </button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD/EDIT TIRE */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">
                {editingTireId ? 'Editar Pneu' : 'Cadastrar Novo Pneu'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Michelin"
                    value={formData.brand || ''}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="X Multi Z"
                    value={formData.model || ''}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Série (DOT/ID)</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="ABC-123456"
                  value={formData.serialNumber || ''}
                  onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Medida</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.size || ''}
                    onChange={e => setFormData({...formData, size: e.target.value})}
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sulco Original (mm)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.originalTreadDepth || ''}
                    onChange={e => setFormData({...formData, originalTreadDepth: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value as any})}
                >
                  <option value="Estoque">Estoque</option>
                  <option value="Veículo">Montado em Veículo</option>
                </select>
              </div>

              {formData.location === 'Veículo' && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
                    <select 
                      className="w-full px-2 py-2 border border-slate-300 rounded text-sm"
                      value={formData.vehicleId || ''}
                      onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Posição</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Diant. Esq"
                      className="w-full px-2 py-2 border border-slate-300 rounded text-sm"
                      value={formData.position || ''}
                      onChange={e => setFormData({...formData, position: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {editingTireId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MEASURE TIRE */}
      {isMeasureModalOpen && selectedTire && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100">
               <h3 className="text-xl font-bold text-slate-800">Registrar Medição</h3>
               <p className="text-sm text-slate-500">{selectedTire.brand} - {selectedTire.serialNumber}</p>
             </div>
             <form onSubmit={handleMeasureSubmit} className="p-6">
                <div className="mb-6">
                   <label className="block text-sm font-medium text-slate-700 mb-2">Sulco Atual (mm)</label>
                   <div className="flex items-center gap-4">
                     <input 
                        type="range" 
                        min="0" 
                        max={selectedTire.originalTreadDepth} 
                        step="0.1"
                        className="w-full"
                        value={currentMeasurement}
                        onChange={e => setCurrentMeasurement(Number(e.target.value))}
                     />
                     <div className="w-20 text-center font-bold text-2xl text-blue-600 border border-blue-100 rounded bg-blue-50 py-1">
                        {currentMeasurement}
                     </div>
                   </div>
                   <p className="text-xs text-slate-400 mt-2 text-center">Arraste para ajustar a medição em milímetros.</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsMeasureModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Confirmar
                  </button>
                </div>
             </form>
          </div>
         </div>
      )}
    </div>
  );
};
