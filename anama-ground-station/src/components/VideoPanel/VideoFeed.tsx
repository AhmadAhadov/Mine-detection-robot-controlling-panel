import { useState } from 'react';
import { Camera, Thermometer, Circle } from 'lucide-react';

interface Props {
  streamUrl?: string;
  isSimulation: boolean;
}

export default function VideoFeed({ streamUrl, isSimulation }: Props) {
  const [isThermal, setIsThermal] = useState(false);

  return (
    <div className="panel-module flex flex-col h-full">
      <div className="panel-title justify-between">
        <div className="flex items-center gap-1.5">
          <Camera size={14} />
          FPV CAMERA FEED
        </div>
        <div className="flex items-center gap-1.5">
          {/* Live badge */}
          <div className="flex items-center gap-1 text-xs">
            <Circle size={7} className="text-alert-red fill-alert-red animate-pulse" />
            <span className="text-alert-red font-bold">LIVE</span>
          </div>
          {/* Camera toggle */}
          <div className="flex items-center gap-1 bg-military-black rounded border border-military-border">
            <button
              onClick={() => setIsThermal(false)}
              className={`px-2 py-0.5 text-xs rounded-l transition-colors flex items-center gap-1 ${
                !isThermal ? 'bg-neon-green-dim text-neon-green' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Camera size={10} /> RGB
            </button>
            <button
              onClick={() => setIsThermal(true)}
              className={`px-2 py-0.5 text-xs rounded-r transition-colors flex items-center gap-1 ${
                isThermal ? 'bg-red-900 text-alert-orange' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Thermometer size={10} /> LWIR
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-black rounded overflow-hidden mt-2" style={{ minHeight: 120 }}>
        {isSimulation ? (
          <SimulationPlaceholder isThermal={isThermal} />
        ) : streamUrl ? (
          <img
            src={isThermal ? streamUrl.replace('rgb', 'thermal') : streamUrl}
            alt="FPV Feed"
            className="w-full h-full object-cover"
          />
        ) : (
          <NoStreamPlaceholder />
        )}
      </div>
    </div>
  );
}

function SimulationPlaceholder({ isThermal }: { isThermal: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: isThermal
          ? 'radial-gradient(ellipse at center, #ff4400 0%, #220000 60%, #000 100%)'
          : 'linear-gradient(135deg, #0a0e0a 0%, #0d1a0d 50%, #0a0e0a 100%)',
      }}
    >
      {/* Crosshair overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" className="opacity-30">
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#39ff14" strokeWidth="0.5" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#39ff14" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="30" stroke="#39ff14" strokeWidth="0.5" fill="none" />
          <circle cx="50%" cy="50%" r="5" stroke="#39ff14" strokeWidth="0.5" fill="none" />
        </svg>
      </div>
      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#39ff14 1px, transparent 1px), linear-gradient(90deg, #39ff14 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="text-center z-10">
        <Camera size={32} className={`mx-auto mb-2 opacity-30 ${isThermal ? 'text-alert-orange' : 'text-neon-green'}`} />
        <p className={`text-xs font-mono opacity-60 ${isThermal ? 'text-alert-orange' : 'text-neon-green'}`}>
          {isThermal ? 'LWIR THERMAL SIMULATION' : 'RGB CAMERA SIMULATION'}
        </p>
        <p className="text-gray-600 text-xs mt-1 font-mono">No stream in simulation mode</p>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-neon-green opacity-60" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-neon-green opacity-60" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-neon-green opacity-60" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-neon-green opacity-60" />

      {/* HUD info */}
      <div className="absolute top-3 left-3 text-neon-green font-mono text-xs opacity-70 space-y-0.5">
        <div>CAM: {isThermal ? 'LWIR 25Hz' : 'RGB 30Hz'}</div>
        <div>RES: 1920x1080</div>
      </div>
    </div>
  );
}

function NoStreamPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
      <Camera size={28} className="mb-2 opacity-30" />
      <p className="text-xs font-mono">NO STREAM</p>
    </div>
  );
}
