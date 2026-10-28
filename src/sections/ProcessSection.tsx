import React from 'react';
import { Terminal, Search, Compass, Hammer, Rocket } from 'lucide-react';
import { AsciiNumber } from '../components/common/AsciiNumber';

const STEPS = [
  {
    num: '01',
    title: 'Discover & Architecture',
    icon: Search,
    phase: 'PHASE 01 // SPECIFICATION',
    summary: 'Deconstructing core domain problems into modular, fail-safe architectures.',
    details: [
      'Requirements audit and concurrency profiling',
      'Database normalization (MongoDB & SQL schemas)',
      'WebSocket event contract and state synchronization maps',
      'API endpoint specification and auth boundaries'
    ]
  },
  {
    num: '02',
    title: 'Interactive Design & Prototyping',
    icon: Compass,
    phase: 'PHASE 02 // VISUAL CRAFT',
    summary: 'Designing award-level interfaces where every motion serves functional clarity.',
    details: [
      'Tailwind CSS design token architecture (60-30-10 palette)',
      'Three.js scene composition and PBR studio lighting calibration',
      'Awwwards-grade kinetic micro-interactions & spring physics',
      'WCAG AA accessible contrast & keyboard navigation'
    ]
  },
  {
    num: '03',
    title: 'Full-Stack Build & Testing',
    icon: Hammer,
    phase: 'PHASE 03 // EXECUTION',
    summary: 'Writing pristine, typed code with clean layered separation of concerns.',
    details: [
      'Express controllers, services, and repository patterns',
      'Bidirectional Socket.io real-time broadcast pipelines',
      'Sub-50ms optimistic UI updates with rollback guards',
      'Comprehensive security hardening (CORS, JWT rotation, rate limits)'
    ]
  },
  {
    num: '04',
    title: 'Ship, Monitor & Scale',
    icon: Rocket,
    phase: 'PHASE 04 // LAUNCH',
    summary: 'Deploying to high-performance cloud nodes with 99.9% uptime SLA.',
    details: [
      'Vercel & Render production continuous deployment (CI/CD)',
      'Lighthouse 95+ performance & Core Web Vitals audit',
      'Prerendered dynamic SEO and social Open Graph integration',
      'Real-time error logging and performance telemetry'
    ]
  }
];

export const ProcessSection: React.FC = () => {
  return (
    <section
      id="process"
      className="relative w-full py-28 px-6 sm:px-8 md:px-12 bg-[#090909] border-t border-[#1c1c1c]"
    >
      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#1c1c1c]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff7900] tracking-wider uppercase">
              <Terminal className="w-3.5 h-3.5" />
              <span>05. WORKFLOW &amp; EXECUTION METHODOLOGY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white">
              The 4-Step Engineering Cycle
            </h2>
          </div>
          <div className="font-mono text-xs text-[#737069]">
            [DISCOVER → DESIGN → BUILD → SHIP]
          </div>
        </div>

        {/* Process Timeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-6 sm:p-7 rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#ff7900]/60 transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                {/* Step ASCII number header */}
                <div className="flex items-start justify-between border-b border-[#1c1c1c] pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#737069] tracking-widest uppercase">
                      {step.phase}
                    </span>
                    <div className="flex items-center gap-2 text-white font-display font-bold text-lg mt-1 group-hover:text-[#ff7900] transition-colors">
                      <Icon className="w-4 h-4 text-[#ff7900]" />
                      <span>{step.title}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <AsciiNumber
                      value={step.num}
                      size="sm"
                      color="text-[#ff7900]"
                      className="group-hover:text-glow-orange transition-all"
                    />
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-[#b0aca3] leading-relaxed">
                  {step.summary}
                </p>

                {/* Checklist bullets */}
                <div className="space-y-2 pt-2 border-t border-[#171717]">
                  {step.details.map((item, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-[11px] font-mono text-[#8a8780]">
                      <span className="text-[#ff7900]">&gt;</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
