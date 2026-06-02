import { Cpu, Thermometer, Zap, Box } from 'lucide-react';

interface Props {
  cpuTempC: number | null;
  gpuTempC: number | null;
  stm32TempC: number | null;
  motorDriverTempC: number | null;
  motorTempC: number | null;
  enclosureTempC: number | null;
}

function TempBar({ label, icon, value, critThreshold }: {
  label: string; icon: React.ReactNode; value: number; critThreshold: number;
}) {
  const isCrit = value >= critThreshold;
  const isWarn = value >= critThreshold - 10;
  const color = isCrit ? 'text-alert-red' : isWarn ? 'text-alert-orange' : 'text-neon-green';
  const barColor = isCrit ? 'bg-alert-red' : isWarn ? 'bg-alert-orange' : 'bg-neon-green';
  const pct = Math.min(100, (value / (critThreshold + 20)) * 100);

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <div className={`flex items-center gap-1 text-xs ${color}`}>{icon}<span>{label}</span></div>
        <span className={`text-xs font-bold tabular-nums ${color}`}>{value.toFixed(0)}°C</span>
      </div>
      <div className="h-1.5 bg-military-black rounded overflow-hidden border border-military-border">
        <div className={`h-full rounded transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      {isCrit && <p className="text-alert-red text-xs mt-0.5 animate-pulse">⚠ KRİTİK İSTİLİK</p>}
    </div>
  );
}

export default function SystemTempCard({ cpuTempC, gpuTempC, stm32TempC, motorDriverTempC, motorTempC, enclosureTempC }: Props) {
  if (cpuTempC === null) return null;

  return (
    <div className="panel-module">
      <div className="panel-title">
        <Thermometer size={14} />
        SİSTEM İSTİLİYİ
      </div>
      <div className="mt-2">
        <TempBar label="JETSON CPU" icon={<Cpu size={11} />} value={cpuTempC!} critThreshold={85} />
        <TempBar label="JETSON GPU" icon={<Cpu size={11} />} value={gpuTempC!} critThreshold={85} />
        <TempBar label="STM32" icon={<Cpu size={11} />} value={stm32TempC!} critThreshold={85} />
        <TempBar label="MÜHƏRRİK" icon={<Zap size={11} />} value={motorTempC!} critThreshold={90} />
        <TempBar label="MOTOR SÜRÜCÜSÜ" icon={<Cpu size={11} />} value={motorDriverTempC!} critThreshold={80} />
        <TempBar label="KORPUS DAXİLİ" icon={<Box size={11} />} value={enclosureTempC!} critThreshold={60} />
      </div>
    </div>
  );
}
