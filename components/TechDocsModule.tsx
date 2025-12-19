
import React, { useState } from 'react';
import { Shield, Database, Layout, Lock, Server, Layers, FileCode, CheckCircle, Smartphone, Map, Radio, Box, CreditCard } from 'lucide-react';

export const TechDocsModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '1. Visão Geral', icon: Layout },
    { id: 'tracking', label: '2. GPS & Telemetria', icon: Map },
    { id: 'logistics', label: '3. Logística & App', icon: Box },
    { id: 'technical', label: '4. Arquitetura & Segurança', icon: Server },
  ];

  return (
    <div className="flex h-full gap-6 animate-fade-in text-slate-800">
      {/* Sidebar Docs */}
      <div className="w-64 flex flex-col gap-2 shrink-0">
        <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Relatório Técnico</h2>
        <p className="text-xs text-slate-500 px-2 mb-4">FCMO LOG TECH - Spec v2.4</p>
        
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }
              `}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
        
        <div className="mt-auto p-4 bg-slate-100 rounded-lg text-xs text-slate-500 border border-slate-200">
          <p className="font-bold text-slate-700 mb-1">Status do Projeto</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Produção (Estável)</span>
          </div>
          <p>Build: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-8 overflow-y-auto h-full">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-4xl">
              <div className="border-b border-slate-100 pb-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">FCMO LOG TECH</h1>
                <p className="text-xl text-slate-500">Sistema de Logística + Armazenagem + Monitoramento GPS + Telemetria</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                   <CheckCircle size={20} /> 1. Objetivo do Sistema
                </h3>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                  Criar um ecossistema completo para transporte, armazenagem, monitoramento de frota e pagamentos digitais.
                  A solução unifica o rastreamento em tempo real (GPS/Telemetria) com a gestão administrativa (ERP Logístico),
                  oferecendo uma interface moderna, segura e escalável.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <div className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 transition-colors">
                      <strong className="block text-slate-800 mb-1">Para o Gestor</strong>
                      <span className="text-sm text-slate-600">Visão total da frota, custos, manutenção e telemetria em tempo real.</span>
                   </div>
                   <div className="p-4 border border-slate-200 rounded-lg hover:bg-green-50 transition-colors">
                      <strong className="block text-slate-800 mb-1">Para o Motorista</strong>
                      <span className="text-sm text-slate-600">App nativo com rotas, checklist digital e carteira de pagamentos.</span>
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                 <h3 className="text-lg font-bold text-slate-800">Principais Funcionalidades</h3>
                 <ul className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Rastreamento GPS em Tempo Real</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Telemetria Avançada (RPM, Temp, Combustível)</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Gestão de Rotas e Cercas Eletrônicas</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Controle de Manutenção Preditiva</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> App do Motorista com Checklist</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Inteligência Artificial para Análise de Custos</li>
                 </ul>
              </div>
            </div>
          )}

          {/* TAB 2: TRACKING */}
          {activeTab === 'tracking' && (
            <div className="space-y-8 max-w-4xl">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Map size={24} /></div>
                 <h2 className="text-2xl font-bold text-slate-800">2. Rastreamento & Telemetria</h2>
               </div>

               {/* GPS Section */}
               <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Tecnologia GPS Híbrida</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2"><Smartphone size={16}/> Via Celular (App)</h4>
                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                           <li>GPS Nativo (Google Location Services)</li>
                           <li>Update: 3-10 segundos</li>
                           <li>Background Mode (Tela desligada)</li>
                           <li>Detecção de Fake GPS</li>
                        </ul>
                     </div>
                     <div>
                        <h4 className="font-bold text-orange-600 mb-2 flex items-center gap-2"><Radio size={16}/> Via Hardware (OBD2/Isca)</h4>
                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                           <li>Protocolos: Teltonika (Codec8), Suntech, Coban</li>
                           <li>Conexão direta na ECU (CAN BUS)</li>
                           <li>Bateria de backup interna</li>
                        </ul>
                     </div>
                  </div>
               </div>

               {/* Telemetry Section */}
               <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">3. Telemetria & Status do Motor</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                     <div className="bg-white p-3 rounded shadow-sm text-center">
                        <span className="block text-xs text-slate-400 uppercase font-bold">Leitura</span>
                        <span className="font-bold text-slate-800">RPM / Odo</span>
                     </div>
                     <div className="bg-white p-3 rounded shadow-sm text-center">
                        <span className="block text-xs text-slate-400 uppercase font-bold">Sensores</span>
                        <span className="font-bold text-slate-800">Temp. Motor/Baú</span>
                     </div>
                     <div className="bg-white p-3 rounded shadow-sm text-center">
                        <span className="block text-xs text-slate-400 uppercase font-bold">Ignição</span>
                        <span className="font-bold text-green-600">ON / OFF / OCIOSO</span>
                     </div>
                     <div className="bg-white p-3 rounded shadow-sm text-center">
                        <span className="block text-xs text-slate-400 uppercase font-bold">Carga</span>
                        <span className="font-bold text-blue-600">Vazio / Carregado</span>
                     </div>
                  </div>
                  
                  <h4 className="font-bold text-sm text-slate-700 mb-2">Alertas Inteligentes Configurados:</h4>
                  <div className="flex flex-wrap gap-2">
                     {['Excesso de Velocidade', 'Motor Ocioso > 10min', 'Desvio de Rota', 'Saída de Cerca Virtual', 'Temperatura Crítica', 'Bateria Baixa'].map(tag => (
                        <span key={tag} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded border border-red-200">{tag}</span>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {/* TAB 3: LOGISTICS */}
          {activeTab === 'logistics' && (
             <div className="space-y-8 max-w-4xl">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Box size={24} /></div>
                 <h2 className="text-2xl font-bold text-slate-800">3. Logística, Rotas & App</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                     <h3 className="font-bold text-lg text-slate-800 mb-3">4. Gestão de Rotas</h3>
                     <p className="text-sm text-slate-600 mb-4">Integração nativa com Google Maps Directions API para roteirização inteligente.</p>
                     <ul className="text-sm text-slate-600 space-y-2">
                        <li>✅ Cálculo automático de ETA (Tempo Estimado)</li>
                        <li>✅ Janelas de entrega configuráveis</li>
                        <li>✅ Monitoramento de desvios em tempo real</li>
                        <li>✅ Replay de rota (Histórico)</li>
                     </ul>
                  </div>

                  <div className="p-5 border border-slate-200 rounded-xl shadow-sm hover:border-green-300 transition-colors">
                     <h3 className="font-bold text-lg text-slate-800 mb-3">6. Armazenagem (WMS Lite)</h3>
                     <p className="text-sm text-slate-600 mb-4">Controle de entrada e saída de mercadorias nas filiais.</p>
                     <ul className="text-sm text-slate-600 space-y-2">
                        <li>✅ Controle de validade e lote</li>
                        <li>✅ Alertas de nível mínimo de estoque</li>
                        <li>✅ Auditoria de movimentações</li>
                     </ul>
                  </div>
               </div>

               <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg mt-6">
                  <div className="flex items-start justify-between">
                     <div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Smartphone /> 9. Aplicativo do Motorista</h3>
                        <p className="text-slate-400 text-sm mb-4 max-w-md">
                           Ferramenta essencial para a ponta da operação. Disponível para Android (Kotlin) e integrado ao sistema web.
                        </p>
                     </div>
                     <div className="bg-white/10 px-4 py-2 rounded text-xs font-mono">v2.3.0 Stable</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-4">
                     <div className="bg-white/5 p-3 rounded hover:bg-white/10 transition">
                        <span className="block font-bold text-sm">Checklist Digital</span>
                        <span className="text-xs text-slate-400">Com fotos obrigatórias</span>
                     </div>
                     <div className="bg-white/5 p-3 rounded hover:bg-white/10 transition">
                        <span className="block font-bold text-sm">Jornada</span>
                        <span className="text-xs text-slate-400">Controle de horas</span>
                     </div>
                     <div className="bg-white/5 p-3 rounded hover:bg-white/10 transition">
                        <span className="block font-bold text-sm">Chat Seguro</span>
                        <span className="text-xs text-slate-400">Com a central</span>
                     </div>
                     <div className="bg-white/5 p-3 rounded hover:bg-white/10 transition">
                        <span className="block font-bold text-sm">POD</span>
                        <span className="text-xs text-slate-400">Prova de Entrega</span>
                     </div>
                  </div>
               </div>
               
               <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <CreditCard className="text-yellow-600 shrink-0 mt-1" />
                  <div>
                     <h4 className="font-bold text-yellow-800 text-sm">10. Módulo Financeiro (BETA)</h4>
                     <p className="text-xs text-yellow-700 mt-1">
                        Integração para pagamentos automáticos de motoristas via Pix, repasse para terceiros e emissão de extratos fiscais para exportação (XML/NFe).
                     </p>
                  </div>
               </div>
             </div>
          )}

          {/* TAB 4: TECHNICAL */}
          {activeTab === 'technical' && (
             <div className="space-y-8 max-w-4xl">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-slate-800 text-white rounded-lg"><Server size={24} /></div>
                 <h2 className="text-2xl font-bold text-slate-800">4. Arquitetura & Segurança</h2>
               </div>

               <div className="space-y-6">
                  <div className="border-l-4 border-green-500 pl-4 py-1">
                     <h3 className="font-bold text-lg text-slate-800">7. Segurança Cibernética</h3>
                     <p className="text-sm text-slate-600 mt-2">
                        Implementação rigorosa de padrões de segurança corporativa.
                     </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                           <strong className="text-sm text-slate-800 flex items-center gap-2"><Lock size={14}/> Autenticação</strong>
                           <span className="text-xs text-slate-500 block mt-1">MFA (2FA) Obrigatório, Sessões JWT com rotação.</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                           <strong className="text-sm text-slate-800 flex items-center gap-2"><Shield size={14}/> Dados</strong>
                           <span className="text-xs text-slate-500 block mt-1">Criptografia AES-256 no banco e TLS 1.3 no trânsito.</span>
                        </div>
                     </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-1">
                     <h3 className="font-bold text-lg text-slate-800">11. Stack Tecnológico & Arquitetura</h3>
                     
                     <div className="mt-4 bg-slate-900 text-slate-300 p-6 rounded-lg font-mono text-xs overflow-x-auto">
{`
[CLIENTE WEB]       [CLIENTE MOBILE]      [IOT DEVICES]
(React/Vite)        (Kotlin/Android)      (OBD2/Trackers)
      |                    |                     |
      +---------+----------+                     |
                |                          (MQTT/TCP)
          [API GATEWAY] <------------------------+
                |
    +-----------+-----------+
    |                       |
[CORE SERVICES]      [TELEMETRY ENGINE]
(Node.js API)        (Ingestion/Processing)
    |                       |
[POSTGRESQL]           [REDIS CACHE]
(Dados Relacionais)    (Real-time Buffer)
    |
[GOOGLE GEMINI AI]
(Análise de Frotas)
`}
                     </div>
                     
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                           <span className="text-xs font-bold text-slate-500 uppercase">Frontend</span>
                           <p className="text-sm font-bold text-slate-800">React 18 + TS</p>
                        </div>
                        <div>
                           <span className="text-xs font-bold text-slate-500 uppercase">Backend</span>
                           <p className="text-sm font-bold text-slate-800">Node.js / NestJS</p>
                        </div>
                        <div>
                           <span className="text-xs font-bold text-slate-500 uppercase">Database</span>
                           <p className="text-sm font-bold text-slate-800">PostgreSQL</p>
                        </div>
                        <div>
                           <span className="text-xs font-bold text-slate-500 uppercase">Maps API</span>
                           <p className="text-sm font-bold text-slate-800">Google Maps</p>
                        </div>
                     </div>
                  </div>
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
