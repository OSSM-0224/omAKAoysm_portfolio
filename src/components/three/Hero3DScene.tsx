import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface Hero3DSceneProps {
  className?: string;
}

export const Hero3DScene: React.FC<Hero3DSceneProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Software WebGL Detection per Three.js directives
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (e) {
        return false;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070707, 0.045);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: true,
      });
    } catch (e) {
      setWebGlSupported(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment map using PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-Point Lighting
    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x111122, 0.7);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xff5500, 3.2);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff8833, 2.0);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0x181818, 1.0);
    scene.add(ambientLight);

    // Create Procedural Terminal Code Screen Texture
    const codeCanvas = document.createElement('canvas');
    codeCanvas.width = 1024;
    codeCanvas.height = 640;
    const ctx = codeCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, 1024, 640);

      // Terminal top chrome
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, 1024, 48);
      ctx.fillStyle = '#ff5500';
      ctx.beginPath();
      ctx.arc(32, 24, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(56, 24, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.arc(80, 24, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#888888';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText('praju@workstation: ~/projects/award-portfolio', 110, 30);

      // Code lines
      ctx.font = '18px "JetBrains Mono", monospace';
      const lines = [
        { text: '// PRAJU CORE ENGINE v3.4', color: '#ff5500' },
        { text: 'import { Developer, Architect, Innovator } from "@praju/mind";', color: '#f4f1ea' },
        { text: 'import { SocketCluster, WebGLRenderer, MERN } from "@praju/stack";', color: '#f4f1ea' },
        { text: '', color: '' },
        { text: 'export async function initializeExperience(): Promise<Result> {', color: '#ff7722' },
        { text: '  const developer = new Developer({ name: "PRAJU", status: "AVAILABLE" });', color: '#f4f1ea' },
        { text: '  await developer.loadRealTimeSockets();', color: '#aaaaaa' },
        { text: '  await developer.mountThreeJSCanvas({ dpr: 2.0, targetFps: 60 });', color: '#aaaaaa' },
        { text: '  const projects = await developer.fetchShowcaseProjects();', color: '#f4f1ea' },
        { text: '  return developer.shipToProduction(projects);', color: '#ffaa44' },
        { text: '}', color: '#ff7722' },
        { text: '', color: '' },
        { text: '⚡ SYSTEM READY // 11 PRODUCTION DEPLOYMENTS ONLINE', color: '#ff5500' },
      ];

      let yPos = 85;
      lines.forEach((line) => {
        if (line.text) {
          ctx.fillStyle = line.color;
          ctx.fillText(line.text, 36, yPos);
        }
        yPos += 34;
      });
    }

    const screenTexture = new THREE.CanvasTexture(codeCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // -------------------------------------------------------------
    // PROCEDURAL COMPOSITE MODEL: 3D CYBER LAPTOP & WORKSTATION CORE
    // Group of 8 distinct parts across scales:
    // 1. Base chassis
    // 2. Keyboard deck
    // 3. Keys grid (instanced/modeled)
    // 4. Trackpad
    // 5. Display lid
    // 6. Glowing OLED screen
    // 7. Status light strip
    // 8. Orbiting neon torus-knot & particle rings
    // -------------------------------------------------------------
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // 1. Base chassis
    const baseGeo = new THREE.BoxGeometry(2.4, 0.08, 1.6);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x181818,
      metalness: 0.85,
      roughness: 0.22,
    });
    const baseMesh = new THREE.Mesh(baseGeo, chassisMat);
    baseMesh.position.y = 0.04;
    baseMesh.castShadow = !isSoftwareGl;
    baseMesh.receiveShadow = !isSoftwareGl;
    heroGroup.add(baseMesh);

    // 2. Keyboard recess tray
    const trayGeo = new THREE.BoxGeometry(2.1, 0.02, 0.85);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c0c,
      metalness: 0.9,
      roughness: 0.35,
    });
    const trayMesh = new THREE.Mesh(trayGeo, trayMat);
    trayMesh.position.set(0, 0.085, -0.2);
    heroGroup.add(trayMesh);

    // 3. Trackpad
    const padGeo = new THREE.BoxGeometry(0.8, 0.01, 0.5);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x1f1f1f,
      metalness: 0.7,
      roughness: 0.15,
    });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padMesh.position.set(0, 0.085, 0.45);
    heroGroup.add(padMesh);

    // 4. Keyboard keys array
    const keyGeo = new THREE.BoxGeometry(0.12, 0.02, 0.1);
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.4,
      metalness: 0.3,
    });
    const keysGroup = new THREE.Group();
    const rows = 5;
    const cols = 12;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = new THREE.Mesh(keyGeo, keyMat);
        key.position.set(
          (c - cols / 2 + 0.5) * 0.16,
          0.095,
          -0.55 + r * 0.15
        );
        keysGroup.add(key);
      }
    }
    heroGroup.add(keysGroup);

    // 5. Display Lid + Screen Assembly (Pivoted at hinge)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.08, -0.78); // Hinge position
    heroGroup.add(lidGroup);

    // Lid Backing
    const lidGeo = new THREE.BoxGeometry(2.4, 1.55, 0.05);
    const lidMesh = new THREE.Mesh(lidGeo, chassisMat);
    lidMesh.position.set(0, 0.775, 0);
    lidMesh.castShadow = !isSoftwareGl;
    lidGroup.add(lidMesh);

    // 6. Glowing OLED Screen Display
    const screenGeo = new THREE.PlaneGeometry(2.28, 1.43);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      emissive: new THREE.Color(0xff4400),
      emissiveMap: screenTexture,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.2,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.775, 0.028);
    lidGroup.add(screenMesh);

    // 7. Status LED bar
    const ledGeo = new THREE.BoxGeometry(1.6, 0.015, 0.02);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0, 0.09, 0.76);
    heroGroup.add(ledMesh);

    // Tilt lid slightly open (~105 degrees for realistic display angle)
    lidGroup.rotation.x = -Math.PI * 0.08;

    // 8. Abstract Cyber Torus-Knot & Particle Halo hovering above/around
    const knotGeo = new THREE.TorusKnotGeometry(0.7, 0.12, 90, 16);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0xff5500,
      metalness: 0.8,
      roughness: 0.25,
      wireframe: true,
      emissive: 0xff3300,
      emissiveIntensity: 0.2,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    knotMesh.position.set(1.7, 1.5, -0.5);
    knotMesh.scale.set(0.65, 0.65, 0.65);
    heroGroup.add(knotMesh);

    // Particle Stars Cloud
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(0xff5500);
    const altColor = new THREE.Color(0xffa040);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      particlePositions[idx] = (Math.random() - 0.5) * 8;
      particlePositions[idx + 1] = (Math.random() - 0.5) * 5 + 1.2;
      particlePositions[idx + 2] = (Math.random() - 0.5) * 5;

      const c = Math.random() > 0.4 ? baseColor : altColor;
      particleColors[idx] = c.r;
      particleColors[idx + 1] = c.g;
      particleColors[idx + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Soft Radial Contact Shadow Grounding Plane
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const gradient = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = gradient;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.01;
    heroGroup.add(shadowMesh);

    // Center and angle the workstation
    heroGroup.position.set(0, -0.6, 0);
    heroGroup.rotation.y = -0.35;
    heroGroup.rotation.x = 0.15;

    // Mouse Parallax & Scroll reaction tracking
    let targetRotY = -0.35;
    let targetRotX = 0.15;
    let targetCamY = 1.2;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      targetRotY = -0.35 + normX * 0.45;
      targetRotX = 0.15 - normY * 0.25;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const factor = Math.min(scrollY / 1200, 1);
      targetCamY = 1.2 + factor * 0.8;
      heroGroup.position.y = -0.6 - factor * 0.5;
      heroGroup.scale.setScalar(1 - factor * 0.2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Render Loop with exponential damping
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Exponential smooth damping
      heroGroup.rotation.y = THREE.MathUtils.damp(heroGroup.rotation.y, targetRotY, 4, delta);
      heroGroup.rotation.x = THREE.MathUtils.damp(heroGroup.rotation.x, targetRotX, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3, delta);

      // Subtle float animation
      baseMesh.position.y = 0.04 + Math.sin(elapsed * 1.5) * 0.03;
      trayMesh.position.y = 0.085 + Math.sin(elapsed * 1.5) * 0.03;
      keysGroup.position.y = Math.sin(elapsed * 1.5) * 0.03;
      padMesh.position.y = 0.085 + Math.sin(elapsed * 1.5) * 0.03;
      lidGroup.position.y = 0.08 + Math.sin(elapsed * 1.5) * 0.03;

      // Rotate cyber knot
      knotMesh.rotation.x += delta * 0.6;
      knotMesh.rotation.y += delta * 0.8;
      knotMesh.position.y = 1.5 + Math.sin(elapsed * 2) * 0.08;

      // Slowly rotate particle field
      particles.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      baseGeo.dispose();
      chassisMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  if (!webGlSupported) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-[#ff5500]/30 text-center font-mono">
          <span className="text-[#ff5500] text-sm">&lt;3D WORKSTATION ENGINE ACTIVE&gt;</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative pointer-events-none select-none ${className}`}
    />
  );
};
