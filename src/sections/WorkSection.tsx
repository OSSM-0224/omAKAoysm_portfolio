import React, { useEffect, useMemo, useRef, useState } from "react";
import { Project, PROJECTS, ProjectCategory } from "../data/projects";
import { AsciiTile } from "../components/common/AsciiTile";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

/**
 * Selected work as a horizontal film strip: large landscape frames, only the
 * project name beneath each one, and a continuous GPU-composited drift that
 * keeps moving on hover. Visitors can pause it, drag it, or step with the
 * arrow controls.
 */

const pad = (n: string | number) => String(n).padStart(2, "0");
const DRIFT_PX_PER_SECOND = 64;
const TWEEN_MS = 620;

/** Wrap a position into [0, length) so the duplicated strip loops forever. */
const wrap = (value: number, length: number) => {
  if (length <= 0) return value;
  return ((value % length) + length) % length;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const CSS = `
.work-track {
  will-change: transform;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
}
@media (prefers-reduced-motion: reduce) {
  .work-track { will-change: auto; }
}
`;

interface WorkSectionProps {
  onSelectProject: (project: Project) => void;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  onSelectProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | ProjectCategory
  >("All");
  const [autoScroll, setAutoScroll] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );

  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const loopDistanceRef = useRef(0);
  const offsetRef = useRef(0);
  const tweenRef = useRef<{
    from: number;
    delta: number;
    start: number;
    duration: number;
  } | null>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startOffset: 0,
    moved: 0,
  });
  const suppressClickRef = useRef(false);
  const reducedMotion = useReducedMotion();

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      All: PROJECTS.length,
      MERN: 0,
      Mobile: 0,
      "UI/UX": 0,
      "Real-Time": 0,
      Client: 0,
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

  /* Repeat the set enough times that the strip never runs out of frames
     while it loops, even for a category with only two projects. */
  const setCopies = filteredProjects.length > 2 ? 2 : 4;
  const railProjects = useMemo(
    () =>
      filteredProjects.length < 2
        ? filteredProjects
        : Array.from({ length: setCopies }, () => filteredProjects).flat(),
    [filteredProjects, setCopies],
  );

  const categoriesList: {
    id: "All" | ProjectCategory;
    label: string;
    desc: string;
  }[] = [
    { id: "All", label: "All", desc: "All web & mobile work" },
    { id: "MERN", label: "MERN", desc: "React, Node, Express, MongoDB" },
    { id: "Mobile", label: "Mobile", desc: "React Native & Android" },
    { id: "UI/UX", label: "UI/UX", desc: "Interactive design & CMS" },
    { id: "Real-Time", label: "Real-Time", desc: "WebSockets & live systems" },
    { id: "Client", label: "Client", desc: "Commissioned client builds" },
  ];

  const renderOffset = () => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
  };

  /* Reset the strip when the category changes. */
  useEffect(() => {
    offsetRef.current = 0;
    tweenRef.current = null;
    loopDistanceRef.current = 0;
    renderOffset();
  }, [selectedCategory]);

  /* Measure one full set (including the gap) so the loop point is invisible. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      const firstClone = track.children[filteredProjects.length] as
        | HTMLElement
        | undefined;
      loopDistanceRef.current =
        first && firstClone ? firstClone.offsetLeft - first.offsetLeft : 0;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [filteredProjects.length, selectedCategory]);

  /* Only move while the strip is actually on screen. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  /* Pause the drift while the tab is in the background. */
  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /* Respect the visitor's motion preference by starting paused. */
  useEffect(() => {
    if (reducedMotion) setAutoScroll(false);
  }, [reducedMotion]);

  /* One animation loop drives drift, arrow tweens, and the loop wrap. Every
     frame moves the track with a composited transform instead of scrollLeft. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !inView || !pageVisible) {
      renderOffset();
      return;
    }

    let frame = 0;
    let previous = performance.now();
    let lastRendered = Number.NaN;

    const tick = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.064);
      previous = now;

      const tween = tweenRef.current;
      if (tween) {
        const progress = Math.min(1, (now - tween.start) / tween.duration);
        offsetRef.current = wrap(
          tween.from + tween.delta * easeOutCubic(progress),
          loopDistanceRef.current,
        );
        if (progress >= 1) tweenRef.current = null;
      } else if (!dragRef.current.active && autoScroll && !reducedMotion) {
        offsetRef.current = wrap(
          offsetRef.current + DRIFT_PX_PER_SECOND * delta,
          loopDistanceRef.current,
        );
      }

      if (offsetRef.current !== lastRendered) {
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
        lastRendered = offsetRef.current;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, pageVisible, autoScroll, reducedMotion]);

  const getCardStep = () => {
    const track = trackRef.current;
    if (!track) return 360;
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    if (first && second) return second.offsetLeft - first.offsetLeft;
    return first ? first.offsetWidth + 32 : 360;
  };

  const scrollRail = (direction: 1 | -1) => {
    const step = getCardStep() * direction;
    if (reducedMotion) {
      offsetRef.current = wrap(
        offsetRef.current + step,
        loopDistanceRef.current,
      );
      renderOffset();
      return;
    }
    tweenRef.current = {
      from: offsetRef.current,
      delta: step,
      start: performance.now(),
      duration: TWEEN_MS,
    };
  };

  const onRailKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollRail(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollRail(-1);
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startOffset: offsetRef.current,
      moved: 0,
    };
    tweenRef.current = null;
    setDragging(true);
  };

  /* Window-level drag so releasing outside the strip still ends cleanly. */
  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      if (!dragRef.current.active) return;
      const distance = event.clientX - dragRef.current.startX;
      dragRef.current.moved = Math.max(
        dragRef.current.moved,
        Math.abs(distance),
      );
      offsetRef.current = wrap(
        dragRef.current.startOffset - distance,
        loopDistanceRef.current,
      );
      renderOffset();
    };

    const onUp = () => {
      dragRef.current.active = false;
      setDragging(false);
      suppressClickRef.current = dragRef.current.moved > 8;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 80);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging]);

  const onRailClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <section
      id="work"
      className="relative w-full overflow-hidden border-t border-[#181820] bg-[#040405] px-6 py-28 sm:px-8 md:px-12"
    >
      <style>{CSS}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff7900]/40 to-transparent"
      />
      <div className="mx-auto w-full max-w-[1400px]">
        {/* Section header */}
        <div className="border-b border-[#1a1a22] pb-10">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#ff7a2e]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>04. Selected Work</span>
          </div>
          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <h2 className="max-w-4xl font-display text-[clamp(1.95rem,8.2vw,5.8rem)] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white">
              Web <span className="text-[#ff5500]">&amp;</span> Mobile
              <br />
              <span className="text-[0.8em] leading-[0.95] text-[#6e675f] sm:text-[1em] sm:leading-[0.9]">
                Deployments
              </span>
            </h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-[#a7a097] sm:text-base lg:pb-2">
              A moving index of production platforms, mobile products and
              client builds. Drag through, then open any frame for the case
              study.
            </p>
          </div>
        </div>

        {/* Filter rail + manual controls */}
        <div className="mt-5 flex flex-col gap-4 border-b border-[#1a1a22] pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = counts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  aria-pressed={isSelected}
                  title={cat.desc}
                  className={`relative shrink-0 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ff7900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040405] ${
                    isSelected
                      ? "text-white"
                      : "text-[#8d877e] hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1.5 tabular-nums ${
                      isSelected ? "text-[#ff7900]" : "text-[#5f5b54]"
                    }`}
                  >
                    {pad(count)}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 bottom-0 h-px origin-left bg-[#ff7900] transition-transform duration-500 ${
                      isSelected ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
            <div className="mr-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#7f7a72]">
              <span className="text-white">
                {pad(filteredProjects.length)}
              </span>{" "}
              / {pad(PROJECTS.length)} files
            </div>
            <button
              type="button"
              onClick={() => setAutoScroll((running) => !running)}
              aria-pressed={autoScroll}
              aria-label={
                autoScroll
                  ? "Pause automatic project scrolling"
                  : "Resume automatic project scrolling"
              }
              title={autoScroll ? "Pause auto-scroll" : "Resume auto-scroll"}
              className={`group inline-flex h-8 items-center gap-2 border px-2.5 font-mono text-[9px] uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ff7900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040405] ${
                autoScroll
                  ? "border-[#ff7900]/50 text-[#ffb06b] hover:border-[#ff7900] hover:text-white"
                  : "border-[#24242c] text-[#8d877e] hover:border-white/40 hover:text-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  autoScroll
                    ? "bg-[#ff7900] motion-safe:animate-pulse"
                    : "bg-[#5f5b54]"
                }`}
              />
              {autoScroll ? "Auto" : "Paused"}
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollRail(-1)}
                aria-label="Scroll projects left"
                className="flex h-8 w-8 items-center justify-center border border-[#24242c] text-[#a7a097] transition-colors hover:border-[#ff7900]/70 hover:text-[#ff7900] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ff7900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040405]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(1)}
                aria-label="Scroll projects right"
                className="flex h-8 w-8 items-center justify-center border border-[#24242c] text-[#a7a097] transition-colors hover:border-[#ff7900]/70 hover:text-[#ff7900] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ff7900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040405]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal film strip */}
        {filteredProjects.length === 0 ? (
          <div className="mt-16 border border-[#1e1e26] bg-[#08080a] p-12 text-center font-mono">
            <div className="text-sm text-[#ff7900]">
              &lt;NO PROJECTS FOUND IN THIS CATEGORY&gt;
            </div>
            <p className="mt-2 text-xs text-[#8d877e]">
              Select another category filter to explore works.
            </p>
          </div>
        ) : (
          <div
            ref={stageRef}
            className="relative -mx-6 mt-10 overflow-hidden sm:-mx-8 md:-mx-12"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#040405] to-transparent sm:w-14"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#040405] to-transparent sm:w-14"
            />
            <div
              ref={trackRef}
              role="region"
              aria-label="Selected projects, horizontally scrollable"
              tabIndex={0}
              onKeyDown={onRailKeyDown}
              onPointerDown={onPointerDown}
              onClickCapture={onRailClickCapture}
              className={`work-track flex w-max touch-pan-y select-none gap-6 px-6 pb-3 pt-1 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#ff7900]/70 sm:gap-8 sm:px-8 md:gap-10 md:px-12 ${
                dragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {railProjects.map((project, index) => {
                const isClone = index >= filteredProjects.length;
                const image = project.image || project.gallery?.[0]?.src;
                return (
                  <button
                    key={`${project.id}-${index}`}
                    type="button"
                    data-project-card=""
                    tabIndex={isClone ? -1 : 0}
                    aria-hidden={isClone || undefined}
                    onClick={() => onSelectProject(project)}
                    data-cursor="view"
                    aria-label={`Open ${project.title} case study`}
                    className="group w-[84vw] max-w-[460px] shrink-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#ff7900] focus-visible:ring-offset-4 focus-visible:ring-offset-[#040405] sm:w-[62vw] sm:max-w-[620px] md:w-[52vw] md:max-w-[660px] lg:w-[46vw] lg:max-w-[700px] xl:w-[44vw] xl:max-w-[760px]"
                  >
                    <div className="relative overflow-hidden border border-[#202028] bg-[#070709]">
                      <div className="aspect-[16/9] w-full overflow-hidden">
                        {image ? (
                          <img
                            src={image}
                            alt={`${project.title} preview`}
                            loading={index < 3 ? "eager" : "lazy"}
                            decoding="async"
                            draggable={false}
                            className="pointer-events-none h-full w-full object-cover object-top transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035] motion-reduce:transition-none"
                          />
                        ) : (
                          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#070709]">
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-[linear-gradient(rgba(255,85,0,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,85,0,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-60"
                            />
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,85,0,0.15),transparent_62%)]"
                            />
                            <AsciiTile
                              text={project.index}
                              seed={project.id}
                              hot
                              className="relative h-28 w-28 sm:h-36 sm:w-36"
                            />
                            <span className="absolute bottom-4 left-4 rounded-sm border border-[#ff7900]/40 bg-black/70 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#ff9029]">
                              Concept — preview pending
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-60 transition-opacity duration-500 group-hover:opacity-90"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5"
                      />

                      <span className="absolute left-4 top-4 font-mono text-[10px] font-semibold tracking-[0.2em] text-white/75">
                        {project.index}
                      </span>

                      <span className="pointer-events-none absolute bottom-4 right-4 flex translate-y-2 items-center gap-2 border border-white/20 bg-black/55 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
                        View case
                        <ArrowUpRight className="h-3 w-3 text-[#ff7900]" />
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between gap-5 border-b border-[#1c1c24] pb-4 transition-colors duration-300 group-hover:border-[#ff7900]/50">
                      <div className="flex min-w-0 items-baseline gap-3">
                        <span className="shrink-0 font-mono text-[10px] font-semibold tracking-[0.16em] text-[#ff7900] sm:text-[11px]">
                          {project.index}
                        </span>
                        <h3 className="font-display text-[clamp(1.15rem,2.6vw,2rem)] font-bold leading-[1.06] tracking-[-0.03em] text-white transition-colors duration-300 group-hover:text-[#ffb06b]">
                          {project.title}
                        </h3>
                      </div>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 translate-y-0.5 text-[#7d7970] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#ff7900] motion-reduce:transition-none"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
