// Single source of truth for the Skills section.
// Edit this file only: rows = skills, columns = things you shipped.
//
// core = central to the project (drawn as "@")
// used = present in the project (drawn as "+")
//
// Cells marked "confirm" are my best reading of your project notes, not
// something you told me outright. Fix them if they're wrong.

export interface Skill {
  id: string;
  name: string;
  group: string;
}

export interface Project {
  id: string;
  /** Short label used on the vertical column header. Keep under ~13 chars. */
  short: string;
  name: string;
  kind: "mobile" | "web";
  blurb: string;
  href?: string;
  core: string[];
  used: string[];
}

export const GROUPS = [
  "mobile",
  "frontend",
  "backend",
  "data",
  "shipping",
] as const;

export const SKILLS: Skill[] = [
  { id: "react-native", name: "React Native", group: "mobile" },
  { id: "android", name: "Android (Java)", group: "mobile" },
  { id: "zego", name: "Zego Cloud calls", group: "mobile" },
  { id: "maps", name: "Google Maps SDK", group: "mobile" },

  { id: "react", name: "React", group: "frontend" },
  { id: "ts", name: "TypeScript", group: "frontend" },
  { id: "tailwind", name: "Tailwind CSS", group: "frontend" },
  { id: "three", name: "Three.js / R3F", group: "frontend" },
  { id: "gsap", name: "GSAP", group: "frontend" },
  { id: "vite", name: "Vite", group: "frontend" },
  { id: "redux", name: "Redux Toolkit", group: "frontend" },

  { id: "node", name: "Node / Express", group: "backend" },
  { id: "socket", name: "Socket.io", group: "backend" },

  { id: "mongo", name: "MongoDB", group: "data" },
  { id: "firebase", name: "Firebase", group: "data" },
  { id: "sanity", name: "Sanity CMS", group: "data" },

  { id: "vercel", name: "Vercel / Render", group: "shipping" },
  { id: "cloudflare", name: "Cloudflare Pages", group: "shipping" },
];

export const PROJECTS: Project[] = [
  {
    id: "ccms",
    short: "CCMS",
    name: "CCMS (Canteen Coupon Management)",
    kind: "mobile",
    blurb: "Live on Google Play with 100+ downloads. Built at Tech Vyassa.",
    href: "https://play.google.com/store/apps/details?id=com.techvyassa.ccms1&hl=en_IN",
    // confirm: I don't know CCMS's stack. Only React Native is assumed.
    core: ["react-native"],
    used: [],
  },
  {
    id: "amrutam",
    short: "Amrutam",
    name: "Amrutam Pharma",
    kind: "mobile",
    blurb:
      "Pharma orders, invoices and Zego video calls, with AES-encrypted local storage.",
    href: "https://github.com/OSSM-0224/amrutam_pharma",
    core: ["react-native", "zego"],
    used: ["redux"],
  },
  {
    id: "emergency",
    short: "Emergency",
    name: "EmergencyApp",
    kind: "mobile",
    blurb:
      "One-tap SOS, live GPS tracking and offline first aid. Native Android.",
    href: "https://github.com/ommhatre/EmergencyApp",
    core: ["android", "firebase", "maps"],
    used: [],
  },
  {
    id: "bidarena",
    short: "BidArena",
    name: "BidArena",
    kind: "web",
    blurb: "Real-time auction platform, built in a 24-hour hackathon.",
    core: ["react", "node", "mongo", "socket"],
    used: [],
  },
  {
    id: "cricpulse",
    short: "CricPulse",
    name: "CricPulse (BoundaryLine)",
    kind: "web",
    blurb: "Cricket scoring with real-time score sync. A collaborative build.",
    core: ["socket"],
    used: ["react", "node"], // confirm
  },
  {
    id: "fixtures",
    short: "Fixtures",
    name: "Multi-sport Fixtures",
    kind: "web",
    blurb: "Live scoring and fixtures for DSO Navi Mumbai.",
    core: ["socket"],
    used: ["react", "node"], // confirm
  },
  {
    id: "crm",
    short: "CRM",
    name: "Lead Management CRM",
    kind: "web",
    blurb: "Full-stack CRM with a layered architecture.",
    core: [],
    used: ["react", "node"], // confirm
  },
  {
    id: "childdream",
    short: "Child Dream",
    name: "Child Dream's Social Foundation",
    kind: "web",
    blurb: "Full redesign of an NGO site, built around trust and donations.",
    core: [],
    used: ["react", "tailwind"], // confirm
  },
  {
    id: "unique",
    short: "Unique Dental",
    name: "Unique Dental Care",
    kind: "web",
    blurb: "Premium clinic site on Sanity CMS, with prerendering and SEO work.",
    href: "https://uniquedentalcareclinic.com",
    core: ["react", "vite", "sanity", "cloudflare"],
    used: [],
  },
  {
    id: "fixora",
    short: "FIXORA",
    name: "FIXORA",
    kind: "web",
    blurb: "Premium dental clinic website.",
    core: [],
    used: ["react", "tailwind"], // confirm
  },
  {
    id: "ortho",
    short: "Ortho clinic",
    name: "Orthodontic clinic site",
    kind: "web",
    blurb: "Treatment showcase for a two-doctor orthodontic practice.",
    core: [],
    used: ["react", "tailwind"], // confirm
  },
  {
    id: "oss",
    short: "Om Sai Sports",
    name: "Om Sai Sports",
    kind: "web",
    blurb: "A 3D website for a jersey brand.",
    core: ["three"],
    used: ["react", "tailwind"], // confirm
  },
  {
    id: "society",
    short: "Society app",
    name: "Society Management App",
    kind: "web",
    blurb:
      "Residents, flats, vehicles and an admin panel, in several languages.",
    core: [],
    used: ["react", "tailwind"], // confirm
  },
  {
    id: "auth",
    short: "Auth app",
    name: "Auth & Signup App",
    kind: "web",
    blurb:
      "React frontend on Vercel, Express API on Render, MongoDB underneath.",
    core: ["react", "vite", "node", "mongo", "vercel"],
    used: [],
  },
  {
    id: "portfolio",
    short: "This site",
    name: "This portfolio",
    kind: "web",
    blurb: "The page you're on.",
    core: ["react", "ts", "tailwind", "three", "gsap", "vite"],
    used: [],
  },
];

/** Things I know, but that no project on this map shows yet. */
export const TOOLBOX = [
  "Python",
  "C++",
  "SQL",
  "Docker",
  "Redis",
  "AWS ECS",
  "Flutter",
  "Figma",
  "CorelDRAW",
];

/** 0 = not used, 1 = used, 2 = core. */
export function levelOf(skillId: string, projectId: string): 0 | 1 | 2 {
  const p = PROJECTS.find((x) => x.id === projectId);
  if (!p) return 0;
  if (p.core.includes(skillId)) return 2;
  if (p.used.includes(skillId)) return 1;
  return 0;
}
