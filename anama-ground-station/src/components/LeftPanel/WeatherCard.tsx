import { Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import type { WeatherData } from '../../types/telemetry';

interface Props {
  weather: WeatherData;
}

export default function WeatherCard({ weather }: Props) {
  const highHumidity = weather.humidity > 80;

  return (
    <div className="panel-module">
      <div className="panel-title">
        <Wind size={14} />
        WEATHER CONDITIONS
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <Thermometer size={12} className="text-alert-orange mx-auto mb-0.5" />
          <div className="text-neon-green font-bold tabular-nums">{weather.temperatureC}°C</div>
          <div className="text-gray-500">Temp</div>
        </div>
        <div className="text-center">
          <Droplets size={12} className={`mx-auto mb-0.5 ${highHumidity ? 'text-alert-red' : 'text-blue-400'}`} />
          <div className={`font-bold tabular-nums ${highHumidity ? 'text-alert-red' : 'text-neon-green'}`}>
            {weather.humidity}%
          </div>
          <div className="text-gray-500">Humidity</div>
        </div>
        <div className="text-center">
          <Wind size={12} className="text-gray-400 mx-auto mb-0.5" />
          <div className="text-neon-green font-bold tabular-nums">{weather.windSpeedKmh} km/h</div>
          <div className="text-gray-500">Wind</div>
        </div>
      </div>
      {highHumidity && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-alert-orange bg-orange-950 bg-opacity-40 rounded p-1.5 border border-alert-orange border-opacity-40">
          <AlertTriangle size={11} />
          <span>High humidity — sensor accuracy may be reduced</span>
        </div>
      )}
      <div className="mt-1 text-center text-gray-500 text-xs">{weather.condition}</div>
    </div>
  );
}
