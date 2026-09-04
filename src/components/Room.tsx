import { MeshReflectorMaterial } from "@react-three/drei";
import {
  useCityWindow,
  useWhiteboard,
  useNeonSign,
  useDoorSign,
  useAnimePoster,
  useCalendar,
  useIoffePoster,
  useOwlPoster,
} from "./screens";

/* Компактная комната: x ∈ [-5.5, 5.5], z ∈ [-3.6, 2.6], высота 3.3 */
export function Room({ onObjectClick }: { onObjectClick?: (key: string) => void }) {
  const skyline = useCityWindow();
  const whiteboard = useWhiteboard();
  const sign = useNeonSign();
  const doorSign = useDoorSign();
  const anime = useAnimePoster();
  const calendar = useCalendar();
  const ioffe = useIoffePoster();
  const owl = useOwlPoster();

  return (
    <group>
      {/* ПОЛ: глянцевый, сBlur-отражением неона и мебели */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]} receiveShadow>
        <planeGeometry args={[11, 6.2]} />
        <MeshReflectorMaterial
          mirror={0.55}
          blur={[280, 70]}
          resolution={1024}
          mixBlur={0.85}
          mixStrength={1.5}
          roughness={0.72}
          depthScale={1.0}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#242b52"
          metalness={0.45}
        />
      </mesh>
      <gridHelper args={[11, 22, "#35e0ff", "#454e85"]} position={[0, 0.012, -0.5]} scale={[1, 1, 6.2 / 11]} />

      {/* ПОТОЛОК */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.3, -0.5]}>
        <planeGeometry args={[11, 6.2]} />
        <meshStandardMaterial color={0x2a3054} roughness={0.9} />
      </mesh>
      {/* световые панели */}
      {[
        [-3, -1.8],
        [0.4, 0.4],
        [3.6, -1.8],
      ].map(([x, z], i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[x, 3.27, z]}>
          <planeGeometry args={[2.6, 1.1]} />
          <meshStandardMaterial color={0xdfe9ff} emissive={0xdfe9ff} emissiveIntensity={1.5} />
        </mesh>
      ))}
      {/* неоновые трубы по потолку */}
      <mesh position={[0, 3.2, -3.5]}>
        <boxGeometry args={[10.6, 0.04, 0.04]} />
        <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[0, 3.2, 2.5]}>
        <boxGeometry args={[10.6, 0.04, 0.04]} />
        <meshStandardMaterial color={0xff5cae} emissive={0xff5cae} emissiveIntensity={2.2} />
      </mesh>

      {/* СТЕНЫ */}
      <mesh position={[0, 1.65, -3.6]}>
        <planeGeometry args={[11, 3.3]} />
        <meshStandardMaterial color={0x3a4169} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.65, 2.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[11, 3.3]} />
        <meshStandardMaterial color={0x3a4169} roughness={0.85} />
      </mesh>
      <mesh position={[-5.5, 1.65, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6.2, 3.3]} />
        <meshStandardMaterial color={0x343b63} roughness={0.85} />
      </mesh>
      <mesh position={[5.5, 1.65, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6.2, 3.3]} />
        <meshStandardMaterial color={0x343b63} roughness={0.85} />
      </mesh>

      {/* плинтусный неон */}
      <mesh position={[0, 0.09, -3.57]}>
        <boxGeometry args={[11, 0.05, 0.03]} />
        <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[0, 0.09, 2.57]}>
        <boxGeometry args={[11, 0.05, 0.03]} />
        <meshStandardMaterial color={0xff5cae} emissive={0xff5cae} emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[-5.47, 0.09, -0.5]}>
        <boxGeometry args={[0.03, 0.05, 6.2]} />
        <meshStandardMaterial color={0xffc857} emissive={0xffc857} emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[5.47, 0.09, -0.5]}>
        <boxGeometry args={[0.03, 0.05, 6.2]} />
        <meshStandardMaterial color={0x9dff57} emissive={0x9dff57} emissiveIntensity={1.2} />
      </mesh>

      {/* ДВЕРЬ (южная стена — сторона Святослава, напротив Александра) */}
      <group position={[4.4, 0, 2.55]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[1.25, 2.3, 0.1]} />
          <meshStandardMaterial color={0x1b2136} roughness={0.6} />
        </mesh>
        {/* полотно двери приоткрыто: петля слева, свободный край в комнату */}
        <group position={[-0.525, 0, 0]} rotation={[0, -0.6, 0]}>
          <mesh position={[0.525, 1.15, 0.06]}>
            <boxGeometry args={[1.05, 2.1, 0.06]} />
            <meshStandardMaterial color={0x1f8a8a} emissive={0x17b8b8} emissiveIntensity={0.55} roughness={0.4} />
          </mesh>
          <mesh position={[0.525, 1.75, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.03, 20]} />
            <meshStandardMaterial color={0xbffcff} emissive={0x35e0ff} emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.945, 1.1, 0.1]}>
            <boxGeometry args={[0.06, 0.24, 0.06]} />
            <meshStandardMaterial color={0xc7cdea} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
        {/* табличка «Выход из матрицы» */}
        <mesh position={[0, 2.5, 0.08]}>
          <boxGeometry args={[1.05, 0.3, 0.03]} />
          <meshStandardMaterial color={0x0d1024} />
        </mesh>
        <mesh position={[0, 2.5, 0.1]}>
          <planeGeometry args={[1.0, 0.25]} />
          <meshBasicMaterial map={doorSign} toneMapped={false} />
        </mesh>
      </group>

      {/* ОКНО с ночным городом — во всю восточную стену (слева от Александра) */}
      <group position={[5.44, 1.8, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[6.0, 2.3, 0.08]} />
          <meshStandardMaterial color={0x141a30} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[5.8, 2.0]} />
          <meshBasicMaterial map={skyline} toneMapped={false} />
        </mesh>
        {[-1.95, 0, 1.95].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.07]}>
            <boxGeometry args={[0.09, 2.1, 0.03]} />
            <meshStandardMaterial color={0x1b2136} />
          </mesh>
        ))}
        <mesh position={[0, 1.05, 0.07]}>
          <boxGeometry args={[6.0, 0.1, 0.05]} />
          <meshStandardMaterial color={0x1b2136} />
        </mesh>
        <mesh position={[0, -1.05, 0.07]}>
          <boxGeometry args={[6.0, 0.1, 0.05]} />
          <meshStandardMaterial color={0x1b2136} />
        </mesh>
      </group>

      {/* ВАЙТБОРД (северная стена, над шкафом) */}
      <group position={[2.6, 1.9, -3.54]}>
        <mesh>
          <boxGeometry args={[2.4, 1.4, 0.06]} />
          <meshStandardMaterial color={0x8b93b8} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[2.24, 1.24]} />
          <meshBasicMaterial map={whiteboard} toneMapped={false} />
        </mesh>
      </group>

      {/* постер с аниме-девочкой за Владимиром, на уровне спринт-доски */}
      <mesh position={[-0.2, 1.9, -3.55]}>
        <planeGeometry args={[0.72, 0.95]} />
        <meshBasicMaterial map={anime} toneMapped={false} />
      </mesh>
      {/* календарь справа от постера */}
      <mesh position={[0.55, 1.9, -3.55]}>
        <planeGeometry args={[0.5, 0.63]} />
        <meshBasicMaterial map={calendar} toneMapped={false} />
      </mesh>
      {/* плакат подозрительной совы возле аниме-девочки */}
      <mesh position={[-0.95, 1.9, -3.55]}>
        <planeGeometry args={[0.6, 0.75]} />
        <meshBasicMaterial map={owl} toneMapped={false} />
      </mesh>
      {/* постер ИОФФЕ на западной стене, за Виталиком — кликабельный */}
      <mesh
        position={[-5.46, 1.9, -2.4]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onObjectClick?.("ioffe");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[0.72, 0.9]} />
        <meshBasicMaterial map={ioffe} toneMapped={false} />
      </mesh>

      {/* НЕОНОВАЯ ВЫВЕСКА (южная стена, западнее большого ТВ) */}
      <mesh position={[-2.9, 2.2, 2.55]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.8, 1.05]} />
        <meshBasicMaterial map={sign} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
