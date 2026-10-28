import React, { useState } from 'react';
import { MOBILE_APPS, MobileApp } from '../data/screens';
import { Phone3DCanvas } from '../components/three/Phone3DCanvas';
import { Smartphone, ExternalLink, Github, CheckCircle2, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { AsciiNumber } from '../components/common/AsciiNumber';

export const MobileAppsSection: React.FC = () => {
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const activeApp = MOBILE_APPS[activeAppIndex];

  return (
    <section
      id="mobile-apps"
      className="relative w-full py-28 px-6 sm:px-8 md:px-12 bg-[#050505] border-t border-[#1a1a1a] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#1c1c1c]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff7900] tracking-wider uppercase">
              <Smartphone className="w-4 h-4" />
              <span>03. MOBILE APPLICATIONS &amp; 3D PHONE SHOWCASE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white">
              Native Android &amp; React Native Production
            </h2>
            <p className="text-sm sm:text-base text-[#a39f96] max-w-xl">
              From enterprise cafeteria ticketing on Google Play to encrypted telehealth video suites and native Android safety daemons.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#737069]">ACTIVE VIEWPORT</span>
            <AsciiNumber value={`0${activeAppIndex + 1}`} size="sm" color="text-[#ff7900]" />
          </div>
        </div>

        {/* App Switcher Tabs */}
        <div className="flex flex-wrap gap-3 p-1.5 rounded-xl bg-[#0e0e10] border border-[#212124] max-w-3xl">
          {MOBILE_APPS.map((app, idx) => {
            const isSelected = activeAppIndex === idx;
            return (
              <button
                key={app.id}
                onClick={() => setActiveAppIndex(idx)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-[#ff7900] text-black font-bold shadow-[0_0_20px_rgba(255,121,0,0.4)]'
                    : 'text-[#8a8780] hover:text-white hover:bg-[#17171a]'
                }`}
              >
                <span>{`0${idx + 1}.`}</span>
                <span className="font-sans font-bold">{app.name.split('(')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Split: 3D Phone on Left / Details Side Panel on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: 3D Phone Canvas Viewport */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0a0a0c] border border-[#1e1e24] relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="w-full flex items-center justify-between font-mono text-[10px] text-[#737069] pb-3 border-b border-[#1c1c1f]">
              <span className="text-[#ff7900]">INTERACTIVE 3D SMARTPHONE</span>
              <span>DRAG TO ROTATE 360°</span>
            </div>

            <Phone3DCanvas
              screenshotUrl={activeApp.screenshots[0]}
              accentColor={activeApp.accentColor}
            />

            <div className="w-full flex items-center justify-between font-mono text-[11px] pt-3 border-t border-[#1c1c1f] text-[#8a8780]">
              <span>DEVICE: TITANIUM 60FPS</span>
              <span className="text-[#ff7900]">{activeApp.platform}</span>
            </div>
          </div>

          {/* Right Column: App Information & Deep Metrics Panel */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#171109] border border-[#ff7900]/40 text-xs font-mono text-[#ff9029] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#ff7900]" />
                <span>{activeApp.badgeText}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white">
                {activeApp.name}
              </h3>

              <p className="text-sm sm:text-base text-[#d1ccc2] font-medium leading-relaxed">
                {activeApp.tagline}
              </p>

              <p className="text-xs sm:text-sm text-[#9c9890] leading-relaxed pt-1">
                {activeApp.description}
              </p>
            </div>

            {/* Core Architectural Highlights */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-[#737069]">
                ENGINEERING SPECIFICATIONS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeApp.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0e0e12] border border-[#1d1d24] flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#ff7900] shrink-0 mt-0.5" />
                    <span className="text-xs text-[#cfcac2] leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Chips */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-[#737069]">
                MOBILE STACK &amp; SDKs
              </div>
              <div className="flex flex-wrap gap-2">
                {activeApp.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-[#141418] text-[#c9c5bd] border border-[#26262e]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#1a1a1f]">
              {activeApp.playStoreUrl && (
                <a
                  href={activeApp.playStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-mono font-bold text-black bg-[#ff7900] hover:bg-[#ff9029] transition-all shadow-[0_0_25px_rgba(255,121,0,0.35)]"
                >
                  <Download className="w-4 h-4" />
                  <span>VIEW ON GOOGLE PLAY</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {activeApp.githubUrl && (
                <a
                  href={activeApp.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-mono font-medium text-white bg-[#141418] hover:bg-[#1e1e24] border border-[#2b2b36] hover:border-[#ff7900]/50 transition-colors"
                >
                  <Github className="w-4 h-4 text-[#ff7900]" />
                  <span>VIEW REPOSITORY</span>
                </a>
              )}

              <div className="text-xs font-mono text-[#737069] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% PRODUCTION HARDENED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
