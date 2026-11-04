# OM (OYSM) — Full-Stack & Mobile Developer Portfolio

An interactive portfolio for **Om ("OYSM")**, a full-stack web developer and mobile app engineer. It pairs production case studies with a terminal-meets-3D-studio interface: a live portrait scanner, a draggable smartphone showcase, an inspectable services stack, and a skills matrix tied to shipped work.

The visual system is near-black (`#030303`), neon orange (`#ff7900`), and warm white (`#f4f1ea`). Syne carries display type, Space Grotesk handles UI copy, and JetBrains Mono drives the terminal language.

**At a glance:** 12 case studies · 3 mobile apps · 5 service capabilities.

---

## Experience

### Hero — "Builder of things that ship"

- Cycling terminal role line across full-stack, mobile, real-time, and shipping.
- Magnetic, pointer-lit CTAs with a scanner sweep and a quiet tertiary action.
- `PortraitScanner`: pointer-tracked light and tilt, scan sweep, corner brackets, and click-to-decode ASCII rendering of the portrait.
- `DataRain` canvas background, status rail, and boot sequence leading into the page.

### About — Architect profile

- Scroll-driven word reveal across a short biography.
- Production markers and capability stats beside the narrative.

### Mobile apps — 3D phone showcase

- Procedural titanium phone rendered with Three.js.
- App screenshots mapped directly onto the phone display.
- Drag to rotate 360°, floating idle motion, and a tabbed app switcher.
- Current apps: **CCMS**, **Amrutam Pharma ERP & Tele-Consult**, and **EmergencyApp**.

### Selected work — 12 case studies

- Filter by All, MERN, Mobile, UI/UX, and Real-Time.
- CSS 3D tilt cards with full-screen project inspection modals.
- Modals support previous/next navigation, Escape to close, and arrow-key browsing.

### Skills — "The stack, with receipts."

- A skills-by-project matrix instead of a flat list.
- Hover or focus a skill to see where it shipped; hover a project to see what it runs on.
- Tap to pin on touch devices.

### Services — "Five layers. One builder."

- React Three Fiber capability stack with one machined plate per service.
- Click or tap a plate, or a manifest row, to inspect it; drag to rotate with damped inertia.
- The active layer lifts, lights up, and aligns with a custom shader energy beam.
- A single-open accordion reveals the description, deliverables, and commission CTA.
- Includes a WebGL fallback and a reduced-motion mode.

### Process, contact, footer

- Four-phase delivery process: architecture, interactive design, build, and ship.
- Contact brief panel with copy-email, social links, and a social-preview dock.
- Halftone wordmark footer with a live IST clock and section navigation.

---

## Stack

| Layer | Tools |
| --- | --- |
| Framework | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS 4, custom CSS |
| 3D / WebGL | Three.js, React Three Fiber, Drei |
| Motion | GSAP, Framer Motion, Lenis smooth scroll |
| Icons | Lucide |
| Deployment | Vercel or Cloudflare Pages |

---

## Run locally

Requires **Node.js 20.19+ or 22.12+** (Vite 8).

```bash
npm install
npm run dev
```

The dev server runs at **http://localhost:3000**.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run `tsc --noEmit` for a strict type check |
| `npm run clean` | Remove `dist/` and `server.js` |

---

## Project structure

```text
src/
├─ components/
│  ├─ common/      Navbar, PortraitScanner, ProjectModal, AsciiNumber, cursor
│  ├─ three/       CapabilityCore, Phone3DCanvas
│  └─ ui/          Data rain, halftone footer, social preview dock
├─ data/           projects.ts, screens.ts, services.ts, stackMatrix.ts
├─ hooks/          useReducedMotion.ts
├─ sections/       Hero, About, MobileApps, Work, Skills, Services, Process, Contact, Footer
├─ App.tsx
└─ index.css
public/
├─ Neon Orange Rim-Lit Portrait Cutout.png
├─ screens/        Mobile app screenshots
└─ web_screens/    Web case study images
```

---

## Editing content

### Hero copy and CTAs

`src/sections/HeroSection.tsx` owns the role ticker, paragraph, and button labels. The `ROLES` array drives the cycling line; `STATIC_ROLE` provides the joined fallback. Button destinations are wired in `src/App.tsx`.

### Portrait

Replace `public/Neon Orange Rim-Lit Portrait Cutout.png` with a transparent portrait cutout, keeping the subject bottom-aligned. Either retain the filename or update the `src` in `src/components/common/PortraitScanner.tsx`.

The ASCII view is generated at runtime from the image pixels, so no pre-generated portrait data is required.

### Mobile apps

Update `src/data/screens.ts` and place screenshots in `public/screens/`. `Phone3DCanvas` texture-maps the first screenshot onto the phone display.

### Projects

Add or edit entries in `src/data/projects.ts`. Images live in `public/web_screens/`. Filter categories come from each project's `filterCategories`; the modal navigation follows the array order.

### Skills matrix

`src/data/stackMatrix.ts` is the single source of truth: skills are rows, projects are columns, and each project declares `core` and `used` skills. Edit that file only when changing the matrix.

### Services

Update `src/data/services.ts`. The service order maps directly to the five plates in `CapabilityCore.tsx`; adding a sixth entry requires extending `LAYER_SIZE` and `LAYER_Y` there as well.

### Palette and type

Theme tokens live in the `@theme` block in `src/index.css`. Fonts are loaded from Google Fonts in `index.html` (Syne, Space Grotesk, JetBrains Mono).

---

## Motion and accessibility

- `prefers-reduced-motion` is respected across smooth scrolling, the hero, portrait scanner, services stack, and reveal animations.
- The services core detects WebGL support and falls back to a CSS stack; the phone showcase has a static fallback for low-end devices.
- Interactive surfaces expose keyboard focus rings, ARIA labels, and accordion state via `aria-expanded` / `aria-controls`.
- The project modal supports Escape, arrow keys, and previous/next controls.
- The services viewport uses `touch-action: pan-y` so horizontal drags rotate the stack while vertical swipes still scroll the page.

---

## Build and deploy

```bash
npm run build
npm run preview
```

The static production bundle is written to `dist/`.

### Vercel

1. Import the repository at [vercel.com](https://vercel.com).
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy.

### Cloudflare Pages

1. Open **Workers & Pages** → **Create application** → **Pages**.
2. Connect the repository.
3. Build command: `npm run build`.
4. Build output directory: `dist`.
5. Save and deploy.

No server runtime or environment variables are required for the static site.

---

## Before deploying

- Replace the footer email and LinkedIn placeholders in `src/sections/Footer.tsx`.
- Wire the contact form's `handleSubmit` in `src/sections/ContactSection.tsx` to an email or API endpoint; it currently simulates transmission client-side.
- Confirm project, GitHub, and Play Store URLs in `src/data/projects.ts` and `src/data/screens.ts`.
