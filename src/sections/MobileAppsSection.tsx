import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MOBILE_APPS } from '../data/screens';
import { Phone3DCanvas } from '../components/three/Phone3DCanvas';
import {
  ArrowUpRight,
  Download,
  Github,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const indexLabel = (index: number) => String(index + 1).padStart(2, '0');

const CSS = `
.mobile-display {
  font-family: "Anton", "Arial Narrow", Impact, sans-serif;
  font-weight: 400;
  letter-spacing: -0.015em;
}

.mobile-apps-watermark {
  font-family: "Anton", "Arial Narrow", Impact, sans-serif;
  font-size: clamp(11rem, 34vw, 32rem);
  line-height: 0.68;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 85, 0, 0.12);
}

.mobile-outline {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255, 85, 0, 0.72);
  text-shadow: 0 0 46px rgba(255, 85, 0, 0.12);
}

.mobile-stage-grid {
  background-image:
    linear-gradient(rgba(255, 85, 0, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 85, 0, 0.09) 1px, transparent 1px);
  background-size: 42px 42px;
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000000 0%, transparent 72%);
  mask-image: radial-gradient(ellipse at 50% 50%, #000000 0%, transparent 72%);
}

@keyframes mobile-glow {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.92); }
  50% { opacity: 0.82; transform: translate(-50%, -50%) scale(1.05); }
}

.mobile-stage-glow {
  animation: mobile-glow 9s ease-in-out infinite;
}

@keyframes mobile-orbit {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.mobile-orbit {
  animation: mobile-orbit 52s linear infinite;
}

@keyframes mobile-scan {
  0% { top: 7%; opacity: 0; }
  10% { opacity: 0.55; }
  88% { opacity: 0.55; }
  100% { top: 94%; opacity: 0; }
}

.mobile-scanline {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  z-index: 15;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255, 85, 0, 0.5), transparent);
  box-shadow: 0 0 18px rgba(255, 85, 0, 0.35);
  animation: mobile-scan 10s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .mobile-stage-glow,
  .mobile-orbit,
  .mobile-scanline {
    animation: none;
  }

  .mobile-scanline {
    display: none;
  }
}
`;

export const MobileAppsSection: React.FC = () => {
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeApp = MOBILE_APPS[activeAppIndex];
  const activeIndex = indexLabel(activeAppIndex);
  const totalCount = indexLabel(MOBILE_APPS.length);

  const selectTab = (index: number, moveFocus = false) => {
    setActiveAppIndex(index);
    if (moveFocus) {
      tabRefs.current[index]?.focus();
    }
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectTab((index + 1) % MOBILE_APPS.length, true);
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectTab(
        (index - 1 + MOBILE_APPS.length) % MOBILE_APPS.length,
        true,
      );
    }
    if (event.key === 'Home') {
      event.preventDefault();
      selectTab(0, true);
    }
    if (event.key === 'End') {
      event.preventDefault();
      selectTab(MOBILE_APPS.length - 1, true);
    }
  };

  return (
    <section
      id="mobile-apps"
      aria-labelledby="mobile-apps-title"
      className="relative w-full overflow-hidden border-t border-[#1a1510] bg-[#030303] px-6 py-24 sm:px-8 sm:py-32 md:px-12"
    >
      <style>{CSS}</style>

      {/* Section atmosphere: blueprint grid, oversized archive number, warm bloom. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="mobile-stage-grid absolute inset-0 opacity-30" />
        <div className="mobile-apps-watermark absolute -left-[0.06em] top-2 select-none">
          03
        </div>
        <div className="absolute left-1/2 top-[38%] h-[65vh] w-[82vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.16),transparent_66%)] blur-[72px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff5500]/45 to-transparent" />
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 font-mono text-[8px] uppercase tracking-[0.3em] text-[#5f574f] [writing-mode:vertical-rl] lg:block">
          Mobile objects / native + cross-platform
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        {/* Masthead */}
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#ff7a2e]">
              <span className="h-px w-8 bg-[#ff5500]" />
              <span>03. Mobile Applications</span>
              <span className="hidden text-[#5f574f] sm:inline">
                / 3D Phone Showcase
              </span>
            </div>

            <h2
              id="mobile-apps-title"
              className="mt-6 font-display text-[clamp(1.9rem,6.4vw,6.4rem)] font-black uppercase leading-[0.86] tracking-[-0.055em] text-white"
            >
              Native Android
              <br />
              <span className="text-[#ff5500]">&amp;</span> React Native
              <br />
              <span className="mobile-outline">Production</span>
            </h2>

            <p className="mt-6 max-w-2xl text-pretty text-sm leading-relaxed text-[#a7a097] sm:text-base">
              From enterprise cafeteria ticketing on Google Play to encrypted
              telehealth video suites and native Android safety daemons.
            </p>
          </div>

          <div className="flex items-end justify-between gap-6 lg:col-span-3 lg:flex-col lg:items-end lg:text-right">
            <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#6f675e]">
              Archive // Mobile
            </div>
            <div className="mobile-display text-[clamp(4.6rem,9vw,9rem)] leading-[0.72] text-[#ff5500]">
              03
            </div>
            <div className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-[#8d857c]">
              <span className="text-white">{totalCount}</span> applications
              <br />
              01 play store release
            </div>
          </div>
        </div>

        {/* Application index */}
        <div
          role="tablist"
          aria-label="Mobile application showcase"
          className="mt-3 grid grid-cols-1 border-b border-white/10 sm:grid-cols-3"
        >
          {MOBILE_APPS.map((app, index) => {
            const selected = index === activeAppIndex;
            return (
              <button
                key={app.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`mobile-tab-${app.id}`}
                aria-selected={selected}
                aria-controls="mobile-app-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`group relative flex items-start gap-4 px-1 py-5 text-left outline-none transition-colors duration-300 focus-visible:bg-white/[0.03] sm:px-5 ${
                  index > 0
                    ? 'border-t border-white/10 sm:border-l sm:border-t-0'
                    : ''
                } ${selected ? 'bg-[#ff5500]/[0.06]' : 'hover:bg-white/[0.02]'}`}
              >
                <span
                  className={`mobile-display mt-0.5 text-2xl leading-none transition-colors sm:text-3xl ${
                    selected
                      ? 'text-[#ff5500]'
                      : 'text-[#423b35] group-hover:text-[#8f7967]'
                  }`}
                >
                  {indexLabel(index)}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate font-display text-sm font-bold tracking-tight transition-colors lg:text-base ${
                      selected
                        ? 'text-white'
                        : 'text-[#a89f95] group-hover:text-white'
                    }`}
                  >
                    {app.shortName}
                  </span>
                  <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.18em] text-[#6f675e]">
                    {app.platform}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-px origin-left bg-[#ff5500] transition-transform duration-500 ${
                    selected
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-50'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Device stage + editorial file */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="self-start lg:sticky lg:top-24 lg:col-span-5">
            <div
              role="group"
              aria-label={`Interactive 3D preview of ${activeApp.name}. Drag to rotate the phone.`}
              className="relative isolate overflow-hidden border-y border-white/10 bg-[#050403]"
            >
              <div
                aria-hidden="true"
                className="mobile-stage-grid absolute inset-0 opacity-50"
              />
              <div
                aria-hidden="true"
                className="mobile-stage-glow absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,85,0,0.2),transparent_62%)] blur-3xl"
              />
              <div
                aria-hidden="true"
                className="mobile-orbit absolute left-1/2 top-1/2 h-[min(78vw,560px)] w-[min(78vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#ff5500]/20 sm:h-[440px] sm:w-[440px]"
              />
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[min(58vw,410px)] w-[min(58vw,410px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ff5500]/10"
              />
              <div
                aria-hidden="true"
                className="mobile-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[clamp(14rem,30vw,25rem)] leading-[0.7] text-[#ff5500]/[0.04]"
              >
                {activeIndex}
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 font-mono text-[8px] uppercase tracking-[0.22em] text-[#7f7468]">
                <span className="flex items-center gap-2 text-[#ff7a2e]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff5500]" />
                  Live object
                </span>
                <span>Drag to rotate 360°</span>
              </div>

              <div className="relative z-10 flex items-center justify-center pb-10 pt-11">
                <Phone3DCanvas
                  screenshotUrl={activeApp.screenshots[0]}
                  accentColor={activeApp.accentColor}
                  heightClassName="h-[clamp(390px,52vw,560px)]"
                  className="mobile-preview-canvas"
                />
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 font-mono text-[8px] uppercase tracking-[0.2em] text-[#7f7468]">
                <span>{activeApp.platform}</span>
                <span className="text-[#ff7a2e]">WebGL / 60 FPS</span>
              </div>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-11 z-20 h-4 w-4 border-l border-t border-[#ff5500]/50"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-11 z-20 h-4 w-4 border-r border-t border-[#ff5500]/50"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-12 left-3 z-20 h-4 w-4 border-b border-l border-[#ff5500]/50"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-12 right-3 z-20 h-4 w-4 border-b border-r border-[#ff5500]/50"
              />

              <div aria-hidden="true" className="mobile-scanline" />
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.2em] text-[#6f675e]">
              <span>
                Object {activeIndex} / {totalCount}
              </span>
              <span>Texture: production build</span>
            </div>

            <div className="mt-6 hidden grid-cols-2 gap-x-6 gap-y-3 border-t border-white/10 pt-4 font-mono text-[8px] uppercase tracking-[0.18em] lg:grid">
              <div>
                <span className="text-[#6f675e]">Input</span>
                <span className="ml-2 text-[#c7beb3]">Pointer / touch</span>
              </div>
              <div>
                <span className="text-[#6f675e]">Render</span>
                <span className="ml-2 text-[#c7beb3]">WebGL 2</span>
              </div>
              <div>
                <span className="text-[#6f675e]">Loop</span>
                <span className="ml-2 text-[#c7beb3]">60 FPS</span>
              </div>
              <div>
                <span className="text-[#6f675e]">Texture</span>
                <span className="ml-2 text-[#c7beb3]">Live build</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              key={activeApp.id}
              role="tabpanel"
              id="mobile-app-panel"
              aria-labelledby={`mobile-tab-${activeApp.id}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 font-mono text-[9px] uppercase tracking-[0.22em]">
                <span className="text-[#ff7a2e]">
                  Application file / {activeIndex}
                </span>
                <span className="text-[#6f675e]">Deployment: production</span>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 border border-[#ff5500]/35 bg-[#ff5500]/[0.07] px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#ff8a46]">
                <Sparkles className="h-3 w-3" />
                {activeApp.badgeText}
              </div>

              <h3 className="mt-5 max-w-2xl font-display text-[clamp(1.65rem,3.2vw,3.2rem)] font-black leading-[1.02] tracking-[-0.04em] text-white">
                {activeApp.name}
              </h3>

              <p className="mt-3 max-w-xl font-display text-base font-medium leading-relaxed text-[#d4ccc1] sm:text-lg">
                {activeApp.tagline}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#948c82]">
                {activeApp.description}
              </p>

              <div className="mt-8 grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="py-3 sm:pr-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#6f675e]">
                    Distribution
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] leading-relaxed text-[#d4ccc1]">
                    {activeApp.downloads ?? 'Production build'}
                  </div>
                </div>
                <div className="py-3 sm:px-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#6f675e]">
                    Platform
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] leading-relaxed text-[#d4ccc1]">
                    {activeApp.platform}
                  </div>
                </div>
                <div className="py-3 sm:pl-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#6f675e]">
                    Modules
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] leading-relaxed text-[#d4ccc1]">
                    {activeApp.tech.length} tracked in stack
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.22em]">
                  <span className="text-[#cfc6bb]">
                    Engineering specifications
                  </span>
                  <span className="text-[#6f675e]">
                    {String(activeApp.highlights.length).padStart(2, '0')}{' '}
                    entries
                  </span>
                </div>
                <ul className="mt-3 border-t border-white/10">
                  {activeApp.highlights.map((highlight, index) => (
                    <li
                      key={highlight}
                      className="group flex items-start gap-4 border-b border-white/[0.07] py-3 transition-colors hover:bg-white/[0.02]"
                    >
                      <span className="mt-0.5 shrink-0 font-mono text-[9px] text-[#ff5500]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[13px] leading-relaxed text-[#c7beb3] transition-colors group-hover:text-white">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="mr-1 font-mono text-[8px] uppercase tracking-[0.22em] text-[#6f675e]">
                  Stack
                </span>
                {activeApp.tech.map((tech) => (
                  <span
                    key={tech}
                    className="border border-white/10 bg-white/[0.025] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-[#a9a095]"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-5">
                  {activeApp.playStoreUrl && (
                    <a
                      href={activeApp.playStoreUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2.5 bg-[#ff5500] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-[#ff7a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb038] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]"
                    >
                      <Download className="h-4 w-4" />
                      View on Google Play
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  )}

                  {activeApp.githubUrl && (
                    <a
                      href={activeApp.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2 border-b border-white/20 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#cfc6bb] transition-colors hover:border-[#ff5500] hover:text-white focus-visible:outline-none focus-visible:text-white"
                    >
                      <Github className="h-3.5 w-3.5 text-[#ff7a2e]" />
                      Repository
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  )}
                </div>

                <span className="inline-flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.18em] text-[#7f8f7a] sm:ml-auto">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/80" />
                  Production hardened
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Closing ledger */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#6f675e] sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 text-[#a9a095]">
            <Smartphone className="h-3.5 w-3.5 text-[#ff5500]" />
            Native builds / React Native / Java
          </span>
          <span>Google Play release / 3D showcase / Live telemetry</span>
        </div>
      </div>
    </section>
  );
};
