import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types.ts';
import { Navigation, Car, LocateFixed, Power, MapPin, Gauge, Thermometer, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface TelemetryModuleProps {
  vehicles: Vehicle[];
}

export const TelemetryModule: React.FC<TelemetryModuleProps> = ({ vehicles }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles.find(v => v.plate === 'NMT-5678') || vehicles[0]);
  const [isEngineOn, setIsEngineOn] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  
  const [telemetry, setTelemetry] = useState({
    rpm: 0,
    temp: 24,
    speed: 0,
    mileage: selectedVehicle?.mileage || 0
  });

  // Detecta mobile para forçar o fechamento da sidebar se necessário (feito via CSS no Sidebar.tsx)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Inicializa Mapa
  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;

    const lat = selectedVehicle?.latitude || -15.653342;
    const lng = selectedVehicle?.longitude || -55.988658;

    mapInstance.current = window.L.map(mapRef.current, {
       zoomControl: false,
       attributionControl: false,
       maxZoom: 18
    }).setView([lat, lng], 17);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

    // Ajusta o mapa após um delay para garantir que o container está com o tamanho certo
    setTimeout(() => mapInstance.current.invalidateSize(), 300);

    return () => {
       if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
       }
    };
  }, []); 

  // Marcador do Veículo
  useEffect(() => {
    if (!mapInstance.current || !selectedVehicle || !window.L) return;

    const lat = selectedVehicle.latitude || -15.653342;
    const lng = selectedVehicle.longitude || -55.988658;

    const color = isEngineOn ? '#10b981' : '#3b82f6';
    const iconHtml = `
      <div style="width: 40px; height: 40px; position: relative; display: flex; align-items: center; justify-content: center;">
         ${isEngineOn ? `<div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(16, 185, 129, 0.3); animation: pulse 1.5s infinite;"></div>` : ''}
         <div style="z-index: 10;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
            </svg>
         </div>
      </div>
    `;

    if (markersRef.current[selectedVehicle.id]) {
      markersRef.current[selectedVehicle.id].setLatLng([lat, lng]);
      markersRef.current[selectedVehicle.id].setIcon(window.L.divIcon({
          className: 'custom-vehicle-marker',
          html: iconHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
      }));
    } else {
      const marker = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
              className: 'custom-vehicle-marker',
              html: iconHtml,
              iconSize: [40, 40],
              iconAnchor: [20, 20]
          })
      }).addTo(mapInstance.current);
      markersRef.current[selectedVehicle.id] = marker;
    }

    mapInstance.current.panTo([lat, lng]);

  }, [selectedVehicle, isEngineOn]);

  // Loop de Telemetria (Apenas visual, sem drift de GPS)
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        rpm: isEngineOn ? 850 + (Math.random() * 20) : 0,
        temp: isEngineOn ? Math.min(90, prev.temp + 0.1) : Math.max(25, prev.temp - 0.1),
        speed: 0 // Mantendo parado conforme solicitado
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEngineOn]);

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-900 overflow-hidden">
       
       {/* HEADER MOBILE COMPACTO */}
       <div className="bg-slate-900 px-4 py-3 border-b border-white/10 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors ${isEngineOn ? 'bg-green-600' : 'bg-slate-700'}`}>
                <Car size={24} />
             </div>
             <div>
                <h1 className="text-white font-black text-base leading-none tracking-tight">{selectedVehicle?.plate}</h1>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isEngineOn ? 'text-green-400' : 'text-slate-400'}`}>
                   Motor: {isEngineOn ? 'Ligado' : 'Desligado'}
                </p>
             </div>
          </div>
          <button 
             onClick={() => mapInstance.current?.flyTo([selectedVehicle?.latitude || -15.653342, selectedVehicle?.longitude || -55.988658], 18)} 
             className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white active:bg-white/20"
          >
             <LocateFixed size={20} />
          </button>
       </div>

       {/* MAPA PRINCIPAL */}
       <div className="flex-1 relative z-0">
          <div ref={mapRef} className="w-full h-full grayscale-[0.2] brightness-[0.9]"></div>
       </div>

       {/* PAINEL DE CONTROLE (BOTTOM SHEET) */}
       <div className={`absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-[2.5rem] shadow-[0_-10px_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}>
          
          {/* DRAG HANDLE */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-4 flex flex-col items-center gap-1 active:bg-slate-50 rounded-t-[2.5rem]"
          >
             <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
             {!isExpanded && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ver Telemetria</span>}
          </button>

          <div className="px-6 pb-8">
             {!isEngineOn ? (
               <div className="text-center py-4 animate-fade-in">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                     <Power size={40} className="text-slate-300" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">Pronto para Partida</h2>
                  <p className="text-slate-500 text-xs mb-8">Sincronização GPS ativa em: <br/><span className="font-mono font-bold text-slate-700">-15.653342, -55.988658</span></p>
                  
                  <button 
                     onClick={() => setIsEngineOn(true)}
                     className="w-full bg-blue-600 active:scale-95 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3"
                  >
                     <Power size={22} /> LIGAR CAMINHÃO
                  </button>
               </div>
             ) : (
               <div className="animate-slide-up">
                  {/* GRID DE TELEMETRIA SEM SOBREPOSIÇÃO */}
                  <div className="grid grid-cols-3 gap-2 mb-8">
                     <div className="text-center p-2">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Velocidade</p>
                        <div className="flex items-baseline justify-center">
                           <span className="text-2xl font-mono font-black text-slate-900 tracking-tighter">00</span>
                           <span className="text-[10px] text-slate-400 font-bold ml-0.5">km/h</span>
                        </div>
                     </div>
                     <div className="h-12 w-px bg-slate-100 self-center mx-auto"></div>
                     <div className="text-center p-2">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Rotação</p>
                        <div className="flex items-baseline justify-center">
                           <span className="text-2xl font-mono font-black text-green-600 tracking-tighter">{Math.round(telemetry.rpm)}</span>
                           <span className="text-[10px] text-slate-400 font-bold ml-0.5">RPM</span>
                        </div>
                     </div>
                  </div>

                  {/* CARDS DE INFO */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><MapPin size={16} /></div>
                        <div className="min-w-0">
                           <span className="block text-[8px] font-black text-slate-400 uppercase">Localização</span>
                           <p className="text-[11px] font-bold text-slate-700 truncate">Cuiabá - MT</p>
                        </div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-lg"><Thermometer size={16} /></div>
                        <div className="min-w-0">
                           <span className="block text-[8px] font-black text-slate-400 uppercase">Motor</span>
                           <p className="text-[11px] font-bold text-slate-700 truncate">{telemetry.temp.toFixed(1)}°C</p>
                        </div>
                     </div>
                  </div>

                  <button 
                     onClick={() => setIsEngineOn(false)}
                     className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black text-sm border border-red-100 flex items-center justify-center gap-2 active:bg-red-100 transition-colors"
                  >
                     <Power size={18} /> DESLIGAR MOTOR
                  </button>
               </div>
             )}
          </div>
       </div>

       <style>{`
          @keyframes pulse { 0% { transform: scale(0.95); opacity: 1; } 70% { transform: scale(1.6); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
          .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
       `}</style>
    </div>
  );
};