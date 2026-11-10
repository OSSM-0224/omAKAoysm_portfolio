import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Github,
  X,
} from "lucide-react";
import { Project } from "../../data/projects";
import { AsciiTile } from "./AsciiTile";

const PANEL_COUNT = 5;
const AUTOPLAY_MS = 5600;
const SLIDE_EASE = "cubic-bezier(0.16,1,0.3,1)";

const pad = (n: number) => String(n).padStart(2, "0");

const CSS = `
.pp-scroll {
  scrollbar-width: thin;
  scrollbar-color: #ff7900 #0a0a0c;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
.pp-scroll::-webkit-scrollbar { width: 6px; }
.pp-scroll::-webkit-scrollbar-track { background: #08080a; }
.pp-scroll::-webkit-scrollbar-thumb { background: #33323a; border-radius: 99px; }
.pp-scroll::-webkit-scrollbar-thumb:hover { background: #ff7900; }

.pp-focus:focus-visible {
  outline: 1px solid #ff7900;
  outline-offset: 3px;
}

@keyframes pp-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.pp-slide-progress {
  transform-origin: left center;
  animation-name: pp-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes pp-drift {
  from { transform: scale(1); }
  to { transform: scale(1.035); }
}
.pp-slide-drift {
  animation: pp-drift 8s ${SLIDE_EASE} forwards;
}

.pp-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

@media (prefers-reduced-motion: reduce) {
  .pp-slide-drift { animation: none; }
}
`;

interface ProjectPageProps {
  project: Project;
  nextProject: Project;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const projectDomain = (project: Project) => {
  if (project.liveUrl && project.liveUrl !== "#") {
    try {
      return new URL(project.liveUrl).hostname.replace(/^www\./, "");
    } catch {
      /* fall through to local label */
    }
  }
  return `${project.id}.local`;
};

export const ProjectPage: React.FC<ProjectPageProps> = ({
  project,
  nextProject,
  currentIndex,
  totalCount,
  onClose,
  onNext,
  onPrev,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const heroMediaRef = useRef<HTMLDivElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const galleryRef = useRef<HTMLElement | null>(null);
  const swapTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const closingRef = useRef(false);
  const previousProjectRef = useRef(project.id);
  const originalTitleRef = useRef(document.title);
  const pointerStartRef = useRef<number | null>(null);

  const [slideIndex, setSlideIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [galleryInView, setGalleryInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const gallery = project.gallery?.length
    ? project.gallery
    : project.image
      ? [
          {
            src: project.image,
            alt: `${project.title} preview`,
            label: "Project preview",
          },
        ]
      : [];

  const heroImage = project.image || gallery[0]?.src;
  const slideCount = gallery.length;
  const canAutoplay =
    slideCount > 1 && !hoverPaused && galleryInView && pageVisible && !reducedMotion;
  const activeSlide = gallery[slideIndex] ?? gallery[0];

  const goToSlide = useCallback(
    (direction: 1 | -1) => {
      if (slideCount < 2) return;
      setSlideIndex((current) => {
        const next = current + direction;
        return (next + slideCount) % slideCount;
      });
    },
    [slideCount],
  );

  /* Reduced-motion preference and tab visibility */
  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /* Focus the case study, restore the previous focus on exit, swap the title */
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    scrollRef.current?.focus({ preventScroll: true });
    document.title = `${project.title} — OM (OYSM)`;
    return () => {
      document.title = originalTitleRef.current;
      previousFocus?.focus?.({ preventScroll: true });
    };
    // The title updates in its own effect below; this only handles entry/exit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = `${project.title} — OM (OYSM)`;
  }, [project.title]);

  /* Warm the gallery so slide changes never flash */
  useEffect(() => {
    const sources = new Set<string>();
    if (project.image) sources.add(project.image);
    project.gallery?.forEach((item) => sources.add(item.src));
    sources.forEach((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
    });
  }, [project.id, project.image, project.gallery]);

  /* Reset the reading position when a different case study is opened */
  useEffect(() => {
    setSlideIndex(0);
    setScrolled(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [project.id]);

  /* Opening sequence: five columns lift away from the case study */
  useEffect(() => {
    const panels = curtainRef.current?.querySelectorAll<HTMLElement>(
      ".pp-curtain-panel",
    );
    if (!panels?.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(panels, { yPercent: -101 });
      return;
    }

    const timeline = gsap.timeline();
    timeline
      .to(panels, {
        yPercent: -101,
        duration: 0.85,
        stagger: 0.055,
        ease: "power4.inOut",
      })
      .fromTo(
        heroMediaRef.current,
        { scale: 1.08, opacity: 0.45 },
        { scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" },
        0.12,
      )
      .fromTo(
        heroTitleRef.current,
        { yPercent: 112 },
        { yPercent: 0, duration: 0.95, ease: "power3.out" },
        0.34,
      );

    return () => {
      timeline.kill();
    };
  }, []);

  /* Interrupt-safe shutter transition when moving between case studies */
  useLayoutEffect(() => {
    if (previousProjectRef.current === project.id) return;
    previousProjectRef.current = project.id;
    closingRef.current = false;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const panels = curtainRef.current?.querySelectorAll<HTMLElement>(
      ".pp-curtain-panel",
    );
    if (!panels?.length) return;

    swapTimelineRef.current?.kill();
    const timeline = gsap.timeline();
    timeline
      .set(panels, { yPercent: -101 })
      .to(panels, {
        yPercent: 0,
        duration: 0.4,
        stagger: 0.03,
        ease: "power3.inOut",
      })
      .to(panels, {
        yPercent: -101,
        duration: 0.6,
        stagger: 0.045,
        ease: "power4.inOut",
      }, "+=0.04")
      .fromTo(
        heroTitleRef.current,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.7, ease: "power3.out" },
        "-=0.34",
      );

    swapTimelineRef.current = timeline;
    return () => {
      timeline.kill();
    };
  }, [project.id]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    swapTimelineRef.current?.kill();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }

    const panels = curtainRef.current?.querySelectorAll<HTMLElement>(
      ".pp-curtain-panel",
    );
    if (!panels?.length) {
      onClose();
      return;
    }

    gsap
      .timeline({ onComplete: onClose })
      .to(contentRef.current, {
        opacity: 0,
        y: -14,
        duration: 0.32,
        ease: "power2.in",
      })
      .to(
        panels,
        {
          yPercent: 0,
          duration: 0.62,
          stagger: 0.045,
          ease: "power4.inOut",
        },
        0.04,
      );
  }, [onClose]);

  /* Gallery viewport + autoplay controls */
  useEffect(() => {
    const element = galleryRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setGalleryInView(entry.isIntersecting),
      { threshold: 0.18 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const onStageFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setHoverPaused(true);
    }
  };

  const onStageBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setHoverPaused(false);
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) return;
    pointerStartRef.current = event.clientX;
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartRef.current === null) return;
    const distance = event.clientX - pointerStartRef.current;
    pointerStartRef.current = null;
    if (Math.abs(distance) < 48) return;
    goToSlide(distance < 0 ? 1 : -1);
  };

  /* Keyboard: escape closes, arrows move through the gallery */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToSlide(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToSlide(-1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, goToSlide]);

  const primaryLink = project.playStoreUrl
    ? project.playStoreUrl
    : project.liveUrl && project.liveUrl !== "#"
      ? project.liveUrl
      : null;
  const primaryLabel = project.playStoreUrl
    ? "View on Google Play"
    : "Open live site";

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-page-title"
      className="fixed inset-0 z-[70] bg-[#050505] text-[#f4f1ea]"
    >
      <style>{CSS}</style>

      {/* Five-column shutter used for entry, exit, and case-study swaps */}
      <div
        ref={curtainRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[120] flex"
      >
        {Array.from({ length: PANEL_COUNT }).map((_, index) => (
          <div
            key={index}
            className="pp-curtain-panel h-full flex-1 will-change-transform"
            style={{
              background:
                index % 2 === 0
                  ? "linear-gradient(180deg, #0b0b0d 0%, #060607 100%)"
                  : "linear-gradient(180deg, #070708 0%, #0a0a0c 100%)",
            }}
          />
        ))}
      </div>

      <div
        ref={scrollRef}
        tabIndex={-1}
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 48)}
        className="pp-scroll relative h-[100dvh] overflow-x-hidden overflow-y-auto outline-none"
      >
        <div ref={contentRef}>
          <header
            className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
              scrolled
                ? "border-b border-white/10 bg-[#050505]/85 backdrop-blur-xl"
                : "border-b border-transparent bg-gradient-to-b from-[#050505]/85 to-transparent"
            }`}
          >
            <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
              <button
                type="button"
                onClick={handleClose}
                className="pp-focus group inline-flex items-center gap-2.5 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#c8c2b8] transition-colors hover:text-white sm:text-[10px]"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#ff7900] transition-transform duration-300 group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Return to index</span>
                <span className="sm:hidden">Index</span>
              </button>

              <div className="hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-[#8d877e] md:flex">
                <span className="text-[#ff8a2a]">{project.category}</span>
                <span className="h-3 w-px bg-white/15" />
                <span>
                  {pad(currentIndex + 1)}{" "}
                  <span className="text-[#5f5b54]">/ {pad(totalCount)}</span>
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onPrev}
                  aria-label="Previous project"
                  title="Previous project"
                  className="pp-focus inline-flex h-9 w-9 items-center justify-center text-[#a7a097] transition-colors hover:text-[#ff7900]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  aria-label="Next project"
                  title="Next project"
                  className="pp-focus inline-flex h-9 w-9 items-center justify-center text-[#a7a097] transition-colors hover:text-[#ff7900]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="mx-1.5 h-4 w-px bg-white/15" />
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close project page"
                  className="pp-focus group inline-flex items-center gap-2 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#8d877e] transition-colors hover:text-white"
                >
                  <span className="hidden sm:inline">Close</span>
                  <span className="hidden text-[#5f5b54] md:inline">[esc]</span>
                  <X className="h-4 w-4 transition-colors group-hover:text-[#ff7900]" />
                </button>
              </div>
            </div>
          </header>

          <main>
            {/* ── Hero ── */}
            <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pt-24">
              <div ref={heroMediaRef} className="absolute inset-0">
                {heroImage ? (
                  <>
                    <img
                      src={heroImage}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full scale-[1.04] object-cover object-top opacity-55"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/72 to-[#050505]/25" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_68%_18%,rgba(255,121,0,0.16),transparent_56%)]" />
                  </>
                ) : (
                  <>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(rgba(255,85,0,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,85,0,0.07)_1px,transparent_1px)] bg-[size:52px_52px] opacity-70"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,85,0,0.2),transparent_60%)]"
                    />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <AsciiTile
                        text={project.index}
                        seed={`${project.id}-hero`}
                        hot
                        className="h-[42vw] w-[42vw] max-h-[520px] max-w-[520px] opacity-70"
                      />
                    </div>
                  </>
                )}
                <div className="absolute inset-0 pp-grain opacity-[0.05] mix-blend-soft-light" />
              </div>

              <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pb-10 sm:px-10 lg:px-14">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/15 pb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-[#c8c2b8]">
                  <span className="text-[#ff8a2a]">{project.category}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>{project.role}</span>
                  <span className="w-full text-[#8d877e] sm:ml-auto sm:w-auto">
                    {project.status === "In Development"
                      ? "In development"
                      : "Shipped"}{" "}
                    <span className="mx-1 text-white/25">/</span>{" "}
                    {project.duration}
                  </span>
                </div>

                <div className="mt-8 overflow-hidden pb-1">
                  <h1
                    id="project-page-title"
                    ref={heroTitleRef}
                    className="max-w-[18ch] text-balance font-display text-[clamp(2.7rem,8vw,8rem)] font-black leading-[0.86] tracking-[-0.055em] text-white"
                  >
                    {project.title}
                  </h1>
                </div>

                <div className="mt-8 grid gap-8 border-t border-white/15 pt-6 lg:grid-cols-12 lg:items-end">
                  <p className="max-w-md font-display text-base font-medium leading-relaxed text-[#e0dbd1] sm:text-lg lg:col-span-5">
                    {project.subtitle}
                  </p>
                  <p className="max-w-lg text-sm leading-relaxed text-[#a7a097] lg:col-span-4">
                    {project.description}
                  </p>
                  <div className="flex flex-col gap-2.5 lg:col-span-3 lg:items-end">
                    {primaryLink ? (
                      <a
                        href={primaryLink}
                        target="_blank"
                        rel="noreferrer"
                        className="pp-focus group inline-flex w-full items-center justify-between gap-4 bg-[#ff7900] px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-[#ff9029] sm:w-auto sm:min-w-[210px]"
                      >
                        <span>{primaryLabel}</span>
                        {project.playStoreUrl ? (
                          <Download className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        )}
                      </a>
                    ) : (
                      <span className="inline-flex w-full items-center justify-between gap-4 border border-amber-500/30 bg-amber-950/20 px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-amber-400/90 sm:w-auto sm:min-w-[210px]">
                        <span>In development</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      </span>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="pp-focus group inline-flex w-full items-center justify-between gap-4 border border-white/20 px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#e0dbd1] transition-colors hover:border-[#ff7900]/70 hover:text-white sm:w-auto sm:min-w-[210px]"
                      >
                        <span>Source code</span>
                        <Github className="h-3.5 w-3.5 text-[#ff7900]" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-12 flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.22em] text-[#8d877e]">
                  <span className="flex items-center gap-3">
                    <span className="h-px w-8 bg-[#ff7900]" />
                    Scroll to explore
                  </span>
                  <span className="hidden sm:inline">
                    {projectDomain(project)}
                  </span>
                </div>
              </div>
            </section>

            {/* ── Project file ── */}
            <section className="border-t border-white/10">
              <div className="mx-auto grid max-w-[1500px] gap-14 px-6 py-20 sm:px-10 lg:grid-cols-12 lg:gap-10 lg:px-14 lg:py-28">
                <aside className="lg:col-span-3">
                  <div className="lg:sticky lg:top-28">
                    <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#ff8a2a]">
                      Project file
                    </div>
                    <dl className="mt-6 space-y-6 border-t border-white/10 pt-6">
                      <div>
                        <dt className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#7f7a72]">
                          Role
                        </dt>
                        <dd className="mt-1.5 text-sm leading-relaxed text-[#d8d3c8]">
                          {project.role}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#7f7a72]">
                          Timeline
                        </dt>
                        <dd className="mt-1.5 text-sm leading-relaxed text-[#d8d3c8]">
                          {project.duration}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#7f7a72]">
                          Status
                        </dt>
                        <dd className="mt-1.5 text-sm leading-relaxed text-[#d8d3c8]">
                          {project.status === "In Development"
                            ? "In development"
                            : "Live / delivered"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#7f7a72]">
                          Stack
                        </dt>
                        <dd className="mt-2 flex flex-wrap gap-1.5">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-white/10 bg-white/[0.025] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-[#a9a095]"
                            >
                              {tag}
                            </span>
                          ))}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </aside>

                <div className="lg:col-span-8 lg:col-start-5">
                  <h2 className="max-w-2xl text-balance font-display text-[clamp(1.9rem,4vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.04em] text-white">
                    Inside the build<span className="text-[#ff7900]">.</span>
                  </h2>
                  <p className="mt-7 max-w-2xl text-pretty text-sm leading-[1.85] text-[#b9b4aa] sm:text-base">
                    {project.longDescription}
                  </p>

                  <div className="mt-12">
                    <h3 className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#ff8a2a]">
                      Core modules
                    </h3>
                    <ul className="mt-4 border-t border-white/10">
                      {project.features.map((feature, index) => (
                        <li
                          key={feature}
                          className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-white/10 py-4 transition-colors hover:bg-white/[0.02]"
                        >
                          <span className="pt-0.5 font-mono text-[9px] tracking-[0.1em] text-[#ff7900]">
                            {pad(index + 1)}
                          </span>
                          <span className="text-sm leading-relaxed text-[#d8d3c8]">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-12 grid grid-cols-1 border-y border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
                    {project.metrics.map((metric, index) => (
                      <div
                        key={metric}
                        className="py-5 sm:px-5 sm:first:pl-0 sm:last:pr-0"
                      >
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7f7a72]">
                          {pad(index + 1)}
                        </div>
                        <div className="mt-2 font-display text-base font-bold leading-snug text-white">
                          {metric}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Full-bleed frames ── */}
            <section
              ref={galleryRef}
              aria-label={`${project.title} gallery`}
              className="relative border-t border-white/10"
            >
              <div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-6 px-6 pb-8 pt-16 sm:px-10 lg:px-14 lg:pt-20">
                <h2 className="font-display text-[clamp(2rem,4.6vw,4.6rem)] font-bold leading-none tracking-[-0.045em] text-white">
                  Selected frames<span className="text-[#ff7900]">.</span>
                </h2>
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8d877e]">
                  <span className="text-white">
                    {pad(slideCount ? slideIndex + 1 : 0)}
                  </span>{" "}
                  <span className="text-[#5f5b54]">
                    / {pad(slideCount || 0)}
                  </span>
                </div>
              </div>

              {slideCount > 0 ? (
                <div
                  className="relative h-[78svh] min-h-[460px] w-full overflow-hidden bg-[#08080a] sm:h-[82svh]"
                  onMouseEnter={() => setHoverPaused(true)}
                  onMouseLeave={() => setHoverPaused(false)}
                  onFocus={onStageFocus}
                  onBlur={onStageBlur}
                  onPointerDown={onPointerDown}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => {
                    pointerStartRef.current = null;
                  }}
                >
                  {gallery.map((item, index) => {
                    const isActive = index === slideIndex;
                    return (
                      <div
                        key={`${item.src}-${index}`}
                        aria-hidden={!isActive}
                        className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <img
                          src={item.src}
                          alt=""
                          aria-hidden="true"
                          draggable={false}
                          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
                        />
                        <div className="absolute inset-0 bg-[#050505]/60" />
                        <div
                          className={`absolute inset-0 flex items-center justify-center ${
                            item.kind === "portrait"
                              ? "px-[20%] py-[7%] sm:px-[32%]"
                              : "px-[4%] py-[7%] sm:px-[7%]"
                          }`}
                        >
                          <img
                            src={item.src}
                            alt={item.alt}
                            loading={index === 0 ? "eager" : "lazy"}
                            decoding="async"
                            draggable={false}
                            className={`max-h-full max-w-full object-contain shadow-[0_30px_120px_rgba(0,0,0,0.55)] ${
                              isActive && !reducedMotion
                                ? "pp-slide-drift"
                                : ""
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
                  />

                  {slideCount > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => goToSlide(-1)}
                        aria-label="Previous gallery image"
                        className="pp-focus absolute left-3 top-1/2 z-20 -translate-y-1/2 bg-black/35 p-2.5 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-[#ff7900] sm:left-6 sm:p-3"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToSlide(1)}
                        aria-label="Next gallery image"
                        className="pp-focus absolute right-3 top-1/2 z-20 -translate-y-1/2 bg-black/35 p-2.5 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-[#ff7900] sm:right-6 sm:p-3"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-5 pt-16 sm:px-8 sm:pb-7">
                    <div className="mx-auto flex max-w-[1500px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#ff8a2a]">
                          {activeSlide?.label}
                        </div>
                        <p className="mt-2 max-w-xl font-mono text-[10px] leading-relaxed text-[#b9b4aa] sm:text-xs">
                          {activeSlide?.alt}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          aria-live="polite"
                          className="font-mono text-[9px] tabular-nums tracking-[0.18em] text-[#c8c2b8]"
                        >
                          {pad(slideIndex + 1)}{" "}
                          <span className="text-[#5f5b54]">
                            / {pad(slideCount)}
                          </span>
                        </span>
                        {slideCount > 1 && !reducedMotion && (
                          <div className="relative h-px w-20 overflow-hidden bg-white/20 sm:w-28">
                            <div
                              key={`${project.id}-${slideIndex}`}
                              className="pp-slide-progress h-full w-full bg-[#ff7900]"
                              style={{
                                animationDuration: `${AUTOPLAY_MS}ms`,
                                animationPlayState: canAutoplay
                                  ? "running"
                                  : "paused",
                              }}
                              onAnimationEnd={() => goToSlide(1)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[62svh] items-center justify-center border-y border-white/10 px-6 py-20">
                  <div className="max-w-md text-center">
                    <AsciiTile
                      text={project.index}
                      seed={`${project.id}-gallery`}
                      hot
                      className="mx-auto h-32 w-32 opacity-80"
                    />
                    <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.24em] text-[#ff8a2a]">
                      Visuals in production
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[#a7a097]">
                      This case file is still being assembled. Imagery will be
                      published once the build is ready for review.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* ── Next case study ── */}
            {nextProject && (
              <button
                type="button"
                onClick={onNext}
                aria-label={`Open next case study: ${nextProject.title}`}
                className="pp-focus group block w-full border-t border-white/10 text-left"
              >
                <div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-8 px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
                  <div className="min-w-0">
                    <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#8d877e]">
                      Next case study
                    </div>
                    <div className="mt-4 max-w-4xl font-display text-[clamp(2.2rem,6vw,5.6rem)] font-black leading-[0.9] tracking-[-0.055em] text-white transition-colors duration-300 group-hover:text-[#ff7900]">
                      {nextProject.title}
                    </div>
                  </div>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-white/20 text-[#ff7900] transition-colors duration-300 group-hover:border-[#ff7900] group-hover:bg-[#ff7900] group-hover:text-black sm:h-20 sm:w-20">
                    <ArrowUpRight className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            )}

            <footer className="border-t border-white/10">
              <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-6 py-6 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8d877e] sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
                <button
                  type="button"
                  onClick={handleClose}
                  className="pp-focus inline-flex w-fit items-center gap-2 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-[#ff7900]" />
                  Return to index
                </button>
                <span>
                  OM / OYSM — Case file {pad(currentIndex + 1)} of{" "}
                  {pad(totalCount)}
                </span>
              </div>
            </footer>
          </main>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="noise-overlay pointer-events-none fixed inset-0 z-[55] opacity-70"
      />
    </div>
  );
};
