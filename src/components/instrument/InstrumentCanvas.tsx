import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Color,
  DoubleSide,
  MathUtils,
  PMREMGenerator,
  TubeGeometry,
  Vector3,
  type Group,
  type Mesh,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type Props = {
  open: boolean;
};

const brass = new Color("#8c784f");
const brassLite = new Color("#b49a62");
const brassDark = new Color("#5a492c");
const steel = new Color("#6d675c");
const glass = new Color("#e4d9c4");
const paper = "#f6f1e8";

function StudioEnvironment() {
  const { gl, scene } = useThree();

  useLayoutEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = texture;
    scene.background = new Color(paper);
    return () => {
      scene.environment = null;
      scene.background = null;
      texture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

function Metal({
  color,
  roughness = 0.28,
  metalness = 0.92,
}: {
  color: Color;
  roughness?: number;
  metalness?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      envMapIntensity={1.25}
    />
  );
}

function Glass({ thickness = 1.6, roughness = 0.045 }: { thickness?: number; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={glass}
      transmission={0.96}
      thickness={thickness}
      roughness={roughness}
      ior={1.52}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.06}
      transparent
      envMapIntensity={1.1}
    />
  );
}

function Band({
  radius,
  tube,
  flatten = 0.4,
  color,
  roughness = 0.26,
}: {
  radius: number;
  tube: number;
  flatten?: number;
  color: Color;
  roughness?: number;
}) {
  return (
    <mesh scale={[1, 1, flatten]}>
      <torusGeometry args={[radius, tube, 20, 96]} />
      <Metal color={color} roughness={roughness} />
    </mesh>
  );
}

function Lens({ radius, depth }: { radius: number; depth: number }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, depth, 48]} />
        <Glass thickness={depth * 22} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.011, 10, 48]} />
        <Metal color={brassLite} roughness={0.18} />
      </mesh>
    </group>
  );
}

function useTrack(scale: number) {
  return useMemo(() => {
    const pts = [
      new Vector3(0.26, 0.05, 0.07),
      new Vector3(0.11, 0.2, -0.09),
      new Vector3(-0.15, 0.16, 0.11),
      new Vector3(-0.24, -0.03, 0.02),
      new Vector3(-0.09, -0.2, -0.1),
      new Vector3(0.13, -0.14, 0.12),
      new Vector3(0.22, 0.02, -0.07),
    ].map((point) => point.multiplyScalar(scale));
    const curve = new CatmullRomCurve3(pts, true, "catmullrom", 0.28);
    return { curve, geometry: new TubeGeometry(curve, 120, 0.012 * scale, 8, true) };
  }, [scale]);
}

function InnerMechanism({ open }: { open: boolean }) {
  const { curve, geometry } = useTrack(0.72);
  const carriage = useRef<Group>(null);
  const progress = useRef(0);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (!carriage.current) return;
    progress.current = (progress.current + delta * (open ? 0.03 : 0.05)) % 1;
    const point = curve.getPointAt(progress.current);
    const tangent = curve.getTangentAt(progress.current);
    carriage.current.position.copy(point);
    carriage.current.lookAt(point.clone().add(tangent));
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <Metal color={brassLite} roughness={0.3} />
      </mesh>
      <group ref={carriage}>
        <mesh>
          <boxGeometry args={[0.05, 0.03, 0.024]} />
          <Metal color={steel} roughness={0.34} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.028, 10]} />
          <Metal color={brass} roughness={0.22} />
        </mesh>
      </group>
    </group>
  );
}

function ScaleArc() {
  const ticks = useMemo(() => {
    const start = -0.62;
    const span = 1.24;
    return Array.from({ length: 15 }, (_, index) => {
      const angle = start + (index / 14) * span;
      return { angle, long: index % 2 === 0 };
    });
  }, []);

  return (
    <group rotation={[Math.PI / 2, 0, 0.18]}>
      <mesh rotation={[0, 0, -0.62]}>
        <torusGeometry args={[0.33, 0.007, 8, 48, 1.24]} />
        <Metal color={brass} roughness={0.24} />
      </mesh>
      {ticks.map(({ angle, long }) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 0.33, Math.sin(angle) * 0.33, 0]}
          rotation={[0, 0, angle]}
        >
          <boxGeometry args={[long ? 0.036 : 0.02, 0.005, 0.008]} />
          <Metal color={brassLite} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Instrument({ open }: { open: boolean }) {
  const root = useRef<Group>(null);
  const rear = useRef<Group>(null);
  const outer = useRef<Group>(null);
  const mid = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const optics = useRef<Group>(null);
  const plate = useRef<Mesh>(null);
  const opened = useRef(0);
  const reduce = useRef(false);

  useLayoutEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((state, delta) => {
    const group = root.current;
    if (!group) return;

    opened.current = MathUtils.damp(opened.current, open ? 1 : 0, 2.5, delta);
    const t = opened.current;
    const gain = reduce.current ? 0 : open ? 0.1 : 0.2;

    group.rotation.x = MathUtils.damp(group.rotation.x, 0.36 + state.pointer.y * gain, 3.1, delta);
    group.rotation.y = MathUtils.damp(group.rotation.y, -0.52 + state.pointer.x * gain * 1.1, 3.1, delta);

    if (rear.current) {
      rear.current.position.z = -0.42 - 0.28 * t;
      rear.current.rotation.x = -0.22 * t;
    }

    if (outer.current) {
      outer.current.rotation.z = 0.12 * t;
    }

    if (mid.current) {
      if (!reduce.current) mid.current.rotation.y += delta * (open ? 0.028 : 0.05);
      mid.current.rotation.x = MathUtils.damp(mid.current.rotation.x, 0.2 + 1.05 * t, 2.7, delta);
      mid.current.position.x = 0.12 * t;
    }

    if (inner.current) {
      if (!reduce.current) inner.current.rotation.z += delta * (open ? 0.018 : 0.038);
      inner.current.position.x = -0.1 * t;
      inner.current.position.z = 0.09 * t;
    }

    if (optics.current) {
      optics.current.position.z = 0.05 + 0.18 * t;
    }

    if (plate.current) {
      plate.current.rotation.x = 0.48 + 0.5 * t;
      plate.current.position.y = 0.02 - 0.1 * t;
    }
  });

  return (
    <group ref={root} position={[0, 0.06, 0]}>
      <mesh position={[0, -1.02, 0]}>
        <cylinderGeometry args={[0.3, 0.36, 0.07, 32]} />
        <Metal color={brassDark} roughness={0.46} metalness={0.8} />
      </mesh>
      <mesh position={[-0.22, -0.72, 0.08]} rotation={[0.12, 0, 0.08]}>
        <cylinderGeometry args={[0.028, 0.032, 0.58, 12]} />
        <Metal color={steel} roughness={0.4} />
      </mesh>
      <mesh position={[0.22, -0.72, -0.04]} rotation={[-0.06, 0, -0.1]}>
        <cylinderGeometry args={[0.028, 0.032, 0.58, 12]} />
        <Metal color={steel} roughness={0.4} />
      </mesh>

      <group ref={rear} position={[0, 0, -0.42]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.4, 0.18, 40, 1, true]} />
          <meshStandardMaterial
            color={brassDark}
            metalness={0.88}
            roughness={0.34}
            envMapIntensity={1.05}
            side={DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.045, 40]} />
          <Metal color={brass} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.38, 0.018, 12, 48]} />
          <Metal color={brassLite} roughness={0.2} />
        </mesh>
      </group>

      <group ref={outer}>
        <Band radius={0.74} tube={0.058} color={brass} roughness={0.22} />
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 1.52, 12]} />
          <Metal color={steel} roughness={0.34} />
        </mesh>
        <mesh position={[-0.76, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 12]} />
          <Metal color={brassLite} roughness={0.2} />
        </mesh>
        <mesh position={[0.76, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 12]} />
          <Metal color={brassLite} roughness={0.2} />
        </mesh>
      </group>

      <group ref={mid} rotation={[0.2, 0.4, 0.15]}>
        <Band radius={0.58} tube={0.05} flatten={0.36} color={brassLite} roughness={0.2} />
        <mesh>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 12]} />
          <Metal color={steel} roughness={0.34} />
        </mesh>
        <ScaleArc />
      </group>

      <group ref={inner} rotation={[0.55, -0.25, 0.2]}>
        <Band radius={0.42} tube={0.042} color={brassDark} roughness={0.3} />
        <mesh rotation={[0, 0, 0.28]}>
          <boxGeometry args={[0.07, 0.68, 0.042]} />
          <Metal color={brass} roughness={0.32} />
        </mesh>
        <mesh rotation={[0, 0, 0.28]}>
          <boxGeometry args={[0.68, 0.07, 0.038]} />
          <Metal color={brassDark} roughness={0.34} />
        </mesh>
        <InnerMechanism open={open} />
      </group>

      <group ref={optics} position={[0, 0, 0.05]} rotation={[0.55, 0.18, 0.08]}>
        <group position={[0, 0, -0.08]}>
          <Lens radius={0.2} depth={0.036} />
        </group>
        <group position={[0, 0, 0.02]}>
          <Lens radius={0.25} depth={0.05} />
        </group>
        <group position={[0, 0, 0.11]}>
          <Lens radius={0.17} depth={0.03} />
        </group>
      </group>

      <mesh ref={plate} position={[0.04, 0.02, 0.04]} rotation={[0.48, 0.22, 0.12]}>
        <boxGeometry args={[0.3, 0.3, 0.024]} />
        <Glass thickness={0.9} roughness={0.03} />
      </mesh>
    </group>
  );
}

export default function InstrumentCanvas({ open }: Props) {
  const mobile = typeof window !== "undefined" && window.innerWidth < 760;

  return (
    <div className="instrument-frame">
      <Canvas
        camera={{ position: [0, 0.28, 3.15], fov: 32 }}
        dpr={mobile ? [1, 1.25] : [1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[paper]} />
        <StudioEnvironment />
        <ambientLight intensity={0.48} />
        <directionalLight position={[2.8, 3.6, 2.4]} intensity={1.55} color={"#f4ead4"} />
        <directionalLight position={[-2.6, 1.2, 1.1]} intensity={0.5} color={"#ddd3bf"} />
        <directionalLight position={[0.4, 1.2, -2.8]} intensity={0.62} color={"#cfc3a8"} />
        <spotLight
          position={[0.6, 1.8, 2.4]}
          angle={0.4}
          penumbra={0.85}
          intensity={1.05}
          color={"#efe2c4"}
        />
        <Instrument open={open} />
        <ContactShadows
          position={[0, -1.16, 0]}
          opacity={0.34}
          scale={4.6}
          blur={2.7}
          far={2.6}
          color="#14130f"
        />
      </Canvas>
    </div>
  );
}
