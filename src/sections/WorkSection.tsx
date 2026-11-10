import React, { useMemo, useState } from "react";
import { Project, PROJECTS, ProjectCategory } from "../data/projects";
import { AsciiTile } from "../components/common/AsciiTile";
import { ArrowUpRight, Sparkles } from "lucide-react";

/**
 * Selected work as a quiet editorial index: one large frame per project and
 * nothing under it but the name. Opening a project leaves this page entirely
 * for the full-screen case study.
 */

const pad = (n: string | number) => String(n).padStart(2, "0");

interface WorkSectionProps {
  onSelectProject: (project: Project) => void;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  onSelectProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | ProjectCategory
  >("All");

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

  return (
    <section
      id="work"
      className="relative w-full overflow-hidden border-t border-[#181820] bg-[#040405] px-6 py-28 sm:px-8 md:px-12"
    >
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
            <h2 className="max-w-4xl font-display text-[clamp(2.6rem,7vw,5.8rem)] font-black uppercase leading-[0.86] tracking-[-0.055em] text-white">
              Web <span className="text-[#ff5500]">&amp;</span> Mobile
              <br />
              <span className="text-[#6e675f]">Deployments</span>
            </h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-[#a7a097] sm:text-base lg:pb-2">
              Production platforms, mobile products and client builds. Open any
              frame to read the full case study.
            </p>
          </div>
        </div>

        {/* Filter rail */}
        <div className="mt-5 flex flex-col gap-3 border-b border-[#1a1a22] pb-3 md:flex-row md:items-center md:justify-between">
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
                  className={`relative shrink-0 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300 ${
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
          <div className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-[#7f7a72]">
            <span className="text-white">{pad(filteredProjects.length)}</span> /{" "}
            {pad(PROJECTS.length)} project files
          </div>
        </div>

        {/* Project index */}
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
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 pt-12 md:grid-cols-2 md:gap-y-16">
            {filteredProjects.map((project, i) => {
              const image = project.image || project.gallery?.[0]?.src;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectProject(project)}
                  data-cursor="view"
                  aria-label={`Open ${project.title} case study`}
                  className={`group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[#ff7900] focus-visible:ring-offset-4 focus-visible:ring-offset-[#040405] ${
                    i % 2 === 1 ? "md:mt-16" : ""
                  }`}
                >
                  <div className="relative overflow-hidden border border-[#202028] bg-[#070709]">
                    <div className="aspect-[16/10] w-full overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={`${project.title} preview`}
                          loading={i < 2 ? "eager" : "lazy"}
                          decoding="async"
                          draggable={false}
                          className="h-full w-full object-cover object-top transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035] motion-reduce:transition-none"
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
                            className="relative h-32 w-32 sm:h-40 sm:w-40"
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
                    <div className="flex min-w-0 items-baseline gap-4">
                      <span className="shrink-0 font-mono text-[10px] font-semibold tracking-[0.16em] text-[#ff7900]">
                        {project.index}
                      </span>
                      <h3 className="font-display text-[clamp(1.15rem,2.1vw,1.8rem)] font-bold leading-[1.06] tracking-[-0.025em] text-white transition-colors duration-300 group-hover:text-[#ffb06b]">
                        {project.title}
                      </h3>
                    </div>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 translate-y-0.5 text-[#7d7970] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#ff7900] motion-reduce:transition-none"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
