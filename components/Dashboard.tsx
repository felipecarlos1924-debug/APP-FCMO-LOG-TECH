import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { Vehicle, FuelLog, MaintenanceOrder } from '../types';
import { DollarSign, AlertTriangle, Activity, TrendingUp, TrendingDown, Truck } from 'lucide-react';

interface DashboardProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  maintenance: MaintenanceOrder[];
}

export const Dashboard: React.FC<DashboardProps> = ({ vehicles, fuelLogs, maintenance }) => {
  const totalFuelCost = fuelLogs.reduce((acc, log) => acc + log.cost, 0);
  const totalMaintCost = maintenance.reduce((acc, ord) => acc + ord.cost, 0);
  const totalCost = totalFuelCost + totalMaintCost;
  
  const activeVehicles = vehicles.filter(v => v.status === 'Ativo' || v.status === 'Em Viagem').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'Manutenção').length;

  const avgConsumption = "2.4"; 

  const data = [
    { name: 'Seg', custo: 4000 },
    { name: 'Ter', custo: 3000 },
    { name: 'Qua', custo: 2000 },
    { name: 'Qui', custo: 2780 },
    { name: 'Sex', custo: 1890 },
    { name: 'Sab', custo: 2390 },
    { name: 'Dom', custo: 3490 },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">Status <span className="text-blue-600">Geral</span></h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Relatórios operacionais FCMO LOG TECH.</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm w-full md:w-auto flex flex-col items-start md:items-end">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Acumulado (Mês)</p>
          <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">
            R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* KPI Cards - Empilhamento mobile robusto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between active:scale-[0.98] transition-transform">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gasto Diário</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">R$ 1.450</h3>
            <span className="text-[10px] font-black text-red-500 flex items-center mt-2 bg-red-50 px-2 py-1 rounded-lg"><TrendingUp size={12} className="mr-1"/> +5% vs ontem</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner shadow-blue-100">
            <Activity size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between active:scale-[0.98] transition-transform">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Média Frota</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{avgConsumption} <span className="text-sm text-slate-400">km/L</span></h3>
            <span className="text-[10px] font-black text-orange-600 flex items-center mt-2 bg-orange-50 px-2 py-1 rounded-lg"><AlertTriangle size={12} className="mr-1"/> Meta: 2.8</span>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-inner shadow-orange-100">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between active:scale-[0.98] transition-transform">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frota Ativa</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activeVehicles} <span className="text-sm text-slate-400">unid.</span></h3>
            <span className="text-[10px] font-black text-green-600 flex items-center mt-2 bg-green-50 px-2 py-1 rounded-lg">Logística OK</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl shadow-inner shadow-green-100">
            <Truck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between active:scale-[0.98] transition-transform">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manutenção</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{maintenanceVehicles} <span className="text-sm text-slate-400">parados</span></h3>
            <span className="text-[10px] font-black text-red-600 flex items-center mt-2 bg-red-50 px-2 py-1 rounded-lg">Ação Urgente</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-inner shadow-red-100">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Gráficos Reagentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[350px] md:h-[450px]">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest">Investimento Semanal</h3>
             <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 uppercase">Valores em R$</span>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                cursor={{fill: '#f8fafc'}}
              />
              <Bar dataKey="custo" radius={[10, 10, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[350px] md:h-[450px]">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest">Curva Operacional</h3>
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase">Lucratividade</span>
             </div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip 
                 contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="custo" 
                stroke="#10b981" 
                strokeWidth={4} 
                dot={{r: 5, strokeWidth: 3, fill: '#fff'}} 
                activeDot={{r: 8, strokeWidth: 4}} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};