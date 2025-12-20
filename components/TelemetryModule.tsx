import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types.ts';
import { Navigation, Car, LocateFixed, Power, MapPin, Gauge, Thermometer, ShieldCheck, ChevronUp, Radio, Signal, Wifi, Activity } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface TelemetryModuleProps {
  vehicles: Vehicle[];
}

export const TelemetryModule: React.FC<TelemetryModuleProps> = ({ vehicles }) => {
  const truckPlate = 'NMT-5678';
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles.find(v => v.plate === truckPlate) || vehicles[0]);
  const [isEngineOn, setIsEngineOn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [telemetry, setTelemetry] = useState({
    rpm: 0,
    temp: 24,
    speed: 0,
    signal: 4
  });

  // Inicializa Mapa
  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;

    // Localização Exata Solicitada (Cuiabá)
    const lat = -15.653342;
    const lng = -55.988658;

    mapInstance.current = window.L.map(mapRef.current, {
       zoomControl: false,
       attributionControl: false,
       maxZoom: 18,
       tap: true
    }).setView([lat, lng], 17);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

    // Corrigir bug de tamanho no mobile
    setTimeout(() => {
      if (mapInstance.current) mapInstance.current.invalidateSize();
    }, 500);

    return () => {
       if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
       }
    };
  }, []); 

  // Atualizar Marcador e Pulsação
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    const lat = -15.653342;
    const lng = -55.988658;
    const color = isEngineOn ? '#10b981' : '#3b82f6';
    
    const iconHtml = `
      <div style="width: 44px; height: 44px; position: relative; display: flex; align-items: center; justify-content: center;">
         ${isEngineOn ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: pulse 1.5s infinite;"></div>` : ''}
         <div style="z-index: 10; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${color}" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
            </svg>
         </div>
      </div>
    `;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(window.L.divIcon({
          className: 'custom-vehicle-marker',
          html: iconHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
      }));
    } else {
      markerRef.current = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
              className: 'custom-vehicle-marker',
              html: iconHtml,
              iconSize: [44, 44],
              iconAnchor: [22, 22]
          })
      }).addTo(mapInstance.current);
    }
  }, [isEngineOn]);

  // Telemetria Simulada e Estável
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        rpm: isEngineOn ? 860 + (Math.random() * 12) : 0,
        temp: isEngineOn ? Math.min(88, prev.temp + 0.05) : Math.max(26, prev.temp - 0.1),
        speed: 0 // Mantendo parado para teste
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEngineOn]);

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-900 overflow-hidden">
       
       {/* HEADER COMPACTO PARA MOBILE */}
       <div className="absolute top-0 left-0 right-0 px-4 py-6 bg-gradient-to-b from-slate-900/95 via-slate-900/60 to-transparent z-[1000] flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all ${isEngineOn ? 'bg-green-600 ring-4 ring-green-600/20' : 'bg-blue-600 ring-4 ring-blue-600/20'}`}>
                <Car size={26} />
             </div>
             <div className="drop-shadow-lg">
                <h1 className="text-white font-black text-xl leading-none tracking-tighter">{selectedVehicle?.plate}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className={`w-2 h-2 rounded-full ${isEngineOn ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                   <p className="text-[11px] font-black uppercase text-slate-200 tracking-widest">{isEngineOn ? 'Motor Operante' : 'Standby'}</p>
                </div>
             </div>
          </div>
          
          <div className="flex flex-col gap-2 pointer-events-auto">
             <button 
                onClick={() => mapInstance.current?.flyTo([-15.653342, -55.988658], 18)} 
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl active:scale-90 transition-transform"
             >
                <LocateFixed size={24} />
             </button>
          </div>
       </div>

       {/* MAPA FULLSCREEN */}
       <div className="flex-1 relative z-0">
          <div ref={mapRef} className="w-full h-full grayscale-[0.2] brightness-[0.8] contrast-[1.1]"></div>
          
          {/* Status Bar Flutuante */}
          <div className="absolute top-24 left-4 flex gap-2 z-[1000]">
             <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                <Signal size={12} className="text-green-500" />
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">HD GPS</span>
             </div>
             <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                <Activity size={12} className="text-blue-500" />
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">TELEMETRIA ATIVA</span>
             </div>
          </div>
       </div>

       {/* PAINEL INFERIOR (BOTTOM SHEET) */}
       <div className={`absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-100px)]'}`}>
          
          {/* BARRA DE ARRASTE */}
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full pt-4 pb-6 flex flex-col items-center cursor-pointer"
          >
             <div className="w-16 h-1.5 bg-slate-200 rounded-full mb-2"></div>
             {!isExpanded && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ver Painel</span>}
          </div>

          <div className="px-8 pb-10 overflow-hidden">
             {!isEngineOn ? (
               <div className="text-center py-6 animate-fade-in">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-50">
                     <Power size={40} className="text-slate-300" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Sistema Desligado</h2>
                  <p className="text-slate-500 text-sm px-6 leading-relaxed mb-8">
                    Aguardando partida do motor para iniciar o monitoramento em tempo real.
                  </p>
                  
                  <button 
                     onClick={() => setIsEngineOn(true)}
                     className="w-full bg-blue-600 active:bg-blue-800 text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-blue-200 flex items-center justify-center gap-4 transition-all"
                  >
                     <Power size={24} /> LIGAR MOTOR
                  </button>
               </div>
             ) : (
               <div className="animate-slide-up">
                  {/* MÉTRICAS PRINCIPAIS (FIX DE SOBREPOSIÇÃO) */}
                  <div className="grid grid-cols-2 gap-6 mb-8 border-b border-slate-100 pb-8">
                     <div className="flex flex-col items-start border-r border-slate-100 pr-4">
                        <p className="text-[11px] text-slate-400 font-black uppercase mb-1 tracking-widest">Velocidade</p>
                        <div className="flex items-baseline">
                           <span className="text-5xl font-black text-slate-900 tracking-tighter">00</span>
                           <span className="text-sm text-slate-400 font-black ml-2">km/h</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-start pl-4">
                        <p className="text-[11px] text-slate-400 font-black uppercase mb-1 tracking-widest">Rotação</p>
                        <div className="flex items-baseline">
                           <span className="text-5xl font-black text-green-600 tracking-tighter">{Math.round(telemetry.rpm)}</span>
                           <span className="text-sm text-slate-400 font-black ml-2">RPM</span>
                        </div>
                     </div>
                  </div>

                  {/* MINI CARDS DE INFO */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-slate-50 p-4 rounded-[22px] border border-slate-100 flex items-center gap-3">
                        <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl"><Thermometer size={20} /></div>
                        <div>
                           <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Motor</span>
                           <p className="text-base font-black text-slate-800 tracking-tighter">{telemetry.temp.toFixed(1)}°C</p>
                        </div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-[22px] border border-slate-100 flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl"><ShieldCheck size={20} /></div>
                        <div>
                           <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistema</span>
                           <p className="text-base font-black text-slate-800 tracking-tighter">OK</p>
                        </div>
                     </div>
                  </div>

                  {/* LOCALIZAÇÃO ATUAL */}
                  <div className="bg-slate-900 text-white p-4 rounded-[22px] mb-8 flex items-center gap-4 shadow-lg">
                     <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                        <MapPin size={20} className="text-blue-400" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Posição Fixa</span>
                        <p className="text-sm font-bold truncate">Rodovia BR-163 - Cuiabá, MT</p>
                     </div>
                  </div>

                  <button 
                     onClick={() => setIsEngineOn(false)}
                     className="w-full bg-red-50 active:bg-red-100 text-red-600 py-4 rounded-[20px] font-black text-sm border border-red-100 flex items-center justify-center gap-2 transition-colors active:scale-95"
                  >
                     <Power size={18} /> DESLIGAR CAMINHÃO
                  </button>
               </div>
             )}
          </div>
       </div>

       <style>{`
          @keyframes pulse { 0% { transform: scale(0.9); opacity: 1; } 70% { transform: scale(1.8); opacity: 0; } 100% { transform: scale(0.9); opacity: 0; } }
          .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
       `}</style>
    </div>
  );
};