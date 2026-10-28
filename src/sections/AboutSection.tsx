import React, { useState, useEffect, useRef } from "react";
import { AsciiNumber } from "../components/common/AsciiNumber";
import { Terminal, ShieldCheck, Zap, Smartphone } from "lucide-react";

const BIO_WORDS = [
  "I",
  "am",
  "OM",
  "(OYSM),",
  "a",
  "full-stack",
  "web",
  "developer",
  "and",
  "mobile",
  "app",
  "engineer.",
  "I",
  "cut",
  "my",
  "teeth",
  "in",
  "mobile",
  "app",
  "engineering",
  "at",
  "Tech",
  "Vyassa,",
  "shipping",
  "production",
  "apps",
  "to",
  "the",
  "Google",
  "Play",
  "Store.",
  "Today,",
  "I",
  "build",
  "high-concurrency",
  "real-time",
  "platforms,",
  "bespoke",
  "client",
  "websites,",
  "and",
  "native",
  "mobile",
  "solutions",
  "that",
  "combine",
  "strict",
  "architecture",
  "with",
  "award-grade",
  "feel.",
];

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(
          1,
          (windowHeight - rect.top) / (rect.height + windowHeight * 0.5),
        ),
      );
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const highlightedWordCount = Math.floor(
    scrollProgress * (BIO_WORDS.length + 5),
  );

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full py-28 px-6 sm:px-8 md:px-12 bg-[#060608] border-t border-[#1a1a1a]"
    >
      <div className="max-w-7xl mx-auto w-full space-y-20">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#1c1c1c]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff7900] tracking-wider uppercase">
              <Terminal className="w-3.5 h-3.5" />
              <span>02. ARCHITECT PROFILE &amp; TRAJECTORY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white">
              Web &amp; Mobile Engineer
            </h2>
          </div>
          <div className="font-mono text-xs text-[#737069]">
            [OM_OYSM_KERNEL_ONLINE]
          </div>
        </div>

        {/* Scroll-Reveal Illuminated Bio */}
        <div className="max-w-5xl">
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-medium leading-[1.3] tracking-tight">
            {BIO_WORDS.map((word, idx) => {
              const isLit = idx < highlightedWordCount;
              const isAccent =
                isLit &&
                (word.includes("OM") ||
                  word.includes("Tech") ||
                  word.includes("Vyassa") ||
                  word.includes("Google") ||
                  word.includes("Play") ||
                  word.includes("award-grade"));
              return (
                <span
                  key={idx}
                  className={`inline-block mr-2.5 transition-colors duration-200 ${
                    isLit ? "text-white" : "text-[#363430]"
                  } ${isAccent ? "text-[#ff7900] font-bold text-glow-orange" : ""}`}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
};
