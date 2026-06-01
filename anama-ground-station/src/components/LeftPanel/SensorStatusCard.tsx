import { useState } from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import type { Telemetry } from '../../types/telemetry';
import SensorModal from './SensorModal';

type SensorKey = 'GPR' | 'LWIR Thermal' | 'PI Coil' | 'LiDAR' | 'Ultrasonic' | 'RTK-GNSS';

interface Props {
  sensors: Telemetry['sensors'] | null;
  gnss: Telemetry['gnss'] | null;
}

function SensorDot({ active }: { active: boolean }) {
  return (
    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-neon-green shadow-neon' : 'bg-gray-600'}`} />
  );
}

function GNSSBadge({ fixType }: { fixType: Telemetry['gnss']['fixType'] }) {
  const colors: Record<typeof fixType, string> = {
    RTK_FIXED: 'text-neon-green border-neon-green',
    RTK_FLOAT: 'text-alert-yellow border-alert-yellow',
    GPS: 'text-alert-red border-alert-red',
  };
  return (
    <span className={`text-xs border rounded px-1 font-bold ${colors[fixType]}`}>
      {fixType.replace('_', ' ')}
    </span>
  );
}

export default function SensorStatusCard({ sensors, gnss }: Props) {
  const [activeSensor, setActiveSensor] = useState<SensorKey | null>(null);

  if (!sensors || !gnss) return null;

  const sensorList: { key: SensorKey; label: string; active: boolean; extra?: string }[] = [
    { key: 'GPR', label: 'GPR', active: sensors.gpr.active, extra: sensors.gpr.depthEstimateCm !== null ? `${sensors.gpr.depthEstimateCm}sm` : undefined },
    { key: 'LWIR Thermal', label: 'LWIR Termal', active: sensors.thermal.active },
    { key: 'PI Coil', label: 'PI Bobin', active: sensors.pulseInduction.active, extra: `${sensors.pulseInduction.metalSignalStrength.toFixed(0)}%` },
    { key: 'LiDAR', label: 'LiDAR', active: true, extra: sensors.lidar.obstacleDetected ? `OBJ ${sensors.lidar.nearestObstacleM.toFixed(1)}m` : 'AÇIQ' },
    { key: 'Ultrasonic', label: 'Ultrasəs', active: true, extra: `${sensors.ultrasonic.distances.length}kan` },
  ];

  return (
    <>
      <div className="panel-module">
        <div className="panel-title">
          <Activity size={14} />
          SENSOR VƏZİYYƏTİ
        </div>

        <div className="mt-2 space-y-0.5">
          {sensorList.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSensor(s.key)}
              className="w-full flex items-center justify-between text-xs px-1.5 py-1 rounded hover:bg-military-border transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SensorDot active={s.active} />
                <span className={s.active ? 'text-gray-200' : 'text-gray-500'}>{s.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {s.extra && (
                  <span className="text-neon-green-dim tabular-nums">{s.extra}</span>
                )}
                <ChevronRight size={10} className="text-gray-600 group-hover:text-neon-green transition-colors" />
              </div>
            </button>
          ))}

          {/* GNSS row */}
          <button
            onClick={() => setActiveSensor('RTK-GNSS')}
            className="w-full flex items-center justify-between text-xs px-1.5 py-1 rounded hover:bg-military-border transition-colors group cursor-pointer pt-1.5 border-t border-military-border mt-1"
          >
            <div className="flex items-center gap-2">
              <SensorDot active={true} />
              <span className="text-gray-200">RTK-GNSS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GNSSBadge fixType={gnss.fixType} />
              <span className="text-gray-400">{gnss.accuracyCm}sm</span>
              <span className="text-gray-500">{gnss.satellites}pey</span>
              <ChevronRight size={10} className="text-gray-600 group-hover:text-neon-green transition-colors" />
            </div>
          </button>
        </div>

        <p className="text-gray-700 text-xs mt-1.5 text-center">↑ sensor üzərinə klik et</p>
      </div>

      {activeSensor && (
        <SensorModal
          sensorKey={activeSensor}
          sensors={sensors}
          gnss={gnss}
          onClose={() => setActiveSensor(null)}
        />
      )}
    </>
  );
}
