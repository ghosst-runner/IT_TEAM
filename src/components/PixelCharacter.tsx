import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useFolderLabel, useZee } from "./screens";
import { Laptop } from "./Furniture";

export type HairStyle = "short" | "buzz" | "side" | "messy" | "flat";

export interface PixelCharacterProps {
  id: string;
  name: string;
  accent: string;
  /** точка, где стоит стул (x, z) */
  seat: [number, number];
  /** куда смотрит, когда сел (рад) */
  seatRot?: number;
  /** маршрут от двери: массив точек (x, z), последняя = стул */
  walkPath: [number, number][];
  delay: number;
  scale?: number;
  build?: number;
  skin?: number;
  hair?: number;
  shirt?: number;
  pants?: number;
  shoes?: number;
  hairStyle?: HairStyle;
  glasses?: boolean;
  beard?: boolean;
  bigBeard?: boolean;
  tie?: boolean;
  longSleeve?: boolean;
  headset?: boolean;
  /** не садится: стоит и общается */
  standing?: boolean;
  /** держит кружку в левой руке */
  holdMug?: boolean;
  /** держит папку в опущенной руке */
  holdFolder?: boolean;
  /** жестикулирует и говорит */
  talking?: boolean;
  /** режим сцены: работа / переговоры / срочная задача / утро */
  mode?: "work" | "meeting" | "urgent" | "morning";
  /** кивает собеседнику */
  nodding?: boolean;
  /** ноутбук на коленях (кликабельный) */
  lapLaptop?: boolean;
  lapLaptopClick?: () => void;
  /** руки статичны (не печатают и не жестикулируют) */
  stillArms?: boolean;
  /** полностью неподвижен: ни дыхания, ни покачиваний */
  frozen?: boolean;
  /** выглядывает из-за двери: рука держит дверь */
  peek?: boolean;
  /** режим «утро» на него не действует */
  noMorning?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const STAND_HIP = 0.88;
const SIT_HIP = 0.56;
const WALK_SPEED = 2.0;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (k: number) => k * k * (3 - 2 * k);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function PixelCharacter({
  id,
  name,
  accent,
  seat,
  seatRot = 0,
  walkPath,
  delay,
  scale = 1,
  build = 1,
  skin = 0xf2c09a,
  hair = 0x2b2118,
  shirt = 0x22283f,
  pants = 0x1b1e2c,
  shoes = 0x11131c,
  hairStyle = "short",
  glasses = false,
  beard = false,
  bigBeard = false,
  tie = false,
  longSleeve = false,
  headset = false,
  standing = false,
  holdMug = false,
  holdFolder = false,
  talking = false,
  mode = "work",
  nodding = false,
  lapLaptop = false,
  lapLaptopClick,
  stillArms = false,
  frozen = false,
  peek = false,
  noMorning = false,
  selected = false,
  onSelect,
}: PixelCharacterProps) {
  const mouth = useRef<THREE.Mesh>(null);
  const fire = useRef<THREE.Group>(null);
  const zzz = useRef<THREE.Group>(null);
  const folderLabel = useFolderLabel();
  const zeeTex = useZee();
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const shL = useRef<THREE.Group>(null);
  const shR = useRef<THREE.Group>(null);
  const elL = useRef<THREE.Group>(null);
  const elR = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const knL = useRef<THREE.Group>(null);
  const knR = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const tag = useRef<THREE.Sprite>(null);
  const [hover, setHover] = useState(false);

  const seed = useMemo(() => (id.charCodeAt(0) % 7) * 1.37 + id.length * 0.61, [id]);

  /* ---------- маршрут ---------- */
  const path = useMemo(() => {
    const pts = walkPath.map(([x, z]) => new THREE.Vector2(x, z));
    const segs: number[] = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const d = pts[i].distanceTo(pts[i + 1]);
      segs.push(d);
      total += d;
    }
    return { pts, segs, total };
  }, [walkPath]);

  /* ---------- табличка с именем ---------- */
  const tagTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 72;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 256, 72);
    ctx.fillStyle = "rgba(10,14,32,0.9)";
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    const r = 14;
    ctx.beginPath();
    ctx.roundRect(6, 8, 244, 56, r);
    ctx.fill();
    ctx.stroke();
    ctx.font = "bold 30px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = accent;
    ctx.fillText(name.toUpperCase(), 128, 46);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [name, accent]);

  const tmp = useMemo(() => new THREE.Vector2(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const tl = t - delay;

    /* --- фаза: вход → садится → работает навсегда --- */
    const walkTime = path.total / WALK_SPEED;
    const sitK = standing ? 0 : smooth(clamp01((tl - walkTime) / 0.9)); // 0 → стоит/идёт, 1 → сидит

    /* --- позиция на маршруте --- */
    let px = path.pts[0].x;
    let pz = path.pts[0].y;
    let facing = 0;
    let walkK = 0; // 1 = идёт, 0 = сидит/стоит
    let dist = 0;
    if (tl > 0) dist = tl * WALK_SPEED;
    if (dist >= path.total) {
      // дошли до стула — плавно подъезжаем ближе, пока садимся
      const last = path.pts[path.pts.length - 1];
      px = lerp(last.x, seat[0], sitK);
      pz = lerp(last.y, seat[1], sitK);
      facing = 0;
    } else {
      let acc = dist;
      for (let i = 0; i < path.segs.length; i++) {
        if (acc <= path.segs[i] || i === path.segs.length - 1) {
          const k = clamp01(acc / path.segs[i]);
          tmp.lerpVectors(path.pts[i], path.pts[i + 1], k);
          px = tmp.x;
          pz = tmp.y;
          facing = Math.atan2(
            path.pts[i + 1].x - path.pts[i].x,
            path.pts[i + 1].y - path.pts[i].y
          );
          break;
        }
        acc -= path.segs[i];
      }
      walkK = 1;
    }

    const arrived = tl >= walkTime;

    if (root.current) {
      root.current.position.set(px, 0, pz);
      // плавно доворачиваемся к своему месту, когда сели (с учётом перехода через ±π)
      const targetRot = arrived ? seatRot : facing;
      const cur = root.current.rotation.y;
      let d = (targetRot - cur) % (Math.PI * 2);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      root.current.rotation.y = cur + d * 0.15;
    }

    /* режимы: скорость и амплитуда печати */
    const tSpeed = mode === "urgent" ? 27 : 9.1;
    const tAmp = mode === "meeting" ? 0 : mode === "urgent" ? 0.062 : 0.035;

    const p = tl * 8.5; // фаза шага
    const stride = tl > 0 && !arrived ? 1 : 0; // шагают только в пути
    const swing = Math.sin(p) * stride;
    const swing2 = Math.sin(p + Math.PI) * stride;

    /* --- высота таза / покачивание --- */
    const bobWalk = Math.abs(Math.sin(p)) * 0.05 * walkK * (1 - sitK);
    const breathe = Math.sin(t * 1.7 + seed) * 0.01 * sitK;
    if (body.current)
      body.current.position.y = lerp(STAND_HIP, SIT_HIP, sitK) + (stillArms ? 0 : bobWalk + breathe);

    /* --- ноги --- */
    const thighWalkL = swing * 0.55;
    const thighWalkR = swing2 * 0.55;
    const shinWalkL = Math.max(0, Math.sin(p - 1.1)) * 0.85 * stride;
    const shinWalkR = Math.max(0, Math.sin(p - 1.1 + Math.PI)) * 0.85 * stride;
    const tap = Math.max(0, Math.sin(t * 3.4 + seed)) * 0.1 * sitK;
    if (hipL.current) hipL.current.rotation.x = lerp(thighWalkL, -1.48, sitK);
    if (hipR.current) hipR.current.rotation.x = lerp(thighWalkR, -1.48, sitK);
    if (knL.current) knL.current.rotation.x = lerp(shinWalkL, 1.42, sitK);
    if (knR.current) knR.current.rotation.x = lerp(shinWalkR + tap * 0.5, 1.42 + tap, sitK);

    /* --- руки: качаются при ходьбе, печатают когда сидит --- */
    const typeL = (Math.sin(t * tSpeed + seed) + Math.sin(t * tSpeed * 1.5 + seed * 2)) * tAmp;
    const typeR = (Math.sin(t * tSpeed * 1.13 + seed * 1.7 + 2) + Math.sin(t * tSpeed * 1.33 + seed)) * tAmp;
    if (!stillArms) {
      if (shL.current) {
        shL.current.rotation.x = lerp(swing2 * 0.5, -0.62, sitK);
        shL.current.rotation.z = lerp(0, -0.14, sitK);
      }
      if (shR.current) {
        shR.current.rotation.x = lerp(swing * 0.5, -0.62, sitK);
        shR.current.rotation.z = lerp(0, 0.14, sitK);
      }
      if (elL.current) elL.current.rotation.x = lerp(-0.35, -0.95 + typeL, sitK);
      if (elR.current) elR.current.rotation.x = lerp(-0.35, -0.95 + typeR, sitK);
    }

    /* --- голова: смотрит по сторонам, дышит, моргает --- */
    if (head.current) {
      const still = frozen || stillArms;
      const lookY = still
        ? 0
        : sitK * (Math.sin(t * 0.31 + seed) * 0.26 + Math.sin(t * 0.117 + seed * 3) * 0.2) +
          (1 - sitK) * Math.sin(p) * 0.08 +
          (mode === "meeting" ? Math.sin(t * 0.8 + seed) * 0.42 : 0);
      const lookX = still ? 0 : sitK * (0.035 + Math.sin(t * 0.47 + seed * 2) * 0.04);
      head.current.rotation.y = lookY;
      head.current.rotation.x = lookX;
      head.current.rotation.z = still ? 0 : sitK * Math.sin(t * 0.23 + seed) * 0.05;
    }
    if (eyes.current) {
      const blink = (t + seed * 3.1) % 3.3 < 0.12;
      eyes.current.scale.y = blink ? 0.15 : 1;
    }
    if (torso.current && !frozen && !stillArms) {
      const b = 1 + Math.sin(t * 1.6 + seed) * (sitK ? 0.022 : 0.014);
      torso.current.scale.set(1, b, 1);
      torso.current.rotation.y = sitK * Math.sin(t * 0.19 + seed) * 0.06;
      /* сброс наклонов каждый кадр: «утро» и «срочная задача» пишут свои
         rotation.x / rotation.z позже, а в «работе» торс всегда прямой */
      torso.current.rotation.x = 0;
      torso.current.rotation.z = 0;
    }

    /* --- стоя: держит кружку и жестикулирует, пока рассказывает --- */
    if (standing && shL.current && shR.current && elL.current && elR.current) {
      if (peek) {
        /* руки по швам, абсолютно статично */
        shR.current.rotation.set(-0.04, 0, 0.07);
        elR.current.rotation.x = -0.06;
        shL.current.rotation.set(-0.04, 0, -0.07);
        elL.current.rotation.x = -0.06;
      } else if (holdFolder) {
        // левая рука вдоль туловища, держит папку
        shL.current.rotation.set(-0.1 + Math.sin(t * 1.1 + seed) * 0.02, 0, -0.14);
        elL.current.rotation.x = -0.45;
      } else {
        // рассказчик без props: обе руки жестикулируют
        shL.current.rotation.set(-0.9 + Math.sin(t * 2.0 + seed * 3) * 0.28, 0, -0.3);
        elL.current.rotation.x = -1.1 + Math.sin(t * 2.3 + seed) * 0.35;
      }
      shR.current.rotation.set(-0.5 + Math.sin(t * 2.6 + seed) * 0.32, 0, 0.36 + Math.sin(t * 2.6 + 0.7) * 0.14);
      elR.current.rotation.x = -0.75 + Math.sin(t * 2.6 + 1.3) * 0.4;
    }
    if (talking && head.current && arrived) {
      head.current.rotation.x += Math.sin(t * 6.5 + seed) * 0.06;
      head.current.rotation.z += Math.sin(t * 3.1 + seed) * 0.05;
      head.current.rotation.y += Math.sin(t * 1.1 + seed) * 0.12;
    }
    if (mouth.current) {
      mouth.current.scale.y = talking && arrived ? 1 + Math.abs(Math.sin(t * 8.2)) * 1.8 : 1;
    }

    /* переговоры: руки жестикулируют, печать остановлена */
    if (
      mode === "meeting" &&
      !standing &&
      !frozen &&
      !stillArms &&
      arrived &&
      shL.current &&
      shR.current &&
      elL.current &&
      elR.current
    ) {
      shL.current.rotation.set(-0.95 + Math.sin(t * 2.2 + seed) * 0.35, 0, -0.3);
      elL.current.rotation.x = -0.9 + Math.sin(t * 2.2 + 1 + seed) * 0.4;
      shR.current.rotation.set(-0.8 + Math.sin(t * 2.6 + seed * 2) * 0.4, 0, 0.32);
      elR.current.rotation.x = -1.0 + Math.sin(t * 2.6 + 2 + seed) * 0.45;
    }
    /* срочная задача: лёгкая тряска корпуса */
    if (mode === "urgent" && !standing && !frozen && torso.current) {
      torso.current.rotation.z = Math.sin(t * 21 + seed) * 0.02;
    }
    /* кивание собеседнику */
    if (nodding && !frozen && arrived && head.current) {
      head.current.rotation.x += Math.sin(t * 2.6 + seed) * 0.1;
    }

    /* статичные руки: лежат на коленях/ноутбуке, никакого движения даже при ходьбе */
    if (stillArms && !standing && shL.current && shR.current && elL.current && elR.current) {
      shL.current.rotation.set(-0.55, 0, -0.22);
      shR.current.rotation.set(-0.55, 0, 0.22);
      elL.current.rotation.x = -0.75;
      elR.current.rotation.x = -0.75;
    }

    /* утро: голова еле оторвана от стола, борьба со сном, ZZZ */
    if (mode === "morning" && !noMorning && !standing && !frozen && arrived) {
      const cycle = (t + seed * 13) % 20;
      const sleeping = cycle < 10;
      if (torso.current) torso.current.rotation.x = 0.5 + Math.sin(t * 0.7 + seed) * 0.03;
      if (head.current) {
        const lift = sleeping ? 0 : Math.pow(Math.max(0, Math.sin(t * 0.5 + seed * 2)), 3) * 0.42;
        head.current.rotation.x = 0.6 - lift + Math.sin(t * 1.1 + seed) * 0.03;
        head.current.rotation.z = Math.sin(t * 0.6 + seed) * 0.07;
      }
      if (shL.current && shR.current && elL.current && elR.current) {
        shL.current.rotation.set(-1.25, 0, -0.15);
        shR.current.rotation.set(-1.25, 0, 0.15);
        elL.current.rotation.x = -0.55;
        elR.current.rotation.x = -0.55;
      }
      if (zzz.current) {
        zzz.current.visible = sleeping;
        if (sleeping) {
          zzz.current.children.forEach((c, i) => {
            const sp = c as THREE.Sprite;
            const k = (t * 0.25 + i * 0.33) % 1;
            sp.position.y = i * 0.1 + k * 0.18;
            (sp.material as THREE.SpriteMaterial).opacity = 1 - k;
          });
        }
      }
    } else if (zzz.current) {
      zzz.current.visible = false;
    }

    /* пламя над головой в режиме срочной задачи */
    if (fire.current) {
      fire.current.children.forEach((g, i) => {
        const s = 1 + Math.sin(t * 17 + i * 2.1) * 0.22;
        g.scale.set(s, 1 + Math.sin(t * 21 + i) * 0.3, s);
        g.rotation.y = t * 4 + i;
      });
    }

    /* --- кольцо выделения и табличка --- */
    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial;
      ring.current.visible = selected;
      if (selected) {
        const s = 1 + Math.sin(t * 4) * 0.06;
        ring.current.scale.set(s, s, s);
        m.opacity = 0.65 + Math.sin(t * 4) * 0.25;
      }
    }
    if (tag.current) {
      tag.current.visible = selected || hover;
      if (tag.current.visible) {
        tag.current.position.y = 2.05 + Math.sin(t * 2.2) * 0.03;
      }
    }
  });

  const b = build;
  const sleeve = longSleeve ? shirt : skin;

  return (
    <group
      ref={root}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* невидимый хитбокс для клика */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.9, 1.8, 0.9]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* кольцо выделения */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} visible={false}>
        <ringGeometry args={[0.42, 0.52, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* табличка с именем */}
      <sprite ref={tag} position={[0, 2.05, 0]} scale={[1.5, 0.42, 1]} visible={false}>
        <spriteMaterial map={tagTexture} transparent depthTest={false} />
      </sprite>

      <group ref={body}>
        {/* таз */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.34 * b, 0.22, 0.24]} />
          <meshStandardMaterial color={pants} roughness={0.8} />
        </mesh>
        {/* ремень */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.35 * b, 0.05, 0.25]} />
          <meshStandardMaterial color={0x14161f} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.1, 0.13]}>
          <boxGeometry args={[0.06, 0.04, 0.02]} />
          <meshStandardMaterial color={0xffc857} metalness={0.6} roughness={0.3} />
        </mesh>

        {/* торс */}
        <group ref={torso} position={[0, 0.12, 0]}>
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.4 * b, 0.46, 0.26]} />
            <meshStandardMaterial color={shirt} roughness={0.75} />
          </mesh>
          {/* воротник */}
          <mesh position={[0, 0.46, 0.02]}>
            <boxGeometry args={[0.24 * b, 0.06, 0.24]} />
            <meshStandardMaterial color={tie ? 0xe8ecf5 : shirt} roughness={0.7} />
          </mesh>
          {tie && (
            <>
              <mesh position={[0, 0.42, 0.14]}>
                <boxGeometry args={[0.06, 0.06, 0.03]} />
                <meshStandardMaterial color={0xb3264a} roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.26, 0.145]}>
                <boxGeometry args={[0.07, 0.26, 0.02]} />
                <meshStandardMaterial color={0xd13a63} roughness={0.6} />
              </mesh>
            </>
          )}
          {/* карман поло / деталь футболки */}
          {!tie && (
            <mesh position={[0.1 * b, 0.3, 0.135]}>
              <boxGeometry args={[0.09, 0.08, 0.015]} />
              <meshStandardMaterial color={0x000000} transparent opacity={0.18} />
            </mesh>
          )}

          {/* голова */}
          <group ref={head} position={[0, 0.52, 0]}>
            {/* шея */}
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.14, 0.1, 0.14]} />
              <meshStandardMaterial color={skin} roughness={0.8} />
            </mesh>
            {/* череп */}
            <mesh position={[0, 0.24, 0]}>
              <boxGeometry args={[0.34, 0.34, 0.34]} />
              <meshStandardMaterial color={skin} roughness={0.8} />
            </mesh>
            {/* уши */}
            <mesh position={[-0.18, 0.24, 0]}>
              <boxGeometry args={[0.03, 0.09, 0.08]} />
              <meshStandardMaterial color={skin} roughness={0.85} />
            </mesh>
            <mesh position={[0.18, 0.24, 0]}>
              <boxGeometry args={[0.03, 0.09, 0.08]} />
              <meshStandardMaterial color={skin} roughness={0.85} />
            </mesh>
            {/* нос */}
            <mesh position={[0, 0.21, 0.18]}>
              <boxGeometry args={[0.05, 0.07, 0.04]} />
              <meshStandardMaterial color={skin} roughness={0.9} />
            </mesh>
            {/* глаза */}
            <group ref={eyes} position={[0, 0.28, 0.17]}>
              <mesh position={[-0.08, 0, 0]}>
                <boxGeometry args={[0.075, 0.06, 0.02]} />
                <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
              </mesh>
              <mesh position={[0.08, 0, 0]}>
                <boxGeometry args={[0.075, 0.06, 0.02]} />
                <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
              </mesh>
              <mesh position={[-0.075, -0.005, 0.015]}>
                <boxGeometry args={[0.032, 0.035, 0.02]} />
                <meshStandardMaterial color={0x16202e} roughness={0.3} />
              </mesh>
              <mesh position={[0.085, -0.005, 0.015]}>
                <boxGeometry args={[0.032, 0.035, 0.02]} />
                <meshStandardMaterial color={0x16202e} roughness={0.3} />
              </mesh>
            </group>
            {/* брови */}
            <mesh position={[-0.08, 0.345, 0.175]}>
              <boxGeometry args={[0.09, 0.025, 0.02]} />
              <meshStandardMaterial color={hair} roughness={0.9} />
            </mesh>
            <mesh position={[0.08, 0.345, 0.175]}>
              <boxGeometry args={[0.09, 0.025, 0.02]} />
              <meshStandardMaterial color={hair} roughness={0.9} />
            </mesh>
            {/* рот */}
            <mesh ref={mouth} position={[0, 0.115, 0.175]}>
              <boxGeometry args={[0.09, 0.022, 0.02]} />
              <meshStandardMaterial color={0x8a4a44} roughness={0.9} />
            </mesh>

            {/* волосы */}
            {hairStyle === "buzz" && (
              <mesh position={[0, 0.42, 0]}>
                <boxGeometry args={[0.35, 0.06, 0.35]} />
                <meshStandardMaterial color={hair} roughness={0.95} />
              </mesh>
            )}
            {hairStyle === "short" && (
              <>
                <mesh position={[0, 0.42, -0.01]}>
                  <boxGeometry args={[0.36, 0.12, 0.36]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0, 0.33, -0.17]}>
                  <boxGeometry args={[0.36, 0.2, 0.05]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0, 0.38, 0.16]}>
                  <boxGeometry args={[0.34, 0.06, 0.05]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
              </>
            )}
            {hairStyle === "side" && (
              <>
                <mesh position={[0.02, 0.43, 0]}>
                  <boxGeometry args={[0.36, 0.1, 0.36]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[-0.06, 0.37, 0.15]}>
                  <boxGeometry args={[0.24, 0.07, 0.07]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0, 0.3, -0.17]}>
                  <boxGeometry args={[0.36, 0.24, 0.05]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
              </>
            )}
            {hairStyle === "flat" && (
              <>
                {/* ровная стрижка: элементы явно выше/перед кожей, без пересечений */}
                <mesh position={[0, 0.445, -0.01]}>
                  <boxGeometry args={[0.37, 0.09, 0.37]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0, 0.375, 0.195]}>
                  <boxGeometry args={[0.35, 0.08, 0.05]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0, 0.35, -0.2]}>
                  <boxGeometry args={[0.37, 0.17, 0.05]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[-0.19, 0.38, -0.02]}>
                  <boxGeometry args={[0.04, 0.11, 0.3]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0.19, 0.38, -0.02]}>
                  <boxGeometry args={[0.04, 0.11, 0.3]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
              </>
            )}
            {hairStyle === "messy" && (
              <>
                <mesh position={[0, 0.43, 0]}>
                  <boxGeometry args={[0.37, 0.1, 0.37]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[-0.12, 0.5, 0.06]}>
                  <boxGeometry args={[0.08, 0.08, 0.08]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0.1, 0.51, -0.08]}>
                  <boxGeometry args={[0.09, 0.07, 0.09]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0.02, 0.38, 0.17]}>
                  <boxGeometry args={[0.3, 0.08, 0.05]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
              </>
            )}

            {/* очки */}
            {glasses && (
              <group position={[0, 0.28, 0.185]}>
                <mesh position={[-0.08, 0, 0]}>
                  <boxGeometry args={[0.11, 0.09, 0.02]} />
                  <meshStandardMaterial color={0x101318} roughness={0.35} />
                </mesh>
                <mesh position={[0.08, 0, 0]}>
                  <boxGeometry args={[0.11, 0.09, 0.02]} />
                  <meshStandardMaterial color={0x101318} roughness={0.35} />
                </mesh>
                <mesh position={[-0.08, 0, 0.012]}>
                  <boxGeometry args={[0.085, 0.065, 0.012]} />
                  <meshStandardMaterial
                    color={0x9adfff}
                    emissive={0x35e0ff}
                    emissiveIntensity={0.35}
                    transparent
                    opacity={0.55}
                  />
                </mesh>
                <mesh position={[0.08, 0, 0.012]}>
                  <boxGeometry args={[0.085, 0.065, 0.012]} />
                  <meshStandardMaterial
                    color={0x9adfff}
                    emissive={0x35e0ff}
                    emissiveIntensity={0.35}
                    transparent
                    opacity={0.55}
                  />
                </mesh>
                <mesh position={[0, 0.01, 0]}>
                  <boxGeometry args={[0.05, 0.02, 0.02]} />
                  <meshStandardMaterial color={0x101318} />
                </mesh>
                <mesh position={[-0.145, 0, -0.08]}>
                  <boxGeometry args={[0.02, 0.02, 0.16]} />
                  <meshStandardMaterial color={0x101318} />
                </mesh>
                <mesh position={[0.145, 0, -0.08]}>
                  <boxGeometry args={[0.02, 0.02, 0.16]} />
                  <meshStandardMaterial color={0x101318} />
                </mesh>
              </group>
            )}

            {/* борода: щёки, подбородок, челюсть, усы, бакенбарды */}
            {beard && (
              <group scale={bigBeard ? 1.16 : 1}>
                <mesh position={[0, 0.07, 0.15]}>
                  <boxGeometry args={[0.26, 0.17, 0.13]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                {/* щёки только спереди, у ушей чисто */}
                <mesh position={[-0.16, 0.13, 0.1]}>
                  <boxGeometry args={[0.05, 0.18, 0.12]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0.16, 0.13, 0.1]}>
                  <boxGeometry args={[0.05, 0.18, 0.12]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0, 0.02, 0.02]}>
                  <boxGeometry args={[0.37, 0.09, 0.32]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
                <mesh position={[0, 0.15, 0.185]}>
                  <boxGeometry args={[0.17, 0.05, 0.05]} />
                  <meshStandardMaterial color={hair} roughness={0.95} />
                </mesh>
              </group>
            )}

            {/* гарнитура */}
            {headset && (
              <>
                <mesh position={[0, 0.45, 0]}>
                  <boxGeometry args={[0.38, 0.05, 0.3]} />
                  <meshStandardMaterial color={0x151824} roughness={0.5} />
                </mesh>
                <mesh position={[-0.19, 0.26, 0]}>
                  <boxGeometry args={[0.05, 0.12, 0.12]} />
                  <meshStandardMaterial color={0x151824} roughness={0.5} />
                </mesh>
                <mesh position={[0.19, 0.26, 0]}>
                  <boxGeometry args={[0.05, 0.12, 0.12]} />
                  <meshStandardMaterial color={0x151824} roughness={0.5} />
                </mesh>
                <mesh position={[0.2, 0.26, 0.07]}>
                  <boxGeometry args={[0.02, 0.02, 0.02]} />
                  <meshStandardMaterial color={0x35e0ff} emissive={0x35e0ff} emissiveIntensity={1.4} />
                </mesh>
                <mesh position={[0.2, 0.18, 0.12]} rotation={[0.5, 0, 0]}>
                  <boxGeometry args={[0.02, 0.12, 0.02]} />
                  <meshStandardMaterial color={0x151824} />
                </mesh>
              </>
            )}

            {/* ZZZ, когда задремал в режиме «утро» */}
            {mode === "morning" && !noMorning && !standing && (
              <group ref={zzz} position={[0.2, 0.55, 0.05]} visible={false}>
                {[0, 1, 2].map((i) => (
                  <sprite key={i} scale={[0.13 + i * 0.05, 0.13 + i * 0.05, 1]} position={[i * 0.07, i * 0.1, 0]}>
                    <spriteMaterial map={zeeTex} transparent depthTest={false} />
                  </sprite>
                ))}
              </group>
            )}

            {/* огонь над головой в режиме «срочная задача» */}
            {mode === "urgent" && !standing && (
              <group ref={fire} position={[0, 0.68, 0]}>
                {[
                  [-0.07, 0],
                  [0, 0.05],
                  [0.07, 0],
                ].map(([x, y], i) => (
                  <group key={i} position={[x, y, 0]}>
                    <mesh>
                      <coneGeometry args={[0.05, 0.17, 8]} />
                      <meshBasicMaterial color={0xff6a00} transparent opacity={0.85} toneMapped={false} />
                    </mesh>
                    <mesh position={[0, -0.03, 0]}>
                      <coneGeometry args={[0.028, 0.1, 8]} />
                      <meshBasicMaterial color={0xffd23a} transparent opacity={0.9} toneMapped={false} />
                    </mesh>
                  </group>
                ))}
              </group>
            )}
          </group>

          {/* руки */}
          <group ref={shL} position={[-0.24 * b, 0.4, 0]}>
            <mesh position={[0, -0.14, 0]}>
              <boxGeometry args={[0.11, 0.3, 0.12]} />
              <meshStandardMaterial color={shirt} roughness={0.75} />
            </mesh>
            <group ref={elL} position={[0, -0.28, 0]}>
              <mesh position={[0, -0.13, 0]}>
                <boxGeometry args={[0.095, 0.26, 0.1]} />
                <meshStandardMaterial color={sleeve} roughness={0.8} />
              </mesh>
              <mesh position={[0, -0.28, 0.02]}>
                <boxGeometry args={[0.09, 0.08, 0.11]} />
                <meshStandardMaterial color={skin} roughness={0.8} />
              </mesh>
              {/* жёлтая папка «1С» в опущенной руке */}
              {holdFolder && (
                <group position={[-0.045, -0.34, 0.08]} rotation={[0.12, 0, 0.08]}>
                  <mesh>
                    <boxGeometry args={[0.035, 0.34, 0.26]} />
                    <meshStandardMaterial color={0xf2c300} roughness={0.6} />
                  </mesh>
                  <mesh position={[-0.021, 0.02, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <planeGeometry args={[0.16, 0.1]} />
                    <meshBasicMaterial map={folderLabel} transparent toneMapped={false} />
                  </mesh>
                  <mesh position={[0.021, 0.15, 0.02]}>
                    <boxGeometry args={[0.006, 0.02, 0.18]} />
                    <meshStandardMaterial color={0xd7dce8} roughness={0.7} />
                  </mesh>
                  <mesh position={[0.021, -0.14, 0.02]}>
                    <boxGeometry args={[0.006, 0.02, 0.18]} />
                    <meshStandardMaterial color={0xd7dce8} roughness={0.7} />
                  </mesh>
                </group>
              )}
            </group>
          </group>
          <group ref={shR} position={[0.24 * b, 0.4, 0]}>
            <mesh position={[0, -0.14, 0]}>
              <boxGeometry args={[0.11, 0.3, 0.12]} />
              <meshStandardMaterial color={shirt} roughness={0.75} />
            </mesh>
            <group ref={elR} position={[0, -0.28, 0]}>
              <mesh position={[0, -0.13, 0]}>
                <boxGeometry args={[0.095, 0.26, 0.1]} />
                <meshStandardMaterial color={sleeve} roughness={0.8} />
              </mesh>
              <mesh position={[0, -0.28, 0.02]}>
                <boxGeometry args={[0.09, 0.08, 0.11]} />
                <meshStandardMaterial color={skin} roughness={0.8} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ноутбук на коленях, экраном к владельцу */}
        {lapLaptop && (
          <group position={[0, 0.05, 0.3]} rotation={[-0.14, Math.PI, 0]}>
            <Laptop position={[0, 0, 0]} tint="#f2c300" onClick={lapLaptopClick} />
          </group>
        )}

        {/* большая кружка кофе — стоит вертикально прямо в руке */}
        {holdMug && (
          <group position={[-0.09, 0.62, 0.4]}>
            <mesh>
              <cylinderGeometry args={[0.062, 0.052, 0.15, 12]} />
              <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
            </mesh>
            <mesh position={[0.078, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.04, 0.012, 8, 12]} />
              <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.077, 0]}>
              <cylinderGeometry args={[0.056, 0.056, 0.012, 12]} />
              <meshStandardMaterial color={0x3a2417} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.02, 0.065]}>
              <boxGeometry args={[0.06, 0.05, 0.006]} />
              <meshStandardMaterial color={0xff5cae} emissive={0xff5cae} emissiveIntensity={0.35} />
            </mesh>
          </group>
        )}

        {/* ноги */}
        <group ref={hipL} position={[-0.11 * b, -0.06, 0]}>
          <mesh position={[0, -0.19, 0]}>
            <boxGeometry args={[0.15, 0.38, 0.16]} />
            <meshStandardMaterial color={pants} roughness={0.85} />
          </mesh>
          <group ref={knL} position={[0, -0.38, 0]}>
            {/* наколенник закрывает стык бедра и голени — без копланарных граней */}
            <mesh position={[0, -0.015, 0.015]}>
              <boxGeometry args={[0.145, 0.11, 0.155]} />
              <meshStandardMaterial color={pants} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.185, 0]}>
              <boxGeometry args={[0.128, 0.31, 0.138]} />
              <meshStandardMaterial color={pants} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.36, 0.05]}>
              <boxGeometry args={[0.13, 0.09, 0.24]} />
              <meshStandardMaterial color={shoes} roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.325, 0.16]}>
              <boxGeometry args={[0.126, 0.03, 0.05]} />
              <meshStandardMaterial color={0xe8ecf5} roughness={0.5} />
            </mesh>
          </group>
        </group>
        <group ref={hipR} position={[0.11 * b, -0.06, 0]}>
          <mesh position={[0, -0.19, 0]}>
            <boxGeometry args={[0.15, 0.38, 0.16]} />
            <meshStandardMaterial color={pants} roughness={0.85} />
          </mesh>
          <group ref={knR} position={[0, -0.38, 0]}>
            {/* наколенник закрывает стык бедра и голени — без копланарных граней */}
            <mesh position={[0, -0.015, 0.015]}>
              <boxGeometry args={[0.145, 0.11, 0.155]} />
              <meshStandardMaterial color={pants} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.185, 0]}>
              <boxGeometry args={[0.128, 0.31, 0.138]} />
              <meshStandardMaterial color={pants} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.36, 0.05]}>
              <boxGeometry args={[0.13, 0.09, 0.24]} />
              <meshStandardMaterial color={shoes} roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.325, 0.16]}>
              <boxGeometry args={[0.126, 0.03, 0.05]} />
              <meshStandardMaterial color={0xe8ecf5} roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
