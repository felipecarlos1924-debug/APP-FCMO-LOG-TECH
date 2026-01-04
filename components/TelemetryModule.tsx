
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Vehicle, User, VehicleStatus } from '../types.ts';
import { 
  Target, Truck, SignalHigh, X, AlertTriangle, 
  Map as MapIcon, Satellite, Crosshair,
  User as UserIcon, Power, ChevronDown, ChevronUp,
  Navigation, Compass, ShieldCheck, MapPin, LogOut, Radio
} from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface TelemetryModuleProps {
  vehicles: Vehicle[];
  currentUser: User;
  onBack: () => void;
  onUpdateVehicle?: (vehicle: Vehicle) => void;
}

const SMOOTHING_FACTOR = 0.4;

export const TelemetryModule: React.FC<TelemetryModuleProps> = ({ vehicles, currentUser, onBack, onUpdateVehicle }) => {
  const [isEngineOn, setIsEngineOn] = useState(false); 
  const [followMode, setFollowMode] = useState(true);
  const [isHudMinimized, setIsHudMinimized] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  
  const [localAccuracy, setLocalAccuracy] = useState<number | null>(null);
  const [isDataStable, setIsDataStable] = useState(true);
  
  const [fleetPositions, setFleetPositions] = useState<Record<string, { lat: number, lng: number, speed: number, heading: number, accuracy: number }>>({});
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const watchIdRef = useRef<number | null>(null);
  const smoothedPos = useRef<{lat: number, lng: number} | null>(null);

  const myVehicle = useMemo(() => {
    const currentName = currentUser.name.trim().toLowerCase();
    return vehicles.find(v => v.driver.trim().toLowerCase() === currentName);
  }, [vehicles, currentUser.name]);

  // Sincroniza posições da frota para visualização (Dono vê todos, Motorista vê a si mesmo)
  useEffect(() => {
    const isOwner = currentUser.role === 'OWNER' || currentUser.role === 'MANAGER';
    setFleetPositions(prev => {
      const next = { ...prev };
      vehicles.forEach(v => {
        // Se for dono, carrega todos. Se for motorista, apenas os outros ou se o dele já estiver ativo
        if (isOwner || v.driver === currentUser.name || v.status === VehicleStatus.ACTIVE || v.status === VehicleStatus.TRIP) {
          next[v.id] = {
            lat: v.latitude || -15.5960,
            lng: v.longitude || -56.0960,
            speed: v.currentSpeed || 0,
            heading: 0,
            accuracy: 1.0
          };
        }
      });
      return next;
    });
  }, [vehicles, currentUser.role, currentUser.name]);

  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;
    
    mapInstance.current = window.L.map(mapRef.current, {
       zoomControl: false,
       attributionControl: false,
       maxZoom: 22
    }).setView([-15.60, -56.06], 13);
    
    tileLayerRef.current = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !window.L || !tileLayerRef.current) return;
    mapInstance.current.removeLayer(tileLayerRef.current);
    const url = mapType === 'streets' 
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    tileLayerRef.current = window.L.tileLayer(url).addTo(mapInstance.current);
  }, [mapType]);

  // LÓGICA DE GEOLOCALIZAÇÃO REAL (SEM SIMULAÇÃO)
  useEffect(() => {
    if (isEngineOn && "geolocation" in navigator) {
      setGpsError(null);
      const geoOptions = { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 };

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const rawLat = pos.coords.latitude;
          const rawLng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          const speedKmh = pos.coords.speed ? pos.coords.speed * 3.6 : 0;
          const heading = pos.coords.heading || 0;

          if (accuracy > 50) {
            setIsDataStable(false);
            setLocalAccuracy(accuracy);
            return;
          }

          let newLat, newLng;
          if (!smoothedPos.current) {
            newLat = rawLat; newLng = rawLng;
          } else {
            newLat = (rawLat * SMOOTHING_FACTOR) + (smoothedPos.current.lat * (1 - SMOOTHING_FACTOR));
            newLng = (rawLng * SMOOTHING_FACTOR) + (smoothedPos.current.lng * (1 - SMOOTHING_FACTOR));
          }
          
          smoothedPos.current = { lat: newLat, lng: newLng };
          setIsDataStable(true);
          setLocalAccuracy(accuracy);

          const updateId = myVehicle ? myVehicle.id : 'local-driver';
          
          // Atualiza o estado global se houver um veículo vinculado
          if (myVehicle && onUpdateVehicle) {
            onUpdateVehicle({
              ...myVehicle,
              latitude: newLat,
              longitude: newLng,
              currentSpeed: speedKmh,
              status: speedKmh > 2 ? VehicleStatus.TRIP : VehicleStatus.ACTIVE,
              lastUpdate: new Date().toISOString()
            });
          }

          setFleetPositions(prev => ({
            ...prev,
            [updateId]: { lat: newLat, lng: newLng, speed: speedKmh, heading, accuracy }
          }));

          if (followMode && mapInstance.current) {
             mapInstance.current.setView([newLat, newLng], mapInstance.current.getZoom() < 15 ? 18 : mapInstance.current.getZoom(), { animate: true });
          }
        },
        (err) => {
          setGpsError("Sinal GPS Indisponível");
          setIsEngineOn(false);
        },
        geoOptions
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        
        // Se desligar o motor, atualiza status para Parado no global
        if (myVehicle && onUpdateVehicle) {
          onUpdateVehicle({
            ...myVehicle,
            status: VehicleStatus.STOPPED,
            currentSpeed: 0,
            lastUpdate: new Date().toISOString()
          });
        }
      }
    }
    return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, [isEngineOn, followMode, myVehicle, onUpdateVehicle]);

  useEffect(() => {
    if (!mapInstance.current || !window.L) return;
    
    const currentKeys = Object.keys(fleetPositions);
    Object.keys(markersRef.current).forEach(key => {
      if (!currentKeys.includes(key)) {
        mapInstance.current.removeLayer(markersRef.current[key]);
        delete markersRef.current[key];
      }
    });

    currentKeys.forEach(id => {
      const pos = fleetPositions[id];
      const vehicle = vehicles.find(v => v.id === id);
      const isMe = id === myVehicle?.id || id === 'local-driver';
      
      let iconHtml = '';
      if (id === 'local-driver' && !myVehicle) {
        iconHtml = `
          <div class="user-standalone">
            <div class="user-pulse"></div>
            <div class="user-icon-core"><svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
            <div class="marker-label">VOCÊ</div>
          </div>
        `;
      } else if (vehicle) {
        const isOnline = vehicle.status === VehicleStatus.ACTIVE || vehicle.status === VehicleStatus.TRIP;
        const markerColor = isMe ? '#2563eb' : (isOnline ? '#22c55e' : '#94a3b8');
        
        iconHtml = `
          <div class="nav-marker ${isMe ? 'is-me' : ''} ${isOnline ? 'is-online' : ''}">
            <div class="marker-core shadow-2xl" style="background: ${markerColor}; transform: rotate(${pos.heading}deg)">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/></svg>
            </div>
            <div class="marker-label">${isMe ? 'SUA POSIÇÃO' : `${vehicle.plate} - ${vehicle.driver}`}</div>
            ${isOnline ? '<div class="pulse-ring"></div>' : ''}
          </div>
        `;
      }

      if (iconHtml) {
        const icon = window.L.divIcon({ className: 'leaflet-nav-icon', html: iconHtml, iconSize: [50, 50], iconAnchor: [25, 25] });
        if (markersRef.current[id]) {
          markersRef.current[id].setLatLng([pos.lat, pos.lng]);
          markersRef.current[id].setIcon(icon);
          if (isMe) markersRef.current[id].setZIndexOffset(1000);
        } else {
          markersRef.current[id] = window.L.marker([pos.lat, pos.lng], { icon }).addTo(mapInstance.current);
        }
      }
    });
  }, [fleetPositions, vehicles, myVehicle, isEngineOn]);

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-900 overflow-hidden font-sans">
       {/* BARRA SUPERIOR */}
       <div className="absolute top-6 left-6 right-6 z-[1000] flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-3 pointer-events-auto">
             <div className="bg-slate-950/80 backdrop-blur-2xl px-6 py-5 rounded-[32px] shadow-2xl border border-white/10 flex items-center gap-5">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-xl transition-all duration-500 ${isEngineOn ? 'bg-blue-600 shadow-blue-500/50' : 'bg-slate-800'}`}>
                   {isEngineOn ? <Radio size={26} className="animate-pulse" /> : <MapPin size={26} />}
                </div>
                <div className="pr-4">
                   <h1 className="text-white font-black text-[11px] uppercase tracking-[0.2em] leading-none mb-2">
                     {myVehicle ? `${myVehicle.plate} • TRANSMITINDO` : 'MODO MOTORISTA'}
                   </h1>
                   <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${!isEngineOn ? 'bg-slate-600' : (isDataStable ? 'bg-green-500' : 'bg-red-500 animate-pulse')}`}></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {!isEngineOn ? 'GPS STANDBY' : (isDataStable ? 'ONLINE - TEMPO REAL' : 'SINAL OSCILANDO')}
                      </span>
                   </div>
                </div>
             </div>
             {gpsError && <div className="bg-red-600 text-white px-5 py-4 rounded-[24px] shadow-2xl flex items-center gap-3 border border-red-500 animate-bounce"><AlertTriangle size={20} /><span className="text-[10px] font-black uppercase tracking-widest">{gpsError}</span></div>}
          </div>
          
          <div className="flex flex-col gap-3 pointer-events-auto items-end">
             <button onClick={onBack} className="bg-white/95 backdrop-blur-xl px-6 py-4 rounded-[28px] shadow-2xl border border-slate-200 flex items-center gap-3 text-slate-950 font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all hover:bg-slate-50 group">
                <LogOut size={20} className="text-red-600 group-hover:scale-110 transition-transform" /> 
                <span>SAIR DO MODO</span>
             </button>

             <div className="bg-white/95 p-2 rounded-[24px] shadow-2xl border border-slate-200 flex flex-col gap-2">
                <button onClick={() => setMapType('streets')} className={`p-3 rounded-2xl transition-all ${mapType === 'streets' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><MapIcon size={20} /></button>
                <button onClick={() => setMapType('satellite')} className={`p-3 rounded-2xl transition-all ${mapType === 'satellite' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><Satellite size={20} /></button>
                <div className="h-px bg-slate-100 mx-2"></div>
                <button onClick={() => setFollowMode(!followMode)} className={`p-3 rounded-2xl transition-all ${followMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><Compass size={20} className={followMode ? 'animate-spin-slow' : ''} /></button>
                <button onClick={() => { if (smoothedPos.current) mapInstance.current?.flyTo([smoothedPos.current.lat, smoothedPos.current.lng], 18); }} className="p-3 text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"><Crosshair size={20} /></button>
             </div>
          </div>
       </div>

       <div className="flex-1 relative z-0">
          <div ref={mapRef} className="w-full h-full"></div>
       </div>

       {/* HUD INFERIOR */}
       <div className={`absolute bottom-8 left-8 right-8 z-[2000] flex justify-center pointer-events-none transition-all duration-700 ${isHudMinimized ? 'translate-y-[calc(100%-15px)]' : 'translate-y-0'}`}>
          <div className="bg-slate-950/90 backdrop-blur-3xl px-10 py-8 rounded-[48px] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.8)] border border-white/10 pointer-events-auto flex flex-col items-center gap-8 max-w-5xl w-full relative">
              <button onClick={() => setIsHudMinimized(!isHudMinimized)} className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-2xl border border-slate-100 transition-all active:scale-90 hover:text-blue-600">
                {isHudMinimized ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
              </button>

              <div className="flex items-center gap-12 w-full">
                <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setIsEngineOn(!isEngineOn)} 
                    className={`w-24 h-24 rounded-[36px] flex items-center justify-center transition-all duration-700 shadow-2xl active:scale-90 group relative
                      ${isEngineOn ? 'bg-red-600 shadow-red-500/40 ring-4 ring-red-500/20' : 'bg-blue-600 shadow-blue-500/40 ring-4 ring-blue-500/20'}
                    `}
                  >
                    <Power size={44} className="text-white group-hover:scale-110 transition-transform" />
                  </button>
                  <div className="hidden lg:block">
                     <h2 className="text-2xl font-black text-white tracking-tighter leading-none uppercase">{isEngineOn ? 'EM OPERAÇÃO' : 'INICIAR ROTA'}</h2>
                     <p className="text-[11px] text-slate-400 font-bold mt-3 tracking-[0.2em] uppercase">{myVehicle ? `PLACA: ${myVehicle.plate}` : 'CONDUTOR: ' + currentUser.name}</p>
                  </div>
                </div>

                <div className="h-20 w-px bg-white/10 mx-2"></div>

                <div className="flex-1 flex justify-around items-center">
                   <div className="text-center group">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 group-hover:text-blue-400 transition-colors">VELOCIDADE REAL</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-8xl font-black text-white tracking-tighter leading-none tabular-nums">
                           {Math.round(isEngineOn ? (myVehicle ? fleetPositions[myVehicle.id]?.speed : fleetPositions['local-driver']?.speed) || 0 : 0)}
                        </span>
                        <span className="text-xl font-black text-slate-600 ml-2">KM/H</span>
                      </div>
                   </div>
                   
                   <div className="text-right flex flex-col items-end">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">MARGEM DE ERRO GPS</p>
                      <div className="flex items-center gap-4">
                         <SignalHigh size={36} className={`transition-colors duration-500 ${isEngineOn && isDataStable ? 'text-blue-500' : 'text-red-500 animate-pulse'}`} />
                         <span className={`text-4xl font-black tabular-nums ${!isDataStable && isEngineOn ? 'text-red-500' : 'text-white'}`}>
                            {localAccuracy ? `${localAccuracy.toFixed(0)}m` : '--'}
                         </span>
                      </div>
                   </div>
                </div>
              </div>
          </div>
       </div>

       <style>{`
          .leaflet-nav-icon { background: none !important; border: none !important; }
          .nav-marker, .user-standalone { position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; z-index: 1000; }
          .marker-core { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; z-index: 5; border: 3px solid white; transition: all 0.2s linear; }
          .user-icon-core { width: 40px; height: 40px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; z-index: 5; border: 3px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
          .marker-label { position: absolute; bottom: -24px; background: rgba(15, 23, 42, 0.95); color: white; padding: 4px 10px; border-radius: 8px; font-size: 9px; font-weight: 900; border: 1px solid rgba(255,255,255,0.1); white-space: nowrap; pointer-events: none; text-transform: uppercase; letter-spacing: 1px; }
          
          .is-online .marker-core { box-shadow: 0 0 30px rgba(34, 197, 94, 0.5); }
          .is-me .marker-core { width: 48px; height: 48px; border-radius: 16px; box-shadow: 0 0 30px rgba(37, 99, 235, 0.7); }
          .pulse-ring, .user-pulse { position: absolute; width: 50px; height: 50px; background: rgba(37, 99, 235, 0.4); border-radius: 16px; z-index: 1; animation: markerPulse 2.5s infinite; }
          .is-online .pulse-ring { background: rgba(34, 197, 94, 0.4); }
          .user-pulse { border-radius: 50%; }
          
          @keyframes markerPulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.8); opacity: 0; } }
          .animate-spin-slow { animation: spin 8s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
       `}</style>
    </div>
  );
};
