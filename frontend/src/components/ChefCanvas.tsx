import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import type { Group } from "three";

export type ChefMood = "wave" | "idle" | "cheer";

const SKIN = "#e0a47c";
const COAT = "#f6f1e8";
const APRON = "#3f6844";
const GOLD = "#e9b872";
const TERRA = "#c8664a";
const DARK = "#2a1d15";

type Pointer = { x: number; y: number };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function Chef({ mood, bounceKey, pointer }: { mood: ChefMood; bounceKey: number; pointer: RefObject<Pointer> }) {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const pupils = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const lastKey = useRef(bounceKey);
  const bounceAt = useRef(-10);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    const r = root.current;
    const h = head.current;
    if (!r || !h || !eyes.current || !pupils.current || !armL.current || !armR.current) return;
    const k = 1 - Math.pow(0.001, delta);
    const ka = 1 - Math.pow(0.00002, delta);

    if (lastKey.current !== bounceKey) {
      lastKey.current = bounceKey;
      bounceAt.current = t;
    }
    const e = t - bounceAt.current;
    const b = e < 0.75 ? Math.sin((e / 0.75) * Math.PI) : 0;
    const jump = mood === "cheer" ? Math.abs(Math.sin(t * 6)) * 0.16 : 0;

    r.position.y = Math.sin(t * 2) * 0.05 + b * 0.38 + jump;
    r.scale.set(1 - b * 0.05, 1 + b * 0.07, 1 - b * 0.05);
    r.rotation.y = lerp(r.rotation.y, p.x * 0.35 + b * Math.sin(e * 20) * 0.2, k);
    r.rotation.z = Math.sin(t * 1.3) * 0.03;

    h.rotation.y = lerp(h.rotation.y, p.x * 0.55, k);
    h.rotation.x = lerp(h.rotation.x, -p.y * 0.35, k);
    pupils.current.position.x = lerp(pupils.current.position.x, p.x * 0.035, k);
    pupils.current.position.y = lerp(pupils.current.position.y, p.y * 0.03, k);
    eyes.current.scale.y = t % 3.8 < 0.12 ? 0.12 : 1;

    let tl = -0.18 - Math.sin(t * 1.6) * 0.04;
    let tr = 0.18 + Math.sin(t * 1.6) * 0.04;
    if (mood === "wave") tr = 2.6 + Math.sin(t * 9) * 0.4;
    if (mood === "cheer") {
      tr = 2.75 + Math.sin(t * 12) * 0.22;
      tl = -2.75 - Math.sin(t * 12) * 0.22;
    }
    tl -= b * 0.9;
    tr += b * 0.9;
    armL.current.rotation.z = lerp(armL.current.rotation.z, tl, ka);
    armR.current.rotation.z = lerp(armR.current.rotation.z, tr, ka);
  });

  return (
    <group ref={root}>
      <mesh position={[0, -1.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, -1.45, 0]}>
            <cylinderGeometry args={[0.14, 0.13, 0.32, 16]} />
            <meshStandardMaterial color={DARK} roughness={0.8} />
          </mesh>
          <mesh position={[0, -1.62, 0.07]} scale={[1, 0.6, 1.4]}>
            <sphereGeometry args={[0.15, 20, 16]} />
            <meshStandardMaterial color="#1a120d" roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.55, 0]}>
        <capsuleGeometry args={[0.55, 0.6, 12, 24]} />
        <meshStandardMaterial color={COAT} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.565, 0.63, 0.8, 32, 1, true, -Math.PI * 0.42, Math.PI * 0.84]} />
        <meshStandardMaterial color={APRON} roughness={0.85} side={2} />
      </mesh>
      <mesh position={[0, -0.27, 0.545]}>
        <boxGeometry args={[0.42, 0.34, 0.03]} />
        <meshStandardMaterial color={APRON} roughness={0.85} />
      </mesh>
      {[
        [-0.3, 0.02, 0.4],
        [0.3, 0.02, 0.4],
        [-0.33, -0.2, 0.47],
        [0.33, -0.2, 0.47],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.075, 12, 32]} />
        <meshStandardMaterial color={TERRA} roughness={0.6} />
      </mesh>
      <mesh position={[0.08, 0.12, 0.3]} rotation={[0.4, 0, -0.5]}>
        <coneGeometry args={[0.09, 0.2, 12]} />
        <meshStandardMaterial color={TERRA} roughness={0.6} />
      </mesh>
      {[
        { ref: armL, x: -0.6, side: -1 },
        { ref: armR, x: 0.6, side: 1 },
      ].map(({ ref, x, side }) => (
        <group key={side} ref={ref} position={[x, -0.02, 0]} rotation={[0, 0, side * 0.18]}>
          <mesh position={[0, -0.32, 0]}>
            <capsuleGeometry args={[0.13, 0.42, 8, 16]} />
            <meshStandardMaterial color={COAT} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.66, 0]}>
            <sphereGeometry args={[0.16, 20, 16]} />
            <meshStandardMaterial color="#fffdf8" roughness={0.5} />
          </mesh>
        </group>
      ))}
      <group ref={head} position={[0, 0.72, 0]}>
        <mesh>
          <sphereGeometry args={[0.46, 40, 32]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.45, -0.02, 0]} scale={[0.5, 1, 1]}>
            <sphereGeometry args={[0.11, 16, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.55} />
          </mesh>
        ))}
        <group ref={eyes} position={[0, 0.06, 0]}>
          {[-0.15, 0.15].map((x) => (
            <mesh key={x} position={[x, 0, 0.39]}>
              <sphereGeometry args={[0.095, 24, 20]} />
              <meshStandardMaterial color="#ffffff" roughness={0.15} />
            </mesh>
          ))}
          <group ref={pupils}>
            {[-0.15, 0.15].map((x) => (
              <group key={x} position={[x, 0, 0.47]}>
                <mesh>
                  <sphereGeometry args={[0.052, 20, 16]} />
                  <meshStandardMaterial color="#1b120c" roughness={0.1} />
                </mesh>
                <mesh position={[0.018, 0.02, 0.045]}>
                  <sphereGeometry args={[0.014, 8, 8]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            ))}
          </group>
        </group>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.15, 0.2, 0.41]} rotation={[0, 0, s * -0.15]} scale={[1.6, 0.4, 0.6]}>
            <sphereGeometry args={[0.055, 12, 8]} />
            <meshStandardMaterial color={DARK} roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, -0.05, 0.46]}>
          <sphereGeometry args={[0.075, 20, 16]} />
          <meshStandardMaterial color="#d38f68" roughness={0.5} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.09, -0.14, 0.43]} rotation={[0, 0, s * 0.35]} scale={[1.7, 0.6, 0.8]}>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshStandardMaterial color={DARK} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, -0.21, 0.39]} rotation={[0.2, 0, Math.PI]}>
          <torusGeometry args={[0.08, 0.016, 8, 20, Math.PI]} />
          <meshStandardMaterial color="#7a2f22" roughness={0.6} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.27, -0.09, 0.33]}>
            <sphereGeometry args={[0.07, 12, 10]} />
            <meshStandardMaterial color="#e8806a" roughness={0.7} transparent opacity={0.55} />
          </mesh>
        ))}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.38, 0.4, 0.24, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.025, 8, 40]} />
          <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.35} />
        </mesh>
        {[
          [0, 0.72, 0, 0.3],
          [-0.22, 0.62, 0, 0.22],
          [0.22, 0.62, 0, 0.22],
          [0, 0.62, 0.2, 0.22],
          [0, 0.62, -0.2, 0.22],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[r, 24, 20]} />
            <meshStandardMaterial color="#ffffff" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function ChefCanvas({ mood, bounceKey = 0, className }: { mood: ChefMood; bounceKey?: number; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.3;
      pointer.current.x = clamp((e.clientX - cx) / (window.innerWidth / 2), -1, 1);
      pointer.current.y = clamp(-(e.clientY - cy) / (window.innerHeight / 2), -1, 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={wrap} className={className} role="img" aria-label="Interactive 3D Chef Crave mascot">
      <Canvas camera={{ position: [0, 0.05, 7.5], fov: 30 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 4, 5]} intensity={1.8} color="#ffe2b8" />
        <directionalLight position={[-4, 2, 2]} intensity={0.4} color="#ffd1a8" />
        <pointLight position={[-2.5, 1.5, -2]} intensity={12} color={TERRA} />
        <Chef mood={mood} bounceKey={bounceKey} pointer={pointer} />
      </Canvas>
    </div>
  );
}
