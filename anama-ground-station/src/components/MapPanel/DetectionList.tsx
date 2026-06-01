import { AlertTriangle, Trash2 } from 'lucide-react';
import type { Detection } from '../../types/telemetry';

interface Props {
  detections: Detection[];
  onClear: () => void;
}

export default function DetectionList({ detections, onClear }: Props) {
  return (
    <div className="panel-module flex flex-col h-full">
      <div className="panel-title justify-between">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-alert-red" />
          DETECTIONS
          <span className="ml-1 bg-alert-red text-white text-xs rounded-full px-1.5 font-bold">
            {detections.length}
          </span>
        </div>
        {detections.length > 0 && (
          <button onClick={onClear} className="text-gray-500 hover:text-alert-red transition-colors">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 mt-2 pr-1 scrollbar-thin">
        {detections.length === 0 && (
          <p className="text-gray-600 text-xs text-center mt-4">No detections yet</p>
        )}
        {detections.map(d => (
          <div
            key={d.id}
            className={`rounded p-1.5 border text-xs font-mono ${
              d.type === 'MINE'
                ? 'border-alert-red border-opacity-40 bg-red-950 bg-opacity-20'
                : 'border-alert-orange border-opacity-40 bg-orange-950 bg-opacity-20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-bold ${d.type === 'MINE' ? 'text-alert-red' : 'text-alert-orange'}`}>
                {d.type === 'MINE' ? '💣' : '⚠'} {d.type} #{String(d.id).padStart(3, '0')}
              </span>
              <span className="text-alert-yellow text-xs">{d.confidence}%</span>
            </div>
            <div className="text-gray-400 mt-0.5 text-xs">
              {d.lat.toFixed(5)}°N, {d.lng.toFixed(5)}°E
            </div>
            {d.depthCm && <div className="text-gray-500 text-xs">Depth: {d.depthCm} cm</div>}
            <div className="text-gray-600 text-xs">{new Date(d.timestamp).toLocaleTimeString('en-GB')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
