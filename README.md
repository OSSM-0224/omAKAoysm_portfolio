# OM (OYSM) — Award-Level Web & Mobile Developer Portfolio

A cinematic, award-grade personal portfolio built with React 19, Three.js, GSAP, and Lenis smooth scroll for **OM (also known as "OYSM")**, Full-Stack Web Developer and Mobile App Developer (React Native, Android Java).

Theme: **"Terminal meets 3D studio"** in near-black (`#030303`), signature neon orange (`#ff7900` / `#ff4b00` glow), and warm white (`#f4f1ea`).

---

## 🌟 Core Highlights

1. **Moving ASCII Portrait (Hero Centerpiece)**:
   - High-fidelity neon orange ASCII portrait of OM rendered on an optimized `<canvas>`.
   - **Intro decode**: starts with randomized glyphs and resolves center-out after boot sequence.
   - **Idle shimmer**: continuous vertical scanline brightness wave.
   - **Mouse scatter & spring physics**: cursor proximity scatters characters with spring rebound.
   - **Scroll dissolve**: characters dissolve into rising neon orange particles upon scrolling.
2. **3D Smartphone Showcase (Mobile Apps Section)**:
   - Procedural 3D titanium smartphone with bezel, dynamic punch-hole, glass reflection, and neon rim light.
   - Screenshots mapped as textures on the phone screen with smooth transitions on tab switches.
   - 360-degree interactive drag-to-rotate and floating physics.
   - Showcases 3 production mobile apps:
     - **CCMS (Canteen Coupon Management System)**: Live on Google Play with 100+ downloads.
     - **Amrutam Pharma**: React Native 0.82, Zego Cloud video calling, AES encrypted storage.
     - **EmergencyApp**: Native Android Java, Google Maps live GPS beacon, accelerometer shake trigger.
3. **Signature ASCII Digit System (`<AsciiNumber />`)**:
   - Multi-line Figlet block numerals for project indexes `01`–`11`, stats counters, and loader with character scramble glitch on hover.
4. **Selected Web Work**:
   - 11 production applications in `src/data/projects.ts` (BidArena, CricPulse, Multi-Sport Fixtures, CRM, Dental Clinics, 3D Jersey configurator, etc.) with 3D tilt perspective cards and full architectural inspection modals.
5. **Interactive 3D Tech Sphere**:
   - Draggable rotating Fibonacci word cloud featuring React Native, Android Java, Three.js, Node, Firebase, MongoDB, and Redux.

---

## 🔄 How to Customize the ASCII Portrait

The portrait data is stored in `src/data/portraits.ts`:
```ts
export interface AsciiPortraitData {
  width: number;
  height: number;
  cells: { char: string; r: number; g: number; b: number }[];
}
```

### Converting your existing HTML `<span style="color:rgb(...)">char</span>` output:
We included a turnkey converter utility in `src/utils/portraitConverter.ts`.
You can run this snippet in your browser DevTools or Node:
```js
import { htmlSpansToAsciiData } from './src/utils/portraitConverter';

const htmlString = `...paste your <span style="color:rgb(255,121,0)">@</span> HTML...`;
const asciiJson = htmlSpansToAsciiData(htmlString, 52, 56);
console.log(JSON.stringify(asciiJson));
// Paste directly into src/data/portraits.ts
```

---

## 📱 How to Replace Mobile App Screenshots

1. Drop your PNG/SVG screenshots into `/public/screens/` (e.g. `ccms-1.png`, `amrutam-1.png`, `emergency-1.png`).
2. Update the entries in `src/data/screens.ts`:
```ts
{
  id: 'my-app',
  name: 'App Name',
  screenshots: ['/screens/my-app.png'],
  playStoreUrl: 'https://play.google.com/...',
  ...
}
```
The 3D phone canvas will automatically texture-map the new screenshot onto the phone display.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# Server runs at http://localhost:3000
```

---

## 🌐 Deploying to Vercel & Cloudflare Pages

### Deploying to Vercel
1. Push to your GitHub repository (`github.com/ommhatre/...`).
2. Go to [vercel.com](https://vercel.com) &gt; **Add New Project**.
3. Select your repository.
4. Framework Preset: **Vite**.
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click **Deploy**.

### Deploying to Cloudflare Pages
1. Go to Cloudflare Dashboard &gt; **Workers & Pages** &gt; **Create application** &gt; **Pages**.
2. Connect your Git repository.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Click **Save and Deploy**.
