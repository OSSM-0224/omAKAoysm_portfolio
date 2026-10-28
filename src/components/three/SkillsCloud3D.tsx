import React, { useEffect, useRef, useState, useCallback } from 'react';

const SKILLS_LIST = [
  'Java',
  'Python',
  'C++',
  'JavaScript',
  'TypeScript',
  'SQL',
  'MongoDB',
  'Android',
  'Flutter',
  'Firebase',
  'React.js',
  'Node.js',
  'Express.js',
  'Tailwind CSS',
  'Redux Toolkit',
  'React Hook Form',
  'Framer Motion',
  'HTML5',
  'CSS3',
  'REST APIs',
  'AWS ECS',
  'Docker',
  'Vercel',
  'Render',
  'Git',
  'GitHub',
  'Postman',
  'Linux',
  'Google Apps Script',
  'Telegram Bot API',
  'UI/UX',
  'CorelDRAW',
  'Figma',
];

interface TagItem {
  text: string;
  x: number;
  y: number;
  z: number;
  scale: number;
  alpha: number;
}

export const SkillsCloud3D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const isDragging = useRef(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const rotVelocity = useRef({ x: 0.002, y: 0.004 });
  const sphereAngle = useRef({ x: 0, y: 0 });

  const tagsRef = useRef<TagItem[]>(
    SKILLS_LIST.map((text, idx) => {
      const phi = Math.acos(-1 + (2 * idx) / SKILLS_LIST.length);
      const theta = Math.sqrt(SKILLS_LIST.length * Math.PI) * phi;
      const radius = 175;

      return {
        text,
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        scale: 1,
        alpha: 1,
      };
    })
  );

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    mousePos.current = { x: clientX, y: clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isDragging.current) {
      const dx = clientX - mousePos.current.x;
      const dy = clientY - mousePos.current.y;
      rotVelocity.current = {
        x: dy * 0.0003,
        y: -dx * 0.0003,
      };
      mousePos.current = { x: clientX, y: clientY };
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 450);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const onResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 450;
      height = canvas.height = canvas.parentElement.clientHeight || 450;
    };
    window.addEventListener('resize', onResize);

    const radius = Math.min(width, height) * 0.42;

    const render = () => {
      animId = requestAnimationFrame(render);

      if (!isDragging.current) {
        rotVelocity.current.x += (0.0015 - rotVelocity.current.x) * 0.05;
        rotVelocity.current.y += (0.003 - rotVelocity.current.y) * 0.05;
      }

      sphereAngle.current.x += rotVelocity.current.x;
      sphereAngle.current.y += rotVelocity.current.y;

      const cosX = Math.cos(rotVelocity.current.x);
      const sinX = Math.sin(rotVelocity.current.x);
      const cosY = Math.cos(rotVelocity.current.y);
      const sinY = Math.sin(rotVelocity.current.y);

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      const renderedTags = tagsRef.current.map((tag) => {
        let x1 = tag.x * cosY - tag.z * sinY;
        let z1 = tag.z * cosY + tag.x * sinY;

        let y2 = tag.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + tag.y * sinX;

        tag.x = x1;
        tag.y = y2;
        tag.z = z2;

        const focalLength = 390;
        const scale = focalLength / (focalLength + z2);
        const alpha = Math.max(0.18, Math.min(1, (z2 + radius) / (2 * radius) + 0.2));

        return {
          ...tag,
          projX: cx + x1 * scale,
          projY: cy + y2 * scale,
          scale,
          alpha,
        };
      });

      renderedTags.sort((a, b) => a.z - b.z);

      // Subtle orbital guide ring
      ctx.strokeStyle = 'rgba(255, 121, 0, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.95, 0, Math.PI * 2);
      ctx.stroke();

      renderedTags.forEach((tag) => {
        const isHovered = activeTag === tag.text;
        const fontSize = Math.max(10, Math.round(13.5 * tag.scale * (isHovered ? 1.3 : 1)));

        ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textMetrics = ctx.measureText(tag.text);
        const padX = 7 * tag.scale;
        const padY = 4 * tag.scale;
        const boxW = textMetrics.width + padX * 2;
        const boxH = fontSize + padY * 2;

        if (tag.alpha > 0.4 || isHovered) {
          ctx.fillStyle = isHovered
            ? 'rgba(255, 121, 0, 0.95)'
            : `rgba(16, 16, 20, ${tag.alpha * 0.88})`;
          ctx.strokeStyle = isHovered
            ? '#ffffff'
            : `rgba(255, 121, 0, ${tag.alpha * 0.45})`;
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.roundRect(tag.projX - boxW / 2, tag.projY - boxH / 2, boxW, boxH, 6);
          ctx.fill();
          ctx.stroke();
        }

        if (isHovered) {
          ctx.fillStyle = '#000000';
        } else if (tag.z > 0) {
          ctx.fillStyle = `rgba(255, 140, 40, ${tag.alpha})`;
        } else {
          ctx.fillStyle = `rgba(210, 205, 195, ${tag.alpha * 0.7})`;
        }

        ctx.fillText(tag.text, tag.projX, tag.projY);
      });
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [activeTag]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square max-w-[460px] mx-auto cursor-grab active:cursor-grabbing select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#ff7900]/80 tracking-wider uppercase bg-[#0c0c10]/80 px-2.5 py-1 rounded border border-[#212128]">
        DRAG 3D TECH SPHERE
      </div>
    </div>
  );
};
