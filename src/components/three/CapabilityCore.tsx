import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as THREE from "three";
import type { ServiceOffering } from "../../data/services";

const LAYER_SIZE: ReadonlyArray<readonly [number, number, number]> = [
  [2.15, 0.16, 1.55],
  [3.0, 0.18, 2.0],
  [2.55, 0.2, 2.55],
  [2.8, 0.16, 1.9],
  [3.15, 0.12, 1.6],
];

const LAYER_Y = [1.14, 0.57, 0, -0.57, -1.14];
const LAYER_TINT = ["#18161b", "#14151a", "#19161a", "#15151a", "#1a1717"];

const ACCENT = "#ff7900";
const HOT = "#ffb15c";

interface CoreDrag {
  targetX: number;
  targetY: number;
  velocityY: number;
  moved: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
}

interface CapabilityCoreProps {
  services: ServiceOffering[];
  activeIndex: number;
  previewIndex: number | null;
  onSelect: (index: number) => void;
  onPreview: (index: number | null) => void;
  reducedMotion: boolean;
}

function detectWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

/** One inspectable plate in the capability stack. */
const ServiceLayer: React.FC<{
  index: number;
  active: boolean;
  preview: boolean;
  reducedMotion: boolean;
  drag: React.RefObject<CoreDrag>;
  onSelect: (index: number) => void;
  onPreview: (index: number | null) => void;
}> = ({
  index,
  active,
  preview,
  reducedMotion,
  drag,
  onSelect,
  onPreview,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [width, height, depth] = LAYER_SIZE[index];
  const baseY = LAYER_Y[index];
  const top = height / 2 + 0.012;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const step = Math.min(delta, 0.1);
    const yTarget = baseY + (active ? 0.19 : preview ? 0.075 : 0);
    const scaleTarget = active ? 1.018 : preview ? 1.008 : 1;
    const glowTarget = active ? 0.2 : preview ? 0.1 : 0.025;

    if (reducedMotion) {
      groupRef.current.position.y = yTarget;
      groupRef.current.scale.setScalar(scaleTarget);
      if (materialRef.current) {
        materialRef.current.emissiveIntensity = glowTarget;
      }
      return;
    }

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      yTarget,
      5.5,
      step,
    );
    const scale = THREE.MathUtils.damp(
      groupRef.current.scale.x,
      scaleTarget,
      5.5,
      step,
    );
    groupRef.current.scale.setScalar(scale);

    if (materialRef.current) {
      materialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        materialRef.current.emissiveIntensity,
        glowTarget,
        6,
        step,
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, baseY, 0]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        onPreview(index);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        onPreview(null);
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (!drag.current || drag.current.moved < 7) onSelect(index);
      }}
    >
      <RoundedBox
        args={[width, height, depth]}
        radius={0.045}
        smoothness={4}
      >
        <meshStandardMaterial
          ref={materialRef}
          color={LAYER_TINT[index]}
          metalness={0.46}
          roughness={0.4}
          emissive="#ff5200"
          emissiveIntensity={0.025}
        />
      </RoundedBox>

      {/* Corner fasteners keep the stack reading as a physical assembly. */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], screwIndex) => (
        <mesh
          key={`screw-${screwIndex}`}
          position={[
            sx * (width / 2 - 0.12),
            top,
            sz * (depth / 2 - 0.12),
          ]}
        >
          <cylinderGeometry args={[0.028, 0.028, 0.018, 10]} />
          <meshStandardMaterial
            color="#4b443e"
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Each module carries a different top-side signature. */}
      {index === 0 && (
        <group position={[0.55, 0, 0.16]}>
          <mesh position={[0, top, 0]}>
            <boxGeometry args={[0.42, 0.018, 0.74]} />
            <meshStandardMaterial
              color="#17141a"
              metalness={0.62}
              roughness={0.28}
            />
          </mesh>
          <mesh position={[0, top + 0.013, 0]}>
            <boxGeometry args={[0.32, 0.006, 0.62]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive="#ff5a00"
              emissiveIntensity={active ? 0.9 : 0.4}
              metalness={0.3}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0, top + 0.017, -0.28]}>
            <boxGeometry args={[0.12, 0.006, 0.035]} />
            <meshBasicMaterial color={HOT} />
          </mesh>
        </group>
      )}

      {index === 1 && (
        <group position={[-0.68, 0, -0.36]}>
          <mesh position={[0, top, 0]}>
            <boxGeometry args={[1.08, 0.018, 0.66]} />
            <meshStandardMaterial
              color="#17151a"
              metalness={0.58}
              roughness={0.3}
            />
          </mesh>
          {[-0.21, 0, 0.21].map((z) => (
            <mesh key={`web-bar-${z}`} position={[0, top + 0.013, z]}>
              <boxGeometry args={[0.88, 0.006, 0.032]} />
              <meshBasicMaterial
                color={ACCENT}
                transparent
                opacity={active ? 0.95 : 0.42}
              />
            </mesh>
          ))}
        </group>
      )}

      {index === 2 && (
        <group position={[0.04, 0, 0.04]}>
          {[0.18, 0.33, 0.48].map((radius, ringIndex) => (
            <mesh
              key={`signal-ring-${radius}`}
              rotation-x={-Math.PI / 2}
              position={[0, top + 0.004 + ringIndex * 0.002, 0]}
            >
              <ringGeometry args={[radius, radius + 0.011, 64]} />
              <meshBasicMaterial
                color={ACCENT}
                transparent
                opacity={active ? 0.85 : 0.33}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
          <mesh position={[0, top + 0.016, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color={HOT} />
          </mesh>
        </group>
      )}

      {index === 3 && (
        <group position={[-0.66, 0, 0.12]}>
          {[-0.22, 0, 0.22].map((x) =>
            [-0.18, 0, 0.18].map((z) => (
              <mesh key={`cms-${x}-${z}`} position={[x, top, z]}>
                <boxGeometry args={[0.13, 0.02, 0.13]} />
                <meshStandardMaterial
                  color={ACCENT}
                  emissive="#ff5a00"
                  emissiveIntensity={active ? 0.5 : 0.16}
                  metalness={0.4}
                  roughness={0.3}
                />
              </mesh>
            )),
          )}
        </group>
      )}

      {index === 4 && (
        <group position={[0.2, 0, 0.16]}>
          {[0.45, 0.72, 0.98, 1.24].map((length, barIndex) => (
            <mesh
              key={`speed-${length}`}
              position={[-0.56 + length / 2, top, -0.16 + barIndex * 0.11]}
            >
              <boxGeometry args={[length, 0.014, 0.052]} />
              <meshBasicMaterial
                color={barIndex === 3 ? HOT : ACCENT}
                transparent
                opacity={active ? 0.95 : 0.42}
              />
            </mesh>
          ))}
        </group>
      )}

      <mesh position={[0, top, 0]}>
        <boxGeometry args={[0.4, 0.024, 0.28]} />
        <meshStandardMaterial
          color="#211a14"
          emissive="#ff4b00"
          emissiveIntensity={active ? 0.9 : 0.24}
          metalness={0.55}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
};

/** A ring that glides to the active layer instead of blinking between rows. */
const ActiveHalo: React.FC<{
  activeIndex: number;
  reducedMotion: boolean;
}> = ({ activeIndex, reducedMotion }) => {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.MeshBasicMaterial>(null);
  const outerRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || !innerRef.current || !outerRef.current) return;
    const step = Math.min(delta, 0.1);
    const targetY = LAYER_Y[activeIndex] + 0.02;
    const targetScale =
      Math.max(LAYER_SIZE[activeIndex][0], LAYER_SIZE[activeIndex][2]) * 0.62;

    if (reducedMotion) {
      groupRef.current.position.y = targetY;
      groupRef.current.scale.setScalar(targetScale);
      innerRef.current.opacity = 0.58;
      outerRef.current.opacity = 0.16;
      return;
    }

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetY,
      5,
      step,
    );
    const scale = THREE.MathUtils.damp(
      groupRef.current.scale.x,
      targetScale,
      5,
      step,
    );
    groupRef.current.scale.setScalar(scale);
    innerRef.current.opacity = THREE.MathUtils.damp(
      innerRef.current.opacity,
      0.58,
      5,
      step,
    );
    outerRef.current.opacity = THREE.MathUtils.damp(
      outerRef.current.opacity,
      0.16,
      5,
      step,
    );
  });

  return (
    <group ref={groupRef} rotation-x={-Math.PI / 2}>
      <mesh>
        <ringGeometry args={[1, 1.008, 128]} />
        <meshBasicMaterial
          ref={innerRef}
          color={ACCENT}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[1.18, 1.183, 128]} />
        <meshBasicMaterial
          ref={outerRef}
          color={ACCENT}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

/** A small custom shader: two crossed planes form a rising energy column. */
const EnergyBeam: React.FC<{ reducedMotion: boolean }> = ({
  reducedMotion,
}) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float band = fract(vUv.y * 2.5 - uTime * 0.22);
            float pulse = smoothstep(0.0, 0.1, band) * smoothstep(0.42, 0.1, band);
            float edge = smoothstep(0.0, 0.16, vUv.x) * smoothstep(1.0, 0.84, vUv.x);
            float alpha = (0.07 + pulse * 0.68) * edge;
            gl_FragColor = vec4(1.0, 0.48, 0.08, alpha);
          }
        `,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!reducedMotion) {
      material.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.22, 3.6]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.22, 3.6]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 3.6, 8]} />
        <meshBasicMaterial
          color="#ffb15c"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

const CoreDust: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(84 * 3);
    for (let i = 0; i < 84; i++) {
      const angle = i * 2.399963;
      const radius = 2.1 + ((i * 37) % 23) / 10;
      const y = -1.9 + ((i * 53) % 38) / 10;
      array[i * 3] = Math.cos(angle) * radius;
      array[i * 3 + 1] = y;
      array[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return array;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    pointsRef.current.rotation.y = clock.elapsedTime * 0.018;
    pointsRef.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#ff9b4a"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const StackScene: React.FC<{
  activeIndex: number;
  previewIndex: number | null;
  reducedMotion: boolean;
  drag: React.RefObject<CoreDrag>;
  onSelect: (index: number) => void;
  onPreview: (index: number | null) => void;
}> = ({
  activeIndex,
  previewIndex,
  reducedMotion,
  drag,
  onSelect,
  onPreview,
}) => {
  const stackRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!stackRef.current || !drag.current) return;
    const step = Math.min(delta, 0.1);

    if (reducedMotion) {
      stackRef.current.rotation.y = drag.current.targetY;
      stackRef.current.rotation.x = drag.current.targetX;
      stackRef.current.position.y = 0;
      return;
    }

    if (!drag.current.dragging) {
      drag.current.targetY = THREE.MathUtils.clamp(
        drag.current.targetY + drag.current.velocityY,
        -0.95,
        0.95,
      );
      drag.current.velocityY *= Math.exp(-3.2 * step);
    }

    const sway = Math.sin(clock.elapsedTime * 0.33) * 0.055;
    stackRef.current.rotation.y = THREE.MathUtils.damp(
      stackRef.current.rotation.y,
      drag.current.targetY + sway,
      5,
      step,
    );
    stackRef.current.rotation.x = THREE.MathUtils.damp(
      stackRef.current.rotation.x,
      drag.current.targetX,
      5,
      step,
    );
    stackRef.current.position.y =
      Math.sin(clock.elapsedTime * 0.58) * 0.026;
  });

  return (
    <>
      <ambientLight intensity={0.38} />
      <directionalLight
        position={[4.5, 6, 4]}
        intensity={3.4}
        color="#fff3e4"
      />
      <directionalLight
        position={[-5, 3, -4]}
        intensity={1.4}
        color="#ff6a12"
      />
      <directionalLight
        position={[3, 1.5, -5]}
        intensity={1.2}
        color="#8ea6ff"
      />

      <group ref={stackRef}>
        <EnergyBeam reducedMotion={reducedMotion} />
        {LAYER_SIZE.map((_, index) => (
          <ServiceLayer
            key={index}
            index={index}
            active={activeIndex === index}
            preview={previewIndex === index}
            reducedMotion={reducedMotion}
            drag={drag}
            onSelect={onSelect}
            onPreview={onPreview}
          />
        ))}
        <ActiveHalo
          activeIndex={activeIndex}
          reducedMotion={reducedMotion}
        />
        <group position={[0, -1.6, 0]}>
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[2.05, 2.062, 96]} />
            <meshBasicMaterial
              color={ACCENT}
              transparent
              opacity={0.16}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[2.75, 2.757, 96]} />
            <meshBasicMaterial
              color={ACCENT}
              transparent
              opacity={0.06}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>

      <CoreDust reducedMotion={reducedMotion} />
    </>
  );
};

const CssStackFallback: React.FC<{ activeIndex: number }> = ({
  activeIndex,
}) => (
  <div className="flex h-full w-full items-center justify-center">
    <div
      className="relative h-48 w-56"
      style={{ transform: "rotateX(56deg) rotateZ(-30deg)" }}
    >
      {LAYER_SIZE.map(([width, , depth], index) => (
        <div
          key={index}
          className={`absolute left-1/2 top-1/2 rounded border transition-all duration-500 ${
            activeIndex === index
              ? "border-[#ff7900] bg-[#ff7900]/15 shadow-[0_0_30px_rgba(255,121,0,0.3)]"
              : "border-[#3a3028] bg-[#121116]"
          }`}
          style={{
            width: `${width * 38}px`,
            height: `${depth * 30}px`,
            transform: `translate(-50%, -50%) translateY(${
              (index - 2) * 24
            }px) translateZ(${activeIndex === index ? 18 : 0}px)`,
          }}
        />
      ))}
    </div>
  </div>
);

export const CapabilityCore: React.FC<CapabilityCoreProps> = ({
  services,
  activeIndex,
  previewIndex,
  onSelect,
  onPreview,
  reducedMotion,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<CoreDrag>({
    targetX: 0.06,
    targetY: 0,
    velocityY: 0,
    moved: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });
  const [inView, setInView] = useState(false);
  const [webgl, setWebgl] = useState(() => detectWebGL());

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "220px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!webgl) {
      const retry = window.setTimeout(() => setWebgl(detectWebGL()), 1200);
      return () => window.clearTimeout(retry);
    }
    return undefined;
  }, [webgl]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = true;
    dragRef.current.moved = 0;
    dragRef.current.velocityY = 0;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.dragging) return;
    const dx = event.clientX - drag.lastX;
    const dy = event.clientY - drag.lastY;

    drag.moved += Math.abs(dx) + Math.abs(dy);
    drag.targetY = THREE.MathUtils.clamp(drag.targetY + dx * 0.008, -0.95, 0.95);
    drag.targetX = THREE.MathUtils.clamp(
      drag.targetX + dy * 0.004,
      -0.24,
      0.32,
    );
    drag.velocityY = dx * 0.00085;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
  };

  const endDrag = () => {
    dragRef.current.dragging = false;
  };

  const active = services[activeIndex] ?? services[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#26262e] bg-[#07070a] shadow-[16px_22px_70px_rgba(0,0,0,0.62)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,121,0,0.14),transparent_63%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,121,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,121,0,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at 50% 48%, black 8%, transparent 74%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 48%, black 8%, transparent 74%)",
        }}
      />

      {/* Console chrome */}
      <div className="relative z-20 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.18em]">
        <span className="flex min-w-0 items-center gap-2 text-[#8a8780]">
          <span className="h-1.5 w-1.5 shrink-0 bg-[#ff7900]" />
          <span className="truncate">
            CAPABILITY_CORE <span className="text-[#46464e]">/</span>{" "}
            <span className="text-white">05_LAYERS</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[#ff9029]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff7900] shadow-[0_0_8px_#ff7900]" />
          {String(activeIndex + 1).padStart(2, "0")} / 05
        </span>
      </div>

      {/* 3D viewport */}
      <div
        ref={hostRef}
        aria-hidden="true"
        data-cursor="pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className="relative h-[350px] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[430px] lg:h-[500px]"
      >
        {webgl ? (
          <Canvas
            dpr={[1, 1.8]}
            frameloop={inView ? "always" : "demand"}
            camera={{
              position: [4.6, 3.4, 6.3],
              fov: 32,
              near: 0.1,
              far: 40,
            }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
            }}
            onCreated={({ camera, gl }) => {
              camera.lookAt(0, 0.05, 0);
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.15;
            }}
          >
            <StackScene
              activeIndex={activeIndex}
              previewIndex={previewIndex}
              reducedMotion={reducedMotion}
              drag={dragRef}
              onSelect={onSelect}
              onPreview={onPreview}
            />
          </Canvas>
        ) : (
          <CssStackFallback activeIndex={activeIndex} />
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3"
        >
          <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-[#ff7900]/50" />
          <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-[#ff7900]/50" />
          <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[#ff7900]/50" />
          <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[#ff7900]/50" />
        </div>

        <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-[#ff9029]/70 sm:inset-x-5">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 bg-[#ff7900]" />
            {active.short}
          </span>
          <span className="hidden sm:inline">DRAG TO ROTATE</span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center">
          <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-[#ff7900]/60 sm:hidden">
            [ TAP A LAYER ]
          </span>
          <span className="hidden font-mono text-[8px] uppercase tracking-[0.24em] text-[#ff7900]/50 sm:inline">
            [ CLICK A LAYER TO INSPECT ]
          </span>
        </div>
      </div>

      {/* Console footer */}
      <div className="relative z-20 flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-display text-sm font-bold tracking-tight text-white sm:text-base">
            {active.num} <span className="text-[#ff7900]">/</span>{" "}
            {active.short}
          </div>
          <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#7b776f]">
            MODULE LOCKED · SIGNAL STABLE
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() =>
              onSelect(
                (activeIndex - 1 + services.length) % services.length,
              )
            }
            aria-label="Previous capability layer"
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#2a2a32] text-[#a39f96] outline-none transition-colors hover:border-[#ff7900]/60 hover:text-[#ff7900] focus-visible:ring-2 focus-visible:ring-[#ff7900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070a]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-mono text-[9px] tracking-[0.15em] text-[#7b776f]">
            {active.num}/05
          </span>
          <button
            type="button"
            onClick={() => onSelect((activeIndex + 1) % services.length)}
            aria-label="Next capability layer"
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#2a2a32] text-[#a39f96] outline-none transition-colors hover:border-[#ff7900]/60 hover:text-[#ff7900] focus-visible:ring-2 focus-visible:ring-[#ff7900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070a]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
