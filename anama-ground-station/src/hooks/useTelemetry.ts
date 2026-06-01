import { useState, useEffect, useRef, useCallback } from 'react';
import type { Telemetry, Detection, WeatherData, DataMode } from '../types/telemetry';
import { generateSimulatedTelemetry, maybeGenerateDetection } from '../lib/simulation';
import { AudioAlerts } from '../lib/audioAlerts';

const SIMULATION_INTERVAL_MS = 250;
const WS_URL = `ws://${window.location.hostname}:8765`;

interface UseTelemetryReturn {
  telemetry: Telemetry | null;
  detections: Detection[];
  weather: WeatherData;
  isOnline: boolean;
  mode: DataMode;
  setMode: (m: DataMode) => void;
  clearDetections: () => void;
}

const MOCK_WEATHER: WeatherData = {
  temperatureC: 24,
  humidity: 68,
  windSpeedKmh: 12,
  condition: 'Partly Cloudy',
};

let lastBatteryAlertTime = 0;
let lastTipOverAlertTime = 0;
let lastSignalAlertTime = 0;

export function useTelemetry(muted: boolean): UseTelemetryReturn {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [weather, setWeather] = useState<WeatherData>(MOCK_WEATHER);
  const [isOnline, setIsOnline] = useState(false);
  const [mode, setMode] = useState<DataMode>('SIMULATION');

  const wsRef = useRef<WebSocket | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerAlerts = useCallback((t: Telemetry, newDet: Detection | null) => {
    AudioAlerts.setMuted(muted);
    const now = Date.now();

    if (newDet) AudioAlerts.mineDetected();

    if (t.battery.percent < 15 && now - lastBatteryAlertTime > 10000) {
      lastBatteryAlertTime = now;
      AudioAlerts.batteryLow();
    }

    if (t.imu.tipOverRisk && now - lastTipOverAlertTime > 5000) {
      lastTipOverAlertTime = now;
      AudioAlerts.tipOverWarning();
    }

    if (t.signal.rssiPercent < 20 && now - lastSignalAlertTime > 8000) {
      lastSignalAlertTime = now;
      AudioAlerts.signalLost();
    }
  }, [muted]);

  useEffect(() => {
    if (mode === 'SIMULATION') {
      setIsOnline(true);
      simTimerRef.current = setInterval(() => {
        const t = generateSimulatedTelemetry();
        const det = maybeGenerateDetection(t);
        setTelemetry(t);
        if (det) setDetections(prev => [det, ...prev].slice(0, 100));
        triggerAlerts(t, det);
      }, SIMULATION_INTERVAL_MS);

      return () => {
        if (simTimerRef.current) clearInterval(simTimerRef.current);
        setIsOnline(false);
      };
    }

    if (mode === 'LIVE') {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setIsOnline(true);
      ws.onclose = () => setIsOnline(false);
      ws.onerror = () => setIsOnline(false);
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.telemetry) {
            setTelemetry(data.telemetry as Telemetry);
            triggerAlerts(data.telemetry, null);
          }
          if (data.detection) {
            setDetections(prev => [data.detection, ...prev].slice(0, 100));
            AudioAlerts.mineDetected();
          }
        } catch (_) {}
      };

      return () => {
        ws.close();
        setIsOnline(false);
      };
    }
  }, [mode, triggerAlerts]);

  // Fetch real weather (Open-Meteo, no API key needed)
  useEffect(() => {
    if (telemetry && mode === 'LIVE') {
      const { lat, lng } = telemetry.gnss;
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m&windspeed_unit=kmh`
      )
        .then(r => r.json())
        .then(d => {
          if (d.current_weather) {
            setWeather({
              temperatureC: d.current_weather.temperature,
              humidity: d.hourly?.relativehumidity_2m?.[0] ?? 60,
              windSpeedKmh: d.current_weather.windspeed,
              condition: d.current_weather.weathercode <= 1 ? 'Clear' : 'Cloudy',
            });
          }
        })
        .catch(() => {});
    }
  }, [mode]);

  return {
    telemetry,
    detections,
    weather,
    isOnline,
    mode,
    setMode,
    clearDetections: () => setDetections([]),
  };
}
