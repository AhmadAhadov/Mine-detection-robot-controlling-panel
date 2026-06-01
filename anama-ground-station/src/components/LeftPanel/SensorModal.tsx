import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Telemetry } from '../../types/telemetry';

type SensorKey = 'GPR' | 'LWIR Thermal' | 'PI Coil' | 'LiDAR' | 'Ultrasonic' | 'RTK-GNSS';

interface Props {
  sensorKey: SensorKey | null;
  sensors: Telemetry['sensors'];
  gnss: Telemetry['gnss'];
  onClose: () => void;
}

// ─── GPR Vizualizasiyası ───────────────────────────────────────────
function GPRViz({ gpr }: { gpr: Telemetry['sensors']['gpr'] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      timeRef.current += 0.04;
      const t = timeRef.current;
      ctx.fillStyle = '#0a0e0a';
      ctx.fillRect(0, 0, W, H);

      // Scan lines
      for (let row = 0; row < H; row += 4) {
        const depth = row / H;
        const base = Math.sin(t * 2 + depth * 8) * 0.3 + Math.sin(t * 0.7 + depth * 3) * 0.15;
        const noise = (Math.random() - 0.5) * 0.08;
        const amp = base + noise;

        const brightness = Math.max(0, Math.min(1, 0.15 + Math.abs(amp) * 2));
        const r = Math.round(brightness * 30);
        const g = Math.round(brightness * 255);
        const b = Math.round(brightness * 30);
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, row);
        const x = W / 2 + amp * W * 0.4;
        ctx.lineTo(x, row);
        ctx.stroke();
      }

      // Detected depth marker
      if (gpr.depthEstimateCm !== null) {
        const maxDepthCm = 60;
        const yPct = Math.min(gpr.depthEstimateCm / maxDepthCm, 0.95);
        const y = yPct * H;

        ctx.strokeStyle = '#ff2020';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ff2020';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`▶ ${gpr.depthEstimateCm} sm dərinlik`, 4, y - 3);
      }

      // Depth scale
      ctx.fillStyle = '#1a2a1a';
      ctx.fillRect(W - 28, 0, 28, H);
      for (let d = 0; d <= 60; d += 10) {
        const y = (d / 60) * H;
        ctx.fillStyle = '#39ff1470';
        ctx.font = '8px monospace';
        ctx.fillText(`${d}sm`, W - 26, y + 4);
        ctx.strokeStyle = '#1a2a1a';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W - 28, y);
        ctx.stroke();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gpr.depthEstimateCm]);

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-mono">GPR Skan — Dərinlik Profili</p>
      <canvas ref={canvasRef} width={280} height={180} className="rounded border border-military-border w-full" />
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-military-black rounded p-2 border border-military-border">
          <div className="text-gray-500">Status</div>
          <div className="text-neon-green font-bold">{gpr.active ? 'AKTİV' : 'DEAKTİV'}</div>
        </div>
        <div className="bg-military-black rounded p-2 border border-military-border">
          <div className="text-gray-500">Aşkarlanan dərinlik</div>
          <div className={`font-bold ${gpr.depthEstimateCm ? 'text-alert-red' : 'text-gray-400'}`}>
            {gpr.depthEstimateCm !== null ? `${gpr.depthEstimateCm} sm` : 'Yoxdur'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LWIR Thermal Vizualizasiyası ─────────────────────────────────
function ThermalViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const dataRef = useRef<number[][]>([]);

  useEffect(() => {
    const COLS = 32, ROWS = 24;
    // Initialize thermal grid
    dataRef.current = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => {
        const cx = c / COLS - 0.5, cy = r / ROWS - 0.5;
        return 28 + Math.exp(-(cx * cx + cy * cy) * 8) * 15 + Math.random() * 3;
      })
    );

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    const cw = W / COLS;
    const ch = H / ROWS;

    const heatColor = (t: number) => {
      // 20°C → deep blue, 40°C → red/white
      const norm = Math.max(0, Math.min(1, (t - 20) / 25));
      if (norm < 0.25) return `rgb(0,0,${Math.round(norm * 4 * 200)})`;
      if (norm < 0.5) { const f = (norm - 0.25) * 4; return `rgb(0,${Math.round(f * 200)},200)`; }
      if (norm < 0.75) { const f = (norm - 0.5) * 4; return `rgb(${Math.round(f * 255)},200,${Math.round(200 - f * 200)})`; }
      const f = (norm - 0.75) * 4;
      return `rgb(255,${Math.round(200 - f * 200)},0)`;
    };

    const draw = () => {
      timeRef.current += 0.025;
      const t = timeRef.current;

      // Evolve thermal data
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cx = c / COLS - 0.5, cy = r / ROWS - 0.5;
          const hotspot = Math.exp(-((cx - Math.sin(t * 0.3) * 0.25) ** 2 + (cy - Math.cos(t * 0.2) * 0.2) ** 2) * 12) * 12;
          dataRef.current[r][c] = 25 + hotspot + Math.sin(t + r * 0.5 + c * 0.3) * 1.5 + Math.random() * 0.5;
        }
      }

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          ctx.fillStyle = heatColor(dataRef.current[r][c]);
          ctx.fillRect(c * cw, r * ch, cw + 0.5, ch + 0.5);
        }
      }

      // Crosshair at hottest point
      let maxT = -Infinity, mr = 0, mc = 0;
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (dataRef.current[r][c] > maxT) { maxT = dataRef.current[r][c]; mr = r; mc = c; }

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(mc * cw + cw / 2 - 8, mr * ch + ch / 2);
      ctx.lineTo(mc * cw + cw / 2 + 8, mr * ch + ch / 2);
      ctx.moveTo(mc * cw + cw / 2, mr * ch + ch / 2 - 8);
      ctx.lineTo(mc * cw + cw / 2, mr * ch + ch / 2 + 8);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'white';
      ctx.font = '8px monospace';
      ctx.fillText(`${maxT.toFixed(1)}°C`, mc * cw + cw / 2 + 4, mr * ch + ch / 2 - 4);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-mono">LWIR İstilikvermə Kamerası — 32×24 px</p>
      <canvas ref={canvasRef} width={280} height={160} className="rounded border border-military-border w-full" style={{ imageRendering: 'pixelated' }} />
      <div className="mt-2 flex items-center gap-1 text-xs font-mono text-gray-500">
        <span>Soyuq</span>
        <div className="flex-1 h-2 rounded" style={{ background: 'linear-gradient(to right, #000088, #0000ff, #0088ff, #00ccaa, #ffcc00, #ff4400, #ff0000)' }} />
        <span>İsti</span>
      </div>
    </div>
  );
}

// ─── PI Coil Vizualizasiyası ──────────────────────────────────────
function PICoilViz({ pi }: { pi: Telemetry['sensors']['pulseInduction'] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;

    const draw = () => {
      timeRef.current += 0.06;
      const t = timeRef.current;
      const sig = pi.metalSignalStrength / 100;

      ctx.fillStyle = '#0a0e0a';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = '#1a2a1a';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Pulse waveform
      ctx.strokeStyle = sig > 0.6 ? '#ff2020' : sig > 0.3 ? '#ff8c00' : '#39ff14';
      ctx.lineWidth = 2;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const phase = (x / W) * Math.PI * 8 - t * 3;
        const envelope = Math.exp(-((x / W - ((t * 0.3) % 1)) ** 2) * 20);
        const wave = Math.sin(phase) * sig * envelope * 0.6 + Math.sin(phase * 0.3) * sig * 0.15;
        const y = H / 2 - wave * H * 0.4;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Baseline
      ctx.strokeStyle = '#1a2a1a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [pi.metalSignalStrength]);

  const sig = pi.metalSignalStrength;
  const level = sig > 60 ? { label: 'YÜKSƏK', color: 'text-alert-red' } : sig > 30 ? { label: 'ORTA', color: 'text-alert-orange' } : { label: 'AŞAĞI', color: 'text-neon-green' };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-mono">PI Bobin — Metal Siqnal Dalğası</p>
      <canvas ref={canvasRef} width={280} height={120} className="rounded border border-military-border w-full" />
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-military-black rounded p-2 border border-military-border">
          <div className="text-gray-500">Siqnal Gücü</div>
          <div className={`text-xl font-bold tabular-nums ${level.color}`}>{sig.toFixed(0)}%</div>
        </div>
        <div className="bg-military-black rounded p-2 border border-military-border">
          <div className="text-gray-500">Səviyyə</div>
          <div className={`font-bold ${level.color}`}>{level.label}</div>
        </div>
      </div>
      <div className="mt-2 h-2 bg-military-black rounded border border-military-border overflow-hidden">
        <div
          className={`h-full rounded transition-all duration-200 ${sig > 60 ? 'bg-alert-red' : sig > 30 ? 'bg-alert-orange' : 'bg-neon-green'}`}
          style={{ width: `${sig}%` }}
        />
      </div>
    </div>
  );
}

// ─── LiDAR Vizualizasiyası ─────────────────────────────────────────
function LiDARViz({ lidar }: { lidar: Telemetry['sensors']['lidar'] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(cx, cy) - 8;
    const maxDist = 6;

    const draw = () => {
      angleRef.current = (angleRef.current + 2) % 360;
      const sweep = (angleRef.current * Math.PI) / 180;

      ctx.fillStyle = '#0a0e0a';
      ctx.fillRect(0, 0, W, H);

      // Concentric range rings
      for (let d = 1; d <= 6; d++) {
        const r = (d / maxDist) * maxR;
        ctx.strokeStyle = d === Math.round(lidar.nearestObstacleM) ? '#39ff1440' : '#1a2a1a';
        ctx.lineWidth = d === Math.round(lidar.nearestObstacleM) ? 1.5 : 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#39ff1430';
        ctx.font = '8px monospace';
        ctx.fillText(`${d}m`, cx + r + 2, cy - 2);
      }

      // Cross lines
      ctx.strokeStyle = '#1a2a1a';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // Sweep gradient trail
      const trail = ctx.createConicGradient(sweep - 0.8, cx, cy);
      trail.addColorStop(0, '#39ff1400');
      trail.addColorStop(1, '#39ff1425');
      ctx.fillStyle = trail;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweep - 0.8, sweep);
      ctx.closePath();
      ctx.fill();

      // Sweep line
      ctx.strokeStyle = '#39ff1480';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * maxR, cy + Math.sin(sweep) * maxR);
      ctx.stroke();

      // Obstacle dot
      if (lidar.obstacleDetected) {
        const obsDist = Math.min(lidar.nearestObstacleM, maxDist);
        const obsR = (obsDist / maxDist) * maxR;
        ctx.fillStyle = '#ff2020';
        ctx.shadowColor = '#ff2020';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(sweep) * obsR, cy + Math.sin(sweep) * obsR, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Center dot
      ctx.fillStyle = '#39ff14';
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [lidar.obstacleDetected, lidar.nearestObstacleM]);

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-mono">Solid-State LiDAR — Məsafə Skanı</p>
      <div className="flex justify-center">
        <canvas ref={canvasRef} width={200} height={200} className="rounded border border-military-border" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-military-black rounded p-2 border border-military-border">
          <div className="text-gray-500">Ən yaxın maneə</div>
          <div className={`font-bold tabular-nums ${lidar.obstacleDetected ? 'text-alert-red' : 'text-neon-green'}`}>
            {lidar.nearestObstacleM.toFixed(2)} m
          </div>
        </div>
        <div className="bg-military-black rounded p-2 border border-military-border">
          <div className="text-gray-500">Vəziyyət</div>
          <div className={`font-bold ${lidar.obstacleDetected ? 'text-alert-red animate-pulse' : 'text-neon-green'}`}>
            {lidar.obstacleDetected ? '⚠ MANEƏ' : '✓ AÇIQ'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Ultrasonic 360° Vizualizasiyası ──────────────────────────────
function UltrasonicViz({ ultrasonic }: { ultrasonic: Telemetry['sensors']['ultrasonic'] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(cx, cy) - 12;
    const maxDist = 4;
    const N = ultrasonic.distances.length;

    const draw = () => {
      ctx.fillStyle = '#0a0e0a';
      ctx.fillRect(0, 0, W, H);

      // Range rings
      for (let d = 1; d <= 4; d++) {
        const r = (d / maxDist) * maxR;
        ctx.strokeStyle = '#1a2a1a';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#39ff1430';
        ctx.font = '8px monospace';
        ctx.fillText(`${d}m`, cx + r + 2, cy);
      }

      // Sensor wedges
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const nextAngle = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2;
        const dist = Math.min(ultrasonic.distances[i], maxDist);
        const r = (dist / maxDist) * maxR;
        const isClose = dist < 1;

        ctx.fillStyle = isClose ? '#ff202015' : '#39ff1408';
        ctx.strokeStyle = isClose ? '#ff202060' : '#39ff1440';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, angle, nextAngle);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Direction labels
        const labelAngle = angle + (Math.PI / N);
        const labelR = maxR + 10;
        ctx.fillStyle = '#39ff1460';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const dirs = ['Ön', '', 'Sağ', '', 'Arxa', '', 'Sol', ''];
        if (dirs[i]) ctx.fillText(dirs[i], cx + Math.cos(labelAngle) * labelR, cy + Math.sin(labelAngle) * labelR);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // Center
      ctx.fillStyle = '#39ff14';
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [ultrasonic.distances]);

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-mono">Ultrasəs 360° — {ultrasonic.distances.length} kanal</p>
      <div className="flex justify-center">
        <canvas ref={canvasRef} width={200} height={200} className="rounded border border-military-border" />
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1 text-xs font-mono">
        {ultrasonic.distances.map((d, i) => (
          <div key={i} className={`rounded p-1 text-center border ${d < 1 ? 'border-alert-red bg-red-950 bg-opacity-20 text-alert-red' : 'border-military-border text-neon-green'}`}>
            <div className="text-gray-500" style={{ fontSize: 9 }}>CH{i + 1}</div>
            <div className="font-bold tabular-nums">{d.toFixed(1)}m</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RTK-GNSS Vizualizasiyası ──────────────────────────────────────
function GNSSViz({ gnss }: { gnss: Telemetry['gnss'] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const satsRef = useRef<{ angle: number; elev: number; id: number; snr: number }[]>([]);

  useEffect(() => {
    // Generate satellite positions
    const count = gnss.satellites;
    satsRef.current = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      angle: (i / count) * Math.PI * 2 + i * 0.4,
      elev: 0.3 + Math.random() * 0.65,
      snr: 30 + Math.random() * 20,
    }));

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(cx, cy) - 10;

    const draw = () => {
      ctx.fillStyle = '#0a0e0a';
      ctx.fillRect(0, 0, W, H);

      // Elevation rings (0°, 30°, 60°, 90°)
      const labels = ['90°', '60°', '30°', '0°'];
      [0.25, 0.5, 0.75, 1].forEach((f, i) => {
        const r = f * maxR;
        ctx.strokeStyle = '#1a2a1a';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#39ff1430';
        ctx.font = '8px monospace';
        ctx.fillText(labels[i], cx + 2, cy - r + 10);
      });

      // Cardinal directions
      ctx.fillStyle = '#39ff1460';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('K', cx, cy - maxR - 2);
      ctx.fillText('C', cx, cy + maxR + 10);
      ctx.fillText('Ş', cx + maxR + 6, cy + 3);
      ctx.fillText('Q', cx - maxR - 6, cy + 3);
      ctx.textAlign = 'left';

      // Cross lines
      ctx.strokeStyle = '#1a2a1a';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // Satellites
      satsRef.current.forEach(sat => {
        const r = (1 - sat.elev) * maxR;
        const x = cx + Math.cos(sat.angle) * r;
        const y = cy + Math.sin(sat.angle) * r;

        const fixColor = gnss.fixType === 'RTK_FIXED' ? '#39ff14' : gnss.fixType === 'RTK_FLOAT' ? '#ffd700' : '#ff2020';
        ctx.fillStyle = fixColor;
        ctx.shadowColor = fixColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#c8d8c8';
        ctx.font = '7px monospace';
        ctx.fillText(`${sat.id}`, x + 5, y - 3);
      });

      // Accuracy circle
      const accPx = (gnss.accuracyCm / 500) * maxR * 0.5;
      ctx.strokeStyle = '#39ff1440';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(accPx, 4), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gnss.satellites, gnss.fixType, gnss.accuracyCm]);

  const fixColors: Record<typeof gnss.fixType, string> = {
    RTK_FIXED: 'text-neon-green',
    RTK_FLOAT: 'text-alert-yellow',
    GPS: 'text-alert-red',
  };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-mono">RTK-GNSS — Peyk Konstellyasiyası</p>
      <div className="flex justify-center">
        <canvas ref={canvasRef} width={200} height={200} className="rounded border border-military-border" />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 text-xs font-mono">
        <div className="bg-military-black rounded p-2 border border-military-border">
          <div className="text-gray-500">Fix növü</div>
          <div className={`font-bold ${fixColors[gnss.fixType]}`}>{gnss.fixType.replace('_', ' ')}</div>
        </div>
        <div className="bg-military-black rounded p-2 border border-military-border">
          <div className="text-gray-500">Dəqiqlik</div>
          <div className="text-neon-green font-bold tabular-nums">{gnss.accuracyCm} sm</div>
        </div>
        <div className="bg-military-black rounded p-2 border border-military-border">
          <div className="text-gray-500">Peyklər</div>
          <div className="text-neon-green font-bold tabular-nums">{gnss.satellites}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Ana Modal ─────────────────────────────────────────────────────
const TITLES: Record<SensorKey, string> = {
  'GPR': 'GPR — Yeraltı Radar',
  'LWIR Thermal': 'LWIR — İstilikvermə Kamerası',
  'PI Coil': 'PI Bobin — İmpuls İnduktiv Sensor',
  'LiDAR': 'Solid-State LiDAR',
  'Ultrasonic': 'Ultrasəs Sensorlar',
  'RTK-GNSS': 'RTK-GNSS Naviqasiya',
};

export default function SensorModal({ sensorKey, sensors, gnss, onClose }: Props) {
  if (!sensorKey) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm font-mono"
      style={{ zIndex: 99999 }}
      onClick={handleBackdrop}
    >
      <div
        className="bg-military-panel border border-military-border rounded-lg w-80 max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ boxShadow: '0 0 40px rgba(57,255,20,0.15)', zIndex: 100000 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-military-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green shadow-neon" />
            <span className="text-neon-green text-xs font-bold tracking-wider">{TITLES[sensorKey]}</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {sensorKey === 'GPR' && <GPRViz gpr={sensors.gpr} />}
          {sensorKey === 'LWIR Thermal' && <ThermalViz />}
          {sensorKey === 'PI Coil' && <PICoilViz pi={sensors.pulseInduction} />}
          {sensorKey === 'LiDAR' && <LiDARViz lidar={sensors.lidar} />}
          {sensorKey === 'Ultrasonic' && <UltrasonicViz ultrasonic={sensors.ultrasonic} />}
          {sensorKey === 'RTK-GNSS' && <GNSSViz gnss={gnss} />}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
