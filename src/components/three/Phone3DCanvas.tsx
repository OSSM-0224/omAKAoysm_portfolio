import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const SCREEN_WIDTH = 1.46;
const SCREEN_HEIGHT = 2.94;
const SCREEN_ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;

const roundedRectShape = (width: number, height: number, radius: number) => {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
};

interface Phone3DCanvasProps {
  screenshotUrl: string;
  accentColor?: string;
  className?: string;
  /** Height utility for the render surface. Defaults to the original 520px. */
  heightClassName?: string;
}

export const Phone3DCanvas: React.FC<Phone3DCanvasProps> = ({
  screenshotUrl,
  accentColor = '#ff7900',
  className = '',
  heightClassName = 'h-[520px]',
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
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Image-based studio lighting so the titanium chassis keeps its form
    // even where the directional lights do not hit.
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvironment = new RoomEnvironment();
    const environmentTarget = pmremGenerator.fromScene(roomEnvironment, 0.04);
    scene.environment = environmentTarget.texture;
    scene.environmentIntensity = 0.8;

    // Studio 3-Point Lighting
    const keyLight = new THREE.DirectionalLight(0xfff1e2, 2.0);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(new THREE.Color(accentColor), 4.2);
    rimLight.position.set(-3, 1.5, -2.5);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0x3a2a1f, 0.9);
    scene.add(ambientLight);

    // -------------------------------------------------------------
    // PROCEDURAL 3D SMARTPHONE COMPONENT HIERARCHY:
    // 1. Phone Body / Chassis (Brushed Warm Titanium)
    // 2. Black Glass Bezel
    // 3. Screen Plane with Dynamic Texture Map
    // 4. Punch-Hole Camera Pill
    // 5. Orange Power Key & Graphite Volume Rocker
    // 6. Dark Rear Inlay & Camera Module
    // 7. Soft Radial Contact Shadow
    // -------------------------------------------------------------
    const phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    const phoneW = 1.6;
    const phoneH = 3.2;
    const phoneD = 0.12;
    const cornerR = 0.18;

    // 1. Phone Body Chassis (Brushed Warm Titanium)
    const shape = roundedRectShape(phoneW, phoneH, cornerR);

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
      color: 0xd8d3c9,
      metalness: 0.84,
      roughness: 0.24,
      envMapIntensity: 1.05,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    phoneGroup.add(chassisMesh);

    // 2. Black Glass Bezel
    const bezelGeo = new THREE.ShapeGeometry(roundedRectShape(1.54, 3.08, 0.12));
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x060606,
      metalness: 0.6,
      roughness: 0.18,
      envMapIntensity: 0.55,
    });
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.z = phoneD / 2 + 0.034;
    phoneGroup.add(bezelMesh);

    // 3. Screen Display Plane
    const screenGeo = new THREE.PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT);
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = phoneD / 2 + 0.038;
    phoneGroup.add(screenMesh);
    screenMeshRef.current = screenMesh;

    // 4. Punch Hole Camera
    const cameraPillGeo = new THREE.CapsuleGeometry(0.04, 0.12, 8, 12);
    const cameraMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      metalness: 0.8,
      roughness: 0.15,
    });
    const cameraMesh = new THREE.Mesh(cameraPillGeo, cameraMat);
    cameraMesh.rotation.z = Math.PI / 2;
    cameraMesh.position.set(0, 1.34, phoneD / 2 + 0.044);
    phoneGroup.add(cameraMesh);

    // 5. Side Volume Rocker & Orange Power Key
    const btnGeo = new THREE.BoxGeometry(0.02, 0.35, 0.06);
    const btnMat = new THREE.MeshStandardMaterial({
      color: 0x393732,
      metalness: 0.92,
      roughness: 0.22,
    });
    const volumeBtn = new THREE.Mesh(btnGeo, btnMat);
    volumeBtn.position.set(-phoneW / 2 - 0.025, 0.4, 0);
    phoneGroup.add(volumeBtn);

    const powerBtnMat = new THREE.MeshStandardMaterial({
      color: 0xff5500,
      metalness: 0.62,
      roughness: 0.26,
      emissive: 0x3a0c00,
      emissiveIntensity: 0.6,
    });
    const powerBtn = new THREE.Mesh(btnGeo, powerBtnMat);
    powerBtn.position.set(phoneW / 2 + 0.025, 0.5, 0);
    phoneGroup.add(powerBtn);

    // 6. Dark Rear Inlay & Camera Module (visible when dragged 180°)
    const rearPanelGeo = new THREE.ShapeGeometry(
      roundedRectShape(1.42, 3.0, 0.14),
    );
    const rearPanelMat = new THREE.MeshStandardMaterial({
      color: 0x191817,
      metalness: 0.55,
      roughness: 0.38,
      envMapIntensity: 0.5,
    });
    const rearPanel = new THREE.Mesh(rearPanelGeo, rearPanelMat);
    rearPanel.position.z = -phoneD / 2 - 0.032;
    rearPanel.rotation.y = Math.PI;
    phoneGroup.add(rearPanel);

    const rearCameraGeo = new THREE.CircleGeometry(0.17, 48);
    const rearCameraMat = new THREE.MeshStandardMaterial({
      color: 0x080808,
      metalness: 0.75,
      roughness: 0.12,
    });
    const rearCamera = new THREE.Mesh(rearCameraGeo, rearCameraMat);
    rearCamera.position.set(-0.36, 1.06, -phoneD / 2 - 0.035);
    rearCamera.rotation.y = Math.PI;
    phoneGroup.add(rearCamera);

    const rearRingGeo = new THREE.RingGeometry(0.176, 0.198, 48);
    const rearRingMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    const rearRing = new THREE.Mesh(rearRingGeo, rearRingMat);
    rearRing.position.copy(rearCamera.position);
    rearRing.rotation.y = Math.PI;
    phoneGroup.add(rearRing);

    // 7. Contact Shadow Plane Grounding
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

    // Interactive pointer rotation & dragging (mouse, pen, touch)
    let isDragging = false;
    let prevPointerPos = { x: 0, y: 0 };
    let targetRotY = -0.22;
    let targetRotX = 0.12;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointerPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevPointerPos.x;
        const deltaY = e.clientY - prevPointerPos.y;
        targetRotY += deltaX * 0.01;
        targetRotX += deltaY * 0.01;
        prevPointerPos = { x: e.clientX, y: e.clientY };
      } else if (e.pointerType === 'mouse') {
        // Ambient tilt follow (mouse only; touch drags are explicit)
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRotY = -0.22 + normX * 0.35;
        targetRotX = 0.12 - normY * 0.25;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

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
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', onResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      environmentTarget.dispose();
      roomEnvironment.dispose();
      pmremGenerator.dispose();
      chassisGeo.dispose();
      chassisMat.dispose();
      bezelGeo.dispose();
      bezelMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      cameraPillGeo.dispose();
      cameraMat.dispose();
      btnGeo.dispose();
      btnMat.dispose();
      powerBtnMat.dispose();
      rearPanelGeo.dispose();
      rearPanelMat.dispose();
      rearCameraGeo.dispose();
      rearCameraMat.dispose();
      rearRingGeo.dispose();
      rearRingMat.dispose();
      shadowGeo.dispose();
      shadowTexture.dispose();
      shadowMat.dispose();
    };
  }, [accentColor]);

  // Load screenshot texture and apply to screen
  useEffect(() => {
    if (!screenshotUrl) return;

    let cancelled = false;
    let appliedTexture: THREE.Texture | null = null;

    textureLoader.load(
      screenshotUrl,
      (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        // Crop to fill the screen plane instead of stretching real screenshots
        // whose aspect ratio differs from the display.
        const image = texture.image as { width?: number; height?: number } | undefined;
        const imageAspect =
          image?.width && image?.height ? image.width / image.height : SCREEN_ASPECT;

        if (imageAspect < SCREEN_ASPECT) {
          const visibleHeight = imageAspect / SCREEN_ASPECT;
          texture.repeat.set(1, visibleHeight);
          texture.offset.set(0, (1 - visibleHeight) / 2);
        } else if (imageAspect > SCREEN_ASPECT) {
          const visibleWidth = SCREEN_ASPECT / imageAspect;
          texture.repeat.set(visibleWidth, 1);
          texture.offset.set((1 - visibleWidth) / 2, 0);
        }

        if (screenMeshRef.current) {
          const mat = screenMeshRef.current.material as THREE.MeshBasicMaterial;
          mat.map = texture;
          mat.needsUpdate = true;
          appliedTexture = texture;
        } else {
          texture.dispose();
        }
      },
      undefined,
      (err) => {
        console.warn('Failed to load screen texture, using fallback:', err);
      }
    );

    return () => {
      cancelled = true;
      appliedTexture?.dispose();
    };
  }, [screenshotUrl, textureLoader, accentColor]);

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
      className={`w-full ${heightClassName} relative touch-pan-y cursor-grab active:cursor-grabbing select-none z-10 ${className}`}
    />
  );
};
