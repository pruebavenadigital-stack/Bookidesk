/**
 * Helpers de animación por tiempo, equivalentes al runtime del diseño de la
 * intro (Stage/useTime/Easing/animate/interpolate). Deterministas: todo es
 * función del tiempo `t` en segundos.
 */

export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

type Ease = (t: number) => number;

/** Interpola de `from` a `to` mientras t recorre [start, end], con easing. */
export function animate(opts: {
  from: number;
  to: number;
  start: number;
  end: number;
  ease?: Ease;
}) {
  const { from, to, start, end, ease = Easing.linear } = opts;
  return (t: number) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const p = ease((t - start) / (end - start));
    return from + (to - from) * p;
  };
}

/** Interpolación por tramos entre keyframes de tiempo/valor. */
export function interpolate(times: number[], values: number[], ease?: Ease) {
  const e = ease ?? Easing.linear;
  return (t: number) => {
    if (t <= times[0]) return values[0];
    const last = times.length - 1;
    if (t >= times[last]) return values[last];
    for (let i = 0; i < last; i++) {
      if (t >= times[i] && t <= times[i + 1]) {
        const p = e((t - times[i]) / (times[i + 1] - times[i]));
        return values[i] + (values[i + 1] - values[i]) * p;
      }
    }
    return values[last];
  };
}
