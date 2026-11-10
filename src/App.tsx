import React, { Suspense, useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import { Navbar } from "./components/common/Navbar";
import { CustomCursor } from "./components/common/CustomCursor";
import { Loader } from "./sections/Loader";
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { MobileAppsSection } from "./sections/MobileAppsSection";
import { WorkSection } from "./sections/WorkSection";
import { SkillsSection } from "./sections/SkillsSection";
import { ServicesSection } from "./sections/ServicesSection";
import { ContactSection } from "./sections/ContactSection";
import { Footer } from "./sections/Footer";
import { Project, PROJECTS } from "./data/projects";

/* Case-study code is only fetched when a project opens, keeping the landing
   bundle lighter for first paint. */
const ProjectPage = React.lazy(() =>
  import("./components/common/ProjectPage").then((module) => ({
    default: module.ProjectPage,
  })),
);

const projectFromHash = (): Project | null => {
  const match = window.location.hash.match(/^#project\/([^/?#]+)$/);
  if (!match) return null;
  try {
    const id = decodeURIComponent(match[1]);
    return PROJECTS.find((project) => project.id === id) ?? null;
  } catch {
    return null;
  }
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    projectFromHash,
  );
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
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
      console.warn(
        "Lenis smooth scroll failed to initialize, falling back to native scroll:",
        e,
      );
    }
  }, []);

  const projectOpen = selectedProject !== null;

  /* Freeze the page behind the case study while it is open. */
  useEffect(() => {
    if (!projectOpen) {
      lenisRef.current?.start();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenisRef.current?.stop();

    return () => {
      document.body.style.overflow = previousOverflow;
      lenisRef.current?.start();
    };
  }, [projectOpen]);

  /* Browser back/forward closes or reopens the case study. */
  useEffect(() => {
    const onPopState = () => setSelectedProject(projectFromHash());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleContactClick = () => {
    const contactElem = document.getElementById("contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExploreClick = () => {
    const workElem = document.getElementById("work");
    if (workElem) {
      workElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleMobileClick = () => {
    const mobileElem = document.getElementById("mobile-apps");
    if (mobileElem) {
      mobileElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    const nextHash = `#project/${encodeURIComponent(project.id)}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState({ projectId: project.id }, "", nextHash);
    }
  };

  const closeProject = () => {
    setSelectedProject(null);
    if (window.location.hash.startsWith("#project/")) {
      window.history.replaceState(null, "", "#work");
    }
  };

  const currentIndex = selectedProject
    ? PROJECTS.findIndex((p) => p.id === selectedProject.id)
    : -1;

  const showProjectAt = (index: number) => {
    const project = PROJECTS[index];
    if (!project) return;
    setSelectedProject(project);
    window.history.replaceState(
      { projectId: project.id },
      "",
      `#project/${encodeURIComponent(project.id)}`,
    );
  };

  const handleNextProject = () => {
    if (currentIndex === -1) return;
    showProjectAt((currentIndex + 1) % PROJECTS.length);
  };

  const handlePrevProject = () => {
    if (currentIndex === -1) return;
    showProjectAt((currentIndex - 1 + PROJECTS.length) % PROJECTS.length);
  };

  const nextProject =
    currentIndex >= 0
      ? PROJECTS[(currentIndex + 1) % PROJECTS.length]
      : PROJECTS[0];

  return (
    <div className="relative min-h-screen bg-[#030303] text-[#f4f1ea] font-sans selection:bg-[#ff7900] selection:text-black">
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Grain Background Texture */}
      <div className="fixed inset-0 noise-overlay pointer-events-none z-20" />

      {/* Initial Boot Loader */}
      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}

      {/* Main Page Layout */}
      <div
        className={`transition-opacity duration-700 ${isLoading ? "opacity-0" : "opacity-100"}`}
        inert={projectOpen || undefined}
        aria-hidden={projectOpen || undefined}
      >
        <Navbar onContactClick={handleContactClick} />

        <main aria-label="Portfolio content" id="main-content">
          <HeroSection
            onExploreClick={handleExploreClick}
            onContactClick={handleContactClick}
            onMobileClick={handleMobileClick}
          />
          <AboutSection />
          <MobileAppsSection />
          <WorkSection onSelectProject={openProject} />
          <SkillsSection />
          {/* <ServicesSection onContactClick={handleContactClick} /> */}
          <ContactSection />
        </main>

        <Footer />
      </div>

      {/* Full-screen case study page with global keyboard + slideshow navigation */}
      {selectedProject && (
        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="fixed inset-0 z-[70] bg-[#050505]"
            />
          }
        >
          <ProjectPage
            project={selectedProject}
            nextProject={nextProject}
            onClose={closeProject}
            onNext={handleNextProject}
            onPrev={handlePrevProject}
            currentIndex={currentIndex}
            totalCount={PROJECTS.length}
          />
        </Suspense>
      )}
    </div>
  );
}
