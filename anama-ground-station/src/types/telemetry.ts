export interface Telemetry {
  timestamp: number;
  mode: "AUTONOMOUS" | "MANUAL";
  battery: {
    percent: number;
    voltage: number;
    current: number;
    tempC: number;
    estimatedMinutesLeft: number;
  };
  speedKmh: number;
  signal: { rssiPercent: number };
  system: { cpuTempC: number; gpuTempC: number; stm32TempC: number; motorDriverTempC: number; motorTempC: number; enclosureTempC: number };
  imu: { roll: number; pitch: number; yaw: number; tipOverRisk: boolean };
  gnss: {
    lat: number;
    lng: number;
    fixType: "RTK_FIXED" | "RTK_FLOAT" | "GPS";
    satellites: number;
    accuracyCm: number;
  };
  sensors: {
    gpr: { active: boolean; depthEstimateCm: number | null };
    thermal: { active: boolean };
    pulseInduction: { active: boolean; metalSignalStrength: number };
    lidar: { obstacleDetected: boolean; nearestObstacleM: number };
    ultrasonic: { distances: number[] };
  };
  trajectory: { lat: number; lng: number }[];
}

export interface Detection {
  id: number;
  type: "MINE" | "METAL";
  lat: number;
  lng: number;
  depthCm: number | null;
  confidence: number;
  timestamp: number;
}

export interface WeatherData {
  temperatureC: number;
  humidity: number;
  windSpeedKmh: number;
  condition: string;
}

export type DataMode = "SIMULATION" | "LIVE";

export interface RobotState {
  isOnline: boolean;
  isEStop: boolean;
  isLocked: boolean;
  isMuted: boolean;
}
