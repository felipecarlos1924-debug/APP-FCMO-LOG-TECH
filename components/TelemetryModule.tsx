import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types.ts';
import { Navigation, Car, LocateFixed, Power, Smartphone, MapPin, Gauge, Thermometer, ShieldCheck } from 'lucide-react';

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
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(true);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  
  const [fleetStatus, setFleetStatus] = useState<Record<string, { lat: number, lng: number, speed: number, rpm: number, temp: number, fuel: number, mileage: number }>>({});

  // Detecta mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sincroniza dados iniciais COM PRECISÃO ABSOLUTA
  useEffect(() => {
    const initialStatus: any = {};
    vehicles.forEach(v => {
      initialStatus[v.id] = {
        lat: v.latitude || -15.653342,
        lng: v.longitude || -55.988658,
        speed: 0,
        rpm: 0,
        temp: 25,
        fuel: v.fuelLevel || 88,
        mileage: v.mileage || 89000
      };
    });
    setFleetStatus(initialStatus);
  }, [vehicles]);

  // Inicializa Mapa
  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;

    try {
      const map = window.L.map(mapRef.current, {
         zoomControl: false,
         attributionControl: false,
         maxZoom: 18
      }).setView([-15.653342, -55.988658], 17);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 500);
    } catch (e) {
      console.error("Erro mapa:", e);
    }

    return () => {
       if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
       }
    };
  }, []); 

  // Atualiza Marcadores
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    vehicles.forEach(v => {
        const isSelf = selectedVehicle?.id === v.id;
        const color = (isSelf && isEngineOn) ? '#10b981' : (isSelf ? '#3b82f6' : '#94a3b8');
        
        if (markersRef.current[v.id]) {
            markersRef.current[v.id].setLatLng([v.latitude, v.longitude]);
            markersRef.current[v.id].setIcon(window.L.divIcon({
                className: 'custom-vehicle-marker',
                html: createMarkerHtml(v.plate, color, isSelf && isEngineOn),
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            }));
            return;
        }

        const marker = window.L.marker([v.latitude, v.longitude], {
            icon: window.L.divIcon({
                className: 'custom-vehicle-marker',
                html: createMarkerHtml(v.plate, color, false),
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        }).addTo(mapInstance.current);

        marker.on('click', () => setSelectedVehicle(v));
        markersRef.current[v.id] = marker;
    });
  }, [vehicles, isEngineOn, selectedVehicle]);

  const createMarkerHtml = (plate: string, color: string, active: boolean) => `
    <div style="width: 40px; height: 40px; position: relative; display: flex; align-items: center; justify-content: center;">
       ${active ? `<div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(16, 185, 129, 0.3); animation: pulse 1.5s infinite;"></div>` : ''}
       <div style="z-index: 10;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
          </svg>
       </div>
       <div style="position: absolute; top: -18px; background: ${color}; color: white; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); white-space: nowrap;">
          ${plate}
       </div>
    </div>
  `;

  // Telemetria Simulada (Motor ON/OFF)
  useEffect(() => {
    const interval = setInterval(() => {
      setFleetStatus(prev => {
        const next = { ...prev };
        vehicles.forEach(v => {
           const current = next[v.id];
           if (!current) return;
           const engine = (v.id === selectedVehicle?.id) ? isEngineOn : false;
           
           next[v.id] = {
             ...current,
             rpm: engine ? 850 + (Math.random() * 15) : 0,
             temp: engine ? Math.min(90, current.temp + 0.2) : Math.max(25, current.temp - 0.1),
             speed: 0 // Garantindo que o caminhão não ande sozinho no sistema
           };
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isEngineOn, selectedVehicle, vehicles]);

  const currentData = (selectedVehicle && fleetStatus[selectedVehicle.id]) ? fleetStatus[selectedVehicle.id] : {
    lat: -15.653342, lng: -55.988658, speed: 0, rpm: 0, temp: 25, fuel: 88, mileage: 89000
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-900 overflow-hidden">
       
       {/* HEADER MOBILE */}
       <div className="bg-slate-900 p-4 border-b border-white/10 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <Car size={24} />
             </div>
             <div>
                <h1 className="text-white font-black text-lg leading-none">{selectedVehicle?.plate}</h1>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">Status: {isEngineOn ? 'Operante' : 'Ignição Desligada'}</p>
             </div>
          </div>
          <button onClick={() => mapInstance.current?.flyTo([-15.653342, -55.988658], 18)} className="p-2 bg-white/5 rounded-full text-white">
             <LocateFixed size={20} />
          </button>
       </div>

       {/* MAPA PRINCIPAL */}
       <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full grayscale-[0.2] brightness-[0.9]"></div>
          
          {/* BOTÃO FLUTUANTE LISTA */}
          <button 
             onClick={() => setIsOverlayMinimized(!isOverlayMinimized)}
             className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-2xl shadow-xl border border-slate-200"
          >
             <Navigation size={20} className="text-slate-800" />
          </button>
       </div>

       {/* PAINEL DE CONTROLE / TELA DE IGNIÇÃO */}
       <div className={`absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] transition-all duration-500 transform ${isEngineOn ? 'translate-y-0' : 'translate-y-[10%]'}`}>
          
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3"></div>

          <div className="p-6 pt-2">
             {!isEngineOn ? (
               <div className="text-center py-6 animate-fade-in">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-slate-50">
                     <Power size={40} className="text-slate-300" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">Caminhão Pronto</h2>
                  <p className="text-slate-500 text-sm mb-8">Pressione o botão para iniciar a telemetria em tempo real.</p>
                  
                  <button 
                     onClick={() => setIsEngineOn(true)}
                     className="w-full bg-blue-600 active:scale-95 text-white py-5 rounded-3xl font-black text-xl shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3"
                  >
                     <Power size={24} /> LIGAR CAMINHÃO
                  </button>
               </div>
             ) : (
               <div className="animate-slide-up">
                  <div className="flex justify-between items-center mb-8">
                     <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Velocidade</p>
                        <p className="text-3xl font-mono font-black text-slate-900">00<span className="text-xs text-slate-400">km/h</span></p>
                     </div>
                     <div className="h-10 w-px bg-slate-100"></div>
                     <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Rotação</p>
                        <p className="text-3xl font-mono font-black text-green-600">{Math.round(currentData.rpm)}<span className="text-xs text-slate-400">RPM</span></p>
                     </div>
                     <div className="h-10 w-px bg-slate-100"></div>
                     <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Temperatura</p>
                        <p className="text-3xl font-mono font-black text-slate-900">{currentData.temp.toFixed(0)}<span className="text-xs text-slate-400">°C</span></p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                           <MapPin size={14} className="text-blue-500" />
                           <span className="text-[10px] font-black text-slate-400 uppercase">Localização Atual</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 truncate">Rod. Emanuel Pinheiro, Cuiabá - MT</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                           <ShieldCheck size={14} className="text-green-500" />
                           <span className="text-[10px] font-black text-slate-400 uppercase">Checklist Diário</span>
                        </div>
                        <p className="text-xs font-bold text-green-600">Concluído Hoje</p>
                     </div>
                  </div>

                  <button 
                     onClick={() => setIsEngineOn(false)}
                     className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black text-sm border border-red-100 flex items-center justify-center gap-2"
                  >
                     <Power size={18} /> DESLIGAR MOTOR
                  </button>
               </div>
             )}
          </div>
       </div>

       <style>{`
          @keyframes pulse { 0% { transform: scale(0.95); opacity: 1; } 70% { transform: scale(1.6); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
          .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
       `}</style>
    </div>
  );
};