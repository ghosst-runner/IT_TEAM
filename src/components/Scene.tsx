import { useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Room } from "./Room";
import { Lights } from "./Lights";
import { PixelCharacter } from "./PixelCharacter";
import { CameraController, type CameraFocus, type CameraMode } from "./CameraController";
import {
  Desk,
  Chair,
  Monitor,
  Laptop,
  PCCase,
  TV,
  DeskFan,
  KeyboardMouse,
  Mug,
  Boxes,
  Cabinet,
  Plant,
} from "./Furniture";
import {
  OfficePrinter,
  Printer3D,
  DrawerUnit,
  WallShelf,
  CoffeePoint,
  Phone,
  AirCon,
  RepairBench,
  Nettop,
  EnergyCan,
  DocumentFolders,
  KeyOrganizer,
  PCStack,
  SecurityCams,
  PCPartsPile,
  MiniRepair,
  MiniFridge,
  PackedCabinet,
  BossMug,
  AudiRings,
  DeskClutter,
  StorageClutter,
  PrintedRevolver,
} from "./Props";

export interface CharacterVisual {
  id: string;
  name: string;
  accent: string;
  seat: [number, number];
  seatRot: number;
  walkPath: [number, number][];
  delay: number;
  scale: number;
  build: number;
  skin: number;
  hair: number;
  shirt: number;
  pants: number;
  shoes: number;
  hairStyle: "short" | "buzz" | "side" | "messy" | "flat";
  glasses?: boolean;
  beard?: boolean;
  bigBeard?: boolean;
  tie?: boolean;
  longSleeve?: boolean;
  headset?: boolean;
  standing?: boolean;
  holdMug?: boolean;
  holdFolder?: boolean;
  talking?: boolean;
  nodding?: boolean;
  lapLaptop?: boolean;
  stillArms?: boolean;
  peek?: boolean;
  noMorning?: boolean;
  frozen?: boolean;
}

export const CHARACTERS: CharacterVisual[] = [
  {
    id: "alex",
    name: "Александр",
    accent: "#ffc857",
    seat: [4.4, -2.6],
    seatRot: 0, // смотрит на юг, на вход
    walkPath: [
      [4.4, 2.3],
      [4.0, 1.9],
      [2.4, 1.9],
      [2.4, -0.2],
      [3.05, -0.2],
      [3.05, -3.2],
      [4.4, -3.2],
      [4.4, -2.98],
    ],
    delay: 0.6,
    scale: 1.0, // 185 см
    build: 0.96,
    skin: 0xf2c09a,
    hair: 0x241a12,
    shirt: 0x14161c, // чёрное поло
    pants: 0x2b2f3a, // джоггеры
    shoes: 0xe8ecf5,
    hairStyle: "side",
    glasses: true,
  },
  {
    id: "vlad",
    name: "Владимир",
    accent: "#ff5cae",
    seat: [-0.2, -2.65],
    seatRot: 0, // смотрит на юг: в центр комнаты, на Святослава
    walkPath: [
      [4.4, 2.3],
      [4.0, 1.9],
      [2.12, 1.9],
      [2.12, -3.2],
      [-0.2, -3.2],
      [-0.2, -2.98],
    ],
    delay: 1.6,
    scale: 0.9, // 165 см
    build: 0.98,
    skin: 0xeebb92,
    hair: 0x3a2c1e,
    shirt: 0x232a4d, // строгий костюм
    pants: 0x1a1f38,
    shoes: 0x14161c,
    hairStyle: "short",
    beard: true,
    tie: true,
    longSleeve: true,
  },
  {
    id: "vitaly",
    name: "Виталий",
    accent: "#9dff57",
    seat: [-3.6, -2.4],
    seatRot: Math.PI / 2, // смотрит на восток, на Владимира
    walkPath: [
      [4.4, 2.3],
      [4.0, 1.9],
      [2.12, 1.9],
      [2.12, -0.3],
      [-3.6, -0.3],
      [-3.6, -2.72],
    ],
    delay: 2.6,
    scale: 1.0, // 185 см
    build: 1.22, // плотное телосложение
    skin: 0xf0bd96,
    hair: 0x1d1712,
    shirt: 0xd9c1a3, // бежевая футболка
    pants: 0x15171f, // чёрные штаны
    shoes: 0x2b2f3a,
    hairStyle: "buzz",
    glasses: true,
    beard: true,
    bigBeard: true, // гуще, чем у Владимира, но без фанатизма
  },
  {
    id: "svyat",
    name: "Святослав",
    accent: "#35e0ff",
    seat: [0, 1.4],
    seatRot: Math.PI, // лицом на север, к Владимиру и в центр
    walkPath: [
      [4.4, 2.3],
      [4.0, 1.9],
      [0.6, 1.9],
      [0, 1.82],
    ],
    delay: 3.6,
    scale: 0.95, // 175 см
    build: 0.97,
    skin: 0xf2c09a,
    hair: 0x4a3524,
    shirt: 0x3f465e, // футболка
    pants: 0x8a90a3, // серые спортивные
    shoes: 0x35e0ff,
    hairStyle: "flat", // ровная стрижка
  },
  {
    id: "ruben",
    name: "Рубен",
    accent: "#ff8c42",
    delay: 4.6,
    scale: 0.97,
    build: 1.22, // телосложение как у Виталика
    skin: 0xe0a878,
    hair: 0x17120d,
    shirt: 0x3f434b, // пиджак в цвет штанов
    pants: 0x3f434b, // брюки
    shoes: 0x14161c,
    hairStyle: "flat", // ровная причёска без квадратов
    glasses: true,
    tie: true,
    longSleeve: true,
    standing: true,
    holdFolder: true,
    talking: true,
    noMorning: true,
    seat: [4.45, 1.05], // чуть вперёд, дальше от кулера
    seatRot: -2.24,
    walkPath: [
      [4.4, 2.3],
      [4.45, 1.7],
      [4.45, 1.05],
    ],
  },
  {
    id: "evgeny",
    name: "Евгений",
    accent: "#f2c300",
    seat: [4.4, -0.95], // стул перед столом Александра
    seatRot: 0.15, // смотрит на Рубена
    walkPath: [
      [4.4, 2.3],
      [3.95, 1.7],
      [3.95, -0.4],
      [4.35, -1.05],
    ],
    delay: 5.4,
    scale: 0.95, // рост как у Святослава
    build: 0.95, // стройный
    skin: 0xf2c09a,
    hair: 0x4a3524,
    shirt: 0xf2f4f8, // белая рубашка
    pants: 0x6b7280, // серые штаны
    shoes: 0x14161c, // чёрные туфли
    hairStyle: "flat", // причёска как у Святослава
    nodding: true, // внимательно кивает Рубену
    lapLaptop: true,
    stillArms: true, // руки статичны на ноутбуке
    noMorning: true,
  },
  {
    id: "zhukov",
    name: "Жуков",
    accent: "#8a90a3",
    seat: [-2.05, 1.95], // возле бухты кабеля под вывеской IT TEAM
    seatRot: 1.83, // смотрит на Святослава и рассказывает
    walkPath: [
      [4.4, 2.3],
      [4.2, 1.8],
      [0.8, 1.8],
      [-2.05, 1.95],
    ],
    delay: 6.2,
    scale: 0.97,
    build: 0.98,
    skin: 0xe8b48a,
    hair: 0x2e2a26, // волос немного
    shirt: 0x14161c, // форма охранника
    pants: 0x14161c,
    shoes: 0x14161c,
    hairStyle: "buzz",
    beard: true, // борода как у Владимира
    standing: true,
    talking: true, // рассказывает Святославу, жестикулируя
    noMorning: true,
  },
];

export type WorkMode = "work" | "meeting" | "urgent" | "morning";

/* кружки кофе Владимира в режиме «утро» */
const VLAD_MUGS: [number, number, number][] = [
  [-2.0, 0.77, -1.7],
  [-1.5, 0.77, -2.0],
  [-0.9, 0.77, -1.65],
  [-0.35, 0.77, -2.05],
  [0.25, 0.77, -1.7],
  [0.85, 0.77, -2.15],
  [1.7, 0.77, -1.9],
  [-1.7, 0.77, -0.85],
  [-0.6, 0.77, -0.8],
  [0.7, 0.77, -0.85],
];

/* включает тени на всех мешах сцены (кроме emissive-экранов и огня) */
function EnableShadows() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if ((m as unknown as { isMesh?: boolean }).isMesh) {
        const mat = m.material as THREE.Material & { isMeshBasicMaterial?: boolean };
        m.castShadow = !mat?.isMeshBasicMaterial;
        m.receiveShadow = true;
      }
    });
  }, [scene]);
  return null;
}

interface SceneProps {
  mode: CameraMode | "focus";
  focus: CameraFocus | null;
  focusNonce: number;
  selected: string | null;
  workMode: WorkMode;
  onSelectCharacter: (id: string) => void;
  onObjectClick: (key: string) => void;
}

export function Scene({ mode, focus, focusNonce, selected, workMode, onSelectCharacter, onObjectClick }: SceneProps) {
  return (
    <Canvas
      shadows="soft"
      camera={{ position: [3.7, 3, 2.3], fov: 55 }}
      dpr={[1, 1.75]}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.25;
      }}
    >
      <color attach="background" args={["#1a1f3d"]} />
      {/* лёгкая дымка для глубины комнаты */}
      <fogExp2 attach="fog" args={["#171b38", 0.022]} />
      <Lights />
      <EnableShadows />
      <Room onObjectClick={onObjectClick} />

      {/* ============ ВИТАЛИЙ (северо-запад) ============ */}
      <Desk position={[-2.7, 0, -2.0]} width={2.6} rotY={Math.PI / 2} />
      <Chair position={[-3.6, 0, -2.4]} color={0x2b4038} rotY={Math.PI / 2} />
      <Monitor
        position={[-2.45, 0.77, -2.4]}
        tint="#9dff57"
        size={1.65}
        rotY={Math.PI / 2}
        onClick={() => onObjectClick("mon-vitaly")}
      />
      <Laptop position={[-2.85, 0.77, -3.05]} tint="#35e0ff" rotY={-Math.PI / 2} onClick={() => onObjectClick("lap-vitaly")} />
      <KeyboardMouse position={[-3.08, 0.77, -2.4]} rgb="#9dff57" rotY={Math.PI / 2} flipMouse />
      <OfficePrinter position={[-2.6, 0.77, -0.95]} rotY={-Math.PI / 2} />
      <Mug position={[-2.45, 0.77, -1.3]} color={0x9dff57} />
      {/* беспорядок: провода, инструменты и фигурки 3D-печати */}
      <DeskClutter position={[-2.45, 0.77, -1.85]} />
      {/* револьвер, напечатанный на 3D-принтере */}
      <PrintedRevolver position={[-2.45, 0.77, -2.82]} rotY={-0.5} onClick={() => onObjectClick("revolver")} />
      <PCCase position={[-2.7, 0, -2.9]} rgb="#9dff57" onClick={() => onObjectClick("pc-vitaly")} />
      {/* шкаф Виталия: низ с дверцами, верх — открытые полки под завязку */}
      <PackedCabinet position={[-5.05, 0, -0.6]} rotY={Math.PI / 2} />
      <SecurityCams position={[-5.05, 1.94, -0.6]} rotY={Math.PI / 2} />
      {/* тумба с 3D-принтером — с северной стороны шкафа */}
      <DrawerUnit position={[-4.55, 0, -1.4]} rotY={Math.PI / 2} />
      <Printer3D position={[-4.55, 0.6, -1.4]} rotY={Math.PI / 2} onClick={() => onObjectClick("printer3d")} />
      {/* кондиционер — с южной стороны шкафа */}
      <AirCon position={[-5.42, 2.0, 0.5]} rotY={Math.PI / 2} />
      {/* пирамида ПК между шкафом Виталия и угловым шкафом */}
      <PCStack position={[-5.2, 0, 0.0]} />
      {/* стеллаж с филаментом в углу возле Виталика */}
      <WallShelf position={[-4.0, 1.5, -3.52]} width={1.4} />
      <Boxes position={[-4.5, 0, -3.3]} />

      {/* ============ ВЛАДИМИР (центр севера, длинный стол + верстак перед ним) ============ */}
      <Desk position={[-0.2, 0, -1.85]} width={4.15} />
      <Chair position={[-0.2, 0, -2.65]} color={0x3a2b4d} />
      <Monitor position={[0.45, 0.77, -1.7]} tint="#ff5cae" rotY={0.6} onClick={() => onObjectClick("mon-vlad")} />
      <Laptop position={[-0.2, 0.77, -1.75]} tint="#9dff57" rotY={Math.PI} onClick={() => onObjectClick("lap-vlad")} />
      <Phone position={[-0.85, 0.77, -1.75]} rotY={2.52} />
      <Phone position={[-0.68, 0.77, -1.55]} rotY={2.71} variant={1} />
      <KeyboardMouse position={[-0.15, 0.77, -2.2]} rgb="#ff5cae" flipMouse />
      {/* большая кружка «БОСС» вместо розовой */}
      <BossMug position={[0.6, 0.77, -2.05]} rotY={-2.21} onClick={() => onObjectClick("bossmug")} />
      {/* ключи доступа ПК в органайзере по левую руку */}
      <KeyOrganizer position={[0.95, 0.77, -1.95]} rotY={-0.3} />
      {/* фигурка: четыре кольца Audi */}
      <AudiRings position={[1.45, 0.77, -1.7]} onClick={() => onObjectClick("audi")} />
      {/* второй стол вплотную: разобранный ПК, серверы-лезвия, инструменты */}
      <Desk position={[-0.2, 0, -1.0]} width={4.15} />
      <RepairBench position={[-0.2, 0.77, -1.0]} />
      {/* утро: десять кружек кофе по всему столу Владимира */}
      {workMode === "morning" &&
        VLAD_MUGS.map(([x, y, z], i) => <Mug key={i} position={[x, y, z]} color={i % 3 === 0 ? 0xf8fafc : i % 3 === 1 ? 0xd13a63 : 0xffc857} />)}

      {/* тумба с папками между Владимиром и Александром, у стены, проходы равные */}
      <DrawerUnit position={[2.59, 0, -3.3]} />
      <DocumentFolders position={[2.59, 0.58, -3.3]} />

      {/* ============ АЛЕКСАНДР (восток, придвинут к стене) ============ */}
      <Desk position={[4.2, 0, -1.75]} width={1.8} />
      <Chair position={[4.4, 0, -2.6]} />
      <Monitor position={[3.95, 0.77, -1.63]} tint="#35e0ff" rotY={-0.43} onClick={() => onObjectClick("mon-alex")} />
      <Monitor position={[4.85, 0.77, -1.63]} tint="#35e0ff" rotY={0.43} onClick={() => onObjectClick("mon-alex")} />
      <KeyboardMouse position={[4.4, 0.77, -2.15]} rgb="#ffc857" flipMouse />
      {/* два неттопа по левую руку, сверху — компактный вентилятор */}
      <Nettop position={[4.95, 0.77, -1.95]} rotY={Math.PI} />
      <Nettop position={[4.95, 0.825, -1.95]} rotY={Math.PI} />
      <DeskFan position={[4.95, 0.875, -1.95]} rotY={-2.42} size={0.55} onClick={() => onObjectClick("fan")} />
      {/* энергетик по правую руку */}
      <EnergyCan position={[3.55, 0.77, -2.0]} />
      {/* пустой стул вплотную перед столом, смотрит на дверь */}
      <Chair position={[4.4, 0, -0.95]} color={0x2b3050} />
      {/* кофе-поинт с кулером вдоль стены до стола Александра */}
      <CoffeePoint position={[5.2, 0, 0.15]} rotY={-Math.PI / 2} onClick={() => onObjectClick("coffee")} />
      {/* в конце кофе-поинта, прямо перед столом: тумба + принтер побольше */}
      <DrawerUnit position={[5.2, 0, -0.7]} rotY={-Math.PI / 2} />
      <group position={[5.2, 0.6, -0.7]} scale={1.35}>
        <OfficePrinter position={[0, 0, 0]} rotY={-Math.PI / 2} />
      </group>

      {/* ============ СВЯТОСЛАВ (центр юга, Г-образный стол) ============ */}
      <Desk position={[0, 0, 0.85]} width={1.9} />
      {/* Г-образное продолжение к южной стене */}
      <Desk position={[1.3, 0, 1.7]} width={1.8} rotY={Math.PI / 2} />
      <MiniRepair position={[1.3, 0.77, 1.7]} rotY={Math.PI / 2} />
      <Chair position={[0, 0, 1.4]} color={0x26405c} rotY={Math.PI} />
      <Monitor position={[-0.3, 0.77, 0.72]} tint="#35e0ff" rotY={-2.73} onClick={() => onObjectClick("mon-svyat")} />
      <Monitor position={[0.5, 0.77, 0.72]} tint="#35e0ff" rotY={2.51} onClick={() => onObjectClick("mon-svyat")} />
      <KeyboardMouse position={[0, 0.77, 1.0]} rgb="#35e0ff" rotY={Math.PI} flipMouse />
      <PCCase position={[-0.8, 0.77, 1.0]} rgb="#35e0ff" onClick={() => onObjectClick("pc-svyat")} />
      <Mug position={[0.8, 0.77, 1.15]} color={0x35e0ff} />
      {/* ТВ за Святославом, подвинут ближе к вывеске IT TEAM */}
      <group position={[0.5, 1.9, 2.56]} scale={1.6}>
        <TV position={[0, 0, 0]} rotY={Math.PI} onClick={() => onObjectClick("tv")} />
      </group>

      {/* шкаф вплотную слева от двери; сверху запчасти ПК */}
      <Cabinet position={[3.225, 0, 2.35]} rotY={Math.PI} />
      <PCPartsPile position={[3.225, 1.94, 2.35]} />
      {/* шкаф вдоль западной стены (где кондиционер), прямо возле вывески */}
      <Cabinet position={[-5.05, 0, 1.6]} rotY={Math.PI / 2} />
      <PCPartsPile position={[-5.05, 1.94, 1.6]} rotY={Math.PI / 2} />

      {/* за Виталиком: мини-холодильник на тумбочке из 2 ящиков */}
      <DrawerUnit position={[-5.05, 0, -2.6]} rotY={Math.PI / 2} />
      <MiniFridge position={[-5.05, 0.6, -2.6]} rotY={Math.PI / 2} />

      {/* под вывеской IT TEAM: коробка с проводами, картриджи стопкой, бухта кабеля */}
      <StorageClutter position={[-3.2, 0, 2.25]} />
      {/* декор */}
      <Plant position={[-5.15, 0, -2.6]} s={1.2} />

      {/* персонажи */}
      {CHARACTERS.map((c) => (
        <PixelCharacter
          key={c.id}
          id={c.id}
          name={c.name}
          accent={c.accent}
          seat={c.seat}
          seatRot={c.seatRot}
          walkPath={c.walkPath}
          delay={c.delay}
          scale={c.scale}
          build={c.build}
          skin={c.skin}
          hair={c.hair}
          shirt={c.shirt}
          pants={c.pants}
          shoes={c.shoes}
          hairStyle={c.hairStyle}
          glasses={c.glasses}
          beard={c.beard}
          bigBeard={c.bigBeard}
          tie={c.tie}
          longSleeve={c.longSleeve}
          headset={c.headset}
          standing={c.standing}
          holdMug={c.holdMug}
          holdFolder={c.holdFolder}
          talking={c.talking}
          nodding={c.nodding}
          lapLaptop={c.lapLaptop}
          lapLaptopClick={c.id === "evgeny" ? () => onObjectClick("evg-laptop") : undefined}
          peek={c.peek}
          noMorning={c.noMorning}
          frozen={c.frozen}
          mode={workMode}
          selected={selected === c.id}
          onSelect={onSelectCharacter}
        />
      ))}

      <CameraController mode={mode} focus={focus} focusNonce={focusNonce} />

      {/* постобработка: свечение неона и виньетка */}
      <EffectComposer multisampling={2}>
        <Bloom intensity={0.6} luminanceThreshold={0.85} luminanceSmoothing={0.25} mipmapBlur radius={0.72} />
        <Vignette offset={0.22} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}
