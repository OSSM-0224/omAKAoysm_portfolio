import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Smartphone,
  Terminal,
} from "lucide-react";
import DataRain from "../components/ui/data-rain";
import { PortraitScanner } from "../components/common/PortraitScanner";

interface HeroSectionProps {
  onExploreClick: () => void;
  onContactClick: () => void;
  onMobileClick: () => void;
}

const ROLES = [
  "FULL-STACK WEB ENGINEER",
  "MOBILE APP DEVELOPER",
  "REAL-TIME SYSTEMS BUILDER",
  "BUILDER OF THINGS THAT SHIP",
];

const STATIC_ROLE = ROLES.join(" · ");

type HeroActionVariant = "primary" | "secondary" | "quiet";

/** Magnetic CTA with a scanner sweep, pointer light, and a hard focus state. */
const HeroAction: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: HeroActionVariant;
  icon?: React.ReactNode;
}> = ({ children, onClick, variant = "primary", icon }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [magnetic, setMagnetic] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setMagnetic(finePointer && !reduced);
  }, []);

  const handleMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    button.style.setProperty("--mx", `${x}px`);
    button.style.setProperty("--my", `${y}px`);

    if (magnetic) {
      setOffset({
        x: (x - rect.width / 2) * 0.12,
        y: (y - rect.height / 2) * 0.18,
      });
    }
  };

  const resetMove = () => setOffset({ x: 0, y: 0 });

  const variants: Record<HeroActionVariant, string> = {
    primary:
      "h-12 rounded-lg bg-[#ff7900] px-6 text-sm font-bold text-black shadow-[0_10px_30px_rgba(255,121,0,0.28)] hover:bg-[#ff8b1a] hover:shadow-[0_12px_38px_rgba(255,121,0,0.4)]",
    secondary:
      "h-12 rounded-lg border border-[#2b2b36] bg-[#0d0d11] px-5 text-sm font-bold text-white hover:border-[#ff7900]/60 hover:bg-[#131318]",
    quiet:
      "gap-2 py-2 text-xs tracking-[0.18em] text-[#b8b4ab] hover:text-white",
  };

  return (
    <span
      className={
        variant === "quiet" ? "inline-block" : "block w-full sm:inline-block sm:w-auto"
      }
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition:
          offset.x === 0 && offset.y === 0
            ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
            : "transform 0.12s ease-out",
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onMouseMove={handleMove}
        onMouseLeave={resetMove}
        onBlur={resetMove}
        style={
          {
            "--mx": "50%",
            "--my": "50%",
          } as React.CSSProperties
        }
        className={`group relative inline-flex items-center justify-center overflow-hidden font-mono outline-none transition-[background-color,border-color,box-shadow,color] duration-300 focus-visible:ring-2 focus-visible:ring-[#ff7900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303] ${
          variant === "quiet" ? "w-auto" : "w-full sm:w-auto"
        } ${variants[variant]}`}
      >
        {variant !== "quiet" && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-[left,opacity] duration-700 ease-out group-hover:left-[110%] group-hover:opacity-100"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(150px circle at var(--mx) var(--my), rgba(255,255,255,0.14), transparent 70%)",
              }}
            />
          </>
        )}

        {variant === "quiet" && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-[#ff7900]/20"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[#ff7900] transition-all duration-500 group-hover:w-full"
            />
          </>
        )}

        <span className="relative z-10 flex items-center gap-2">
          {icon && (
            <span className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
              {icon}
            </span>
          )}
          <span>{children}</span>
          {(variant === "primary" || variant === "quiet") && (
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          )}
        </span>
      </button>
    </span>
  );
};

const CSS = `
@keyframes hero-scan-band {
  0% { top: -6%; opacity: 0; }
  8% { opacity: 0.9; }
  88% { opacity: 0.9; }
  100% { top: 104%; opacity: 0; }
}
.hero-scanline { animation: hero-scan-band 7s linear infinite; }
@keyframes hero-caret-blink {
  0%, 45% { opacity: 1; }
  46%, 100% { opacity: 0; }
}
.hero-caret { animation: hero-caret-blink 1.05s steps(1) infinite; }
@keyframes hero-scroll-cue {
  0% { transform: translateY(-2px); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translateY(5px); opacity: 0; }
}
.hero-scroll-cue { animation: hero-scroll-cue 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
@media (prefers-reduced-motion: reduce) {
  .hero-scanline, .hero-caret, .hero-scroll-cue { animation: none; }
  .hero-scanline { display: none; }
}
`;

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onContactClick,
  onMobileClick,
}) => {
  const nameLetters = ["O", "M"];
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);

  const [roleIndex, setRoleIndex] = useState(0);
  const [roleText, setRoleText] = useState("");
  const [rolePhase, setRolePhase] = useState<
    "typing" | "deleting"
  >("typing");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const role = ROLES[roleIndex];
    let timeout: number;

    if (rolePhase === "typing") {
      if (roleText.length < role.length) {
        timeout = window.setTimeout(() => {
          setRoleText(role.slice(0, roleText.length + 1));
        }, 44);
      } else {
        timeout = window.setTimeout(() => setRolePhase("deleting"), 2100);
      }
    } else if (roleText.length > 0) {
      timeout = window.setTimeout(() => {
        setRoleText(role.slice(0, roleText.length - 1));
      }, 20);
    } else {
      setRoleIndex((index) => (index + 1) % ROLES.length);
      setRolePhase("typing");
    }

    return () => clearTimeout(timeout);
  }, [roleText, rolePhase, roleIndex, reducedMotion]);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden px-6 pb-12 pt-28 sm:px-8 md:px-12"
    >
      <style>{CSS}</style>
      <DataRain
        fullscreen={false}
        className="absolute inset-0 -z-10 block h-full w-full"
        count={5000}
        flowSpeed={1.0}
        obstacleRadius={80}
      />

      {/* Top Meta Terminal Banner */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-[#1c1c1c] pb-4 font-mono text-xs text-[#8a8780]">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-[#ff7900]" />
          <span className="uppercase tracking-widest">
            OM_TERMINAL_CORE // OYSM.DEV
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline">LOC: NAVI MUMBAI, IN (IST)</span>
          <span className="flex items-center gap-2 text-white">
            <span className="h-2 w-2 rounded-full bg-[#ff7900] shadow-[0_0_10px_#ff7900]" />
            AVAILABLE FOR CONTRACTS &amp; COMMISSIONS
          </span>
        </div>
      </div>

      {/* Main Hero Split Grid: Typography Left, Portrait Right */}
      <div className="relative z-10 mx-auto my-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 py-8 lg:grid-cols-12">
        <div className="space-y-7 lg:col-span-7">
          {/* Giant split-text name */}
          <div className="flex flex-wrap items-baseline gap-3 select-none sm:gap-5">
            <div className="flex items-center gap-1 sm:gap-2">
              {nameLetters.map((char, idx) => (
                <span
                  key={idx}
                  onMouseEnter={() => setHoveredLetter(idx)}
                  onMouseLeave={() => setHoveredLetter(null)}
                  className={`cursor-default font-display text-7xl font-black leading-none tracking-tighter transition-all duration-300 sm:text-9xl md:text-[140px] lg:text-[160px] ${
                    hoveredLetter === idx
                      ? "-translate-y-2 scale-110 text-[#ff7900] text-glow-orange"
                      : "text-white hover:text-[#ff7900]"
                  }`}
                >
                  {char}
                </span>
              ))}
              <span className="font-display text-7xl font-black leading-none text-[#ff7900] sm:text-9xl md:text-[140px] lg:text-[160px]">
                .
              </span>
            </div>

            <div className="rounded border border-[#2b2b33] bg-[#141416] px-3 py-1 font-mono text-xs font-semibold tracking-wider text-[#d1ccc2] sm:text-sm">
              aka{" "}
              <span className="font-bold text-[#ff7900]">
                &quot;OYSM&quot;
              </span>
            </div>
          </div>

          <div className="max-w-2xl space-y-5">
            {/* Terminal role ticker */}
            <div className="flex min-h-[1.8em] items-center font-mono text-xs uppercase tracking-[0.08em] text-[#d4cfc5] sm:text-sm md:text-base">
              <span className="mr-2 font-bold text-[#ff7900]">&gt;</span>
              <span aria-hidden="true">
                {reducedMotion ? STATIC_ROLE : roleText}
                <span className="hero-caret ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.12em] bg-[#ff7900]" />
              </span>
              <span className="sr-only">
                Full-stack web engineer, mobile app developer, real-time systems
                builder, builder of things that ship.
              </span>
            </div>

            <p className="max-w-[36rem] text-pretty text-[15px] leading-relaxed text-[#b3afa6] sm:text-base">
              From rough idea to production release: React and Node on the web,
              React Native and Android on mobile, WebSockets where milliseconds
              matter. One builder across the entire stack.
            </p>
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 sm:gap-4">
            <HeroAction variant="primary" onClick={onExploreClick}>
              SEE THE WORK
            </HeroAction>

            <HeroAction
              variant="secondary"
              onClick={onMobileClick}
              icon={<Smartphone className="h-4 w-4 text-[#ff7900]" />}
            >
              3D MOBILE APPS
            </HeroAction>

            <HeroAction
              variant="quiet"
              onClick={onContactClick}
              icon={
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff7900] shadow-[0_0_8px_#ff7900]" />
              }
            >
              START A PROJECT
            </HeroAction>
          </div>
        </div>

        {/* Right Column: Interactive portrait scanner */}
        <div className="relative flex items-center justify-center lg:col-span-5">
          <PortraitScanner />
        </div>
      </div>

      {/* Bottom Status & Scroll Indicator */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 border-t border-[#1c1c1c] pt-6 font-mono text-xs text-[#737069] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-3">
          <span className="whitespace-nowrap">REACT NATIVE &amp; ANDROID</span>
          <span aria-hidden="true" className="hidden text-[#3b3b42] sm:inline">
            ·
          </span>
          <span className="whitespace-nowrap">9 WEB CASE STUDIES</span>
          <span aria-hidden="true" className="hidden text-[#3b3b42] sm:inline">
            ·
          </span>
          <span className="whitespace-nowrap">SUB-50MS SOCKETS</span>
        </div>

        <button
          onClick={onExploreClick}
          className="flex items-center gap-2 self-start text-[#9c9890] transition-colors hover:text-[#ff7900] sm:self-auto"
        >
          <span>SCROLL DOWN</span>
          <ArrowDown className="hero-scroll-cue h-3.5 w-3.5 text-[#ff7900]" />
        </button>
      </div>
    </section>
  );
};
