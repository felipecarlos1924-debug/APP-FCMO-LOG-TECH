import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types.ts';
import { Navigation, Car, LocateFixed, Power, MapPin, Gauge, Thermometer, ShieldCheck, ChevronUp, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface TelemetryModuleProps {
  vehicles: Vehicle[];
}

export const TelemetryModule: React.FC<TelemetryModuleProps> = ({ vehicles }) => {
  const truckId = 'NMT-5678';
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles.find(v => v.plate === truckId) || vehicles[0]);
  const [isEngineOn, setIsEngineOn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [telemetry, setTelemetry] = useState({
    rpm: 0,
    temp: 24,
    speed: 0
  });

  // Inicializa Mapa
  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;

    const lat = -15.653342;
    const lng = -55.988658;

    mapInstance.current = window.L.map(mapRef.current, {
       zoomControl: false,
       attributionControl: false,
       maxZoom: 18
    }).setView([lat, lng], 17);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

    // Ajusta o mapa após render
    setTimeout(() => mapInstance.current.invalidateSize(), 500);

    return () => {
       if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
       }
    };
  }, []); 

  // Marcador Dinâmico
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    const lat = -15.653342;
    const lng = -55.988658;
    const color = isEngineOn ? '#10b981' : '#3b82f6';
    
    const iconHtml = `
      <div style="width: 40px; height: 40px; position: relative; display: flex; align-items: center; justify-content: center;">
         ${isEngineOn ? `<div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(16, 185, 129, 0.3); animation: pulse 1.5s infinite;"></div>` : ''}
         <div style="z-index: 10;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
            </svg>
         </div>
      </div>
    `;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(window.L.divIcon({
          className: 'custom-vehicle-marker',
          html: iconHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
      }));
    } else {
      markerRef.current = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
              className: 'custom-vehicle-marker',
              html: iconHtml,
              iconSize: [40, 40],
              iconAnchor: [20, 20]
          })
      }).addTo(mapInstance.current);
    }
    
    mapInstance.current.panTo([lat, lng]);
  }, [isEngineOn]);

  // Simulação de Telemetria (Zero Drift no GPS)
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        rpm: isEngineOn ? 850 + (Math.random() * 15) : 0,
        temp: isEngineOn ? Math.min(88, prev.temp + 0.1) : Math.max(25, prev.temp - 0.1),
        speed: 0 // Caminhão parado conforme solicitado
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEngineOn]);

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-900 overflow-hidden">
       
       {/* HEADER MOBILE */}
       <div className="bg-slate-900 px-4 py-4 border-b border-white/10 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors ${isEngineOn ? 'bg-green-600' : 'bg-blue-600'}`}>
                <Car size={24} />
             </div>
             <div>
                <h1 className="text-white font-black text-lg leading-none tracking-tight">NMT-5678</h1>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isEngineOn ? 'text-green-400' : 'text-blue-400'}`}>
                   {isEngineOn ? 'Motor em Operação' : 'Aguardando Partida'}
                </p>
             </div>
          </div>
          <button 
             onClick={() => mapInstance.current?.flyTo([-15.653342, -55.988658], 18)} 
             className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white active:bg-white/20"
          >
             <LocateFixed size={20} />
          </button>
       </div>

       {/* MAPA PRINCIPAL */}
       <div className="flex-1 relative z-0">
          <div ref={mapRef} className="w-full h-full grayscale-[0.2] brightness-[0.9]"></div>
          
          {/* Overlay de Precisão */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm z-[1000] flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-800 tracking-tight">GPS HD: -15.653, -55.988</span>
          </div>
       </div>

       {/* PAINEL DE CONTROLE (BOTTOM SHEET) */}
       <div className={`absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-[2.5rem] shadow-[0_-15px_50px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}>
          
          {/* Barra de Arraste */}
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-4 flex flex-col items-center gap-1 active:bg-slate-50 cursor-pointer"
          >
             <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
             {!isExpanded && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ver Painel Completo</span>}
          </div>

          <div className="px-6 pb-10">
             {!isEngineOn ? (
               <div className="text-center py-6 animate-fade-in">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-slate-50">
                     <Power size={40} className="text-slate-300" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">Caminhão Desligado</h2>
                  <p className="text-slate-500 text-xs px-8 leading-relaxed mb-8">
                    A telemetria está em modo standby. Ligue o motor para iniciar o monitoramento.
                  </p>
                  
                  <button 
                     onClick={() => setIsEngineOn(true)}
                     className="w-full bg-blue-600 active:scale-95 text-white py-5 rounded-3xl font-black text-xl shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3"
                  >
                     <Power size={24} /> DAR PARTIDA
                  </button>
               </div>
             ) : (
               <div className="animate-slide-up">
                  {/* METRICAS SEM SOBREPOSIÇÃO */}
                  <div className="flex justify-between items-center mb-8 px-2">
                     <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Velocidade</p>
                        <div className="flex items-baseline justify-center">
                           <span className="text-4xl font-mono font-black text-slate-900 tracking-tighter">00</span>
                           <span className="text-xs text-slate-400 font-bold ml-1">km/h</span>
                        </div>
                     </div>
                     <div className="w-px h-12 bg-slate-100"></div>
                     <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Rotação</p>
                        <div className="flex items-baseline justify-center">
                           <span className="text-4xl font-mono font-black text-green-600 tracking-tighter">{Math.round(telemetry.rpm)}</span>
                           <span className="text-xs text-slate-400 font-bold ml-1">RPM</span>
                        </div>
                     </div>
                  </div>

                  {/* CARDS SECUNDARIOS */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-xl"><Thermometer size={18} /></div>
                        <div>
                           <span className="block text-[9px] font-black text-slate-400 uppercase">Motor</span>
                           <p className="text-sm font-bold text-slate-700 tracking-tighter">{telemetry.temp.toFixed(1)}°C</p>
                        </div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><ShieldCheck size={18} /></div>
                        <div>
                           <span className="block text-[9px] font-black text-slate-400 uppercase">Checklist</span>
                           <p className="text-sm font-bold text-slate-700 tracking-tighter">OK</p>
                        </div>
                     </div>
                  </div>

                  <button 
                     onClick={() => setIsEngineOn(false)}
                     className="w-full bg-red-50 active:bg-red-100 text-red-600 py-4 rounded-2xl font-black text-sm border border-red-100 flex items-center justify-center gap-2 transition-colors"
                  >
                     <Power size={18} /> DESLIGAR CAMINHÃO
                  </button>
               </div>
             )}
          </div>
       </div>

       <style>{`
          @keyframes pulse { 0% { transform: scale(0.95); opacity: 1; } 70% { transform: scale(1.6); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
          .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
       `}</style>
    </div>
  );
};