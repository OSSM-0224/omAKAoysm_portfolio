export interface ServiceOffering {
  id: string;
  num: string;
  short: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
}

export const SERVICES: ServiceOffering[] = [
  {
    id: "mobile",
    num: "01",
    short: "Mobile App Engineering",
    title: "Mobile App Engineering (React Native & Android)",
    subtitle: "From prototype to Google Play Store release",
    description:
      "Production mobile apps built with React Native 0.82 and Native Android Java. Integrated with Zego Cloud encrypted video, offline-first AES storage, Google Maps GPS telemetry, and background services.",
    deliverables: [
      "Cross-platform React Native iOS & Android",
      "Native Java Android services & background daemons",
      "Google Play Store release & AAB signing",
      "Zego Cloud live audio/video calling",
    ],
  },
  {
    id: "web",
    num: "02",
    short: "Full-Stack Web Applications",
    title: "Full-Stack Web Applications (MERN)",
    subtitle: "Layered controller-service-repo architectures",
    description:
      "Bespoke web applications built with React 19, TypeScript, Express, and MongoDB. Engineered for concurrency, rock-solid data consistency, and high-velocity workflows.",
    deliverables: [
      "Custom RESTful backend APIs",
      "Schema normalization & migration scripts",
      "Dual-token JWT session security",
      "Reactive stateful dashboards",
    ],
  },
  {
    id: "realtime",
    num: "03",
    short: "Real-Time Systems",
    title: "Real-Time Systems & WebSocket Engines",
    subtitle: "Sub-50ms synchronized bidirectional streams",
    description:
      "High-frequency live auction suites, collaborative sports match scoring, and multi-user data feeds that update across thousands of concurrent clients without stutter or desync.",
    deliverables: [
      "Socket.io event clusters & rooms",
      "Optimistic UI with rollback protection",
      "Conflict-free state resolution",
      "Exportable PDF certificates & logs",
    ],
  },
  {
    id: "cms",
    num: "04",
    short: "Client Ecosystems & CMS",
    title: "Client Ecosystems & Headless CMS",
    subtitle: "Healthcare, sports, and corporate platforms",
    description:
      "High-conversion digital suites for medical practices, clinics, and non-profits. Sanity Headless CMS content pipelines, doctor consultation intakes, and trust-first designs.",
    deliverables: [
      "Multi-speciality clinic platforms",
      "Sanity Headless CMS schemas",
      "Automated appointment calendars",
      "WCAG AA accessible interfaces",
    ],
  },
  {
    id: "performance",
    num: "05",
    short: "Performance & Technical SEO",
    title: "Performance & Technical SEO Architecture",
    subtitle: "Lighthouse 95+ and programmatic search indexing",
    description:
      "Transforming slow sites into sub-second powerhouses. Eliminating cumulative layout shifts (CLS), optimizing bundle chunks, and deploying structured schema.org data.",
    deliverables: [
      "Core Web Vitals greenline audits",
      "Vite bundle splitting & tree-shaking",
      "Dynamic Open Graph social cards",
      "JSON-LD structured rich data",
    ],
  },
];
