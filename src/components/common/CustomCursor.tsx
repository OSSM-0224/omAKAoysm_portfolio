import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailing, setTrailing] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'text' | 'view'>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check target element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('a, button, input, textarea, select, [role="button"], [data-cursor="pointer"]');
      const viewable = target.closest('[data-cursor="view"]');

      if (viewable) {
        setCursorType('view');
      } else if (clickable) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth trailing ring lerp loop
    let animId: number;
    let currX = position.x;
    let currY = position.y;

    const loop = () => {
      currX += (position.x - currX) * 0.18;
      currY += (position.y - currY) * 0.18;
      setTrailing({ x: currX, y: currY });
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [position.x, position.y, isVisible]);

  if (isTouchDevice || !isVisible) return null;

  const isPointer = cursorType === 'pointer';
  const isView = cursorType === 'view';

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Central dot */}
      <div
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75 ease-out ${
          isPointer
            ? 'w-2 h-2 bg-[#ff7900]'
            : isView
            ? 'w-3 h-3 bg-white'
            : 'w-1.5 h-1.5 bg-[#ff7900]'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />

      {/* Outer interactive ring */}
      <div
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200 ease-out flex items-center justify-center ${
          isPointer
            ? 'w-10 h-10 border-[#ff7900] bg-[#ff7900]/10 scale-125'
            : isView
            ? 'w-16 h-16 border-[#ff7900] bg-[#0a0a0a]/80 backdrop-blur-xs scale-100'
            : 'w-7 h-7 border-[#ff7900]/40'
        }`}
        style={{
          transform: `translate3d(${trailing.x}px, ${trailing.y}px, 0)`,
        }}
      >
        {isView && (
          <span className="text-[9px] font-mono tracking-widest text-[#ff7900] font-bold uppercase">
            OPEN
          </span>
        )}
      </div>
    </div>
  );
};
