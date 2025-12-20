import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types.ts';
import { Activity, Navigation, Thermometer, Gauge, Zap, Box, Anchor, AlertTriangle, Satellite, Car, LocateFixed, Minus, Clock, User, ArrowRight, Layers, Power } from 'lucide-react';

declare global {
  interface Window {
    L: any; // Leaflet Global
  }
}

interface TelemetryModuleProps {
  vehicles: Vehicle[];
}

export const TelemetryModule: React.FC<TelemetryModuleProps> = ({ vehicles }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isEngineOn, setIsEngineOn] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const trailsRef = useRef<Record<string, any>>({});
  
  const [fleetStatus, setFleetStatus] = useState<Record<string, { lat: number, lng: number, speed: number, rpm: number, temp: number, fuel: number, mileage: number, history: [number, number][] }>>({});

  // Sincroniza dados iniciais
  useEffect(() => {
    const initialStatus: any = {};
    vehicles.forEach(v => {
      const existing = fleetStatus[v.id];
      initialStatus[v.id] = existing || {
        lat: v.latitude || -15.653342,
        lng: v.longitude || -55.988658,
        speed: v.currentSpeed || 0,
        rpm: v.rpm || 0,
        temp: v.engineTemp || 25,
        fuel: v.fuelLevel || 50,
        mileage: v.mileage || 0,
        history: [[v.latitude || -15.653342, v.longitude || -55.988658]]
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
      }).setView([-15.653342, -55.988658], 16);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      window.L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstance.current = map;

      setTimeout(() => map.invalidateSize(), 300);
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

  // Marcadores e Trails
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    vehicles.forEach(v => {
        if (markersRef.current[v.id]) {
          // Atualiza o ícone com base na ignição se for o veículo selecionado
          if (selectedVehicle?.id === v.id) {
            const iconColor = isEngineOn ? '#10b981' : '#64748b';
            const iconHtml = createMarkerHtml(v.plate, iconColor, isEngineOn);
            const newIcon = window.L.divIcon({
                className: 'custom-vehicle-marker',
                html: iconHtml,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            markersRef.current[v.id].setIcon(newIcon);
          }
          return;
        }

        const iconColor = (v.id === selectedVehicle?.id && isEngineOn) ? '#10b981' : '#64748b';
        const iconHtml = createMarkerHtml(v.plate, iconColor, isEngineOn && v.id === selectedVehicle?.id);
        const icon = window.L.divIcon({
            className: 'custom-vehicle-marker',
            html: iconHtml,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const lat = v.latitude || -15.653342;
        const lng = v.longitude || -55.988658;

        const marker = window.L.marker([lat, lng], { icon }).addTo(mapInstance.current);
        marker.on('click', () => {
           setSelectedVehicle(v);
           mapInstance.current.flyTo(marker.getLatLng(), 17);
        });
        markersRef.current[v.id] = marker;
    });
  }, [vehicles, isEngineOn, selectedVehicle]);

  const createMarkerHtml = (plate: string, color: string, active: boolean) => `
    <div style="width: 40px; height: 40px; position: relative; display: flex; align-items: center; justify-content: center;">
       ${active ? `<div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: pulse 2s infinite;"></div>` : ''}
       <div style="z-index: 10; display: flex; align-items: center; justify-content: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.5));">
             <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
          </svg>
       </div>
       <div style="position: absolute; top: -15px; background: white; color: black; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.2); white-space: nowrap; border: 1px solid #e2e8f0;">
          ${plate}
       </div>
    </div>
  `;

  // Simulação de telemetria sem drift de GPS quando parado
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setFleetStatus(prev => {
        const next = { ...prev };
        let changed = false;

        vehicles.forEach(v => {
           const current = next[v.id];
           if (!current) return;

           // Só simula RPM e Temp se o motor estiver ligado e for o selecionado
           const engineOn = (v.id === selectedVehicle?.id) ? isEngineOn : (v.status === 'Ativo');
           
           next[v.id] = {
             ...current,
             rpm: engineOn ? 850 + (Math.random() * 20) : 0,
             temp: engineOn ? Math.min(92, current.temp + 0.1) : Math.max(25, current.temp - 0.1),
             speed: (engineOn && v.status === 'Em Viagem') ? 60 + (Math.random() * 5) : 0,
             // GPS TRAVADO: Removemos o drift aleatório para a localização "bater" sempre
           };
           changed = true;
        });

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, isEngineOn, selectedVehicle, vehicles]);

  const currentData = (selectedVehicle && fleetStatus[selectedVehicle.id]) ? fleetStatus[selectedVehicle.id] : {
    lat: -15.653342, lng: -55.988658, speed: 0, rpm: 0, temp: 25, fuel: 88, mileage: 89000, history: []
  };

  return (
    <div className="flex h-full w-full relative bg-slate-100">
       {/* Painel de Lista Lateral */}
       <div className={`absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ${isOverlayMinimized ? 'w-12 h-12' : 'w-72 max-h-[calc(100%-8rem)]'}`}>
          <div className="p-3 bg-slate-900 text-white flex justify-between items-center cursor-pointer" onClick={() => setIsOverlayMinimized(!isOverlayMinimized)}>
             <div className="flex items-center gap-2">
               <Navigation size={18} className="text-blue-400" />
               {!isOverlayMinimized && <span className="font-bold text-sm">Monitoramento GPS</span>}
             </div>
             {!isOverlayMinimized && <Minus size={16} />}
          </div>
          {!isOverlayMinimized && (
            <div className="flex-1 overflow-y-auto">
              {vehicles.map(v => (
                <button 
                  key={v.id} 
                  onClick={() => { setSelectedVehicle(v); mapInstance.current.flyTo([v.latitude, v.longitude], 17); }}
                  className={`w-full p-3 border-b text-left flex justify-between items-center ${selectedVehicle?.id === v.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                >
                  <div>
                    <span className="block font-bold text-sm">{v.plate}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{v.model}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${v.id === selectedVehicle?.id && isEngineOn ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {v.id === selectedVehicle?.id && isEngineOn ? 'LIGADO' : 'DESLIGADO'}
                  </span>
                </button>
              ))}
            </div>
          )}
       </div>

       {/* Mapa */}
       <div ref={mapRef} className="w-full h-full z-0"></div>

       {/* Dashboard Inferior */}
       {selectedVehicle && (
         <div className="absolute bottom-6 left-6 right-6 z-[1000] bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up">
            <div className="flex items-center gap-4">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white transition-all ${isEngineOn ? 'bg-green-600 shadow-green-200' : 'bg-slate-800 shadow-slate-200'}`}>
                  <Car size={28} />
               </div>
               <div>
                  <h3 className="font-black text-xl text-slate-800 leading-none">{selectedVehicle.plate}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
                    {selectedVehicle.driver} • {selectedVehicle.model}
                  </p>
               </div>
            </div>

            <div className="flex flex-1 justify-around w-full max-w-2xl border-x border-slate-100 px-4">
               <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Velocidade</p>
                  <p className="text-2xl font-mono font-black text-slate-800">{Math.round(currentData.speed)} <span className="text-xs">km/h</span></p>
               </div>
               <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Rotação</p>
                  <p className="text-2xl font-mono font-black text-slate-800">{Math.round(currentData.rpm)} <span className="text-xs">RPM</span></p>
               </div>
               <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Temperatura</p>
                  <p className="text-2xl font-mono font-black text-slate-800">{currentData.temp.toFixed(1)}°C</p>
               </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
               <button 
                  onClick={() => setIsEngineOn(!isEngineOn)}
                  className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black text-sm text-white transition-all flex items-center gap-2 shadow-lg ${isEngineOn ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}
               >
                  <Power size={18} /> {isEngineOn ? 'DESLIGAR MOTOR' : 'LIGAR MOTOR'}
               </button>
               <button 
                  onClick={() => mapInstance.current.flyTo([selectedVehicle.latitude, selectedVehicle.longitude], 18)}
                  className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600"
                  title="Focar Veículo"
               >
                  <LocateFixed size={20} />
               </button>
            </div>
         </div>
       )}

       <style>{`
          @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.7; } 70% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
          .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
       `}</style>
    </div>
  );
};