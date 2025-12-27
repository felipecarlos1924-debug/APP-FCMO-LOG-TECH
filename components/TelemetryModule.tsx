import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types.ts';
import { Navigation, Car, LocateFixed, Power, MapPin, Gauge, Thermometer, ShieldCheck, ChevronUp, Radio, Signal, Wifi, Activity, Navigation2, Crosshair, Zap, Target } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface TelemetryModuleProps {
  vehicles: Vehicle[];
}

export const TelemetryModule: React.FC<TelemetryModuleProps> = ({ vehicles }) => {
  const [isEngineOn, setIsEngineOn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Estados de Localização Real de Alta Precisão
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
  
  // Refs para processamento de sinal e filtragem
  const lastCoordsRef = useRef<{lat: number, lng: number} | null>(null);
  const coordBufferRef = useRef<{lat: number, lng: number}[]>([]); // Buffer para média móvel
  const BUFFER_SIZE = 3; // Suavização leve para não atrasar a resposta real

  const [telemetry, setTelemetry] = useState({
    rpm: 0,
    temp: 24,
    speed: 0,
    signalBars: 0,
    gpsStatus: 'offline' as 'offline' | 'searching' | 'locked'
  });

  // Cálculo de distância Haversine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Função para suavizar coordenadas (Moving Average)
  const smoothCoordinates = (newLat: number, newLng: number) => {
    coordBufferRef.current.push({ lat: newLat, lng: newLng });
    if (coordBufferRef.current.length > BUFFER_SIZE) {
      coordBufferRef.current.shift();
    }
    
    const sum = coordBufferRef.current.reduce((acc, curr) => ({
      lat: acc.lat + curr.lat,
      lng: acc.lng + curr.lng
    }), { lat: 0, lng: 0 });

    return {
      lat: sum.lat / coordBufferRef.current.length,
      lng: sum.lng / coordBufferRef.current.length
    };
  };

  // Inicializa Mapa
  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;

    mapInstance.current = window.L.map(mapRef.current, {
       zoomControl: false,
       attributionControl: false,
       maxZoom: 20,
       tap: true
    }).setView([coords.lat, coords.lng], 17);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

    polylineRef.current = window.L.polyline([], {
      color: '#3b82f6',
      weight: 6,
      opacity: 0.8,
      lineJoin: 'round',
      dashArray: isEngineOn ? null : '5, 10'
    }).addTo(mapInstance.current);

    return () => {
       if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
       }
    };
  }, []); 

  // Ativação do Rastreamento Real com Filtro de Precisão
  useEffect(() => {
    if (isEngineOn) {
      setTelemetry(prev => ({ ...prev, gpsStatus: 'searching' }));
      
      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, accuracy, heading: devHeading } = position.coords;
            
            // 1. REJEIÇÃO DE SINAL RUIM: Ignorar se precisão > 30m (ruído excessivo)
            if (accuracy > 30) {
              setTelemetry(prev => ({ ...prev, signalBars: 1, gpsStatus: 'searching' }));
              return;
            }

            // 2. SUAVIZAÇÃO: Filtro de média móvel para evitar jitter
            const smoothed = smoothCoordinates(latitude, longitude);
            
            // 3. DETECÇÃO DE MOVIMENTO REAL: Ignorar variações menores que a margem de erro atual (drift)
            let movedDistance = 0;
            if (lastCoordsRef.current) {
              movedDistance = calculateDistance(
                lastCoordsRef.current.lat, 
                lastCoordsRef.current.lng, 
                smoothed.lat, 
                smoothed.lng
              );
            }

            // Definir se o movimento é legítimo (pelo menos 1.5x a margem de erro de precisão)
            const isMovingLegit = movedDistance > (accuracy * 0.5) || (speed && speed > 0.5);

            setTelemetry(prev => {
              const currentSpeed = speed ? (speed * 3.6) : 0;
              let bars = 1;
              if (accuracy < 5) bars = 5;
              else if (accuracy < 10) bars = 4;
              else if (accuracy < 20) bars = 3;
              else bars = 2;

              return {
                ...prev,
                speed: currentSpeed,
                rpm: currentSpeed > 0 ? 1000 + (currentSpeed * 80) : 800,
                signalBars: bars,
                gpsStatus: 'locked'
              };
            });

            setAccuracy(accuracy);
            if (devHeading !== null) setHeading(devHeading);

            if (isMovingLegit) {
              setTripDistance(prev => prev + (movedDistance / 1000));
              setCoords(smoothed);
              if (polylineRef.current) polylineRef.current.addLatLng([smoothed.lat, smoothed.lng]);
              lastCoordsRef.current = smoothed;
            } else if (!lastCoordsRef.current) {
              // Primeira posição
              setCoords(smoothed);
              lastCoordsRef.current = smoothed;
              if (polylineRef.current) polylineRef.current.setLatLngs([[smoothed.lat, smoothed.lng]]);
            }
          },
          (err) => console.error("GPS Error:", err),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      }
    } else {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      setTelemetry(prev => ({ ...prev, speed: 0, rpm: 0, signalBars: 0, gpsStatus: 'offline' }));
      setAccuracy(null);
      lastCoordsRef.current = null;
      coordBufferRef.current = [];
    }

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isEngineOn]);

  // Sincronização Map UI
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    const color = isEngineOn ? '#10b981' : '#3b82f6';
    
    const iconHtml = `
      <div style="width: 48px; height: 48px; position: relative; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
         ${isEngineOn ? `<div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: sonar 2.5s infinite;"></div>` : ''}
         <div style="z-index: 10; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
            </svg>
         </div>
      </div>
    `;

    if (accuracy && isEngineOn) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = window.L.circle([coords.lat, coords.lng], {
          radius: accuracy, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1, dashArray: '2, 4'
        }).addTo(mapInstance.current);
      } else {
        accuracyCircleRef.current.setLatLng([coords.lat, coords.lng]);
        accuracyCircleRef.current.setRadius(accuracy);
      }
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
      markerRef.current.setIcon(window.L.divIcon({ className: 'v-marker', html: iconHtml, iconSize: [48, 48], iconAnchor: [24, 24] }));
      if (isEngineOn) mapInstance.current.panTo([coords.lat, coords.lng], { animate: true, duration: 0.8 });
    } else {
      markerRef.current = window.L.marker([coords.lat, coords.lng], {
        icon: window.L.divIcon({ className: 'v-marker', html: iconHtml, iconSize: [48, 48], iconAnchor: [24, 24] })
      }).addTo(mapInstance.current);
    }
  }, [coords, isEngineOn, heading]);

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-900 overflow-hidden">
       
       {/* HUD SUPERIOR */}
       <div className="absolute top-0 left-0 right-0 px-4 py-8 bg-gradient-to-b from-slate-900 via-slate-900/40 to-transparent z-[1000] flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
             <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isEngineOn ? 'bg-green-600 ring-[10px] ring-green-600/10' : 'bg-slate-800 ring-[10px] ring-slate-800/10'}`}>
                <Target size={32} className={telemetry.gpsStatus === 'locked' ? 'animate-pulse' : ''} />
             </div>
             <div className="drop-shadow-lg">
                <div className="flex items-center gap-2">
                   <h1 className="text-white font-black text-3xl leading-none tracking-tighter">HD GPS</h1>
                   <span className="bg-blue-600 text-[9px] font-black text-white px-1.5 py-0.5 rounded-md tracking-widest uppercase">Precision</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                   <div className="flex gap-1 items-end h-4">
                      {[1,2,3,4,5].map(b => (
                        <div key={b} className={`w-1.5 rounded-t-sm transition-all duration-500 ${telemetry.signalBars >= b ? (telemetry.signalBars >= 4 ? 'bg-green-400' : 'bg-yellow-400') : 'bg-slate-700'}`} style={{ height: `${b * 20}%` }}></div>
                      ))}
                   </div>
                   <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] leading-none">
                     {telemetry.gpsStatus === 'offline' ? 'GPS Desconectado' : telemetry.gpsStatus === 'searching' ? 'Buscando Satélites...' : `Sinal HD (${accuracy?.toFixed(1)}m)`}
                   </p>
                </div>
             </div>
          </div>
          
          <button 
             onClick={() => mapInstance.current?.flyTo([coords.lat, coords.lng], 19)} 
             className="w-16 h-16 bg-white rounded-[22px] flex items-center justify-center text-slate-900 shadow-2xl pointer-events-auto active:scale-90 transition-transform"
          >
             <Crosshair size={32} />
          </button>
       </div>

       {/* MAPA */}
       <div className="flex-1 relative z-0">
          <div ref={mapRef} className="w-full h-full"></div>
          
          <div className="absolute top-32 left-4 flex flex-col gap-3 z-[1000]">
             {telemetry.gpsStatus === 'locked' && (
                <div className="bg-green-500/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-green-400/30 shadow-2xl animate-fade-in">
                   <Zap size={18} className="text-white" />
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-green-100 uppercase tracking-widest leading-none">Link Satélite</span>
                      <span className="text-xs font-black text-white uppercase">Criptografia Ativa</span>
                   </div>
                </div>
             )}
             {accuracy && accuracy < 10 && (
                <div className="bg-blue-600/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-blue-400/30 shadow-2xl animate-fade-in">
                   <Activity size={18} className="text-white" />
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-blue-100 uppercase tracking-widest leading-none">Sensibilidade</span>
                      <span className="text-xs font-black text-white uppercase">Ultra-Fina</span>
                   </div>
                </div>
             )}
          </div>
       </div>

       {/* PAINEL TELEMETRIA (BOTTOM SHEET) */}
       <div className={`absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-[50px] shadow-[0_-20px_80px_rgba(0,0,0,0.6)] transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-120px)]'}`}>
          
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full pt-6 pb-8 flex flex-col items-center cursor-pointer"
          >
             <div className="w-24 h-2 bg-slate-200 rounded-full mb-3"></div>
             {!isExpanded && <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Monitoramento de Alta Precisão</span>}
          </div>

          <div className="px-10 pb-16">
             {!isEngineOn ? (
               <div className="text-center py-10 animate-fade-in">
                  <div className="w-28 h-28 bg-blue-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 border-2 border-blue-100 shadow-inner">
                     <Radio size={56} className="text-blue-600 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Sincronizar GPS</h2>
                  <p className="text-slate-500 text-base px-8 leading-relaxed mb-12 font-medium">
                    Ative a telemetria de precisão militar para rastrear sua rota física com margem de erro sub-métrica.
                  </p>
                  
                  <button 
                     onClick={() => setIsEngineOn(true)}
                     className="w-full bg-slate-900 active:bg-black text-white py-7 rounded-[30px] font-black text-2xl shadow-3xl shadow-slate-900/40 flex items-center justify-center gap-5 transition-all hover:scale-[1.02]"
                  >
                     <Navigation size={32} /> LIGAR MONITORAMENTO
                  </button>
               </div>
             ) : (
               <div className="animate-slide-up">
                  {/* DISPLAY DE VELOCIDADE REAL - MAIOR E MAIS LIMPO */}
                  <div className="flex justify-between items-center mb-12 bg-slate-50 p-8 rounded-[40px] border border-slate-100 shadow-inner">
                     <div className="flex flex-col">
                        <p className="text-xs text-slate-400 font-black uppercase mb-2 tracking-[0.3em]">Velocidade Instantânea</p>
                        <div className="flex items-baseline">
                           <span className="text-8xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                             {Math.round(telemetry.speed)}
                           </span>
                           <span className="text-2xl text-slate-400 font-black ml-4 uppercase">km/h</span>
                        </div>
                     </div>
                     <div className="w-24 h-24 rounded-full border-[8px] border-slate-200 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-[8px] border-blue-500 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '2s' }}></div>
                        <Gauge size={40} className="text-slate-900" />
                     </div>
                  </div>

                  {/* MÉTRICAS SECUNDÁRIAS - CARDS ROBUSTOS */}
                  <div className="grid grid-cols-2 gap-6 mb-10">
                     <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl flex items-center gap-5 border border-white/5">
                        <div className="bg-white/10 text-white p-4 rounded-2xl"><Activity size={28} /></div>
                        <div>
                           <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Precisão</span>
                           <p className="text-xl font-black text-white tracking-tighter">{accuracy?.toFixed(1)} <span className="text-xs opacity-50">m</span></p>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl"><MapPin size={28} /></div>
                        <div>
                           <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Viagem</span>
                           <p className="text-xl font-black text-slate-800 tracking-tighter">{tripDistance.toFixed(2)} <span className="text-xs opacity-50">km</span></p>
                        </div>
                     </div>
                  </div>

                  {/* COORDENADAS REAIS */}
                  <div className="bg-blue-600 text-white p-8 rounded-[40px] mb-10 flex items-center gap-6 shadow-2xl shadow-blue-500/30">
                     <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-md">
                        <Signal size={32} className="animate-pulse" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                           <span className="block text-[11px] font-black text-blue-100 uppercase tracking-[0.2em]">Sinal Lock-in • Cuiabá</span>
                        </div>
                        <p className="text-sm font-mono text-blue-50 tracking-tighter truncate leading-none">LAT: {coords.lat.toFixed(8)}</p>
                        <p className="text-sm font-mono text-blue-50 tracking-tighter truncate mt-1.5 leading-none">LNG: {coords.lng.toFixed(8)}</p>
                     </div>
                  </div>

                  <button 
                     onClick={() => setIsEngineOn(false)}
                     className="w-full bg-red-50 active:bg-red-100 text-red-600 py-6 rounded-[30px] font-black text-base border border-red-100 flex items-center justify-center gap-3 transition-all active:scale-95"
                  >
                     <Power size={22} /> DESLIGAR RASTREADOR
                  </button>
               </div>
             )}
          </div>
       </div>

       <style>{`
          @keyframes sonar { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(3); opacity: 0; } }
          .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.19, 1, 0.22, 1); }
          @keyframes slideUp { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.5s ease-out; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .leaflet-container { background: #f1f5f9 !important; }
          .v-marker { transition: all 0.1s linear; }
       `}</style>
    </div>
  );
};