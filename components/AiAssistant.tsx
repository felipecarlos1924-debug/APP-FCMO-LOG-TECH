import React, { useState } from 'react';
import { generateFleetAnalysis } from '../services/geminiService';
import { Vehicle, FuelLog, MaintenanceOrder } from '../types';
import { Sparkles, BrainCircuit, FileText, RefreshCw } from 'lucide-react';

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
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-8 rounded-xl shadow-lg text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BrainCircuit className="text-indigo-400" size={32} />
              <h2 className="text-3xl font-bold">FCMO Intel</h2>
            </div>
            <p className="text-indigo-200 max-w-2xl">
              Nossa inteligência artificial analisa milhões de pontos de dados para encontrar desperdícios, 
              prever quebras e otimizar o lucro da sua frota em segundos.
            </p>
          </div>
          <button 
            onClick={handleGenerateAnalysis}
            disabled={loading}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-lg transition-all
              ${loading 
                ? 'bg-indigo-800 text-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-500 hover:bg-indigo-400 text-white hover:scale-105'
              }
            `}
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
            {loading ? 'Processando dados...' : 'Gerar Relatório Estratégico'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-slate-400" />
            Resultado da Análise
          </h3>
          {analysis && (
             <span className="text-xs text-slate-400">Gerado agora via Gemini AI</span>
          )}
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
          {!analysis && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <BrainCircuit size={64} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium">Aguardando solicitação...</p>
              <p className="text-sm">Clique no botão acima para iniciar a auditoria da frota.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-32 bg-slate-200 rounded w-full mt-6"></div>
            </div>
          )}

          {analysis && !loading && (
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                {analysis}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};