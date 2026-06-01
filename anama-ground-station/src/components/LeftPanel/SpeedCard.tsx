import { Gauge } from 'lucide-react';

interface Props {
  speedKmh: number | null;
}

const MAX_SPEED = 5; // robot max speed km/h

export default function SpeedCard({ speedKmh }: Props) {
  if (speedKmh === null) return null;

  const pct = Math.min(100, (speedKmh / MAX_SPEED) * 100);
  const isMoving = speedKmh > 0.1;
  const color = speedKmh > MAX_SPEED * 0.8
    ? 'text-alert-red'
    : speedKmh > MAX_SPEED * 0.5
    ? 'text-alert-orange'
    : 'text-neon-green';
  const barColor = speedKmh > MAX_SPEED * 0.8
    ? 'bg-alert-red'
    : speedKmh > MAX_SPEED * 0.5
    ? 'bg-alert-orange'
    : 'bg-neon-green';

  return (
    <div className="panel-module">
      <div className="panel-title">
        <Gauge size={14} />
        SÜRƏT
        <span className={`ml-auto text-xs font-bold tabular-nums ${color}`}>
          {speedKmh.toFixed(1)} km/s
        </span>
      </div>

      <div className="mt-2 space-y-1.5">
        {/* Progress bar */}
        <div className="h-3 bg-military-black rounded overflow-hidden border border-military-border">
          <div
            className={`h-full rounded transition-all duration-300 ${barColor}`}
            style={{ width: `${pct}%`, opacity: 0.85 }}
          />
        </div>

        {/* Tick marks */}
        <div className="flex justify-between text-gray-600 text-xs px-0.5">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>

        {/* Status */}
        <div className="flex justify-between text-xs font-mono mt-0.5">
          <span className="text-gray-500">VƏZİYYƏT</span>
          <span className={isMoving ? 'text-neon-green' : 'text-gray-500'}>
            {isMoving ? 'HAREKƏTDƏDİR' : 'DAYANIB'}
          </span>
        </div>
      </div>
    </div>
  );
}
