
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Vehicle, User } from '../types.ts';
import { 
  Target, Truck, SignalHigh, X, AlertTriangle, 
  Map as MapIcon, Satellite, Crosshair,
  User as UserIcon, Power, ChevronDown, ChevronUp,
  Navigation, Compass, ShieldCheck, MapPin
} from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface TelemetryModuleProps {
  vehicles: Vehicle[];
  currentUser: User;
}

const SMOOTHING_FACTOR = 0.4; // Um pouco mais rápido para diminuir atraso

export const TelemetryModule: React.FC<TelemetryModuleProps> = ({ vehicles, currentUser }) => {
  const [isEngineOn, setIsEngineOn] = useState(false); 
  const [followMode, setFollowMode] = useState(true);
  const [isHudMinimized, setIsHudMinimized] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  
  const [localAccuracy, setLocalAccuracy] = useState<number | null>(null);
  const [isDataStable, setIsDataStable] = useState(true);
  
  // Estado das posições - garantindo que o tipo está correto
  const [fleetPositions, setFleetPositions] = useState<Record<string, { lat: number, lng: number, speed: number, heading: number, accuracy: number }>>({});
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const watchIdRef = useRef<number | null>(null);
  
  // Referência para a posição suavizada (inicia em zero para detectar o primeiro ponto)
  const smoothedPos = useRef<{lat: number, lng: number} | null>(null);

  // Busca robusta da placa do motorista logado
  const myVehicle = useMemo(() => {
    return vehicles.find(v => 
      v.driver.trim().toLowerCase() === currentUser.name.trim().toLowerCase()
    );
  }, [vehicles, currentUser]);

  // Inicializa a frota
  useEffect(() => {
    const initial: Record<string, any> = {};
    vehicles.forEach(v => {
      initial[v.id] = {
        lat: v.latitude || -15.653342,
        lng: v.longitude || -55.988658,
        speed: v.currentSpeed || 0,
        heading: 0,
        accuracy: 1.0
      };
    });
    setFleetPositions(initial);
  }, [vehicles]);

  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;
    mapInstance.current = window.L.map(mapRef.current, {
       zoomControl: false,
       attributionControl: false,
       maxZoom: 22
    }).setView([-15.60, -56.06], 13);
    
    tileLayerRef.current = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !window.L || !tileLayerRef.current) return;
    mapInstance.current.removeLayer(tileLayerRef.current);
    const url = mapType === 'streets' 
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    tileLayerRef.current = window.L.tileLayer(url).addTo(mapInstance.current);
  }, [mapType]);

  // CONTROLE DO GPS REAL
  useEffect(() => {
    if (isEngineOn && "geolocation" in navigator) {
      setGpsError(null);
      
      const geoOptions = { 
        enableHighAccuracy: true, 
        maximumAge: 0, // Força leitura fresca
        timeout: 10000 
      };

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const rawLat = pos.coords.latitude;
          const rawLng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          const speedKmh = pos.coords.speed ? pos.coords.speed * 3.6 : 0;
          const heading = pos.coords.heading || 0;

          // Filtro de precisão (10m em movimento, 5m parado)
          if (accuracy > (speedKmh > 2 ? 15 : 8)) {
            setIsDataStable(false);
            setLocalAccuracy(accuracy);
            return;
          }

          // Se for o primeiro ponto, não suaviza (pula direto para a posição real)
          let newLat, newLng;
          if (!smoothedPos.current) {
            newLat = rawLat;
            newLng = rawLng;
          } else {
            newLat = (rawLat * SMOOTHING_FACTOR) + (smoothedPos.current.lat * (1 - SMOOTHING_FACTOR));
            newLng = (rawLng * SMOOTHING_FACTOR) + (smoothedPos.current.lng * (1 - SMOOTHING_FACTOR));
          }
          
          smoothedPos.current = { lat: newLat, lng: newLng };
          setIsDataStable(true);
          setLocalAccuracy(accuracy);

          // Se eu tenho um caminhão, movo ele. Se não, atualizo minha posição isolada.
          if (myVehicle) {
            setFleetPositions(prev => ({
              ...prev,
              [myVehicle.id]: { lat: newLat, lng: newLng, speed: speedKmh, heading, accuracy }
            }));
          } else {
             // Motorista sem placa associada aparece como "Ponto do Usuário"
             setFleetPositions(prev => ({
               ...prev,
               'local-driver': { lat: newLat, lng: newLng, speed: speedKmh, heading, accuracy }
             }));
          }

          if (followMode && mapInstance.current) {
             mapInstance.current.setView([newLat, newLng], mapInstance.current.getZoom() < 15 ? 18 : mapInstance.current.getZoom(), { animate: true });
          }
        },
        (err) => {
          setGpsError("Falha no sensor GPS");
          setIsEngineOn(false);
        },
        geoOptions
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        smoothedPos.current = null;
      }
    }
    return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, [isEngineOn, followMode, myVehicle]);

  // RENDERIZAÇÃO DE TODOS OS PONTOS
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;
    
    (Object.entries(fleetPositions) as [string, any][]).forEach(([id, pos]) => {
      const vehicle = vehicles.find(v => v.id === id);
      const isMe = id === myVehicle?.id || id === 'local-driver';
      
      let iconHtml = '';
      if (id === 'local-driver') {
        // Marcador para quando o motorista não tem caminhão associado
        iconHtml = `
          <div class="user-standalone">
            <div class="user-pulse"></div>
            <div class="user-icon-core shadow-xl"><svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
            <div class="marker-label">VOCÊ (SEM PLACA)</div>
          </div>
        `;
      } else if (vehicle) {
        const markerColor = isMe ? '#2563eb' : (pos.speed > 2 ? '#22c55e' : '#64748b');
        iconHtml = `
          <div class="nav-marker ${isMe ? 'is-me' : ''}">
            <div class="marker-core shadow-2xl" style="background: ${markerColor}; transform: rotate(${pos.heading}deg)">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/></svg>
            </div>
            <div class="marker-label">${isMe ? 'SUA PLACA' : vehicle.plate}</div>
            ${isMe && isEngineOn ? '<div class="pulse-ring"></div>' : ''}
          </div>
        `;
      }

      if (iconHtml) {
        const icon = window.L.divIcon({ className: 'leaflet-nav-icon', html: iconHtml, iconSize: [50, 50], iconAnchor: [25, 25] });
        if (markersRef.current[id]) {
          markersRef.current[id].setLatLng([pos.lat, pos.lng]);
          markersRef.current[id].setIcon(icon);
          if (isMe) markersRef.current[id].setZIndexOffset(1000); // Garante que você está sempre por cima
        } else {
          markersRef.current[id] = window.L.marker([pos.lat, pos.lng], { icon }).addTo(mapInstance.current);
        }
      }
    });
  }, [fleetPositions, vehicles, myVehicle, isEngineOn]);

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-900 overflow-hidden font-sans">
       
       {/* STATUS DO GPS */}
       <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
             <div className="bg-slate-950/90 backdrop-blur-xl px-5 py-4 rounded-[28px] shadow-2xl border border-white/10 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 ${isEngineOn ? 'bg-blue-600 shadow-blue-500/50' : 'bg-slate-800'}`}>
                   {isEngineOn ? <Navigation size={22} className="animate-pulse" /> : <MapPin size={22} />}
                </div>
                <div>
                   <h1 className="text-white font-black text-[10px] uppercase tracking-wider leading-none">
                     {myVehicle ? `CONTROLANDO: ${myVehicle.plate}` : 'MODO MOTORISTA'}
                   </h1>
                   <div className="flex items-center gap-2 mt-1.5">
                      <span className={`w-2 h-2 rounded-full ${!isEngineOn ? 'bg-slate-500' : (isDataStable ? 'bg-green-500' : 'bg-red-500 animate-pulse')}`}></span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        {!isEngineOn ? 'GPS DESLIGADO' : (isDataStable ? 'SATÉLITE OK' : 'PRECISÃO FRACA')}
                      </span>
                   </div>
                </div>
             </div>
             {gpsError && <div className="bg-red-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-red-500 animate-bounce"><AlertTriangle size={18} /><span className="text-[10px] font-black uppercase tracking-wider">{gpsError}</span></div>}
          </div>
          
          <div className="flex flex-col gap-2 pointer-events-auto items-end pr-14 md:pr-0">
             <div className="bg-white/95 p-1.5 rounded-2xl shadow-xl border border-slate-200 flex gap-1">
                <button onClick={() => setMapType('streets')} className={`p-2.5 rounded-xl transition-all ${mapType === 'streets' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><MapIcon size={18} /></button>
                <button onClick={() => setMapType('satellite')} className={`p-2.5 rounded-xl transition-all ${mapType === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><Satellite size={18} /></button>
             </div>
             <button onClick={() => setFollowMode(!followMode)} className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border transition-all ${followMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}><Compass size={24} className={followMode ? 'animate-spin-slow' : ''} /></button>
             <button onClick={() => { if (smoothedPos.current) mapInstance.current?.flyTo([smoothedPos.current.lat, smoothedPos.current.lng], 18); }} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl border border-slate-200"><Crosshair size={24} /></button>
          </div>
       </div>

       <div className="flex-1 relative z-0">
          <div ref={mapRef} className="w-full h-full"></div>
       </div>

       {/* HUD PRINCIPAL */}
       <div className={`absolute bottom-6 left-6 right-6 z-[2000] flex justify-center pointer-events-none transition-all duration-700 ${isHudMinimized ? 'translate-y-[calc(100%-20px)]' : 'translate-y-0'}`}>
          <div className="bg-slate-950/95 backdrop-blur-2xl px-8 py-7 rounded-[40px] shadow-2xl border border-white/10 pointer-events-auto flex flex-col items-center gap-6 max-w-4xl w-full relative">
              <button onClick={() => setIsHudMinimized(!isHudMinimized)} className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-xl border border-slate-100 transition-all active:scale-90">{isHudMinimized ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</button>

              <div className="flex items-center gap-10 w-full">
                <div className="flex items-center gap-6">
                  <button onClick={() => setIsEngineOn(!isEngineOn)} className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 ${isEngineOn ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}><Power size={36} /></button>
                  <div className="hidden sm:block">
                     <h2 className="text-lg font-black text-white tracking-tight leading-none uppercase">{isEngineOn ? 'VIAGEM EM CURSO' : 'INICIAR JORNADA'}</h2>
                     <p className="text-[10px] text-slate-400 font-bold mt-2 tracking-widest uppercase">{myVehicle ? `VEÍCULO: ${myVehicle.plate}` : 'MOTORISTA: ' + currentUser.name}</p>
                  </div>
                </div>

                <div className="h-16 w-px bg-white/10"></div>

                <div className="flex-1 flex justify-between items-center">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">KM/H</p>
                      <span className="text-6xl font-black text-white tracking-tighter leading-none">
                         {Math.round(isEngineOn ? (myVehicle ? fleetPositions[myVehicle.id]?.speed : fleetPositions['local-driver']?.speed) || 0 : 0)}
                      </span>
                   </div>
                   
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">ESTADO SINAL</p>
                      <div className="flex items-center justify-end gap-3">
                         <SignalHigh size={28} className={isEngineOn && isDataStable ? 'text-green-500' : 'text-red-500'} />
                         <span className={`text-3xl font-black ${!isDataStable && isEngineOn ? 'text-red-500' : 'text-white'}`}>
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
          .user-icon-core { width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; z-index: 5; border: 3px solid white; }
          .marker-label { position: absolute; bottom: -22px; background: rgba(0,0,0,0.9); color: white; padding: 2px 8px; border-radius: 6px; font-size: 8px; font-weight: 900; border: 1px solid rgba(255,255,255,0.1); white-space: nowrap; pointer-events: none; }
          
          .is-me .marker-core { width: 48px; height: 48px; border-radius: 16px; box-shadow: 0 0 25px rgba(37, 99, 235, 0.6); }
          .pulse-ring, .user-pulse { position: absolute; width: 50px; height: 50px; background: rgba(37, 99, 235, 0.4); border-radius: 16px; z-index: 1; animation: markerPulse 2s infinite; }
          .user-pulse { border-radius: 50%; }
          
          @keyframes markerPulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
          .animate-spin-slow { animation: spin 5s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
       `}</style>
    </div>
  );
};
