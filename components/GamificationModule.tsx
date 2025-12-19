import React from 'react';
import { DriverProfile } from '../types';
import { Trophy, Medal, Star, TrendingUp, TrendingDown, Minus, Zap, ShieldCheck, Leaf, CheckSquare } from 'lucide-react';

interface GamificationModuleProps {
  drivers: DriverProfile[];
}

export const GamificationModule: React.FC<GamificationModuleProps> = ({ drivers }) => {
  // Sort drivers by monthly score
  const sortedDrivers = [...drivers].sort((a, b) => b.monthlyScore - a.monthlyScore);
  const topDriver = sortedDrivers[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Liga de Motoristas FCMO</h2>
          <p className="text-slate-500 mt-1">Incentivando segurança, economia e pontualidade.</p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-200">
          <Trophy size={20} className="text-yellow-300" />
          <span className="font-bold">Ciclo Atual: Novembro/2023</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Medal className="text-blue-500" />
                Ranking Geral
              </h3>
              <span className="text-sm text-slate-500">Atualizado hoje às 08:00</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Posição</th>
                    <th className="px-6 py-4">Motorista</th>
                    <th className="px-6 py-4 text-center">Nível</th>
                    <th className="px-6 py-4 text-center">Score Mensal</th>
                    <th className="px-6 py-4 text-center">Tendência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedDrivers.map((driver, index) => (
                    <tr key={driver.id} className={`hover:bg-slate-50 transition-colors ${index === 0 ? 'bg-yellow-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Medal size={24} className="text-yellow-500" />}
                          {index === 1 && <Medal size={24} className="text-slate-400" />}
                          {index === 2 && <Medal size={24} className="text-amber-700" />}
                          {index > 2 && <span className="w-6 text-center font-bold text-slate-400">#{index + 1}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={driver.avatar} alt={driver.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                          <div>
                            <p className="font-bold text-slate-800">{driver.name}</p>
                            <p className="text-xs text-slate-500">{driver.badges.length} conquistas</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Lvl {driver.level}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${driver.monthlyScore}%` }}></div>
                          </div>
                          <span className="font-bold text-slate-800">{driver.monthlyScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {driver.rankChange === 'up' && <TrendingUp size={18} className="text-green-500 mx-auto" />}
                        {driver.rankChange === 'down' && <TrendingDown size={18} className="text-red-500 mx-auto" />}
                        {driver.rankChange === 'same' && <Minus size={18} className="text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Metrics Explanation Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
               <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                 <ShieldCheck size={20} />
               </div>
               <h4 className="font-bold text-slate-800">Segurança</h4>
               <p className="text-xs text-slate-500 mt-1">Pontos por evitar frenagens bruscas e excesso de velocidade.</p>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
               <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                 <Leaf size={20} />
               </div>
               <h4 className="font-bold text-slate-800">Economia</h4>
               <p className="text-xs text-slate-500 mt-1">Bônus por manter a média de consumo acima da meta do veículo.</p>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
               <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                 <CheckSquare size={20} />
               </div>
               <h4 className="font-bold text-slate-800">Checklist</h4>
               <p className="text-xs text-slate-500 mt-1">Pontualidade no envio de checklists e report de manutenções.</p>
             </div>
          </div>
        </div>

        {/* Right Column: Highlights & Rewards */}
        <div className="space-y-6">
          
          {/* Top Driver Card */}
          <div className="bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Trophy size={120} />
             </div>
             <div className="relative z-10">
               <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-2">Destaque do Mês</p>
               <div className="flex items-center gap-4 mb-6">
                 <img src={topDriver.avatar} alt="Top Driver" className="w-16 h-16 rounded-full border-4 border-white/30" />
                 <div>
                   <h3 className="text-2xl font-bold">{topDriver.name}</h3>
                   <div className="flex items-center gap-1 text-yellow-300">
                     <Star size={16} fill="currentColor" />
                     <span className="font-bold">{topDriver.monthlyScore} pontos</span>
                   </div>
                 </div>
               </div>
               
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-indigo-100">Segurança</span>
                   <span className="font-bold">{topDriver.safetyScore}/100</span>
                 </div>
                 <div className="w-full bg-indigo-900/30 rounded-full h-1.5">
                   <div className="bg-green-400 h-full rounded-full" style={{ width: `${topDriver.safetyScore}%` }}></div>
                 </div>

                 <div className="flex justify-between items-center text-sm pt-2">
                   <span className="text-indigo-100">Eficiência</span>
                   <span className="font-bold">{topDriver.efficiencyScore}/100</span>
                 </div>
                 <div className="w-full bg-indigo-900/30 rounded-full h-1.5">
                   <div className="bg-blue-400 h-full rounded-full" style={{ width: `${topDriver.efficiencyScore}%` }}></div>
                 </div>
               </div>
             </div>
          </div>

          {/* Rewards Catalog Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Zap className="text-yellow-500" />
              Recompensas Disponíveis
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-2xl shadow-sm">🎫</div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">Voucher R$ 100</p>
                  <p className="text-xs text-slate-500">Supermercado ou Combustível</p>
                </div>
                <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100">
                  2.500 pts
                </button>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-2xl shadow-sm">🧢</div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">Kit FCMO Premium</p>
                  <p className="text-xs text-slate-500">Boné + Camiseta + Garrafa</p>
                </div>
                <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100">
                  1.200 pts
                </button>
              </div>
              <div className="text-center mt-2">
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Ver catálogo completo</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};