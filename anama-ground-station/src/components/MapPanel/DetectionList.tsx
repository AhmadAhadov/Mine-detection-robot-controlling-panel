import { AlertTriangle, Trash2, FileDown, FileSpreadsheet } from 'lucide-react';
import type { Detection } from '../../types/telemetry';
import { exportPDF, exportExcel } from '../../lib/reportExport';

interface Props {
  detections: Detection[];
  onClear: () => void;
}

export default function DetectionList({ detections, onClear }: Props) {
  return (
    <div className="panel-module flex flex-col h-full">
      {/* Başlıq */}
      <div className="panel-title justify-between">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-alert-red" />
          AŞKARLAMALAR
          <span className="ml-1 bg-alert-red text-white text-xs rounded-full px-1.5 font-bold">
            {detections.length}
          </span>
        </div>
        {detections.length > 0 && (
          <button onClick={onClear} className="text-gray-500 hover:text-alert-red transition-colors" title="Siyahını təmizlə">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Siyahı */}
      <div className="flex-1 overflow-y-auto space-y-1 mt-2 pr-0.5 min-h-0">
        {detections.length === 0 && (
          <p className="text-gray-600 text-xs text-center mt-4">Hələ aşkarlama yoxdur</p>
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
                {d.type === 'MINE' ? '💣' : '⚠'} {d.type === 'MINE' ? 'MİNA' : 'METAL'} #{String(d.id).padStart(3, '0')}
              </span>
              <span className="text-alert-yellow text-xs">{d.confidence}%</span>
            </div>
            <div className="text-gray-400 mt-0.5 text-xs">
              {d.lat.toFixed(5)}°N, {d.lng.toFixed(5)}°E
            </div>
            {d.depthCm && <div className="text-gray-500 text-xs">Dərinlik: {d.depthCm} sm</div>}
            <div className="text-gray-600 text-xs">{new Date(d.timestamp).toLocaleTimeString('az-AZ')}</div>
          </div>
        ))}
      </div>

      {/* İxrac düymələri */}
      <div className="mt-2 pt-2 border-t border-military-border flex gap-1.5">
        <button
          onClick={() => exportPDF(detections)}
          disabled={detections.length === 0}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-mono rounded border border-military-border text-gray-400 hover:border-neon-green hover:text-neon-green transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          title="PDF kimi saxla"
        >
          <FileDown size={12} />
          PDF
        </button>
        <button
          onClick={() => exportExcel(detections)}
          disabled={detections.length === 0}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-mono rounded border border-military-border text-gray-400 hover:border-alert-orange hover:text-alert-orange transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          title="Excel kimi saxla"
        >
          <FileSpreadsheet size={12} />
          Excel
        </button>
      </div>
    </div>
  );
}
