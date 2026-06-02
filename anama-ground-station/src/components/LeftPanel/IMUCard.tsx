import { Navigation } from 'lucide-react';

interface Props {
  imu: { roll: number; pitch: number; yaw: number; tipOverRisk: boolean } | null;
}

export default function IMUCard({ imu }: Props) {
  if (!imu) return null;

  return (
    <div className={`panel-module ${imu.tipOverRisk ? 'border-alert-red' : ''}`}>
      <div className="panel-title">
        <Navigation size={14} />
        IMU / ORİYENTASİYA
        {imu.tipOverRisk && (
          <span className="ml-auto text-alert-red text-xs font-bold animate-pulse">⚠ AŞILMA RİSKİ</span>
        )}
      </div>

      {imu.tipOverRisk && (
        <div className="mt-1 bg-alert-red bg-opacity-20 border border-alert-red rounded p-1.5 text-center animate-pulse">
          <span className="text-alert-red font-bold text-xs tracking-widest">⚠ AŞILMA XƏBƏRDARLICI ⚠</span>
        </div>
      )}

      <div className="mt-2 space-y-1 text-xs font-mono">
        <IMURow label="ROLL" value={imu.roll} warn={Math.abs(imu.roll) > 15} />
        <IMURow label="PITCH" value={imu.pitch} warn={Math.abs(imu.pitch) > 15} />
        <IMURow label="YAW" value={imu.yaw} />
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
