import React, { Suspense, useEffect, useRef, useState } from "react";
import type { Phone3DCanvasProps } from "./Phone3DCanvas";

/**
 * The WebGL phone is heavy, and it lives below the fold. Fetch and mount it a
 * screen early instead of blocking first paint with three.js.
 */
const Phone3DCanvas = React.lazy(() =>
  import("./Phone3DCanvas").then((module) => ({
    default: module.Phone3DCanvas,
  })),
);

const PhonePlaceholder: React.FC<Phone3DCanvasProps> = ({
  screenshotUrl,
  className = "",
  heightClassName = "h-[520px]",
}) => (
  <div
    aria-hidden="true"
    className={`relative w-full ${heightClassName} select-none ${className}`}
  >
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex aspect-[146/294] h-[82%] items-center justify-center rounded-[2.1rem] border border-[#ff7900]/25 bg-[#0a0a0c] p-2 shadow-[0_0_50px_rgba(255,85,0,0.14)]">
        <img
          src={screenshotUrl}
          alt=""
          className="h-full w-full rounded-[1.6rem] object-cover opacity-30 saturate-50"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="h-6 w-6 animate-spin rounded-full border border-[#ff7900]/20 border-t-[#ff7900] motion-reduce:animate-none" />
          <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-[#ffb066]/80">
            Loading 3D object
          </span>
        </div>
      </div>
    </div>
  </div>
);

export const DeferredPhone3D: React.FC<Phone3DCanvasProps> = (props) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || mount) return;

    if (typeof IntersectionObserver === "undefined") {
      setMount(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMount(true);
        observer.disconnect();
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [mount]);

  return (
    <div ref={hostRef} className="w-full">
      {mount ? (
        <Suspense fallback={<PhonePlaceholder {...props} />}>
          <Phone3DCanvas {...props} />
        </Suspense>
      ) : (
        <PhonePlaceholder {...props} />
      )}
    </div>
  );
};
