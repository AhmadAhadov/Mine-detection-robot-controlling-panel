import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  disabled: boolean;
  onCommand: (cmd: { x: number; y: number }) => void;
}

const RADIUS = 48;

export default function VirtualJoystick({ disabled, onCommand }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const baseRef = useRef<HTMLDivElement>(null);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [disabled]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || disabled) return;
    const rect = baseRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clamp(e.clientX - cx, -RADIUS, RADIUS);
    const dy = clamp(e.clientY - cy, -RADIUS, RADIUS);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const scale = dist > RADIUS ? RADIUS / dist : 1;
    const nx = dx * scale;
    const ny = dy * scale;
    setPos({ x: nx, y: ny });
    onCommand({ x: nx / RADIUS, y: -(ny / RADIUS) });
  }, [disabled, onCommand]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    setPos({ x: 0, y: 0 });
    onCommand({ x: 0, y: 0 });
  }, [onCommand]);

  // Keyboard WASD support
  useEffect(() => {
    if (disabled) return;
    const keys = new Set<string>();

    const update = () => {
      const x = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
      const y = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
      const mag = Math.sqrt(x * x + y * y) || 1;
      const nx = x / mag;
      const ny = y / mag;
      setPos({ x: nx * RADIUS * 0.7, y: -ny * RADIUS * 0.7 });
      onCommand({ x: nx, y: ny });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key.toLowerCase());
      update();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
      update();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [disabled, onCommand]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={baseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative rounded-full border-2 flex items-center justify-center select-none touch-none ${
          disabled
            ? 'border-gray-700 bg-military-black cursor-not-allowed opacity-40'
            : 'border-neon-green bg-military-dark cursor-grab active:cursor-grabbing'
        }`}
        style={{ width: RADIUS * 2, height: RADIUS * 2 }}
      >
        {/* Grid lines */}
        <div className={`absolute inset-0 rounded-full overflow-hidden pointer-events-none ${disabled ? 'opacity-20' : 'opacity-30'}`}>
          <div className="absolute top-0 left-1/2 w-px h-full bg-neon-green" />
          <div className="absolute left-0 top-1/2 w-full h-px bg-neon-green" />
          <div className="absolute inset-0 rounded-full border border-neon-green opacity-30" style={{ margin: '25%' }} />
        </div>

        {/* Stick */}
        <div
          className={`absolute w-8 h-8 rounded-full border-2 transition-none ${
            disabled ? 'border-gray-600 bg-gray-800' : 'border-neon-green bg-neon-green-dim shadow-neon'
          }`}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        />
      </div>
      <p className="text-gray-600 text-xs font-mono">W/A/S/D or drag</p>
    </div>
  );
}
