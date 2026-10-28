import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Navbar } from './components/common/Navbar';
import { CustomCursor } from './components/common/CustomCursor';
import { ProjectModal } from './components/common/ProjectModal';
import { Loader } from './sections/Loader';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { MobileAppsSection } from './sections/MobileAppsSection';
import { WorkSection } from './sections/WorkSection';
import { SkillsSection } from './sections/SkillsSection';
import { ServicesSection } from './sections/ServicesSection';
import { ProcessSection } from './sections/ProcessSection';
import { ContactSection } from './sections/ContactSection';
import { Footer } from './sections/Footer';
import { Project, PROJECTS } from './data/projects';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      const frameId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(frameId);
        lenis.destroy();
      };
    } catch (e) {
      console.warn('Lenis smooth scroll failed to initialize, falling back to native scroll:', e);
    }
  }, []);

  const handleContactClick = () => {
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    const workElem = document.getElementById('work');
    if (workElem) {
      workElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMobileClick = () => {
    const mobileElem = document.getElementById('mobile-apps');
    if (mobileElem) {
      mobileElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentIndex = selectedProject
    ? PROJECTS.findIndex((p) => p.id === selectedProject.id)
    : -1;

  const handleNextProject = () => {
    if (!selectedProject) return;
    const currIdx = PROJECTS.findIndex((p) => p.id === selectedProject.id);
    if (currIdx === -1) return;
    const nextIdx = (currIdx + 1) % PROJECTS.length;
    setSelectedProject(PROJECTS[nextIdx]);
  };

  const handlePrevProject = () => {
    if (!selectedProject) return;
    const currIdx = PROJECTS.findIndex((p) => p.id === selectedProject.id);
    if (currIdx === -1) return;
    const prevIdx = (currIdx - 1 + PROJECTS.length) % PROJECTS.length;
    setSelectedProject(PROJECTS[prevIdx]);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-[#f4f1ea] font-sans selection:bg-[#ff7900] selection:text-black">
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Grain Background Texture */}
      <div className="fixed inset-0 noise-overlay pointer-events-none z-20" />

      {/* Initial Boot Loader */}
      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}

      {/* Main Page Layout */}
      <div className={`transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar onContactClick={handleContactClick} />

        <main>
          <HeroSection
            onExploreClick={handleExploreClick}
            onContactClick={handleContactClick}
            onMobileClick={handleMobileClick}
          />
          <AboutSection />
          <MobileAppsSection />
          <WorkSection onSelectProject={(project) => setSelectedProject(project)} />
          <SkillsSection />
          <ServicesSection onContactClick={handleContactClick} />
          <ProcessSection />
          <ContactSection />
        </main>

        <Footer />
      </div>

      {/* Full-Screen Project Detail Modal with Global Keyboard Navigation */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onNext={handleNextProject}
        onPrev={handlePrevProject}
        currentIndex={currentIndex}
        totalCount={PROJECTS.length}
      />
    </div>
  );
}
