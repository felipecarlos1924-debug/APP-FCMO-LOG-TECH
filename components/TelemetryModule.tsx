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
  const coordBufferRef = useRef<{lat: number, lng: number}[]>([]);

  const [telemetry, setTelemetry] = useState({
    rpm: 0,
    temp: 24,
    speed: 0,
    signalBars: 0,
    gpsStatus: 'offline' as 'offline' | 'searching' | 'locked'
  });

  const smoothCoordinates = (newLat: number, newLng: number) => {
    coordBufferRef.current.push({ lat: newLat, lng: newLng });
    if (coordBufferRef.current.length > 3) coordBufferRef.current.shift();
    const sum = coordBufferRef.current.reduce((acc, curr) => ({ lat: acc.lat + curr.lat, lng: acc.lng + curr.lng }), { lat: 0, lng: 0 });
    return { lat: sum.lat / coordBufferRef.current.length, lng: sum.lng / coordBufferRef.current.length };
  };

  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;
    mapInstance.current = window.L.map(mapRef.current, { zoomControl: false, attributionControl: false, maxZoom: 20, tap: true }).setView([coords.lat, coords.lng], 17);
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
    polylineRef.current = window.L.polyline([], { color: '#2563eb', weight: 6, opacity: 0.8, lineJoin: 'round' }).addTo(mapInstance.current);
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, []); 

  useEffect(() => {
    if (isEngineOn) {
      setTelemetry(prev => ({ ...prev, gpsStatus: 'searching' }));
      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition((pos) => {
          const { latitude, longitude, speed, accuracy, heading: devHeading } = pos.coords;
          if (accuracy > 35) return;
          const smoothed = smoothCoordinates(latitude, longitude);
          setTelemetry(prev => ({ ...prev, speed: speed ? (speed * 3.6) : 0, signalBars: accuracy < 10 ? 5 : accuracy < 20 ? 4 : 3, gpsStatus: 'locked' }));
          setAccuracy(accuracy);
          if (devHeading !== null) setHeading(devHeading);
          setCoords(smoothed);
          if (polylineRef.current) polylineRef.current.addLatLng([smoothed.lat, smoothed.lng]);
        }, null, { enableHighAccuracy: true });
      }
    } else {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      setTelemetry(prev => ({ ...prev, speed: 0, rpm: 0, signalBars: 0, gpsStatus: 'offline' }));
    }
  }, [isEngineOn]);

  useEffect(() => {
    if (!mapInstance.current || !window.L) return;
    const color = isEngineOn ? '#10b981' : '#2563eb';
    const iconHtml = `
      <div style="width: 48px; height: 48px; transform: rotate(${heading}deg); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
         <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
            <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="${color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
         </svg>
      </div>
    `;
    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
      markerRef.current.setIcon(window.L.divIcon({ className: 'v-marker', html: iconHtml, iconSize: [48, 48], iconAnchor: [24, 24] }));
      if (isEngineOn) mapInstance.current.panTo([coords.lat, coords.lng], { animate: true, duration: 0.8 });
    } else {
      markerRef.current = window.L.marker([coords.lat, coords.lng], { icon: window.L.divIcon({ className: 'v-marker', html: iconHtml, iconSize: [48, 48], iconAnchor: [24, 24] }) }).addTo(mapInstance.current);
    }
  }, [coords, isEngineOn, heading]);

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-100 overflow-hidden">
       
       {/* HUD SUPERIOR DE ALTO CONTRASTE */}
       <div className="absolute top-0 left-0 right-0 px-6 py-10 bg-gradient-to-b from-slate-950 via-slate-900/60 to-transparent z-[1000] flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-5 pointer-events-auto">
             <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isEngineOn ? 'bg-green-600 ring-[12px] ring-green-600/10' : 'bg-slate-800 ring-[12px] ring-slate-800/10'}`}>
                <Target size={32} />
             </div>
             <div className="drop-shadow-lg">
                <div className="flex items-center gap-3">
                   <h1 className="text-white font-black text-3xl leading-none tracking-tighter uppercase">Rastreamento</h1>
                   <span className="bg-blue-600 text-[10px] font-black text-white px-2 py-1 rounded-md tracking-widest uppercase">PRO</span>
                </div>
                <div className="flex items-center gap-4 mt-3">
                   <div className="flex gap-1 items-end h-4">
                      {[1,2,3,4,5].map(b => (
                        <div key={b} className={`w-1.5 rounded-t-sm transition-all duration-500 ${telemetry.signalBars >= b ? 'bg-green-400' : 'bg-slate-700'}`} style={{ height: `${b * 20}%` }}></div>
                      ))}
                   </div>
                   <p className="text-[11px] font-black uppercase text-slate-100 tracking-[0.2em] leading-none">
                     {telemetry.gpsStatus === 'offline' ? 'Desconectado' : telemetry.gpsStatus === 'searching' ? 'Sincronizando...' : `GPS Ativo (${accuracy?.toFixed(1)}m)`}
                   </p>
                </div>
             </div>
          </div>
          
          <button onClick={() => mapInstance.current?.flyTo([coords.lat, coords.lng], 19)} className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-slate-900 shadow-2xl pointer-events-auto active:scale-90 transition-transform">
             <Crosshair size={32} />
          </button>
       </div>

       {/* MAPA */}
       <div className="flex-1 relative z-0">
          <div ref={mapRef} className="w-full h-full"></div>
       </div>

       {/* PAINEL TELEMETRIA (BOTTOM SHEET) */}
       <div className={`absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-[56px] shadow-[0_-15px_60px_rgba(0,0,0,0.5)] transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-120px)]'}`}>
          <div onClick={() => setIsExpanded(!isExpanded)} className="w-full pt-6 pb-8 flex flex-col items-center cursor-pointer">
             <div className="w-24 h-2 bg-slate-200 rounded-full mb-3"></div>
             {!isExpanded && <span className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Exibir Telemetria</span>}
          </div>

          <div className="px-10 pb-16">
             {!isEngineOn ? (
               <div className="text-center py-10 animate-fade-in">
                  <div className="w-28 h-28 bg-blue-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 border-2 border-blue-100 shadow-inner">
                     <Radio size={56} className="text-blue-600" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Iniciar Log GPS</h2>
                  <p className="text-slate-500 text-base px-8 leading-relaxed mb-12 font-medium">Sincronize sua localização real com a central FCMO.</p>
                  <button onClick={() => setIsEngineOn(true)} className="w-full bg-slate-900 text-white py-7 rounded-[30px] font-black text-2xl shadow-3xl flex items-center justify-center gap-5 hover:bg-black transition-all">
                     <Navigation size={32} /> ATIVAR RASTREADOR
                  </button>
               </div>
             ) : (
               <div className="animate-slide-up">
                  <div className="flex justify-between items-center mb-10 bg-slate-50 p-8 rounded-[40px] border border-slate-200 shadow-inner">
                     <div className="flex flex-col">
                        <p className="text-xs text-slate-400 font-extrabold uppercase mb-2 tracking-widest">Velocidade Atual</p>
                        <div className="flex items-baseline">
                           <span className="text-8xl font-black text-slate-900 tracking-tighter leading-none">{Math.round(telemetry.speed)}</span>
                           <span className="text-2xl text-slate-400 font-black ml-4 uppercase">km/h</span>
                        </div>
                     </div>
                     <Gauge size={48} className="text-slate-900 opacity-20" />
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                     <div className="bg-slate-900 p-7 rounded-[32px] flex items-center gap-5 shadow-xl">
                        <div className="bg-white/10 text-white p-4 rounded-2xl"><Activity size={28} /></div>
                        <div>
                           <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Precisão</span>
                           <p className="text-2xl font-black text-white tracking-tighter">{accuracy?.toFixed(1)} <span className="text-xs opacity-50">m</span></p>
                        </div>
                     </div>
                     <div className="bg-white p-7 rounded-[32px] border border-slate-200 flex items-center gap-5">
                        <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl"><MapPin size={28} /></div>
                        <div>
                           <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percurso</span>
                           <p className="text-2xl font-black text-slate-900 tracking-tighter">{tripDistance.toFixed(2)} <span className="text-xs opacity-50">km</span></p>
                        </div>
                     </div>
                  </div>

                  <button onClick={() => setIsEngineOn(false)} className="w-full bg-red-50 text-red-600 py-6 rounded-[30px] font-black text-base border border-red-100 flex items-center justify-center gap-3 active:scale-95 transition-all">
                     <Power size={22} /> ENCERRAR VIAGEM
                  </button>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};