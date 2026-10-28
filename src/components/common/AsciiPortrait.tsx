import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PORTRAIT_DATA, AsciiPortraitData } from '../../data/portraits';

interface AsciiPortraitProps {
  data?: AsciiPortraitData;
  className?: string;
  triggerDecode?: boolean;
}

const GLYPHS = ['.', ',', ':', ';', '!', '+', '=', '*', 'o', 'x', '%', '#', '@'];

interface ParticleCell {
  char: string;
  r: number;
  g: number;
  b: number;
  origX: number;
  origY: number;
  currX: number;
  currY: number;
  vx: number;
  vy: number;
  resolved: boolean;
}

export const AsciiPortrait: React.FC<AsciiPortraitProps> = ({
  data = PORTRAIT_DATA,
  className = '',
  triggerDecode = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parallax and interactive states
  const mousePos = useRef({ x: -9999, y: -9999 });
  const touchRipple = useRef<{ x: number; y: number; radius: number; active: boolean }>({
    x: 0,
    y: 0,
    radius: 0,
    active: false,
  });

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [scrollDissolve, setScrollDissolve] = useState(0);

  // Parallax mouse follow on container
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePos.current = { x, y };

    const cX = rect.width / 2;
    const cY = rect.height / 2;
    const tiltX = (e.clientX - rect.left - cX) / cX;
    const tiltY = (e.clientY - rect.top - cY) / cY;
    setTilt({ x: tiltX * 8, y: -tiltY * 8 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    mousePos.current = { x: -9999, y: -9999 };
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    touchRipple.current = { x, y, radius: 5, active: true };
  }, []);

  // Track scroll for particle dissolution
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(1, Math.max(0, scrollY / 550));
      setScrollDissolve(progress);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const { width: gridW, height: gridH, cells } = data;

    // Setup canvas dimensions based on container width
    const container = containerRef.current;
    const targetWidth = Math.min(container?.clientWidth || 440, 480);
    const charWidth = targetWidth / gridW;
    const charHeight = charWidth * 1.45; // monospace aspect ratio
    const targetHeight = charHeight * gridH;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = targetWidth * dpr;
    canvas.height = targetHeight * dpr;
    canvas.style.width = `${targetWidth}px`;
    canvas.style.height = `${targetHeight}px`;
    ctx.scale(dpr, dpr);

    // Initialize particle grid
    const particles: ParticleCell[] = cells.map((cell, idx) => {
      const gx = idx % gridW;
      const gy = Math.floor(idx / gridW);
      const posX = gx * charWidth + charWidth / 2;
      const posY = gy * charHeight + charHeight / 2;

      return {
        char: cell.char,
        r: cell.r,
        g: cell.g,
        b: cell.b,
        origX: posX,
        origY: posY,
        currX: posX,
        currY: posY,
        vx: 0,
        vy: 0,
        resolved: false,
      };
    });

    let animId: number;
    let startTime = performance.now();
    const decodeDuration = 1400; // ms to decode portrait

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const elapsed = time - startTime;

      // Clear canvas
      ctx.clearRect(0, 0, targetWidth, targetHeight);

      // Intro decode progress (center-out wave)
      const decodeRatio = triggerDecode ? Math.min(1, elapsed / decodeDuration) : 1;
      const maxDistFromCenter = Math.sqrt(
        Math.pow(targetWidth / 2, 2) + Math.pow(targetHeight / 2, 2)
      );

      // Idle shimmer scanline wave travelling top to bottom
      const shimmerY = ((time * 0.12) % (targetHeight + 120)) - 60;
      const shimmerBand = 45; // width of scan band

      // Touch ripple expansion
      if (touchRipple.current.active) {
        touchRipple.current.radius += 5;
        if (touchRipple.current.radius > targetWidth) {
          touchRipple.current.active = false;
        }
      }

      ctx.font = `600 ${Math.max(10, charHeight * 0.9)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Render each ASCII character
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Center-out decode test
        const distFromCenter = Math.sqrt(
          Math.pow(p.origX - targetWidth / 2, 2) + Math.pow(p.origY - targetHeight / 2, 2)
        );
        const cellDecodeThreshold = distFromCenter / maxDistFromCenter;
        const isDecoded = decodeRatio >= cellDecodeThreshold;

        // 2. Mouse Scatter Physics
        const mouseDist = Math.sqrt(
          Math.pow(p.currX - mousePos.current.x, 2) + Math.pow(p.currY - mousePos.current.y, 2)
        );

        const scatterRadius = 85;
        if (!prefersReducedMotion && mouseDist < scatterRadius) {
          const force = (1 - mouseDist / scatterRadius) * 26;
          const angle = Math.atan2(p.currY - mousePos.current.y, p.currX - mousePos.current.x);
          p.vx += Math.cos(angle) * force * 0.45;
          p.vy += Math.sin(angle) * force * 0.45;
        }

        // Touch ripple interaction
        if (touchRipple.current.active && !prefersReducedMotion) {
          const rDist = Math.sqrt(
            Math.pow(p.currX - touchRipple.current.x, 2) + Math.pow(p.currY - touchRipple.current.y, 2)
          );
          if (Math.abs(rDist - touchRipple.current.radius) < 20) {
            p.vx += (Math.random() - 0.5) * 8;
            p.vy += (Math.random() - 0.5) * 8;
          }
        }

        // 3. Scroll Dissolve (Rising Orange Particles)
        if (scrollDissolve > 0.05 && !prefersReducedMotion) {
          const dissolveLift = Math.pow(scrollDissolve, 1.8) * 140;
          const jitter = (Math.random() - 0.5) * scrollDissolve * 20;
          p.currY = p.origY - (dissolveLift * (0.8 + ((i % 17) / 17) * 0.5));
          p.currX = p.origX + jitter;
        } else {
          // Spring return physics to origin
          const springK = 0.12;
          const damping = 0.78;
          const ax = (p.origX - p.currX) * springK;
          const ay = (p.origY - p.currY) * springK;

          p.vx = (p.vx + ax) * damping;
          p.vy = (p.vy + ay) * damping;
          p.currX += p.vx;
          p.currY += p.vy;
        }

        // 4. Character selection (random glyph while decoding, target glyph when decoded)
        let renderChar = p.char;
        if (!isDecoded && p.char !== ' ') {
          renderChar = GLYPHS[Math.floor((time * 0.01 + i) % GLYPHS.length)];
        }

        // 5. Idle Shimmer brightness wave
        let r = p.r;
        let g = p.g;
        let b = p.b;

        const distToShimmer = Math.abs(p.currY - shimmerY);
        if (distToShimmer < shimmerBand && !prefersReducedMotion) {
          const factor = 1 + (1 - distToShimmer / shimmerBand) * 0.75;
          r = Math.min(255, Math.round(r * factor));
          g = Math.min(255, Math.round(g * factor + 30));
          b = Math.min(255, Math.round(b * factor + 20));
        }

        // Opacity on scroll dissolve
        const alpha = Math.max(0, 1 - scrollDissolve * 1.2);
        if (alpha <= 0.01) continue;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillText(renderChar, p.currX, p.currY);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [data, triggerDecode]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      style={{
        transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      className={`relative inline-block cursor-crosshair select-none ${className}`}
      data-cursor="pointer"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Interactive animated ASCII portrait of developer OM (OYSM) in neon orange"
        className="block mx-auto filter drop-shadow-[0_0_30px_rgba(255,121,0,0.35)]"
      />
      {/* Subtle bottom info hint */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#ff7900]/70 tracking-widest uppercase whitespace-nowrap">
        [HOVER / TOUCH TO DISPERSE PARTICLES]
      </div>
    </div>
  );
};
