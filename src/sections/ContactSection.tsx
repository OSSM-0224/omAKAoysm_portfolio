import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Mail,
  Phone,
  MessageCircle,
  Download,
  FileText,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SocialPreviewDock } from "../components/ui/social-preview-dock";
import { CONTACT } from "../data/contact";

export const ContactSection: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [socialPreviewActive, setSocialPreviewActive] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <section
      id="contact"
      className="relative w-full py-28 px-6 sm:px-8 md:px-12 bg-[#070707] border-t border-[#1c1c1c]"
    >
      <AnimatePresence>
        {socialPreviewActive && (
          <motion.div
            key="social-screen-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] pointer-events-none bg-black/75"
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto w-full space-y-20">
        {/* Giant Display Headline */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#ff7900] tracking-wider uppercase">
            <Terminal className="w-3.5 h-3.5" />
            <span>06. TRANSMISSION CHANNEL // GET IN TOUCH</span>
          </div>

          <h2 className="text-[1.625rem] min-[360px]:text-[1.875rem] min-[390px]:text-[2.0625rem] min-[430px]:text-[2.25rem] sm:text-[clamp(2.25rem,5.6vw,5.25rem)] font-black font-display text-white tracking-tighter leading-[0.95]">
            LET&apos;S BUILD SOMETHING <br />
            <span className="text-[#ff7900] text-glow-orange">
              EXTRA
              <span className="sm:hidden">
                <br />
              </span>
              ORDINARY.
            </span>
          </h2>

          <p className="max-w-2xl text-base sm:text-lg text-[#b0aca3] font-sans">
            Have a high-frequency real-time web platform, custom 3D web
            experience, or full-stack software system you need delivered with
            uncompromising precision? Call, message, or email me directly.
          </p>
        </div>

        {/* Direct channels + resume */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Direct contact channels */}
          <div className="lg:col-span-7">
            <div className="flex h-full flex-col rounded-2xl border border-[#1f1f1f] bg-[#0f0f0f] p-6 sm:p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#ff7900] uppercase tracking-wider">
                    DIRECT ACCESS
                  </span>
                  <h3 className="text-xl font-bold font-display text-white">
                    Fast Response Protocol
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8a8780]">
                    Available for freelance inquiries, contract engineering, and
                    high-impact advisory. Typical response time &lt; 12 hours.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Email */}
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-[#262626] bg-[#141414] p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#0e0e0e]">
                        <Mail className="h-4 w-4 text-[#ff7900]" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-mono uppercase tracking-[0.16em] text-[#737069]">
                          Email
                        </span>
                        <a
                          href={`mailto:${CONTACT.email}`}
                          className="block truncate font-mono text-xs text-white transition-colors hover:text-[#ff7900] sm:text-sm"
                        >
                          {CONTACT.email}
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyEmail}
                      className="flex shrink-0 items-center gap-1.5 rounded bg-[#1e1e1e] px-3 py-1.5 text-xs font-mono text-white transition-colors hover:bg-[#ff7900] hover:text-black"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Phone */}
                  <a
                    href={CONTACT.phoneHref}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-[#262626] bg-[#141414] p-4 transition-colors hover:border-[#ff7900]/60 hover:bg-[#171717]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#0e0e0e]">
                        <Phone className="h-4 w-4 text-[#ff7900]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-mono uppercase tracking-[0.16em] text-[#737069]">
                          Phone
                        </span>
                        <span className="block truncate font-mono text-xs text-white sm:text-sm">
                          {CONTACT.phoneDisplay}
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#ff7900] sm:text-xs">
                      Call
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={CONTACT.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 rounded-xl border border-[#262626] bg-[#141414] p-4 transition-colors hover:border-[#25D366]/60 hover:bg-[#171717]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#0e0e0e]">
                        <MessageCircle className="h-4 w-4 text-[#25D366]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-mono uppercase tracking-[0.16em] text-[#737069]">
                          WhatsApp
                        </span>
                        <span className="block truncate font-mono text-xs text-white sm:text-sm">
                          {CONTACT.phoneDisplay}
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#25D366] sm:text-xs">
                      Chat
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </a>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1f1f1f] pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#737069]">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#ff7900]" />
                    {CONTACT.location}
                  </span>
                  <span className="text-[#ff7900]">RESPONSE &lt; 12 HOURS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resume + social dock */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#0f0f0f] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#ff7900]">
                    RESUME / 2026
                  </span>
                  <h3 className="mt-2 text-xl font-bold font-display text-white">
                    Om Mhatre &mdash; Resume 2026
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#8a8780] sm:text-sm">
                    Two-page PDF covering full-stack and mobile engineering work,
                    updated November 2026.
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#141414]">
                  <FileText className="h-5 w-5 text-[#ff7900]" />
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href={CONTACT.resumeHref}
                  download
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff7900] px-4 py-3 text-xs font-mono font-bold tracking-wide text-black shadow-[0_0_22px_rgba(255,121,0,0.3)] transition-colors hover:bg-[#ff8b1a] sm:text-sm"
                >
                  <Download className="h-4 w-4" />
                  DOWNLOAD PDF
                </a>
                <a
                  href={CONTACT.resumeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2b2b2b] bg-[#141414] px-4 py-3 text-xs font-mono font-semibold tracking-wide text-white transition-colors hover:border-[#ff7900]/60 hover:bg-[#181818] sm:text-sm"
                >
                  <ArrowUpRight className="h-4 w-4 text-[#ff7900]" />
                  VIEW IN BROWSER
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f1f1f] bg-[#0f0f0f] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#ff7900]">
                  SOCIAL CHANNELS
                </span>
                <span className="hidden text-[10px] font-mono uppercase tracking-[0.12em] text-[#5b5852] sm:inline">
                  HOVER TO PREVIEW
                </span>
              </div>

              <div className="flex justify-center">
                <div className="group/social-dock relative z-[9999] rounded-2xl">
                  <SocialPreviewDock
                    onPreviewChange={setSocialPreviewActive}
                    email={CONTACT.email}
                    profile={{
                      username: "OSSM-0224",
                      xHandle: "OmMhatre",
                      instagramHandle: "__om_mhatre__24",
                      name: "Om Mhatre",
                      headline: "Software Engineer & Full Stack Developer",
                      location: "India",
                      bio: "Building high-performance web & 3D experiences",
                      links: {
                        github: "https://github.com/OSSM-0224",
                        linkedin:
                          "https://www.linkedin.com/in/om-mhatre-8b819025b/",
                        x: "https://x.com/OmMhatre",
                        instagram: "https://www.instagram.com/__om_mhatre__24/",
                      },
                    }}
                    bannerColors={{
                      linkedin: ["#ff7900", "#ff5500", "#ff4b00"],
                      x: ["#ffb038", "#ff7900", "#ff5500"],
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
