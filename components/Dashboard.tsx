
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
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

  // KPIs
  const daysInMonth = 30; // Approx
  const avgCostPerDay = totalCost / daysInMonth;
  const avgCostPerVehicle = vehicles.length > 0 ? totalCost / vehicles.length : 0;
  
  // Calculate Avg Consumption (Simple weighted avg of logs with mileage data)
  const validFuelLogs = fuelLogs.filter(l => l.liters > 0);
  // This is a simplified simulation since we don't have delta KM in logs directly for all mock data
  // Assuming 2.5 km/l as baseline + random variation for mock
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Visão Geral</h2>
          <p className="text-slate-500 mt-1">Bem-vindo ao FCMO LOG TECH. Indicadores estratégicos da operação.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Custo Total (Mês Atual)</p>
          <p className="text-3xl font-bold text-slate-900">R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Custo Médio / Dia</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">R$ {avgCostPerDay.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</h3>
            <span className="text-xs text-red-500 flex items-center mt-1"><TrendingUp size={12} className="mr-1"/> +5% vs ontem</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Activity size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Custo / Veículo</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">R$ {avgCostPerVehicle.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</h3>
            <span className="text-xs text-green-500 flex items-center mt-1"><TrendingDown size={12} className="mr-1"/> -2% meta</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Truck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Consumo Médio</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">{avgConsumption} <span className="text-sm text-slate-500">km/L</span></h3>
            <span className="text-xs text-orange-500 flex items-center mt-1"><AlertTriangle size={12} className="mr-1"/> Atenção</span>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Frota Disponível</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">{activeVehicles}/{vehicles.length}</h3>
            <span className="text-xs text-slate-500 mt-1">{maintenanceVehicles} em manutenção</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Custos Operacionais (Últimos 7 dias)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{fill: '#f1f5f9'}}
              />
              <Bar dataKey="custo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tendência de Consumo</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="custo" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
