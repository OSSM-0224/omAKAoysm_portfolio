import React, { useState, useEffect } from 'react';
import { ArrowUp, Terminal } from 'lucide-react';

const ASCII_OM_LOGO = `
 ██████╗ ███╗   ███╗    ██████╗ ██╗   ██╗███████╗███╗   ███╗
██╔═══██╗████╗ ████║   ██╔═══██╗╚██╗ ██╔╝██╔════╝████╗ ████║
██║   ██║██╔████╔██║   ██║   ██║ ╚████╔╝ ███████╗██╔████╔██║
██║   ██║██║╚██╔╝██║   ██║   ██║  ╚██╔╝  ╚════██║██║╚██╔╝██║
╚██████╔╝██║ ╚═╝ ██║   ╚██████╔╝   ██║   ███████║██║ ╚═╝ ██║
 ╚═════╝ ╚═╝     ╚═╝    ╚═════╝    ╚═╝   ╚══════╝╚═╝     ╚═╝
`;

export const Footer: React.FC = () => {
  const [istTime, setIstTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setIstTime(`${timeString} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full py-20 px-6 sm:px-8 md:px-12 bg-[#030304] border-t border-[#16161c] text-[#8a8780]">
      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Big ASCII OM / OYSM Logo Banner */}
        <div className="overflow-x-auto pb-4 select-none">
          <pre className="font-mono text-[9px] sm:text-xs md:text-sm lg:text-base text-[#ff7900] leading-[1.05] tracking-tight text-glow-orange m-0">
            {ASCII_OM_LOGO}
          </pre>
        </div>

        {/* Middle Footer Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-[#17171d]">
          {/* Status & Clock */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-white">
              <span className="w-2 h-2 rounded-full bg-[#ff7900] shadow-[0_0_8px_#ff7900]" />
              <span>TERMINAL STATUS: ONLINE // OM (OYSM)</span>
            </div>
            <div className="text-xs font-mono text-[#737069]">
              LOCAL TIME: <span className="text-[#d6d2c9] font-bold">{istTime || '12:00:00 IST'}</span> (MUMBAI, IN)
            </div>
          </div>

          {/* Quick Sitemap Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            <a href="#about" className="hover:text-[#ff7900] transition-colors">
              ABOUT
            </a>
            <a href="#mobile-apps" className="hover:text-[#ff7900] transition-colors">
              3D MOBILE APPS
            </a>
            <a href="#work" className="hover:text-[#ff7900] transition-colors">
              WEB WORK
            </a>
            <a href="#skills" className="hover:text-[#ff7900] transition-colors">
              3D TECH SPHERE
            </a>
            <a href="#services" className="hover:text-[#ff7900] transition-colors">
              SERVICES
            </a>
            <a href="#contact" className="hover:text-[#ff7900] transition-colors">
              CONTACT
            </a>
          </div>

          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0e0e12] hover:bg-[#181820] text-xs font-mono text-white border border-[#21212c] hover:border-[#ff7900]/50 transition-colors group"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#ff7900] group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#121216] text-[11px] font-mono text-[#57544e]">
          <div>
            &copy; {new Date().getFullYear()} OM (OYSM). FULL-STACK WEB &amp; MOBILE APP DEVELOPER.
          </div>
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#ff7900]" />
            <span>REACT NATIVE · ANDROID JAVA · MERN · THREE.JS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
