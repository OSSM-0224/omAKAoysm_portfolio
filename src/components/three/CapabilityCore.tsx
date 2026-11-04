import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  RoundedBox,
  Edges,
  Html,
  Environment,
  Lightformer,
  useCursor,
} from "@react-three/drei";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as THREE from "three";
import type { ServiceOffering } from "../../data/services";

/* -------------------------------------------------------------------------- */
/*  Layout constants                                                          */
/* -------------------------------------------------------------------------- */

/** [width, depth] of each plate. Order matches SERVICES. */
const LAYER_FOOTPRINT: ReadonlyArray<readonly [number, number]> = [
  [2.3, 1.7],
  [3.0, 2.0],
  [2.6, 2.6],
  [2.9, 1.9],
  [3.1, 1.7],
];

const PLATE_H = 0.2;
/** Exploded view: a full unit between plates so every layer reads on its own. */
const LAYER_Y = [2.0, 1.0, 0, -1.0, -2.0];
const FLOOR_Y = -2.55;

const ACCENT = "#ff7900";
const HOT = "#ffb15c";
const EMBER = "#ff5200";
const EDGE_IDLE = "#5a3a22";

interface CoreDrag {
  targetX: number;
  targetY: number;
  velocityY: number;
  moved: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
}

interface LevelRef {
  current: number;
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
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Materials tagged with `userData.glow` get brighter as a layer becomes
 * active. One traversal only when the level actually changed.
 */
function applyGlow(root: THREE.Object3D, level: number) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.Material;
    const glow = mat.userData?.glow as number | undefined;
    if (glow === undefined) return;
    if ("emissiveIntensity" in mat) {
      (mat as THREE.MeshStandardMaterial).emissiveIntensity =
        glow * (0.3 + 1.3 * level);
    } else if (mat.transparent) {
      mat.opacity = Math.min(1, glow * (0.35 + 0.65 * level));
    }
  });
}

/* -------------------------------------------------------------------------- */
/*  Glyphs: one bold, readable object per layer                               */
/* -------------------------------------------------------------------------- */

interface GlyphProps {
  level: LevelRef;
  reducedMotion: boolean;
}

/** 01 Mobile: two upright phones (iOS + Android). */
const PhoneGlyph: React.FC = () => (
  <group>
    {[-0.34, 0.34].map((x, i) => (
      <group key={x} position={[x, 0.27, 0]} rotation-y={i === 0 ? 0.3 : -0.3}>
        <RoundedBox args={[0.34, 0.54, 0.05]} radius={0.04} smoothness={3}>
          <meshPhysicalMaterial
            color="#14141a"
            metalness={0.8}
            roughness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.2}
          />
          <Edges threshold={35} color="#7a5230" />
        </RoundedBox>
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[0.28, 0.46]} />
          <meshStandardMaterial
            color="#2a1608"
            emissive={ACCENT}
            emissiveIntensity={0.5}
            userData={{ glow: 0.8 }}
          />
        </mesh>
        {[
          [-0.07, 0.1],
          [0.07, 0.1],
          [-0.07, -0.04],
          [0.07, -0.04],
        ].map(([tx, ty]) => (
          <mesh key={`${tx}-${ty}`} position={[tx, ty, 0.029]}>
            <planeGeometry args={[0.094, 0.094]} />
            <meshBasicMaterial
              color={HOT}
              transparent
              opacity={0.5}
              userData={{ glow: 0.9 }}
            />
          </mesh>
        ))}
        <mesh position={[0, -0.16, 0.029]}>
          <planeGeometry args={[0.2, 0.05]} />
          <meshBasicMaterial color="#120a04" transparent opacity={0.85} />
        </mesh>
      </group>
    ))}
  </group>
);

/** 02 Web: an upright browser window with a title bar and content lines. */
const BrowserGlyph: React.FC = () => (
  <group position={[0, 0.3, -0.1]} rotation-y={-0.14}>
    <RoundedBox args={[1.25, 0.56, 0.05]} radius={0.03} smoothness={3}>
      <meshPhysicalMaterial
        color="#14141a"
        metalness={0.8}
        roughness={0.3}
        clearcoat={1}
        clearcoatRoughness={0.2}
      />
      <Edges threshold={35} color="#7a5230" />
    </RoundedBox>
    <mesh position={[0, 0.235, 0.027]}>
      <planeGeometry args={[1.2, 0.07]} />
      <meshBasicMaterial color="#2a180a" />
    </mesh>
    {[-0.54, -0.47, -0.4].map((x, i) => (
      <mesh key={x} position={[x, 0.235, 0.03]}>
        <circleGeometry args={[0.016, 12]} />
        <meshBasicMaterial color={i === 0 ? HOT : ACCENT} />
      </mesh>
    ))}
    {[
      { w: 0.62, y: 0.1 },
      { w: 0.44, y: 0.02 },
      { w: 0.54, y: -0.06 },
      { w: 0.3, y: -0.14 },
    ].map(({ w, y }) => (
      <mesh key={y} position={[-0.58 + 0.06 + w / 2, y, 0.028]}>
        <planeGeometry args={[w, 0.034]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={0.5}
          userData={{ glow: 0.95 }}
        />
      </mesh>
    ))}
    <mesh position={[0.4, -0.02, 0.028]}>
      <planeGeometry args={[0.32, 0.36]} />
      <meshStandardMaterial
        color="#2a1608"
        emissive={ACCENT}
        emissiveIntensity={0.4}
        userData={{ glow: 0.7 }}
      />
    </mesh>
  </group>
);

/** 03 Realtime: pulses radiating from a core, with nodes orbiting it. */
const RealtimeGlyph: React.FC<GlyphProps> = ({ level, reducedMotion }) => {
  const orbit = useRef<THREE.Group>(null);
  const pulses = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (orbit.current && !reducedMotion) orbit.current.rotation.y = t * 0.9;
    pulses.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = reducedMotion ? 0.25 + i * 0.3 : (t * 0.35 + i / 3) % 1;
      mesh.scale.setScalar(0.25 + p * 0.9);
      (mesh.material as THREE.MeshBasicMaterial).opacity =
        (1 - p) * (0.3 + 0.6 * level.current);
    });
  });

  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            pulses.current[i] = m;
          }}
          rotation-x={-Math.PI / 2}
        >
          <ringGeometry args={[0.97, 1, 64]} />
          <meshBasicMaterial
            color={ACCENT}
            transparent
            opacity={0.4}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]}>
        <ringGeometry args={[0.6, 0.615, 64]} />
        <meshBasicMaterial
          color={HOT}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          userData={{ glow: 0.9 }}
        />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial
          color="#2a1608"
          emissive={HOT}
          emissiveIntensity={1}
          userData={{ glow: 1.3 }}
        />
      </mesh>
      <group ref={orbit} position={[0, 0.16, 0]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial
                color="#2a1608"
                emissive={ACCENT}
                emissiveIntensity={1}
                userData={{ glow: 1 }}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

const CMS_HEIGHTS = [0.18, 0.34, 0.22, 0.4, 0.16, 0.3, 0.24, 0.2, 0.36];

/** 04 CMS: a grid of content blocks that ripple when the layer is active. */
const CmsGlyph: React.FC<GlyphProps> = ({ level, reducedMotion }) => {
  const blocks = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    blocks.current.forEach((g, i) => {
      if (!g) return;
      g.scale.y = reducedMotion
        ? 1
        : 1 + Math.sin(t * 1.5 + i * 0.8) * 0.2 * level.current;
    });
  });

  return (
    <group>
      {CMS_HEIGHTS.map((h, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <group
            key={i}
            ref={(g) => {
              blocks.current[i] = g;
            }}
            position={[(col - 1) * 0.36, 0, (row - 1) * 0.36]}
          >
            <RoundedBox
              args={[0.28, h, 0.28]}
              radius={0.02}
              smoothness={2}
              position={[0, h / 2, 0]}
            >
              <meshStandardMaterial
                color="#2b180c"
                metalness={0.5}
                roughness={0.35}
                emissive={ACCENT}
                emissiveIntensity={0.4}
                userData={{ glow: 0.45 + h }}
              />
            </RoundedBox>
          </group>
        );
      })}
    </group>
  );
};

/** 05 Performance: a speedometer whose needle sweeps to the top when active. */
const PerformanceGlyph: React.FC<GlyphProps> = ({ level, reducedMotion }) => {
  const needle = useRef<THREE.Group>(null);
  const value = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!needle.current) return;
    const target = level.current > 0.5 ? 0.92 : 0.38;
    value.current = reducedMotion
      ? target
      : THREE.MathUtils.damp(value.current, target, 3, Math.min(delta, 0.1));
    const jitter =
      reducedMotion || level.current < 0.5
        ? 0
        : Math.sin(clock.elapsedTime * 9) * 0.015;
    needle.current.rotation.z = Math.PI * (1 - value.current) + jitter;
  });

  const segments = [
    { rot: (2 * Math.PI) / 3, color: "#7a3d0c", glow: 0.5 },
    { rot: Math.PI / 3, color: ACCENT, glow: 0.9 },
    { rot: 0, color: HOT, glow: 1.2 },
  ];

  return (
    <group>
      <group position={[0, 0.07, 0]} rotation-y={-0.14}>
        {segments.map(({ rot, color, glow }) => (
          <mesh key={rot} rotation-z={rot}>
            <torusGeometry args={[0.46, 0.045, 12, 24, Math.PI / 3 - 0.04]} />
            <meshStandardMaterial
              color="#2a1608"
              emissive={color}
              emissiveIntensity={0.6}
              userData={{ glow }}
            />
          </mesh>
        ))}
        <group ref={needle}>
          <mesh position={[0.22, 0, 0.01]}>
            <boxGeometry args={[0.44, 0.03, 0.022]} />
            <meshStandardMaterial
              color="#2a1608"
              emissive={HOT}
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.055, 0.055, 0.04, 20]} />
          <meshStandardMaterial
            color="#3a342e"
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>
      </group>
      {[0.5, 0.8, 1.1].map((len, i) => (
        <mesh key={len} position={[-0.55 + len / 2, 0.006, 0.4 + i * 0.1]}>
          <boxGeometry args={[len, 0.012, 0.04]} />
          <meshBasicMaterial
            color={i === 2 ? HOT : ACCENT}
            transparent
            opacity={0.45}
            userData={{ glow: 0.95 }}
          />
        </mesh>
      ))}
    </group>
  );
};

/** PCB-style traces running from the glyph to the plate edge. */
const TRACE_START: ReadonlyArray<number | null> = [0.62, 0.8, null, 0.8, 0.8];

const Traces: React.FC<{ index: number; width: number }> = ({
  index,
  width,
}) => {
  const start = TRACE_START[index];
  if (start === null || start === undefined) return null;
  const dir = index % 2 === 0 ? 1 : -1;
  const baseLen = width / 2 - start - 0.2;

  return (
    <group>
      {[
        { z: -0.5, shorten: 0 },
        { z: 0.5, shorten: 0.2 },
      ].map(({ z, shorten }) => {
        const len = baseLen - shorten;
        if (len < 0.1) return null;
        return (
          <group key={z}>
            <mesh position={[dir * (start + len / 2), 0.004, z]}>
              <boxGeometry args={[len, 0.008, 0.016]} />
              <meshBasicMaterial
                color={ACCENT}
                transparent
                opacity={0.4}
                userData={{ glow: 0.9 }}
              />
            </mesh>
            <mesh position={[dir * (start + len + 0.03), 0.008, z]}>
              <boxGeometry args={[0.06, 0.014, 0.06]} />
              <meshBasicMaterial
                color={HOT}
                transparent
                opacity={0.5}
                userData={{ glow: 1 }}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/* -------------------------------------------------------------------------- */
/*  One inspectable plate                                                     */
/* -------------------------------------------------------------------------- */

const ServiceLayer: React.FC<{
  index: number;
  label: string;
  active: boolean;
  preview: boolean;
  reducedMotion: boolean;
  drag: React.RefObject<CoreDrag>;
  onSelect: (index: number) => void;
  onPreview: (index: number | null) => void;
}> = ({
  index,
  label,
  active,
  preview,
  reducedMotion,
  drag,
  onSelect,
  onPreview,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glyphRef = useRef<THREE.Group>(null);
  const plateMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const level = useRef(0.18);
  const applied = useRef(-1);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const [width, depth] = LAYER_FOOTPRINT[index];
  const baseY = LAYER_Y[index];
  const top = PLATE_H / 2;

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const step = Math.min(delta, 0.1);
    const yTarget = baseY + (active ? 0.14 : preview ? 0.06 : 0);
    const levelTarget = active ? 1 : preview ? 0.6 : 0.18;

    if (reducedMotion) {
      group.position.y = yTarget;
      level.current = levelTarget;
    } else {
      group.position.y = THREE.MathUtils.damp(
        group.position.y,
        yTarget,
        5.5,
        step,
      );
      level.current = THREE.MathUtils.damp(level.current, levelTarget, 6, step);
    }

    if (Math.abs(level.current - applied.current) > 0.002) {
      applied.current = level.current;
      if (glyphRef.current) applyGlow(glyphRef.current, level.current);
      if (plateMat.current) {
        plateMat.current.emissiveIntensity = 0.02 + level.current * 0.16;
      }
    }
  });

  const edgeColor = active ? HOT : preview ? ACCENT : EDGE_IDLE;

  return (
    <group
      ref={groupRef}
      position={[0, baseY, 0]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
        onPreview(index);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(false);
        onPreview(null);
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (!drag.current || drag.current.moved < 7) onSelect(index);
      }}
    >
      {/* Body: glossy dark metal with a lit edge */}
      <RoundedBox args={[width, PLATE_H, depth]} radius={0.05} smoothness={3}>
        <meshPhysicalMaterial
          ref={plateMat}
          color="#0d0d12"
          metalness={0.85}
          roughness={0.26}
          clearcoat={1}
          clearcoatRoughness={0.18}
          emissive={EMBER}
          emissiveIntensity={0.04}
        />
        <Edges threshold={35} color={edgeColor} />
      </RoundedBox>

      {/* Recessed top panel */}
      <RoundedBox
        args={[width - 0.36, 0.012, depth - 0.36]}
        radius={0.01}
        smoothness={2}
        position={[0, top + 0.002, 0]}
      >
        <meshStandardMaterial color="#07070a" metalness={0.6} roughness={0.5} />
        <Edges threshold={35} color="#2d1c10" />
      </RoundedBox>

      {/* Corner fasteners */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz]) => (
        <mesh
          key={`screw-${sx}-${sz}`}
          position={[
            sx * (width / 2 - 0.1),
            top + 0.006,
            sz * (depth / 2 - 0.1),
          ]}
        >
          <cylinderGeometry args={[0.04, 0.04, 0.018, 12]} />
          <meshStandardMaterial
            color="#6a6058"
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Glyph + traces */}
      <group ref={glyphRef} position={[0, top + 0.012, 0]}>
        <Traces index={index} width={width} />
        {index === 0 && <PhoneGlyph />}
        {index === 1 && <BrowserGlyph />}
        {index === 2 && (
          <RealtimeGlyph level={level} reducedMotion={reducedMotion} />
        )}
        {index === 3 && (
          <CmsGlyph level={level} reducedMotion={reducedMotion} />
        )}
        {index === 4 && (
          <PerformanceGlyph level={level} reducedMotion={reducedMotion} />
        )}
      </group>

      {/* In-scene label, anchored to the front-left corner */}
      <Html
        position={[-width / 2 + 0.02, -PLATE_H / 2 - 0.16, depth / 2 + 0.1]}
        zIndexRange={[10, 0]}
        pointerEvents="none"
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{ transform: "translateY(-50%)" }}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-1.5 py-[3px] font-mono text-[9px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ${
            active
              ? "border-[#ff7900] bg-[#ff7900] text-black"
              : preview
                ? "border-[#ff7900]/70 bg-[#140c06]/90 text-[#ffb066]"
                : "border-[#2e2a26] bg-[#07070a]/80 text-[#8f8a81]"
          }`}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className="opacity-50">/</span>
          <span>{label}</span>
        </div>
      </Html>
    </group>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene extras                                                              */
/* -------------------------------------------------------------------------- */

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
    const [w, d] = LAYER_FOOTPRINT[activeIndex];
    const targetY = LAYER_Y[activeIndex] + 0.14;
    const targetScale = Math.max(w, d) * 0.62;

    if (reducedMotion) {
      groupRef.current.position.y = targetY;
      groupRef.current.scale.setScalar(targetScale);
      innerRef.current.opacity = 0.55;
      outerRef.current.opacity = 0.16;
      return;
    }

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetY,
      5,
      step,
    );
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 5, step),
    );
    innerRef.current.opacity = THREE.MathUtils.damp(
      innerRef.current.opacity,
      0.55,
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

/** Energy column that runs through the gaps between plates. */
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
            float band = fract(vUv.y * 4.0 - uTime * 0.25);
            float pulse = smoothstep(0.0, 0.1, band) * smoothstep(0.42, 0.1, band);
            float edge = smoothstep(0.0, 0.16, vUv.x) * smoothstep(1.0, 0.84, vUv.x);
            float alpha = (0.08 + pulse * 0.7) * edge;
            gl_FragColor = vec4(1.0, 0.48, 0.08, alpha);
          }
        `,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!reducedMotion) material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <group position={[0, 0.2, 0]}>
      <mesh>
        <planeGeometry args={[0.2, 5.4]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.2, 5.4]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.01, 0.01, 5.4, 8]} />
        <meshBasicMaterial
          color={HOT}
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
    const count = 72;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963;
      const radius = 2.2 + ((i * 37) % 23) / 12;
      const y = -2.4 + ((i * 53) % 52) / 10;
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
        size={0.03}
        color="#ff9b4a"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

/** Soft orange pool of light under the stack. Fakes bloom without post-processing. */
const FloorGlow: React.FC = () => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255,121,0,0.55)");
      grad.addColorStop(0.5, "rgba(255,121,0,0.14)");
      grad.addColorStop(1, "rgba(255,121,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={[0, FLOOR_Y, 0]}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[7.5, 7.5]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[2.05, 2.062, 96]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[2.85, 2.857, 96]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

const StackScene: React.FC<{
  labels: string[];
  activeIndex: number;
  previewIndex: number | null;
  reducedMotion: boolean;
  drag: React.RefObject<CoreDrag>;
  onSelect: (index: number) => void;
  onPreview: (index: number | null) => void;
}> = ({
  labels,
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
    stackRef.current.position.y = Math.sin(clock.elapsedTime * 0.58) * 0.026;
  });

  return (
    <>
      {/* Procedural studio lighting: gives the metal something to reflect, no network fetch. */}
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#fff1e0"
          position={[0, 6, 0]}
          rotation-x={Math.PI / 2}
          scale={[10, 10, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color="#ff7a1a"
          position={[-6, 1, 0]}
          rotation-y={Math.PI / 2}
          scale={[8, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#8ea6ff"
          position={[5, 2, -5]}
          rotation-y={-Math.PI / 4}
          scale={[6, 3, 1]}
        />
      </Environment>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[4.5, 6, 4]}
        intensity={2.2}
        color="#fff3e4"
      />
      <directionalLight
        position={[-5, 3, -4]}
        intensity={1.4}
        color="#ff6a12"
      />

      <group ref={stackRef}>
        <EnergyBeam reducedMotion={reducedMotion} />
        {LAYER_FOOTPRINT.map((_, index) => (
          <ServiceLayer
            key={index}
            index={index}
            label={labels[index] ?? ""}
            active={activeIndex === index}
            preview={previewIndex === index}
            reducedMotion={reducedMotion}
            drag={drag}
            onSelect={onSelect}
            onPreview={onPreview}
          />
        ))}
        <ActiveHalo activeIndex={activeIndex} reducedMotion={reducedMotion} />
        <FloorGlow />
      </group>

      <CoreDust reducedMotion={reducedMotion} />
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*  CSS fallback (no WebGL)                                                   */
/* -------------------------------------------------------------------------- */

const CssStackFallback: React.FC<{
  activeIndex: number;
  onSelect: (index: number) => void;
}> = ({ activeIndex, onSelect }) => (
  <div
    className="flex h-full w-full items-center justify-center"
    style={{ perspective: "1100px" }}
  >
    <div
      className="relative h-0 w-0"
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateX(60deg) rotateZ(-38deg)",
      }}
    >
      {LAYER_FOOTPRINT.map(([width, depth], index) => {
        const isActive = activeIndex === index;
        const z = LAYER_Y[index] * 44 + (isActive ? 12 : 0);
        return (
          <div
            key={index}
            onClick={() => onSelect(index)}
            className={`absolute cursor-pointer rounded-md border transition-all duration-500 ${
              isActive
                ? "border-[#ff7900] bg-[#ff7900]/20 shadow-[0_0_30px_rgba(255,121,0,0.35)]"
                : "border-[#4a3320] bg-[#121116]"
            }`}
            style={{
              left: 0,
              top: 0,
              width: `${width * 40}px`,
              height: `${depth * 40}px`,
              transform: `translate(-50%, -50%) translateZ(${z}px)`,
            }}
          />
        );
      })}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Public component                                                          */
/* -------------------------------------------------------------------------- */

const ARROW_BTN =
  "inline-flex h-10 w-10 items-center justify-center rounded border border-[#2a2a32] text-[#a39f96] outline-none transition-colors hover:border-[#ff7900]/60 hover:text-[#ff7900] focus-visible:ring-2 focus-visible:ring-[#ff7900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070a] sm:h-8 sm:w-8";

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
    targetX: 0.1,
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
    drag.targetY = THREE.MathUtils.clamp(
      drag.targetY + dx * 0.008,
      -0.95,
      0.95,
    );
    drag.targetX = THREE.MathUtils.clamp(drag.targetX + dy * 0.004, -0.15, 0.4);
    drag.velocityY = dx * 0.00085;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
  };

  const endDrag = () => {
    dragRef.current.dragging = false;
  };

  const active = services[activeIndex] ?? services[0];
  const labels = useMemo(
    () => services.map((s) => s.id.toUpperCase()),
    [services],
  );

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

      {/* Screen-reader announcement (the 3D view itself is decorative) */}
      <p className="sr-only" aria-live="polite">
        {active.num} of {String(services.length).padStart(2, "0")}:{" "}
        {active.title}
      </p>

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
        className="relative isolate h-[390px] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[460px] lg:h-[520px]"
      >
        {webgl ? (
          <Canvas
            dpr={[1, 1.75]}
            frameloop={inView ? "always" : "demand"}
            camera={{
              position: [5.4, 3.4, 7.8],
              fov: 36,
              near: 0.1,
              far: 50,
            }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
            }}
            onCreated={({ camera, gl }) => {
              camera.lookAt(0, 0.1, 0);
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.1;
            }}
          >
            <StackScene
              labels={labels}
              activeIndex={activeIndex}
              previewIndex={previewIndex}
              reducedMotion={reducedMotion}
              drag={dragRef}
              onSelect={onSelect}
              onPreview={onPreview}
            />
          </Canvas>
        ) : (
          <CssStackFallback activeIndex={activeIndex} onSelect={onSelect} />
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

        <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[#ffb066]/90 sm:inset-x-5">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 bg-[#ff7900]" />
            {active.short}
          </span>
          <span className="hidden sm:inline">DRAG TO ROTATE</span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center">
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#ffb066]/90 sm:hidden">
            [ TAP A LAYER ]
          </span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.24em] text-[#ffb066]/80 sm:inline">
            [ CLICK A LAYER TO INSPECT ]
          </span>
        </div>
      </div>

      {/* Console footer */}
      <div className="relative z-20 flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-bold tracking-tight text-white sm:text-base">
            {active.num} <span className="text-[#ff7900]">/</span>{" "}
            {active.short}
          </div>
          <div className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.14em] text-[#8f8a81]">
            {active.subtitle}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-1 sm:justify-end">
          <button
            type="button"
            onClick={() =>
              onSelect((activeIndex - 1 + services.length) % services.length)
            }
            aria-label="Previous capability layer"
            className={ARROW_BTN}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            role="group"
            aria-label="Capability layers"
            className="flex items-center"
          >
            {services.map((service, index) => (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelect(index)}
                aria-label={`Show ${service.short}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className="group/seg flex h-10 w-6 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#ff7900] sm:h-8"
              >
                <span
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-5 bg-[#ff7900]"
                      : "w-2.5 bg-[#2e2e36] group-hover/seg:bg-[#6b4a2e]"
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onSelect((activeIndex + 1) % services.length)}
            aria-label="Next capability layer"
            className={ARROW_BTN}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
