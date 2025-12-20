import React, { useState } from 'react';
import { Vehicle, FuelLog, MaintenanceOrder, FinancialTransaction } from '../types';
import { MOCK_FINANCIAL } from '../constants';
import { FileText, BarChart2, DollarSign, User, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend, ComposedChart, Line } from 'recharts';

interface ReportsModuleProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  maintenance: MaintenanceOrder[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ vehicles, fuelLogs, maintenance }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'financial'>('general');
  const [transactions] = useState<FinancialTransaction[]>(MOCK_FINANCIAL);

  // --- DATA PREPARATION ---
  const costByVehicle = vehicles.map(v => {
    const fuelCost = fuelLogs.filter(f => f.vehicleId === v.id).reduce((acc, curr) => acc + curr.cost, 0);
    const maintCost = maintenance.filter(m => m.vehicleId === v.id).reduce((acc, curr) => acc + curr.cost, 0);
    return {
      name: v.plate,
      fuel: fuelCost,
      maintenance: maintCost,
      total: fuelCost + maintCost
    };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  const statusDistribution = [
    { name: 'Ativo', value: vehicles.filter(v => v.status === 'Ativo' || v.status === 'Em Viagem').length, color: '#10b981' },
    { name: 'Manutenção', value: vehicles.filter(v => v.status === 'Manutenção').length, color: '#f97316' },
    { name: 'Parado', value: vehicles.filter(v => v.status === 'Parado').length, color: '#64748b' },
  ].filter(d => d.value > 0);

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const cashFlowData = [
    { name: 'Set', income: 18000, expense: 12000, profit: 6000 },
    { name: 'Out', income: 22000, expense: 15000, profit: 7000 },
    { name: 'Nov', income: totalIncome, expense: totalExpense, profit: netProfit },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Relatórios</h2>
           <p className="text-slate-500">Métricas consolidadas da operação.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
           <button 
             onClick={() => setActiveTab('general')}
             className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'general' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <BarChart2 size={16} /> Operacional
           </button>
           <button 
             onClick={() => setActiveTab('financial')}
             className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'financial' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <DollarSign size={16} /> Financeiro
           </button>
        </div>
      </div>

      {activeTab === 'general' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
               <h3 className="font-bold text-slate-800 mb-6">Custos por Veículo</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={costByVehicle} layout="vertical" margin={{ left: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fontWeight: 'bold'}} />
                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                   <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                      {costByVehicle.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
                      ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
               <h3 className="font-bold text-slate-800 mb-6">Disponibilidade</h3>
               <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                      {statusDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </RePieChart>
               </ResponsiveContainer>
            </div>
         </div>
      )}

      {activeTab === 'financial' && (
         <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">Receita</p>
                  <h3 className="text-2xl font-bold text-green-600">R$ {totalIncome.toLocaleString('pt-BR')}</h3>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">Despesas</p>
                  <h3 className="text-2xl font-bold text-red-600">R$ {totalExpense.toLocaleString('pt-BR')}</h3>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">Resultado</p>
                  <h3 className="text-2xl font-bold text-blue-600">R$ {netProfit.toLocaleString('pt-BR')}</h3>
               </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="income" name="Receita" fill="#10b981" barSize={20} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Despesa" fill="#ef4444" barSize={20} radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="profit" name="Lucro" stroke="#3b82f6" strokeWidth={3} />
                  </ComposedChart>
               </ResponsiveContainer>
            </div>
         </div>
      )}
    </div>
  );
};