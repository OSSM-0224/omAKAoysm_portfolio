import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

interface Phone3DCanvasProps {
  screenshotUrl: string;
  accentColor?: string;
  className?: string;
}

export const Phone3DCanvas: React.FC<Phone3DCanvasProps> = ({
  screenshotUrl,
  accentColor = '#ff7900',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);

  // Keep track of loaded textures
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software GL
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

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.05);

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 0, 4.6);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      setWebGlSupported(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio 3-Point Lighting
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(new THREE.Color(accentColor), 3.5);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0x222222, 1.2);
    scene.add(ambientLight);

    // -------------------------------------------------------------
    // PROCEDURAL 3D SMARTPHONE COMPONENT HIERARCHY:
    // 1. Phone Body / Chassis (Matte Obsidian)
    // 2. Bezel Edge Ring (Polished Titanium)
    // 3. Screen Plane with Dynamic Texture Map
    // 4. Punch-Hole Camera Pill
    // 5. Side Power & Volume Buttons
    // 6. Soft Radial Contact Shadow
    // -------------------------------------------------------------
    const phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    const phoneW = 1.6;
    const phoneH = 3.2;
    const phoneD = 0.12;
    const cornerR = 0.18;

    // 1. Phone Body Chassis (Rounded Box Shape)
    const shape = new THREE.Shape();
    const x = -phoneW / 2;
    const y = -phoneH / 2;
    shape.moveTo(x + cornerR, y);
    shape.lineTo(x + phoneW - cornerR, y);
    shape.quadraticCurveTo(x + phoneW, y, x + phoneW, y + cornerR);
    shape.lineTo(x + phoneW, y + phoneH - cornerR);
    shape.quadraticCurveTo(x + phoneW, y + phoneH, x + phoneW - cornerR, y + phoneH);
    shape.lineTo(x + cornerR, y + phoneH);
    shape.quadraticCurveTo(x, y + phoneH, x, y + phoneH - cornerR);
    shape.lineTo(x, y + cornerR);
    shape.quadraticCurveTo(x, y, x + cornerR, y);

    const extrudeSettings = {
      depth: phoneD,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    };

    const chassisGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    chassisGeo.center();

    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      metalness: 0.88,
      roughness: 0.22,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    phoneGroup.add(chassisMesh);

    // 2. Screen Display Plane
    const screenGeo = new THREE.PlaneGeometry(1.5, 3.0);
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = phoneD / 2 + 0.032;
    phoneGroup.add(screenMesh);
    screenMeshRef.current = screenMesh;

    // 3. Punch Hole Camera
    const cameraPillGeo = new THREE.CapsuleGeometry(0.04, 0.12, 8, 12);
    const cameraMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const cameraMesh = new THREE.Mesh(cameraPillGeo, cameraMat);
    cameraMesh.rotation.z = Math.PI / 2;
    cameraMesh.position.set(0, 1.34, phoneD / 2 + 0.035);
    phoneGroup.add(cameraMesh);

    // 4. Side Volume Buttons
    const btnGeo = new THREE.BoxGeometry(0.02, 0.35, 0.06);
    const btnMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.2 });
    const volumeBtn = new THREE.Mesh(btnGeo, btnMat);
    volumeBtn.position.set(-phoneW / 2 - 0.025, 0.4, 0);
    phoneGroup.add(volumeBtn);

    const powerBtn = new THREE.Mesh(btnGeo, btnMat);
    powerBtn.position.set(phoneW / 2 + 0.025, 0.5, 0);
    phoneGroup.add(powerBtn);

    // 5. Contact Shadow Plane Grounding
    const shadowGeo = new THREE.PlaneGeometry(2.8, 2.8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const gradient = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = gradient;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, -1.8, 0);
    shadowMesh.rotation.x = -Math.PI / 2;
    phoneGroup.add(shadowMesh);

    // Initial slight angle
    phoneGroup.rotation.y = -0.22;
    phoneGroup.rotation.x = 0.12;

    // Interactive mouse rotation & dragging
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotY = -0.22;
    let targetRotX = 0.12;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        targetRotY += deltaX * 0.01;
        targetRotX += deltaY * 0.01;
        prevMousePos = { x: e.clientX, y: e.clientY };
      } else {
        // Ambient tilt follow
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRotY = -0.22 + normX * 0.35;
        targetRotX = 0.12 - normY * 0.25;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop with smooth exponential damping
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth damped rotation
      phoneGroup.rotation.y = THREE.MathUtils.damp(phoneGroup.rotation.y, targetRotY, 5, delta);
      phoneGroup.rotation.x = THREE.MathUtils.damp(phoneGroup.rotation.x, targetRotX, 5, delta);

      // Subtle float
      phoneGroup.position.y = Math.sin(elapsed * 1.6) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      chassisGeo.dispose();
      chassisMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
    };
  }, [accentColor]);

  // Load screenshot texture and apply to screen
  useEffect(() => {
    if (!screenMeshRef.current || !screenshotUrl) return;

    textureLoader.load(
      screenshotUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        if (screenMeshRef.current) {
          const mat = screenMeshRef.current.material as THREE.MeshBasicMaterial;
          mat.map = texture;
          mat.needsUpdate = true;
        }
      },
      undefined,
      (err) => {
        console.warn('Failed to load screen texture, using fallback:', err);
      }
    );
  }, [screenshotUrl, textureLoader]);

  if (!webGlSupported) {
    // 2D / CSS fallback for low-end devices
    return (
      <div className={`relative flex items-center justify-center p-6 ${className}`}>
        <div className="w-[260px] h-[520px] rounded-[36px] bg-[#141416] p-3 border-4 border-[#2b2b2e] shadow-[0_0_40px_rgba(255,121,0,0.25)] flex flex-col items-center">
          <div className="w-20 h-4 bg-black rounded-full mb-2" />
          <img
            src={screenshotUrl}
            alt="App Screen"
            className="w-full h-full object-cover rounded-[26px]"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`w-full h-[520px] relative cursor-grab active:cursor-grabbing select-none z-10 ${className}`}
    />
  );
};
