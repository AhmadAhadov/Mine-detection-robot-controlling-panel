import { useState, useCallback } from 'react';
import { Map, Camera } from 'lucide-react';
import './index.css';

import { useTelemetry } from './hooks/useTelemetry';
import { AudioAlerts } from './lib/audioAlerts';

import StatusBar from './components/StatusBar/StatusBar';
import BatteryCard from './components/LeftPanel/BatteryCard';
import SignalCard from './components/LeftPanel/SignalCard';
import SystemTempCard from './components/LeftPanel/SystemTempCard';
import IMUCard from './components/LeftPanel/IMUCard';
import SpeedCard from './components/LeftPanel/SpeedCard';
import SensorStatusCard from './components/LeftPanel/SensorStatusCard';
import WeatherCard from './components/LeftPanel/WeatherCard';
import MapView from './components/MapPanel/MapView';
import DetectionList from './components/MapPanel/DetectionList';
import VideoFeed from './components/VideoPanel/VideoFeed';
import ControlPanel from './components/ControlPanel/ControlPanel';

type ActiveTab = 'map' | 'camera';

export default function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [isEStop, setIsEStop] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');

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
        gridTemplateColumns: '260px 1fr',
        gridTemplateRows: '1fr',
        gap: '6px',
        padding: '6px',
      }}>

        {/* ── LEFT PANEL ── */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-0.5">
          <BatteryCard battery={telemetry?.battery ?? null} />
          <SignalCard rssiPercent={telemetry?.signal.rssiPercent ?? null} />
          <SystemTempCard
            cpuTempC={telemetry?.system.cpuTempC ?? null}
            gpuTempC={telemetry?.system.gpuTempC ?? null}
            stm32TempC={telemetry?.system.stm32TempC ?? null}
            motorDriverTempC={telemetry?.system.motorDriverTempC ?? null}
            motorTempC={telemetry?.system.motorTempC ?? null}
            enclosureTempC={telemetry?.system.enclosureTempC ?? null}
          />
          <SpeedCard speedKmh={telemetry?.speedKmh ?? null} />
          <IMUCard imu={telemetry?.imu ?? null} />
          <SensorStatusCard sensors={telemetry?.sensors ?? null} gnss={telemetry?.gnss ?? null} />
          <WeatherCard weather={weather} />
        </div>

        {/* ── RIGHT AREA (tab bar + content) ── */}
        <div className="flex flex-col gap-1.5 overflow-hidden">

          {/* Tab bar */}
          <div className="flex items-center gap-1 bg-military-dark border border-military-border rounded px-1.5 py-1 self-start">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                activeTab === 'map'
                  ? 'bg-neon-green-dim text-neon-green border border-neon-green border-opacity-40'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Map size={13} />
              XƏRİTƏ
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                activeTab === 'camera'
                  ? 'bg-neon-green-dim text-neon-green border border-neon-green border-opacity-40'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Camera size={13} />
              KAMERA
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 grid overflow-hidden" style={{
            gridTemplateColumns: '1fr 220px',
            gridTemplateRows: '1fr',
            gap: '6px',
          }}>

            {/* Map tab */}
            {activeTab === 'map' && (
              <>
                <div className="panel-module overflow-hidden flex flex-col">
                  <div className="panel-title">
                    <span className="w-2 h-2 rounded-full bg-neon-green shadow-neon inline-block" />
                    MİNA SAHƏSİ XƏRİTƏSİ — CANLI
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
                <div className="overflow-hidden">
                  <DetectionList detections={detections} onClear={clearDetections} />
                </div>
              </>
            )}

            {/* Camera tab */}
            {activeTab === 'camera' && (
              <>
                <div className="overflow-hidden">
                  <VideoFeed isSimulation={mode === 'SIMULATION'} />
                </div>
                <div className="overflow-hidden">
                  <ControlPanel
                    isEStop={isEStop}
                    onEStop={handleEStop}
                    onReset={handleReset}
                    detections={detections}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
