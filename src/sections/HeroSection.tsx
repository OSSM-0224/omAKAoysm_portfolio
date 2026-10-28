import React, { useState, useEffect } from "react";
import { ArrowDown, Sparkles, Terminal, Code2, Smartphone } from "lucide-react";
import { MatrixRain } from "../components/common/MatrixRain";
import { MagneticButton } from "../components/common/MagneticButton";

interface HeroSectionProps {
  onExploreClick: () => void;
  onContactClick: () => void;
  onMobileClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onContactClick,
  onMobileClick,
}) => {
  // Split letter glitch state for OM
  const nameLetters = ["O", "M"];
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);

  // Typewriter effect for role line
  const fullText =
    "Full-Stack Web Developer • Mobile App Developer • Builder of things that ship";
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx <= fullText.length) {
        setTypedText(fullText.slice(0, currentIdx));
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between pt-28 pb-12 px-6 sm:px-8 md:px-12 overflow-hidden bg-[#030303]"
    >
      {/* Low-opacity Falling Matrix Digit Rain in background */}
      <MatrixRain opacity={0.09} color="#ff7900" />

      {/* Top Meta Terminal Banner */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#8a8780] border-b border-[#1c1c1c] pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#ff7900]" />
          <span className="tracking-widest uppercase">
            OM_TERMINAL_CORE // OYSM.DEV
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline">LOC: NAVI MUMBAI, IN (IST)</span>
          <span className="flex items-center gap-2 text-white">
            <span className="w-2 h-2 rounded-full bg-[#ff7900] shadow-[0_0_10px_#ff7900]" />
            AVAILABLE FOR CONTRACTS &amp; COMMISSIONS
          </span>
        </div>
      </div>

      {/* Main Hero Split Grid: Typography Left, Moving ASCII Portrait Right */}
      <div className="relative z-10 max-w-7xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Giant Name & Roles */}
        <div className="lg:col-span-7 space-y-6">
          {/* Developer Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#120c06] border border-[#ff7900]/40 text-xs font-mono text-[#ff9029]">
            <Code2 className="w-3.5 h-3.5 text-[#ff7900]" />
            <span>FULL-STACK WEB &amp; MOBILE SPECIALIST</span>
          </div>

          {/* GIANT SPLIT-TEXT NAME: OM (aka OYSM) */}
          <div className="flex flex-wrap items-baseline gap-3 sm:gap-5 select-none">
            <div className="flex items-center gap-1 sm:gap-2">
              {nameLetters.map((char, idx) => (
                <span
                  key={idx}
                  onMouseEnter={() => setHoveredLetter(idx)}
                  onMouseLeave={() => setHoveredLetter(null)}
                  className={`font-display font-black text-7xl sm:text-9xl md:text-[140px] lg:text-[160px] leading-none tracking-tighter transition-all duration-300 cursor-default ${
                    hoveredLetter === idx
                      ? "text-[#ff7900] scale-110 -translate-y-2 text-glow-orange"
                      : "text-white hover:text-[#ff7900]"
                  }`}
                >
                  {char}
                </span>
              ))}
              <span className="font-display font-black text-7xl sm:text-9xl md:text-[140px] lg:text-[160px] leading-none text-[#ff7900]">
                .
              </span>
            </div>

            {/* Tagline: aka OYSM */}
            <div className="px-3 py-1 rounded bg-[#141416] border border-[#2b2b33] text-xs sm:text-sm font-mono text-[#d1ccc2] tracking-wider font-semibold">
              aka{" "}
              <span className="text-[#ff7900] font-bold">&quot;OYSM&quot;</span>
            </div>
          </div>

          {/* Typewriter Role Line */}
          <div className="max-w-2xl font-mono text-sm sm:text-base md:text-lg text-[#d4cfc5] h-12 flex items-center">
            <span className="text-[#ff7900] mr-2 font-bold">&gt;</span>
            <span className="border-r-2 border-[#ff7900] pr-1 animate-pulse">
              {typedText}
            </span>
          </div>

          <p className="max-w-xl text-sm sm:text-base text-[#9e9a91] font-sans leading-relaxed">
            Crafting high-velocity digital experiences where full-stack web
            architectures (React, Node, WebSockets) converge with native mobile
            engineering (React Native, Android Java, Google Maps).
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3">
            <MagneticButton
              strength={0.3}
              onClick={onExploreClick}
              className="group px-7 py-3.5 rounded-lg bg-[#ff7900] text-black font-mono font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(255,121,0,0.4)] hover:shadow-[0_0_40px_rgba(255,121,0,0.7)] transition-all active:scale-95"
            >
              <span className="flex items-center gap-2">
                <span>VIEW WEB WORK</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </span>
            </MagneticButton>

            <MagneticButton
              strength={0.25}
              onClick={onMobileClick}
              className="px-7 py-3.5 rounded-lg bg-[#141416] hover:bg-[#1a1a20] text-white font-mono font-medium text-sm tracking-wide border border-[#2b2b36] hover:border-[#ff7900]/60 transition-all active:scale-95 flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-[#ff7900]" />
              <span>3D MOBILE APPS</span>
            </MagneticButton>

            <MagneticButton
              strength={0.25}
              onClick={onContactClick}
              className="px-6 py-3.5 rounded-lg bg-transparent hover:bg-[#111] text-[#b8b4ab] hover:text-white font-mono text-sm tracking-wide border border-transparent hover:border-[#333] transition-all"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff7900]" />
                <span>LET&apos;S TALK</span>
              </span>
            </MagneticButton>
          </div>
        </div>

        {/* Right Column: NEON ORANGE ASCII PORTRAIT */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-w-0 w-full">
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-[#ff7900]/30 bg-[#030303] shadow-[0_0_60px_rgba(255,121,0,0.18)]">
            {/* ASCII Portrait Header */}
            <div className="relative z-10 flex items-center justify-between gap-2 font-mono text-[10px] text-[#737069] px-3 py-2 border-b border-[#ff7900]/20 bg-[#090909]">
              <span className="text-[#ff7900] truncate">
                ASCII_PORTRAIT://OM_OYSM.HTML
              </span>
              <span className="text-[#ff7900] shrink-0">LIVE_RENDER</span>
            </div>

            {/* HTML-based ASCII Portrait */}
            <iframe
              src="/om_neon_orange_ascii.html"
              title="OM Neon Orange ASCII Portrait"
              className="block w-full h-[480px] sm:h-[560px] lg:h-[600px] border-0 bg-[#030303] pointer-events-none"
              loading="eager"
              sandbox="allow-scripts"
              scrolling="no"
            />
          </div>
        </div>
      </div>

      {/* Bottom Status & Scroll Indicator */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#1c1c1c] font-mono text-xs text-[#737069]">
        <div className="flex items-center gap-4">
          <span>REACT NATIVE &amp; ANDROID</span>
          <span>·</span>
          <span>11 WEB CASE STUDIES</span>
          <span>·</span>
          <span>SUB-50MS SOCKETS</span>
        </div>

        <button
          onClick={onExploreClick}
          className="flex items-center gap-2 text-[#9c9890] hover:text-[#ff7900] transition-colors"
        >
          <span>SCROLL DOWN</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#ff7900]" />
        </button>
      </div>
    </section>
  );
};
