import { OctagonX, ShieldCheck } from 'lucide-react';

interface Props {
  isEStop: boolean;
  onEStop: () => void;
  onReset: () => void;
}

export default function EStop({ isEStop, onEStop, onReset }: Props) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* E-Stop button */}
      <button
        onClick={onEStop}
        disabled={isEStop}
        className={`
          relative w-20 h-20 rounded-full font-bold text-xs font-mono
          transition-all duration-200 select-none
          ${isEStop
            ? 'bg-red-950 border-4 border-alert-red text-alert-red opacity-60 cursor-not-allowed'
            : 'bg-alert-red hover:bg-red-700 border-4 border-red-300 text-white cursor-pointer shadow-neon-red hover:scale-105 active:scale-95 animate-pulse'
          }
        `}
        style={isEStop ? {} : { boxShadow: '0 0 20px #ff2020, 0 0 40px #ff202060' }}
      >
        <OctagonX size={28} className="mx-auto mb-1" />
        <div className="text-xs leading-tight">TƏCİLİ<br/>DAYANMA</div>
      </button>

      {/* Reset button */}
      <button
        onClick={onReset}
        disabled={!isEStop}
        className={`
          px-4 py-2 rounded border font-mono text-xs font-bold
          transition-all duration-200 select-none
          ${isEStop
            ? 'border-neon-green text-neon-green hover:bg-neon-green-dim cursor-pointer'
            : 'border-gray-700 text-gray-600 cursor-not-allowed opacity-40'
          }
        `}
      >
        <ShieldCheck size={16} className="mx-auto mb-1" />
        SIFIRLA<br/>/ SİLAHLAN
      </button>
    </div>
  );
}
