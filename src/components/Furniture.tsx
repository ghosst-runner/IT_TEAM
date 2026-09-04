import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useCodeScreen, useTVScreen, useAnimatedTexture, hash } from "./screens";

export interface Clickable {
  onClick?: () => void;
  onHover?: (h: boolean) => void;
}

function useHoverCursor(onHover?: (h: boolean) => void) {
  return {
    onPointerOver: (e: THREE.Event) => {
      (e as unknown as { stopPropagation: () => void }).stopPropagation();
      onHover?.(true);
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      onHover?.(false);
      document.body.style.cursor = "auto";
    },
  };
}

/* ================= СТОЛ ================= */
export function Desk({
  position,
  width = 1.8,
  rotY = 0,
}: {
  position: [number, number, number];
  width?: number;
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.74, 0]}>
        <boxGeometry args={[width, 0.06, 0.85]} />
        <meshStandardMaterial color={0x3a4066} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[width - 0.06, 0.02, 0.8]} />
        <meshStandardMaterial color={0x2b3050} roughness={0.6} />
      </mesh>
      {/* ножки-панели */}
      <mesh position={[-width / 2 + 0.06, 0.36, 0]}>
        <boxGeometry args={[0.06, 0.72, 0.75]} />
        <meshStandardMaterial color={0x232848} roughness={0.7} />
      </mesh>
      <mesh position={[width / 2 - 0.06, 0.36, 0]}>
        <boxGeometry args={[0.06, 0.72, 0.75]} />
        <meshStandardMaterial color={0x232848} roughness={0.7} />
      </mesh>
      {/* неоновая кромка */}
      <mesh position={[0, 0.715, 0.43]}>
        <boxGeometry args={[width - 0.1, 0.015, 0.015]} />
        <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

/* ================= КРЕСЛО ================= */
export function Chair({
  position,
  color = 0x2b3050,
  rotY = 0,
}: {
  position: [number, number, number];
  color?: number;
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.46, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.48]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.78, -0.26]}>
        <boxGeometry args={[0.48, 0.62, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.86, -0.24]}>
        <boxGeometry args={[0.4, 0.14, 0.06]} />
        <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.36, 10]} />
        <meshStandardMaterial color={0x14161f} metalness={0.6} roughness={0.4} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.22, 0.06, Math.cos(a) * 0.22]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.06, 0.05, 0.3]} />
            <meshStandardMaterial color={0x14161f} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ================= МОНИТОР с живым кодом ================= */
export function Monitor({
  position,
  tint = "#35e0ff",
  size = 1,
  rotY = 0,
  ...click
}: {
  position: [number, number, number];
  tint?: string;
  size?: number;
  rotY?: number;
} & Clickable) {
  const tex = useCodeScreen(tint);
  const w = 0.68 * size;
  const h = 0.4 * size;
  const hover = useHoverCursor(click.onHover);
  return (
    <group position={position} rotation={[0, rotY, 0]} {...hover} onClick={click.onClick}>
      {/* ножка стоит прямо на столешнице */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.22, 0.04, 0.18]} />
        <meshStandardMaterial color={0x14161f} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, -0.02]}>
        <boxGeometry args={[0.06, 0.14, 0.05]} />
        <meshStandardMaterial color={0x14161f} roughness={0.5} />
      </mesh>
      {/* корпус */}
      <mesh position={[0, 0.18 + h / 2, 0]}>
        <boxGeometry args={[w + 0.05, h + 0.05, 0.04]} />
        <meshStandardMaterial color={0x10131f} roughness={0.45} />
      </mesh>
      {/* экран */}
      <mesh position={[0, 0.18 + h / 2, -0.026]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* подсветка снизу */}
      <mesh position={[0, 0.17, -0.03]}>
        <boxGeometry args={[w * 0.7, 0.012, 0.012]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

/* ================= НОУТБУК ================= */
export function Laptop({
  position,
  tint = "#9dff57",
  rotY = 0,
  ...click
}: {
  position: [number, number, number];
  tint?: string;
  rotY?: number;
} & Clickable) {
  const tex = useCodeScreen(tint);
  const hover = useHoverCursor(click.onHover);
  return (
    <group position={position} rotation={[0, rotY, 0]} {...hover} onClick={click.onClick}>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.36, 0.03, 0.26]} />
        <meshStandardMaterial color={0x1b1e2c} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.032, 0.02]}>
        <boxGeometry args={[0.3, 0.01, 0.16]} />
        <meshStandardMaterial color={0x0c0e16} roughness={0.6} />
      </mesh>
      <group position={[0, 0.03, -0.12]} rotation={[-0.32, 0, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.36, 0.24, 0.02]} />
          <meshStandardMaterial color={0x1b1e2c} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.12, 0.012]}>
          <planeGeometry args={[0.32, 0.2]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ================= ПК с крутящимися кулерами ================= */
export function PCCase({
  position,
  rgb = "#35e0ff",
  rotY = 0,
  ...click
}: { position: [number, number, number]; rgb?: string; rotY?: number } & Clickable) {
  const fan1 = useRef<THREE.Group>(null);
  const fan2 = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (fan1.current) fan1.current.rotation.z -= dt * 9;
    if (fan2.current) fan2.current.rotation.z -= dt * 11;
  });
  const hover = useHoverCursor(click.onHover);
  const Fan = ({ y, ref }: { y: number; ref: React.RefObject<THREE.Group | null> }) => (
    <group position={[0, y, 0.21]}>
      <mesh>
        <boxGeometry args={[0.2, 0.2, 0.02]} />
        <meshStandardMaterial color={0x0b0d14} roughness={0.5} />
      </mesh>
      <group ref={ref}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 3) * Math.PI * 2]} position={[0, 0, 0.015]}>
            <boxGeometry args={[0.035, 0.17, 0.01]} />
            <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
  return (
    <group position={position} rotation={[0, rotY, 0]} {...hover} onClick={click.onClick}>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.26, 0.64, 0.5]} />
        <meshStandardMaterial color={0x171a28} roughness={0.45} metalness={0.3} />
      </mesh>
      {/* стекло сбоку */}
      <mesh position={[0.135, 0.34, 0]}>
        <boxGeometry args={[0.01, 0.5, 0.4]} />
        <meshStandardMaterial color={0x35e0ff} transparent opacity={0.18} roughness={0.1} />
      </mesh>
      {/* RGB-полоса */}
      <mesh position={[0.14, 0.1, 0.2]}>
        <boxGeometry args={[0.012, 0.5, 0.02]} />
        <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={2.2} />
      </mesh>
      <Fan y={0.5} ref={fan1} />
      <Fan y={0.26} ref={fan2} />
    </group>
  );
}

/* ================= ТЕЛЕВИЗОР ================= */
export function TV({ position, rotY = 0, ...click }: { position: [number, number, number]; rotY?: number } & Clickable) {
  const tex = useTVScreen();
  const hover = useHoverCursor(click.onHover);
  return (
    <group position={position} rotation={[0, rotY, 0]} {...hover} onClick={click.onClick}>
      <mesh>
        <boxGeometry args={[2.3, 1.32, 0.08]} />
        <meshStandardMaterial color={0x0c0e16} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.046]}>
        <planeGeometry args={[2.16, 1.18]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.72, 0.02]}>
        <boxGeometry args={[0.5, 0.06, 0.06]} />
        <meshStandardMaterial color={0x14161f} />
      </mesh>
    </group>
  );
}

/* ================= НАСТОЛЬНЫЙ ВЕНТИЛЯТОР (классика: решётка, лопасти, ножка) ================= */
export function DeskFan({
  position,
  rotY = 0,
  size = 1,
  ...click
}: { position: [number, number, number]; rotY?: number; size?: number } & Clickable) {
  const blades = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z -= dt * 12;
  });
  const hover = useHoverCursor(click.onHover);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={size} {...hover} onClick={click.onClick}>
      {/* основание */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.04, 20]} />
        <meshStandardMaterial color={0x10131f} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.045, 0.06]}>
        <boxGeometry args={[0.08, 0.03, 0.06]} />
        <meshStandardMaterial color={0x1b1e2c} roughness={0.5} />
      </mesh>
      {/* ножка-шея с наклоном */}
      <mesh position={[0, 0.16, -0.03]} rotation={[0.28, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.03, 0.26, 10]} />
        <meshStandardMaterial color={0x10131f} roughness={0.5} />
      </mesh>
      {/* моторный блок горизонтально */}
      <mesh position={[0, 0.3, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.048, 0.14, 14]} />
        <meshStandardMaterial color={0x1b1e2c} roughness={0.4} />
      </mesh>
      {/* лопасти */}
      <group ref={blades} position={[0, 0.3, 0.06]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, 0, (i / 4) * Math.PI * 2 + 0.4]}>
            <mesh position={[0, 0.115, 0]} rotation={[0.55, 0, 0]}>
              <boxGeometry args={[0.085, 0.21, 0.008]} />
              <meshStandardMaterial color={0x9adfff} emissive={0x35e0ff} emissiveIntensity={0.25} transparent opacity={0.92} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.028, 0.035, 12]} />
          <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={1.3} />
        </mesh>
      </group>
      {/* защитная решётка: кольца + радиальные прутья */}
      <mesh position={[0, 0.3, 0.11]}>
        <torusGeometry args={[0.2, 0.008, 8, 32]} />
        <meshStandardMaterial color={0x39405a} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3, 0.075]}>
        <torusGeometry args={[0.135, 0.006, 8, 28]} />
        <meshStandardMaterial color={0x39405a} metalness={0.7} roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={i} position={[0, 0.3, 0.09]} rotation={[0, 0, (i / 8) * Math.PI * 2]}>
          <boxGeometry args={[0.006, 0.4, 0.006]} />
          <meshStandardMaterial color={0x39405a} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.3, 0.115]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.02, 10]} />
        <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={1.5} />
      </mesh>
      {/* задняя решётка */}
      <mesh position={[0, 0.3, -0.09]}>
        <torusGeometry args={[0.19, 0.007, 8, 28]} />
        <meshStandardMaterial color={0x39405a} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ================= КЛАВИАТУРА + МЫШЬ ================= */
/* клавиши: псевдо-нажатия и разноцветная подсветка */
function useKeysTexture(rgb: string) {
  return useAnimatedTexture(
    96,
    32,
    (ctx, t) => {
      ctx.fillStyle = "#0b0e16";
      ctx.fillRect(0, 0, 96, 32);
      const step = Math.floor(t * 7);
      const palette = ["#35e0ff", "#ff5cae", "#9dff57", "#ffc857", "#7a5cff"];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 12; c++) {
          const i = r * 12 + c;
          const lit = hash(i * 3.7 + step * 1.7) > 0.7;
          const pressed = hash(i * 9.1 + step * 2.3) > 0.88;
          ctx.fillStyle = lit ? palette[Math.floor(hash(i + step) * palette.length)] : pressed ? "#39405a" : "#171b28";
          ctx.fillRect(2 + c * 7.7, 2 + r * 7.5, 6.4, pressed ? 5.2 : 6.2);
        }
      }
      // пробел пульсирует цветом владельца
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 3.2);
      ctx.fillStyle = rgb;
      ctx.fillRect(30, 2 + 3 * 7.5, 36, 5.6);
      ctx.globalAlpha = 1;
    },
    3
  );
}

export function KeyboardMouse({
  position,
  rgb = "#35e0ff",
  rotY = 0,
  flipMouse = false,
}: {
  position: [number, number, number];
  rgb?: string;
  rotY?: number;
  flipMouse?: boolean;
}) {
  const mx = flipMouse ? -0.3 : 0.3;
  const keys = useKeysTexture(rgb);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.42, 0.03, 0.15]} />
        <meshStandardMaterial color={0x14161f} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.38, 0.11]} />
        <meshBasicMaterial map={keys} toneMapped={false} />
      </mesh>
      {/* мышь под правой рукой */}
      <mesh position={[mx, 0.02, 0.02]}>
        <boxGeometry args={[0.07, 0.04, 0.11]} />
        <meshStandardMaterial color={0x1b1e2c} roughness={0.5} />
      </mesh>
      <mesh position={[mx, 0.042, -0.02]}>
        <boxGeometry args={[0.02, 0.008, 0.03]} />
        <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[mx, 0.041, 0.03]}>
        <boxGeometry args={[0.012, 0.006, 0.03]} />
        <meshStandardMaterial color={0x0d1024} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ================= КРУЖКА ================= */
export function Mug({ position, color = 0xff5cae }: { position: [number, number, number]; color?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.045, 0.04, 0.1, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0.055, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.03, 0.008, 8, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.098, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.006, 12]} />
        <meshStandardMaterial color={0x3a2417} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ================= ТРОФЕЙ «ЛУЧШИЙ РАЗРАБОТЧИК» ================= */
export function Trophy({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.12, 0.04, 0.12]} />
        <meshStandardMaterial color={0x1b1e2c} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.02, 0.035, 0.08, 10]} />
        <meshStandardMaterial color={0xffc857} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.1, 12]} />
        <meshStandardMaterial color={0xffc857} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[-0.07, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.035, 0.008, 8, 12]} />
        <meshStandardMaterial color={0xffc857} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0.07, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.035, 0.008, 8, 12]} />
        <meshStandardMaterial color={0xffc857} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.23, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial color={0xffe9b8} emissive={0xffc857} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

/* ================= КОРОБКИ (кладмен) ================= */
export function Boxes({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.42, 0.32, 0.36]} />
        <meshStandardMaterial color={0x8a6a44} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.16, 0.185]}>
        <boxGeometry args={[0.42, 0.06, 0.01]} />
        <meshStandardMaterial color={0xd9c08a} roughness={0.9} />
      </mesh>
      <mesh position={[0.05, 0.46, -0.02]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.34, 0.26, 0.3]} />
        <meshStandardMaterial color={0x9a7a50} roughness={0.9} />
      </mesh>
      <mesh position={[0.05, 0.46, 0.13]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.34, 0.05, 0.01]} />
        <meshStandardMaterial color={0xe4cfa0} roughness={0.9} />
      </mesh>
      <mesh position={[-0.02, 0.66, 0]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.22, 0.16, 0.2]} />
        <meshStandardMaterial color={0x7a5c3a} roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ================= ШКАФ ================= */
export function Cabinet({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[1.1, 1.9, 0.5]} />
        <meshStandardMaterial color={0x2b3050} roughness={0.7} />
      </mesh>
      <mesh position={[-0.28, 0.95, 0.26]}>
        <boxGeometry args={[0.5, 1.8, 0.02]} />
        <meshStandardMaterial color={0x343b63} roughness={0.6} />
      </mesh>
      <mesh position={[0.28, 0.95, 0.26]}>
        <boxGeometry args={[0.5, 1.8, 0.02]} />
        <meshStandardMaterial color={0x343b63} roughness={0.6} />
      </mesh>
      <mesh position={[-0.06, 1.0, 0.28]}>
        <boxGeometry args={[0.03, 0.22, 0.03]} />
        <meshStandardMaterial color={0x9aa4c8} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.06, 1.0, 0.28]}>
        <boxGeometry args={[0.03, 0.22, 0.03]} />
        <meshStandardMaterial color={0x9aa4c8} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* верхняя полка с вещами */}
      <mesh position={[0, 1.94, 0]}>
        <boxGeometry args={[1.14, 0.05, 0.54]} />
        <meshStandardMaterial color={0x232848} />
      </mesh>
    </group>
  );
}

/* ================= РАСТЕНИЕ ================= */
export function Plant({ position, s = 1 }: { position: [number, number, number]; s?: number }) {
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.12, 0.09, 0.22, 10]} />
        <meshStandardMaterial color={0xb3563f} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.05, 0.24, 0.05]} />
        <meshStandardMaterial color={0x2f7a3d} roughness={0.8} />
      </mesh>
      {[
        [0.12, 0.42, 0.05, 0.5],
        [-0.12, 0.5, -0.04, -0.5],
        [0.04, 0.58, 0.12, 0.2],
        [-0.05, 0.66, -0.1, -0.3],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, r]}>
          <boxGeometry args={[0.22, 0.06, 0.1]} />
          <meshStandardMaterial color={i % 2 ? 0x3f9a4d : 0x2f7a3d} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
