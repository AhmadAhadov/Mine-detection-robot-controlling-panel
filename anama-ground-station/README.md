# ANAMA Ground Station — Demining Robot Web Dashboard

Military-grade ground control station web interface for the ANAMA autonomous demining robot.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (or the port shown in terminal).

## SIMULATION ↔ LIVE mode

In the top status bar, toggle between **SIM** and **LIVE**:

- **SIM**: All data is generated locally. The robot follows a waypoint trajectory around Baku coordinates, battery drains slowly, random mine detections appear, IMU oscillates realistically.
- **LIVE**: Connects via WebSocket to `ws://<robot-ip>:8765`. Switch by changing the `WS_URL` in `src/hooks/useTelemetry.ts`.

## Robot WebSocket Protocol

The robot should send JSON messages in this format:

```json
// Telemetry update (every ~250ms):
{
  "telemetry": {
    "timestamp": 1710000000000,
    "mode": "AUTONOMOUS",
    "battery": { "percent": 78.2, "voltage": 18.4, "current": 4.1, "tempC": 36, "estimatedMinutesLeft": 94 },
    "signal": { "rssiPercent": 82 },
    "system": { "cpuTempC": 63, "motorDriverTempC": 55 },
    "imu": { "roll": 2.1, "pitch": -1.4, "yaw": 127.3, "tipOverRisk": false },
    "gnss": { "lat": 40.40930, "lng": 49.86710, "fixType": "RTK_FIXED", "satellites": 13, "accuracyCm": 2 },
    "sensors": {
      "gpr": { "active": true, "depthEstimateCm": null },
      "thermal": { "active": true },
      "pulseInduction": { "active": true, "metalSignalStrength": 12.4 },
      "lidar": { "obstacleDetected": false, "nearestObstacleM": 3.2 },
      "ultrasonic": { "distances": [1.2, 2.4, 0.8, 3.1, 2.7, 1.9, 0.6, 2.1] }
    },
    "trajectory": [{ "lat": 40.40920, "lng": 49.86700 }]
  }
}

// Detection event:
{
  "detection": {
    "id": 42,
    "type": "MINE",
    "lat": 40.40935,
    "lng": 49.86725,
    "depthCm": 18,
    "confidence": 87,
    "timestamp": 1710000001000
  }
}
```

## Features

| Feature | Description |
|---------|-------------|
| Real-time map | Leaflet dark map with robot position, trajectory, mine markers |
| Telemetry | Battery, signal, CPU/motor temps, IMU attitude, sensor health |
| Artificial horizon | Visual roll/pitch display |
| GNSS fix | RTK FIXED / FLOAT / GPS with accuracy in cm |
| E-Stop | Big red emergency stop with audio alarm, screen border flash |
| Manual control | Virtual joystick + W/A/S/D keyboard |
| Report export | PDF (official ANAMA header) + Excel |
| Audio alerts | Mine detected, battery low, tip-over, signal lost |
| Weather | Open-Meteo API in LIVE mode, mock in SIM |

## Project Structure

```
src/
  types/        — Telemetry & Detection TypeScript interfaces
  hooks/        — useTelemetry (SIMULATION/LIVE abstraction)
  lib/          — simulation, audioAlerts, reportExport
  components/
    StatusBar/    — Top bar: logo, clock, online indicator, mode
    LeftPanel/    — Battery, Signal, Temps, IMU, Sensors, Weather
    MapPanel/     — Leaflet map + detection list
    VideoPanel/   — FPV camera feed (RGB/LWIR toggle)
    ControlPanel/ — Mode toggle, joystick, E-Stop, export
```
