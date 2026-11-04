import React, { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { SERVICES } from "../data/services";
import { CapabilityCore } from "../components/three/CapabilityCore";
import { useReducedMotion } from "../hooks/useReducedMotion";

const CSS = `
@keyframes service-reveal {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
.service-reveal { animation: service-reveal 340ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .service-reveal { animation: none; }
}
`;

export const ServicesSection: React.FC<{ onContactClick: () => void }> = ({
  onContactClick,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const activeService = SERVICES[activeIndex];

  return (
    <section
      id="services"
      className="relative w-full overflow-hidden border-t border-[#1c1c1c] bg-[#040406] px-6 py-24 sm:px-8 sm:py-28 md:px-12"
    >
      <style>{CSS}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[#ff7900]/[0.045] blur-[120px]"
      />

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Section lead: the stack is the argument, so let it lead without a kicker. */}
        <div className="flex flex-col gap-8 border-b border-[#1c1c1c] pb-9 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-balance font-display text-4xl font-bold leading-[0.98] tracking-tight text-white sm:text-5xl md:text-6xl">
              Five layers.
              <span className="block text-[#ff7900]">One builder.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-[#a39f96] sm:text-base">
              Mobile, web, real-time, CMS, and performance. Select a layer to
              inspect the system inside it, or drag the core to look around the
              stack.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6f6b63] lg:items-end">
            <span className="flex items-center gap-2 text-[#ff9029]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff7900] shadow-[0_0_8px_#ff7900]" />
              05 modules / signal online
            </span>
            <span className="text-[#8a857c]">
              React / Node / Native
            </span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Interactive 3D core */}
          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <CapabilityCore
              services={SERVICES}
              activeIndex={activeIndex}
              previewIndex={previewIndex}
              onSelect={setActiveIndex}
              onPreview={setPreviewIndex}
              reducedMotion={reducedMotion}
            />
            <div className="mt-3 flex items-center justify-between px-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#8a857c]">
              <span>05 module stack</span>
              <span>OM / OYSM</span>
            </div>
          </div>

          {/* Service manifest */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-[#24242b] bg-[#07070a] shadow-[14px_20px_50px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#1c1c22] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[#8f8a81]">
                <span>Service_manifest</span>
                <span className="text-[#ff7900]">Select to inspect</span>
              </div>

              {SERVICES.map((service, index) => {
                const isActive = activeIndex === index;

                return (
                  <div
                    key={service.id}
                    className="border-b border-[#1b1b22] last:border-b-0"
                  >
                    <button
                      type="button"
                      aria-expanded={isActive}
                      aria-controls={`service-panel-${service.id}`}
                      onClick={() => setActiveIndex(index)}
                      onMouseEnter={() => setPreviewIndex(index)}
                      onMouseLeave={() => setPreviewIndex(null)}
                      onFocus={() => setPreviewIndex(index)}
                      onBlur={() => setPreviewIndex(null)}
                      className={`group relative flex w-full items-start gap-4 px-5 py-4 text-left outline-none transition-colors duration-300 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#ff7900]/60 sm:px-6 sm:py-5 ${
                        isActive
                          ? "bg-[#0f0c09]"
                          : "hover:bg-[#0b0b0f]"
                      }`}
                    >
                      <span
                        className={`mt-1 w-5 shrink-0 font-mono text-[10px] font-bold tracking-[0.12em] transition-colors ${
                          isActive
                            ? "text-[#ff7900]"
                            : "text-[#8f8a81] group-hover:text-[#b0aba2]"
                        }`}
                      >
                        {service.num}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block font-display text-base font-bold leading-snug tracking-tight transition-colors sm:text-lg ${
                            isActive
                              ? "text-white"
                              : "text-[#ddd8ce] group-hover:text-white"
                          }`}
                        >
                          {service.title}
                        </span>
                        <span
                          className={`mt-1 block font-mono text-[10px] leading-relaxed sm:text-[11px] ${
                            isActive ? "text-[#b6b1a8]" : "text-[#8f8a81]"
                          }`}
                        >
                          {service.subtitle}
                        </span>
                      </span>

                      <span
                        aria-hidden="true"
                        className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                          isActive
                            ? "border-[#ff7900] bg-[#ff7900] text-black"
                            : "border-[#2c2c35] text-[#8a8780] group-hover:border-[#ff7900]/50 group-hover:text-[#ff7900]"
                        }`}
                      >
                        <Plus
                          className={`h-3.5 w-3.5 transition-transform duration-300 ${
                            isActive ? "rotate-45" : ""
                          }`}
                        />
                      </span>
                    </button>

                    {isActive && (
                      <div
                        id={`service-panel-${service.id}`}
                        role="region"
                        aria-label={service.title}
                        className="service-reveal border-t border-[#ff7900]/15 bg-[#0b0a0d] px-5 pb-6 pt-5 sm:px-6"
                      >
                        <p className="max-w-[62ch] text-[13px] leading-[1.75] text-[#b6b1a8] sm:text-sm">
                          {service.description}
                        </p>

                        <div className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                          {service.deliverables.map((item) => (
                            <div
                              key={item}
                              className="flex items-start gap-2.5 text-[11px] leading-relaxed text-[#a39f96] sm:text-xs"
                            >
                              <span className="mt-[7px] h-1 w-1 shrink-0 bg-[#ff7900]" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 border-t border-[#1b1b22] pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            type="button"
                            onClick={onContactClick}
                            className="group/cta inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff7900] px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-black outline-none transition-colors hover:bg-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff7900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0a0d] sm:w-auto"
                          >
                            Commission this module
                            <ArrowUpRight
                              aria-hidden="true"
                              className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                            />
                          </button>
                          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8f8a81]">
                            <span className="hidden sm:inline">
                              [ {activeService.num} / {activeService.short} /
                              ready ]
                            </span>
                            <span className="sm:hidden">
                              [ {activeService.num} / ready ]
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
