import { Battery, Zap, Thermometer } from 'lucide-react';
import type { Telemetry } from '../../types/telemetry';

interface Props {
  battery: Telemetry['battery'] | null;
}

export default function BatteryCard({ battery }: Props) {
  if (!battery) return <div className="panel-module animate-pulse h-32 bg-military-panel rounded" />;

  const { percent, voltage, current, tempC, estimatedMinutesLeft } = battery;
  const isCritical = percent < 15;
  const isWarning = percent < 30;

  const barColor = isCritical
    ? 'bg-alert-red shadow-neon-red'
    : isWarning
    ? 'bg-alert-orange'
    : 'bg-neon-green shadow-neon';

  return (
    <div className={`panel-module ${isCritical ? 'border-alert-red animate-pulse' : ''}`}>
      <div className="panel-title">
        <Battery size={14} />
        BATTERY
        {isCritical && (
          <span className="ml-auto text-alert-red text-xs font-bold animate-pulse">⚠ CRITICAL</span>
        )}
      </div>

      {/* Percent bar */}
      <div className="mt-2">
        <div className="flex justify-between items-baseline mb-1">
          <span className={`text-2xl font-bold tabular-nums ${
            isCritical ? 'text-alert-red' : isWarning ? 'text-alert-orange' : 'text-neon-green'
          }`}>
            {percent.toFixed(1)}%
          </span>
          <span className="text-gray-400 text-xs">{estimatedMinutesLeft} min left</span>
        </div>
        <div className="h-3 bg-military-black rounded overflow-hidden border border-military-border">
          <div
            className={`h-full rounded transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.max(2, percent)}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <StatItem icon={<Zap size={11} />} label="VOLT" value={`${voltage.toFixed(1)}V`} />
        <StatItem icon={<Zap size={11} />} label="CURR" value={`${current.toFixed(1)}A`} />
        <StatItem
          icon={<Thermometer size={11} />}
          label="TEMP"
          value={`${tempC.toFixed(0)}°C`}
          warn={tempC > 45}
        />
      </div>
    </div>
  );
}

function StatItem({
  icon, label, value, warn = false
}: { icon: React.ReactNode; label: string; value: string; warn?: boolean }) {
  return (
    <div className="bg-military-black rounded p-1.5 text-center border border-military-border">
      <div className={`flex items-center justify-center gap-0.5 mb-0.5 text-xs ${warn ? 'text-alert-red' : 'text-gray-400'}`}>
        {icon} <span>{label}</span>
      </div>
      <div className={`text-xs font-bold tabular-nums ${warn ? 'text-alert-red' : 'text-neon-green'}`}>
        {value}
      </div>
    </div>
  );
}
