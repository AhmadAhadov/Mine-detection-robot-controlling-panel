import { useState, useCallback } from 'react';
import './index.css';

import { useTelemetry } from './hooks/useTelemetry';
import { AudioAlerts } from './lib/audioAlerts';

import StatusBar from './components/StatusBar/StatusBar';
import BatteryCard from './components/LeftPanel/BatteryCard';
import SignalCard from './components/LeftPanel/SignalCard';
import SystemTempCard from './components/LeftPanel/SystemTempCard';
import IMUCard from './components/LeftPanel/IMUCard';
import SensorStatusCard from './components/LeftPanel/SensorStatusCard';
import WeatherCard from './components/LeftPanel/WeatherCard';
import MapView from './components/MapPanel/MapView';
import DetectionList from './components/MapPanel/DetectionList';
import VideoFeed from './components/VideoPanel/VideoFeed';
import ControlPanel from './components/ControlPanel/ControlPanel';

export default function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [isEStop, setIsEStop] = useState(false);

  const { telemetry, detections, weather, isOnline, mode, setMode, clearDetections } =
    useTelemetry(isMuted);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      AudioAlerts.setMuted(!prev);
      return !prev;
    });
  }, []);

  const handleEStop = useCallback(() => {
    setIsEStop(true);
    AudioAlerts.setMuted(isMuted);
    AudioAlerts.eStop();
  }, [isMuted]);

  const handleReset = useCallback(() => {
    setIsEStop(false);
  }, []);

  return (
    <div
      className={`h-screen flex flex-col grid-bg overflow-hidden font-mono ${
        isEStop ? 'estop-border' : ''
      }`}
      style={{ background: '#0a0e0a' }}
    >
      {/* STATUS BAR */}
      <StatusBar
        isOnline={isOnline}
        mode={telemetry?.mode ?? null}
        dataMode={mode}
        setDataMode={setMode}
        isMuted={isMuted}
        toggleMute={toggleMute}
        isEStop={isEStop}
      />

      {/* MAIN GRID */}
      <div className="flex-1 grid overflow-hidden" style={{
        gridTemplateColumns: '260px 1fr 220px',
        gridTemplateRows: '1fr 1fr',
        gap: '6px',
        padding: '6px',
      }}>

        {/* ── LEFT PANEL (spans 2 rows) ── */}
        <div
          className="row-span-2 flex flex-col gap-2 overflow-y-auto pr-0.5"
          style={{ gridColumn: '1', gridRow: '1 / span 2' }}
        >
          <BatteryCard battery={telemetry?.battery ?? null} />
          <SignalCard rssiPercent={telemetry?.signal.rssiPercent ?? null} />
          <SystemTempCard
            cpuTempC={telemetry?.system.cpuTempC ?? null}
            motorDriverTempC={telemetry?.system.motorDriverTempC ?? null}
          />
          <IMUCard imu={telemetry?.imu ?? null} />
          <SensorStatusCard sensors={telemetry?.sensors ?? null} gnss={telemetry?.gnss ?? null} />
          <WeatherCard weather={weather} />
        </div>

        {/* ── MAP PANEL (top center) ── */}
        <div
          className="panel-module overflow-hidden flex flex-col"
          style={{ gridColumn: '2', gridRow: '1' }}
        >
          <div className="panel-title">
            <span className="w-2 h-2 rounded-full bg-neon-green shadow-neon inline-block" />
            MİNA SAHƏSI XƏRİTƏSİ — CANLI
            {telemetry && (
              <span className="ml-auto text-gray-500 text-xs tabular-nums">
                {telemetry.gnss.lat.toFixed(5)}°N {telemetry.gnss.lng.toFixed(5)}°E
              </span>
            )}
          </div>
          <div className="flex-1 mt-1.5 overflow-hidden rounded">
            <MapView telemetry={telemetry} detections={detections} />
          </div>
        </div>

        {/* ── DETECTION LIST (top right) ── */}
        <div
          className="overflow-hidden"
          style={{ gridColumn: '3', gridRow: '1' }}
        >
          <DetectionList detections={detections} onClear={clearDetections} />
        </div>

        {/* ── VIDEO FEED (bottom center) ── */}
        <div
          className="overflow-hidden"
          style={{ gridColumn: '2', gridRow: '2' }}
        >
          <VideoFeed isSimulation={mode === 'SIMULATION'} />
        </div>

        {/* ── CONTROL PANEL (bottom right) ── */}
        <div
          className="overflow-hidden"
          style={{ gridColumn: '3', gridRow: '2' }}
        >
          <ControlPanel
            isEStop={isEStop}
            onEStop={handleEStop}
            onReset={handleReset}
            detections={detections}
          />
        </div>
      </div>
    </div>
  );
}
