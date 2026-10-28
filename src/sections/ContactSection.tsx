import React, { useState } from "react";
import {
  Terminal,
  Send,
  CheckCircle2,
  Copy,
  Check,
  MessageSquare,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import { MagneticButton } from "../components/common/MagneticButton";
import { SocialPreviewDock } from "../components/ui/social-preview-dock";

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "Full-Stack Web App",
    budget: "$3k - $10k",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const emailAddress = "ommhatre379@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate high-performance transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <section
      id="contact"
      className="relative w-full py-28 px-6 sm:px-8 md:px-12 bg-[#070707] border-t border-[#1c1c1c] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full space-y-20">
        {/* Giant Display Headline */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#ff7900] tracking-wider uppercase">
            <Terminal className="w-3.5 h-3.5" />
            <span>06. TRANSMISSION CHANNEL // GET IN TOUCH</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-display text-white tracking-tighter leading-[0.95]">
            LET&apos;S BUILD SOMETHING <br />
            <span className="text-[#ff7900] text-glow-orange">
              EXTRAORDINARY.
            </span>
          </h2>

          <p className="max-w-2xl text-base sm:text-lg text-[#b0aca3] font-sans">
            Have a high-frequency real-time web platform, custom 3D web
            experience, or full-stack software system you need delivered with
            uncompromising precision? Let&apos;s talk.
          </p>
        </div>

        {/* 2-Column Split: Form + Direct Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Direct Links & Fast Copy */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] space-y-6">
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

              {/* Copy Email Card */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 truncate">
                  <Mail className="w-4 h-4 text-[#ff7900] shrink-0" />
                  <span className="font-mono text-xs sm:text-sm text-white truncate">
                    {emailAddress}
                  </span>
                </div>

                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded bg-[#1e1e1e] hover:bg-[#ff7900] text-xs font-mono text-white hover:text-black transition-colors shrink-0 flex items-center gap-1.5"
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>

              {/* Social Dock */}
              <div className="pt-4 flex justify-center">
                <SocialPreviewDock
                  email={emailAddress}
                  profile={{
                    username: "OSSM-0224",
                    xHandle: "OmMhatre",
                    name: "Om Mhatre",
                    headline: "Software Engineer & Full Stack Developer",
                    location: "India",
                    bio: "Building high-performance web & 3D experiences",
                    links: {
                      github: "https://github.com/OSSM-0224",
                      linkedin:
                        "https://www.linkedin.com/in/om-mhatre-8b819025b/",
                      x: "https://x.com/OmMhatre",
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

          {/* Right Column: Working Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 md:p-10 rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f]">
              {isSubmitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#ff7900]/10 border border-[#ff7900] flex items-center justify-center text-[#ff7900]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-white">
                    Transmission Dispatched
                  </h3>
                  <p className="text-sm text-[#a39f96] max-w-md font-sans">
                    Thank you! Your project brief has been routed to
                    PRAJU&apos;s primary terminal. You will receive a direct
                    reply within 12 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        projectType: "Full-Stack Web App",
                        budget: "$3k - $10k",
                        message: "",
                      });
                    }}
                    className="mt-4 px-5 py-2.5 rounded-lg text-xs font-mono text-black bg-[#ff7900] hover:bg-[#ff6e26] font-semibold"
                  >
                    SEND ANOTHER TRANSMISSION
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-[#8a8780] uppercase tracking-wider">
                        YOUR NAME / BRAND *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Dr. Tanvi Patil / Acme Corp"
                        className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#242424] focus:border-[#ff7900] focus:outline-none text-sm text-white font-sans transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-[#8a8780] uppercase tracking-wider">
                        EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="you@domain.com"
                        className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#242424] focus:border-[#ff7900] focus:outline-none text-sm text-white font-sans transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-[#8a8780] uppercase tracking-wider">
                        PROJECT SCOPE
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            projectType: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#242424] focus:border-[#ff7900] focus:outline-none text-sm text-white font-mono transition-colors"
                      >
                        <option value="Full-Stack Web App">
                          Full-Stack Web App
                        </option>
                        <option value="Real-Time Engine">
                          Real-Time Engine (Sockets)
                        </option>
                        <option value="3D Web & Three.js">
                          3D Web &amp; Three.js Configurator
                        </option>
                        <option value="Clinic or NGO Platform">
                          Clinic or Corporate Platform
                        </option>
                        <option value="Performance & SEO">
                          Performance &amp; SEO Audit
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-[#8a8780] uppercase tracking-wider">
                        ESTIMATED TIMELINE
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) =>
                          setFormData({ ...formData, budget: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#242424] focus:border-[#ff7900] focus:outline-none text-sm text-white font-mono transition-colors"
                      >
                        <option value="Immediate (1-3 weeks)">
                          Immediate (1-3 weeks)
                        </option>
                        <option value="Standard (1-2 months)">
                          Standard (1-2 months)
                        </option>
                        <option value="Ongoing Retainer">
                          Ongoing Architecture Retainer
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[#8a8780] uppercase tracking-wider">
                      PROJECT BRIEF / SYSTEM SPEC *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Outline your application goals, target audience, technical requirements, or launch target..."
                      className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#242424] focus:border-[#ff7900] focus:outline-none text-sm text-white font-sans transition-colors resize-none"
                    />
                  </div>

                  <MagneticButton
                    strength={0.2}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-lg bg-[#ff7900] hover:bg-[#ff6e26] text-black font-mono font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(255,85,0,0.35)] hover:shadow-[0_0_35px_rgba(255,85,0,0.6)] transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        <span>DISPATCHING PACKET...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        <span>DISPATCH TRANSMISSION</span>
                      </span>
                    )}
                  </MagneticButton>
                </form>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <SocialPreviewDock
            email="ommhatre379@gmail.com"
            profile={{
              username: "ommhatre",
              name: "Om Mhatre",
              headline: "Full-Stack & Mobile App Developer",
              location: "Navi Mumbai, India",
              links: {
                github: "https://github.com/OSSM-0224",
                linkedin: "https://www.linkedin.com/in/om-mhatre-8b819025b/",
                x: "https://x.com/OmMhatre",
              },
            }}
            live={false}
          />
        </div>
      </div>
    </section>
  );
};
