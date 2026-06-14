import { useEffect, useRef, useCallback } from "react";
import { useStore } from "./store";

// constants
const GRID_SIZE         = 28;
const DOT_RADIUS        = 1.5;
const CURSOR_RADIUS     = 90;
const CURSOR_STRENGTH   = 20;
const BOX_MARGIN        = 14;
const BOX_PUSH_RADIUS   = 80;
const BOX_PUSH_STRENGTH = 20;
const LERP_SPEED        = 0.09;
const FLICKER_CHANCE    = 0.0008;

function getColors(isDark) {
    if (isDark) {
        return {
            base: "rgba(220, 220, 220, 0.13)",
            dim: "rgba(220, 220, 220, 0.04)",
            lit: (t) => {
                const op = 0.13 + 0.18 * Math.min(t * 1.4, 1);
                return `rgba(255, 255, 255, ${op.toFixed(3)})`;
            }
        };
    }
    return {
        base: "rgba(30,28,24,0.13)",
        dim: "rgba(30,28,24,0.04)",
        lit: (t) => {
            const op = 0.13 + 0.18 * Math.min(t * 1.4, 1);
            return `rgba(20,18,14,${op.toFixed(3)})`;
        }
    };
}

// background component
export default function OmoriDotBackground({ boxes = [], style, className }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    dots:  [],
    mouse: { x: -9999, y: -9999 },
    boxes: [],
    dpr:   1,
    w: 0,
    h: 0,
    isDarkMode: false,
  });
  const isDarkMode = useStore(state => state.isDarkMode);
  useEffect(() => {
    stateRef.current.isDarkMode = isDarkMode;
  }, [isDarkMode]);

  const rafRef = useRef(null);

  const buildGrid = useCallback((w, h) => {
    const cols = Math.ceil(w / GRID_SIZE) + 2;
    const rows = Math.ceil(h / GRID_SIZE) + 2;
    const dots = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        dots.push({
          ox: c * GRID_SIZE, oy: r * GRID_SIZE,
          dx: 0, dy: 0, tdx: 0, tdy: 0, flicker: 0,
        });
    return dots;
  }, []);

  // render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = stateRef.current;
    s.dpr = window.devicePixelRatio || 1;

    const resize = () => {
      // Size to the full viewport since we're position:fixed
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width  = w * s.dpr;
      canvas.height = h * s.dpr;
      s.w = w;
      s.h = h;
      s.dots = buildGrid(w, h);
    };

    window.addEventListener("resize", resize);
    resize();

    const ctx = canvas.getContext("2d");

    const tick = () => {
      const colors = getColors(stateRef.current.isDarkMode);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Read node positions straight from the DOM every frame
      // getBoundingClientRect gives us screen coords which match our canvas
      const nodeEls = document.querySelectorAll('.react-flow__node:not(.react-flow__node-drawing)');
      const liveBoxes = [];
      nodeEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        liveBoxes.push({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
      });

      // Sample points along edge paths so links also displace dots
      const edgePaths = document.querySelectorAll('.react-flow__edge-path');
      edgePaths.forEach(path => {
        try {
          const svg = path.ownerSVGElement;
          if (!svg) return;
          const ctm = svg.getScreenCTM();
          if (!ctm) return;
          const totalLen = path.getTotalLength();
          const step = 20;
          for (let d = 0; d <= totalLen; d += step) {
            const pt = path.getPointAtLength(d);
            const sx = pt.x * ctm.a + ctm.e;
            const sy = pt.y * ctm.d + ctm.f;
            liveBoxes.push({ x: sx - 2, y: sy - 2, width: 4, height: 4, isEdge: true });
          }
        } catch (e) { /* skip broken paths */ }
      });

      s.boxes = liveBoxes;

      const { dots, mouse, boxes: bxs, dpr } = s;
      const mx = mouse.x, my = mouse.y;

      for (const dot of dots) {
        // cursor
        const cdx = dot.ox - mx, cdy = dot.oy - my;
        const cd  = Math.sqrt(cdx * cdx + cdy * cdy);
        let cpx = 0, cpy = 0, lit = 0;
        if (cd < CURSOR_RADIUS && cd > 0.5) {
          const t = 1 - cd / CURSOR_RADIUS;
          const f = t * t * CURSOR_STRENGTH;
          cpx = -(cdx / cd) * f;
          cpy = -(cdy / cd) * f;
          lit = t;
        }

        // nodes
        let bpx = 0, bpy = 0, inside = false;
        let maxT = 0;
        for (const b of bxs) {
          const m      = b.isEdge ? 8 : BOX_MARGIN;
          const pushR  = b.isEdge ? 40 : BOX_PUSH_RADIUS;
          const pushS  = b.isEdge ? 12 : BOX_PUSH_STRENGTH;

          const L = b.x - m,   R = b.x + b.width  + m;
          const T = b.y - m,   B = b.y + b.height + m;

          if (dot.ox >= L && dot.ox <= R && dot.oy >= T && dot.oy <= B) {
            inside = true; break;
          }

          const SL = L - pushR, SR = R + pushR;
          const ST = T - pushR, SB = B + pushR;

          if (dot.ox >= SL && dot.ox <= SR && dot.oy >= ST && dot.oy <= SB) {
            const nx  = Math.max(L, Math.min(R, dot.ox));
            const ny  = Math.max(T, Math.min(B, dot.oy));
            const edx = dot.ox - nx, edy = dot.oy - ny;
            const ed  = Math.sqrt(edx * edx + edy * edy) || 0.01;

            const t     = 1 - (ed / pushR);
            if (t > maxT) {
              maxT = t;
              const force = t * t * pushS;
              bpx = (edx / ed) * force;
              bpy = (edy / ed) * force;
            }
          }
        }

        dot.tdx = inside ? 0 : cpx + bpx;
        dot.tdy = inside ? 0 : cpy + bpy;
        dot.dx  += (dot.tdx - dot.dx) * LERP_SPEED;
        dot.dy  += (dot.tdy - dot.dy) * LERP_SPEED;

        if (dot.flicker > 0) dot.flicker--;
        else if (Math.random() < FLICKER_CHANCE)
          dot.flicker = 4 + Math.floor(Math.random() * 8);

        if (inside) continue;

        ctx.beginPath();
        ctx.arc(
          (dot.ox + dot.dx) * dpr,
          (dot.oy + dot.dy) * dpr,
          DOT_RADIUS * dpr, 0, Math.PI * 2
        );
        ctx.fillStyle =
          dot.flicker > 0 ? colors.dim : lit > 0.05 ? colors.lit(lit) : colors.base;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [buildGrid]);

  // mouse tracking
  useEffect(() => {
    const onMove = (e) => {
      stateRef.current.mouse = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      stateRef.current.mouse = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // sync nodes
  useEffect(() => {
    stateRef.current.boxes = boxes;
  }, [boxes]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        display: "block",
        ...style,
      }}
    />
  );
}
