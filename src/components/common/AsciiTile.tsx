import React, { useEffect, useRef } from "react";

const RAMP = ".:-+*#%@";

/** Small deterministic PRNG so each tile's background noise is stable. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/**
 * A square canvas that prints `text` as halftone ASCII glyphs, orange on
 * near-black. Used as a visual fallback when a project has no screenshot yet.
 */
export const AsciiTile: React.FC<{
  text: string;
  seed: string;
  hot?: boolean;
  className?: string;
}> = ({ text, seed, hot = false, className = "" }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const draw = () => {
      const css = canvas.clientWidth;
      if (!css) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cols = Math.max(
        10,
        Math.min(46, Math.round(css / (css > 150 ? 8 : 6.5))),
      );
      const cell = css / cols;

      // Mask: the text, at 4x the grid, then averaged down to one value per cell.
      const S = 4;
      const mask = document.createElement("canvas");
      mask.width = cols * S;
      mask.height = cols * S;
      const m = mask.getContext("2d", { willReadFrequently: true });
      if (!m) return;
      const face = '"Space Grotesk", "Inter", "Arial Black", sans-serif';
      m.font = `800 100px ${face}`;
      const measured = m.measureText(text).width || 1;
      const fit = Math.min(
        ((mask.width * 0.8) / measured) * 100,
        mask.height * 0.62,
      );
      m.font = `800 ${fit}px ${face}`;
      m.fillStyle = "#000";
      m.textAlign = "center";
      m.textBaseline = "middle";
      m.fillText(text, mask.width / 2, mask.height * 0.5);
      const img = m.getImageData(0, 0, mask.width, mask.height).data;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, css, css);
      ctx.font = `700 ${Math.round(cell * 1.25)}px "JetBrains Mono", ui-monospace, "DejaVu Sans Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const rand = rng(hashStr(seed));
      for (let gy = 0; gy < cols; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          let sum = 0;
          for (let sy = 0; sy < S; sy++)
            for (let sx = 0; sx < S; sx++)
              sum += img[((gy * S + sy) * mask.width + gx * S + sx) * 4 + 3];
          const cov = sum / (S * S * 255);
          const x = gx * cell + cell / 2;
          const y = gy * cell + cell / 2;
          if (cov > 0.08) {
            const idx = Math.min(
              RAMP.length - 1,
              Math.floor(Math.sqrt(cov) * RAMP.length),
            );
            ctx.fillStyle = hot ? "#ff7900" : "rgba(255,121,0,0.92)";
            ctx.fillText(RAMP[idx], x, y);
          } else if (rand() < 0.2) {
            ctx.fillStyle = `rgba(255,121,0,${(0.1 + rand() * 0.14).toFixed(2)})`;
            ctx.fillText(RAMP[Math.floor(rand() * 3)], x, y);
          } else {
            rand();
          }
        }
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    if (document.fonts?.ready) document.fonts.ready.then(draw);
    return () => ro.disconnect();
  }, [text, seed, hot]);

  return (
    <canvas ref={ref} aria-hidden="true" className={`block ${className}`} />
  );
};
