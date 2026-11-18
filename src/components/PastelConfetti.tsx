import React, { useEffect, useState } from 'react';

interface PastelConfettiProps {
  burstKey: number;
  reducedMotion: boolean;
}

const CONFETTI_PIECES = [
  { left: '12%', delay: '0ms', color: '#FFB6C1', rotate: '-18deg' },
  { left: '24%', delay: '60ms', color: '#DCC6F0', rotate: '22deg' },
  { left: '36%', delay: '20ms', color: '#C5E8D5', rotate: '-35deg' },
  { left: '48%', delay: '80ms', color: '#FFD6A5', rotate: '14deg' },
  { left: '58%', delay: '30ms', color: '#FFB6C1', rotate: '40deg' },
  { left: '68%', delay: '90ms', color: '#DCC6F0', rotate: '-25deg' },
  { left: '78%', delay: '40ms', color: '#C5E8D5', rotate: '28deg' },
  { left: '88%', delay: '70ms', color: '#FF9EB5', rotate: '-12deg' },
];

export const PastelConfetti: React.FC<PastelConfettiProps> = ({ burstKey, reducedMotion }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (burstKey === 0 || reducedMotion) {
      setActive(false);
      return;
    }
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 1200);
    return () => window.clearTimeout(timer);
  }, [burstKey, reducedMotion]);

  if (!active || reducedMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden z-20"
      aria-hidden="true"
    >
      {CONFETTI_PIECES.map((p, idx) => (
        <span
          key={`${burstKey}-${idx}`}
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            transform: `rotate(${p.rotate})`,
          }}
          className="absolute top-2 w-2.5 h-2.5 rounded-sm opacity-90 animate-[confetti-drop_1.1s_ease-out_forwards]"
        />
      ))}
      <style>{`
        @keyframes confetti-drop {
          0% { transform: translateY(0) scale(0.7) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110px) scale(1.1) rotate(220deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
