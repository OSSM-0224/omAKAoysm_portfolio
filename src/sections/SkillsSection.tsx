import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GROUPS,
  PROJECTS,
  SKILLS,
  TOOLBOX,
  levelOf,
} from "../data/stackMatrix";

/**
 * Skills as proof of work: every skill is a row, every build is a column, and a
 * cell is filled where the two meet. Hover (or tap) a skill to see where it
 * shipped, a build to see what it ran on.
 */

type Focus = { type: "skill" | "project"; id: string } | null;

const GLYPH = ["·", "+", "@"] as const;
const SCRAMBLE = "01#%*+=:-@";
const N = PROJECTS.length;

const CSS = `
@keyframes sk-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.sk-in { animation: sk-in .22s ease-out both; }
@keyframes sk-caret { 50% { opacity: 0; } }
.sk-caret { animation: sk-caret 1s steps(1) infinite; }
@media (prefers-reduced-motion: reduce) { .sk-in, .sk-caret { animation: none; } }
`;

/** Plays once when the matrix scrolls into view: cells scramble, then settle row by row. */
function useDecode() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [t, setT] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(1);
      return;
    }
    let raf = 0;
    let start = 0;
    const run = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / 1500);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(run);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          raf = requestAnimationFrame(run);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, t };
}

/** Deterministic pseudo-random in [0,1) so the animation needs no Math.random in render. */
const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function glyphAt(
  level: 0 | 1 | 2,
  row: number,
  col: number,
  rows: number,
  t: number,
): string {
  if (t >= 1) return GLYPH[level];
  if (t === 0) return GLYPH[0];
  const delay = (row / rows) * 0.5 + hash(row, col) * 0.3;
  if (t >= delay + 0.2) return GLYPH[level];
  return SCRAMBLE[(Math.floor(t * 45) + row * 7 + col * 3) % SCRAMBLE.length];
}

type Tone = "hot" | "mid" | "off" | "glow2" | "glow1" | "band" | "dim";

const TONE_CLASS: Record<Tone, string> = {
  hot: "text-[#ff7900]",
  mid: "text-[#ff7900]/55",
  off: "text-[#2a2a31]",
  glow2: "text-[#ffe2b8] [text-shadow:0_0_10px_#ff7900,0_0_22px_#ff7900]",
  glow1: "text-[#ffb038] [text-shadow:0_0_8px_#ff7900]",
  band: "text-[#4a3320]",
  dim: "text-[#ff7900]/20",
};

export const SkillsSection: React.FC = () => {
  const { ref, t } = useDecode();
  const [hover, setHover] = useState<Focus>(null);
  const [pinned, setPinned] = useState<Focus>(null);
  const active = hover ?? pinned;

  const same = (a: Focus, b: Focus) =>
    !!a && !!b && a.type === b.type && a.id === b.id;
  const toggle = (f: NonNullable<Focus>) =>
    setPinned((p) => (same(p, f) ? null : f));

  const counts = useMemo(
    () =>
      Object.fromEntries(
        SKILLS.map((s) => [
          s.id,
          PROJECTS.filter((p) => levelOf(s.id, p.id) > 0).length,
        ]),
      ) as Record<string, number>,
    [],
  );

  const skillIndex = (id: string) => SKILLS.findIndex((s) => s.id === id);

  const toneOf = (
    skillId: string,
    projectId: string,
  ): { tone: Tone; band: boolean } => {
    const l = levelOf(skillId, projectId);
    if (!active)
      return { tone: l === 2 ? "hot" : l === 1 ? "mid" : "off", band: false };
    const onRow = active.type === "skill" && active.id === skillId;
    const onCol = active.type === "project" && active.id === projectId;
    if (onRow || onCol)
      return {
        tone: l === 2 ? "glow2" : l === 1 ? "glow1" : "band",
        band: true,
      };
    return { tone: l > 0 ? "dim" : "off", band: false };
  };

  const projectLit = (pid: string) =>
    !!active &&
    ((active.type === "project" && active.id === pid) ||
      (active.type === "skill" && levelOf(active.id, pid) > 0));
  const skillLit = (sid: string) =>
    !!active &&
    ((active.type === "skill" && active.id === sid) ||
      (active.type === "project" && levelOf(sid, active.id) > 0));

  // Terminal readout
  const activeSkill =
    active?.type === "skill"
      ? SKILLS.find((s) => s.id === active.id)
      : undefined;
  const activeProject =
    active?.type === "project"
      ? PROJECTS.find((p) => p.id === active.id)
      : undefined;

  const gridCols = `9.75rem repeat(${N}, 2.1rem) 5rem`;

  return (
    <section
      id="skills"
      className="relative w-full border-t border-[#1c1c1c] bg-[#060608] px-6 py-28 sm:px-8 md:px-12"
    >
      <style>{CSS}</style>
      <div className="mx-auto w-full max-w-7xl space-y-14">
        <div className="max-w-2xl space-y-4">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            The stack, with receipts.
          </h2>
          <p className="font-sans text-sm leading-relaxed text-[#9e9a91] sm:text-base">
            Every skill here is tied to something I shipped. Hover a skill to
            see where it ran, or a build to see what it ran on. Tap to pin.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* ── Matrix ── */}
          <div className="lg:col-span-8">
            <div
              ref={ref}
              className="overflow-x-auto pb-2"
              onMouseLeave={() => setHover(null)}
            >
              <div
                role="group"
                aria-label="Skills by project"
                className="grid min-w-max items-center font-mono"
                style={{ gridTemplateColumns: gridCols }}
              >
                {/* header row: vertical project names */}
                <div className="sticky left-0 z-10 h-full bg-[#060608]" />
                {PROJECTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={same(pinned, { type: "project", id: p.id })}
                    aria-label={p.name}
                    onMouseEnter={() => setHover({ type: "project", id: p.id })}
                    onFocus={() => setHover({ type: "project", id: p.id })}
                    onBlur={() => setHover(null)}
                    onClick={() => toggle({ type: "project", id: p.id })}
                    className={`flex h-28 items-end justify-center pb-2 text-[11px] outline-none transition-colors focus-visible:text-[#ffb038] ${
                      projectLit(p.id)
                        ? "text-[#ffb038]"
                        : p.kind === "mobile"
                          ? "text-[#c9c4b8]"
                          : "text-[#7a766e]"
                    }`}
                  >
                    <span
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                      className="whitespace-nowrap"
                    >
                      {p.short}
                    </span>
                  </button>
                ))}
                <div className="pb-2 text-right text-[10px] text-[#57544e]">
                  builds
                </div>

                {GROUPS.map((g) => (
                  <React.Fragment key={g}>
                    <div
                      className="mt-3 border-t border-[#1c1c24] pt-1.5 text-[10px] text-[#57544e]"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <span className="sticky left-0 inline-block bg-[#060608] pr-3">
                        {g}
                      </span>
                    </div>
                    {SKILLS.filter((s) => s.group === g).map((s) => {
                      const row = skillIndex(s.id);
                      const c = counts[s.id];
                      const filled =
                        c === 0 ? 0 : Math.max(1, Math.round((c / N) * 6));
                      return (
                        <React.Fragment key={s.id}>
                          <button
                            type="button"
                            aria-pressed={same(pinned, {
                              type: "skill",
                              id: s.id,
                            })}
                            onMouseEnter={() =>
                              setHover({ type: "skill", id: s.id })
                            }
                            onFocus={() =>
                              setHover({ type: "skill", id: s.id })
                            }
                            onBlur={() => setHover(null)}
                            onClick={() => toggle({ type: "skill", id: s.id })}
                            className={`sticky left-0 z-10 h-7 truncate bg-[#060608] pr-2 text-left text-xs outline-none transition-colors focus-visible:text-[#ffb038] ${
                              skillLit(s.id)
                                ? "text-[#ffb038]"
                                : "text-[#b8b4ab]"
                            }`}
                          >
                            {s.name}
                          </button>
                          {PROJECTS.map((p, col) => {
                            const { tone, band } = toneOf(s.id, p.id);
                            return (
                              <span
                                key={p.id}
                                aria-hidden="true"
                                className={`flex h-7 select-none items-center justify-center text-[15px] font-bold transition-colors duration-150 ${TONE_CLASS[tone]} ${
                                  band ? "bg-[#ff7900]/[0.07]" : ""
                                }`}
                              >
                                {glyphAt(
                                  levelOf(s.id, p.id),
                                  row,
                                  col,
                                  SKILLS.length,
                                  t,
                                )}
                              </span>
                            );
                          })}
                          <span
                            aria-hidden="true"
                            className={`pl-2 text-right text-[11px] transition-colors ${
                              skillLit(s.id)
                                ? "text-[#ffb038]"
                                : "text-[#57544e]"
                            }`}
                          >
                            <span className="text-[#ff7900]/70">
                              {"@".repeat(filled)}
                            </span>
                            <span className="text-[#2a2a31]">
                              {"·".repeat(6 - filled)}
                            </span>{" "}
                            {c}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <p className="mt-2 font-mono text-[11px] text-[#57544e] lg:hidden">
              Swipe the grid sideways for every build.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-[#6b6861]">
              <span>
                <b className="text-[#ff7900]">@</b> core to the build
              </span>
              <span>
                <b className="text-[#ff7900]/60">+</b> used in it
              </span>
              <span>
                <b className="text-[#2a2a31]">·</b> not used
              </span>
            </div>

            <p className="mt-6 max-w-2xl font-sans text-sm leading-relaxed text-[#8a8780]">
              <span className="text-[#b8b4ab]">
                Also in the toolbox, not on this map yet:
              </span>{" "}
              {TOOLBOX.join(", ")}.
            </p>
          </div>

          {/* ── Terminal readout ── */}
          <aside
            aria-live="polite"
            className="rounded-xl border border-[#ff7900]/25 bg-[#09090c] font-mono text-xs leading-relaxed text-[#b8b4ab] shadow-[0_0_40px_rgba(255,121,0,0.08)] lg:sticky lg:top-28 lg:col-span-4"
          >
            <div className="flex items-center gap-2 border-b border-[#ff7900]/15 px-4 py-2.5 text-[11px] text-[#737069]">
              <span className="h-2 w-2 rounded-full bg-[#ff7900] shadow-[0_0_8px_#ff7900]" />
              probe
            </div>
            <div
              key={`${active?.type}-${active?.id}`}
              className="sk-in min-h-[17rem] space-y-3 px-4 py-4"
            >
              {!active && (
                <>
                  <p>
                    <span className="text-[#ff7900]">$</span> probe --help
                  </p>
                  <p className="text-[#8a8780]">
                    Hover a skill to see where it shipped.
                    <br />
                    Hover a build to see what it ran on.
                    <br />
                    Click to pin.
                  </p>
                  <p className="pt-2 text-[#57544e]">
                    {N} builds, {SKILLS.length} skills mapped.
                    <span className="sk-caret ml-1 text-[#ff7900]">_</span>
                  </p>
                </>
              )}

              {activeSkill && (
                <>
                  <p>
                    <span className="text-[#ff7900]">$</span> where --uses{" "}
                    <span className="text-white">"{activeSkill.name}"</span>
                  </p>
                  <p className="text-[#ffb038]">
                    {counts[activeSkill.id]} of {N} builds
                  </p>
                  <ul className="space-y-1">
                    {PROJECTS.filter(
                      (p) => levelOf(activeSkill.id, p.id) > 0,
                    ).map((p) => (
                      <li key={p.id} className="flex gap-2">
                        <span className="w-3 text-[#ff7900]">
                          {GLYPH[levelOf(activeSkill.id, p.id)]}
                        </span>
                        <span className="text-white">{p.name}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {activeProject && (
                <>
                  <p>
                    <span className="text-[#ff7900]">$</span> stack --of{" "}
                    <span className="text-white">"{activeProject.name}"</span>
                  </p>
                  <p className="text-[#8a8780]">{activeProject.blurb}</p>
                  <ul className="space-y-1">
                    {SKILLS.filter((s) => levelOf(s.id, activeProject.id) > 0)
                      .sort(
                        (a, b) =>
                          levelOf(b.id, activeProject.id) -
                          levelOf(a.id, activeProject.id),
                      )
                      .map((s) => (
                        <li key={s.id} className="flex gap-2">
                          <span className="w-3 text-[#ff7900]">
                            {GLYPH[levelOf(s.id, activeProject.id)]}
                          </span>
                          <span className="text-white">{s.name}</span>
                        </li>
                      ))}
                  </ul>
                  {activeProject.href && (
                    <a
                      href={activeProject.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block pt-1 text-[#ff7900] underline-offset-4 hover:underline"
                    >
                      open it
                    </a>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>

        {/* Screen readers get a plain list instead of 270 glyph cells. */}
        <ul className="sr-only">
          {SKILLS.map((s) => (
            <li key={s.id}>
              {s.name}:{" "}
              {PROJECTS.filter((p) => levelOf(s.id, p.id) > 0)
                .map((p) => p.name)
                .join(", ") || "none yet"}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
