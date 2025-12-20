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
  const [isLive, setIsLive] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const trailsRef = useRef<Record<string, any>>({});
  
  const [fleetStatus, setFleetStatus] = useState<Record<string, { lat: number, lng: number, speed: number, rpm: number, temp: number, fuel: number, mileage: number, history: [number, number][] }>>({});

  // Efeito para sincronizar os dados iniciais dos veículos
  useEffect(() => {
    const initialStatus: any = {};
    vehicles.forEach(v => {
      const existing = fleetStatus[v.id];
      initialStatus[v.id] = existing || {
        lat: v.latitude || -15.5960,
        lng: v.longitude || -56.0960,
        speed: v.currentSpeed || 0,
        rpm: v.rpm || 0,
        temp: v.engineTemp || 90,
        fuel: v.fuelLevel || 50,
        mileage: v.mileage || 0,
        history: [[v.latitude || -15.5960, v.longitude || -56.0960]]
      };
    });
    setFleetStatus(initialStatus);
  }, [vehicles]);

  // Busca localização do usuário (Navegador)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => console.error("Erro GPS:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Inicialização do Mapa com Leaflet
  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;

    try {
      const map = window.L.map(mapRef.current, {
         zoomControl: false,
         attributionControl: false,
         maxZoom: 18
      }).setView([-15.653342, -55.988658], 15);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      window.L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstance.current = map;

      setTimeout(() => map.invalidateSize(), 300);

      if (vehicles.length > 0) {
        const bounds = vehicles.map(v => [v.latitude || -15.5960, v.longitude || -56.0960]);
        map.fitBounds(bounds, { padding: [100, 100] });
      }
    } catch (e) {
      console.error("Erro ao inicializar mapa:", e);
    }

    return () => {
       if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
       }
    };
  }, []); 

  // Gerenciamento de Marcadores e Trilhas
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    const map = mapInstance.current;

    vehicles.forEach(v => {
        if (markersRef.current[v.id]) return;

        const isMoving = v.status === 'Em Viagem' || v.status === 'Ativo';
        const iconColor = isMoving ? '#10b981' : '#ef4444';
        
        const iconHtml = `
          <div style="width: 40px; height: 40px; position: relative; display: flex; align-items: center; justify-content: center;">
             <div class="pulse-ring" style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${isMoving ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}; animation: pulse 2s infinite;"></div>
             <div style="z-index: 10; display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.5));">
                   <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${iconColor}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
                </svg>
             </div>
             <div style="position: absolute; top: -15px; background: white; color: black; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.2); white-space: nowrap; border: 1px solid #e2e8f0;">
                ${v.plate}
             </div>
          </div>
        `;

        const icon = window.L.divIcon({
            className: 'custom-vehicle-marker',
            html: iconHtml,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const lat = v.latitude || -15.5960;
        const lng = v.longitude || -56.0960;

        const marker = window.L.marker([lat, lng], { icon }).addTo(map);
        
        marker.on('click', () => {
           setSelectedVehicle(v);
           map.flyTo(marker.getLatLng(), 16, { duration: 1 });
        });

        markersRef.current[v.id] = marker;
        trailsRef.current[v.id] = window.L.polyline([], { 
          color: iconColor, 
          weight: 4, 
          opacity: 0.5,
          dashArray: '5, 10'
        }).addTo(map);
    });

  }, [vehicles]);

  const centerOnUser = () => {
    if (userLocation && mapInstance.current) {
       mapInstance.current.flyTo([userLocation.lat, userLocation.lng], 16);
    }
  };

  // Simulação INTELIGENTE: Só move se tiver velocidade > 0
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setFleetStatus(prev => {
        const next = { ...prev };
        let hasChanges = false;
        
        vehicles.forEach(v => {
           const current = next[v.id];
           if (!current) return;
           
           // Se a velocidade for 0, o veículo não muda de latitude/longitude
           let newLat = current.lat;
           let newLng = current.lng;
           
           if (current.speed > 0) {
              newLat += (Math.random() - 0.5) * 0.0001; 
              newLng += (Math.random() - 0.5) * 0.0001;
              hasChanges = true;
           }

           const newHistory = [...current.history, [newLat, newLng]].slice(-30);

           next[v.id] = {
             ...current,
             lat: newLat,
             lng: newLng,
             // Simulação leve de variação de motor se estiver ligado
             rpm: current.rpm > 0 ? Math.max(800, current.rpm + (Math.random() * 20 - 10)) : 0,
             history: newHistory as [number, number][]
           };

           if (markersRef.current[v.id]) {
             markersRef.current[v.id].setLatLng([newLat, newLng]);
           }
           if (trailsRef.current[v.id]) {
              trailsRef.current[v.id].setLatLngs(newHistory);
           }
        });
        
        return hasChanges ? next : prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, vehicles]);

  const currentVehicleData = (selectedVehicle && fleetStatus[selectedVehicle.id]) ? fleetStatus[selectedVehicle.id] : {
    lat: 0, lng: 0, speed: 0, rpm: 0, temp: 0, fuel: 0, mileage: 0, history: []
  };

  const isActuallyMoving = currentVehicleData.speed > 0;

  return (
    <div className="flex h-full w-full relative bg-slate-100">
       {/* Painel Flutuante Lateral */}
       <div className={`absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ${isOverlayMinimized ? 'w-12 h-12' : 'w-72 max-h-[calc(100%-8rem)]'}`}>
          <div 
            className="p-3 bg-slate-900 text-white flex justify-between items-center cursor-pointer select-none" 
            onClick={() => setIsOverlayMinimized(!isOverlayMinimized)}
          >
             <div className="flex items-center gap-2">
               <Navigation size={18} className="text-blue-400" />
               {!isOverlayMinimized && <span className="font-bold text-sm">Monitoramento GPS</span>}
             </div>
             <div>{isOverlayMinimized ? null : <Minus size={16} />}</div>
          </div>
          
          {!isOverlayMinimized && (
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {vehicles.map(vehicle => {
                const status = fleetStatus[vehicle.id];
                const moving = (status?.speed || 0) > 0;
                return (
                  <button 
                    key={vehicle.id} 
                    onClick={() => { 
                      setSelectedVehicle(vehicle); 
                      if (markersRef.current[vehicle.id] && mapInstance.current) {
                        mapInstance.current.flyTo(markersRef.current[vehicle.id].getLatLng(), 17);
                      }
                    }} 
                    className={`w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50 flex items-center justify-between transition-colors ${selectedVehicle?.id === vehicle.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="min-w-0 flex-1">
                       <span className="block font-bold text-sm truncate">{vehicle.plate}</span>
                       <span className="text-[10px] text-slate-500 uppercase font-medium">{vehicle.model}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${moving ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {moving ? `${status.speed.toFixed(0)} KM/H` : 'PARADO'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
       </div>

       {/* Área do Mapa */}
       <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full bg-slate-200 z-0"></div>
          
          {/* Dashboard Inferior de Telemetria */}
          {selectedVehicle && (
            <div className="absolute bottom-6 left-6 right-6 z-[1000] bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up">
               <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white transition-colors ${isActuallyMoving ? 'bg-green-600 shadow-green-200' : 'bg-slate-800 shadow-slate-200'}`}>
                    {isActuallyMoving ? <Navigation size={28} /> : <Power size={28} />}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-800 leading-none">{selectedVehicle.plate}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`w-2 h-2 rounded-full ${isActuallyMoving ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></span>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                         Status: {isActuallyMoving ? 'Em Movimento' : 'Ligado / Parado'}
                       </p>
                    </div>
                  </div>
               </div>

               <div className="flex flex-1 justify-around w-full max-w-2xl px-4 border-x border-slate-100">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Velocidade</p>
                    <p className="text-2xl font-mono font-black text-slate-800">{Math.round(currentVehicleData.speed)} <span className="text-xs">km/h</span></p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Odômetro</p>
                    <p className="text-2xl font-mono font-black text-slate-800">{currentVehicleData.mileage.toLocaleString('pt-BR')} <span className="text-xs">km</span></p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Carga</p>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-2xl font-mono font-black text-blue-600">
                        {selectedVehicle.isLoaded ? '100%' : 'VAZIO'}
                      </p>
                    </div>
                  </div>
                  <div className="text-center hidden lg:block">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Motor</p>
                    <p className="text-2xl font-mono font-black text-slate-800">{currentVehicleData.temp.toFixed(0)}°C</p>
                  </div>
               </div>

               <div className="flex gap-2 w-full md:w-auto">
                 <button 
                  onClick={centerOnUser} 
                  className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl text-slate-600 transition-colors" 
                  title="Minha Localização"
                 >
                   <LocateFixed size={20} />
                 </button>
                 <button 
                    onClick={() => {
                       if (mapInstance.current) {
                          mapInstance.current.flyTo([currentVehicleData.lat, currentVehicleData.lng], 18);
                       }
                    }}
                    className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                 >
                    Focar Veículo <LocateFixed size={18} />
                 </button>
               </div>
            </div>
          )}
       </div>

       <style>{`
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.7; }
            70% { transform: scale(1.3); opacity: 0; }
            100% { transform: scale(0.95); opacity: 0; }
          }
          .animate-slide-up {
            animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
       `}</style>
    </div>
  );
};