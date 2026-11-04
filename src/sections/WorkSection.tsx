import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Project, PROJECTS, ProjectCategory } from "../data/projects";
import { AsciiNumber } from "../components/common/AsciiNumber";
import {
  ExternalLink,
  Github,
  ArrowUpRight,
  Sparkles,
  Download,
  Layers,
} from "lucide-react";

/**
 * Selected work as a 3D ring. Every project is a mini screenshot tile orbiting
 * a featured tile (projects without a screenshot fall back to a halftone ASCII
 * index). The ring turns by itself, pauses when you touch it, and a click on
 * any tile brings it to the front. Pure CSS 3D: no framer-motion, no
 * next/image, no react-icons.
 */

// ───────── Customize here ─────────
const AUTOPLAY_MS = 3200; // time each project stays in front
const TURN_MS = 900; // how long one turn of the ring takes
const RADIUS_MIN = 120;
const RADIUS_MAX = 270;
const RADIUS_WIDTH_RATIO = 0.48;
const PERSPECTIVE_MULTIPLIER = 2.4;
const RING_TILT_DEG = 38;
const RAMP = ".:-+*#%@";
// ──────────────────────────────────

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

/** A square canvas that prints `text` as halftone ASCII glyphs, orange on near-black. */
const AsciiTile: React.FC<{
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

const pad = (n: string | number) => String(n).padStart(2, "0");

/** Display URL for the screenshot browser chrome. */
const projectDomain = (p: Project) => {
  if (p.liveUrl && p.liveUrl !== "#") {
    try {
      return new URL(p.liveUrl).hostname.replace(/^www\./, "");
    } catch {
      /* fall through to local label */
    }
  }
  return `${p.id}.local`;
};

const Carousel3D: React.FC<{
  projects: Project[];
  onSelectProject: (p: Project) => void;
}> = ({ projects, onSelectProject }) => {
  const n = projects.length;
  const angleStep = 360 / n;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [rotation, setRotation] = useState(0);
  const [radius, setRadius] = useState(220);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  const steps = Math.round(rotation / angleStep);
  const centerIndex = ((-steps % n) + n) % n;
  const active = projects[centerIndex];

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      setRadius(
        Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, w * RADIUS_WIDTH_RATIO)),
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => setRotation((r) => r - dir * angleStep),
    [angleStep],
  );

  /** Bring project `j` to the front by the shortest way round. */
  const goTo = useCallback(
    (j: number) => {
      setRotation((r) => {
        const s = Math.round(r / angleStep);
        let delta = (((-j - s) % n) + n) % n;
        if (delta > n / 2) delta -= n;
        return r + delta * angleStep;
      });
    },
    [angleStep, n],
  );

  const paused = hovering || focused || !visible || reduced || n < 2;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label="Selected projects"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setFocused(false);
      }}
      className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12"
    >
      {/* ── The ring ── */}
      <div className="flex flex-col items-center overflow-hidden lg:col-span-7">
        <div
          ref={containerRef}
          className="relative flex aspect-[5/3] w-[92%] max-w-[620px] items-center justify-center select-none"
        >
          <div
            className="relative h-full w-full"
            style={{ perspective: radius * PERSPECTIVE_MULTIPLIER }}
          >
            {projects.map((p, i) => {
              const angle = rotation + angleStep * i;
              const isFront = i === centerIndex;
              return (
                <div
                  key={p.id}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${angle}deg)`,
                    transition: reduced
                      ? "none"
                      : `transform ${TURN_MS}ms cubic-bezier(.2,.8,.2,1)`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show ${p.title}`}
                    aria-current={isFront ? "true" : undefined}
                    title={p.title}
                    className="group relative rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#ff7900] sm:rounded-xl"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `translateZ(${radius}px) rotateX(${RING_TILT_DEG}deg) rotateY(${-angle}deg)`,
                      transition: reduced
                        ? "none"
                        : `transform ${TURN_MS}ms cubic-bezier(.2,.8,.2,1)`,
                    }}
                  >
                    <span className="block w-20 overflow-hidden rounded-lg border border-[#ff7900]/30 bg-[#050507] shadow-[0_6px_24px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover:border-[#ff7900] group-hover:shadow-[0_10px_28px_rgba(255,121,0,0.22)] sm:w-24 sm:rounded-xl md:w-28">
                      {/* Mini browser chrome keeps the ring tiles reading as live sites */}
                      <span className="flex items-center gap-[3px] border-b border-white/10 bg-[#0b0b0f] px-1.5 py-1">
                        <span className="h-[3px] w-[3px] rounded-full bg-[#ff5f57]/80" />
                        <span className="h-[3px] w-[3px] rounded-full bg-[#febc2e]/80" />
                        <span className="h-[3px] w-[3px] rounded-full bg-[#28c840]/80" />
                        <span className="ml-auto h-[3px] w-[3px] rounded-full bg-[#ff7900]/50" />
                      </span>

                      <span className="relative block aspect-[1.9/1] w-full overflow-hidden bg-[#0b0b0f]">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.06]"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            <AsciiTile
                              text={pad(p.index)}
                              seed={p.id}
                              className="h-9 w-9 sm:h-11 sm:w-11"
                            />
                          </span>
                        )}
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                        {!p.image && (
                          <span className="absolute bottom-1 left-1 rounded-sm border border-[#ff7900]/40 bg-black/70 px-1 py-px font-mono text-[6px] font-bold uppercase tracking-wider text-[#ff9029]">
                            concept
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Featured tile, always on top of the ring */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div
              key={active.id}
              className="wk-feature relative w-[68%] max-w-[420px] overflow-hidden rounded-xl border border-[#ff7900]/50 bg-[#050507] shadow-[0_0_60px_rgba(255,121,0,0.25)] sm:w-[78%] sm:rounded-2xl"
            >
              {active.image ? (
                <>
                  {/* Browser chrome */}
                  <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#0b0b0f] px-2.5 py-1.5 sm:px-3 sm:py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]/80" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]/80" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]/80" />
                    <span className="ml-1.5 truncate font-mono text-[8px] tracking-wide text-[#737069] sm:text-[9px]">
                      {projectDomain(active)}
                    </span>
                    <span className="ml-auto shrink-0 rounded-sm border border-[#ff7900]/30 px-1 py-px font-mono text-[7px] font-bold uppercase tracking-wider text-[#ff9029] sm:text-[8px]">
                      live
                    </span>
                  </div>
                  <div className="relative aspect-[1.9/1] w-full overflow-hidden bg-[#0b0b0f]">
                    <img
                      src={active.image}
                      alt={`${active.title} landing page preview`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top"
                    />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
                  </div>
                  <div className="flex items-end justify-between gap-3 border-t border-white/10 bg-[#0b0b0f] px-2.5 py-1.5 font-mono sm:px-3 sm:py-2">
                    <div className="min-w-0">
                      <div className="truncate text-[10px] font-bold text-white sm:text-[11px]">
                        {active.title}
                      </div>
                      <div className="truncate text-[8px] text-[#ff7900] sm:text-[9px]">
                        {active.category}
                      </div>
                    </div>
                    <span className="shrink-0 text-[8px] uppercase tracking-wider text-[#737069] sm:text-[9px]">
                      preview
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <AsciiTile
                    text={pad(active.index)}
                    seed={active.id + "-hero"}
                    hot
                    className="h-44 w-44 sm:h-48 sm:w-48 md:h-64 md:w-64 lg:h-80 lg:w-80"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050507] via-[#050507]/80 to-transparent px-3 pb-2.5 pt-8 font-mono">
                    <div className="truncate text-[11px] font-bold text-white sm:text-xs">
                      {active.title}
                    </div>
                    <div className="truncate text-[10px] text-[#ff7900]">
                      {active.category}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Controls + autoplay progress */}
        <div className="z-20 mt-6 flex items-center gap-4 font-mono text-xs sm:mt-8">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => go(-1)}
            className="rounded-md border border-[#2b2b36] bg-[#0e0e12] px-3 py-1.5 text-[#ff7900] transition-colors hover:border-[#ff7900]/60 hover:text-white active:scale-95"
          >
            [&lt;]
          </button>
          <div className="w-28 sm:w-40" aria-hidden="true">
            <div className="mb-1 flex justify-between text-[10px] text-[#737069]">
              <span>{pad(centerIndex + 1)}</span>
              <span>{pad(n)}</span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#1a1a22]">
              {!reduced && n > 1 && (
                <div
                  key={`${rotation}-${n}`}
                  className="wk-progress h-full bg-[#ff7900]"
                  style={{
                    animationDuration: `${AUTOPLAY_MS}ms`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                  onAnimationEnd={() => go(1)}
                />
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => go(1)}
            className="rounded-md border border-[#2b2b36] bg-[#0e0e12] px-3 py-1.5 text-[#ff7900] transition-colors hover:border-[#ff7900]/60 hover:text-white active:scale-95"
          >
            [&gt;]
          </button>
        </div>
        <span className="sr-only" aria-live="polite">
          {active.title}, project {centerIndex + 1} of {n}
        </span>
      </div>

      {/* ── Details of the project in front ── */}
      <div key={active.id} className="wk-feature space-y-5 lg:col-span-5">
        <div className="flex items-start justify-between gap-4 border-b border-[#1a1a22] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#ff7900]">
                {active.category}
              </span>
              {active.playStoreUrl && (
                <span className="rounded border border-emerald-500/30 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[9px] text-emerald-400">
                  PLAY STORE
                </span>
              )}
              {active.status === "In Development" && (
                <span className="rounded border border-amber-500/30 bg-amber-950/40 px-1.5 py-0.5 font-mono text-[9px] text-amber-400">
                  IN DEVELOPMENT
                </span>
              )}
            </div>
            <div className="font-mono text-xs text-[#737069]">
              {active.role}
            </div>
          </div>
          <AsciiNumber
            value={active.index}
            size="sm"
            color="text-[#ff7900]"
            className="shrink-0"
          />
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {active.title}
          </h3>
          <p className="mt-2 font-mono text-xs text-[#ff9029]">
            &gt; {active.subtitle}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#a39f96]">
            {active.description}
          </p>
          {active.status === "In Development" && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded border border-amber-500/20 bg-amber-950/20 px-2 py-1 font-mono text-[10px] text-amber-400/90">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              CONCEPT BUILD — NOT SHIPPED YET
            </p>
          )}
        </div>

        {active.metrics?.length > 0 && (
          <ul className="flex flex-wrap gap-2 font-mono text-[11px]">
            {active.metrics.slice(0, 3).map((m) => (
              <li
                key={m}
                className="rounded border border-[#ff7900]/30 bg-[#14100b] px-2 py-1 font-semibold text-[#ff9029]"
              >
                {m}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-1.5">
          {active.filterCategories.map((c) => (
            <span
              key={c}
              className="rounded border border-[#ff7900]/30 bg-[#14100b] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#ff9029]"
            >
              #{c}
            </span>
          ))}
          {active.tags.map((t) => (
            <span
              key={t}
              className="rounded border border-[#1f1f28] bg-[#111116] px-2 py-0.5 font-mono text-[10px] text-[#b0aca3]"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[#1a1a22] pt-5">
          <div className="flex items-center gap-3">
            {active.playStoreUrl ? (
              <a
                href={active.playStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 py-1 font-mono text-xs text-[#ff7900] transition-colors hover:text-[#ff9029]"
              >
                <Download className="h-3 w-3" />
                <span>PLAY STORE</span>
              </a>
            ) : active.liveUrl && active.liveUrl !== "#" ? (
              <a
                href={active.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 py-1 font-mono text-xs text-white transition-colors hover:text-[#ff7900]"
              >
                <span>LIVE</span>
                <ExternalLink className="h-3 w-3 text-[#ff7900]" />
              </a>
            ) : active.status === "In Development" ? (
              <span className="py-1 font-mono text-xs text-amber-400/80">
                IN DEVELOPMENT
              </span>
            ) : (
              <span className="py-1 font-mono text-xs text-[#737069]">
                LOCAL READY
              </span>
            )}
            <span className="text-[#333]">·</span>
            <a
              href={active.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 py-1 font-mono text-xs text-[#a39f96] transition-colors hover:text-white"
            >
              <span>CODE</span>
              <Github className="h-3 w-3" />
            </a>
          </div>
          <button
            type="button"
            onClick={() => onSelectProject(active)}
            className="flex items-center gap-1 rounded-lg bg-[#ff7900] px-4 py-2 font-mono text-xs font-bold text-black shadow-[0_0_20px_rgba(255,121,0,0.35)] transition-transform active:scale-95"
          >
            <span>DETAILS</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface WorkSectionProps {
  onSelectProject: (project: Project) => void;
}

const CSS = `
@keyframes wk-in { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: none; } }
.wk-feature { animation: wk-in .45s cubic-bezier(.22,1,.36,1) both; }
@keyframes wk-prog { from { width: 0; } to { width: 100%; } }
.wk-progress { animation-name: wk-prog; animation-timing-function: linear; animation-fill-mode: forwards; }
@media (prefers-reduced-motion: reduce) { .wk-feature { animation: none; } }
`;

export const WorkSection: React.FC<WorkSectionProps> = ({
  onSelectProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | ProjectCategory
  >("All");

  // Warm the cache so the ring can swap screenshots without a flash.
  useEffect(() => {
    PROJECTS.forEach((p) => {
      if (!p.image) return;
      const img = new window.Image();
      img.decoding = "async";
      img.src = p.image;
    });
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      All: PROJECTS.length,
      MERN: 0,
      Mobile: 0,
      "UI/UX": 0,
      "Real-Time": 0,
    };
    PROJECTS.forEach((p) => {
      p.filterCategories.forEach((cat) => {
        if (map[cat] !== undefined) map[cat]++;
      });
    });
    return map;
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") return PROJECTS;
    return PROJECTS.filter((p) =>
      p.filterCategories.includes(selectedCategory),
    );
  }, [selectedCategory]);

  const categoriesList: {
    id: "All" | ProjectCategory;
    label: string;
    desc: string;
  }[] = [
    { id: "All", label: "All Projects", desc: "All Web & Mobile Works" },
    { id: "MERN", label: "MERN Stack", desc: "React, Node, Express, MongoDB" },
    { id: "Mobile", label: "Mobile Apps", desc: "React Native & Android" },
    { id: "UI/UX", label: "UI/UX & 3D", desc: "Interactive Design & CMS" },
    { id: "Real-Time", label: "Real-Time", desc: "WebSockets & Sockets" },
  ];

  return (
    <section
      id="work"
      className="relative w-full overflow-hidden border-t border-[#181820] bg-[#040405] px-6 py-28 sm:px-8 md:px-12"
    >
      <style>{CSS}</style>
      <div className="mx-auto w-full max-w-7xl space-y-12">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-[#1a1a22] pb-8 lg:flex-row lg:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#ff7900]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>04. SELECTED WORK &amp; PRODUCTION CASE STUDIES</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Web &amp; Mobile Deployments
            </h2>
            <p className="max-w-xl text-sm text-[#a39f96] sm:text-base">
              Filter through full-stack MERN platforms, mobile applications
              (React Native &amp; Android Java), real-time WebSocket systems,
              and high-fidelity UI/UX ecosystems.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 whitespace-nowrap font-mono text-xs text-[#8a8780] lg:text-right">
            <Layers className="h-4 w-4 text-[#ff7900]" />
            <span>
              DISPLAYING{" "}
              <strong className="text-white">{filteredProjects.length}</strong>{" "}
              OF <strong className="text-white">{PROJECTS.length}</strong>{" "}
              PROJECTS
            </span>
          </div>
        </div>

        {/* Category-Based Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-xl border border-[#1e1e26] bg-[#0c0c10] p-1.5">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = counts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 font-mono text-xs transition-all ${
                    isSelected
                      ? "bg-[#ff7900] font-bold text-black shadow-[0_0_20px_rgba(255,121,0,0.35)]"
                      : "text-[#8a8780] hover:bg-[#16161d] hover:text-white"
                  }`}
                  title={cat.desc}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`rounded px-1.5 font-mono text-[10px] ${isSelected ? "bg-black/30 font-bold text-black" : "bg-[#181820] text-[#ff7900]"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden font-mono text-xs text-[#737069] md:block">
            FILTER:{" "}
            <span className="font-bold uppercase text-[#ff7900]">
              {selectedCategory}
            </span>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="space-y-3 rounded-2xl border border-[#1e1e26] bg-[#0c0c10] p-12 text-center font-mono">
            <div className="text-sm text-[#ff7900]">
              &lt;NO PROJECTS FOUND IN THIS CATEGORY&gt;
            </div>
            <p className="text-xs text-[#737069]">
              Select another category filter to explore works.
            </p>
          </div>
        ) : (
          // key = category, so the ring restarts at the first project when the filter changes
          <Carousel3D
            key={selectedCategory}
            projects={filteredProjects}
            onSelectProject={onSelectProject}
          />
        )}
      </div>
    </section>
  );
};
