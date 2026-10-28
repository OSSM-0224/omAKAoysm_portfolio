export interface MobileApp {
  id: string;
  name: string;
  tagline: string;
  platform: 'Google Play & Android' | 'React Native 0.82' | 'Native Android (Java)';
  badgeText: string;
  downloads?: string;
  description: string;
  highlights: string[];
  tech: string[];
  screenshots: string[];
  playStoreUrl?: string;
  githubUrl?: string;
  accentColor: string;
}

export const MOBILE_APPS: MobileApp[] = [
  {
    id: 'ccms',
    name: 'CCMS (Canteen Coupon Management System)',
    tagline: 'Production Cafeteria ERP with 100+ Active Play Store Downloads',
    platform: 'Google Play & Android',
    badgeText: 'LIVE ON GOOGLE PLAY · 100+ DOWNLOADS',
    downloads: '100+ Downloads on Play Store',
    description:
      'Engineered during my tenure at Tech Vyassa. A complete enterprise cafeteria & coupon management mobile application deployed in production. Eliminates paper vouchers with encrypted one-time QR coupon issuance, wallet reconciliation, and real-time counter dispensing.',
    highlights: [
      'Deployed on Google Play Store with 100+ verified production users',
      'Dynamic one-time QR token generator with anti-reuse security',
      'Instant offline coupon caching with background sync queue',
      'Merchant cashier scanner interface with sub-100ms verification',
      'Full wallet balance top-up, daily meal quotas, and cafeteria telemetry',
    ],
    tech: ['React Native', 'Android', 'Redux', 'Node.js', 'Express', 'QR Engine'],
    screenshots: ['/screens/ccms-1.svg', '/screens/ccms-1.png'],
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.techvyassa.ccms1&hl=en_IN',
    githubUrl: 'https://github.com/ommhatre',
    accentColor: '#ff7900',
  },
  {
    id: 'amrutam-pharma',
    name: 'Amrutam Pharma ERP & Tele-Consult',
    tagline: 'Enterprise Pharma Suite with Zego Cloud Video & AES Storage',
    platform: 'React Native 0.82',
    badgeText: 'REACT NATIVE 0.82 · AES-256 ENCRYPTED',
    downloads: 'Enterprise Pilot & Fleet Ready',
    description:
      'Production-grade pharmaceutical management application built with React Native 0.82. Connects field medical representatives, doctors, and pharmacy distributors with live encrypted video calling via Zego Cloud, automated invoice generation, and secure local AES encrypted storage.',
    highlights: [
      'Encrypted live audio/video doctor consultations via Zego UIKit',
      'Hardware-level AES encrypted local storage for sensitive patient records',
      'Prescription dispatch pipeline with real-time delivery milestone tracking',
      'Formik + Yup validated medical order forms with dynamic custom sliders',
      'Offline-first Redux Toolkit state sync with automatic conflict recovery',
    ],
    tech: [
      'React Native 0.82',
      'TypeScript',
      'Redux Toolkit',
      'Zego UIKit',
      'Encrypted Storage',
      'React Navigation',
      'Formik + Yup',
    ],
    screenshots: ['/screens/amrutam-1.svg', '/screens/amrutam-1.png'],
    githubUrl: 'https://github.com/OSSM-0224/amrutam_pharma',
    accentColor: '#ff5500',
  },
  {
    id: 'emergency-app',
    name: 'EmergencyApp — Safety & SOS',
    tagline: 'Native Android Java App with Live Google Maps GPS Beacon',
    platform: 'Native Android (Java)',
    badgeText: 'NATIVE ANDROID JAVA · GOOGLE MAPS SDK',
    downloads: 'Community Safety Deployed',
    description:
      'Native Android application engineered in Java with Firebase real-time infrastructure. Provides high-reliability personal security: one-tap SOS alerts, live GPS geolocation broadcasting on Google Maps, accelerometer shake-detection trigger, background emergency daemon, and 10 offline first-aid guides.',
    highlights: [
      'One-tap SOS dispatch with SMS broadcast to 4 emergency contacts',
      'Live GPS telemetry tracking integrated with Google Maps SDK',
      'Hardware accelerometer shake detection trigger (activates in pocket)',
      'Foreground service & Boot Receiver to ensure daemon stays alive',
      '10 offline first-aid emergency medical modules with zero network reliance',
    ],
    tech: [
      'Java',
      'Android SDK',
      'Firebase Realtime DB',
      'Firestore',
      'Google Maps SDK',
      'SensorManager',
      'Material Design',
    ],
    screenshots: ['/screens/emergency-1.svg', '/screens/emergency-1.png'],
    githubUrl: 'https://github.com/ommhatre/EmergencyApp',
    accentColor: '#ff3b00',
  },
];
