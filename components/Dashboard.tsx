import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { Vehicle, FuelLog, MaintenanceOrder } from '../types';
import { DollarSign, AlertTriangle, Activity, TrendingUp, TrendingDown, Truck, Package, Clock } from 'lucide-react';

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

  const data = [
    { name: 'Seg', custo: 4200 },
    { name: 'Ter', custo: 3100 },
    { name: 'Qua', custo: 2400 },
    { name: 'Qui', custo: 2980 },
    { name: 'Sex', custo: 1950 },
    { name: 'Sab', custo: 2500 },
    { name: 'Dom', custo: 3600 },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Header com Alto Contraste */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Visão <span className="text-blue-600">Operacional</span>
          </h2>
          <p className="text-slate-500 font-medium mt-3 text-lg">Resumo estratégico da frota e custos logísticos.</p>
        </div>
        <div className="bg-white px-8 py-5 rounded-[28px] border border-slate-200 shadow-sm flex flex-col items-start md:items-end">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Custo Total Consolidado</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-slate-400">R$</span>
            <span className="text-4xl font-black text-slate-900 tracking-tighter">
              {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards - Reestilizados para clareza total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard 
          label="Custo por KM" 
          value="R$ 4,82" 
          trend="+2.4%" 
          trendType="down"
          icon={<DollarSign size={24} />}
          color="blue"
        />
        <KpiCard 
          label="Consumo Médio" 
          value="2.4 km/L" 
          trend="-0.1%" 
          trendType="up"
          icon={<Activity size={24} />}
          color="orange"
        />
        <KpiCard 
          label="Disponibilidade" 
          value={`${Math.round((activeVehicles/vehicles.length)*100)}%`} 
          trend="Estável" 
          trendType="neutral"
          icon={<Truck size={24} />}
          color="green"
        />
        <KpiCard 
          label="Paradas OS" 
          value={maintenanceVehicles} 
          trend={`${maintenanceVehicles} pendentes`} 
          trendType="down"
          icon={<Clock size={24} />}
          color="red"
        />
      </div>

      {/* Gráficos com contraste reforçado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                Fluxo de Custos Diários
             </h3>
             <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">NOV/2023</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800, color: '#0f172a' }}
                />
                <Bar dataKey="custo" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#2563eb' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                Eficiência Logística
             </h3>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Tempo Real</span>
             </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontWeight: 800 }} />
                <Line 
                  type="monotone" 
                  dataKey="custo" 
                  stroke="#10b981" 
                  strokeWidth={5} 
                  dot={{r: 6, strokeWidth: 3, fill: '#fff', stroke: '#10b981'}} 
                  activeDot={{r: 10, strokeWidth: 0, fill: '#10b981'}} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, trend, trendType, icon, color }: any) => {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100"
  };

  return (
    <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-200 flex flex-col justify-between hover:scale-[1.02] transition-all cursor-default">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl border ${colorMap[color]}`}>
          {icon}
        </div>
        <div className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
          trendType === 'up' ? 'text-green-600 bg-green-50' : 
          trendType === 'down' ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-50'
        }`}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
      </div>
    </div>
  );
}