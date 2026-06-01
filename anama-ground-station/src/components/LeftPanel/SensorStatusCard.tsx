import { Activity } from 'lucide-react';
import type { Telemetry } from '../../types/telemetry';

interface Props {
  sensors: Telemetry['sensors'] | null;
  gnss: Telemetry['gnss'] | null;
}

function SensorDot({ active }: { active: boolean }) {
  return (
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-neon-green shadow-neon' : 'bg-gray-600'}`} />
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
  if (!sensors || !gnss) return null;

  const sensorList = [
    { label: 'GPR', active: sensors.gpr.active, extra: sensors.gpr.depthEstimateCm !== null ? `${sensors.gpr.depthEstimateCm}cm` : undefined },
    { label: 'LWIR Thermal', active: sensors.thermal.active },
    { label: 'PI Coil', active: sensors.pulseInduction.active, extra: `${sensors.pulseInduction.metalSignalStrength.toFixed(0)}%` },
    { label: 'LiDAR', active: true, extra: sensors.lidar.obstacleDetected ? `OBJ ${sensors.lidar.nearestObstacleM.toFixed(1)}m` : 'CLEAR' },
    { label: 'Ultrasonic', active: true, extra: `${sensors.ultrasonic.distances.length}ch` },
  ];

  return (
    <div className="panel-module">
      <div className="panel-title">
        <Activity size={14} />
        SENSOR STATUS
      </div>

      <div className="mt-2 space-y-1.5">
        {sensorList.map(s => (
          <div key={s.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <SensorDot active={s.active} />
              <span className={s.active ? 'text-gray-200' : 'text-gray-500'}>{s.label}</span>
            </div>
            {s.extra && (
              <span className="text-neon-green-dim text-xs tabular-nums">{s.extra}</span>
            )}
          </div>
        ))}

        {/* GNSS row */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-military-border mt-1">
          <div className="flex items-center gap-2">
            <SensorDot active={true} />
            <span className="text-gray-200">RTK-GNSS</span>
          </div>
          <div className="flex items-center gap-2">
            <GNSSBadge fixType={gnss.fixType} />
            <span className="text-gray-400">{gnss.accuracyCm}cm</span>
            <span className="text-gray-500">{gnss.satellites}sat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
