import React, { useEffect, useRef } from "react";
import { AnimalEngine } from "../ascii-animals/engine";

/** The koi animation's own maximum density and ASCII detail settings. */
const KOI_TUNING = { density: 4, detail: 2 };

export const KoiPond: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new AnimalEngine(canvas, {
      animal: "koi",
      theme: "dark",
      tuning: KOI_TUNING,
    });

    return () => engine.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`ascii-animals ${className ?? ""}`.trim()}
    />
  );
};
