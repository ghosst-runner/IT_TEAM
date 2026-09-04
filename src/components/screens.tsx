import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/* ---------- утилита: псевдослучайный хэш ---------- */
export function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

/* ---------- хук: анимированная canvas-текстура ---------- */
export function useAnimatedTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, t: number) => void,
  every = 2
) {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }, [w, h]);
  const ctx = canvas.getContext("2d")!;
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);
  const frame = useRef(0);
  useFrame((s) => {
    frame.current++;
    if (frame.current % every === 0) {
      draw(ctx, s.clock.elapsedTime);
      tex.needsUpdate = true;
    }
  });
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/* ---------- хук: статичная canvas-текстура ---------- */
export function useStaticTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    draw(ctx);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/* ---------- экран с бегущим кодом ---------- */
export function useCodeScreen(tint: string) {
  return useAnimatedTexture(256, 144, (ctx, t) => {
    ctx.fillStyle = "#0a1122";
    ctx.fillRect(0, 0, 256, 144);
    ctx.fillStyle = "#16203c";
    ctx.fillRect(0, 0, 256, 14);
    const dots = ["#ff5f56", "#ffbd2e", "#27c93f"];
    dots.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(8 + i * 10, 7, 3, 0, 7);
      ctx.fill();
    });
    const scroll = Math.floor(t * 3);
    for (let row = 0; row < 11; row++) {
      const seed = hash(row * 3.7 + scroll * 1.3);
      const indent = Math.floor(seed * 4) * 12;
      let x = 8 + indent;
      const chunks = 2 + Math.floor(hash(row + scroll) * 4);
      for (let k = 0; k < chunks; k++) {
        const r = hash(row * 11.3 + k * 7.7 + scroll);
        const wch = 14 + r * 46;
        ctx.fillStyle =
          r > 0.86 ? tint : r > 0.66 ? "#7dd3fc" : r > 0.45 ? "#c4b5fd" : r > 0.25 ? "#94a3b8" : "#334155";
        ctx.fillRect(x, 22 + row * 11, wch, 6);
        x += wch + 7;
        if (x > 236) break;
      }
    }
    if (Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = tint;
      ctx.fillRect(8, 22 + 11 * 11, 8, 7);
    }
    ctx.fillStyle = "#0f1a33";
    ctx.fillRect(0, 132, 256, 12);
    ctx.fillStyle = tint;
    ctx.fillRect(6, 136, 30 + Math.sin(t * 2) * 10 + 10, 4);
  });
}

/* ---------- ТВ: дашборд сисадмина с динамическими графиками ---------- */
export function useTVScreen() {
  return useAnimatedTexture(320, 180, (ctx, t) => {
    ctx.fillStyle = "#04070f";
    ctx.fillRect(0, 0, 320, 180);
    // сетка
    ctx.strokeStyle = "rgba(53,224,255,0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 320; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 180);
      ctx.stroke();
    }
    for (let y = 0; y <= 180; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(320, y);
      ctx.stroke();
    }
    // шапка
    ctx.fillStyle = "#0a1122";
    ctx.fillRect(0, 0, 320, 18);
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#9dff57";
    ctx.fillText("SYSADM MONITOR v4.2", 6, 13);
    ctx.fillStyle = "#35e0ff";
    ctx.textAlign = "right";
    const hh = Math.floor(t / 3.6) % 24;
    const mm = Math.floor(t * 0.28) % 60;
    const ss = Math.floor(t * 2.2) % 60;
    ctx.fillText(
      `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
      314,
      13
    );

    // три скроллящихся линейных графика
    const charts: [number, string, number, number][] = [
      [48, "#35e0ff", 1.0, 26],
      [84, "#ff5cae", 1.7, 18],
      [120, "#9dff57", 0.6, 22],
    ];
    charts.forEach(([mid, color, freq, amp], ci) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = 0; x <= 210; x += 3) {
        const v =
          Math.sin((x + t * 46) * 0.045 * freq + ci) * 0.55 +
          Math.sin((x + t * 23) * 0.11 * freq) * 0.3 +
          hash(Math.floor((x + t * 46) / 12) + ci * 7) * 0.3;
        const y = mid - v * amp * 0.5;
        if (x === 0) ctx.moveTo(x + 4, y);
        else ctx.lineTo(x + 4, y);
      }
      ctx.stroke();
      ctx.font = "8px monospace";
      ctx.fillStyle = color;
      ctx.fillText(["CPU", "MEM", "NET"][ci], 6, mid - amp * 0.5 - 3);
      const val = Math.round(50 + Math.sin(t * 0.9 + ci * 2) * 30 + hash(ci + Math.floor(t)) * 10);
      ctx.textAlign = "right";
      ctx.fillText(`${val}%`, 212, mid - amp * 0.5 - 3);
      ctx.textAlign = "left";
    });

    // правая колонка: бар-чарт нагрузки узлов
    ctx.font = "8px monospace";
    ctx.fillStyle = "#7dd3fc";
    ctx.fillText("NODES", 224, 30);
    for (let i = 0; i < 6; i++) {
      const hgt = 8 + Math.abs(Math.sin(t * 1.3 + i * 1.1)) * 34;
      ctx.fillStyle = hgt > 34 ? "#ff5cae" : "#35e0ff";
      ctx.fillRect(226 + i * 15, 74 - hgt, 10, hgt);
      ctx.fillStyle = "#334155";
      ctx.fillRect(226 + i * 15, 75, 10, 1);
    }
    // аптайм
    ctx.fillStyle = "#9dff57";
    ctx.font = "bold 13px monospace";
    ctx.fillText("UPTIME", 224, 96);
    ctx.fillText("99.99%", 224, 110);
    // алерты
    ctx.fillStyle = Math.floor(t * 2) % 2 ? "#ff5cae" : "#3a1030";
    ctx.fillRect(224, 118, 88, 12);
    ctx.fillStyle = "#04070f";
    ctx.font = "bold 9px monospace";
    ctx.fillText("ALERT: 0", 230, 127);

    // нижняя лента логов
    ctx.fillStyle = "rgba(10,17,34,0.9)";
    ctx.fillRect(0, 140, 320, 40);
    ctx.font = "8px monospace";
    for (let i = 0; i < 4; i++) {
      const line = Math.floor(t * 1.5) + i;
      const r = hash(line * 3.3);
      ctx.fillStyle = r > 0.85 ? "#ff5cae" : r > 0.6 ? "#9dff57" : "#5b708c";
      const msgs = [
        "[ok] deploy prod :: done in 42s",
        "[ok] backup db-01 :: 12.4 GB",
        "[warn] temp gpu-0 :: 71C",
        "[ok] cron cert-renew :: valid 88d",
        "[ok] k8s pod restart :: 0",
        "[info] traffic :: 1.2k rps",
      ];
      ctx.fillText(`$ ${msgs[Math.floor(r * msgs.length) % msgs.length]}`, 6, 150 + i * 9);
    }
  });
}

/* ---------- вайтборд со спринтом ---------- */
export function useWhiteboard() {
  return useStaticTexture(256, 144, (ctx) => {
    ctx.fillStyle = "#e8ecf5";
    ctx.fillRect(0, 0, 256, 144);
    ctx.strokeStyle = "#94a3b8";
    ctx.strokeRect(2, 2, 252, 140);
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 13px monospace";
    ctx.fillText("СПРИНТ #42", 10, 20);
    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(88, 8);
    ctx.lineTo(88, 136);
    ctx.moveTo(172, 8);
    ctx.lineTo(172, 136);
    ctx.stroke();
    ctx.font = "9px monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("TODO", 14, 34);
    ctx.fillText("IN PROGRESS", 96, 34);
    ctx.fillText("DONE", 180, 34);
    const notes: [number, number, string][] = [
      [12, 42, "#fde047"],
      [12, 66, "#fca5a5"],
      [12, 90, "#86efac"],
      [94, 42, "#93c5fd"],
      [94, 70, "#fde047"],
      [178, 42, "#86efac"],
      [178, 66, "#86efac"],
      [178, 90, "#f9a8d4"],
    ];
    notes.forEach(([x, y, c]) => {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 62, 18);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(x + 4, y + 6, 40 + ((x + y) % 14), 2);
      ctx.fillRect(x + 4, y + 11, 30 + ((x * y) % 18), 2);
    });
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(96, 108);
    ctx.bezierCurveTo(120, 96, 140, 122, 164, 104);
    ctx.stroke();
  });
}

/* ---------- окно: ночной город во всю стену ---------- */
export function useSkyline() {
  return useStaticTexture(512, 160, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 160);
    g.addColorStop(0, "#1b1040");
    g.addColorStop(0.6, "#3b1663");
    g.addColorStop(1, "#0b0a24");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 160);
    // луна
    ctx.fillStyle = "#ffe9b8";
    ctx.beginPath();
    ctx.arc(420, 32, 13, 0, 7);
    ctx.fill();
    ctx.fillStyle = "rgba(255,233,184,0.22)";
    ctx.beginPath();
    ctx.arc(420, 32, 21, 0, 7);
    ctx.fill();
    // звёзды
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + hash(i) * 0.5})`;
      ctx.fillRect(hash(i * 1.7) * 512, hash(i * 3.1) * 70, 1.5, 1.5);
    }
    // здания
    let x = 0;
    let i = 0;
    while (x < 512) {
      const w = 20 + hash(i * 3.3) * 34;
      const h = 40 + hash(i * 7.7) * 90;
      ctx.fillStyle = i % 2 ? "#141233" : "#0e0c28";
      ctx.fillRect(x, 160 - h, w, h);
      for (let wy = 160 - h + 6; wy < 152; wy += 9) {
        for (let wx = x + 3; wx < x + w - 4; wx += 7) {
          if (hash(wx * 1.7 + wy * 3.1) > 0.62) {
            ctx.fillStyle = hash(wx + wy) > 0.75 ? "#ff5cae" : "#ffd98a";
            ctx.fillRect(wx, wy, 3, 4);
          }
        }
      }
      // неоновые вывески на некоторых зданиях
      if (i % 4 === 1) {
        ctx.fillStyle = i % 8 === 1 ? "#35e0ff" : "#ff5cae";
        ctx.font = "bold 9px monospace";
        ctx.fillText(i % 8 === 1 ? "NEON" : "CYBER", x + 3, 160 - h + 20);
      }
      x += w + 3;
      i++;
    }
  });
}

/* ---------- неоновая вывеска IT TEAM ---------- */
export function useNeonSign() {
  return useStaticTexture(256, 96, (ctx) => {
    ctx.clearRect(0, 0, 256, 96);
    ctx.font = "bold 44px monospace";
    ctx.textAlign = "center";
    ctx.shadowColor = "#ff5cae";
    ctx.shadowBlur = 22;
    ctx.fillStyle = "#ffd7ec";
    ctx.fillText("IT TEAM", 128, 48);
    ctx.shadowColor = "#35e0ff";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#c8f6ff";
    ctx.font = "bold 15px monospace";
    ctx.fillText("< admins crew />", 128, 78);
  });
}

/* ---------- постер: мужчина с лёгкой бородой, надпись ИОФФЕ ---------- */
export function useIoffePoster() {
  return useStaticTexture(128, 160, (ctx) => {
    const g = ctx.createRadialGradient(64, 92, 10, 64, 92, 95);
    g.addColorStop(0, "#39404f");
    g.addColorStop(1, "#1d212b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 160);
    // надпись сверху
    ctx.fillStyle = "#e8ecf5";
    ctx.font = "bold 21px monospace";
    ctx.textAlign = "center";
    ctx.fillText("ИОФФЕ", 64, 28);
    ctx.strokeStyle = "#9dff57";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(26, 36);
    ctx.lineTo(102, 36);
    ctx.stroke();
    // плечи / пиджак
    ctx.fillStyle = "#2b3050";
    ctx.beginPath();
    ctx.ellipse(64, 152, 42, 28, 0, 0, 7);
    ctx.fill();
    // рубашка и воротник
    ctx.fillStyle = "#d7dce8";
    ctx.beginPath();
    ctx.moveTo(51, 126);
    ctx.lineTo(64, 140);
    ctx.lineTo(77, 126);
    ctx.lineTo(77, 134);
    ctx.lineTo(64, 148);
    ctx.lineTo(51, 134);
    ctx.closePath();
    ctx.fill();
    // шея
    ctx.fillStyle = "#d99a6c";
    ctx.fillRect(57, 110, 14, 18);
    // голова
    ctx.fillStyle = "#e8b48a";
    ctx.beginPath();
    ctx.ellipse(64, 86, 24, 28, 0, 0, 7);
    ctx.fill();
    // волосы: залысины, бока
    ctx.fillStyle = "#4a4038";
    ctx.beginPath();
    ctx.ellipse(42, 82, 6.5, 15, 0.2, 0, 7);
    ctx.ellipse(86, 82, 6.5, 15, -0.2, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(46, 66);
    ctx.quadraticCurveTo(64, 58, 82, 66);
    ctx.lineTo(82, 61);
    ctx.quadraticCurveTo(64, 52, 46, 61);
    ctx.closePath();
    ctx.fill();
    // лёгкая борода: мягкая тень по контуру челюсти
    ctx.fillStyle = "rgba(74,64,56,0.5)";
    ctx.beginPath();
    ctx.moveTo(42, 90);
    ctx.quadraticCurveTo(46, 116, 64, 118);
    ctx.quadraticCurveTo(82, 116, 86, 90);
    ctx.quadraticCurveTo(80, 106, 64, 108);
    ctx.quadraticCurveTo(48, 106, 42, 90);
    ctx.closePath();
    ctx.fill();
    // усы
    ctx.fillStyle = "rgba(74,64,56,0.75)";
    ctx.beginPath();
    ctx.ellipse(64, 100, 8, 2.6, 0, 0, 7);
    ctx.fill();
    // глаза
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.ellipse(55, 82, 5, 3.4, 0, 0, 7);
    ctx.ellipse(73, 82, 5, 3.4, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#2a2f3d";
    ctx.beginPath();
    ctx.arc(55, 82, 2, 0, 7);
    ctx.arc(73, 82, 2, 0, 7);
    ctx.fill();
    // брови
    ctx.strokeStyle = "#4a4038";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(49, 75);
    ctx.lineTo(60, 74);
    ctx.moveTo(68, 74);
    ctx.lineTo(79, 75);
    ctx.stroke();
    // нос и рот
    ctx.strokeStyle = "#c98d63";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(64, 82);
    ctx.lineTo(62, 93);
    ctx.lineTo(66, 94);
    ctx.stroke();
    ctx.strokeStyle = "#8a4a44";
    ctx.beginPath();
    ctx.moveTo(58, 104);
    ctx.lineTo(70, 104);
    ctx.stroke();
    // рамка
    ctx.strokeStyle = "#9dff57";
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 124, 156);
  });
}

/* ---------- постер с аниме-девочкой во весь рост ---------- */
export function useAnimePoster() {
  return useStaticTexture(128, 160, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 160);
    g.addColorStop(0, "#1b1040");
    g.addColorStop(1, "#4c1d95");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 160);
    const rg = ctx.createRadialGradient(64, 70, 6, 64, 70, 70);
    rg.addColorStop(0, "rgba(255,143,179,0.45)");
    rg.addColorStop(1, "rgba(255,143,179,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, 128, 160);
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + hash(i * 2.2) * 0.5})`;
      ctx.fillRect(hash(i * 1.3) * 124 + 2, hash(i * 3.7) * 150 + 4, 1.6, 1.6);
    }
    // длинные волосы сзади — до пояса
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.ellipse(64, 40, 26, 26, 0, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.quadraticCurveTo(30, 80, 38, 104);
    ctx.lineTo(50, 100);
    ctx.quadraticCurveTo(44, 70, 48, 46);
    ctx.closePath();
    ctx.moveTo(88, 40);
    ctx.quadraticCurveTo(98, 80, 90, 104);
    ctx.lineTo(78, 100);
    ctx.quadraticCurveTo(84, 70, 80, 46);
    ctx.closePath();
    ctx.fill();
    // ноги
    ctx.fillStyle = "#ffe8d6";
    ctx.fillRect(55, 106, 8, 34);
    ctx.fillRect(66, 106, 8, 34);
    // гольфы
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(55, 128, 8, 14);
    ctx.fillRect(66, 128, 8, 14);
    // туфли
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.ellipse(58, 145, 7, 4, 0, 0, 7);
    ctx.ellipse(71, 145, 7, 4, 0, 0, 7);
    ctx.fill();
    // юбка
    ctx.fillStyle = "#1e3a8a";
    ctx.beginPath();
    ctx.moveTo(50, 84);
    ctx.lineTo(78, 84);
    ctx.lineTo(86, 110);
    ctx.lineTo(42, 110);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(44, 106);
    ctx.lineTo(84, 106);
    ctx.stroke();
    // торс — школьная форма
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(50, 54, 28, 32);
    // руки
    ctx.fillRect(43, 56, 7, 28);
    ctx.fillRect(78, 56, 7, 28);
    ctx.fillStyle = "#ffe8d6";
    ctx.beginPath();
    ctx.arc(46.5, 87, 4, 0, 7);
    ctx.arc(81.5, 87, 4, 0, 7);
    ctx.fill();
    // воротник и бант
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(52, 54);
    ctx.lineTo(64, 66);
    ctx.lineTo(76, 54);
    ctx.lineTo(76, 60);
    ctx.lineTo(64, 72);
    ctx.lineTo(52, 60);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.moveTo(64, 66);
    ctx.lineTo(56, 72);
    ctx.lineTo(64, 70);
    ctx.lineTo(72, 72);
    ctx.closePath();
    ctx.fill();
    // лицо
    ctx.fillStyle = "#ffe8d6";
    ctx.beginPath();
    ctx.ellipse(64, 36, 19, 20, 0, 0, 7);
    ctx.fill();
    // чёлка
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.moveTo(45, 26);
    ctx.lineTo(64, 14);
    ctx.lineTo(83, 26);
    ctx.lineTo(79, 36);
    ctx.lineTo(72, 26);
    ctx.lineTo(64, 38);
    ctx.lineTo(56, 26);
    ctx.lineTo(49, 36);
    ctx.closePath();
    ctx.fill();
    // ахоге
    ctx.strokeStyle = "#f9a8d4";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(64, 13);
    ctx.quadraticCurveTo(70, 4, 78, 3);
    ctx.stroke();
    // глаза
    ctx.fillStyle = "#35e0ff";
    ctx.beginPath();
    ctx.ellipse(56, 39, 4.6, 6.5, 0, 0, 7);
    ctx.ellipse(72, 39, 4.6, 6.5, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#0369a1";
    ctx.beginPath();
    ctx.ellipse(56, 40.5, 2.2, 3.4, 0, 0, 7);
    ctx.ellipse(72, 40.5, 2.2, 3.4, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(57.6, 36.6, 1.7, 0, 7);
    ctx.arc(73.6, 36.6, 1.7, 0, 7);
    ctx.fill();
    // брови, румянец, рот
    ctx.strokeStyle = "#d13a63";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(51, 30);
    ctx.quadraticCurveTo(56, 28, 60, 30);
    ctx.moveTo(68, 30);
    ctx.quadraticCurveTo(72, 28, 77, 30);
    ctx.stroke();
    ctx.fillStyle = "rgba(244,114,182,0.55)";
    ctx.beginPath();
    ctx.ellipse(51, 45, 3.4, 2, 0, 0, 7);
    ctx.ellipse(77, 45, 3.4, 2, 0, 0, 7);
    ctx.fill();
    ctx.strokeStyle = "#d13a63";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(64, 46, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
    // рамка
    ctx.strokeStyle = "#35e0ff";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 124, 156);
  });
}

/* ---------- календарь ---------- */
export function useCalendar() {
  return useStaticTexture(128, 160, (ctx) => {
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, 128, 160);
    ctx.fillStyle = "#d13a63";
    ctx.fillRect(0, 0, 128, 34);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "center";
    ctx.fillText("ОКТЯБРЬ", 64, 22);
    ctx.fillStyle = "#94a3b8";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(19 + i * 18, 3, 3.4, 0, 7);
      ctx.fill();
    }
    ctx.fillStyle = "#64748b";
    ctx.font = "8px monospace";
    ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"].forEach((d, i) => ctx.fillText(d, 16 + i * 16, 48));
    ctx.font = "9px monospace";
    let day = 1;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 && c < 1) continue;
        if (day > 31) break;
        const x = 16 + c * 16;
        const y = 62 + r * 17;
        if (day === 17) {
          ctx.strokeStyle = "#e11d48";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y - 3, 7.5, 0, 7);
          ctx.stroke();
          ctx.fillStyle = "#e11d48";
        } else if (c >= 5) {
          ctx.fillStyle = "#94a3b8";
        } else {
          ctx.fillStyle = "#1e293b";
        }
        ctx.fillText(String(day), x, y);
        day++;
      }
    }
    ctx.fillStyle = "#d13a63";
    ctx.font = "bold 9px monospace";
    ctx.fillText("17 — ДЕПЛОЙ НЕ В ПТ!", 64, 152);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 126, 158);
  });
}

/* ---------- надпись «БОСС» на кружку ---------- */
export function useBossLabel() {
  return useStaticTexture(96, 56, (ctx) => {
    ctx.clearRect(0, 0, 96, 56);
    ctx.font = "bold 30px monospace";
    ctx.textAlign = "center";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("БОСС", 48, 39);
  });
}

/* ---------- наклейка «1С» на папку ---------- */
export function useFolderLabel() {
  return useStaticTexture(64, 40, (ctx) => {
    ctx.clearRect(0, 0, 64, 40);
    ctx.fillStyle = "#7a1020";
    ctx.font = "bold 30px monospace";
    ctx.textAlign = "center";
    ctx.fillText("1С", 32, 31);
  });
}

/* ---------- живой город за окном: пре-рендер фона + дешёвая анимация ---------- */
export function useCityWindow() {
  const off = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 160;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 160);
    g.addColorStop(0, "#1b1040");
    g.addColorStop(0.6, "#3b1663");
    g.addColorStop(1, "#0b0a24");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 160);
    ctx.fillStyle = "#ffe9b8";
    ctx.beginPath();
    ctx.arc(420, 30, 12, 0, 7);
    ctx.fill();
    ctx.fillStyle = "rgba(255,233,184,0.2)";
    ctx.beginPath();
    ctx.arc(420, 30, 20, 0, 7);
    ctx.fill();
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + hash(i) * 0.5})`;
      ctx.fillRect(hash(i * 1.7) * 512, hash(i * 3.1) * 66, 1.5, 1.5);
    }
    let x = 0;
    let i = 0;
    while (x < 512) {
      const w = 20 + hash(i * 3.3) * 34;
      const h = 40 + hash(i * 7.7) * 82;
      ctx.fillStyle = i % 2 ? "#141233" : "#0e0c28";
      ctx.fillRect(x, 138 - h, w, h);
      for (let wy = 138 - h + 6; wy < 132; wy += 9) {
        for (let wx = x + 3; wx < x + w - 4; wx += 7) {
          if (hash(wx * 1.7 + wy * 3.1) > 0.62) {
            ctx.fillStyle = hash(wx + wy) > 0.75 ? "#ff5cae" : "#ffd98a";
            ctx.fillRect(wx, wy, 3, 4);
          }
        }
      }
      if (i % 4 === 1) {
        ctx.fillStyle = i % 8 === 1 ? "#35e0ff" : "#ff5cae";
        ctx.font = "bold 9px monospace";
        ctx.fillText(i % 8 === 1 ? "NEON" : "CYBER", x + 3, 138 - h + 18);
      }
      x += w + 3;
      i++;
    }
    // тротуар и дорога
    ctx.fillStyle = "#151a2e";
    ctx.fillRect(0, 138, 512, 6);
    ctx.fillStyle = "#0a0c18";
    ctx.fillRect(0, 144, 512, 16);
    ctx.fillStyle = "#2a3050";
    for (let d = 0; d < 512; d += 26) ctx.fillRect(d, 151, 12, 1.5);
    return c;
  }, []);
  return useAnimatedTexture(
    512,
    160,
    (ctx, t) => {
      ctx.drawImage(off, 0, 0);
      // дальняя полоса: машины справа налево
      for (let i = 0; i < 3; i++) {
        const span = 560;
        const x = span - ((t * (46 + i * 14) + i * 190) % span);
        const y = 145;
        ctx.fillStyle = ["#d13a63", "#35e0ff", "#ffc857"][i];
        ctx.fillRect(x, y, 16, 4);
        ctx.fillStyle = "#0d1024";
        ctx.fillRect(x + 3, y - 2, 8, 3);
        ctx.fillStyle = "#fff7cf";
        ctx.fillRect(x - 2, y + 1, 2, 2);
        ctx.fillStyle = "#ff8080";
        ctx.fillRect(x + 16, y + 1, 2, 2);
      }
      // ближняя полоса: машины слева направо
      for (let i = 0; i < 2; i++) {
        const span = 560;
        const x = ((t * (30 + i * 10) + i * 260) % span) - 24;
        const y = 153;
        ctx.fillStyle = ["#9dff57", "#e8ecf5"][i];
        ctx.fillRect(x, y, 18, 4);
        ctx.fillStyle = "#0d1024";
        ctx.fillRect(x + 4, y - 2, 9, 3);
        ctx.fillStyle = "#fff7cf";
        ctx.fillRect(x + 18, y + 1, 2, 2);
        ctx.fillStyle = "#ff8080";
        ctx.fillRect(x - 2, y + 1, 2, 2);
      }
      // пешеходы на тротуаре
      for (let i = 0; i < 4; i++) {
        const span = 540;
        const dir = i % 2 ? 1 : -1;
        const x =
          dir === 1 ? ((t * (11 + i * 3) + i * 140) % span) - 10 : span - ((t * (9 + i * 4) + i * 170) % span);
        const y = 138;
        const step = Math.sin(t * 7 + i * 2) > 0;
        ctx.fillStyle = ["#ff5cae", "#35e0ff", "#ffc857", "#c7cdea"][i];
        ctx.fillRect(x, y - 6, 3, 6);
        ctx.fillStyle = "#e8b48a";
        ctx.fillRect(x, y - 8, 3, 2);
        ctx.fillStyle = "#1b1e2c";
        ctx.fillRect(x + (step ? 0 : 2), y, 1, 3);
        ctx.fillRect(x + (step ? 2 : 0), y, 1, 3);
      }
    },
    4
  );
}

/* ---------- буковка Z для спящих ---------- */
export function useZee() {
  return useStaticTexture(48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    ctx.font = "bold 40px monospace";
    ctx.textAlign = "center";
    ctx.shadowColor = "#35e0ff";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#dff6ff";
    ctx.fillText("Z", 24, 38);
  });
}

/* ---------- плакат: подозрительная сова ---------- */
export function useOwlPoster() {
  return useStaticTexture(128, 160, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 160);
    g.addColorStop(0, "#2a1a10");
    g.addColorStop(1, "#140d08");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 160);
    // луна-фон
    ctx.fillStyle = "rgba(255,200,87,0.15)";
    ctx.beginPath();
    ctx.arc(64, 70, 46, 0, 7);
    ctx.fill();
    // тело
    ctx.fillStyle = "#8a6a44";
    ctx.beginPath();
    ctx.ellipse(64, 92, 30, 40, 0, 0, 7);
    ctx.fill();
    // грудка с перьями
    ctx.fillStyle = "#c9a876";
    ctx.beginPath();
    ctx.ellipse(64, 102, 18, 26, 0, 0, 7);
    ctx.fill();
    ctx.strokeStyle = "#8a6a44";
    ctx.lineWidth = 2;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.beginPath();
        ctx.arc(56 + c * 8, 92 + r * 9, 3, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
    }
    // уши-кисточки
    ctx.fillStyle = "#6b4f30";
    ctx.beginPath();
    ctx.moveTo(42, 46);
    ctx.lineTo(48, 28);
    ctx.lineTo(54, 46);
    ctx.closePath();
    ctx.moveTo(74, 46);
    ctx.lineTo(80, 28);
    ctx.lineTo(86, 46);
    ctx.closePath();
    ctx.fill();
    // глаза: полуприкрытые веки = подозрение
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(52, 62, 12, 0, 7);
    ctx.arc(76, 62, 12, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#14161c";
    ctx.beginPath();
    ctx.arc(54, 64, 5, 0, 7);
    ctx.arc(74, 64, 5, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#8a6a44";
    ctx.fillRect(40, 48, 24, 10);
    ctx.fillRect(64, 48, 24, 10);
    // скошенные брови
    ctx.strokeStyle = "#3a2a18";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, 46);
    ctx.lineTo(60, 54);
    ctx.moveTo(88, 46);
    ctx.lineTo(68, 54);
    ctx.stroke();
    // клюв
    ctx.fillStyle = "#ffc857";
    ctx.beginPath();
    ctx.moveTo(64, 66);
    ctx.lineTo(58, 76);
    ctx.lineTo(70, 76);
    ctx.closePath();
    ctx.fill();
    // крылья сложены
    ctx.fillStyle = "#6b4f30";
    ctx.beginPath();
    ctx.ellipse(36, 96, 8, 24, 0.2, 0, 7);
    ctx.ellipse(92, 96, 8, 24, -0.2, 0, 7);
    ctx.fill();
    // подпись
    ctx.fillStyle = "#ffc857";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText("ПОДОЗРИТЕЛЬНАЯ СОВА", 64, 148);
    ctx.strokeStyle = "#ffc857";
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 124, 156);
  });
}

/* ---------- табличка на двери ---------- */
export function useDoorSign() {
  return useStaticTexture(256, 64, (ctx) => {
    ctx.fillStyle = "#04140c";
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = "#9dff57";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 56);
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.shadowColor = "#9dff57";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#c9ffb0";
    ctx.fillText("ВЫХОД ИЗ МАТРИЦЫ", 128, 41);
  });
}
