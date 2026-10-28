import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { X, ExternalLink, Github, CheckCircle2, Cpu, Calendar, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '../../data/projects';
import { AsciiNumber } from './AsciiNumber';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onNext,
  onPrev,
  currentIndex = 0,
  totalCount = 14,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const contentBodyRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);
  const prevProjectIdRef = useRef<string | null>(null);

  // Smooth 3D exit animation
  const handleAnimatedClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !overlayRef.current || !modalCardRef.current) {
      isClosingRef.current = false;
      onClose();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        isClosingRef.current = false;
        onClose();
      },
    });

    tl.to(modalCardRef.current, {
      opacity: 0,
      scale: 0.92,
      rotateX: -8,
      y: 25,
      duration: 0.25,
      ease: 'power2.in',
    }).to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      },
      '-=0.12'
    );
  }, [onClose]);

  // GSAP 3D entry animation when opening
  useEffect(() => {
    if (!project) return;
    isClosingRef.current = false;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initial open animation
    if (!prevProjectIdRef.current && !prefersReducedMotion && overlayRef.current && modalCardRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      );

      gsap.fromTo(
        modalCardRef.current,
        {
          opacity: 0,
          scale: 0.86,
          rotateX: 14,
          rotateY: -4,
          y: 50,
          transformPerspective: 1200,
          transformOrigin: '50% 50%',
        },
        {
          opacity: 1,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          y: 0,
          duration: 0.55,
          ease: 'back.out(1.15)',
        }
      );
    } else if (prevProjectIdRef.current && prevProjectIdRef.current !== project.id && contentBodyRef.current) {
      // Subtle slide transition when cycling between projects
      gsap.fromTo(
        contentBodyRef.current,
        { opacity: 0.4, y: 15 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }

    prevProjectIdRef.current = project.id;
  }, [project]);

  // Global Keyboard Navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleAnimatedClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (onNext) onNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (onPrev) onPrev();
      }
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
      if (!project) {
        prevProjectIdRef.current = null;
      }
    };
  }, [project, handleAnimatedClose, onNext, onPrev]);

  if (!project) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto bg-black/85 backdrop-blur-md"
      onClick={handleAnimatedClose}
    >
      <div
        ref={modalCardRef}
        className="relative w-full max-w-4xl bg-[#0d0d0d] border border-[#262626] rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden my-auto will-change-transform"
        onClick={(e) => e.stopPropagation()}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Top bar with terminal tabs & Keyboard cycling controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f] bg-[#080808]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#262626]" />
              <div className="w-3 h-3 rounded-full bg-[#262626]" />
              <div className="w-3 h-3 rounded-full bg-[#ff7900]/80 shadow-[0_0_6px_#ff7900]" />
            </div>
            <span className="text-xs font-mono text-[#8a8780] pl-2 border-l border-[#262626] hidden sm:inline">
              project://{project.id}.manifest
            </span>
          </div>

          {/* Center Navigation controls */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#8a8780] bg-[#121214] px-3 py-1.5 rounded-lg border border-[#22222a]">
            <button
              onClick={onPrev}
              title="Previous Project (Left Arrow ←)"
              className="p-1 rounded hover:text-white hover:bg-[#1f1f26] transition-colors"
              aria-label="Previous Project"
            >
              <ChevronLeft className="w-4 h-4 text-[#ff7900]" />
            </button>

            <span className="text-[11px] font-semibold text-white px-1">
              {String(currentIndex + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
            </span>

            <button
              onClick={onNext}
              title="Next Project (Right Arrow →)"
              className="p-1 rounded hover:text-white hover:bg-[#1f1f26] transition-colors"
              aria-label="Next Project"
            >
              <ChevronRight className="w-4 h-4 text-[#ff7900]" />
            </button>
          </div>

          <button
            onClick={handleAnimatedClose}
            className="p-1.5 rounded-lg text-[#8a8780] hover:text-white hover:bg-[#1a1a1a] transition-colors flex items-center gap-1.5 text-xs font-mono"
            aria-label="Close project modal (ESC)"
            title="Press ESC to close"
          >
            <span className="hidden sm:inline text-[10px] text-[#666]">[ESC]</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content body */}
        <div
          ref={contentBodyRef}
          className="p-6 sm:p-8 md:p-10 max-h-[80vh] overflow-y-auto space-y-8"
        >
          {/* Header section with ASCII index */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#1c1c1c]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#ff7900] font-semibold">
                  {project.category}
                </span>
                {project.playStoreUrl && (
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    GOOGLE PLAY
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white">
                {project.title}
              </h2>
              <p className="text-base text-[#a39f96] max-w-xl font-sans">
                {project.subtitle}
              </p>
            </div>

            <div className="shrink-0 flex items-center md:items-end flex-col">
              <span className="text-[10px] font-mono text-[#737069] tracking-widest uppercase mb-1">
                INDEX SPEC
              </span>
              <AsciiNumber value={project.index} size="md" color="text-[#ff7900]" />
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#121212] border border-[#1f1f1f]">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#737069]">
                <UserCheck className="w-3.5 h-3.5 text-[#ff7900]" />
                <span>ROLE</span>
              </div>
              <div className="text-sm font-medium text-white">{project.role}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#737069]">
                <Calendar className="w-3.5 h-3.5 text-[#ff7900]" />
                <span>TIMELINE</span>
              </div>
              <div className="text-sm font-medium text-white">{project.duration}</div>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#737069]">
                <Cpu className="w-3.5 h-3.5 text-[#ff7900]" />
                <span>STACK CORE</span>
              </div>
              <div className="text-sm font-medium text-[#ff7900] truncate">
                {project.tags.slice(0, 3).join(' / ')}
              </div>
            </div>
          </div>

          {/* Deep Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#737069]">
              SYSTEM ARCHITECTURE &amp; GOALS
            </h3>
            <p className="text-sm md:text-base text-[#cfcbc4] leading-relaxed">
              {project.longDescription}
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#737069]">
              CORE FUNCTIONAL MODULES
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {project.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-[#141414] border border-[#212121]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#ff7900] shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm text-[#b8b4ab] leading-snug">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics strip */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#737069]">
              QUANTITATIVE BENCHMARKS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {project.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#121212] border border-[#212121] text-center"
                >
                  <div className="text-sm font-mono font-bold text-white">{metric}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Chips */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#737069]">
              TECHNOLOGIES DEPLOYED
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded bg-[#171717] text-[#d6d2c9] border border-[#292929]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Actions & Global Navigation Footnote */}
          <div className="pt-6 border-t border-[#1c1c1c] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {project.playStoreUrl ? (
                <a
                  href={project.playStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold text-black bg-[#ff7900] hover:bg-[#ff9029] rounded-md transition-all shadow-[0_0_20px_rgba(255,121,0,0.35)]"
                >
                  <span>VIEW ON GOOGLE PLAY</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-semibold text-black bg-[#ff7900] hover:bg-[#ff9029] rounded-md transition-all shadow-[0_0_20px_rgba(255,121,0,0.35)]"
                >
                  <span>OPEN LIVE DEPLOYMENT</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-medium text-white bg-[#171717] hover:bg-[#222] border border-[#2e2e2e] rounded-md transition-colors"
                >
                  <Github className="w-4 h-4 text-[#ff7900]" />
                  <span>VIEW REPOSITORY</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-4 font-mono text-xs text-[#737069]">
              <span className="hidden sm:inline">[← / → KEYS TO CYCLE]</span>
              <button
                onClick={handleAnimatedClose}
                className="hover:text-white transition-colors"
              >
                [ESC TO CLOSE]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
