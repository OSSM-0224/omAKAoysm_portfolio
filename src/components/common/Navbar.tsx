import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Smartphone } from 'lucide-react';

interface NavbarProps {
  onContactClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onContactClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#040405]/90 backdrop-blur-md border-b border-[#1c1c22] py-3.5 shadow-2xl'
            : 'bg-transparent py-5 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element Brand wordmark */}
          <a
            href="#hero"
            className="text-xl md:text-2xl font-bold tracking-tight font-display text-white whitespace-nowrap shrink-0 flex items-center gap-2 group"
          >
            <span className="text-[#ff7900] font-mono">&gt;</span>
            <span className="tracking-tighter">OM</span>
            <span className="text-xs font-mono font-medium text-[#ff9029] bg-[#1a1208] px-1.5 py-0.5 rounded border border-[#ff7900]/30 opacity-90 group-hover:opacity-100 transition-opacity">
              OYSM
            </span>
          </a>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#c5c2bb]">
            <a
              href="#about"
              className="hover:text-[#ff7900] transition-colors whitespace-nowrap shrink-0"
            >
              About
            </a>
            <a
              href="#mobile-apps"
              className="hover:text-[#ff7900] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-white font-semibold"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#ff7900]" />
              <span>3D Mobile Apps</span>
            </a>
            <a
              href="#work"
              className="hover:text-[#ff7900] transition-colors whitespace-nowrap shrink-0"
            >
              Selected Work
            </a>
            <a
              href="#skills"
              className="hover:text-[#ff7900] transition-colors whitespace-nowrap shrink-0"
            >
              Skills &amp; 3D
            </a>
            <a
              href="#services"
              className="hover:text-[#ff7900] transition-colors whitespace-nowrap shrink-0"
            >
              Services
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={onContactClick}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium tracking-wide text-black bg-[#ff7900] hover:bg-[#ff9029] rounded-md transition-all shadow-[0_0_20px_rgba(255,121,0,0.35)] hover:shadow-[0_0_25px_rgba(255,121,0,0.6)] whitespace-nowrap shrink-0 active:scale-95"
            >
              <span>GET IN TOUCH</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-[#ff7900] transition-colors rounded-lg bg-[#141418] border border-[#262630]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#040405]/95 backdrop-blur-xl md:hidden pt-24 px-8 pb-12 flex flex-col justify-between border-b border-[#262630]">
          <nav className="flex flex-col gap-6 text-xl font-display font-medium">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-[#ff7900] transition-colors flex items-center justify-between"
            >
              <span>About</span>
              <span className="font-mono text-xs text-[#ff7900]">01</span>
            </a>
            <a
              href="#mobile-apps"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-[#ff7900] transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#ff7900]" />
                <span>3D Mobile Apps</span>
              </span>
              <span className="font-mono text-xs text-[#ff7900]">02</span>
            </a>
            <a
              href="#work"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-[#ff7900] transition-colors flex items-center justify-between"
            >
              <span>Selected Web Work</span>
              <span className="font-mono text-xs text-[#ff7900]">03</span>
            </a>
            <a
              href="#skills"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-[#ff7900] transition-colors flex items-center justify-between"
            >
              <span>Skills &amp; 3D Sphere</span>
              <span className="font-mono text-xs text-[#ff7900]">04</span>
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-[#ff7900] transition-colors flex items-center justify-between"
            >
              <span>Services</span>
              <span className="font-mono text-xs text-[#ff7900]">05</span>
            </a>
          </nav>

          <div className="pt-8 border-t border-[#1c1c24] flex flex-col gap-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onContactClick();
              }}
              className="w-full py-3 text-center text-sm font-mono font-medium tracking-wider text-black bg-[#ff7900] rounded-md shadow-[0_0_20px_rgba(255,121,0,0.3)]"
            >
              COMMISSION A PROJECT
            </button>
            <div className="flex justify-between items-center text-xs font-mono text-[#8a8780]">
              <span>NAVI MUMBAI / IST</span>
              <span className="text-[#ff7900]">AVAILABLE FOR COMMISSIONS</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
