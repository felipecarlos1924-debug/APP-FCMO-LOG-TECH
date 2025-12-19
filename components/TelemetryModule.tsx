
import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types';
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
  
  // State for simulated live positions for ALL vehicles
  const [fleetStatus, setFleetStatus] = useState<Record<string, { lat: number, lng: number, speed: number, rpm: number, temp: number, fuel: number, history: [number, number][] }>>({});

  // Ensure selectedVehicle is valid when vehicles list changes
  useEffect(() => {
    if (vehicles.length === 0) {
        setSelectedVehicle(null);
        return;
    }
    
    // If no selection, or selected vehicle was deleted, select the first one
    if (!selectedVehicle || !vehicles.find(v => v.id === selectedVehicle.id)) {
        setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles, selectedVehicle]);

  // Initialize Fleet Status
  useEffect(() => {
    const initialStatus: any = {};
    vehicles.forEach(v => {
      // Preserve existing status if available to avoid jump, otherwise init
      const existing = fleetStatus[v.id];
      initialStatus[v.id] = existing || {
        lat: v.latitude || -15.6014, // Default to Cuiabá
        lng: v.longitude || -56.0979,
        speed: v.currentSpeed || 0,
        rpm: v.rpm || 0,
        temp: v.engineTemp || 90,
        fuel: v.fuelLevel || 50,
        history: [[v.latitude || -15.6014, v.longitude || -56.0979]]
      };
    });
    setFleetStatus(initialStatus);
  }, [vehicles]); // Re-run when vehicles array changes structure (add/remove)

  // Handle Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    }
  }, []);

  // Leaflet Map Initialization (Runs Once)
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    if (mapInstance.current) return; // Prevent double init

    const initialCenter = [-15.6014, -56.0979]; // Cuiabá Default

    // Create Map
    const map = window.L.map(mapRef.current, {
       zoomControl: false,
       attributionControl: false
    }).setView(initialCenter, 14);

    // Dark Matter Tiles
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd'
    }).addTo(map);

    window.L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstance.current = map;

    return () => {
       if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
       }
    };
  }, []); 

  // Markers Management (Runs when vehicles change)
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    const map = mapInstance.current;

    // 1. Cleanup old markers not in current list
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

    // 2. Add/Update markers
    vehicles.forEach(v => {
        // Skip if already exists
        if (markersRef.current[v.id]) return;

        // Pulse Effect CSS
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
          <style>
            @keyframes pulse {
              0% { transform: scale(0.5); opacity: 1; }
              100% { transform: scale(1.5); opacity: 0; }
            }
          </style>
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
        
        const popupContent = `
           <div style="font-family: sans-serif; color: #334155; padding: 4px;">
              <h3 style="margin: 0; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 4px;">
                 ${v.plate} 
                 <span style="font-size: 10px; background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${v.model}</span>
              </h3>
              <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Motorista: <strong>${v.driver}</strong></p>
           </div>
        `;
        marker.bindPopup(popupContent);

        marker.on('click', () => {
           setSelectedVehicle(v);
           map.setView(marker.getLatLng(), 16);
        });

        markersRef.current[v.id] = marker;

        const trail = window.L.polyline([], { color: v.status === 'Em Viagem' || v.status === 'Ativo' ? '#10b981' : '#ef4444', weight: 3, opacity: 0.6 }).addTo(map);
        trailsRef.current[v.id] = trail;
    });

  }, [vehicles]);

  // Function to center map on user
  const centerOnUser = () => {
    if (userLocation && mapInstance.current) {
       mapInstance.current.setView([userLocation.lat, userLocation.lng], 16);
    } else {
      alert("Localização não disponível.");
    }
  };

  // Live Simulation Loop
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setFleetStatus(prev => {
        const next = { ...prev };
        let hasChanges = false;
        
        vehicles.forEach(v => {
           // Skip if stopped or not in fleet status
           if (v.status === 'Parado' || v.status === 'Manutenção') return;
           const current = next[v.id];
           if (!current) return;
           
           // Movement Logic
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

           // Update Marker on Map
           if (markersRef.current[v.id]) {
             const marker = markersRef.current[v.id];
             marker.setLatLng([newLat, newLng]);
             
             const heading = Math.atan2(lngChange, latChange) * (180 / Math.PI);
             const iconEl = document.getElementById(`icon-${v.id}`);
             if (iconEl) {
                iconEl.style.transform = `rotate(${90 - heading}deg)`;
             }
           }

           // Update Trail
           if (trailsRef.current[v.id]) {
              trailsRef.current[v.id].setLatLngs(newHistory);
           }
        });
        
        return hasChanges ? next : prev;
      });
    }, 800); 

    return () => clearInterval(interval);
  }, [isLive, vehicles]);

  // Handle empty state
  if (vehicles.length === 0) {
      return (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center flex-col text-slate-400">
              <Satellite size={48} className="mb-4 opacity-20" />
              <p>Nenhum veículo monitorado no momento.</p>
          </div>
      );
  }

  const currentVehicleData = (selectedVehicle && fleetStatus[selectedVehicle.id]) ? fleetStatus[selectedVehicle.id] : {
    lat: 0, lng: 0, speed: 0, rpm: 0, temp: 0, fuel: 0, history: []
  };

  return (
    <div className="flex h-full w-full relative">
       
       {/* Collapsible Left Sidebar */}
       <div 
         className={`absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300
            ${isOverlayMinimized ? 'w-auto h-auto' : 'w-80 max-h-[calc(100%-2rem)]'}
         `}
       >
          <div className="p-3 bg-slate-900 text-white flex justify-between items-center cursor-pointer" onClick={() => setIsOverlayMinimized(!isOverlayMinimized)}>
             <div className="flex items-center gap-2">
               <Navigation size={18} className="text-blue-400" />
               {!isOverlayMinimized && <span className="font-bold text-sm">Monitoramento Ativo</span>}
             </div>
             <div>
                {isOverlayMinimized ? <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> : <Minus size={16} />}
             </div>
          </div>
          
          {!isOverlayMinimized && (
            <>
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-500 uppercase">Lista de Veículos</span>
                   <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">GPS ON</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[300px]">
                {vehicles.map(vehicle => (
                  <button
                    key={vehicle.id}
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      if (markersRef.current[vehicle.id] && mapInstance.current) {
                          mapInstance.current.setView(markersRef.current[vehicle.id].getLatLng(), 16);
                          markersRef.current[vehicle.id].openPopup();
                      }
                    }}
                    className={`w-full text-left p-3 border-b border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-between
                      ${selectedVehicle?.id === vehicle.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}
                    `}
                  >
                    <div>
                       <span className={`block font-bold text-sm ${selectedVehicle?.id === vehicle.id ? 'text-blue-700' : 'text-slate-700'}`}>{vehicle.plate}</span>
                       <span className="text-[10px] text-slate-500">{vehicle.model}</span>
                    </div>
                    <div className="text-right">
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${vehicle.status === 'Em Viagem' || vehicle.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {fleetStatus[vehicle.id]?.speed.toFixed(0)} km/h
                       </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
       </div>

       {/* MAP AREA */}
       <div className="flex-1 bg-slate-900 relative">
          <div ref={mapRef} className="w-full h-full bg-slate-900 z-0"></div>
          
          {/* Bottom Overlay Info Panel */}
          {selectedVehicle && (
          <div className="absolute bottom-6 left-6 right-6 z-[1000] bg-slate-900/90 backdrop-blur text-white p-4 rounded-xl border border-slate-700 shadow-2xl flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                   <Car size={24} className="text-white" />
                </div>
                <div>
                   <h3 className="font-bold text-lg leading-tight">{selectedVehicle.plate}</h3>
                   <p className="text-xs text-slate-400 flex items-center gap-1">
                     <User size={10} /> {selectedVehicle.driver}
                   </p>
                </div>
             </div>

             <div className="h-8 w-px bg-slate-700 mx-4 hidden md:block"></div>

             <div className="flex gap-8 text-center">
                <div>
                   <p className="text-[10px] text-slate-400 uppercase font-bold">Velocidade</p>
                   <p className="text-xl font-mono font-bold text-white">{Math.round(currentVehicleData.speed)} <span className="text-xs text-slate-500">km/h</span></p>
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 uppercase font-bold">RPM</p>
                   <p className="text-xl font-mono font-bold text-white">{Math.round(currentVehicleData.rpm)}</p>
                </div>
                <div className="hidden md:block">
                   <p className="text-[10px] text-slate-400 uppercase font-bold">Combustível</p>
                   <p className={`text-xl font-mono font-bold ${currentVehicleData.fuel < 20 ? 'text-red-500' : 'text-green-400'}`}>
                      {currentVehicleData.fuel.toFixed(0)}%
                   </p>
                </div>
             </div>

             <div className="flex gap-2">
               <button 
                  onClick={centerOnUser}
                  className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg text-white transition-colors"
                  title="Minha Localização"
               >
                  <LocateFixed size={20} />
               </button>
               <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                  Detalhes <ArrowRight size={16} />
               </button>
             </div>
          </div>
          )}
       </div>
    </div>
  );
};
