import React, { useEffect, useRef, useState } from "react";

/**
 * CustomCursor — OYSM portfolio edition
 *
 * Theme: #050505 / #ff7900, mono, dev-HUD vibe.
 *
 * States (auto-detected, or force with data attributes):
 *  - default  : glowing dot + elastic ring (stretches in the direction you move) + comet tail + live X/Y readout
 *  - pointer  : ring morphs into a rounded square, 4 corner "target lock" brackets snap in
 *               (a, button, select, summary, [role=button], [data-cursor="pointer"])
 *  - magnetic : same as pointer, but the ring gets pulled toward the element's center ([data-cursor="magnetic"])
 *  - view     : big frosted disc with a label, default "OPEN" ([data-cursor="view"], label via data-cursor-label="PLAY")
 *  - text     : dot becomes an I-beam (inputs, textarea, [data-cursor="text"])
 *  - hide     : cursor disappears ([data-cursor="hide"])
 *  - click    : dot/ring squeeze + ripple pulse on every click
 *
 * Perf: zero React re-renders while moving. Everything runs through refs + one rAF loop.
 * Touch devices and prefers-reduced-motion are handled.
 */

type CursorState = "default" | "pointer" | "text" | "view" | "hide";

const SHOW_COORDS = true; // set false to remove the little X/Y readout
const TAIL_LENGTH = 7;

const SEL_HIDE = '[data-cursor="hide"]';
const SEL_VIEW = '[data-cursor="view"]';
const SEL_TEXT =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="range"]), textarea, [contenteditable="true"], [data-cursor="text"]';
const SEL_POINTER =
  'a, button, select, summary, label[for], [role="button"], [data-cursor="pointer"], [data-cursor="magnetic"]';
const SEL_MAGNETIC = '[data-cursor="magnetic"]';

export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const coordsRef = useRef<HTMLDivElement>(null);
  const coordsTextRef = useRef<HTMLSpanElement>(null);
  const tailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // No custom cursor on touch devices
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
      setEnabled(false);
      return;
    }

    const root = rootRef.current;
    const dotEl = dotRef.current;
    const ringEl = ringRef.current;
    const shapeEl = shapeRef.current;
    const labelEl = labelRef.current;
    const coordsEl = coordsRef.current;
    const coordsTextEl = coordsTextRef.current;
    if (!root || !dotEl || !ringEl || !shapeEl || !labelEl) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.documentElement.classList.add("cc-active");

    const mouse = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    const tails = Array.from({ length: TAIL_LENGTH }, () => ({
      x: -100,
      y: -100,
    }));

    let state: CursorState = "default";
    let magnet: HTMLElement | null = null;
    let pressed = false;
    let pressScale = 1;
    let visible = false;
    let hasMoved = false;
    let lastCoords = "";
    let raf = 0;

    const setState = (next: CursorState) => {
      if (next === state) return;
      state = next;
      root.dataset.state = next;
    };

    const setVisible = (v: boolean) => {
      visible = v;
      root.dataset.visible = v ? "true" : "false";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!hasMoved) {
        // snap everything to the first position so nothing flies in from the corner
        hasMoved = true;
        ring.x = mouse.x;
        ring.y = mouse.y;
        tails.forEach((t) => {
          t.x = mouse.x;
          t.y = mouse.y;
        });
      }
      if (!visible) setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      if (target.closest(SEL_HIDE)) {
        setState("hide");
      } else {
        const viewEl = target.closest<HTMLElement>(SEL_VIEW);
        if (viewEl) {
          labelEl.textContent = viewEl.dataset.cursorLabel ?? "OPEN";
          setState("view");
        } else if (target.closest(SEL_TEXT)) {
          setState("text");
        } else if (target.closest(SEL_POINTER)) {
          setState("pointer");
        } else {
          setState("default");
        }
      }
      magnet = target.closest<HTMLElement>(SEL_MAGNETIC);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pressed = true;
      root.dataset.pressed = "true";

      if (state !== "hide") {
        const rp = document.createElement("div");
        rp.className = "cc-ripple";
        rp.style.left = `${e.clientX}px`;
        rp.style.top = `${e.clientY}px`;
        root.appendChild(rp);
        rp.addEventListener("animationend", () => rp.remove());
      }
    };

    const onUp = () => {
      pressed = false;
      root.dataset.pressed = "false";
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => {
      if (hasMoved) setVisible(true);
    };

    const loop = () => {
      const k = reduced ? 1 : 0.18;

      // magnetic pull
      let tx = mouse.x;
      let ty = mouse.y;
      if (magnet && state === "pointer") {
        const r = magnet.getBoundingClientRect();
        tx += (r.left + r.width / 2 - mouse.x) * 0.3;
        ty += (r.top + r.height / 2 - mouse.y) * 0.3;
      }

      ring.x += (tx - ring.x) * k;
      ring.y += (ty - ring.y) * k;

      // elastic stretch only in the default (circle) state
      const vx = tx - ring.x;
      const vy = ty - ring.y;
      const speed = Math.hypot(vx, vy);
      const stretching = state === "default" && !reduced;
      const stretch = stretching ? Math.min(speed * 0.01, 0.4) : 0;
      const angle = stretching ? (Math.atan2(vy, vx) * 180) / Math.PI : 0;

      pressScale += ((pressed ? 0.8 : 1) - pressScale) * 0.2;

      dotEl.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      ringEl.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      shapeEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${
        (1 + stretch) * pressScale
      }, ${(1 - stretch * 0.6) * pressScale})`;

      // comet tail: each point chases the previous one
      let px = mouse.x;
      let py = mouse.y;
      for (let i = 0; i < TAIL_LENGTH; i++) {
        const t = tails[i];
        const tk = reduced ? 1 : 0.42;
        t.x += (px - t.x) * tk;
        t.y += (py - t.y) * tk;
        px = t.x;
        py = t.y;
        const el = tailRefs.current[i];
        if (el) el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`;
      }

      if (SHOW_COORDS && coordsEl && coordsTextEl) {
        coordsEl.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
        const txt = `X ${String(Math.round(mouse.x)).padStart(4, "0")}  Y ${String(
          Math.round(mouse.y),
        ).padStart(4, "0")}`;
        if (txt !== lastCoords) {
          lastCoords = txt;
          coordsTextEl.textContent = txt;
        }
      }

      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("cc-active");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <style>{CSS}</style>
      <div
        ref={rootRef}
        className="cc-root"
        data-state="default"
        data-visible="false"
        data-pressed="false"
        aria-hidden="true"
      >
        {/* comet tail */}
        {Array.from({ length: TAIL_LENGTH }).map((_, i) => {
          const size = 5.5 - i * 0.55;
          return (
            <div
              key={i}
              ref={(el) => {
                tailRefs.current[i] = el;
              }}
              className="cc-pos cc-tail"
            >
              <i
                className="cc-tail-i"
                style={{
                  width: size,
                  height: size,
                  opacity: 0.55 * (1 - i / TAIL_LENGTH),
                }}
              />
            </div>
          );
        })}

        {/* coordinates readout */}
        {SHOW_COORDS && (
          <div ref={coordsRef} className="cc-pos cc-coords">
            <span ref={coordsTextRef} className="cc-coords-t" />
          </div>
        )}

        {/* ring + brackets + label */}
        <div ref={ringRef} className="cc-pos cc-ring">
          <div ref={shapeRef} className="cc-ring-i">
            <span className="cc-b tl" />
            <span className="cc-b tr" />
            <span className="cc-b bl" />
            <span className="cc-b br" />
          </div>
          <span ref={labelRef} className="cc-label">
            OPEN
          </span>
        </div>

        {/* dot */}
        <div ref={dotRef} className="cc-pos cc-dot">
          <i className="cc-dot-i" />
        </div>
      </div>
    </>
  );
};

const CSS = `
html.cc-active, html.cc-active * { cursor: none !important; }

.cc-root {
  --cc-accent: #ff7900;
  --cc-bg: #050505;
  --cc-ease: cubic-bezier(.22, 1, .36, 1);
  position: fixed; inset: 0; z-index: 140;
  pointer-events: none; overflow: hidden;
  opacity: 0; transition: opacity .25s ease;
}
.cc-root[data-visible="true"] { opacity: 1; }

.cc-pos { position: absolute; top: 0; left: 0; width: 0; height: 0; will-change: transform; }

/* ---------- dot ---------- */
.cc-dot-i {
  position: absolute; left: 0; top: 0;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--cc-accent);
  box-shadow: 0 0 14px rgba(255,121,0,.85), 0 0 2px rgba(255,121,0,1);
  transform: translate(-50%, -50%) scale(1);
  transition: width .25s var(--cc-ease), height .25s var(--cc-ease), border-radius .25s var(--cc-ease),
              opacity .2s, transform .15s var(--cc-ease);
}
.cc-root[data-state="pointer"] .cc-dot-i { width: 4px; height: 4px; }
.cc-root[data-state="view"] .cc-dot-i { opacity: 0; }
.cc-root[data-state="text"] .cc-dot-i { width: 2px; height: 24px; border-radius: 2px; }
.cc-root[data-pressed="true"] .cc-dot-i { transform: translate(-50%, -50%) scale(.5); }

/* ---------- ring ---------- */
.cc-ring-i {
  position: absolute; left: 0; top: 0;
  width: 34px; height: 34px; border-radius: 50%;
  border: 1px solid rgba(255,121,0,.45);
  background: rgba(255,121,0,0);
  transform: translate(-50%, -50%);
  transition: width .35s var(--cc-ease), height .35s var(--cc-ease), border-radius .35s var(--cc-ease),
              border-color .25s, background-color .25s, opacity .2s;
}
.cc-root[data-state="pointer"] .cc-ring-i {
  width: 54px; height: 54px; border-radius: 14px;
  border-color: rgba(255,121,0,.18);
  background: rgba(255,121,0,.08);
}
.cc-root[data-state="view"] .cc-ring-i {
  width: 88px; height: 88px;
  border-color: var(--cc-accent);
  background: rgba(5,5,5,.78);
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  box-shadow: 0 0 40px rgba(255,121,0,.25), inset 0 0 20px rgba(255,121,0,.08);
}
.cc-root[data-state="text"] .cc-ring-i { width: 10px; height: 10px; opacity: 0; }

/* ---------- target-lock brackets ---------- */
.cc-b {
  position: absolute; width: 10px; height: 10px;
  border: 2px solid var(--cc-accent); opacity: 0;
  transition: opacity .2s, transform .35s var(--cc-ease);
}
.cc-b.tl { top: -1px;    left: -1px;  border-right: 0; border-bottom: 0; border-top-left-radius: 7px;     transform: translate(8px, 8px); }
.cc-b.tr { top: -1px;    right: -1px; border-left: 0;  border-bottom: 0; border-top-right-radius: 7px;    transform: translate(-8px, 8px); }
.cc-b.bl { bottom: -1px; left: -1px;  border-right: 0; border-top: 0;    border-bottom-left-radius: 7px;  transform: translate(8px, -8px); }
.cc-b.br { bottom: -1px; right: -1px; border-left: 0;  border-top: 0;    border-bottom-right-radius: 7px; transform: translate(-8px, -8px); }
.cc-root[data-state="pointer"] .cc-b { opacity: 1; transform: none; }

/* ---------- label (view state) ---------- */
.cc-label {
  position: absolute; left: 0; top: 0;
  transform: translate(-50%, -50%) scale(.6);
  font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: .22em; padding-left: .22em;
  text-transform: uppercase; white-space: nowrap;
  color: var(--cc-accent); opacity: 0;
  transition: opacity .2s, transform .35s var(--cc-ease);
}
.cc-root[data-state="view"] .cc-label { opacity: 1; transform: translate(-50%, -50%) scale(1); }

/* ---------- tail ---------- */
.cc-tail { transition: opacity .2s; }
.cc-tail-i {
  position: absolute; left: 0; top: 0; border-radius: 50%;
  background: var(--cc-accent); transform: translate(-50%, -50%);
}
.cc-root[data-state="view"] .cc-tail,
.cc-root[data-state="text"] .cc-tail { opacity: 0; }

/* ---------- coords ---------- */
.cc-coords { opacity: 0; transition: opacity .2s; }
.cc-coords-t {
  position: absolute; left: 30px; top: 26px;
  font: 500 9px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: .12em; white-space: pre;
  color: rgba(255,121,0,.55);
}
.cc-root[data-state="default"] .cc-coords { opacity: 1; }

/* ---------- hide ---------- */
.cc-root[data-state="hide"] .cc-dot-i,
.cc-root[data-state="hide"] .cc-ring-i,
.cc-root[data-state="hide"] .cc-tail,
.cc-root[data-state="hide"] .cc-coords { opacity: 0; }

/* ---------- click ripple ---------- */
.cc-ripple {
  position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px;
  border: 1.5px solid var(--cc-accent); border-radius: 50%;
  animation: cc-ripple .6s var(--cc-ease) forwards;
}
@keyframes cc-ripple {
  from { transform: scale(.6); opacity: .9; }
  to   { transform: scale(4.5); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .cc-root * { transition-duration: .01ms !important; animation: none !important; }
}
`;
