
import React, { useState } from 'react';
import { FuelLog, Vehicle, User } from '../types';
import { Droplets, TrendingDown, AlertCircle, X, Save, CheckCircle2, Clock, Trash2, ShieldCheck, Send } from 'lucide-react';

interface FuelModuleProps {
  logs: FuelLog[];
  vehicles: Vehicle[];
  onAddFuelLog: (log: FuelLog) => void;
  onApproveLog: (id: string) => void;
  onDeleteLog: (id: string) => void;
  currentUser: User;
}

export const FuelModule: React.FC<FuelModuleProps> = ({ logs, vehicles, onAddFuelLog, onApproveLog, onDeleteLog, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Permission checks
  const canApprove = currentUser.role === 'OWNER' || currentUser.role === 'MANAGER';
  const canDelete = currentUser.role === 'OWNER' || currentUser.role === 'MANAGER';
  const isDriver = currentUser.role === 'DRIVER';

  // Filter Data for Driver
  const displayedLogs = isDriver 
    ? logs.filter(log => {
        const vehicle = vehicles.find(v => v.id === log.vehicleId);
        return vehicle && vehicle.driver === currentUser.name;
      })
    : logs;
  
  // Form State
  const [newLog, setNewLog] = useState<Partial<FuelLog>>({
    date: new Date().toISOString().split('T')[0],
    status: 'Pendente'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.vehicleId || !newLog.liters || !newLog.cost) return;

    const logToAdd: FuelLog = {
      id: Math.random().toString(36).substr(2, 9),
      vehicleId: newLog.vehicleId,
      date: newLog.date || new Date().toISOString(),
      liters: Number(newLog.liters),
      cost: Number(newLog.cost),
      station: newLog.station || 'Posto Externo',
      mileage: Number(newLog.mileage) || 0,
      status: 'Pendente' // Default to pending for approval flow
    };

    onAddFuelLog(logToAdd);
    setIsModalOpen(false);
    setNewLog({ date: new Date().toISOString().split('T')[0], status: 'Pendente' });
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Combustível</h2>
          <p className="text-slate-500">Controle de abastecimentos e eficiência.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Droplets size={18} /> Novo Abastecimento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h4 className="text-slate-500 text-sm font-medium uppercase">Preço Médio / Litro</h4>
           <div className="mt-2 flex items-baseline gap-2">
             <span className="text-3xl font-bold text-slate-800">R$ 6,24</span>
             <span className="text-xs text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded">-2%</span>
           </div>
        </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h4 className="text-slate-500 text-sm font-medium uppercase">Total Litros (Mês)</h4>
           <div className="mt-2 flex items-baseline gap-2">
             <span className="text-3xl font-bold text-slate-800">{displayedLogs.reduce((acc, l) => acc + l.liters, 0).toLocaleString()} L</span>
           </div>
        </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h4 className="text-slate-500 text-sm font-medium uppercase">Alerta de Consumo</h4>
           <div className="mt-2 flex items-center gap-2 text-orange-600">
             <AlertCircle size={20} />
             <span className="font-medium">XYZ-9876 acima da meta (+12%)</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Data</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Veículo</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Posto</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Litros</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Valor Total</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{new Date(log.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                     {vehicles.find(v => v.id === log.vehicleId)?.model || 'Veículo ' + log.vehicleId} 
                     <span className="text-slate-400 text-xs ml-1">({vehicles.find(v => v.id === log.vehicleId)?.plate || 'N/A'})</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{log.station}</td>
                  <td className="px-6 py-4 text-slate-800 text-right">{log.liters} L</td>
                  <td className="px-6 py-4 text-slate-800 text-right font-medium">R$ {log.cost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td className="px-6 py-4 text-center">
                    {log.status === 'Aprovado' ? (
                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                         <CheckCircle2 size={12} /> Aprovado
                       </span>
                    ) : log.status === 'Aguardando Dono' ? (
                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                         <ShieldCheck size={12} /> Análise Dono
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                         <Clock size={12} /> Pendente
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                    {/* Owner Logic */}
                    {currentUser.role === 'OWNER' && log.status !== 'Aprovado' && (
                       <button 
                         onClick={() => onApproveLog(log.id)}
                         className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                       >
                         <CheckCircle2 size={14} /> Aprovar
                       </button>
                    )}

                    {/* Manager Logic */}
                    {currentUser.role === 'MANAGER' && log.status === 'Pendente' && (
                       <button 
                         onClick={() => onApproveLog(log.id)}
                         className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
                       >
                         <Send size={14} /> Solicitar Autorização
                       </button>
                    )}

                    {/* Display info for others/already processed */}
                    {!canApprove && log.status === 'Pendente' && (
                        <span className="text-xs text-slate-400 italic">Aguardando Análise</span>
                    )}

                    {/* DELETE Logic - Owner & Manager */}
                    {canDelete && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteLog(log.id); }}
                          className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors group"
                          title="Excluir Registro"
                        >
                          <Trash2 size={18} className="group-hover:stroke-red-600 pointer-events-none" />
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* MODAL: ADD FUEL LOG */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Registrar Abastecimento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
                <select 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newLog.vehicleId || ''}
                  onChange={e => setNewLog({...newLog, vehicleId: e.target.value})}
                >
                  <option value="">Selecione um veículo</option>
                  {/* Filter vehicle dropdown for drivers too */}
                  {vehicles
                    .filter(v => isDriver ? v.driver === currentUser.name : true)
                    .map(v => (
                    <option key={v.id} value={v.id}>{v.model} - {v.plate}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newLog.date}
                      onChange={e => setNewLog({...newLog, date: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Posto / Fornecedor</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ex: Shell Rodovia"
                      value={newLog.station || ''}
                      onChange={e => setNewLog({...newLog, station: e.target.value})}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Litros</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                      value={newLog.liters || ''}
                      onChange={e => setNewLog({...newLog, liters: Number(e.target.value)})}
                    />
                    <span className="absolute right-3 top-2 text-slate-400 text-sm">L</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
                  <div className="relative">
                     <span className="absolute left-3 top-2 text-slate-400 text-sm">R$</span>
                     <input 
                      type="number" 
                      step="0.01"
                      required
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                      value={newLog.cost || ''}
                      onChange={e => setNewLog({...newLog, cost: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">KM do Veículo (Odômetro)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="KM Atual"
                    value={newLog.mileage || ''}
                    onChange={e => setNewLog({...newLog, mileage: Number(e.target.value)})}
                  />
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
