import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  opacity?: number;
  color?: string;
  className?: string;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
  opacity = 0.12,
  color = '#ff5500',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const characters = '0123456789ABCDEF01{}[];:<>/*+-~_';
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
    };

    window.addEventListener('resize', handleResize);

    let lastTime = 0;
    const frameInterval = 45; // ~22fps for classic digital rain pacing

    const draw = (currentTime: number) => {
      animationId = requestAnimationFrame(draw);

      if (currentTime - lastTime < frameInterval) return;
      lastTime = currentTime;

      // Semi-transparent black wash for trails
      ctx.fillStyle = 'rgba(7, 7, 7, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading character is brighter
        ctx.fillStyle = '#ff8844';
        ctx.fillText(text, x, y);

        // Subsequent characters are tinted neon orange
        ctx.fillStyle = color;
        ctx.fillText(text, x, y - fontSize);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity }}
    />
  );
};
