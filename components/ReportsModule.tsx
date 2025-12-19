
import React, { useState } from 'react';
import { askFleetAssistant } from '../services/geminiService';
import { Vehicle, FuelLog, MaintenanceOrder, FinancialTransaction } from '../types';
import { MOCK_FINANCIAL } from '../constants';
import { Sparkles, BrainCircuit, FileText, RefreshCw, BarChart2, PieChart, Download, Calendar, DollarSign, TrendingDown, Send, User, Bot, TrendingUp, CreditCard, FileSpreadsheet, Eye, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend, ComposedChart, Line } from 'recharts';

interface ReportsModuleProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  maintenance: MaintenanceOrder[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ vehicles, fuelLogs, maintenance }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'ai'>('ai');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(MOCK_FINANCIAL);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Olá! Sou o assistente da sua frota. Posso analisar custos, manutenções e identificar veículos problemáticos. Como posso ajudar hoje?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // --- DATA PREPARATION FOR INSTANT CHARTS ---
  const costByVehicle = vehicles.map(v => {
    const fuelCost = fuelLogs.filter(f => f.vehicleId === v.id).reduce((acc, curr) => acc + curr.cost, 0);
    const maintCost = maintenance.filter(m => m.vehicleId === v.id).reduce((acc, curr) => acc + curr.cost, 0);
    return {
      name: v.plate,
      fuel: fuelCost,
      maintenance: maintCost,
      total: fuelCost + maintCost
    };
  }).sort((a, b) => b.total - a.total).slice(0, 5); // Top 5 Spenders

  const statusDistribution = [
    { name: 'Ativo', value: vehicles.filter(v => v.status === 'Ativo' || v.status === 'Em Viagem').length, color: '#10b981' },
    { name: 'Manutenção', value: vehicles.filter(v => v.status === 'Manutenção').length, color: '#f97316' },
    { name: 'Parado', value: vehicles.filter(v => v.status === 'Parado').length, color: '#64748b' },
  ].filter(d => d.value > 0);

  // --- FINANCIAL CALCULATIONS ---
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Financial Chart Data (Mock Monthly)
  const cashFlowData = [
    { name: 'Set', income: 18000, expense: 12000, profit: 6000 },
    { name: 'Out', income: 22000, expense: 15000, profit: 7000 },
    { name: 'Nov', income: totalIncome, expense: totalExpense, profit: netProfit },
  ];

  // --- HANDLERS ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setLoadingChat(true);

    const answer = await askFleetAssistant(userMsg, vehicles, fuelLogs, maintenance);
    
    setChatMessages(prev => [...prev, { role: 'assistant', text: answer }]);
    setLoadingChat(false);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Central de Relatórios</h2>
           <p className="text-slate-500">Métricas consolidadas e inteligência de dados.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
           <button 
             onClick={() => setActiveTab('general')}
             className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'general' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <BarChart2 size={16} /> Operacional
           </button>
           <button 
             onClick={() => setActiveTab('financial')}
             className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'financial' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <DollarSign size={16} /> Financeiro (DRE)
           </button>
           <button 
             onClick={() => setActiveTab('ai')}
             className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'ai' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <BrainCircuit size={16} /> Chat IA
           </button>
        </div>
      </div>

      {/* TAB: GENERAL / OPERATIONAL */}
      {activeTab === 'general' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Top Cost Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
               <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <TrendingDown size={20} className="text-red-500" />
                 Veículos com Maior Custo (Top 5)
               </h3>
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

            {/* Status Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
               <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <PieChart size={20} className="text-slate-500" />
                 Disponibilidade da Frota
               </h3>
               <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </RePieChart>
               </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                   <div>
                      <p className="text-sm text-slate-500">Total de Manutenções</p>
                      <h3 className="text-3xl font-bold text-slate-800">{maintenance.length}</h3>
                   </div>
                   <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><FileText size={24}/></div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                   <div>
                      <p className="text-sm text-slate-500">Média Km/L Frota</p>
                      <h3 className="text-3xl font-bold text-slate-800">2.4 <span className="text-sm text-slate-400">km/L</span></h3>
                   </div>
                   <div className="p-3 bg-green-50 rounded-lg text-green-600"><TrendingDown size={24}/></div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                   <div className="w-full">
                      <p className="text-sm text-slate-500 mb-2">Exportar Dados</p>
                      <button className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition flex items-center justify-center gap-2">
                         <Download size={16} /> Baixar Relatório (CSV)
                      </button>
                   </div>
                </div>
            </div>
         </div>
      )}

      {/* TAB: FINANCIAL (DRE GERENCIAL) */}
      {activeTab === 'financial' && (
         <div className="animate-fade-in space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-sm font-bold uppercase mb-2">Receita Bruta</p>
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-bold text-green-600">R$ {totalIncome.toLocaleString('pt-BR')}</h3>
                     <div className="p-2 bg-green-100 text-green-600 rounded-lg"><TrendingUp size={20}/></div>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-sm font-bold uppercase mb-2">Despesas Operacionais</p>
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-bold text-red-600">R$ {totalExpense.toLocaleString('pt-BR')}</h3>
                     <div className="p-2 bg-red-100 text-red-600 rounded-lg"><TrendingDown size={20}/></div>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-sm font-bold uppercase mb-2">Lucro Líquido</p>
                  <div className="flex items-center justify-between">
                     <div className="flex items-baseline gap-2">
                        <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {netProfit.toLocaleString('pt-BR')}</h3>
                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{profitMargin.toFixed(1)}% Margem</span>
                     </div>
                     <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><DollarSign size={20}/></div>
                  </div>
               </div>
            </div>

            {/* DRE Chart & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
                  <h3 className="font-bold text-slate-800 mb-6">Fluxo de Caixa (DRE Gerencial)</h3>
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="income" name="Receita" fill="#10b981" barSize={20} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Despesa" fill="#ef4444" barSize={20} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="profit" name="Lucro" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
               
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                  <h3 className="font-bold text-slate-800 mb-4">Ações Rápidas</h3>
                  <button className="w-full mb-3 bg-slate-800 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors">
                     <FileSpreadsheet size={18} /> Novo Lançamento
                  </button>
                  <button className="w-full mb-3 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                     <Download size={18} /> Exportar DRE (PDF)
                  </button>
                  <div className="mt-auto p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                     <p className="text-sm text-yellow-800 font-bold mb-1 flex items-center gap-2"><CreditCard size={14} /> Contas a Pagar</p>
                     <p className="text-xs text-yellow-700">Você tem 2 boletos vencendo esta semana. Total: R$ 4.800,00</p>
                  </div>
               </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-lg">Extrato de Lançamentos</h3>
                  <div className="flex gap-2">
                     <input type="date" className="border rounded px-2 py-1 text-sm bg-slate-50" />
                  </div>
               </div>
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Descrição</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4">Método</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Valor</th>
                        <th className="px-6 py-4 text-center">Nota</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 text-slate-600">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                           <td className="px-6 py-4 font-bold text-slate-800">{t.description}</td>
                           <td className="px-6 py-4 text-slate-600">{t.category}</td>
                           <td className="px-6 py-4 text-slate-500 text-xs">{t.paymentMethod}</td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                 {t.status === 'PAID' ? 'Pago' : 'Pendente'}
                              </span>
                           </td>
                           <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                              {t.type === 'INCOME' ? '+ ' : '- '}R$ {t.amount.toLocaleString('pt-BR')}
                           </td>
                           <td className="px-6 py-4 text-center">
                              <button 
                                 onClick={() => setSelectedTransaction(t)}
                                 className="text-slate-400 hover:text-blue-600 transition-colors"
                                 title="Ver Nota"
                              >
                                 <FileText size={18} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* INVOICE / NOTE MODAL */}
      {selectedTransaction && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">Detalhes do Lançamento</h3>
                  <button onClick={() => setSelectedTransaction(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="text-center mb-6">
                     <p className="text-sm text-slate-500 uppercase tracking-widest mb-1">Valor Total</p>
                     <h2 className={`text-3xl font-bold ${selectedTransaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {selectedTransaction.amount.toLocaleString('pt-BR')}
                     </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-slate-50 p-3 rounded">
                        <span className="block text-slate-400 text-xs">Data</span>
                        <span className="font-bold text-slate-700">{new Date(selectedTransaction.date).toLocaleDateString('pt-BR')}</span>
                     </div>
                     <div className="bg-slate-50 p-3 rounded">
                        <span className="block text-slate-400 text-xs">Categoria</span>
                        <span className="font-bold text-slate-700">{selectedTransaction.category}</span>
                     </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                     <p className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Nota / Documento
                     </p>
                     {selectedTransaction.documentNumber ? (
                        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                           <p className="text-xs text-yellow-800 font-bold uppercase mb-1">Nota Fiscal Eletrônica</p>
                           <p className="font-mono text-slate-800 text-lg">{selectedTransaction.documentNumber}</p>
                           <p className="text-xs text-slate-500 mt-2">Emitido para FCMO Transportes LTDA</p>
                        </div>
                     ) : (
                        <div className="bg-slate-50 p-4 rounded-lg text-center text-slate-400 italic">
                           Sem documento fiscal anexado.
                        </div>
                     )}
                  </div>

                  <button 
                     onClick={() => setSelectedTransaction(null)}
                     className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors"
                  >
                     Fechar
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* TAB: AI CHATBOT */}
      {activeTab === 'ai' && (
        <div className="animate-fade-in flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           {/* Header */}
           <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
              <BrainCircuit size={24} />
              <div>
                 <h3 className="font-bold">FCMO Intel Chat</h3>
                 <p className="text-xs text-indigo-200">Pergunte sobre custos, manutenções e frota.</p>
              </div>
           </div>

           {/* Messages Area */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {chatMessages.map((msg, idx) => (
                 <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-700 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                       {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-lg max-w-[80%] text-sm leading-relaxed whitespace-pre-line ${
                       msg.role === 'user' 
                       ? 'bg-slate-700 text-white rounded-tr-none' 
                       : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                    }`}>
                       {msg.text}
                    </div>
                 </div>
              ))}
              {loadingChat && (
                 <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Bot size={16} /></div>
                    <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-tl-none shadow-sm flex items-center gap-2">
                       <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                       <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                 </div>
              )}
           </div>

           {/* Input Area */}
           <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   placeholder="Ex: Qual veículo gastou mais combustível este mês?"
                   className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
                 <button 
                   type="submit"
                   disabled={loadingChat || !chatInput.trim()}
                   className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
                 >
                    <Send size={20} />
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
