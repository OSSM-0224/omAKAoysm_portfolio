import React, { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Project, PROJECTS, ProjectCategory } from '../data/projects';
import { AsciiNumber } from '../components/common/AsciiNumber';
import { ExternalLink, Github, ArrowUpRight, Sparkles, Download, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface WorkSectionProps {
  onSelectProject: (project: Project) => void;
}

// 3D Tilt Card wrapper
const TiltProjectCard: React.FC<{
  project: Project;
  onSelect: () => void;
}> = ({ project, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setRotate({ x: -y * 10, y: x * 10 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      data-cursor="view"
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
      }}
      className="project-card-item group relative rounded-2xl bg-[#0b0b0e] border border-[#1d1d24] hover:border-[#ff7900]/60 p-6 sm:p-7 flex flex-col justify-between overflow-hidden transition-colors cursor-pointer shadow-xl hover:shadow-[0_0_35px_rgba(255,121,0,0.18)] will-change-transform"
    >
      {/* Subtle background glow on hover */}
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 bg-[#ff7900]/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Top Header: ASCII Index + Primary Category */}
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#1a1a22]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#ff7900] font-semibold">
              {project.category}
            </span>
            {project.playStoreUrl && (
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                PLAY STORE
              </span>
            )}
          </div>
          <div className="text-xs font-mono text-[#737069]">{project.role}</div>
        </div>

        <div className="shrink-0">
          <AsciiNumber
            value={project.index}
            size="sm"
            color="text-[#ff7900]"
            className="group-hover:text-glow-orange transition-all"
          />
        </div>
      </div>

      {/* Mockup Preview Area */}
      <div className="my-5 relative w-full h-40 sm:h-44 rounded-xl bg-[#060608] border border-[#181820] overflow-hidden flex flex-col p-4 justify-between group-hover:border-[#ff7900]/30 transition-colors">
        {/* Terminal Window Header */}
        <div className="flex items-center justify-between border-b border-[#14141a] pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff7900]/80 shadow-[0_0_6px_#ff7900]" />
            <span className="w-2 h-2 rounded-full bg-[#2a2a33]" />
            <span className="w-2 h-2 rounded-full bg-[#2a2a33]" />
          </div>
          <span className="text-[10px] font-mono text-[#5c5c66]">
            {project.id}.manifest
          </span>
        </div>

        {/* Abstract Architectural Diagram / Graphic */}
        <div className="my-auto space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8a8780]">
            <span className="text-white font-bold">{project.title}</span>
            <span className="text-[#ff7900]">{project.metrics[0] || 'PRODUCTION'}</span>
          </div>

          <div className="h-1.5 w-full bg-[#13131a] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#ff7900] to-[#ff9d33] w-4/5 rounded-full" />
          </div>

          <div className="text-[10px] font-mono text-[#737069] line-clamp-1">
            &gt; {project.subtitle}
          </div>
        </div>

        {/* Floating badge */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#737069] pt-2 border-t border-[#14141a]">
          <span>{project.duration}</span>
          <span className="text-[#ff7900] group-hover:underline flex items-center gap-1">
            <span>INSPECT SPEC</span>
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-white group-hover:text-[#ff7900] transition-colors">
            {project.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#a39f96] mt-1.5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Filter Category Badges & Tech Stack Chips */}
        <div className="space-y-2">
          {/* Category tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.filterCategories.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#14100b] text-[#ff9029] border border-[#ff7900]/30 font-semibold"
              >
                #{c}
              </span>
            ))}
          </div>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#111116] text-[#b0aca3] border border-[#1f1f28]"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#737069]">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-4 border-t border-[#1a1a22] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {project.playStoreUrl ? (
              <a
                href={project.playStoreUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#ff7900] hover:text-[#ff9029] transition-colors py-1"
              >
                <Download className="w-3 h-3" />
                <span>PLAY STORE</span>
              </a>
            ) : (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs font-mono text-white hover:text-[#ff7900] transition-colors py-1"
              >
                <span>LIVE</span>
                <ExternalLink className="w-3 h-3 text-[#ff7900]" />
              </a>
            )}

            <span className="text-[#333]">·</span>

            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-mono text-[#a39f96] hover:text-white transition-colors py-1"
            >
              <span>CODE</span>
              <Github className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="text-xs font-mono text-[#ff7900] hover:text-[#ff9029] font-semibold flex items-center gap-1"
          >
            <span>DETAILS</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const WorkSection: React.FC<WorkSectionProps> = ({ onSelectProject }) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  const gridRef = useRef<HTMLDivElement>(null);

  // Compute category counts
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      All: PROJECTS.length,
      MERN: 0,
      Mobile: 0,
      'UI/UX': 0,
      'Real-Time': 0,
    };

    PROJECTS.forEach((p) => {
      p.filterCategories.forEach((cat) => {
        if (map[cat] !== undefined) {
          map[cat]++;
        }
      });
    });

    return map;
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return PROJECTS;
    return PROJECTS.filter((p) => p.filterCategories.includes(selectedCategory));
  }, [selectedCategory]);

  // GSAP ScrollTrigger Integration for Card Fade-In & Upward Slide
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.project-card-item');
    if (cards.length === 0) return;

    // Use GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power3.out',
          stagger: {
            amount: 0.4,
            from: 'start',
          },
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, gridRef);

    return () => {
      ctx.revert();
    };
  }, [selectedCategory, filteredProjects.length]);

  const categoriesList: { id: 'All' | ProjectCategory; label: string; desc: string }[] = [
    { id: 'All', label: 'All Projects', desc: 'All Web & Mobile Works' },
    { id: 'MERN', label: 'MERN Stack', desc: 'React, Node, Express, MongoDB' },
    { id: 'Mobile', label: 'Mobile Apps', desc: 'React Native & Android' },
    { id: 'UI/UX', label: 'UI/UX & 3D', desc: 'Interactive Design & CMS' },
    { id: 'Real-Time', label: 'Real-Time', desc: 'WebSockets & Sockets' },
  ];

  return (
    <section
      id="work"
      className="relative w-full py-28 px-6 sm:px-8 md:px-12 bg-[#040405] border-t border-[#181820]"
    >
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#1a1a22]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff7900] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>04. SELECTED WORK &amp; PRODUCTION CASE STUDIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white">
              Web &amp; Mobile Deployments
            </h2>
            <p className="text-sm sm:text-base text-[#a39f96] max-w-xl">
              Filter through full-stack MERN platforms, mobile applications (React Native &amp; Android Java), real-time WebSocket systems, and high-fidelity UI/UX ecosystems.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#8a8780] lg:text-right">
            <Layers className="w-4 h-4 text-[#ff7900]" />
            <span>
              DISPLAYING <strong className="text-white">{filteredProjects.length}</strong> OF <strong className="text-white">{PROJECTS.length}</strong> PROJECTS
            </span>
          </div>
        </div>

        {/* Category-Based Filter Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0c0c10] border border-[#1e1e26] overflow-x-auto max-w-full">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = counts[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#ff7900] text-black font-bold shadow-[0_0_20px_rgba(255,121,0,0.35)]'
                      : 'text-[#8a8780] hover:text-white hover:bg-[#16161d]'
                  }`}
                  title={cat.desc}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected
                        ? 'bg-black/30 text-black font-bold'
                        : 'bg-[#181820] text-[#ff7900]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-[#737069] hidden md:block">
            FILTER: <span className="text-[#ff7900] uppercase font-bold">{selectedCategory}</span>
          </div>
        </div>

        {/* Projects Grid with GSAP ref */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0c0c10] border border-[#1e1e26] space-y-3 font-mono">
            <div className="text-[#ff7900] text-sm">&lt;NO PROJECTS FOUND IN THIS CATEGORY&gt;</div>
            <p className="text-xs text-[#737069]">Select another category filter to explore works.</p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {filteredProjects.map((project) => (
              <TiltProjectCard
                key={project.id}
                project={project}
                onSelect={() => onSelectProject(project)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
