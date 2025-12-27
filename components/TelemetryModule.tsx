import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types.ts';
import { Navigation, Car, LocateFixed, Power, MapPin, Gauge, Thermometer, ShieldCheck, ChevronUp, Radio, Signal, Wifi, Activity, Navigation2, Crosshair, Zap } from 'lucide-react';

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
  
  // Estados de Localização Real
  const [coords, setCoords] = useState({ lat: -15.653342, lng: -55.988658 });
  const [tripDistance, setTripDistance] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastCoordsRef = useRef<{lat: number, lng: number} | null>(null);
  
  const [telemetry, setTelemetry] = useState({
    rpm: 0,
    temp: 24,
    speed: 0,
    signalBars: 0
  });

  // Haversine para distância precisa
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Inicializa Mapa com camadas profissionais
  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;

    mapInstance.current = window.L.map(mapRef.current, {
       zoomControl: false,
       attributionControl: false,
       maxZoom: 20,
       tap: true
    }).setView([coords.lat, coords.lng], 16);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

    // Linha de percurso
    polylineRef.current = window.L.polyline([], {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.6,
      lineJoin: 'round'
    }).addTo(mapInstance.current);

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });
      mapInstance.current?.setView([latitude, longitude], 17);
    }, null, { enableHighAccuracy: true });

    setTimeout(() => mapInstance.current?.invalidateSize(), 500);

    return () => {
       if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
       }
    };
  }, []); 

  // Core do Rastreamento de Alta Precisão
  useEffect(() => {
    if (isEngineOn) {
      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, accuracy, heading: devHeading } = position.coords;
            
            // FILTRO DE QUALIDADE: Ignorar se a precisão for pior que 50 metros (sinal muito ruim)
            if (accuracy > 50) {
                setTelemetry(prev => ({ ...prev, signalBars: 1 }));
                return;
            }

            const newCoords = { lat: latitude, lng: longitude };
            
            // Calcular Barras de Sinal (Proporcional à precisão em metros)
            let bars = 1;
            if (accuracy < 10) bars = 5;
            else if (accuracy < 20) bars = 4;
            else if (accuracy < 30) bars = 3;
            else bars = 2;

            setTelemetry(prev => ({
              ...prev,
              speed: speed ? (speed * 3.6) : 0,
              rpm: speed ? (1100 + (speed * 120)) : 850,
              signalBars: bars
            }));

            setAccuracy(accuracy);
            if (devHeading !== null) setHeading(devHeading);

            // Somente computa distância se o movimento for superior à margem de erro (Filtro de Jitter)
            if (lastCoordsRef.current) {
              const dist = calculateDistance(
                lastCoordsRef.current.lat, 
                lastCoordsRef.current.lng, 
                latitude, 
                longitude
              );
              
              if (dist > (accuracy / 1000) * 1.5) { 
                setTripDistance(prev => prev + dist);
                if (polylineRef.current) polylineRef.current.addLatLng([latitude, longitude]);
              }
            } else {
               if (polylineRef.current) polylineRef.current.setLatLngs([[latitude, longitude]]);
            }

            setCoords(newCoords);
            lastCoordsRef.current = newCoords;
          },
          (error) => {
            console.error("GPS Error:", error);
            setIsEngineOn(false);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
          }
        );
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setTelemetry(prev => ({ ...prev, speed: 0, rpm: 0, signalBars: 0 }));
      lastCoordsRef.current = null;
      if (accuracyCircleRef.current) accuracyCircleRef.current.remove();
      accuracyCircleRef.current = null;
    }

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isEngineOn]);

  // Sincronizar UI do Mapa (Marcador + Círculo + Heading)
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    const color = isEngineOn ? '#10b981' : '#3b82f6';
    
    // Marcador com Heading (Rotação)
    const iconHtml = `
      <div style="width: 44px; height: 44px; position: relative; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
         ${isEngineOn ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(16, 185, 129, 0.3); animation: sonar 2s infinite;"></div>` : ''}
         <div style="z-index: 10; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
            </svg>
         </div>
      </div>
    `;

    // Atualizar Círculo de Precisão
    if (accuracy && isEngineOn) {
        if (!accuracyCircleRef.current) {
            accuracyCircleRef.current = window.L.circle([coords.lat, coords.lng], {
                radius: accuracy,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 1
            }).addTo(mapInstance.current);
        } else {
            accuracyCircleRef.current.setLatLng([coords.lat, coords.lng]);
            accuracyCircleRef.current.setRadius(accuracy);
        }
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
      markerRef.current.setIcon(window.L.divIcon({
          className: 'custom-vehicle-marker',
          html: iconHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
      }));
      
      if (isEngineOn) {
        mapInstance.current.panTo([coords.lat, coords.lng], { animate: true, duration: 0.8 });
      }
    } else {
      markerRef.current = window.L.marker([coords.lat, coords.lng], {
          icon: window.L.divIcon({
              className: 'custom-vehicle-marker',
              html: iconHtml,
              iconSize: [44, 44],
              iconAnchor: [22, 22]
          })
      }).addTo(mapInstance.current);
    }
  }, [coords, isEngineOn, heading]);

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-900 overflow-hidden">
       
       {/* UI OVERLAY SUPERIOR */}
       <div className="absolute top-0 left-0 right-0 px-4 py-6 bg-gradient-to-b from-slate-900 via-slate-900/40 to-transparent z-[1000] flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isEngineOn ? 'bg-green-600 ring-8 ring-green-600/10' : 'bg-blue-600 ring-8 ring-blue-600/10'}`}>
                <Zap size={28} className={isEngineOn ? 'animate-pulse' : ''} />
             </div>
             <div className="drop-shadow-lg">
                <h1 className="text-white font-black text-2xl leading-none tracking-tighter">TELEMETRIA <span className="text-blue-400">PRO</span></h1>
                <div className="flex items-center gap-2 mt-1.5">
                   <div className="flex gap-0.5 items-end h-3">
                      {[1,2,3,4,5].map(b => (
                        <div key={b} className={`w-1 rounded-t-sm transition-all duration-300 ${telemetry.signalBars >= b ? 'bg-green-400' : 'bg-slate-700'}`} style={{ height: `${b * 20}%` }}></div>
                      ))}
                   </div>
                   <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">
                     {telemetry.signalBars >= 4 ? 'Sinal Forte' : telemetry.signalBars >= 2 ? 'Sinal Médio' : 'Procurando Satélites...'}
                   </p>
                </div>
             </div>
          </div>
          
          <div className="flex flex-col gap-3 pointer-events-auto">
             <button 
                onClick={() => mapInstance.current?.flyTo([coords.lat, coords.lng], 19, { animate: true, duration: 2 })} 
                className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-2xl active:scale-90 transition-transform"
             >
                <Crosshair size={28} />
             </button>
          </div>
       </div>

       {/* MAPA PRINCIPAL */}
       <div className="flex-1 relative z-0">
          <div ref={mapRef} className="w-full h-full"></div>
          
          <div className="absolute top-28 left-4 flex flex-col gap-2 z-[1000]">
             <div className="bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl">
                <Wifi size={16} className={isEngineOn ? "text-blue-400" : "text-slate-500"} />
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">HD Satélite</span>
                   <span className="text-xs font-bold text-white tracking-tight">Cuiabá Gateway v2</span>
                </div>
             </div>
             {accuracy && isEngineOn && (
                <div className="bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-3 border border-slate-200 shadow-2xl animate-fade-in">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Precisão</span>
                      <span className="text-xs font-bold text-slate-900">{accuracy.toFixed(1)} metros</span>
                   </div>
                </div>
             )}
          </div>
       </div>

       {/* PAINEL DE TELEMETRIA (BOTTOM SHEET) */}
       <div className={`absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-[44px] shadow-[0_-15px_60px_rgba(0,0,0,0.5)] transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-110px)]'}`}>
          
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full pt-5 pb-7 flex flex-col items-center cursor-pointer hover:bg-slate-50 transition-colors"
          >
             <div className="w-20 h-1.5 bg-slate-200 rounded-full mb-2"></div>
             {!isExpanded && <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Monitoramento Ativo</span>}
          </div>

          <div className="px-8 pb-12 overflow-hidden">
             {!isEngineOn ? (
               <div className="text-center py-8 animate-fade-in">
                  <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border-2 border-blue-100 shadow-inner">
                     <LocateFixed size={48} className="text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Check-in de Viagem</h2>
                  <p className="text-slate-500 text-sm px-10 leading-relaxed mb-10 font-medium">
                    Sincronize com os satélites FCMO para monitorar sua velocidade e percurso com precisão militar.
                  </p>
                  
                  <button 
                     onClick={() => setIsEngineOn(true)}
                     className="w-full bg-slate-900 active:bg-black text-white py-6 rounded-[24px] font-black text-xl shadow-2xl shadow-slate-900/30 flex items-center justify-center gap-4 transition-all hover:scale-[1.02]"
                  >
                     <Navigation size={28} /> INICIAR LOG OPERACIONAL
                  </button>
               </div>
             ) : (
               <div className="animate-slide-up">
                  {/* DISPLAY DE VELOCIDADE REAL */}
                  <div className="flex justify-between items-center mb-10 bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-inner">
                     <div className="flex flex-col">
                        <p className="text-[11px] text-slate-400 font-black uppercase mb-1 tracking-[0.2em]">Real-Time Speed</p>
                        <div className="flex items-baseline">
                           <span className="text-7xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                             {Math.round(telemetry.speed)}
                           </span>
                           <span className="text-lg text-slate-400 font-black ml-3 uppercase">km/h</span>
                        </div>
                     </div>
                     <div className="w-20 h-20 rounded-full border-[6px] border-slate-200 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-[6px] border-blue-500 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '3s' }}></div>
                        <Gauge size={32} className="text-slate-800" />
                     </div>
                  </div>

                  {/* MÉTRICAS SECUNDÁRIAS */}
                  <div className="grid grid-cols-2 gap-5 mb-8">
                     <div className="bg-slate-900 p-5 rounded-[28px] shadow-xl flex items-center gap-4 border border-white/5">
                        <div className="bg-white/10 text-white p-3 rounded-2xl"><Activity size={24} /></div>
                        <div>
                           <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rotação</span>
                           <p className="text-lg font-black text-white tracking-tighter">{Math.round(telemetry.rpm)} <span className="text-[10px] opacity-50">RPM</span></p>
                        </div>
                     </div>
                     <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><MapPin size={24} /></div>
                        <div>
                           <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Percurso</span>
                           <p className="text-lg font-black text-slate-800 tracking-tighter">{tripDistance.toFixed(2)} <span className="text-[10px] opacity-50">KM</span></p>
                        </div>
                     </div>
                  </div>

                  {/* COORDENADAS E STATUS */}
                  <div className="bg-blue-600 text-white p-6 rounded-[32px] mb-8 flex items-center gap-5 shadow-2xl shadow-blue-500/20">
                     <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-md">
                        <Wifi size={28} className="animate-pulse" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                           <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                           <span className="block text-[10px] font-black text-blue-100 uppercase tracking-widest">Ativo em Cuiabá, MT</span>
                        </div>
                        <p className="text-[11px] font-mono text-blue-100 opacity-90 truncate leading-none">LAT: {coords.lat.toFixed(8)}</p>
                        <p className="text-[11px] font-mono text-blue-100 opacity-90 truncate mt-1 leading-none">LNG: {coords.lng.toFixed(8)}</p>
                     </div>
                  </div>

                  <button 
                     onClick={() => setIsEngineOn(false)}
                     className="w-full bg-red-50 active:bg-red-100 text-red-600 py-5 rounded-[24px] font-black text-sm border border-red-100 flex items-center justify-center gap-3 transition-all"
                  >
                     <Power size={20} /> ENCERRAR MONITORAMENTO
                  </button>
               </div>
             )}
          </div>
       </div>

       <style>{`
          @keyframes sonar { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
          .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.19, 1, 0.22, 1); }
          @keyframes slideUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.5s ease-out; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .leaflet-container { background: #f8fafc !important; }
       `}</style>
    </div>
  );
};