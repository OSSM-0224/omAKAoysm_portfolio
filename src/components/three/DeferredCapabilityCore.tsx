import React, { Suspense, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CapabilityCoreProps } from "./CapabilityCore";

/**
 * CapabilityCore pulls in @react-three/fiber, drei and three. It sits far below
 * the fold, so load it only when the section approaches the viewport. The
 * shell below mirrors the real card so swapping it in causes no layout shift.
 */
const CapabilityCore = React.lazy(() =>
  import("./CapabilityCore").then((module) => ({
    default: module.CapabilityCore,
  })),
);

const ARROW_CLASS =
  "inline-flex h-10 w-10 items-center justify-center rounded border border-[#2a2a32] text-[#6b6b73] sm:h-8 sm:w-8";

const CoreShell: React.FC<CapabilityCoreProps> = ({
  services,
  activeIndex,
}) => {
  const active = services[activeIndex] ?? services[0];

  return (
    <div
      aria-busy="true"
      className="relative overflow-hidden rounded-2xl border border-[#26262e] bg-[#07070a] shadow-[16px_22px_70px_rgba(0,0,0,0.62)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,121,0,0.14),transparent_63%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,121,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,121,0,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at 50% 48%, black 8%, transparent 74%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 48%, black 8%, transparent 74%)",
        }}
      />

      <div className="relative z-20 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.18em]">
        <span className="flex min-w-0 items-center gap-2 text-[#8a8780]">
          <span className="h-1.5 w-1.5 shrink-0 bg-[#ff7900]" />
          <span className="truncate">
            CAPABILITY_CORE <span className="text-[#46464e]">/</span>{" "}
            <span className="text-white">05_LAYERS</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[#ff9029]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff7900] shadow-[0_0_8px_#ff7900]" />
          {String(activeIndex + 1).padStart(2, "0")} / 05
        </span>
      </div>

      <div
        aria-hidden="true"
        className="relative isolate flex h-[390px] flex-col items-center justify-center gap-3 sm:h-[460px] lg:h-[520px]"
      >
        <span className="h-8 w-8 animate-spin rounded-full border border-[#ff7900]/20 border-t-[#ff7900] motion-reduce:animate-none" />
        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#ffb066]/80">
          Initializing 3D core
        </span>

        <div className="pointer-events-none absolute inset-3">
          <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-[#ff7900]/50" />
          <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-[#ff7900]/50" />
          <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[#ff7900]/50" />
          <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[#ff7900]/50" />
        </div>

        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[#ffb066]/90 sm:inset-x-5">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 bg-[#ff7900]" />
            STANDBY
          </span>
          <span className="hidden sm:inline">QUEUED</span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.24em] text-[#ffb066]/80 sm:inline">
            [ LOADS AS YOU SCROLL ]
          </span>
        </div>
      </div>

      <div className="relative z-20 flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-bold tracking-tight text-white sm:text-base">
            {active.num} <span className="text-[#ff7900]">/</span>{" "}
            {active.short}
          </div>
          <div className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.14em] text-[#8f8a81]">
            {active.subtitle}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-1 sm:justify-end">
          <span className={ARROW_CLASS}>
            <ChevronLeft className="h-4 w-4" />
          </span>

          <div className="flex items-center">
            {services.map((service, index) => (
              <span
                key={service.id}
                className="flex h-10 w-6 items-center justify-center sm:h-8"
              >
                <span
                  className={`h-1 rounded-full ${
                    index === activeIndex
                      ? "w-5 bg-[#ff7900]"
                      : "w-2.5 bg-[#2e2e36]"
                  }`}
                />
              </span>
            ))}
          </div>

          <span className={ARROW_CLASS}>
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
};

export const DeferredCapabilityCore: React.FC<CapabilityCoreProps> = (props) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || mount) return;

    if (typeof IntersectionObserver === "undefined") {
      setMount(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMount(true);
        observer.disconnect();
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [mount]);

  return (
    <div ref={hostRef}>
      {mount ? (
        <Suspense fallback={<CoreShell {...props} />}>
          <CapabilityCore {...props} />
        </Suspense>
      ) : (
        <CoreShell {...props} />
      )}
    </div>
  );
};
