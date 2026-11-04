export type ProjectCategory = 'MERN' | 'Mobile' | 'UI/UX' | 'Real-Time' | 'Client';
export type ProjectStatus = 'Live' | 'In Development';

export interface Project {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  category: string;
  filterCategories: ProjectCategory[];
  role: string;
  duration: string;
  description: string;
  longDescription: string;
  tags: string[];
  features: string[];
  metrics: string[];
  liveUrl: string;
  githubUrl: string;
  accentColor: string;
  image?: string;
  status?: ProjectStatus;
  playStoreUrl?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'bid-arena',
    index: '01',
    title: 'BidArena',
    subtitle: 'Real-Time MERN Auction Platform',
    category: 'MERN & Real-Time',
    filterCategories: ['MERN', 'Real-Time'],
    role: 'Lead Full-Stack Developer',
    duration: '24-Hour Hackathon Winner',
    description: 'High-frequency live auction engine built with MongoDB, Express, React, and Socket.io with sub-50ms synchronized bidding.',
    longDescription: 'BidArena was architected and deployed during a high-stakes 24-hour hackathon. The system synchronizes high-frequency bid updates across thousands of concurrent clients without stale state locks or race conditions. Features a custom distributed countdown timer, real-time bid validation engine, instant bidder notifications, and auto-settlement wallet escrow logic.',
    tags: ['React', 'Node.js', 'Express', 'Socket.io', 'MongoDB', 'TailwindCSS'],
    features: [
      'Sub-50ms bidirectional bid synchronization using WebSockets',
      'Optimistic UI state updates with server-authoritative collision resolution',
      'Anti-sniping auto-extension timer logic',
      'Comprehensive auction room dashboard with live activity stream'
    ],
    metrics: ['24-Hour Hackathon Build', '<50ms Bid Latency', '100% Zero-Loss Bid Sync'],
    liveUrl: 'https://bidarena.demo.dev',
    githubUrl: 'https://github.com/ommhatre/bidarena-auction-engine',
    accentColor: '#ff7900',
    image: '/web_screens/bidarena_landingpage.png',
  },
  {
    id: 'ccms-mobile',
    index: '02',
    title: 'CCMS (Canteen Coupon System)',
    subtitle: 'Production Mobile App on Google Play',
    category: 'Mobile & Full-Stack',
    filterCategories: ['Mobile', 'MERN'],
    role: 'Mobile App Engineer (Tech Vyassa)',
    duration: 'Production Live on Play Store',
    description: 'Complete production mobile app with 100+ downloads on Google Play. Features dynamic QR token issuance, offline balance caching, and instant cafeteria dispensing.',
    longDescription: 'Developed during tenure at Tech Vyassa and shipped to the Google Play Store. Replaces paper lunch coupons across multi-building cafeterias with cryptographic one-time QR tokens, merchant barcode scanners, automated wallet reconciliation, and offline transaction queues.',
    tags: ['React Native', 'Android', 'Redux Toolkit', 'Node.js', 'Express', 'QR Engine'],
    features: [
      'Live on Google Play with 100+ verified production users',
      'Anti-reuse cryptographic QR coupon generator',
      'Background offline cache synchronization',
      'Merchant cashier scanning interface with sub-100ms verification'
    ],
    metrics: ['100+ Play Store Downloads', 'Zero Paper Vouchers', 'Sub-100ms Scan Speed'],
    liveUrl: 'https://play.google.com/store/apps/details?id=com.techvyassa.ccms1&hl=en_IN',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.techvyassa.ccms1&hl=en_IN',
    githubUrl: 'https://github.com/ommhatre',
    accentColor: '#ff7900',
  },
  {
    id: 'amrutam-pharma-app',
    index: '03',
    title: 'Amrutam Pharma ERP & Tele-Health',
    subtitle: 'React Native 0.82 Suite with Zego Cloud Video',
    category: 'Mobile & Architecture',
    filterCategories: ['Mobile', 'UI/UX'],
    role: 'Mobile Architect & Frontend Lead',
    duration: 'Production Pilot',
    description: 'Production React Native 0.82 pharmaceutical suite with encrypted Zego Cloud video consultations, hardware AES-256 storage, and real-time dispatch tracking.',
    longDescription: 'Engineered for pharmaceutical distribution and tele-health. Combines encrypted doctor-patient video consultations via Zego Cloud UIKit, local hardware-backed AES-256 encrypted storage, order milestone tracking, and Formik + Yup verified prescription forms.',
    tags: ['React Native 0.82', 'TypeScript', 'Redux Toolkit', 'Zego Cloud', 'Encrypted Storage'],
    features: [
      'Encrypted live video/audio calling via Zego Cloud UIKit',
      'Hardware-level AES-256 encrypted local patient storage',
      'Multi-stage prescription dispatch tracking pipeline',
      'Offline-first Redux Toolkit sync with automatic conflict recovery'
    ],
    metrics: ['RN 0.82 Engine', 'AES-256 Encrypted', '100% Offline-Resilient'],
    liveUrl: 'https://github.com/OSSM-0224/amrutam_pharma',
    githubUrl: 'https://github.com/OSSM-0224/amrutam_pharma',
    accentColor: '#ff5500',
  },
  {
    id: 'cricpulse',
    index: '04',
    title: 'CricPulse (BoundaryLine)',
    subtitle: 'Collaborative Live Cricket Scoring App',
    category: 'Real-Time & Full-Stack',
    filterCategories: ['Real-Time', 'MERN'],
    role: 'Full-Stack Architect',
    duration: 'Production Web App',
    description: 'Real-time ball-by-ball collaborative cricket scoring system with instant cloud synchronization and dynamic wagon wheel analytics.',
    longDescription: 'CricPulse enables scorers, umpires, and tournament coordinators to concurrently track multi-innings matches with instant offline cache and WebSocket sync. Broadcasts live commentary, ball telemetry, run-rate calculators, Duckworth-Lewis projections, and dynamic player leaderboards to thousands of fans.',
    tags: ['React', 'TypeScript', 'Node.js', 'Socket.io', 'PostgreSQL', 'TailwindCSS'],
    features: [
      'Ball-by-ball scoring interface with undo/redo transaction safety',
      'Live spectator broadcast with zero-refresh scorecard updates',
      'Dynamic wagon wheel and run-rate predictive graphs',
      'Exportable PDF tournament summary and match certificates'
    ],
    metrics: ['10,000+ Overs Scored', 'Zero Desync in 100+ Matches', 'Instant Offline Reconnect'],
    liveUrl: 'https://cricpulse.app',
    githubUrl: 'https://github.com/ommhatre/cricpulse-boundaryline',
    accentColor: '#ff7900',
    image: '/web_screens/cricplus_landingpage.png',
  },
  {
    id: 'emergency-app',
    index: '05',
    title: 'EmergencyApp — Safety & SOS',
    subtitle: 'Native Android Java App with Live Google Maps Beacon',
    category: 'Mobile & Native Android',
    filterCategories: ['Mobile', 'Real-Time'],
    role: 'Android & Firebase Engineer',
    duration: 'Production System',
    description: 'Native Android Java safety app with one-tap SOS, live Google Maps GPS tracking, pocket shake detection trigger, and 10 offline first-aid modules.',
    longDescription: 'Engineered in native Android Java with Firebase realtime infrastructure. Provides one-tap emergency panic dispatch, broadcast SMS to 4 contacts with live Google Maps coordinate links, background service daemon that survives app kill, and accelerometer shake triggers.',
    tags: ['Java', 'Android SDK', 'Firebase Realtime', 'Google Maps SDK', 'SensorManager'],
    features: [
      'One-tap SOS dispatch with instant Google Maps coordinate SMS broadcast',
      'Hardware accelerometer shake trigger (activates inside pockets)',
      'Foreground service & BootReceiver daemon to prevent OS kill',
      '10 offline first-aid guides with zero internet reliance'
    ],
    metrics: ['Sub-second SOS Trigger', '100% Offline First-Aid', 'Native Java 60FPS'],
    liveUrl: 'https://github.com/ommhatre/EmergencyApp',
    githubUrl: 'https://github.com/ommhatre/EmergencyApp',
    accentColor: '#ff3b00',
  },
  {
    id: 'multi-sport-fixtures',
    index: '06',
    title: 'Multi-Sport Fixtures Platform',
    subtitle: 'Official Tournament Management for DSO Navi Mumbai',
    category: 'MERN & Enterprise',
    filterCategories: ['MERN', 'Client'],
    role: 'Sole Full-Stack Engineer',
    duration: 'Client Contract',
    description: 'Centralized live scoring, fixture brackets, venue allocation, and team registration system engineered for DSO Navi Mumbai.',
    longDescription: 'Designed for district sports authorities managing simultaneous inter-school and inter-collegiate tournaments. Supports football, basketball, kabaddi, volleyball, and athletics with automated bracket seeding, referee assignments, field scheduling, and government-standard results exports. Fully built in Next.js 16 with a pure fixture engine, RBAC, and cookie-based auth.',
    tags: ['Next.js', 'TypeScript', 'MongoDB', 'TailwindCSS v4', 'JWT', 'Zod'],
    features: [
      'Automated single & double elimination bracket generation',
      'Multi-court simultaneous fixture scheduling with clash prevention',
      'District Sports Office administrative access control',
      'Public fan portal with live medal tally and school standings',
      'Live scorer panel with role-based permissions'
    ],
    metrics: ['120+ Participating Schools', '8 Sporting Disciplines', 'Ready to Run Locally'],
    liveUrl: '#',
    githubUrl: 'https://github.com/OSSM-0224/DSO-Navi-Mumbai-Fixtures',
    accentColor: '#ff7900',
    image: '/web_screens/dso_landingpage.png',
  },
  {
    id: 'lead-management-crm',
    index: '07',
    title: 'Lead Management CRM',
    subtitle: 'Enterprise Sales Pipeline & Layered Architecture',
    category: 'MERN Full-Stack',
    filterCategories: ['MERN'],
    role: 'Full-Stack Developer',
    duration: 'Internal Enterprise Tool',
    description: 'Full-stack CRM engineered with Clean Layered Architecture, automated stage pipelines, activity logging, and conversion analytics.',
    longDescription: 'Engineered with strict separation of concerns (controller-service-repository pattern) to provide lightning-fast customer onboarding, automated lead routing algorithms, interaction histories, deal Kanban boards, and sales forecasting analytics.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT Auth', 'REST APIs'],
    features: [
      'Interactive Kanban drag-and-drop lead stage progression',
      'Role-based access control (Admin, Sales Manager, SDR, Agent)',
      'Automated follow-up scheduling and notification reminders',
      'Comprehensive conversion funnel telemetry and exportable reports'
    ],
    metrics: ['5x Faster Lead Processing', 'Clean Layered Architecture', '99.9% Uptime SLA'],
    liveUrl: 'https://lead-crm-layered.dev',
    githubUrl: 'https://github.com/ommhatre/lead-management-crm-core',
    accentColor: '#ff7900',
    image: '/web_screens/heros_landingpage.png',
  },
  {
    id: 'child-dreams-foundation',
    index: '08',
    title: "Child Dream's Social Foundation",
    subtitle: 'NGO Digital Transformation & Donation Trust Portal',
    category: 'UI/UX & Creative',
    filterCategories: ['UI/UX', 'Client'],
    role: 'Frontend & UI/UX Specialist',
    duration: 'Pro Bono / In Development',
    description: 'Ongoing website redesign focused on donor credibility, transparent impact reports, recurring micro-donations, and SEO reach.',
    longDescription: 'Currently in development: the outdated NGO web presence is being rebuilt into an empathetic, high-converting digital platform. Planned highlights include transparent spending disclosures, photo journals of field missions, automated 80G tax receipt generation, and seamless donation gateways.',
    tags: ['React', 'TailwindCSS', 'Razorpay', 'Vite', 'Framer Motion', 'SEO'],
    features: [
      'Transparent campaign financial breakdown and impact counter',
      'One-click automated 80G tax receipt PDF generation',
      'Optimized mobile donation flow with UPI and card integration',
      'Accessibility-first layout compliant with WCAG AA guidelines'
    ],
    metrics: ['In Development', 'Donation Flow In Progress', 'NGO Concept'],
    liveUrl: '#',
    githubUrl: 'https://github.com/OSSM-0224/Child-Dreams-Social-Foundation',
    accentColor: '#ff7900',
    status: 'In Development',
  },
  {
    id: 'unique-dental-care',
    index: '09',
    title: 'Unique Dental Care',
    subtitle: 'Premium Multi-Speciality Clinic Platform',
    category: 'UI/UX & Headless CMS',
    filterCategories: ['UI/UX', 'Client'],
    role: 'Lead Web Engineer',
    duration: 'Client Delivery',
    description: 'High-performance dental clinic portal with Sanity Headless CMS, automated appointment booking, and programmatic SEO.',
    longDescription: 'Engineered for a prestigious dental healthcare practice. Combines dynamic Sanity CMS doctor profile schemas, interactive treatment guides, smile makeover before/after interactive sliders, and automated Google Calendar scheduling sync. Ready for deployment.',
    tags: ['React', 'Vite', 'Sanity CMS', 'TailwindCSS', 'SEO Prerender', 'Node.js'],
    features: [
      'Sanity Headless CMS for real-time editorial updates by staff',
      'Interactive before-and-after smile transformation comparison',
      'Real-time appointment slot booking with doctor availability sync',
      'Lighthouse 98+ performance score with prerendered SEO pages'
    ],
    metrics: ['Clinic Ready', 'CMS Integrated', 'SEO Optimized'],
    liveUrl: '#',
    githubUrl: 'https://github.com/OSSM-0224/Unique-Dental-Care',
    accentColor: '#ff7900',
    image: '/web_screens/uniquedentalcare_landingpage.png',
  },
  {
    id: 'orthodontic-clinic',
    index: '10',
    title: 'Dr Patil Advance Clinic',
    subtitle: 'Dr. Tanvi Patil & Dr. Piyush Patil Clinic',
    category: 'UI/UX & Client',
    filterCategories: ['UI/UX', 'Client'],
    role: 'Full-Stack Developer',
    duration: 'Client Project',
    description: 'Dedicated orthodontic platform highlighting aligners, braces, smile corrections, and clinical outcomes for Dr. Tanvi and Dr. Piyush Patil.',
    longDescription: 'A bespoke medical web application built for dual orthodontic specialists. Features comprehensive aligner simulation breakdowns, patient FAQs, child vs adult orthodontic timelines, patient reviews, and instant WhatsApp inquiry routing.',
    tags: ['React', 'Vite', 'TailwindCSS', 'TypeScript', 'WhatsApp API'],
    features: [
      'Aligners vs Conventional Braces interactive cost & timeline calculator',
      'Dual-practitioner profile showcase with verified credentials',
      'Direct WhatsApp booking bot integration with pre-filled case briefs',
      'Retina-ready high resolution clinical case gallery'
    ],
    metrics: ['+80% Direct WhatsApp Inbound Leads', '100% Mobile Fluidity', 'Top 3 Local SEO Rank'],
    liveUrl: 'https://patil-orthodontics.in',
    githubUrl: 'https://github.com/ommhatre/patil-orthodontics-clinic',
    accentColor: '#ff7900',
  },
  {
    id: 'om-sai-sports',
    index: '11',
    title: 'OSS – Om Sai Sports',
    subtitle: 'Premium 3D Custom Jersey Brand Showcase',
    category: 'UI/UX & 3D Web',
    filterCategories: ['UI/UX'],
    role: '3D Web Developer',
    duration: 'In Development',
    description: 'In-development athletic apparel brand website featuring an interactive 3D jersey customizer, sublimation preview, and bulk ordering.',
    longDescription: 'Currently in development: a high-impact e-commerce and brand experience for sports teams. Will empower cricket and football clubs to inspect 3D jersey textures, customize squad numbers, collar trims, team emblems, and generate instant quotation specs. Being built with Vite + React + Three.js.',
    tags: ['Three.js', 'React', 'Vite', 'TailwindCSS', 'TypeScript'],
    features: [
      'Interactive 3D jersey model inspection with 360-degree rotation',
      'Real-time badge, name, and squad number decal overlay on 3D mesh',
      'Bulk team roster upload and quote generator for team orders',
      'High-saturation neon athletic aesthetic reflecting modern sportswear'
    ],
    metrics: ['In Development', '3D Configurator Planned', 'Brand Concept'],
    liveUrl: '#',
    githubUrl: 'https://github.com/OSSM-0224/Om-Sai-Sports',
    accentColor: '#ff7900',
    status: 'In Development',
  },
  {
    id: 'society-management-app',
    index: '12',
    title: 'Society Management App',
    subtitle: 'Residential Complex ERP & Security Suite',
    category: 'MERN & Mobile PWA',
    filterCategories: ['MERN', 'Mobile'],
    role: 'Full-Stack Architect',
    duration: 'Production System',
    description: 'Mobile-first housing society suite managing flat directories, gate visitors, parking allocations, maintenance billing, and multilingual notices.',
    longDescription: 'Comprehensive resident management ERP built for cooperative housing societies. Solves resident authentication, visitor gate check-ins, automated maintenance invoice generation with payment webhooks, parking slot maps, and administrative voting. Web app ready, needs proper integration and testing.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'PWA', 'i18n Multilingual'],
    features: [
      'Multilingual interface supporting English, Hindi, and Marathi',
      'Automated maintenance calculation and instant PDF bill generation',
      'Security guard quick-pass interface with visitor phone verification',
      'Society notice board with push notification alerts',
      'Role-based admin/resident/guard access'
    ],
    metrics: ['Web App Ready', 'RBAC Implemented', 'Needs Final Polish'],
    liveUrl: '#',
    githubUrl: 'https://github.com/OSSM-0224/Society-Management-App',
    accentColor: '#ff7900',
    image: '/web_screens/sheetaldhara_landingpage.png',
  },
];
