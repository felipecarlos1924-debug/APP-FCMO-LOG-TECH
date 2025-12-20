import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types.ts';
import { Activity, Navigation, Thermometer, Gauge, Zap, Box, Anchor, AlertTriangle, Satellite, Car, LocateFixed, Minus, Clock, User, ArrowRight } from 'lucide-react';

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
  
  const [fleetStatus, setFleetStatus] = useState<Record<string, { lat: number, lng: number, speed: number, rpm: number, temp: number, fuel: number, history: [number, number][] }>>({});

  useEffect(() => {
    if (vehicles.length === 0) {
        setSelectedVehicle(null);
        return;
    }
    if (!selectedVehicle || !vehicles.find(v => v.id === selectedVehicle.id)) {
        setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles, selectedVehicle]);

  useEffect(() => {
    const initialStatus: any = {};
    vehicles.forEach(v => {
      const existing = fleetStatus[v.id];
      initialStatus[v.id] = existing || {
        lat: v.latitude || -15.6014,
        lng: v.longitude || -56.0979,
        speed: v.currentSpeed || 0,
        rpm: v.rpm || 0,
        temp: v.engineTemp || 90,
        fuel: v.fuelLevel || 50,
        history: [[v.latitude || -15.6014, v.longitude || -56.0979]]
      };
    });
    setFleetStatus(initialStatus);
  }, [vehicles]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => console.error("Erro GPS:", error)
      );
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    if (mapInstance.current) return;

    const initialCenter = [-15.6014, -56.0979];

    try {
      const map = window.L.map(mapRef.current, {
         zoomControl: false,
         attributionControl: false
      }).setView(initialCenter, 14);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd'
      }).addTo(map);

      window.L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstance.current = map;
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

  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    const map = mapInstance.current;

    Object.keys(markersRef.current).forEach(id => {
        if (!vehicles.find(v => v.id === id)) {
            markersRef.current[id].remove();
            delete markersRef.current[id];
        }
    });
    Object.keys(trailsRef.current).forEach(id => {
        if (!vehicles.find(v => v.id === id)) {
            trailsRef.current[id].remove();
            delete trailsRef.current[id];
        }
    });

    vehicles.forEach(v => {
        if (markersRef.current[v.id]) return;

        const pulseColor = v.status === 'Em Viagem' || v.status === 'Ativo' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)';
        
        const iconHtml = `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
             <div class="pulse-ring" style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${pulseColor}; animation: pulse 2s infinite;"></div>
             <div id="icon-${v.id}" style="transition: transform 0.8s linear; transform-origin: center center; display: flex; align-items: center; justify-content: center; z-index: 10;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.8));">
                   <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${v.status === 'Em Viagem' || v.status === 'Ativo' ? '#10b981' : '#ef4444'}" stroke="white" stroke-width="2"/>
                </svg>
             </div>
          </div>
        `;

        const icon = window.L.divIcon({
            className: 'custom-vehicle-marker',
            html: iconHtml,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const lat = v.latitude || -15.6014;
        const lng = v.longitude || -56.0979;

        const marker = window.L.marker([lat, lng], { icon }).addTo(map);
        marker.bindPopup(`<b>${v.plate}</b><br>${v.driver}`);

        marker.on('click', () => {
           setSelectedVehicle(v);
           map.setView(marker.getLatLng(), 16);
        });

        markersRef.current[v.id] = marker;
        trailsRef.current[v.id] = window.L.polyline([], { color: v.status === 'Em Viagem' || v.status === 'Ativo' ? '#10b981' : '#ef4444', weight: 3, opacity: 0.6 }).addTo(map);
    });

  }, [vehicles]);

  const centerOnUser = () => {
    if (userLocation && mapInstance.current) {
       mapInstance.current.setView([userLocation.lat, userLocation.lng], 16);
    }
  };

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setFleetStatus(prev => {
        const next = { ...prev };
        let hasChanges = false;
        
        vehicles.forEach(v => {
           if (v.status === 'Parado' || v.status === 'Manutenção') return;
           const current = next[v.id];
           if (!current) return;
           
           const latChange = (Math.random() - 0.5) * 0.0004; 
           const lngChange = (Math.random() - 0.5) * 0.0004;
           const newLat = current.lat + latChange;
           const newLng = current.lng + lngChange;

           const newHistory = [...current.history, [newLat, newLng]].slice(-20);

           next[v.id] = {
             lat: newLat,
             lng: newLng,
             speed: Math.max(0, Math.min(120, current.speed + (Math.random() * 10 - 5))),
             rpm: Math.max(600, Math.min(2500, current.rpm + (Math.random() * 200 - 100))),
             temp: Math.max(85, Math.min(105, current.temp + (Math.random() * 2 - 1))),
             fuel: Math.max(0, current.fuel - 0.002),
             history: newHistory as [number, number][]
           };
           hasChanges = true;

           if (markersRef.current[v.id]) {
             markersRef.current[v.id].setLatLng([newLat, newLng]);
           }

           if (trailsRef.current[v.id]) {
              trailsRef.current[v.id].setLatLngs(newHistory);
           }
        });
        
        return hasChanges ? next : prev;
      });
    }, 1000); 

    return () => clearInterval(interval);
  }, [isLive, vehicles]);

  const currentVehicleData = (selectedVehicle && fleetStatus[selectedVehicle.id]) ? fleetStatus[selectedVehicle.id] : {
    lat: 0, lng: 0, speed: 0, rpm: 0, temp: 0, fuel: 0, history: []
  };

  return (
    <div className="flex h-full w-full relative">
       <div className={`absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ${isOverlayMinimized ? 'w-auto h-auto' : 'w-80 max-h-[calc(100%-2rem)]'}`}>
          <div className="p-3 bg-slate-900 text-white flex justify-between items-center cursor-pointer" onClick={() => setIsOverlayMinimized(!isOverlayMinimized)}>
             <div className="flex items-center gap-2">
               <Navigation size={18} className="text-blue-400" />
               {!isOverlayMinimized && <span className="font-bold text-sm">Monitoramento GPS</span>}
             </div>
             <div>{isOverlayMinimized ? <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> : <Minus size={16} />}</div>
          </div>
          {!isOverlayMinimized && (
            <div className="flex-1 overflow-y-auto max-h-[300px]">
              {vehicles.map(vehicle => (
                <button key={vehicle.id} onClick={() => { setSelectedVehicle(vehicle); if (markersRef.current[vehicle.id] && mapInstance.current) mapInstance.current.setView(markersRef.current[vehicle.id].getLatLng(), 16); }} className={`w-full text-left p-3 border-b border-slate-100 hover:bg-slate-50 flex items-center justify-between ${selectedVehicle?.id === vehicle.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}>
                  <div>
                     <span className="block font-bold text-sm">{vehicle.plate}</span>
                     <span className="text-[10px] text-slate-500">{vehicle.model}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${vehicle.status === 'Em Viagem' || vehicle.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{fleetStatus[vehicle.id]?.speed.toFixed(0)} km/h</span>
                </button>
              ))}
            </div>
          )}
       </div>
       <div className="flex-1 bg-slate-900 relative">
          <div ref={mapRef} className="w-full h-full bg-slate-900 z-0"></div>
          {selectedVehicle && (
          <div className="absolute bottom-6 left-6 right-6 z-[1000] bg-slate-900/90 backdrop-blur text-white p-4 rounded-xl border border-slate-700 shadow-2xl flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50"><Car size={24} /></div>
                <div><h3 className="font-bold text-lg leading-tight">{selectedVehicle.plate}</h3><p className="text-xs text-slate-400">{selectedVehicle.driver}</p></div>
             </div>
             <div className="flex gap-8 text-center">
                <div><p className="text-[10px] text-slate-400 uppercase font-bold">Velocidade</p><p className="text-xl font-mono font-bold text-white">{Math.round(currentVehicleData.speed)} km/h</p></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-bold">RPM</p><p className="text-xl font-mono font-bold text-white">{Math.round(currentVehicleData.rpm)}</p></div>
                <div className="hidden md:block"><p className="text-[10px] text-slate-400 uppercase font-bold">Tanque</p><p className={`text-xl font-mono font-bold ${currentVehicleData.fuel < 20 ? 'text-red-500' : 'text-green-400'}`}>{currentVehicleData.fuel.toFixed(0)}%</p></div>
             </div>
             <div className="flex gap-2">
               <button onClick={centerOnUser} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg text-white" title="Minha Localização"><LocateFixed size={20} /></button>
               <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">Detalhes <ArrowRight size={16} /></button>
             </div>
          </div>
          )}
       </div>
    </div>
  );
};