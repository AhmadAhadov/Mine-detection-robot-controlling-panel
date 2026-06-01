import { Navigation } from 'lucide-react';

interface Props {
  imu: { roll: number; pitch: number; yaw: number; tipOverRisk: boolean } | null;
}

function ArtificialHorizon({ roll, pitch }: { roll: number; pitch: number }) {
  const clampedPitch = Math.max(-30, Math.min(30, pitch));

  return (
    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-military-border bg-military-black mx-auto">
      {/* Sky */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          transform: `rotate(${-roll}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <div
          className="w-full bg-blue-900 opacity-80"
          style={{ height: `${50 + clampedPitch * 1.5}%` }}
        />
        <div className="w-full flex-1 bg-amber-900 opacity-80" />
      </div>
      {/* Horizon line */}
      <div
        className="absolute w-full border-t border-white opacity-60"
        style={{
          top: `${50 + clampedPitch * 1.5}%`,
          transform: `rotate(${-roll}deg)`,
          transformOrigin: 'center center',
        }}
      />
      {/* Aircraft symbol */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-10 h-0.5 bg-neon-green" />
        <div className="absolute w-0.5 h-3 bg-neon-green" />
      </div>
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
      </div>
    </div>
  );
}

export default function IMUCard({ imu }: Props) {
  if (!imu) return null;

  return (
    <div className={`panel-module ${imu.tipOverRisk ? 'border-alert-red' : ''}`}>
      <div className="panel-title">
        <Navigation size={14} />
        IMU / ORIYENTASIYA
        {imu.tipOverRisk && (
          <span className="ml-auto text-alert-red text-xs font-bold animate-pulse">⚠ AŞILMA RİSKİ</span>
        )}
      </div>

      {imu.tipOverRisk && (
        <div className="mt-1 bg-alert-red bg-opacity-20 border border-alert-red rounded p-1.5 text-center animate-pulse">
          <span className="text-alert-red font-bold text-xs tracking-widest">⚠ AŞILMA XƏBƏRDARLICI ⚠</span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-3">
        <ArtificialHorizon roll={imu.roll} pitch={imu.pitch} />

        <div className="flex-1 space-y-1 text-xs font-mono">
          <IMURow label="YALPA" value={imu.roll} warn={Math.abs(imu.roll) > 15} />
          <IMURow label="TRIM" value={imu.pitch} warn={Math.abs(imu.pitch) > 15} />
          <IMURow label="KURs" value={imu.yaw} />
        </div>
      </div>
    </div>
  );
}

function IMURow({ label, value, warn = false }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className={`tabular-nums font-bold ${warn ? 'text-alert-red' : 'text-neon-green'}`}>
        {value >= 0 ? '+' : ''}{value.toFixed(1)}°
      </span>
    </div>
  );
}
