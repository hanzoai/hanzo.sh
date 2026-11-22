import { useEffect, useRef, type RefObject } from "react";

/**
 * Organic 3D topological wave dot-matrix with normal-mapped Blinn-Phong cursor
 * gleam (matching hanzo.ai's Hero halftone topology).
 */
export function TopologyDots({
  host,
  drift = true,
}: {
  host: RefObject<HTMLElement | null>;
  drift?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const el = host.current;
    if (!cv || !el) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    const G = 10;
    const R = 255;
    const Z_SCALE = 68;
    const LIGHT_Z = 108;
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqDark = window.matchMedia("(prefers-color-scheme: dark)");
    const calm = mqMotion.matches;
    const animateField = drift && !calm;
    const t0 = performance.now();

    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let vis = true;
    let tx = -1e4;
    let ty = -1e4;
    let lx = -1e4;
    let ly = -1e4;
    let inside = false;
    let energy = 0;
    let boost = 0;
    let rgb = "10,10,10";

    const ambientAlphas = [0.095, 0.175, 0.265];
    const gleamAlphas = [0.35, 0.47, 0.59, 0.71, 0.83, 0.94];
    let ambientStyles = ambientAlphas.map((a) => `rgba(${rgb},${a})`);
    let gleamStyles = gleamAlphas.map((a) => `rgba(${rgb},${a})`);

    const tone = () => {
      const m = getComputedStyle(cv).color.match(/[\d.]+/g) || ["10", "10", "10"];
      rgb = `${m[0]},${m[1]},${m[2]}`;
      ambientStyles = ambientAlphas.map((a) => `rgba(${rgb},${a})`);
      gleamStyles = gleamAlphas.map((a) => `rgba(${rgb},${a})`);
    };
    tone();

    const amb: number[][] = [[], [], []];
    const glm: number[][] = [[], [], [], [], [], []];

    const draw = (now = performance.now()) => {
      const t = animateField ? (now - t0) * 0.00055 : 0;
      cx.clearRect(0, 0, W, H);
      for (let b = 0; b < 3; b++) amb[b].length = 0;
      for (let b = 0; b < 6; b++) glm[b].length = 0;

      const gx1 = W * (0.18 + 0.07 * Math.sin(t * 0.52));
      const gy1 = H * (0.48 + 0.14 * Math.cos(t * 0.41));
      const gx2 = W * (0.82 + 0.07 * Math.cos(t * 0.47));
      const gy2 = H * (0.52 + 0.14 * Math.sin(t * 0.37));
      const invH = 1 / Math.max(1, H);
      const wLeft = Math.max(1, W * 0.3);
      const wRight = Math.max(1, W * 0.34);
      const lit = energy > 0.01 && lx > -5e3;
      const r2Max = R * R;

      for (let j = 0; j < rows; j++) {
        const y = j * G;
        const rawEy = 0.3 + y * invH * 0.95;
        const ey = rawEy < 1 ? rawEy : 1;
        const dey = rawEy < 1 ? invH * 0.95 : 0;

        for (let i = 0; i < cols; i++) {
          const x = i * G;
          const leftRamp = 1 - x / wLeft;
          const rightRamp = (x - W * 0.66) / wRight;
          let ex = 0.14;
          let dex = 0;
          if (leftRamp >= rightRamp && leftRamp > 0.14) {
            ex = leftRamp;
            dex = -1 / wLeft;
          } else if (rightRamp > 0.14) {
            ex = rightRamp;
            dex = 1 / wRight;
          }

          const p1 = x * 0.012 + y * 0.006 - t * 1.25;
          const p2 = y * 0.014 - x * 0.005 + t * 0.9;
          const p3 = (x + y) * 0.007 + t * 0.65;
          const w1 = Math.sin(p1);
          const c1 = Math.cos(p1);
          const w2 = Math.cos(p2);
          const s2 = Math.sin(p2);
          const w3 = Math.sin(p3);
          const c3 = Math.cos(p3);
          const wave = w1 * w2 * 0.65 + w3 * 0.35;
          const dwx = 0.65 * (0.012 * c1 * w2 + w1 * 0.005 * s2) + 0.35 * 0.007 * c3;
          const dwy = 0.65 * (0.006 * c1 * w2 - w1 * 0.014 * s2) + 0.35 * 0.007 * c3;

          const n = 0.56 + 0.44 * wave;
          const dnx = 0.44 * dwx;
          const dny = 0.44 * dwy;

          let f = ex * ey * n * 1.3;
          let dfx = (dex * ey * n + ex * ey * dnx) * 1.3;
          let dfy = (ex * dey * n + ex * ey * dny) * 1.3;

          const dx1 = x - gx1;
          const dy1 = y - gy1;
          const d1Sq = dx1 * dx1 + dy1 * dy1;
          if (d1Sq < 57600) {
            const d1 = Math.sqrt(d1Sq) || 1;
            const k1 = 1 - d1 / 240;
            f += k1 * k1 * 0.28;
            const gSlope = (-0.56 * k1) / (240 * d1);
            dfx += gSlope * dx1;
            dfy += gSlope * dy1;
          }
          const dx2 = x - gx2;
          const dy2 = y - gy2;
          const d2Sq = dx2 * dx2 + dy2 * dy2;
          if (d2Sq < 57600) {
            const d2 = Math.sqrt(d2Sq) || 1;
            const k2 = 1 - d2 / 240;
            f += k2 * k2 * 0.28;
            const gSlope = (-0.56 * k2) / (240 * d2);
            dfx += gSlope * dx2;
            dfy += gSlope * dy2;
          }

          const z = f < 0 ? 0 : f > 1 ? 1 : f;
          if (z < 0.05) continue;

          const sx = -dfx * Z_SCALE;
          const sy = -dfy * Z_SCALE;
          const invN = 1 / Math.sqrt(sx * sx + sy * sy + 1);
          const nx = sx * invN;
          const ny = sy * invN;
          const nz = invN;

          let drawX = x + nx * z * 2.6;
          let drawY = y + ny * z * 2.6;
          let r = z * G * 0.39;
          let gleamBucket = -1;

          if (lit) {
            const vx = lx - x;
            const vy = ly - y;
            const dSq = vx * vx + vy * vy;
            if (dSq < r2Max) {
              const dist2 = Math.sqrt(dSq);
              const falloff = 1 - dist2 / R;
              const atten = falloff * falloff * (3 - 2 * falloff);

              const vz = LIGHT_Z - z * 44;
              const invL = 1 / Math.sqrt(dSq + vz * vz);
              const ldx = vx * invL;
              const ldy = vy * invL;
              const ldz = vz * invL;

              const ndotl = Math.max(0, nx * ldx + ny * ldy + nz * ldz);
              const hzf = ldz + 1;
              const invHalf = 1 / Math.sqrt(ldx * ldx + ldy * ldy + hzf * hzf);
              const ndoth = Math.max(0, (nx * ldx + ny * ldy + nz * hzf) * invHalf);
              const ndoth2 = ndoth * ndoth;
              const ndoth4 = ndoth2 * ndoth2;
              const spec = ndoth4 * ndoth4 * ndoth4;

              const crestFactor = Math.max(0.06, Math.min(1, (wave + 0.72) * 0.68)) * (0.2 + 0.8 * z);
              const gleam = atten * energy * crestFactor * (0.42 * ndotl + 1.05 * spec);

              const reliefLift = gleam * (0.35 + 0.65 * z);
              r = Math.min(G * 0.49, r + reliefLift * G * 0.18);
              drawX -= (vx / R) * z * 2.4 * atten * energy;
              drawY -= (vy / R) * z * 2.4 * atten * energy;

              if (gleam > 0.07) {
                gleamBucket = Math.min(5, Math.floor((gleam - 0.07) * 7.2));
              }
            }
          }

          if (gleamBucket >= 0) {
            glm[gleamBucket].push(drawX, drawY, r);
          } else {
            const ab = z < 0.28 ? 0 : z < 0.56 ? 1 : 2;
            amb[ab].push(drawX, drawY, r);
          }
        }
      }

      for (let b = 0; b < 3; b++) {
        const arr = amb[b];
        if (!arr.length) continue;
        cx.fillStyle = ambientStyles[b];
        cx.beginPath();
        for (let k = 0; k < arr.length; k += 3) {
          const dx = arr[k];
          const dy = arr[k + 1];
          const dr = arr[k + 2];
          cx.moveTo(dx + dr, dy);
          cx.arc(dx, dy, dr, 0, 6.2832);
        }
        cx.fill();
      }
      for (let b = 0; b < 6; b++) {
        const arr = glm[b];
        if (!arr.length) continue;
        cx.fillStyle = gleamStyles[b];
        cx.beginPath();
        for (let k = 0; k < arr.length; k += 3) {
          const dx = arr[k];
          const dy = arr[k + 1];
          const dr = arr[k + 2];
          cx.moveTo(dx + dr, dy);
          cx.arc(dx, dy, dr, 0, 6.2832);
        }
        cx.fill();
      }
    };

    const tick = (now: number) => {
      boost *= 0.9;
      const target = inside ? Math.min(1, 0.72 + boost * 0.28) : 0;
      energy += (target - energy) * (inside ? 0.18 : 0.08);
      if (lx < -5e3 && tx > -5e3) {
        lx = tx;
        ly = ty;
      } else if (tx > -5e3) {
        lx += (tx - lx) * 0.28;
        ly += (ty - ly) * 0.28;
      }
      draw(now);
      raf = (animateField || energy > 0.01 || inside) && vis ? requestAnimationFrame(tick) : 0;
    };

    const startLoop = () => {
      if (!raf && vis && (animateField || energy > 0.01 || inside)) {
        raf = requestAnimationFrame(tick);
      }
    };

    const size = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / G) + 1;
      rows = Math.ceil(H / G) + 1;
      draw(performance.now());
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const r = cv.getBoundingClientRect();
      const nx = e.clientX - r.left;
      const ny = e.clientY - r.top;
      if (tx > -5e3) {
        const v = Math.hypot(nx - tx, ny - ty);
        boost = Math.min(1, boost + v * 0.025);
      } else {
        lx = nx;
        ly = ny;
        boost = 0.6;
      }
      tx = nx;
      ty = ny;
      inside = true;
      if (calm) {
        energy = 0.85;
        lx = nx;
        ly = ny;
        draw(performance.now());
      } else {
        startLoop();
      }
    };

    const leave = () => {
      inside = false;
      if (calm) {
        energy = 0;
        draw(performance.now());
      } else {
        startLoop();
      }
    };

    const onScheme = () => {
      tone();
      draw(performance.now());
    };

    size();
    startLoop();
    const io = new IntersectionObserver(([en]) => {
      vis = en.isIntersecting;
      if (vis) startLoop();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(cv);
    const ro = new ResizeObserver(size);
    ro.observe(el);
    el.addEventListener("pointerenter", move);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    mqDark.addEventListener("change", onScheme);
    const mo = new MutationObserver(onScheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      mqDark.removeEventListener("change", onScheme);
      el.removeEventListener("pointerenter", move);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [host, drift]);

  return <canvas ref={ref} className="hz-dots" aria-hidden="true" />;
}
