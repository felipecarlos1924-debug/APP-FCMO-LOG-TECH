
import React, { useState } from 'react';
import { MaintenanceOrder, Vehicle, User } from '../types';
import { Wrench, Clock, CheckCircle2, AlertOctagon, X, Save, Edit, Check, ShieldCheck, Send, Trash2, Search, Filter, AlertCircle, Calendar } from 'lucide-react';

interface MaintenanceModuleProps {
  maintenance: MaintenanceOrder[];
  vehicles: Vehicle[];
  onAddMaintenance: (order: MaintenanceOrder) => void;
  onUpdateMaintenance: (order: MaintenanceOrder) => void;
  onApproveMaintenance: (id: string) => void;
  onDeleteMaintenance: (id: string) => void;
  currentUser: User;
}

export const MaintenanceModule: React.FC<MaintenanceModuleProps> = ({ maintenance, vehicles, onAddMaintenance, onUpdateMaintenance, onApproveMaintenance, onDeleteMaintenance, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'DONE'>('OPEN');
  const [searchTerm, setSearchTerm] = useState('');
  
  const canDelete = currentUser.role === 'OWNER' || currentUser.role === 'MANAGER';

  // Stats
  const totalCost = maintenance.reduce((acc, curr) => acc + curr.cost, 0);
  const pendingOrders = maintenance.filter(m => m.status === 'Pendente' || m.status === 'Aguardando Dono').length;
  const inProgressOrders = maintenance.filter(m => m.status === 'Em Andamento').length;

  // Filter Logic
  const filteredMaintenance = maintenance.filter(order => {
    const vehicle = vehicles.find(v => v.id === order.vehicleId);
    const matchesSearch = 
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    if (!matchesSearch) return false;

    if (filterStatus === 'OPEN') return ['Pendente', 'Aguardando Dono', 'Em Andamento'].includes(order.status);
    if (filterStatus === 'DONE') return ['Concluído', 'Recusado'].includes(order.status);
    
    return true;
  });

  // Form State
  const defaultOrderState: Partial<MaintenanceOrder> = {
    date: new Date().toISOString().split('T')[0],
    type: 'Preventiva',
    status: 'Pendente',
    cost: 0
  };
  const [formData, setFormData] = useState<Partial<MaintenanceOrder>>(defaultOrderState);

  const handleOpenAdd = () => {
    setEditingOrderId(null);
    setFormData(defaultOrderState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: MaintenanceOrder) => {
    setEditingOrderId(order.id);
    setFormData({ ...order });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.description) return;

    if (editingOrderId) {
      // Update logic
      const updatedOrder: MaintenanceOrder = {
        ...(formData as MaintenanceOrder),
        id: editingOrderId,
      };
      onUpdateMaintenance(updatedOrder);
    } else {
      // Create logic
      const orderToAdd: MaintenanceOrder = {
        id: Math.random().toString(36).substr(2, 9),
        vehicleId: formData.vehicleId,
        description: formData.description,
        type: formData.type as 'Preventiva' | 'Corretiva',
        cost: Number(formData.cost) || 0,
        date: formData.date || new Date().toISOString(),
        status: formData.status as 'Pendente' | 'Concluído' | 'Em Andamento' | 'Aguardando Dono',
      };
      onAddMaintenance(orderToAdd);
    }

    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
      switch (status) {
          case 'Concluído': return 'bg-green-100 text-green-700';
          case 'Aprovado': return 'bg-blue-100 text-blue-700';
          case 'Aguardando Dono': return 'bg-purple-100 text-purple-700';
          case 'Em Andamento': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
          case 'Recusado': return 'bg-red-100 text-red-700';
          default: return 'bg-orange-100 text-orange-700'; // Pendente
      }
  };

  return (
    <div className="space-y-6 animate-fade-in relative h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manutenção</h2>
          <p className="text-slate-500">Gestão de Ordens de Serviço (O.S.)</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm shadow-orange-200"
        >
          <Wrench size={18} /> Nova O.S.
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={24} /></div>
            <div>
               <p className="text-xs text-slate-500 font-bold uppercase">Pendentes</p>
               <p className="text-xl font-bold text-slate-800">{pendingOrders}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={24} /></div>
            <div>
               <p className="text-xs text-slate-500 font-bold uppercase">Em Andamento</p>
               <p className="text-xl font-bold text-slate-800">{inProgressOrders}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle2 size={24} /></div>
            <div>
               <p className="text-xs text-slate-500 font-bold uppercase">Custo Total (Mês)</p>
               <p className="text-xl font-bold text-slate-800">R$ {totalCost.toLocaleString('pt-BR')}</p>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-2 rounded-lg border border-slate-200 shrink-0">
         <div className="flex gap-2 p-1 bg-slate-100 rounded-md w-fit">
            <button 
               onClick={() => setFilterStatus('OPEN')}
               className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${filterStatus === 'OPEN' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               Em Aberto
            </button>
            <button 
               onClick={() => setFilterStatus('DONE')}
               className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${filterStatus === 'DONE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               Concluídas
            </button>
            <button 
               onClick={() => setFilterStatus('ALL')}
               className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${filterStatus === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               Todas
            </button>
         </div>
         <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
               type="text" 
               placeholder="Buscar veículo ou serviço..." 
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-4">
        {filteredMaintenance.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
               <Wrench size={48} className="mx-auto mb-4 opacity-50" />
               <p>Nenhuma ordem de serviço encontrada.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredMaintenance.map((order) => (
                <div key={order.id} className={`bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${order.status === 'Pendente' ? 'border-orange-200 bg-orange-50/5' : 'border-slate-200'}`}>
                    {order.status === 'Pendente' && <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full -mr-1 -mt-1"></div>}
                    
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg shrink-0 ${order.type === 'Preventiva' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                            <Wrench size={24} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-base font-bold text-slate-800 truncate pr-2">{order.description}</h3>
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wide shrink-0 ${getStatusBadge(order.status)}`}>
                                    {order.status === 'Aguardando Dono' ? 'Aprovação' : order.status}
                                </span>
                            </div>
                            
                            <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                                <span className="font-medium text-slate-700 bg-slate-100 px-1.5 rounded">
                                    {vehicles.find(v => v.id === order.vehicleId)?.plate || 'N/A'}
                                </span>
                                <span>• {vehicles.find(v => v.id === order.vehicleId)?.model}</span>
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3 mt-3">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-slate-400"/>
                                    {new Date(order.date).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <AlertOctagon size={14} className={order.type === 'Corretiva' ? 'text-red-500' : 'text-blue-500'}/>
                                    {order.type}
                                </div>
                                <div className="ml-auto font-bold text-slate-800 text-sm">
                                    R$ {order.cost.toLocaleString('pt-BR')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Approval Logic */}
                        {(order.status === 'Pendente' || order.status === 'Aguardando Dono') && (
                            currentUser.role === 'OWNER' ? (
                                <button 
                                    onClick={() => onApproveMaintenance(order.id)}
                                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 flex items-center gap-1"
                                >
                                    <Check size={12} /> Aprovar
                                </button>
                            ) : currentUser.role === 'MANAGER' && order.status === 'Pendente' ? (
                                <button 
                                    onClick={() => onApproveMaintenance(order.id)}
                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-1"
                                >
                                    <Send size={12} /> Solicitar
                                </button>
                            ) : null
                        )}

                        <button 
                            onClick={() => handleOpenEdit(order)}
                            className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-200 flex items-center gap-1"
                        >
                            <Edit size={12} /> Editar
                        </button>

                        {canDelete && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteMaintenance(order.id); }}
                                className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 flex items-center gap-1"
                            >
                                <Trash2 size={12} /> Excluir
                            </button>
                        )}
                    </div>
                </div>
                ))}
            </div>
        )}
      </div>

      {/* MODAL: ADD/EDIT MAINTENANCE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">
                {editingOrderId ? 'Atualizar Ordem de Serviço' : 'Nova Ordem de Serviço'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
                <select 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  value={formData.vehicleId || ''}
                  onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                  disabled={!!editingOrderId} // Disable vehicle change on edit
                >
                  <option value="">Selecione um veículo</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Serviço</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Ex: Troca de óleo, Reparo de freios"
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                    >
                      <option value="Preventiva">Preventiva</option>
                      <option value="Corretiva">Corretiva</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Aguardando Dono">Aguardando Dono</option>
                      <option value="Aprovado">Aprovado</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Recusado">Recusado</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Custo Estimado/Final (R$)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="0.00"
                    value={formData.cost || ''}
                    onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Agendada</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {editingOrderId ? 'Atualizar' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
