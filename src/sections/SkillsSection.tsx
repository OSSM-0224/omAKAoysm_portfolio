import React, { useState } from 'react';
import { SkillsCloud3D } from '../components/three/SkillsCloud3D';
import { Terminal, Code, Database, Server, Wrench, Smartphone } from 'lucide-react';

interface TechCategory {
  title: string;
  icon: any;
  items: { name: string; level: string; note: string }[];
}

const CATEGORIES: Record<string, TechCategory> = {
  Mobile: {
    title: 'Mobile App Engineering',
    icon: Smartphone,
    items: [
      { name: 'React Native 0.82', level: 'Production Live', note: 'Zego Cloud calling, AES encryption, Redux Toolkit, custom sliders' },
      { name: 'Native Android (Java)', level: 'Advanced', note: 'SensorManager, background daemons, BootReceiver, Google Maps' },
      { name: 'Google Play Console', level: 'Shipped', note: 'Production store releases, key signing, AAB bundles, 100+ downloads' },
      { name: 'Offline Storage & Cache', level: 'Advanced', note: 'Hardware-level AES-256 encrypted storage, SQLite, offline-first queue' },
      { name: 'Firebase Mobile SDKs', level: 'Advanced', note: 'Auth, Realtime DB, Firestore, Cloud Storage, Push Notifications' },
    ],
  },
  Web: {
    title: 'Full-Stack Web & 3D',
    icon: Code,
    items: [
      { name: 'React 19 & Next.js', level: 'Expert', note: 'Concurrent rendering, custom hooks, suspense, SSR/prerender' },
      { name: 'TypeScript', level: 'Advanced', note: 'Strict type safety, generics, schema contracts' },
      { name: 'Three.js & R3F', level: 'Advanced', note: 'Procedural 3D models, PBR studio lighting, 60fps loops' },
      { name: 'Tailwind CSS v4', level: 'Expert', note: 'Design token systems, custom CRT scanlines, mobile-first' },
      { name: 'GSAP & Lenis', level: 'Advanced', note: 'Smooth scrolling, physics springs, ScrollTrigger timelines' },
    ],
  },
  Backend: {
    title: 'Backend & Sockets',
    icon: Server,
    items: [
      { name: 'Node.js & Express', level: 'Expert', note: 'RESTful architectures, layered controller-service-repo pattern' },
      { name: 'Socket.io & WebSockets', level: 'Expert', note: 'Sub-50ms live bidding, scoring broadcast, zero state desync' },
      { name: 'JWT & Session Security', level: 'Advanced', note: 'Token rotation, HTTP-only cookies, brute-force rate limiters' },
      { name: 'Zego Cloud UIKit', level: 'Implemented', note: 'Encrypted real-time audio/video tele-consultation pipeline' },
    ],
  },
  Database: {
    title: 'Database & CMS',
    icon: Database,
    items: [
      { name: 'MongoDB & Mongoose', level: 'Expert', note: 'Aggregation pipelines, indexes, replica sets' },
      { name: 'Firebase Suite', level: 'Advanced', note: 'Firestore, Realtime Database, Security Rules' },
      { name: 'PostgreSQL & SQL', level: 'Advanced', note: 'ACID transactions, relational schemas, constraints' },
      { name: 'Redis', level: 'Advanced', note: 'In-memory caching, pub/sub channels, lock management' },
      { name: 'Sanity Headless CMS', level: 'Advanced', note: 'Custom schemas, GROQ queries, real-time editorial flow' },
    ],
  },
  Tools: {
    title: 'DevOps & Tooling',
    icon: Wrench,
    items: [
      { name: 'Vite & Bundlers', level: 'Expert', note: 'Rollup optimization, code splitting, tree shaking' },
      { name: 'Docker', level: 'Intermediate', note: 'Containerization, docker-compose development environments' },
      { name: 'Git & GitHub Actions', level: 'Advanced', note: 'Automated CI/CD pipelines, release versioning' },
      { name: 'Android Studio & Gradle', level: 'Advanced', note: 'ProGuard/R8 obfuscation, SDK build tools, emulator profiling' },
      { name: 'Linux & Cloud Deploy', level: 'Advanced', note: 'Vercel, Render, Nginx, SSL, environment management' },
    ],
  },
};

export const SkillsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof CATEGORIES>('Mobile');

  const currentCategory = CATEGORIES[activeTab];

  return (
    <section
      id="skills"
      className="relative w-full py-28 px-6 sm:px-8 md:px-12 bg-[#060608] border-t border-[#1c1c1c]"
    >
      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#1c1c1c]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff7900] tracking-wider uppercase">
              <Terminal className="w-3.5 h-3.5" />
              <span>05. TECH STACK &amp; CAPABILITIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white">
              3D Tech Sphere &amp; Core Arsenal
            </h2>
          </div>
          <div className="font-mono text-xs text-[#737069]">
            [STACK_ORBIT_ONLINE]
          </div>
        </div>

        {/* 2-Column Split: 3D Cloud + Categorized Technical Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Interactive 3D Sphere */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0b0b0e] border border-[#1b1b22]">
            <SkillsCloud3D />
          </div>

          {/* Right Column: Stack Categories & Breakdown */}
          <div className="lg:col-span-7 space-y-8">
            {/* Category Selector Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-[#0e0e12] border border-[#1e1e26]">
              {(Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const IconComponent = cat.icon;
                const isSelected = activeTab === catKey;

                return (
                  <button
                    key={catKey}
                    onClick={() => setActiveTab(catKey)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-[#ff7900] text-black font-bold shadow-[0_0_15px_rgba(255,121,0,0.35)]'
                        : 'text-[#8a8780] hover:text-white hover:bg-[#181820]'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{catKey}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Category Skill List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#737069] pb-2 border-b border-[#1c1c1c]">
                <span>CORE STACK SPECIFICATION</span>
                <span>PROFICIENCY &amp; PRODUCTION CONTEXT</span>
              </div>

              <div className="space-y-3">
                {currentCategory.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0f0f14] border border-[#1c1c24] hover:border-[#ff7900]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="text-sm sm:text-base font-bold font-display text-white group-hover:text-[#ff7900] transition-colors">
                        {item.name}
                      </div>
                      <div className="text-xs font-mono text-[#8a8780]">
                        {item.note}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded text-[11px] font-mono text-[#ff9029] bg-[#1a1309] border border-[#ff7900]/30 font-semibold">
                        {item.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
