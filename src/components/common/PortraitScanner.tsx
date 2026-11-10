import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Interactive portrait scanner.
 *
 * The portrait stays the hero artifact, but the frame around it behaves like a
 * piece of the site's terminal world: scan sweep, pointer-tracked light, corner
 * brackets, and a click-to-decode ASCII rendering of the cutout itself.
 */

const ASCII_RAMP = " .:-=+*#%@";

export const PortraitScanner: React.FC = () => {
  const panelRef = useRef<HTMLButtonElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [asciiMode, setAsciiMode] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (imageRef.current?.complete) setImageReady(true);
  }, []);

  /** Read the portrait pixels once per size and print them as orange glyphs. */
  const drawAscii = useCallback(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    const image = imageRef.current;
    if (
      !canvas ||
      !frame ||
      !image ||
      !image.complete ||
      !image.naturalWidth
    ) {
      return;
    }

    const width = frame.clientWidth;
    const height = frame.clientHeight;
    if (!width || !height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Match the image's object-contain / object-bottom placement.
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    const fit = Math.min(width / imageWidth, height / imageHeight);
    const drawnWidth = imageWidth * fit;
    const drawnHeight = imageHeight * fit;
    const offsetX = (width - drawnWidth) / 2;
    const offsetY = height - drawnHeight;

    const sampleWidth = Math.max(
      120,
      Math.min(300, Math.round(drawnWidth / 2)),
    );
    const sampleHeight = Math.max(
      1,
      Math.round((sampleWidth / imageWidth) * imageHeight),
    );
    const sampler = document.createElement("canvas");
    sampler.width = sampleWidth;
    sampler.height = sampleHeight;
    const samplerCtx = sampler.getContext("2d", { willReadFrequently: true });
    if (!samplerCtx) return;
    samplerCtx.drawImage(image, 0, 0, sampleWidth, sampleHeight);
    const pixels = samplerCtx.getImageData(
      0,
      0,
      sampleWidth,
      sampleHeight,
    ).data;

    const cols = Math.max(24, Math.min(64, Math.round(drawnWidth / 7)));
    const rows = Math.max(32, Math.min(80, Math.round(drawnHeight / 9)));
    const cellWidth = drawnWidth / cols;
    const cellHeight = drawnHeight / rows;

    ctx.font = `600 ${Math.max(6, cellHeight * 0.9)}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const sampleX = Math.min(
          sampleWidth - 1,
          Math.floor(((col + 0.5) / cols) * sampleWidth),
        );
        const sampleY = Math.min(
          sampleHeight - 1,
          Math.floor(((row + 0.5) / rows) * sampleHeight),
        );
        const index = (sampleY * sampleWidth + sampleX) * 4;
        const alpha = pixels[index + 3] / 255;
        if (alpha < 0.2) continue;

        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const density = Math.min(
          1,
          alpha * (0.28 + Math.pow(luminance, 0.8) * 1.15),
        );
        if (density < 0.08) continue;

        const glyph =
          ASCII_RAMP[
            Math.min(
              ASCII_RAMP.length - 1,
              Math.max(1, Math.floor(density * ASCII_RAMP.length)),
            )
          ];
        const x = offsetX + (col + 0.5) * cellWidth;
        const y = offsetY + (row + 0.5) * cellHeight;
        const warm = luminance > 0.58;

        ctx.fillStyle = warm
          ? `rgba(255, ${Math.round(178 + luminance * 55)}, ${Math.round(
              92 + luminance * 70,
            )}, ${0.35 + luminance * 0.5})`
          : `rgba(255, 121, 0, ${0.18 + density * 0.72})`;
        ctx.fillText(glyph, x, y);
      }
    }
  }, []);

  useEffect(() => {
    if (!asciiMode || !imageReady) return;
    let frame = requestAnimationFrame(drawAscii);

    const portraitFrame = frameRef.current;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(drawAscii);
    });
    if (portraitFrame) observer.observe(portraitFrame);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [asciiMode, imageReady, drawAscii]);

  const handlePointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    panel.style.setProperty("--scan-x", `${x}px`);
    panel.style.setProperty("--scan-y", `${y}px`);

    if (event.pointerType === "mouse" && !reducedMotion) {
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      panel.style.transform = `perspective(1100px) rotateX(${(
        -ny * 2.6
      ).toFixed(2)}deg) rotateY(${(nx * 3.6).toFixed(2)}deg)`;
    }
  };

  const resetPointer = () => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.setProperty("--scan-x", "50%");
    panel.style.setProperty("--scan-y", "34%");
    panel.style.transform =
      "perspective(1100px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div className="relative w-full max-w-[410px]">
      {/* A second, offset frame gives the scanner physical depth. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border border-[#ff7900]/15 sm:translate-x-4 sm:translate-y-4"
      />

      <button
        ref={panelRef}
        type="button"
        onClick={() => setAsciiMode((active) => !active)}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
        aria-pressed={asciiMode}
        aria-label={
          asciiMode
            ? "Restore the live portrait of Om"
            : "Decode the portrait of Om into an ASCII scan"
        }
        title={asciiMode ? "Restore live portrait" : "Decode portrait"}
        style={
          {
            "--scan-x": "50%",
            "--scan-y": "34%",
          } as React.CSSProperties
        }
        className="group relative block w-full overflow-hidden rounded-2xl border border-[#ff7900]/30 bg-[#07070a] text-left shadow-[14px_18px_60px_rgba(0,0,0,0.6)] outline-none transition-[transform,border-color,box-shadow] duration-200 will-change-transform hover:border-[#ff7900]/60 focus-visible:ring-2 focus-visible:ring-[#ff7900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]"
      >
        {/* Atmosphere: warm bloom, terminal grid, pointer light. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,121,0,0.18),transparent_62%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,121,0,0.34) 1px, transparent 1px), linear-gradient(90deg, rgba(255,121,0,0.34) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            maskImage:
              "radial-gradient(ellipse at 50% 42%, black 10%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 42%, black 10%, transparent 72%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(320px circle at var(--scan-x) var(--scan-y), rgba(255,121,0,0.17), transparent 70%)",
          }}
        />

        {/* Panel header */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] sm:px-5">
          <span className="flex min-w-0 items-center gap-2 text-[#8a8780]">
            <span className="h-1.5 w-1.5 shrink-0 bg-[#ff7900]" />
            <span className="truncate">
              SUBJECT_01 <span className="text-[#4b4b52]">/</span>{" "}
              <span className="text-white">OM (OYSM)</span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-[#ff9029]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff7900] shadow-[0_0_8px_#ff7900]" />
            {asciiMode ? "ASCII MODE" : "SCAN LIVE"}
          </span>
        </div>

        {/* Portrait stage */}
        <div className="relative aspect-[5/6] w-full overflow-hidden">
          <div
            ref={frameRef}
            className="absolute inset-x-4 bottom-0 top-3 sm:inset-x-7"
          >
            <img
              ref={imageRef}
              src="/om-portrait-cutout.webp"
              alt="Om (OYSM), full-stack web and mobile engineer"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              draggable={false}
              onLoad={() => setImageReady(true)}
              className={`relative z-[1] h-full w-full object-contain object-bottom transition-opacity duration-500 ${
                asciiMode ? "opacity-0" : "opacity-100"
              }`}
            />
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className={`absolute inset-0 z-[1] h-full w-full transition-opacity duration-500 ${
                asciiMode ? "opacity-100" : "opacity-0"
              }`}
              style={{
                filter: "drop-shadow(0 0 10px rgba(255,121,0,0.25))",
              }}
            />
          </div>

          {/* Scanner sweep */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
          >
            <div
              className={`hero-scanline absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff7900] to-transparent ${
                reducedMotion ? "hidden" : ""
              }`}
            />
          </div>

          {/* Corner brackets */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3 z-[3] h-4 w-4 border-l border-t border-[#ff7900]/55 transition-all duration-300 group-hover:left-2 group-hover:top-2 group-hover:h-5 group-hover:w-5 group-hover:border-[#ff7900]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 z-[3] h-4 w-4 border-r border-t border-[#ff7900]/55 transition-all duration-300 group-hover:right-2 group-hover:top-2 group-hover:h-5 group-hover:w-5 group-hover:border-[#ff7900]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 left-3 z-[3] h-4 w-4 border-b border-l border-[#ff7900]/55 transition-all duration-300 group-hover:bottom-2 group-hover:left-2 group-hover:h-5 group-hover:w-5 group-hover:border-[#ff7900]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 right-3 z-[3] h-4 w-4 border-b border-r border-[#ff7900]/55 transition-all duration-300 group-hover:bottom-2 group-hover:right-2 group-hover:h-5 group-hover:w-5 group-hover:border-[#ff7900]"
          />

          {/* Small annotations sit in the negative space around the cutout. */}
          <div
            aria-hidden="true"
            className="absolute left-5 top-6 z-[3] hidden items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#ff9029]/80 sm:flex"
          >
            <span className="h-1 w-1 bg-[#ff7900]" />
            WEB / REACT + NODE
          </div>
          <div
            aria-hidden="true"
            className="absolute right-5 top-1/2 z-[3] hidden items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#ff9029]/80 sm:flex"
          >
            MOBILE / RN + JAVA
            <span className="h-1 w-1 bg-[#ff7900]" />
          </div>
          <div
            aria-hidden="true"
            className="absolute bottom-5 left-5 z-[3] hidden items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#ff9029]/80 sm:flex"
          >
            <span className="h-1 w-1 bg-[#ff7900]" />
            REAL-TIME / SOCKETS
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-gradient-to-t from-[#07070a] to-transparent"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[4] flex justify-center">
            <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#ff7900]/0 transition-colors duration-300 group-hover:text-[#ff7900]/80">
              {asciiMode ? "[ CLICK TO RESTORE ]" : "[ CLICK TO DECODE ]"}
            </span>
          </div>
        </div>

        {/* Panel footer */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <div className="font-display text-sm font-bold tracking-tight text-white sm:text-base">
              OM <span className="text-[#ff7900]">/</span> OYSM
            </div>
            <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#737069]">
              FULL-STACK WEB + MOBILE
            </div>
          </div>
          <span className="shrink-0 rounded border border-[#ff7900]/35 bg-[#ff7900]/[0.06] px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#ff9029]">
            {asciiMode ? "RESTORE" : "DECODE"}
          </span>
        </div>
      </button>
    </div>
  );
};
