import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useBossLabel } from "./screens";

/* ================= ОФИСНЫЙ ПРИНТЕР ================= */
export function OfficePrinter({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[0.46, 0.22, 0.36]} />
        <meshStandardMaterial color={0xd7dce8} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.24, -0.02]}>
        <boxGeometry args={[0.46, 0.05, 0.34]} />
        <meshStandardMaterial color={0x9aa4b8} roughness={0.45} />
      </mesh>
      {/* лоток подачи */}
      <mesh position={[0, 0.3, -0.14]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.4, 0.02, 0.22]} />
        <meshStandardMaterial color={0x8892a8} roughness={0.5} />
      </mesh>
      {/* выходящий лист */}
      <mesh position={[0, 0.235, 0.14]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[0.3, 0.006, 0.2]} />
        <meshStandardMaterial color={0xf8fafc} roughness={0.9} />
      </mesh>
      {/* щель выхода */}
      <mesh position={[0, 0.2, 0.185]}>
        <boxGeometry args={[0.34, 0.02, 0.01]} />
        <meshStandardMaterial color={0x2a2f3d} />
      </mesh>
      {/* статус-LED */}
      <mesh position={[0.18, 0.16, 0.185]}>
        <boxGeometry args={[0.03, 0.015, 0.01]} />
        <meshStandardMaterial color={0x9dff57} emissive={0x9dff57} emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[-0.14, 0.16, 0.186]}>
        <boxGeometry args={[0.1, 0.05, 0.008]} />
        <meshStandardMaterial color={0x0d1024} emissive={0x35e0ff} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ================= 3D-ПРИНТЕР (голова печатает, кликабельный) ================= */
export function Printer3D({
  position,
  rotY = 0,
  onClick,
}: {
  position: [number, number, number];
  rotY?: number;
  onClick?: () => void;
}) {
  const head = useRef<THREE.Group>(null);
  const spool = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (head.current) {
      head.current.position.x = Math.sin(t * 1.9) * 0.09;
      head.current.position.z = Math.sin(t * 0.83) * 0.07;
    }
    if (spool.current) spool.current.rotation.x -= 0.02;
  });
  return (
    <group
      position={position}
      rotation={[0, rotY, 0]}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      onPointerOver={
        onClick
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={onClick ? () => (document.body.style.cursor = "auto") : undefined}
    >
      {/* основание */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.38, 0.1, 0.34]} />
        <meshStandardMaterial color={0x1b1e2c} roughness={0.5} />
      </mesh>
      {/* стол печатаемой детали */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.26, 0.02, 0.24]} />
        <meshStandardMaterial color={0x0d1024} roughness={0.3} />
      </mesh>
      {/* недопечатанная деталь */}
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.12]} />
        <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={0.35} roughness={0.6} />
      </mesh>
      {/* стойки */}
      {[
        [-0.17, -0.15],
        [0.17, -0.15],
        [-0.17, 0.15],
        [0.17, 0.15],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.3, z]}>
          <boxGeometry args={[0.03, 0.42, 0.03]} />
          <meshStandardMaterial color={0x2a2f3d} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {/* верхняя рама */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[0.38, 0.03, 0.34]} />
        <meshStandardMaterial color={0x2a2f3d} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* портал с головой */}
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.36, 0.025, 0.03]} />
        <meshStandardMaterial color={0x39405a} metalness={0.6} roughness={0.35} />
      </mesh>
      <group ref={head} position={[0, 0.32, 0]}>
        <mesh>
          <boxGeometry args={[0.06, 0.07, 0.06]} />
          <meshStandardMaterial color={0x14161f} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.045, 0]}>
          <cylinderGeometry args={[0.008, 0.014, 0.03, 8]} />
          <meshStandardMaterial color={0xff5cae} emissive={0xff5cae} emissiveIntensity={1.8} />
        </mesh>
      </group>
      {/* катушка филамента сбоку */}
      <group position={[0.24, 0.44, 0]}>
        <mesh ref={spool} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.075, 0.075, 0.045, 16]} />
          <meshStandardMaterial color={0xff5cae} roughness={0.6} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 10]} />
          <meshStandardMaterial color={0x14161f} />
        </mesh>
      </group>
      {/* LED-лента */}
      <mesh position={[0, 0.5, 0.17]}>
        <boxGeometry args={[0.34, 0.012, 0.012]} />
        <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={1.8} />
      </mesh>
    </group>
  );
}

/* ================= ТУМБА НА 2 ЯЩИКА ================= */
export function DrawerUnit({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.46, 0.56, 0.46]} />
        <meshStandardMaterial color={0x2b3050} roughness={0.7} />
      </mesh>
      {[0.15, 0.41].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0.24]}>
            <boxGeometry args={[0.4, 0.22, 0.02]} />
            <meshStandardMaterial color={0x343b63} roughness={0.6} />
          </mesh>
          <mesh position={[0, y, 0.26]}>
            <boxGeometry args={[0.16, 0.025, 0.025]} />
            <meshStandardMaterial color={0x9aa4c8} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.57, 0]}>
        <boxGeometry args={[0.5, 0.03, 0.5]} />
        <meshStandardMaterial color={0x232848} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ================= СТЕННОЙ СТеллаж: филаменты, саморезы, болты ================= */
export function WallShelf({ position, rotY = 0, width = 1.6 }: { position: [number, number, number]; rotY?: number; width?: number }) {
  const filamentColors = [0x35e0ff, 0xff5cae, 0x9dff57, 0xffc857, 0x7a5cff];
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* задник */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[width, 1.15, 0.04]} />
        <meshStandardMaterial color={0x232848} roughness={0.7} />
      </mesh>
      {/* полки */}
      {[-0.42, 0, 0.42].map((y, i) => (
        <mesh key={i} position={[0, y, 0.13]}>
          <boxGeometry args={[width, 0.035, 0.3]} />
          <meshStandardMaterial color={0x39405a} roughness={0.6} />
        </mesh>
      ))}
      {/* верхняя полка: катушки филамента */}
      {[-0.55, -0.25, 0.05, 0.35, 0.62].map((x, i) => (
        <group key={i} position={[x * (width / 1.6), 0.53, 0.13]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.095, 0.095, 0.06, 14]} />
            <meshStandardMaterial color={filamentColors[i]} roughness={0.55} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.07, 10]} />
            <meshStandardMaterial color={0x14161f} />
          </mesh>
        </group>
      ))}
      {/* средняя полка: коробки с саморезами */}
      {[-0.5, -0.15, 0.2, 0.55].map((x, i) => (
        <group key={i} position={[x * (width / 1.6), 0.11, 0.13]}>
          <mesh>
            <boxGeometry args={[0.22, 0.16, 0.2]} />
            <meshStandardMaterial color={i % 2 ? 0x4a5578 : 0x3d4666} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.085, 0]}>
            <boxGeometry args={[0.22, 0.02, 0.2]} />
            <meshStandardMaterial color={0x9dff57} emissive={0x9dff57} emissiveIntensity={0.25} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.02, 0.105]}>
            <boxGeometry args={[0.14, 0.06, 0.005]} />
            <meshStandardMaterial color={0xd7dce8} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* нижняя полка: болты и банки */}
      {[-0.6, -0.3, 0, 0.3, 0.6].map((x, i) => (
        <group key={i} position={[x * (width / 1.6), -0.3, 0.13]}>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.18, 10]} />
            <meshStandardMaterial color={0x8b93b8} transparent opacity={0.5} roughness={0.2} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[(k - 1) * 0.03, 0.06 + k * 0.02, (k % 2) * 0.02 - 0.01]}>
              <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
              <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[0, 0.185, 0]}>
            <cylinderGeometry args={[0.062, 0.062, 0.02, 10]} />
            <meshStandardMaterial color={0x2a2f3d} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ================= КОФЕ-ПОИНТ С КУЛЕРОМ (20 л), кликабельный ================= */
export function CoffeePoint({
  position,
  rotY = 0,
  onClick,
}: {
  position: [number, number, number];
  rotY?: number;
  onClick?: () => void;
}) {
  return (
    <group
      position={position}
      rotation={[0, rotY, 0]}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      onPointerOver={
        onClick
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={onClick ? () => (document.body.style.cursor = "auto") : undefined}
    >
      {/* тумба-стойка */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.95, 0.84, 0.5]} />
        <meshStandardMaterial color={0x2b3050} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[1.0, 0.05, 0.55]} />
        <meshStandardMaterial color={0x3a4066} roughness={0.5} />
      </mesh>
      {/* неоновая кромка */}
      <mesh position={[0, 0.83, 0.27]}>
        <boxGeometry args={[0.95, 0.015, 0.015]} />
        <meshStandardMaterial color={0xffc857} emissive={0xffc857} emissiveIntensity={1.6} />
      </mesh>
      {/* кофемашина */}
      <group position={[-0.25, 0.885, -0.05]}>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.3, 0.32, 0.32]} />
          <meshStandardMaterial color={0x1b1e2c} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.1, 0.17]}>
          <boxGeometry args={[0.16, 0.1, 0.02]} />
          <meshStandardMaterial color={0x0d1024} emissive={0xff5cae} emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0, 0.02, 0.12]}>
          <boxGeometry args={[0.06, 0.06, 0.06]} />
          <meshStandardMaterial color={0x39405a} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* чашка под носиком */}
        <mesh position={[0, -0.03, 0.12]}>
          <cylinderGeometry args={[0.035, 0.03, 0.06, 10]} />
          <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
        </mesh>
      </group>
      {/* стаканчики */}
      {[-0.08, -0.02, 0.04].map((x, i) => (
        <mesh key={i} position={[x, 0.92 + i * 0.005, 0.1]} rotation={[0, 0, i * 0.4]}>
          <cylinderGeometry args={[0.032, 0.026, 0.09, 10]} />
          <meshStandardMaterial color={0xe8ecf5} roughness={0.6} />
        </mesh>
      ))}
      {/* тарелка с печеньем */}
      <group position={[0.34, 0.885, 0.1]}>
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.11, 0.09, 0.02, 14]} />
          <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
        </mesh>
        {[
          [-0.03, 0.032, 0.02],
          [0.04, 0.032, -0.03],
          [0.0, 0.056, 0.0],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <cylinderGeometry args={[0.035, 0.035, 0.016, 10]} />
            <meshStandardMaterial color={0xb3763f} roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[-0.03, 0.045, 0.03]}>
          <boxGeometry args={[0.009, 0.006, 0.009]} />
          <meshStandardMaterial color={0x3a2417} />
        </mesh>
        <mesh position={[0.045, 0.045, -0.02]}>
          <boxGeometry args={[0.009, 0.006, 0.009]} />
          <meshStandardMaterial color={0x3a2417} />
        </mesh>
        <mesh position={[0.01, 0.068, 0.01]}>
          <boxGeometry args={[0.009, 0.006, 0.009]} />
          <meshStandardMaterial color={0x3a2417} />
        </mesh>
      </group>
      {/* коробка пончиков */}
      <group position={[0.12, 0.885, 0.18]}>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.2, 0.06, 0.14]} />
          <meshStandardMaterial color={0xf9a8d4} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.062, 0]}>
          <boxGeometry args={[0.205, 0.012, 0.145]} />
          <meshStandardMaterial color={0xf472b6} roughness={0.5} />
        </mesh>
      </group>
      {/* банка конфет */}
      <group position={[0.42, 0.885, -0.12]}>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.14, 12]} />
          <meshStandardMaterial color={0xbfe9ff} transparent opacity={0.3} roughness={0.15} />
        </mesh>
        {[0.03, 0.06, 0.09, 0.11].map((y, i) => (
          <mesh key={i} position={[Math.sin(i * 2.4) * 0.02, y, Math.cos(i * 1.7) * 0.02]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshStandardMaterial color={[0xff5cae, 0x9dff57, 0xffc857, 0x35e0ff][i]} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.145, 0]}>
          <cylinderGeometry args={[0.052, 0.052, 0.015, 12]} />
          <meshStandardMaterial color={0x2a2f3d} />
        </mesh>
      </group>
      {/* салфетки */}
      <mesh position={[0.1, 0.905, -0.18]}>
        <boxGeometry args={[0.09, 0.04, 0.09]} />
        <meshStandardMaterial color={0xf8fafc} roughness={0.9} />
      </mesh>
      {/* сахар */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.28 + (i % 2) * 0.035, 0.9 + Math.floor(i / 2) * 0.032, -0.2]}>
          <boxGeometry args={[0.03, 0.03, 0.03]} />
          <meshStandardMaterial color={0xf8fafc} roughness={0.6} />
        </mesh>
      ))}
      {/* пакет кофе на полу */}
      <group position={[0.52, 0, 0.18]}>
        <mesh position={[0, 0.11, 0]}>
          <boxGeometry args={[0.14, 0.22, 0.1]} />
          <meshStandardMaterial color={0x6b4226} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.14, 0.052]}>
          <boxGeometry args={[0.09, 0.1, 0.006]} />
          <meshStandardMaterial color={0xffc857} roughness={0.7} />
        </mesh>
      </group>
      {/* кликабельная зона всего кофе-поинта */}
      {onClick && (
        <mesh position={[0.2, 0.7, 0]} visible={false}>
          <boxGeometry args={[1.6, 1.6, 1.2]} />
          <meshBasicMaterial />
        </mesh>
      )}
      {/* кулер для воды с бутылью 20 л */}
      <group position={[0.72, 0, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.34, 1.0, 0.34]} />
          <meshStandardMaterial color={0xd7dce8} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.72, 0.18]}>
          <boxGeometry args={[0.2, 0.14, 0.02]} />
          <meshStandardMaterial color={0x1b1e2c} roughness={0.4} />
        </mesh>
        {/* краны */}
        <mesh position={[-0.05, 0.66, 0.19]}>
          <boxGeometry args={[0.03, 0.05, 0.03]} />
          <meshStandardMaterial color={0xff5cae} roughness={0.4} />
        </mesh>
        <mesh position={[0.05, 0.66, 0.19]}>
          <boxGeometry args={[0.03, 0.05, 0.03]} />
          <meshStandardMaterial color={0x35e0ff} roughness={0.4} />
        </mesh>
        {/* бутыль 20 л сверху */}
        <mesh position={[0, 1.22, 0]}>
          <cylinderGeometry args={[0.14, 0.15, 0.44, 14]} />
          <meshStandardMaterial color={0xbfe9ff} transparent opacity={0.35} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.16, 0]}>
          <cylinderGeometry args={[0.125, 0.135, 0.3, 14]} />
          <meshStandardMaterial color={0x66d4f5} transparent opacity={0.65} roughness={0.15} />
        </mesh>
        <mesh position={[0, 1.46, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.06, 12]} />
          <meshStandardMaterial color={0x2a7fa8} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ================= ТЕЛЕФОН с трубкой (постоянно звонит) ================= */
export function Phone({
  position,
  rotY = 0,
  variant = 0,
}: {
  position: [number, number, number];
  rotY?: number;
  variant?: number;
}) {
  const glow = variant ? 0x9dff57 : 0x35e0ff;
  const body = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const waveL = useRef<THREE.Mesh>(null);
  const waveR = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime + variant * 1.7;
    if (body.current) {
      body.current.position.x = Math.sin(t * 41) * 0.004;
      body.current.position.z = Math.cos(t * 37) * 0.004;
      body.current.rotation.z = Math.sin(t * 45) * 0.035;
    }
    const p1 = (t * 1.1) % 1;
    const p2 = (t * 1.1 + 0.5) % 1;
    if (ring1.current) {
      ring1.current.scale.setScalar(0.3 + p1 * 1.5);
      (ring1.current.material as THREE.MeshBasicMaterial).opacity = (1 - p1) * 0.7;
    }
    if (ring2.current) {
      ring2.current.scale.setScalar(0.3 + p2 * 1.5);
      (ring2.current.material as THREE.MeshBasicMaterial).opacity = (1 - p2) * 0.7;
    }
    const blink = Math.sin(t * 18) > 0;
    if (waveL.current) waveL.current.visible = blink;
    if (waveR.current) waveR.current.visible = !blink;
  });
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* расходящиеся круги звонка */}
      <mesh ref={ring1} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.09, 0.105, 24]} />
        <meshBasicMaterial color={glow} transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.09, 0.105, 24]} />
        <meshBasicMaterial color={glow} transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* звуковые волны по бокам */}
      <mesh ref={waveL} position={[-0.13, 0.09, 0]} rotation={[0, -0.6, 0]}>
        <torusGeometry args={[0.05, 0.006, 6, 12, Math.PI * 0.7]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      <mesh ref={waveR} position={[0.13, 0.09, 0]} rotation={[0, 0.6 + Math.PI, 0]}>
        <torusGeometry args={[0.05, 0.006, 6, 12, Math.PI * 0.7]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      <group ref={body}>
      {/* база */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.13, 0.04, 0.18]} />
        <meshStandardMaterial color={0x1b1e2c} roughness={0.4} />
      </mesh>
      {/* клавиатура */}
      <mesh position={[0, 0.043, 0.045]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.09, 0.08]} />
        <meshStandardMaterial color={0x0d1024} emissive={glow} emissiveIntensity={0.45} />
      </mesh>
      {/* дисплей под углом */}
      <mesh position={[0, 0.065, -0.065]} rotation={[-0.55, 0, 0]}>
        <boxGeometry args={[0.1, 0.055, 0.012]} />
        <meshStandardMaterial color={0x0d1024} emissive={glow} emissiveIntensity={0.9} />
      </mesh>
      {/* трубка лежит на базе */}
      <group position={[0, 0.062, 0.005]}>
        <mesh>
          <boxGeometry args={[0.05, 0.026, 0.17]} />
          <meshStandardMaterial color={0x10131f} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.006, 0.08]}>
          <boxGeometry args={[0.056, 0.032, 0.055]} />
          <meshStandardMaterial color={0x10131f} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.006, -0.08]}>
          <boxGeometry args={[0.056, 0.032, 0.055]} />
          <meshStandardMaterial color={0x10131f} roughness={0.35} />
        </mesh>
      </group>
      {/* спиральный провод */}
      <mesh position={[0.075, 0.02, 0.06]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.012, 0.012, 0.1]} />
        <meshStandardMaterial color={0x10131f} roughness={0.6} />
      </mesh>
      </group>
    </group>
  );
}

/* ================= НЕТТОП ================= */
export function Nettop({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[0.16, 0.05, 0.18]} />
        <meshStandardMaterial color={0x1b1e2c} roughness={0.45} metalness={0.3} />
      </mesh>
      {[-0.05, -0.02, 0.01, 0.04].map((x, i) => (
        <mesh key={i} position={[x, 0.052, 0]}>
          <boxGeometry args={[0.008, 0.006, 0.16]} />
          <meshStandardMaterial color={0x2a2f3d} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0.055, 0.02, 0.092]}>
        <boxGeometry args={[0.02, 0.008, 0.008]} />
        <meshStandardMaterial color={0x9dff57} emissive={0x9dff57} emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[-0.055, 0.02, 0.092]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.01, 8]} />
        <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

/* ================= БАНКА ЭНЕРГЕТИКА ================= */
export function EnergyCan({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.065, 0]}>
        <cylinderGeometry args={[0.033, 0.033, 0.13, 12]} />
        <meshStandardMaterial color={0x14161c} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.065, 0]}>
        <cylinderGeometry args={[0.034, 0.034, 0.055, 12]} />
        <meshStandardMaterial color={0xff5cae} emissive={0xff5cae} emissiveIntensity={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.132, 0]}>
        <cylinderGeometry args={[0.029, 0.033, 0.008, 12]} />
        <meshStandardMaterial color={0xc7cdea} metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0.008, 0.138, 0]}>
        <boxGeometry args={[0.02, 0.004, 0.012]} />
        <meshStandardMaterial color={0xc7cdea} metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ================= ПАПКИ С ДОКУМЕНТАМИ ================= */
export function DocumentFolders({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* стопка бумаги */}
      <mesh position={[-0.13, 0.022, 0.06]}>
        <boxGeometry args={[0.22, 0.044, 0.3]} />
        <meshStandardMaterial color={0xe8ecf5} roughness={0.9} />
      </mesh>
      <mesh position={[-0.13, 0.046, 0.06]}>
        <boxGeometry args={[0.16, 0.004, 0.22]} />
        <meshStandardMaterial color={0xc7cdea} roughness={0.9} />
      </mesh>
      {/* стоящие папки */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0.0 + i * 0.055, 0, -0.06]} rotation={[0, 0, -0.16 - i * 0.03]}>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.035, 0.32, 0.24]} />
            <meshStandardMaterial color={[0xd13a63, 0x35e0ff, 0xffc857][i]} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.29, 0.06]}>
            <boxGeometry args={[0.037, 0.06, 0.09]} />
            <meshStandardMaterial color={0xe8ecf5} roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* органайзер */}
      <mesh position={[0.17, 0.06, 0.1]}>
        <boxGeometry args={[0.12, 0.12, 0.16]} />
        <meshStandardMaterial color={0x39405a} roughness={0.7} />
      </mesh>
      <mesh position={[0.17, 0.13, 0.1]}>
        <boxGeometry args={[0.09, 0.02, 0.12]} />
        <meshStandardMaterial color={0x0d1024} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ================= КОНДИЦИОНЕР на стене ================= */
export function AirCon({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[0.92, 0.28, 0.22]} />
        <meshStandardMaterial color={0xe8ecf5} roughness={0.4} />
      </mesh>
      {/* жалюзи */}
      <mesh position={[0, -0.12, 0.1]} rotation={[0.55, 0, 0]}>
        <boxGeometry args={[0.86, 0.02, 0.12]} />
        <meshStandardMaterial color={0xc7cdea} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.06, 0.112]}>
        <boxGeometry args={[0.86, 0.012, 0.01]} />
        <meshStandardMaterial color={0x9aa4b8} roughness={0.5} />
      </mesh>
      {/* дисплей */}
      <mesh position={[0.33, 0.05, 0.115]}>
        <boxGeometry args={[0.13, 0.055, 0.01]} />
        <meshStandardMaterial color={0x0d1024} emissive={0x35e0ff} emissiveIntensity={1.1} />
      </mesh>
      {/* логотип-полоска */}
      <mesh position={[-0.28, 0.05, 0.112]}>
        <boxGeometry args={[0.22, 0.02, 0.008]} />
        <meshStandardMaterial color={0x9aa4b8} roughness={0.5} />
      </mesh>
      {/* светодиод работы */}
      <mesh position={[0.15, 0.05, 0.115]}>
        <boxGeometry args={[0.02, 0.02, 0.01]} />
        <meshStandardMaterial color={0x9dff57} emissive={0x9dff57} emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

/* ================= ВЕРСТАК: разобранный ПК, запчасти, инструменты ================= */
export function RepairBench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* антистатический коврик */}
      <mesh position={[-1.5, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.75, 0.6]} />
        <meshStandardMaterial color={0x1d3a2f} roughness={0.9} />
      </mesh>
      {/* открытый корпус лежа */}
      <group position={[-1.5, 0, 0]}>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.42]} />
          <meshStandardMaterial color={0x171a28} roughness={0.5} metalness={0.3} />
        </mesh>
        {[
          [0, 0.11, -0.2],
          [0, 0.11, 0.2],
          [-0.24, 0.11, 0],
          [0.24, 0.11, 0],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={i < 2 ? [0.5, 0.12, 0.02] : [0.02, 0.12, 0.42]} />
            <meshStandardMaterial color={0x171a28} roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
        {/* материнская плата */}
        <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.36, 0.3]} />
          <meshStandardMaterial color={0x14532d} roughness={0.7} />
        </mesh>
        <mesh position={[-0.06, 0.075, -0.04]}>
          <boxGeometry args={[0.07, 0.02, 0.07]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
        </mesh>
        {[0.06, 0.09].map((z, i) => (
          <mesh key={i} position={[0.1, 0.08, z]}>
            <boxGeometry args={[0.14, 0.03, 0.02]} />
            <meshStandardMaterial color={i ? 0x9dff57 : 0x35e0ff} roughness={0.6} />
          </mesh>
        ))}
        {/* провода */}
        <mesh position={[0.14, 0.075, -0.12]} rotation={[0, 0.7, 0]}>
          <boxGeometry args={[0.16, 0.012, 0.012]} />
          <meshStandardMaterial color={0xff5cae} roughness={0.6} />
        </mesh>
        <mesh position={[-0.14, 0.075, 0.12]} rotation={[0, -0.4, 0]}>
          <boxGeometry args={[0.14, 0.012, 0.012]} />
          <meshStandardMaterial color={0xffc857} roughness={0.6} />
        </mesh>
      </group>
      {/* видеокарта прислонена */}
      <group position={[-0.85, 0, -0.15]} rotation={[0.25, 0.5, 0.5]}>
        <mesh>
          <boxGeometry args={[0.26, 0.11, 0.04]} />
          <meshStandardMaterial color={0x14161f} roughness={0.45} />
        </mesh>
        {[-0.06, 0.06].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.015, 14]} />
            <meshStandardMaterial color={0x2a2f3d} roughness={0.4} />
          </mesh>
        ))}
      </group>
      {/* блок питания */}
      <mesh position={[-0.62, 0.045, 0.15]}>
        <boxGeometry args={[0.16, 0.09, 0.1]} />
        <meshStandardMaterial color={0x2a2f3d} roughness={0.5} />
      </mesh>
      <mesh position={[-0.62, 0.045, 0.205]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.01, 12]} />
        <meshStandardMaterial color={0x14161f} />
      </mesh>
      {/* стопка HDD */}
      {[0.02, 0.045].map((y, i) => (
        <mesh key={i} position={[-0.05, y, 0.1]}>
          <boxGeometry args={[0.15, 0.022, 0.1]} />
          <meshStandardMaterial color={0x9aa4b8} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {/* куча саморезов */}
      {[
        [0.15, 0.12],
        [0.19, 0.16],
        [0.23, 0.11],
        [0.17, 0.2],
        [0.25, 0.19],
        [0.12, 0.17],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.012, z]} rotation={[Math.PI / 2, 0, i]}>
          <cylinderGeometry args={[0.009, 0.009, 0.028, 6]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      {/* отвёртки */}
      <group position={[0.65, 0.015, -0.05]} rotation={[0, 0.5, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.2, 8]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.09, 10]} />
          <meshStandardMaterial color={0xd13a63} roughness={0.5} />
        </mesh>
      </group>
      <group position={[0.75, 0.015, 0.12]} rotation={[0, -0.7, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.16, 8]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.07, 10]} />
          <meshStandardMaterial color={0x35e0ff} roughness={0.5} />
        </mesh>
      </group>
      {/* гаечный ключ */}
      <mesh position={[0.5, 0.012, 0.2]} rotation={[0, 1.1, 0]}>
        <boxGeometry args={[0.18, 0.008, 0.035]} />
        <meshStandardMaterial color={0x9aa4b8} metalness={0.8} roughness={0.35} />
      </mesh>
      {/* термопаста */}
      <mesh position={[1.15, 0.045, -0.1]}>
        <cylinderGeometry args={[0.018, 0.02, 0.09, 10]} />
        <meshStandardMaterial color={0xd7dce8} roughness={0.4} />
      </mesh>
      {/* запасной кулер */}
      <group position={[1.45, 0.02, 0.08]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.025, 16]} />
          <meshStandardMaterial color={0x14161f} roughness={0.5} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0.4, 0, (i / 3) * Math.PI * 2]}>
            <boxGeometry args={[0.03, 0.1, 0.008]} />
            <meshStandardMaterial color={0x9dff57} emissive={0x9dff57} emissiveIntensity={0.4} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
      {/* шасси серверов-лезвий */}
      <group position={[-1.05, 0, 0.24]}>
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.42, 0.19, 0.24]} />
          <meshStandardMaterial color={0x1b1e2c} roughness={0.45} metalness={0.35} />
        </mesh>
        {[0.032, 0.076, 0.12, 0.164].map((y, i) => (
          <group key={i}>
            <mesh position={[0, y, 0.124]}>
              <boxGeometry args={[0.38, 0.034, 0.016]} />
              <meshStandardMaterial color={0x39405a} roughness={0.4} metalness={0.4} />
            </mesh>
            <mesh position={[-0.16, y, 0.135]}>
              <boxGeometry args={[0.03, 0.018, 0.01]} />
              <meshStandardMaterial
                color={i === 2 ? 0xffc857 : 0x9dff57}
                emissive={i === 2 ? 0xffc857 : 0x9dff57}
                emissiveIntensity={1.5}
              />
            </mesh>
            <mesh position={[0.14, y, 0.135]}>
              <boxGeometry args={[0.06, 0.014, 0.01]} />
              <meshStandardMaterial color={0xc7cdea} metalness={0.7} roughness={0.35} />
            </mesh>
          </group>
        ))}
      </group>
      {/* запасные лезвия стопкой */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[-0.35, 0.02 + i * 0.042, 0.25]}>
          <boxGeometry args={[0.36, 0.036, 0.2]} />
          <meshStandardMaterial color={0x39405a} roughness={0.4} metalness={0.35} />
        </mesh>
      ))}
      <mesh position={[-0.35, 0.038, 0.352]}>
        <boxGeometry args={[0.3, 0.012, 0.008]} />
        <meshStandardMaterial color={0x9dff57} emissive={0x9dff57} emissiveIntensity={0.8} />
      </mesh>
      {/* бухта кабеля */}
      <mesh position={[0.35, 0.03, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.016, 8, 20]} />
        <meshStandardMaterial color={0xffc857} roughness={0.6} />
      </mesh>
      {/* спрей-очиститель */}
      <mesh position={[0.9, 0.06, -0.18]}>
        <cylinderGeometry args={[0.028, 0.028, 0.12, 12]} />
        <meshStandardMaterial color={0x35e0ff} roughness={0.35} />
      </mesh>
      <mesh position={[0.9, 0.13, -0.18]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 10]} />
        <meshStandardMaterial color={0xd7dce8} roughness={0.4} />
      </mesh>
      {/* коробка стяжек */}
      <mesh position={[1.12, 0.032, 0.24]}>
        <boxGeometry args={[0.14, 0.064, 0.1]} />
        <meshStandardMaterial color={0x9dff57} roughness={0.7} />
      </mesh>
      <mesh position={[1.12, 0.066, 0.24]}>
        <boxGeometry args={[0.1, 0.006, 0.07]} />
        <meshStandardMaterial color={0x0d1024} roughness={0.6} />
      </mesh>
      {/* мультиметр с щупами */}
      <group position={[-1.35, 0, -0.28]}>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.18]} />
          <meshStandardMaterial color={0xffc857} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.045, -0.04]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.09, 0.01, 0.07]} />
          <meshStandardMaterial color={0x0d1024} emissive={0x9dff57} emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0.09, 0.012, 0.14]} rotation={[0, 0.6, 0]}>
          <boxGeometry args={[0.01, 0.01, 0.24]} />
          <meshStandardMaterial color={0xd13a63} roughness={0.6} />
        </mesh>
        <mesh position={[-0.09, 0.012, 0.14]} rotation={[0, -0.5, 0]}>
          <boxGeometry args={[0.01, 0.01, 0.24]} />
          <meshStandardMaterial color={0x14161c} roughness={0.6} />
        </mesh>
      </group>
      {/* паяльная станция */}
      <group position={[-0.55, 0, -0.3]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.14, 0.1, 0.12]} />
          <meshStandardMaterial color={0x2a2f3d} roughness={0.5} />
        </mesh>
        <mesh position={[0.06, 0.12, 0]} rotation={[0, 0, -0.6]}>
          <cylinderGeometry args={[0.008, 0.005, 0.16, 8]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.11, 0.16, 0]} rotation={[0, 0, -0.6]}>
          <cylinderGeometry args={[0.014, 0.014, 0.07, 8]} />
          <meshStandardMaterial color={0xd13a63} roughness={0.5} />
        </mesh>
        <mesh position={[-0.05, 0.105, 0.03]}>
          <cylinderGeometry args={[0.02, 0.026, 0.03, 10]} />
          <meshStandardMaterial color={0x14161c} roughness={0.5} />
        </mesh>
        <mesh position={[-0.02, 0.085, -0.062]}>
          <boxGeometry args={[0.06, 0.03, 0.008]} />
          <meshStandardMaterial color={0xff5cae} emissive={0xff5cae} emissiveIntensity={0.9} />
        </mesh>
      </group>
      {/* катушки провода */}
      <mesh position={[0.05, 0.05, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 14]} />
        <meshStandardMaterial color={0x35e0ff} roughness={0.6} />
      </mesh>
      <mesh position={[0.17, 0.04, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.035, 14]} />
        <meshStandardMaterial color={0xff5cae} roughness={0.6} />
      </mesh>
      {/* принтер этикеток */}
      <group position={[0.75, 0, -0.3]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.16, 0.1, 0.14]} />
          <meshStandardMaterial color={0x39405a} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.075, 0.08]}>
          <boxGeometry args={[0.12, 0.006, 0.06]} />
          <meshStandardMaterial color={0xf8fafc} roughness={0.9} />
        </mesh>
        <mesh position={[0.05, 0.085, -0.05]}>
          <boxGeometry args={[0.03, 0.008, 0.008]} />
          <meshStandardMaterial color={0x9dff57} emissive={0x9dff57} emissiveIntensity={1.4} />
        </mesh>
      </group>
      {/* органайзер бит */}
      <group position={[1.35, 0, -0.28]}>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.16, 0.04, 0.08]} />
          <meshStandardMaterial color={0xd13a63} roughness={0.6} />
        </mesh>
        {[-0.05, -0.025, 0, 0.025, 0.05].map((x, i) => (
          <mesh key={i} position={[x, 0.055, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.04, 6]} />
            <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* тестовая плата на прищепке */}
      <group position={[1.75, 0, 0.1]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.16, 0.02, 0.12]} />
          <meshStandardMaterial color={0x14532d} roughness={0.7} />
        </mesh>
        <mesh position={[-0.04, 0.03, 0.02]}>
          <boxGeometry args={[0.04, 0.02, 0.04]} />
          <meshStandardMaterial color={0x14161c} roughness={0.5} />
        </mesh>
        <mesh position={[0.04, 0.025, -0.03]}>
          <boxGeometry args={[0.02, 0.015, 0.05]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/* ================= БОЛЬШАЯ КРУЖКА «БОСС» ================= */
export function BossMug({
  position,
  rotY = 0,
  onClick,
}: {
  position: [number, number, number];
  rotY?: number;
  onClick?: () => void;
}) {
  const label = useBossLabel();
  return (
    <group
      position={position}
      rotation={[0, rotY, 0]}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      onPointerOver={
        onClick
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={onClick ? () => (document.body.style.cursor = "auto") : undefined}
    >
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.095, 0.08, 0.22, 16]} />
        <meshStandardMaterial color={0xd13a63} roughness={0.35} />
      </mesh>
      <mesh position={[0.12, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.065, 0.016, 8, 16]} />
        <meshStandardMaterial color={0xd13a63} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.222, 0]}>
        <cylinderGeometry args={[0.088, 0.088, 0.014, 16]} />
        <meshStandardMaterial color={0x3a2417} roughness={0.3} />
      </mesh>
      {/* надпись БОСС с двух сторон */}
      <mesh position={[0, 0.12, 0.082]}>
        <planeGeometry args={[0.13, 0.08]} />
        <meshBasicMaterial map={label} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.12, -0.082]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.13, 0.08]} />
        <meshBasicMaterial map={label} transparent toneMapped={false} />
      </mesh>
      {/* золотая кайма */}
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.096, 0.096, 0.015, 16]} />
        <meshStandardMaterial color={0xffc857} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ================= ФИГУРКА: ЧЕТЫРЕ КОЛЬЦА AUDI ================= */
export function AudiRings({
  position,
  rotY = 0,
  onClick,
}: {
  position: [number, number, number];
  rotY?: number;
  onClick?: () => void;
}) {
  return (
    <group
      position={position}
      rotation={[0, rotY, 0]}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      onPointerOver={
        onClick
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={onClick ? () => (document.body.style.cursor = "auto") : undefined}
    >
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.24, 0.03, 0.07]} />
        <meshStandardMaterial color={0x1b1e2c} roughness={0.4} />
      </mesh>
      {[-0.078, -0.026, 0.026, 0.078].map((x, i) => (
        <mesh key={i} position={[x, 0.085, 0]}>
          <torusGeometry args={[0.045, 0.008, 10, 28]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.9} roughness={0.22} />
        </mesh>
      ))}
    </group>
  );
}

/* ================= БЕСПОРЯДОК НА СТОЛЕ ВИТАЛИЯ: провода, инструменты и фигурки 3D-печати ================= */
export function DeskClutter({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* клубки проводов */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0.4]}>
        <torusGeometry args={[0.07, 0.008, 6, 16]} />
        <meshStandardMaterial color={0x14161c} roughness={0.6} />
      </mesh>
      <mesh position={[0.06, 0.02, 0.05]} rotation={[Math.PI / 2, 0, -0.7]}>
        <torusGeometry args={[0.05, 0.007, 6, 14]} />
        <meshStandardMaterial color={0x35e0ff} roughness={0.6} />
      </mesh>
      <mesh position={[-0.05, 0.015, 0.08]} rotation={[Math.PI / 2, 0, 1.2]}>
        <torusGeometry args={[0.04, 0.006, 6, 12]} />
        <meshStandardMaterial color={0xff5cae} roughness={0.6} />
      </mesh>
      {/* шпатель для снятия отпечатков */}
      <group position={[0.12, 0.01, -0.06]} rotation={[0, 0.8, 0]}>
        <mesh>
          <boxGeometry args={[0.16, 0.008, 0.03]} />
          <meshStandardMaterial color={0x9dff57} roughness={0.5} />
        </mesh>
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[0.05, 0.006, 0.04]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      {/* штангенциркуль */}
      <group position={[-0.1, 0.012, -0.08]} rotation={[0, -0.4, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.01, 0.02]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-0.06, 0.02, 0.01]}>
          <boxGeometry args={[0.03, 0.03, 0.015]} />
          <meshStandardMaterial color={0x2a2f3d} roughness={0.5} />
        </mesh>
      </group>
      {/* напечатанная лодочка */}
      <group position={[0.02, 0.01, 0.14]}>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.09, 0.03, 0.04]} />
          <meshStandardMaterial color={0xff5cae} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.05, -0.005]}>
          <boxGeometry args={[0.04, 0.03, 0.03]} />
          <meshStandardMaterial color={0xff5cae} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.075, -0.005]}>
          <boxGeometry args={[0.008, 0.04, 0.008]} />
          <meshStandardMaterial color={0xff5cae} roughness={0.6} />
        </mesh>
      </group>
      {/* напечатанный заяц */}
      <group position={[-0.14, 0.01, 0.12]}>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.035, 0.06, 0.03]} />
          <meshStandardMaterial color={0x9dff57} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.075, 0]}>
          <boxGeometry args={[0.03, 0.035, 0.028]} />
          <meshStandardMaterial color={0x9dff57} roughness={0.6} />
        </mesh>
        <mesh position={[-0.012, 0.098, 0]}>
          <boxGeometry args={[0.008, 0.026, 0.008]} />
          <meshStandardMaterial color={0x9dff57} roughness={0.6} />
        </mesh>
        <mesh position={[0.012, 0.098, 0]}>
          <boxGeometry args={[0.008, 0.026, 0.008]} />
          <meshStandardMaterial color={0x9dff57} roughness={0.6} />
        </mesh>
      </group>
      {/* огрызок филамента */}
      <mesh position={[0.14, 0.012, 0.1]} rotation={[Math.PI / 2, 0, 0.3]}>
        <torusGeometry args={[0.025, 0.006, 6, 10]} />
        <meshStandardMaterial color={0xffc857} roughness={0.6} />
      </mesh>
      {/* стаканчик с соплами */}
      <mesh position={[-0.02, 0.02, -0.14]}>
        <cylinderGeometry args={[0.03, 0.025, 0.04, 10]} />
        <meshStandardMaterial color={0x39405a} roughness={0.5} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.032 + i * 0.012, 0.05, -0.14]}>
          <cylinderGeometry args={[0.004, 0.004, 0.025, 6]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ================= ОРГАНАЙЗЕР КЛЮЧЕЙ ДОСТУПА ================= */
export function KeyOrganizer({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  const colors = [0xff5cae, 0x35e0ff, 0x9dff57, 0xffc857];
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.12]} />
        <meshStandardMaterial color={0x39405a} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.09, -0.045]}>
        <boxGeometry args={[0.2, 0.15, 0.03]} />
        <meshStandardMaterial color={0x2b3050} roughness={0.6} />
      </mesh>
      {[-0.07, -0.023, 0.023, 0.07].map((x, i) => (
        <group key={i} position={[x, 0.1, -0.025]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.012, 0.003, 6, 10]} />
            <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.035, 0.008]}>
            <boxGeometry args={[0.024, 0.055, 0.014]} />
            <meshStandardMaterial color={colors[i]} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.035, 0.017]}>
            <boxGeometry args={[0.013, 0.022, 0.004]} />
            <meshStandardMaterial color={0x0d1024} emissive={colors[i]} emissiveIntensity={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.075, 0.155, -0.055]}>
        <boxGeometry args={[0.03, 0.012, 0.012]} />
        <meshStandardMaterial color={0x9dff57} emissive={0x9dff57} emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

/* ================= ПИРАМИДА ПК: 3 + 2 + 1 ================= */
export function PCStack({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  const rows: [number, number[]][] = [
    [0.12, [0.1, 0.44, 0.78]],
    [0.36, [0.27, 0.61]],
    [0.6, [0.44]],
  ];
  const leds = [0x35e0ff, 0x9dff57, 0xffc857];
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {rows.map(([y, zs], ri) =>
        zs.map((z, i) => (
          <group key={`${ri}-${i}`} position={[0, y, z]}>
            <mesh>
              <boxGeometry args={[0.48, 0.23, 0.3]} />
              <meshStandardMaterial color={0x171a28} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[0.245, 0, 0]}>
              <boxGeometry args={[0.012, 0.2, 0.26]} />
              <meshStandardMaterial color={0x0b0d14} roughness={0.5} />
            </mesh>
            <mesh position={[0.253, 0.06, 0.08]}>
              <boxGeometry args={[0.008, 0.015, 0.015]} />
              <meshStandardMaterial color={ri === 2 ? 0xff5cae : 0x9dff57} emissive={ri === 2 ? 0xff5cae : 0x9dff57} emissiveIntensity={1.5} />
            </mesh>
            <mesh position={[0.253, -0.04, -0.06]}>
              <boxGeometry args={[0.006, 0.06, 0.06]} />
              <meshStandardMaterial color={leds[(ri + i) % 3]} emissive={leds[(ri + i) % 3]} emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

/* ================= ВИДЕОКАМЕРЫ НА ШКАФУ ================= */
export function SecurityCams({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {[
        [-0.25, 0.06, 0.1, 0.4],
        [-0.05, 0.06, -0.15, -0.6],
        [0.2, 0.06, 0.05, 1.2],
      ].map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, r, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.22, 12]} />
            <meshStandardMaterial color={0xe8ecf5} roughness={0.4} />
          </mesh>
          <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.05, 0.03, 12]} />
            <meshStandardMaterial color={0x14161c} roughness={0.4} />
          </mesh>
          <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.012, 12]} />
            <meshStandardMaterial color={0x0d1024} emissive={0x35e0ff} emissiveIntensity={0.7} />
          </mesh>
          <mesh position={[-0.02, 0.055, 0]}>
            <boxGeometry args={[0.14, 0.012, 0.07]} />
            <meshStandardMaterial color={0xe8ecf5} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {[
        [-0.3, 0.16, -0.2],
        [0.28, 0.16, -0.22],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.08, 0.05, 14]} />
            <meshStandardMaterial color={0xe8ecf5} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.035, 0]}>
            <sphereGeometry args={[0.055, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color={0x14161c} roughness={0.2} />
          </mesh>
          <mesh position={[0.015, -0.045, 0.015]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color={0x0d1024} emissive={0xff5cae} emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
      <group position={[0.02, 0.16, 0.22]} rotation={[0, 0.3, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 12]} />
          <meshStandardMaterial color={0x2a2f3d} roughness={0.5} />
        </mesh>
        <mesh position={[0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.012, 12]} />
          <meshStandardMaterial color={0x0d1024} emissive={0x9dff57} emissiveIntensity={0.8} />
        </mesh>
      </group>
      <mesh position={[-0.05, 0.07, 0.34]}>
        <boxGeometry args={[0.2, 0.14, 0.14]} />
        <meshStandardMaterial color={0x8a6a44} roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ================= ЗАПЧАСТИ ПК НА ШКАФУ ================= */
export function PCPartsPile({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[-0.38, 0.08, 0]}>
        <boxGeometry args={[0.15, 0.16, 0.2]} />
        <meshStandardMaterial color={0x2a2f3d} roughness={0.5} />
      </mesh>
      <mesh position={[-0.38, 0.08, 0.105]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.01, 12]} />
        <meshStandardMaterial color={0x14161c} roughness={0.5} />
      </mesh>
      <group position={[0, 0, -0.05]} rotation={[0, 0.2, 0.35]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.26, 0.24, 0.04]} />
          <meshStandardMaterial color={0x14161f} roughness={0.45} />
        </mesh>
        {[-0.06, 0.06].map((x, i) => (
          <mesh key={i} position={[x, 0.12, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.015, 14]} />
            <meshStandardMaterial color={0x2a2f3d} roughness={0.4} />
          </mesh>
        ))}
      </group>
      {[0.03, 0.07, 0.11].map((y, i) => (
        <mesh key={i} position={[0.38, y, 0.05]}>
          <boxGeometry args={[0.14, 0.035, 0.14]} />
          <meshStandardMaterial
            color={i === 1 ? 0x35e0ff : 0x14161f}
            emissive={i === 1 ? 0x35e0ff : 0x000000}
            emissiveIntensity={i === 1 ? 0.4 : 0}
            roughness={0.5}
          />
        </mesh>
      ))}
      <group position={[-0.12, 0, 0.16]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.1, 10]} />
          <meshStandardMaterial color={0x39405a} roughness={0.6} />
        </mesh>
        {[-0.02, 0.01, 0.03].map((x, i) => (
          <mesh key={i} position={[x, 0.12, i * 0.015 - 0.015]} rotation={[0.1 * i, 0, 0.12 - i * 0.12]}>
            <boxGeometry args={[0.015, 0.14, 0.03]} />
            <meshStandardMaterial color={0x14532d} roughness={0.6} />
          </mesh>
        ))}
      </group>
      <mesh position={[0.2, 0.03, -0.16]} rotation={[Math.PI / 2, 0, 0.5]}>
        <torusGeometry args={[0.06, 0.012, 8, 18]} />
        <meshStandardMaterial color={0xffc857} roughness={0.6} />
      </mesh>
      <mesh position={[0.3, 0.03, -0.1]} rotation={[Math.PI / 2, 0, -0.4]}>
        <torusGeometry args={[0.05, 0.01, 8, 18]} />
        <meshStandardMaterial color={0x14161c} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ================= ШКАФ: низ с дверцами, верх — открытые полки под завязку ================= */
export function PackedCabinet({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  const discColors = [0x35e0ff, 0xff5cae, 0x9dff57, 0xffc857, 0x7a5cff, 0xe8ecf5];
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* корпус панелями: верхняя половина открыта спереди, полки с глубиной */}
      <mesh position={[0, 0.95, -0.23]}>
        <boxGeometry args={[1.1, 1.9, 0.04]} />
        <meshStandardMaterial color={0x232848} roughness={0.7} />
      </mesh>
      <mesh position={[-0.53, 0.95, 0]}>
        <boxGeometry args={[0.04, 1.9, 0.5]} />
        <meshStandardMaterial color={0x232848} roughness={0.7} />
      </mesh>
      <mesh position={[0.53, 0.95, 0]}>
        <boxGeometry args={[0.04, 1.9, 0.5]} />
        <meshStandardMaterial color={0x232848} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.88, 0]}>
        <boxGeometry args={[1.1, 0.04, 0.5]} />
        <meshStandardMaterial color={0x232848} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.1, 0.04, 0.5]} />
        <meshStandardMaterial color={0x232848} roughness={0.7} />
      </mesh>
      {/* перегородка между низом и верхом */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[1.06, 0.04, 0.46]} />
        <meshStandardMaterial color={0x39405a} roughness={0.6} />
      </mesh>
      {/* низ: две дверцы */}
      <mesh position={[-0.28, 0.48, 0.26]}>
        <boxGeometry args={[0.5, 0.92, 0.02]} />
        <meshStandardMaterial color={0x343b63} roughness={0.6} />
      </mesh>
      <mesh position={[0.28, 0.48, 0.26]}>
        <boxGeometry args={[0.5, 0.92, 0.02]} />
        <meshStandardMaterial color={0x343b63} roughness={0.6} />
      </mesh>
      <mesh position={[-0.06, 0.52, 0.28]}>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <meshStandardMaterial color={0x9aa4c8} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.06, 0.52, 0.28]}>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <meshStandardMaterial color={0x9aa4c8} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* верх: открытые полки с реальной глубиной */}
      {[1.26, 1.56].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[1.06, 0.03, 0.44]} />
          <meshStandardMaterial color={0x39405a} roughness={0.6} />
        </mesh>
      ))}
      {/* полка 1: диски в ряд + коммутатор */}
      {[-0.46, -0.41, -0.36, -0.31, -0.26, -0.21, -0.16].map((x, i) => (
        <mesh key={i} position={[x, 1.09, 0]} rotation={[0, 0, i === 5 ? 0.18 : 0]}>
          <boxGeometry args={[0.022, 0.24, 0.26]} />
          <meshStandardMaterial color={discColors[i % 6]} roughness={0.5} />
        </mesh>
      ))}
      <group position={[0.22, 1.02, 0]}>
        <mesh>
          <boxGeometry args={[0.42, 0.07, 0.34]} />
          <meshStandardMaterial color={0x1b1e2c} roughness={0.45} metalness={0.3} />
        </mesh>
        {[-0.16, -0.1, -0.04, 0.02, 0.08, 0.14].map((x, i) => (
          <mesh key={i} position={[x, 0.01, 0.175]}>
            <boxGeometry args={[0.016, 0.016, 0.008]} />
            <meshStandardMaterial
              color={i % 3 === 2 ? 0xffc857 : 0x9dff57}
              emissive={i % 3 === 2 ? 0xffc857 : 0x9dff57}
              emissiveIntensity={1.4}
            />
          </mesh>
        ))}
      </group>
      {/* полка 2: коммутаторы стопкой + диски */}
      <group position={[-0.28, 1.31, 0]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, i * 0.075, 0]}>
            <mesh>
              <boxGeometry args={[0.44, 0.06, 0.34]} />
              <meshStandardMaterial color={i === 1 ? 0x2a2f3d : 0x1b1e2c} roughness={0.45} metalness={0.3} />
            </mesh>
            {[-0.17, -0.11, -0.05, 0.01, 0.07, 0.13, 0.19].map((x, k) => (
              <mesh key={k} position={[x, 0.005, 0.175]}>
                <boxGeometry args={[0.014, 0.014, 0.008]} />
                <meshStandardMaterial
                  color={(i + k) % 4 === 3 ? 0xff5cae : 0x35e0ff}
                  emissive={(i + k) % 4 === 3 ? 0xff5cae : 0x35e0ff}
                  emissiveIntensity={1.2}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      {[0.12, 0.17, 0.22, 0.27, 0.32, 0.37, 0.42].map((x, i) => (
        <mesh key={i} position={[x, 1.395, 0]} rotation={[0, 0, i === 6 ? -0.2 : 0]}>
          <boxGeometry args={[0.022, 0.24, 0.26]} />
          <meshStandardMaterial color={discColors[(i + 2) % 6]} roughness={0.5} />
        </mesh>
      ))}
      {/* полка 3: диски лёжа, бухта кабеля, коробки */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.38, 1.6 + i * 0.025, 0]}>
          <boxGeometry args={[0.28, 0.02, 0.28]} />
          <meshStandardMaterial color={discColors[(i + 4) % 6]} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0.02, 1.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.025, 8, 18]} />
        <meshStandardMaterial color={0xffc857} roughness={0.6} />
      </mesh>
      <mesh position={[0.32, 1.66, 0]}>
        <boxGeometry args={[0.2, 0.16, 0.3]} />
        <meshStandardMaterial color={0x8a6a44} roughness={0.9} />
      </mesh>
      {/* задняя стенка полок изнутри — чуть светлее, чтобы читалась глубина */}
      <mesh position={[0, 1.42, -0.2]}>
        <boxGeometry args={[1.04, 0.9, 0.01]} />
        <meshStandardMaterial color={0x2e3459} roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ================= МАЛЕНЬКАЯ КЛЮЧНИЦА НА СТЕНЕ ================= */
export function KeyCabinet({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  const colors = [0xff5cae, 0x35e0ff, 0x9dff57, 0xffc857];
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.4, 0.5, 0.05]} />
        <meshStandardMaterial color={0x2b3050} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.245, 0.02]}>
        <boxGeometry args={[0.42, 0.03, 0.1]} />
        <meshStandardMaterial color={0x39405a} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.245, 0.02]}>
        <boxGeometry args={[0.42, 0.03, 0.1]} />
        <meshStandardMaterial color={0x39405a} roughness={0.6} />
      </mesh>
      <mesh position={[-0.2, 0, 0.02]}>
        <boxGeometry args={[0.03, 0.52, 0.1]} />
        <meshStandardMaterial color={0x39405a} roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0, 0.02]}>
        <boxGeometry args={[0.03, 0.52, 0.1]} />
        <meshStandardMaterial color={0x39405a} roughness={0.6} />
      </mesh>
      {[-0.12, 0, 0.12].map((x, i) =>
        [-0.13, 0.01, 0.15].map((y, j) => (
          <group key={`${i}-${j}`} position={[x, y, 0.03]}>
            <mesh>
              <cylinderGeometry args={[0.008, 0.008, 0.03, 6]} />
              <meshStandardMaterial color={0xc7cdea} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.04, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.014, 0.004, 6, 10]} />
              <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.072, 0.014]}>
              <boxGeometry args={[0.016, 0.042, 0.008]} />
              <meshStandardMaterial color={colors[(i + j) % 4]} roughness={0.5} />
            </mesh>
          </group>
        ))
      )}
      <mesh position={[0, 0.3, 0.03]}>
        <boxGeometry args={[0.18, 0.05, 0.012]} />
        <meshStandardMaterial color={0x9dff57} emissive={0x9dff57} emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

/* ================= ВКЛЮЧЁННЫЙ СЕРВЕР С МИГАЮЩИМИ ИНДИКАТОРАМИ ================= */
export function BlinkServer({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  const leds = useRef<THREE.Mesh[]>([]);
  const fan = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    leds.current.forEach((m, i) => {
      if (!m) return;
      const speed = 3 + (i % 4) * 2.3;
      const on = Math.sin(t * speed + i * 1.7) > (i % 3 === 0 ? -0.2 : 0.3);
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity = on ? 2.4 : 0.15;
    });
    if (fan.current) fan.current.rotation.z -= 0.25;
  });
  const ledColors = [0x9dff57, 0x35e0ff, 0x9dff57, 0xffc857, 0x35e0ff, 0x9dff57, 0xff5cae, 0x9dff57];
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* две юниты */}
      {[0, 1].map((u) => (
        <group key={u} position={[0, 0.06 + u * 0.13, 0]}>
          <mesh>
            <boxGeometry args={[0.36, 0.12, 0.32]} />
            <meshStandardMaterial color={0x1b1e2c} roughness={0.45} metalness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.165]}>
            <boxGeometry args={[0.34, 0.1, 0.01]} />
            <meshStandardMaterial color={0x0b0d14} roughness={0.5} />
          </mesh>
          {/* ряд индикаторов */}
          {[-0.14, -0.1, -0.06, -0.02, 0.02, 0.06, 0.1, 0.14].map((x, i) => (
            <mesh
              key={i}
              ref={(el) => {
                if (el) leds.current[u * 8 + i] = el;
              }}
              position={[x, 0.02, 0.172]}
            >
              <boxGeometry args={[0.014, 0.014, 0.008]} />
              <meshStandardMaterial color={ledColors[i]} emissive={ledColors[i]} emissiveIntensity={2} />
            </mesh>
          ))}
          {/* ручки-защёлки */}
          <mesh position={[-0.16, -0.03, 0.172]}>
            <boxGeometry args={[0.03, 0.02, 0.01]} />
            <meshStandardMaterial color={0xc7cdea} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.16, -0.03, 0.172]}>
            <boxGeometry args={[0.03, 0.02, 0.01]} />
            <meshStandardMaterial color={0xc7cdea} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* вентиляторы сзади */}
      <mesh ref={fan} position={[-0.09, 0.12, -0.165]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.012, 12]} />
        <meshStandardMaterial color={0x39405a} roughness={0.4} />
      </mesh>
      <mesh position={[0.09, 0.12, -0.165]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.012, 12]} />
        <meshStandardMaterial color={0x39405a} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ================= КОРОБКА С ПРОВОДАМИ + КАРТРИДЖИ + БУХТА КАБЕЛЯ ================= */
export function StorageClutter({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* открытая коробка с проводами */}
      <group position={[-0.55, 0, 0]}>
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[0.42, 0.28, 0.34]} />
          <meshStandardMaterial color={0x8a6a44} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.36, 0.26, 0.28]} />
          <meshStandardMaterial color={0x5c4630} roughness={0.9} />
        </mesh>
        {/* торчащие провода */}
        {[
          [-0.1, 0.3, 0.05, 0.4],
          [0.05, 0.32, -0.06, -0.5],
          [0.12, 0.28, 0.08, 0.9],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[r, 0, r * 0.7]}>
            <torusGeometry args={[0.06, 0.008, 6, 12, Math.PI * 1.2]} />
            <meshStandardMaterial color={[0x14161c, 0x35e0ff, 0xffc857][i]} roughness={0.6} />
          </mesh>
        ))}
        {/* отворота коробки */}
        <mesh position={[-0.22, 0.3, 0]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[0.02, 0.16, 0.34]} />
          <meshStandardMaterial color={0x9a7a50} roughness={0.9} />
        </mesh>
        <mesh position={[0.22, 0.3, 0]} rotation={[0, 0, -0.7]}>
          <boxGeometry args={[0.02, 0.16, 0.34]} />
          <meshStandardMaterial color={0x9a7a50} roughness={0.9} />
        </mesh>
      </group>
      {/* стопка картриджей */}
      <group position={[0.05, 0, 0.05]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[i % 2 ? 0.02 : -0.01, 0.05 + i * 0.09, 0]} rotation={[0, (i % 2 ? 1 : -1) * 0.06, 0]}>
            <mesh>
              <boxGeometry args={[0.34, 0.08, 0.24]} />
              <meshStandardMaterial color={i === 3 ? 0x2a2f3d : 0x1b1e2c} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.125]}>
              <boxGeometry args={[0.28, 0.03, 0.01]} />
              <meshStandardMaterial color={[0x35e0ff, 0xff5cae, 0xffc857, 0x9dff57][i]} emissive={[0x35e0ff, 0xff5cae, 0xffc857, 0x9dff57][i]} emissiveIntensity={0.35} />
            </mesh>
          </group>
        ))}
      </group>
      {/* бухта кабеля */}
      <group position={[0.55, 0, -0.05]}>
        <mesh position={[0, 0.16, 0]}>
          <torusGeometry args={[0.16, 0.05, 10, 24]} />
          <meshStandardMaterial color={0x14161c} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.16, 0.045, 10, 24]} />
          <meshStandardMaterial color={0x1d2130} roughness={0.7} />
        </mesh>
        <mesh position={[0.1, 0.32, 0.08]} rotation={[0.6, 0, 0.4]}>
          <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
          <meshStandardMaterial color={0x14161c} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/* ================= РЕВОЛЬВЕР, НАПЕЧАТАННЫЙ НА 3D-ПРИНТЕРЕ ================= */
export function PrintedRevolver({
  position,
  rotY = 0,
  onClick,
}: {
  position: [number, number, number];
  rotY?: number;
  onClick?: () => void;
}) {
  return (
    <group
      position={position}
      rotation={[0, rotY, 0]}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      onPointerOver={
        onClick
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={onClick ? () => (document.body.style.cursor = "auto") : undefined}
    >
      {/* слои печати видны: слегка полосатый пластик */}
      <mesh position={[0, 0.075, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.22, 10]} />
        <meshStandardMaterial color={0x9dff57} roughness={0.85} />
      </mesh>
      {/* барабан */}
      <mesh position={[0, 0.075, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.05, 6]} />
        <meshStandardMaterial color={0x7ed957} roughness={0.85} />
      </mesh>
      {/* рамка */}
      <mesh position={[0, 0.055, -0.02]}>
        <boxGeometry args={[0.025, 0.03, 0.2]} />
        <meshStandardMaterial color={0x9dff57} roughness={0.85} />
      </mesh>
      {/* рукоять под углом */}
      <mesh position={[0, 0.02, -0.13]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.024, 0.09, 0.035]} />
        <meshStandardMaterial color={0x6bc43f} roughness={0.85} />
      </mesh>
      {/* спусковая скоба */}
      <mesh position={[0, 0.025, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.025, 0.006, 6, 12, Math.PI]} />
        <meshStandardMaterial color={0x9dff57} roughness={0.85} />
      </mesh>
      {/* мушка */}
      <mesh position={[0, 0.095, 0.16]}>
        <boxGeometry args={[0.008, 0.014, 0.008]} />
        <meshStandardMaterial color={0x9dff57} roughness={0.85} />
      </mesh>
    </group>
  );
}

/* ================= МИНИ-ХОЛОДИЛЬНИК ================= */
export function MiniFridge({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.42, 0.5, 0.4]} />
        <meshStandardMaterial color={0xc7cdea} roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.25, 0.205]}>
        <boxGeometry args={[0.38, 0.46, 0.015]} />
        <meshStandardMaterial color={0xe8ecf5} roughness={0.3} />
      </mesh>
      <mesh position={[-0.16, 0.25, 0.22]}>
        <boxGeometry args={[0.03, 0.16, 0.02]} />
        <meshStandardMaterial color={0x2a2f3d} roughness={0.4} />
      </mesh>
      <mesh position={[0.08, 0.4, 0.216]}>
        <boxGeometry args={[0.12, 0.05, 0.008]} />
        <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={0.9} />
      </mesh>
      {/* магнитики */}
      <mesh position={[-0.05, 0.16, 0.216]}>
        <boxGeometry args={[0.05, 0.05, 0.008]} />
        <meshStandardMaterial color={0xff5cae} roughness={0.5} />
      </mesh>
      <mesh position={[0.06, 0.12, 0.216]}>
        <boxGeometry args={[0.04, 0.06, 0.008]} />
        <meshStandardMaterial color={0xffc857} roughness={0.5} />
      </mesh>
      {/* решётка снизу */}
      <mesh position={[0, 0.03, 0.212]}>
        <boxGeometry args={[0.3, 0.04, 0.01]} />
        <meshStandardMaterial color={0x9aa4b8} roughness={0.5} />
      </mesh>
      {/* банка на крыше */}
      <mesh position={[0.1, 0.55, -0.05]}>
        <cylinderGeometry args={[0.033, 0.033, 0.1, 10]} />
        <meshStandardMaterial color={0x9dff57} roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

/* ================= МИНИ-РЕМОНТ НА Г-ОБРАЗНОМ СТОЛЕ ================= */
export function MiniRepair({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.6]} />
        <meshStandardMaterial color={0x1d3a2f} roughness={0.9} />
      </mesh>
      <group position={[0, 0, -0.05]}>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.34, 0.06, 0.4]} />
          <meshStandardMaterial color={0x171a28} roughness={0.5} metalness={0.3} />
        </mesh>
        {[-0.16, 0.16].map((x, i) => (
          <mesh key={i} position={[x, 0.1, 0]}>
            <boxGeometry args={[0.02, 0.1, 0.4]} />
            <meshStandardMaterial color={0x171a28} roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.26, 0.3]} />
          <meshStandardMaterial color={0x14532d} roughness={0.7} />
        </mesh>
        <mesh position={[-0.05, 0.075, -0.06]}>
          <boxGeometry args={[0.05, 0.02, 0.05]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.07, 0.075, 0.08]}>
          <boxGeometry args={[0.1, 0.015, 0.02]} />
          <meshStandardMaterial color={0x35e0ff} roughness={0.6} />
        </mesh>
      </group>
      <mesh position={[0.02, 0.03, 0.28]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.24, 0.03, 0.1]} />
        <meshStandardMaterial color={0x14161f} roughness={0.45} />
      </mesh>
      <group position={[-0.28, 0.012, 0.25]} rotation={[0, 1.2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.16, 8]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.06, 10]} />
          <meshStandardMaterial color={0xffc857} roughness={0.5} />
        </mesh>
      </group>
      {[
        [-0.2, 0.3],
        [-0.16, 0.34],
        [-0.24, 0.35],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.01, z]} rotation={[Math.PI / 2, 0, i]}>
          <cylinderGeometry args={[0.008, 0.008, 0.024, 6]} />
          <meshStandardMaterial color={0xc7cdea} metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0.3, 0.02, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 14]} />
        <meshStandardMaterial color={0x14161f} roughness={0.5} />
      </mesh>
      {/* блок питания */}
      <mesh position={[-0.3, 0.08, -0.32]}>
        <boxGeometry args={[0.15, 0.16, 0.2]} />
        <meshStandardMaterial color={0x2a2f3d} roughness={0.5} />
      </mesh>
      <mesh position={[-0.3, 0.08, -0.215]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.01, 12]} />
        <meshStandardMaterial color={0x14161c} roughness={0.5} />
      </mesh>
      {/* бухта кабеля */}
      <mesh position={[0.3, 0.03, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.015, 8, 16]} />
        <meshStandardMaterial color={0xffc857} roughness={0.6} />
      </mesh>
      {/* спрей-очиститель */}
      <mesh position={[0.33, 0.06, 0.02]}>
        <cylinderGeometry args={[0.026, 0.026, 0.12, 10]} />
        <meshStandardMaterial color={0x35e0ff} roughness={0.35} />
      </mesh>
      <mesh position={[0.33, 0.13, 0.02]}>
        <cylinderGeometry args={[0.018, 0.018, 0.02, 10]} />
        <meshStandardMaterial color={0xd7dce8} roughness={0.4} />
      </mesh>
      {/* стакан с планками памяти */}
      <group position={[-0.33, 0, 0.02]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.045, 0.036, 0.1, 10]} />
          <meshStandardMaterial color={0x39405a} roughness={0.6} />
        </mesh>
        {[-0.015, 0.008, 0.028].map((x, i) => (
          <mesh key={i} position={[x, 0.12, i * 0.014 - 0.014]} rotation={[0.1 * i, 0, 0.14 - i * 0.14]}>
            <boxGeometry args={[0.014, 0.13, 0.028]} />
            <meshStandardMaterial color={0x14532d} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
