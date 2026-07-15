"use client";

import { useEffect, useRef, useState } from "react";
import { Easing, animate, interpolate } from "@/lib/anim";

/* ===== Constantes del diseño (1080×1920, 3.5 s) ===== */
const STAGE_W = 1080;
const STAGE_H = 1920;
const DURATION = 3.5;

const U = 7;
const BOOK = 96 * U; // 672
const BOOK_LEFT = (STAGE_W - BOOK) / 2;
const BOOK_TOP = 624;

const C = {
  cover: "#722033",
  spine: "#4d1322",
  gold: "#d4a94e",
  cream: "#f2e7cf",
  pageEdge: "#d9c49a",
  ink: "#331016",
  lens: "#23374d",
};

const ROWS: [number, number][] = [
  [24, 36],
  [31, 42],
  [38, 26],
  [45, 40],
  [52, 44],
  [59, 30],
  [73, 34],
];

const SPARKS = [
  { x: 60, y: 110, d: 0 },
  { x: 590, y: 80, d: 0.06 },
  { x: 20, y: 500, d: 0.12 },
  { x: 630, y: 545, d: 0.03 },
  { x: 330, y: -50, d: 0.09 },
];

const svgStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
};

function Pages() {
  return (
    <svg viewBox="0 0 96 96" width={BOOK} height={BOOK} style={svgStyle}>
      <rect x="22" y="14" width="62" height="72" rx="8" fill={C.cream} stroke={C.ink} strokeWidth="3" />
      <line x1="78" y1="21" x2="78" y2="79" stroke={C.pageEdge} strokeWidth="2" />
      <line x1="81.5" y1="23" x2="81.5" y2="77" stroke={C.pageEdge} strokeWidth="2" />
    </svg>
  );
}

function RowsOverlay({ beamU }: { beamU: number }) {
  return (
    <svg viewBox="0 0 96 96" width={BOOK} height={BOOK} style={svgStyle}>
      {ROWS.map(([y, w], i) => {
        const lit = beamU > y + 2;
        return (
          <rect
            key={i}
            x="32"
            y={y}
            width={w}
            height="3"
            rx="1.5"
            fill={lit ? C.gold : "#ddc9a1"}
            opacity={lit ? 0.95 : 0.8}
          />
        );
      })}
    </svg>
  );
}

function CoverOuter() {
  return (
    <svg viewBox="0 0 96 96" width={BOOK} height={BOOK} style={svgStyle}>
      <rect x="12" y="8" width="64" height="74" rx="10" fill={C.cover} stroke={C.ink} strokeWidth="3" />
      <path d="M13.5 18 A8.5 8.5 0 0 1 22 9.5 L28 9.5 L28 80.5 L22 80.5 A8.5 8.5 0 0 1 13.5 72 Z" fill={C.spine} />
      <rect x="13.5" y="24" width="14.5" height="5" fill={C.gold} />
      <rect x="13.5" y="62" width="14.5" height="5" fill={C.gold} />
    </svg>
  );
}

function CoverInner() {
  return (
    <svg viewBox="0 0 96 96" width={BOOK} height={BOOK} style={svgStyle}>
      <rect x="12" y="8" width="64" height="74" rx="10" fill={C.spine} stroke={C.ink} strokeWidth="3" />
      <rect x="19" y="15" width="50" height="60" rx="5" fill="none" stroke="rgba(242,231,207,0.22)" strokeWidth="1.5" />
    </svg>
  );
}

function Lens({ ringR, ringOp }: { ringR: number; ringOp: number | null }) {
  return (
    <svg viewBox="0 0 96 96" width={BOOK} height={BOOK} style={svgStyle}>
      {ringOp != null && (
        <circle cx="54" cy="38" r={ringR} fill="none" stroke={C.gold} strokeWidth="2.5" opacity={ringOp} />
      )}
      <circle cx="54" cy="38" r="16" fill={C.gold} stroke={C.ink} strokeWidth="3" />
      <circle cx="54" cy="38" r="10" fill={C.lens} />
      <circle cx="58" cy="34" r="3.5" fill={C.cream} opacity="0.9" />
    </svg>
  );
}

function Dots({ t }: { t: number }) {
  const specs: [number, string, number, number][] = [
    [44, C.gold, 1, 1.66],
    [54, C.cream, 0.85, 1.76],
    [64, C.cream, 0.45, 1.86],
  ];
  return (
    <svg viewBox="0 0 96 96" width={BOOK} height={BOOK} style={svgStyle}>
      {specs.map(([cx, fill, op, t0], i) => {
        const s = animate({ from: 0, to: 1, start: t0, end: t0 + 0.18, ease: Easing.easeOutBack })(t);
        return (
          <g key={i} transform={`translate(${cx} 68) scale(${Math.max(s, 0)}) translate(${-cx} -68)`}>
            <circle cx={cx} cy="68" r="3" fill={fill} opacity={op} />
          </g>
        );
      })}
    </svg>
  );
}

function Beam({ beamU }: { beamU: number }) {
  const top = (beamU - 14) * U;
  return (
    <div
      style={{
        position: "absolute",
        left: 22 * U,
        top: 14 * U,
        width: 62 * U,
        height: 72 * U,
        borderRadius: 8 * U,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: top - 70,
          height: 140,
          background:
            "linear-gradient(180deg, rgba(212,169,78,0) 0%, rgba(212,169,78,0.32) 50%, rgba(212,169,78,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: top - 2,
          height: 4,
          background: "rgba(212,169,78,0.9)",
          boxShadow: "0 0 18px 4px rgba(212,169,78,0.55)",
        }}
      />
    </div>
  );
}

function IntroScene({ t }: { t: number }) {
  // Entrada: caída + rebote (squash & stretch)
  const fallY = animate({ from: -1500, to: 0, start: 0, end: 0.45, ease: Easing.easeInQuad })(t);
  const hopY = t > 0.45 && t < 0.72 ? -80 * Math.sin((Math.PI * (t - 0.45)) / 0.27) : 0;
  const p1 = interpolate([0.45, 0.53, 0.68], [0, 1, 0], Easing.easeOutQuad)(t);
  const p2 = interpolate([0.72, 0.78, 0.9], [0, 1, 0])(t);
  const p3 = interpolate([2.3, 2.38, 2.54], [0, 1, 0])(t);
  const scaleX = 1 + 0.12 * p1 + 0.04 * p2 + 0.07 * p3;
  const scaleY = 1 - 0.16 * p1 - 0.05 * p2 - 0.09 * p3;

  const entRot = animate({ from: -7, to: 0, start: 0.05, end: 0.5, ease: Easing.easeOutQuad })(t);
  const lean = interpolate([0.75, 0.85, 1.0], [0, -3, 0], Easing.easeInOutQuad)(t);
  const wiggle = interpolate([2.3, 2.42, 2.56, 2.7], [0, -2.2, 1.2, 0], Easing.easeInOutQuad)(t);
  const rotZ = entRot + lean + wiggle;

  const rot =
    t < 1.7
      ? animate({ from: 0, to: -165, start: 0.85, end: 1.28, ease: Easing.easeOutBack })(t)
      : animate({ from: -165, to: 0, start: 2.05, end: 2.3, ease: Easing.easeInCubic })(t);

  const beamU = animate({ from: 8, to: 92, start: 1.42, end: 1.88, ease: Easing.easeInOutQuad })(t);
  const lensPop = animate({ from: 0, to: 1, start: 1.05, end: 1.3, ease: Easing.easeOutBack })(t);
  const lensPulse = interpolate([1.92, 2.0, 2.14], [0, 1, 0], Easing.easeInOutQuad)(t);
  const lensS = Math.max(lensPop, 0) * (1 + 0.1 * lensPulse);
  const ringP = animate({ from: 0, to: 1, start: 1.95, end: 2.22, ease: Easing.easeOutQuad })(t);

  const endScale = animate({ from: 1, to: 0.86, start: 2.5, end: 2.92, ease: Easing.easeInOutCubic })(t);
  const endY = animate({ from: 0, to: -90, start: 2.5, end: 2.92, ease: Easing.easeInOutCubic })(t);
  const floatY = t > 2.92 ? 4 * Math.sin((t - 2.92) * 3.2) : 0;

  const wS = animate({ from: 0.3, to: 1, start: 2.6, end: 2.94, ease: Easing.easeOutBack })(t);
  const wO = animate({ from: 0, to: 1, start: 2.6, end: 2.76, ease: Easing.easeOutQuad })(t);

  const glowOp = animate({ from: 0.15, to: 0.9, start: 0.9, end: 2.4, ease: Easing.easeInOutQuad })(t);
  const glowS = 1 + 0.04 * Math.sin(t * 2.1);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* halo dorado */}
      <div
        style={{
          position: "absolute",
          left: 540 - 680,
          top: 890 - 680,
          width: 1360,
          height: 1360,
          borderRadius: "50%",
          opacity: glowOp,
          transform: `scale(${glowS})`,
          background:
            "radial-gradient(circle, rgba(212,169,78,0.14) 0%, rgba(212,169,78,0) 62%)",
        }}
      />

      {/* libro */}
      <div
        style={{
          position: "absolute",
          left: BOOK_LEFT,
          top: BOOK_TOP,
          width: BOOK,
          height: BOOK,
          transform: `translateY(${endY + floatY}px) scale(${endScale})`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${fallY + hopY}px)` }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "50% 100%",
              transform: `scale(${scaleX}, ${scaleY}) rotate(${rotZ}deg)`,
              perspective: 2400,
            }}
          >
            <Pages />
            <RowsOverlay beamU={beamU} />
            {t > 1.35 && t < 2.02 && <Beam beamU={beamU} />}

            {/* pasta con dos caras */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transformStyle: "preserve-3d",
                transformOrigin: `${12.5 * U}px 50%`,
                transform: `rotateY(${rot}deg)`,
              }}
            >
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
                <CoverOuter />
              </div>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <CoverInner />
              </div>
            </div>

            {/* lente */}
            {t > 1.05 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transformOrigin: `${54 * U}px ${38 * U}px`,
                  transform: `scale(${lensS})`,
                }}
              >
                <Lens ringR={16 + 20 * ringP} ringOp={t > 1.95 && t < 2.22 ? (1 - ringP) * 0.8 : null} />
              </div>
            )}

            {t > 1.6 && <Dots t={t} />}
          </div>
        </div>

        {/* chispas al cerrar */}
        {t > 2.3 &&
          t < 2.85 &&
          SPARKS.map((s, i) => {
            const b = 2.32 + s.d;
            const pp = interpolate([b, b + 0.12, b + 0.36], [0, 1, 0], Easing.easeOutQuad)(t);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: s.x,
                  top: s.y,
                  width: 24,
                  height: 24,
                  background: C.gold,
                  borderRadius: 3,
                  transform: `rotate(${45 + 130 * (t - b)}deg) scale(${Math.max(pp, 0)})`,
                }}
              />
            );
          })}
      </div>

      {/* wordmark */}
      {t > 2.58 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1170,
            textAlign: "center",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 700,
            fontSize: 124,
            letterSpacing: "-0.02em",
            color: C.cream,
            opacity: wO,
            transform: `scale(${wS})`,
          }}
        >
          Booki<span style={{ color: C.gold }}>Desk</span>
        </div>
      )}
    </div>
  );
}

/**
 * Splash animado de bienvenida (3.5 s). Se reproduce una vez.
 * onDone se llama al terminar (o al saltar / con reduce-motion).
 */
export function BookiIntro({ onDone }: { onDone: () => void }) {
  const [t, setT] = useState(0);
  const [scale, setScale] = useState(0.3);
  const [leaving, setLeaving] = useState(false);
  const raf = useRef<number | null>(null);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    window.setTimeout(onDone, 420);
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      finish();
      return;
    }

    const fit = () =>
      setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    fit();
    window.addEventListener("resize", fit);

    const startAt = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startAt) / 1000;
      setT(elapsed);
      if (elapsed >= DURATION) {
        finish();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Saltar animación de bienvenida"
      onClick={finish}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") finish();
      }}
      className="fixed inset-0 z-[100] overflow-hidden transition-opacity duration-500"
      style={{ background: "#1d0a0f", opacity: leaving ? 0 : 1 }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <IntroScene t={t} />
      </div>
    </div>
  );
}
