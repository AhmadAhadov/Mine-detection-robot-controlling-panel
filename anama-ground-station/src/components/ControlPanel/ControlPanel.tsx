import { useState } from 'react';
import { Gamepad2, Bot, FileDown, FileSpreadsheet } from 'lucide-react';
import EStop from './EStop';
import VirtualJoystick from './VirtualJoystick';
import type { Detection } from '../../types/telemetry';
import { exportPDF, exportExcel } from '../../lib/reportExport';

interface Props {
  isEStop: boolean;
  onEStop: () => void;
  onReset: () => void;
  detections: Detection[];
}

export default function ControlPanel({ isEStop, onEStop, onReset, detections }: Props) {
  const [robotMode, setRobotMode] = useState<'AUTONOMOUS' | 'MANUAL'>('AUTONOMOUS');
  const isManual = robotMode === 'MANUAL' && !isEStop;

  const handleCommand = (_cmd: { x: number; y: number }) => {
    // In LIVE mode this would send over WebSocket
  };

  return (
    <div className="panel-module flex flex-col h-full gap-3">
      <div className="panel-title">
        <Gamepad2 size={14} />
        İDARƏETMƏ PANELİ
      </div>

      {/* Mode toggle */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-gray-500 text-xs font-mono">İŞ REJİMİ</span>
        <div className="flex rounded border border-military-border overflow-hidden">
          <button
            onClick={() => setRobotMode('AUTONOMOUS')}
            disabled={isEStop}
            className={`px-3 py-2 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors ${
              robotMode === 'AUTONOMOUS'
                ? 'bg-neon-green-dim text-neon-green'
                : 'bg-military-black text-gray-500 hover:text-gray-300'
            } ${isEStop ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Bot size={13} /> AVTONOM
          </button>
          <div className="w-px bg-military-border" />
          <button
            onClick={() => setRobotMode('MANUAL')}
            disabled={isEStop}
            className={`px-3 py-2 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors ${
              robotMode === 'MANUAL'
                ? 'bg-orange-900 text-alert-orange'
                : 'bg-military-black text-gray-500 hover:text-gray-300'
            } ${isEStop ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Gamepad2 size={13} /> ƏLLƏ İDARƏ
          </button>
        </div>
        {isManual && (
          <span className="text-alert-orange text-xs font-mono animate-pulse">⚠ ƏLLƏ İDARƏ AKTİVDİR</span>
        )}
      </div>

      {/* Joystick */}
      <div className="flex justify-center">
        <VirtualJoystick disabled={!isManual} onCommand={handleCommand} />
      </div>

      {/* E-Stop */}
      <div className="mt-auto">
        <EStop isEStop={isEStop} onEStop={onEStop} onReset={onReset} />
      </div>

      {/* Export buttons */}
      <div className="border-t border-military-border pt-2">
        <p className="text-gray-500 text-xs font-mono text-center mb-2">HESABAT İXRACI</p>
        <div className="flex gap-2">
          <button
            onClick={() => exportPDF(detections)}
            disabled={detections.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-mono border border-military-border rounded text-gray-300 hover:border-neon-green hover:text-neon-green transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FileDown size={13} /> PDF
          </button>
          <button
            onClick={() => exportExcel(detections)}
            disabled={detections.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-mono border border-military-border rounded text-gray-300 hover:border-alert-orange hover:text-alert-orange transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={13} /> EXCEL
          </button>
        </div>
      </div>
    </div>
  );
}
