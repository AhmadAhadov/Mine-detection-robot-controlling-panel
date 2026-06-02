import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Telemetry, Detection } from '../../types/telemetry';

// Fix leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ROBOT_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:24px;height:24px;
    background:#39ff14;
    border:2px solid #0a0e0a;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 0 8px #39ff14, 0 0 16px #39ff1480;
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

function getMineIcon(type: Detection['type'], _confidence: number) {
  const color = type === 'MINE' ? '#ff2020' : '#ff8c00';
  const symbol = type === 'MINE' ? '💣' : '⚠';
  return L.divIcon({
    className: '',
    html: `<div title="${type}" style="
      font-size:18px;
      filter:drop-shadow(0 0 6px ${color});
      cursor:pointer;
    ">${symbol}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

interface Props {
  telemetry: Telemetry | null;
  detections: Detection[];
}

export default function MapView({ telemetry, detections }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const robotMarkerRef = useRef<L.Marker | null>(null);
  const trajectoryRef = useRef<L.Polyline | null>(null);
  const detectionMarkersRef = useRef<Map<number, L.Marker>>(new Map());

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [39.6012, 47.1534],
      zoom: 17,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap &copy; CartoDB',
    }).addTo(map);

    // Attribution minimal
    L.control.attribution({ prefix: false }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      robotMarkerRef.current = null;
      trajectoryRef.current = null;
      detectionMarkersRef.current.clear();
    };
  }, []);

  // Update robot position & trajectory
  useEffect(() => {
    if (!mapRef.current || !telemetry) return;
    const map = mapRef.current;
    const { lat, lng } = telemetry.gnss;

    // Robot marker
    if (!robotMarkerRef.current) {
      robotMarkerRef.current = L.marker([lat, lng], { icon: ROBOT_ICON }).addTo(map);
    } else {
      robotMarkerRef.current.setLatLng([lat, lng]);
    }

    // Trajectory
    const latlngs = telemetry.trajectory.map(p => [p.lat, p.lng] as [number, number]);
    if (!trajectoryRef.current) {
      trajectoryRef.current = L.polyline(latlngs, {
        color: '#39ff14',
        weight: 2,
        opacity: 0.7,
      }).addTo(map);
    } else {
      trajectoryRef.current.setLatLngs(latlngs);
    }
  }, [telemetry]);

  // Update detections
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const existing = detectionMarkersRef.current;

    for (const det of detections) {
      if (!existing.has(det.id)) {
        const marker = L.marker([det.lat, det.lng], { icon: getMineIcon(det.type, det.confidence) })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:monospace;font-size:12px;background:#0f150f;color:#39ff14;padding:8px;border:1px solid #1a2a1a;border-radius:4px;min-width:180px;">
              <strong style="color:${det.type === 'MINE' ? '#ff2020' : '#ff8c00'}">${det.type === 'MINE' ? 'MİNA' : 'METAL'} #${String(det.id).padStart(3, '0')}</strong><br/>
              <span style="color:#aaa">En:</span> ${det.lat.toFixed(6)}°<br/>
              <span style="color:#aaa">Uzunluq:</span> ${det.lng.toFixed(6)}°<br/>
              <span style="color:#aaa">Dərinlik:</span> ${det.depthCm !== null ? det.depthCm + ' sm' : 'Məlum deyil'}<br/>
              <span style="color:#aaa">Etibarlılıq:</span> <span style="color:#ffd700">${det.confidence}%</span><br/>
              <span style="color:#555;font-size:10px">${new Date(det.timestamp).toLocaleTimeString('az-AZ')}</span>
            </div>
          `, { maxWidth: 220 });
        existing.set(det.id, marker);
      }
    }
  }, [detections]);

  return (
    <div ref={containerRef} className="w-full h-full rounded" style={{ minHeight: 300 }} />
  );
}
