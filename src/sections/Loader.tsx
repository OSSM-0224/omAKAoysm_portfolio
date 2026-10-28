import React, { useState, useEffect } from 'react';
import { AsciiNumber } from '../components/common/AsciiNumber';

interface LoaderProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  'INITIALIZING OM (OYSM) ARCHITECTURE...',
  'BOOTING REACT NATIVE & ANDROID JAVA ENVIRONMENTS...',
  'PREPARING 3D SMARTPHONE TEXTURE MAPPINGS (CCMS, AMRUTAM, SOS)...',
  'COMPILING NEON ORANGE ASCII PORTRAIT MATRIX...',
  'CALIBRATING 60FPS THREE.JS & LENIS SMOOTH RUNTIME...',
  'SYSTEM ONLINE // DECODING ASCII PORTRAIT',
];

export const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(onComplete, 600);
          }, 350);
          return 100;
        }
        const step = prev < 40 ? 5 : prev < 80 ? 6 : 9;
        const next = Math.min(100, prev + step);
        return next;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const logTimer = setInterval(() => {
      setLogIndex((prev) => (prev < BOOT_LOGS.length - 1 ? prev + 1 : prev));
    }, 350);
    return () => clearInterval(logTimer);
  }, []);

  const formattedCount = String(progress).padStart(3, '0');

  // Compute ASCII progress bar
  const totalBars = 24;
  const filledBars = Math.floor((progress / 100) * totalBars);
  const emptyBars = totalBars - filledBars;
  const progressBarString = `[${'█'.repeat(filledBars)}${'-'.repeat(emptyBars)}]`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030303] text-[#f4f1ea] px-6 select-none transition-all duration-700 ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* scanlines removed */}

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center space-y-6">
        <div className="flex items-center gap-2 font-mono text-xs text-[#8a8780] tracking-wider mb-2">
          <span className="w-2 h-2 rounded-full bg-[#ff7900] shadow-[0_0_8px_#ff7900]" />
          <span>OM (OYSM) // TERMINAL BOOT SEQUENCE</span>
        </div>

        {/* Big ASCII Numbers Counter */}
        <div className="py-2">
          <AsciiNumber
            value={formattedCount}
            size="lg"
            color="text-[#ff7900]"
            className="text-glow-orange"
            glitchOnHover={false}
          />
        </div>

        {/* ASCII Progress Bar */}
        <div className="w-full space-y-2">
          <pre className="font-mono text-xs sm:text-sm text-[#ff7900] tracking-widest overflow-hidden">
            {progressBarString} {progress}%
          </pre>
          <p className="font-mono text-[11px] sm:text-xs text-[#9c9890] tracking-wide h-5">
            &gt; {BOOT_LOGS[logIndex]}
          </p>
        </div>

        {/* Skip button */}
        <button
          onClick={() => {
            setIsFadingOut(true);
            setTimeout(onComplete, 200);
          }}
          className="mt-6 text-[10px] font-mono tracking-widest text-[#737069] hover:text-[#ff7900] transition-colors uppercase border border-[#212128] hover:border-[#ff7900]/50 px-3 py-1.5 rounded"
        >
          [ESC / SKIP INTRO]
        </button>
      </div>
    </div>
  );
};
