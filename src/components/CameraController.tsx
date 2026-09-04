import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

export type CameraMode = "overview" | "auto" | "tv";

export interface CameraFocus {
  x: number;
  z: number;
}

interface Props {
  mode: CameraMode | "focus";
  focus: CameraFocus | null;
  focusNonce: number; // меняется, чтобы сбросить пользовательский угол при новом фокусе
}

export function CameraController({ mode, focus, focusNonce }: Props) {
  const { camera, gl } = useThree();

  const st = useRef({
    theta: 0.55,
    phi: 0.34,
    radius: 11,
    dTheta: 0.55,
    dPhi: 0.34,
    dRadius: 11,
    target: new THREE.Vector3(0, 1.1, -0.9),
    dTarget: new THREE.Vector3(0, 1.1, -0.9),
    dragging: false,
    px: 0,
    py: 0,
  });

  const key = useMemo(() => `${mode}:${focus ? `${focus.x},${focus.z}` : ""}:${focusNonce}`, [mode, focus, focusNonce]);

  /* при смене пресета задаём желаемую позицию */
  useEffect(() => {
    const s = st.current;
    if (mode === "overview") {
      s.dTarget.set(-0.2, 0.95, -0.5);
      s.dTheta = 0.6;
      s.dPhi = 0.33;
      s.dRadius = 6.8;
    } else if (mode === "auto") {
      s.dTarget.set(-0.2, 0.95, -0.4);
      s.dPhi = 0.26;
      s.dRadius = 6.0;
    } else if (mode === "tv") {
      s.dTarget.set(0.5, 1.75, 2.4);
      s.dTheta = Math.PI;
      s.dPhi = 0.08;
      s.dRadius = 4.2;
    } else if (focus) {
      s.dTarget.set(focus.x, 1.05, focus.z);
      s.dTheta = 0.95;
      s.dPhi = 0.2;
      s.dRadius = 2.9;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /* события мыши */
  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 2) return;
      const s = st.current;
      s.dragging = true;
      s.px = e.clientX;
      s.py = e.clientY;
    };
    const move = (e: PointerEvent) => {
      const s = st.current;
      if (!s.dragging) return;
      const dx = (e.clientX - s.px) * 0.0055;
      const dy = (e.clientY - s.py) * 0.0045;
      s.dTheta -= dx;
      s.dPhi = Math.max(-0.15, Math.min(1.25, s.dPhi + dy));
      s.theta = s.dTheta;
      s.phi = s.dPhi;
      s.px = e.clientX;
      s.py = e.clientY;
    };
    const up = () => {
      st.current.dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = st.current;
      s.dRadius = Math.max(1.8, Math.min(14, s.dRadius + (e.deltaY > 0 ? 0.5 : -0.5)));
    };
    const ctx = (e: Event) => e.preventDefault();
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("contextmenu", ctx);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("contextmenu", ctx);
    };
  }, [gl]);

  useFrame((_, dt) => {
    const s = st.current;
    if (mode === "auto" && !s.dragging) s.dTheta += dt * 0.14;

    const k = 1 - Math.pow(0.0016, dt); // плавное стремление
    s.theta += (s.dTheta - s.theta) * k;
    s.phi += (s.dPhi - s.phi) * k;
    s.radius += (s.dRadius - s.radius) * k;
    s.target.lerp(s.dTarget, k);

    const cp = Math.cos(s.phi);
    camera.position.set(
      s.target.x + s.radius * cp * Math.sin(s.theta),
      s.target.y + s.radius * Math.sin(s.phi),
      s.target.z + s.radius * cp * Math.cos(s.theta)
    );
    // не даём камере уходить под пол и за стены
    camera.position.y = Math.max(0.35, Math.min(3.1, camera.position.y));
    camera.position.x = Math.max(-5.2, Math.min(5.2, camera.position.x));
    camera.position.z = Math.max(-3.3, Math.min(2.3, camera.position.z));
    camera.lookAt(s.target);
  });

  return null;
}
