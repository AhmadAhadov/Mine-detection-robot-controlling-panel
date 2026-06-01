import { useEffect, useState } from 'react';
import { Shield, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';
import type { DataMode } from '../../types/telemetry';

interface Props {
  isOnline: boolean;
  mode: 'AUTONOMOUS' | 'MANUAL' | null;
  dataMode: DataMode;
  setDataMode: (m: DataMode) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isEStop: boolean;
}

export default function StatusBar({ isOnline, mode, dataMode, setDataMode, isMuted, toggleMute, isEStop }: Props) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-10 flex items-center justify-between px-4 bg-military-dark border-b border-military-border font-mono text-sm select-none">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Shield size={18} className="text-neon-green" />
        <span className="text-neon-green font-bold tracking-widest text-xs">MDEF OS</span>
        <span className="text-gray-500 text-xs">Yer Stansiyası v1.0</span>
      </div>

      {/* Center status */}
      <div className="flex items-center gap-4">
        {/* E-Stop indicator */}
        {isEStop && (
          <span className="text-alert-red font-bold text-xs animate-pulse tracking-widest">
            ⬛ TƏCİLİ DAYANMA AKTİVDİR
          </span>
        )}

        {/* Online / Offline */}
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <>
              <Wifi size={14} className="text-neon-green" />
              <span className="text-neon-green text-xs font-bold">ROBOT ONLAYNdır</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-alert-red" />
              <span className="text-alert-red text-xs font-bold animate-pulse">OFFLAYNdır</span>
            </>
          )}
        </div>

        {/* Robot mode */}
        {mode && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
            mode === 'AUTONOMOUS'
              ? 'border-neon-green text-neon-green'
              : 'border-alert-orange text-alert-orange'
          }`}>
            {mode === 'AUTONOMOUS' ? 'AVTONOM' : 'ƏLLƏ İDARƏ'}
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Data mode toggle */}
        <div className="flex items-center gap-1 bg-military-black rounded border border-military-border">
          <button
            onClick={() => setDataMode('SIMULATION')}
            className={`px-2 py-0.5 text-xs rounded-l transition-colors ${
              dataMode === 'SIMULATION'
                ? 'bg-neon-green-dim text-neon-green font-bold'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            SIM
          </button>
          <button
            onClick={() => setDataMode('LIVE')}
            className={`px-2 py-0.5 text-xs rounded-r transition-colors ${
              dataMode === 'LIVE'
                ? 'bg-red-900 text-alert-red font-bold'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            LIVE
          </button>
        </div>

        {/* Mute */}
        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Clock */}
        <span className="text-neon-green text-xs font-bold tabular-nums">
          {time.toLocaleTimeString('en-GB', { hour12: false })}
        </span>
        <span className="text-gray-500 text-xs">
          {time.toLocaleDateString('en-GB')}
        </span>
      </div>
    </div>
  );
}
