import React, { useState } from 'react';
import { generateFleetAnalysis } from '../services/geminiService';
import { Vehicle, FuelLog, MaintenanceOrder } from '../types';
import { FileText, RefreshCw, BarChart, Clipboard } from 'lucide-react';

interface AiAssistantProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  maintenance: MaintenanceOrder[];
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ vehicles, fuelLogs, maintenance }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    const result = await generateFleetAnalysis(vehicles, fuelLogs, maintenance);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="bg-slate-900 p-8 rounded-xl shadow-lg text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart className="text-blue-400" size={32} />
              <h2 className="text-3xl font-bold">Relatório Analítico</h2>
            </div>
            <p className="text-slate-400 max-w-2xl">
              Gere insights automáticos baseados nos dados de abastecimento, manutenção e telemetria da sua frota.
            </p>
          </div>
          <button 
            onClick={handleGenerateAnalysis}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-lg transition-all ${loading ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Clipboard />}
            {loading ? 'Processando...' : 'Gerar Análise Agora'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText size={20} /> Diagnóstico Operacional</h3>
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
          {!analysis && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Clipboard size={64} className="mb-4 opacity-20" />
              <p>Clique no botão para processar o diagnóstico da frota.</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-line text-slate-700 leading-relaxed font-sans">
                {analysis}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};