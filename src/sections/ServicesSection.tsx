import React from 'react';
import { Terminal, AppWindow, Smartphone, Sparkles, Box, Gauge, ArrowRight } from 'lucide-react';

const SERVICES = [
  {
    num: '01',
    title: 'Mobile App Engineering (React Native & Android)',
    subtitle: 'From prototype to Google Play Store release',
    icon: Smartphone,
    description: 'Production mobile apps built with React Native 0.82 and Native Android Java. Integrated with Zego Cloud encrypted video, offline-first AES storage, Google Maps GPS telemetry, and background services.',
    deliverables: ['Cross-platform React Native iOS & Android', 'Native Java Android services & background daemons', 'Google Play Store release & AAB signing', 'Zego Cloud live audio/video calling'],
  },
  {
    num: '02',
    title: 'Full-Stack Web Applications (MERN)',
    subtitle: 'Layered controller-service-repo architectures',
    icon: AppWindow,
    description: 'Bespoke web applications built with React 19, TypeScript, Express, and MongoDB. Engineered for concurrency, rock-solid data consistency, and high-velocity workflows.',
    deliverables: ['Custom RESTful backend APIs', 'Schema normalization & migration scripts', 'Dual-token JWT session security', 'Reactive stateful dashboards'],
  },
  {
    num: '03',
    title: 'Real-Time Systems & WebSocket Engines',
    subtitle: 'Sub-50ms synchronized bidirectional streams',
    icon: Sparkles,
    description: 'High-frequency live auction suites, collaborative sports match scoring, and multi-user data feeds that update across thousands of concurrent clients without stutter or desync.',
    deliverables: ['Socket.io event clusters & rooms', 'Optimistic UI with rollback protection', 'Conflict-free state resolution', 'Exportable PDF certificates & logs'],
  },
  {
    num: '04',
    title: 'Client Ecosystems & Headless CMS',
    subtitle: 'Healthcare, sports, and corporate platforms',
    icon: Box,
    description: 'High-conversion digital suites for medical practices, clinics, and non-profits. Sanity Headless CMS content pipelines, doctor consultation intakes, and trust-first designs.',
    deliverables: ['Multi-speciality clinic platforms', 'Sanity Headless CMS schemas', 'Automated appointment calendars', 'WCAG AA accessible interfaces'],
  },
  {
    num: '05',
    title: 'Performance & Technical SEO Architecture',
    subtitle: 'Lighthouse 95+ and programmatic search indexing',
    icon: Gauge,
    description: 'Transforming slow sites into sub-second powerhouses. Eliminating cumulative layout shifts (CLS), optimizing bundle chunks, and deploying structured schema.org data.',
    deliverables: ['Core Web Vitals greenline audits', 'Vite bundle splitting & tree-shaking', 'Dynamic Open Graph social cards', 'JSON-LD structured rich data'],
  },
];

export const ServicesSection: React.FC<{ onContactClick: () => void }> = ({ onContactClick }) => {
  return (
    <section
      id="services"
      className="relative w-full py-28 px-6 sm:px-8 md:px-12 bg-[#040406] border-t border-[#1c1c1c]"
    >
      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#1c1c1c]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff7900] tracking-wider uppercase">
              <Terminal className="w-3.5 h-3.5" />
              <span>06. CAPABILITIES &amp; OFFERINGS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white">
              Web &amp; Mobile Engineering Services
            </h2>
          </div>
          <div className="font-mono text-xs text-[#737069]">
            [COMMISSION_CAPACITY_OPEN]
          </div>
        </div>

        {/* Services List / Cards */}
        <div className="space-y-6">
          {SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="group p-6 sm:p-8 rounded-2xl bg-[#0a0a0d] border border-[#1b1b22] hover:border-[#ff7900]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,121,0,0.12)] flex flex-col lg:flex-row lg:items-center justify-between gap-8"
              >
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-[#ff7900] font-bold px-2 py-0.5 rounded bg-[#1f1308] border border-[#ff7900]/30">
                      {srv.num}
                    </span>
                    <span className="text-xs font-mono text-[#737069]">
                      {srv.subtitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#ff7900] shrink-0" />
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white group-hover:text-[#ff7900] transition-colors">
                      {srv.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#a39f96] leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {srv.deliverables.map((item, dIdx) => (
                      <span
                        key={dIdx}
                        className="text-[11px] font-mono text-[#8a8780] bg-[#121216] px-2.5 py-1 rounded border border-[#212129]"
                      >
                        · {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex items-center lg:flex-col lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-[#1c1c1c]">
                  <button
                    onClick={onContactClick}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-medium text-white bg-[#121217] hover:bg-[#ff7900] hover:text-black border border-[#262630] hover:border-[#ff7900] transition-all group-hover:shadow-[0_0_20px_rgba(255,121,0,0.25)]"
                  >
                    <span>COMMISSION THIS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
