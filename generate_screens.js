import fs from 'fs';
import path from 'path';

// Generate clean, high-resolution mobile app SVG mockups
const screens = [
  {
    filename: 'ccms-1.svg',
    title: 'Tech Vyassa CCMS',
    subtitle: 'Canteen Coupon System',
    badge: 'LIVE ON GOOGLE PLAY',
    accent: '#ff7900',
    bg: '#0c0e12',
    elements: `
      <!-- Status Bar -->
      <text x="24" y="32" fill="#888" font-family="monospace" font-size="12">09:41</text>
      <text x="310" y="32" fill="#888" font-family="monospace" font-size="12">5G · 98%</text>

      <!-- App Header -->
      <rect x="20" y="50" width="320" height="60" rx="12" fill="#161a22" stroke="#ff7900" stroke-width="1.5"/>
      <text x="36" y="80" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="16">Tech Vyassa CCMS</text>
      <text x="36" y="98" fill="#ff7900" font-family="monospace" font-size="11">● Active Shift · Cafeteria #2</text>

      <!-- Balance Card -->
      <rect x="20" y="125" width="320" height="110" rx="16" fill="url(#orangeGrad)"/>
      <text x="36" y="155" fill="#000000" font-family="sans-serif" font-size="12" font-weight="600">AVAILABLE COUPON BALANCE</text>
      <text x="36" y="195" fill="#000000" font-family="monospace" font-size="34" font-weight="bold">₹ 1,450.00</text>
      <text x="36" y="218" fill="#000000" font-family="sans-serif" font-size="11" opacity="0.8">18 Meal Tokens Remaining</text>

      <!-- QR Quick Pass -->
      <rect x="20" y="250" width="320" height="210" rx="16" fill="#161a22" stroke="#252b36"/>
      <text x="36" y="280" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="14">Fast QR Dispense Token</text>
      <!-- Simulated QR pattern -->
      <rect x="100" y="300" width="160" height="130" rx="8" fill="#ffffff"/>
      <rect x="115" y="315" width="40" height="40" fill="#000"/>
      <rect x="125" y="325" width="20" height="20" fill="#fff"/>
      <rect x="205" y="315" width="40" height="40" fill="#000"/>
      <rect x="215" y="325" width="20" height="20" fill="#fff"/>
      <rect x="115" y="375" width="40" height="40" fill="#000"/>
      <rect x="125" y="385" width="20" height="20" fill="#fff"/>
      <rect x="170" y="340" width="25" height="40" fill="#ff7900"/>

      <!-- Recent Transactions List -->
      <text x="24" y="490" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="14">Recent Cafeteria Orders</text>
      <rect x="20" y="505" width="320" height="50" rx="10" fill="#141720" stroke="#222"/>
      <text x="36" y="535" fill="#fff" font-family="sans-serif" font-size="13">Executive Thali Combo</text>
      <text x="270" y="535" fill="#ff7900" font-family="monospace" font-size="13">-₹85.00</text>

      <rect x="20" y="565" width="320" height="50" rx="10" fill="#141720" stroke="#222"/>
      <text x="36" y="595" fill="#fff" font-family="sans-serif" font-size="13">Cold Brew &amp; Sandwich</text>
      <text x="270" y="595" fill="#ff7900" font-family="monospace" font-size="13">-₹60.00</text>

      <!-- Bottom Navigation Bar -->
      <rect x="20" y="630" width="320" height="50" rx="14" fill="#0e1117" stroke="#222"/>
      <text x="50" y="660" fill="#ff7900" font-family="monospace" font-size="11">HOME</text>
      <text x="140" y="660" fill="#666" font-family="monospace" font-size="11">COUPONS</text>
      <text x="240" y="660" fill="#666" font-family="monospace" font-size="11">HISTORY</text>
    `,
  },
  {
    filename: 'amrutam-1.svg',
    title: 'Amrutam Pharma',
    subtitle: 'React Native 0.82 Suite',
    badge: 'TELE-HEALTH & DISPATCH',
    accent: '#ff5500',
    bg: '#0a0d14',
    elements: `
      <!-- Status Bar -->
      <text x="24" y="32" fill="#888" font-family="monospace" font-size="12">14:20</text>
      <text x="310" y="32" fill="#888" font-family="monospace" font-size="12">5G · 100%</text>

      <!-- Header with AES Badge -->
      <rect x="20" y="50" width="320" height="55" rx="12" fill="#141a24" stroke="#ff5500" stroke-width="1.5"/>
      <text x="36" y="82" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="16">Amrutam Pharma ERP</text>
      <text x="235" y="82" fill="#ff7900" font-family="monospace" font-size="10">🔒 AES-256</text>

      <!-- Telehealth Zego Call Banner -->
      <rect x="20" y="118" width="320" height="85" rx="14" fill="#192230" stroke="#253245"/>
      <circle cx="55" cy="160" r="22" fill="#ff5500"/>
      <text x="47" y="166" fill="#000" font-size="18">📞</text>
      <text x="90" y="152" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="13">Live Doctor Consultation</text>
      <text x="90" y="172" fill="#ff9944" font-family="monospace" font-size="11">ZegoCloud Audio/Video Encrypted</text>

      <!-- Prescription Pipeline -->
      <text x="24" y="230" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="14">Prescription Dispatch Tracker</text>
      <rect x="20" y="245" width="320" height="150" rx="16" fill="#141a24" stroke="#222c3d"/>
      <text x="36" y="275" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="13">Order #AMP-9942B</text>
      <text x="260" y="275" fill="#ff7900" font-family="monospace" font-size="11">IN TRANSIT</text>

      <!-- Status Progress -->
      <line x1="45" y1="315" x2="295" y2="315" stroke="#334155" stroke-width="4"/>
      <line x1="45" y1="315" x2="210" y2="315" stroke="#ff7900" stroke-width="4"/>
      <circle cx="45" cy="315" r="8" fill="#ff7900"/>
      <circle cx="130" cy="315" r="8" fill="#ff7900"/>
      <circle cx="210" cy="315" r="8" fill="#ff7900"/>
      <circle cx="295" cy="315" r="8" fill="#334155"/>
      <text x="30" y="340" fill="#aaa" font-family="monospace" font-size="9">VERIFIED</text>
      <text x="110" y="340" fill="#aaa" font-family="monospace" font-size="9">PACKED</text>
      <text x="195" y="340" fill="#ff7900" font-family="monospace" font-size="9">SHIPPED</text>
      <text x="275" y="340" fill="#666" font-family="monospace" font-size="9">DELIVERED</text>

      <!-- Inventory Stock -->
      <text x="24" y="425" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="14">Batch Stock &amp; Inventory</text>
      <rect x="20" y="440" width="320" height="60" rx="10" fill="#131822" stroke="#222"/>
      <text x="36" y="468" fill="#fff" font-family="sans-serif" font-size="13">Azithromycin 500mg (Batch A-4)</text>
      <text x="36" y="488" fill="#888" font-family="monospace" font-size="11">1,240 Units in Cold Storage</text>

      <rect x="20" y="510" width="320" height="60" rx="10" fill="#131822" stroke="#222"/>
      <text x="36" y="538" fill="#fff" font-family="sans-serif" font-size="13">Paracetamol Infusion IV</text>
      <text x="36" y="558" fill="#888" font-family="monospace" font-size="11">580 Units · Redux Synced</text>

      <!-- Bottom Bar -->
      <rect x="20" y="630" width="320" height="50" rx="14" fill="#0e131b" stroke="#222"/>
      <text x="60" y="660" fill="#ff5500" font-family="monospace" font-size="11">DASHBOARD</text>
      <text x="170" y="660" fill="#666" font-family="monospace" font-size="11">ZEGO CALLS</text>
      <text x="270" y="660" fill="#666" font-family="monospace" font-size="11">STOCK</text>
    `,
  },
  {
    filename: 'emergency-1.svg',
    title: 'EmergencyApp',
    subtitle: 'Native Android Java + Firebase',
    badge: 'INSTANT SOS & GPS',
    accent: '#ff3b00',
    bg: '#100a0a',
    elements: `
      <!-- Status Bar -->
      <text x="24" y="32" fill="#888" font-family="monospace" font-size="12">19:04</text>
      <text x="310" y="32" fill="#888" font-family="monospace" font-size="12">GPS: ON</text>

      <!-- Header -->
      <rect x="20" y="50" width="320" height="55" rx="12" fill="#1c0f0f" stroke="#ff3b00" stroke-width="1.5"/>
      <text x="36" y="82" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="16">Emergency SOS Dispatch</text>
      <text x="245" y="82" fill="#ff5500" font-family="monospace" font-size="10">READY</text>

      <!-- Huge SOS Emergency Trigger Button -->
      <circle cx="180" cy="220" r="85" fill="#260b0b" stroke="#ff3b00" stroke-width="2"/>
      <circle cx="180" cy="220" r="70" fill="#ff3b00"/>
      <text x="150" y="215" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="34">SOS</text>
      <text x="135" y="240" fill="#ffffff" font-family="monospace" font-size="10">TAP OR SHAKE</text>

      <!-- Location Card with Google Maps coordinate -->
      <rect x="20" y="330" width="320" height="90" rx="14" fill="#180e0e" stroke="#2f1a1a"/>
      <text x="36" y="360" fill="#ff7900" font-family="monospace" font-size="11">📍 LIVE GPS BEACON (GOOGLE MAPS)</text>
      <text x="36" y="385" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="14">19.0330° N, 73.0297° E</text>
      <text x="36" y="405" fill="#888888" font-family="monospace" font-size="10">Navi Mumbai, MH · Background Service Active</text>

      <!-- First Aid Modules Strip -->
      <text x="24" y="450" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="14">10 Offline First-Aid Guides</text>
      <rect x="20" y="465" width="150" height="70" rx="10" fill="#180e0e" stroke="#291616"/>
      <text x="32" y="495" fill="#ff7900" font-family="sans-serif" font-weight="bold" font-size="12">CPR &amp; Breathing</text>
      <text x="32" y="515" fill="#888" font-family="monospace" font-size="9">Offline Cache Ready</text>

      <rect x="190" y="465" width="150" height="70" rx="10" fill="#180e0e" stroke="#291616"/>
      <text x="202" y="495" fill="#ff7900" font-family="sans-serif" font-weight="bold" font-size="12">Severe Bleeding</text>
      <text x="202" y="515" fill="#888" font-family="monospace" font-size="9">Tourniquet Protocol</text>

      <rect x="20" y="545" width="320" height="55" rx="10" fill="#180e0e" stroke="#291616"/>
      <text x="36" y="575" fill="#ffffff" font-family="sans-serif" font-size="12">Emergency Contacts Broadcast: 4 Recipients Synced</text>

      <!-- Bottom Bar -->
      <rect x="20" y="630" width="320" height="50" rx="14" fill="#120808" stroke="#222"/>
      <text x="50" y="660" fill="#ff3b00" font-family="monospace" font-size="11">DISPATCH</text>
      <text x="150" y="660" fill="#666" font-family="monospace" font-size="11">FIRST AID</text>
      <text x="250" y="660" fill="#666" font-family="monospace" font-size="11">CHECKLIST</text>
    `,
  },
];

screens.forEach((s) => {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="360" height="720" viewBox="0 0 360 720" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="orangeGrad" x1="0" y1="0" x2="320" y2="110" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ff7900" />
      <stop offset="1" stop-color="#ff9d33" />
    </linearGradient>
  </defs>
  <!-- Screen Canvas Background -->
  <rect width="360" height="720" fill="${s.bg}"/>
  ${s.elements}
</svg>`;

  const outDir = path.join(process.cwd(), 'public', 'screens');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outDir, s.filename), svgContent);
  fs.writeFileSync(path.join(outDir, s.filename.replace('.svg', '.png')), svgContent);
});

console.log('Mobile screenshots generated successfully in public/screens/');
