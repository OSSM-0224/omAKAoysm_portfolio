import React, { useState, useEffect } from "react";
import HalftoneWordmarkFooter from "../components/ui/halftone-wordmark-footer";

export const Footer: React.FC = () => {
  const [istTime, setIstTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const t = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date());
      setIstTime(`${t} IST`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <HalftoneWordmarkFooter
      wordmark="oysm"
      crop={-0.2}
      height="700px"
      label="OM (OYSM)"
      meta={`Terminal online // ${istTime || "--:--:-- IST"} Mumbai, IN`}
      legal={`© ${new Date().getFullYear()} OM (OYSM). Full-stack web & mobile app developer.`}
      columns={[
        {
          title: "Navigate",
          links: [
            { label: "About", href: "#about" },
            { label: "Web work", href: "#work" },
            { label: "Services", href: "#services" },
            { label: "Contact", href: "#contact" },
          ],
        },
        {
          title: "Apps",
          links: [
            { label: "3D mobile apps", href: "#mobile-apps" },
            {
              label: "CCMS on Play Store",
              href: "https://play.google.com/store/apps/details?id=com.techvyassa.ccms1&hl=en_IN",
            },
            { label: "Tech sphere", href: "#skills" },
          ],
        },
        {
          title: "Elsewhere",
          links: [
            { label: "GitHub", href: "https://github.com/ommhatre" },
            { label: "LinkedIn", href: "#" },
            { label: "Email", href: "mailto:YOUR_EMAIL@example.com" },
          ],
        },
      ]}
    />
  );
};
