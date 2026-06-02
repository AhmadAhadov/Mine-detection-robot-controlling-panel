import type { Telemetry, Detection } from '../types/telemetry';

// Karabakh demining area — Fuzuli district
const TRAJECTORY_BASE = { lat: 39.6012, lng: 47.1534 };
const WAYPOINTS = [
  { lat: 39.6012, lng: 47.1534 },
  { lat: 39.6021, lng: 47.1548 },
  { lat: 39.6034, lng: 47.1561 },
  { lat: 39.6045, lng: 47.1549 },
  { lat: 39.6058, lng: 47.1535 },
  { lat: 39.6050, lng: 47.1519 },
  { lat: 39.6037, lng: 47.1508 },
  { lat: 39.6022, lng: 47.1521 },
];

let waypointIndex = 0;
let waypointProgress = 0;
let batteryPercent = 85;
let lastLat = WAYPOINTS[0].lat;
let lastLng = WAYPOINTS[0].lng;
let trajectory: { lat: number; lng: number }[] = [{ ...TRAJECTORY_BASE }];
let detectionIdCounter = 1;
let pendingDetection: Detection | null = null;
let imuPhase = 0;
let signalPhase = 0;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function noise(scale = 1) {
  return (Math.random() - 0.5) * 2 * scale;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function generateSimulatedTelemetry(): Telemetry {
  // Advance robot position along waypoints
  waypointProgress += 0.008;
  if (waypointProgress >= 1) {
    waypointProgress = 0;
    waypointIndex = (waypointIndex + 1) % WAYPOINTS.length;
  }

  const curWp = WAYPOINTS[waypointIndex];
  const nextWp = WAYPOINTS[(waypointIndex + 1) % WAYPOINTS.length];
  const lat = lerp(curWp.lat, nextWp.lat, waypointProgress) + noise(0.00002);
  const lng = lerp(curWp.lng, nextWp.lng, waypointProgress) + noise(0.00002);

  // Speed: distance per tick (250ms) → km/h
  const distKm = haversineKm(lastLat, lastLng, lat, lng);
  const speedKmh = Math.max(0, distKm / (0.25 / 3600) + noise(0.05));
  lastLat = lat;
  lastLng = lng;

  // Add to trajectory (keep last 200 points)
  trajectory.push({ lat, lng });
  if (trajectory.length > 200) trajectory = trajectory.slice(-200);

  // Battery drains slowly
  batteryPercent = Math.max(5, batteryPercent - 0.015);

  // IMU oscillation
  imuPhase += 0.05;
  signalPhase += 0.03;

  const roll = Math.sin(imuPhase) * 8 + noise(1.5);
  const pitch = Math.cos(imuPhase * 0.7) * 5 + noise(1);
  const yaw = (waypointIndex / WAYPOINTS.length) * 360 + noise(2);

  return {
    timestamp: Date.now(),
    mode: "AUTONOMOUS",
    speedKmh: Math.round(speedKmh * 10) / 10,
    battery: {
      percent: batteryPercent,
      voltage: lerp(20.0, 16.5, 1 - batteryPercent / 100),
      current: 4.2 + noise(0.3),
      tempC: 35 + noise(2),
      estimatedMinutesLeft: Math.round((batteryPercent / 100) * 120),
    },
    signal: {
      rssiPercent: Math.max(10, Math.min(100, 75 + Math.sin(signalPhase) * 20 + noise(5))),
    },
    system: {
      cpuTempC: 62 + noise(4),
      gpuTempC: 68 + noise(4),
      motorDriverTempC: 55 + noise(3),
      motorTempC: 70 + noise(5),
      enclosureTempC: 42 + noise(2),
    },
    imu: {
      roll,
      pitch,
      yaw,
      tipOverRisk: Math.abs(roll) > 15 || Math.abs(pitch) > 15,
    },
    gnss: {
      lat,
      lng,
      fixType: Math.random() > 0.05 ? "RTK_FIXED" : Math.random() > 0.5 ? "RTK_FLOAT" : "GPS",
      satellites: Math.round(12 + noise(2)),
      accuracyCm: Math.round(2 + Math.random() * 3),
    },
    sensors: {
      gpr: { active: true, depthEstimateCm: Math.random() > 0.95 ? Math.round(15 + Math.random() * 25) : null },
      thermal: { active: true },
      pulseInduction: { active: true, metalSignalStrength: Math.random() * 100 },
      lidar: {
        obstacleDetected: Math.random() > 0.9,
        nearestObstacleM: 0.5 + Math.random() * 4,
      },
      ultrasonic: { distances: Array.from({ length: 8 }, () => 0.3 + Math.random() * 3) },
    },
    trajectory: [...trajectory],
  };
}

export function maybeGenerateDetection(telemetry: Telemetry): Detection | null {
  // ~1% chance per tick of detecting something
  if (Math.random() > 0.992) {
    const det: Detection = {
      id: detectionIdCounter++,
      type: Math.random() > 0.4 ? "MINE" : "METAL",
      lat: telemetry.gnss.lat + noise(0.0005),
      lng: telemetry.gnss.lng + noise(0.0005),
      depthCm: Math.random() > 0.3 ? Math.round(10 + Math.random() * 30) : null,
      confidence: Math.round(65 + Math.random() * 35),
      timestamp: Date.now(),
    };
    pendingDetection = det;
    return det;
  }
  return null;
}

export { pendingDetection, TRAJECTORY_BASE };
