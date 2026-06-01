import { Radio } from 'lucide-react';

interface Props {
  rssiPercent: number | null;
}

export default function SignalCard({ rssiPercent }: Props) {
  if (rssiPercent === null) return null;
  const isWeak = rssiPercent < 30;
  const isFair = rssiPercent < 60;

  const color = isWeak ? 'bg-alert-red' : isFair ? 'bg-alert-orange' : 'bg-neon-green';
  const textColor = isWeak ? 'text-alert-red' : isFair ? 'text-alert-orange' : 'text-neon-green';

  return (
    <div className="panel-module">
      <div className="panel-title">
        <Radio size={14} />
        SİQNAL GÜCİ (RSSI)
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className={`text-xl font-bold tabular-nums ${textColor}`}>
          {rssiPercent.toFixed(0)}%
        </span>
        <div className="flex-1 h-2 bg-military-black rounded overflow-hidden border border-military-border">
          <div
            className={`h-full rounded transition-all duration-300 ${color}`}
            style={{ width: `${rssiPercent}%` }}
          />
        </div>
        {isWeak && (
          <span className="text-xs text-alert-red animate-pulse font-bold">ZƏİF</span>
        )}
      </div>
    </div>
  );
}
