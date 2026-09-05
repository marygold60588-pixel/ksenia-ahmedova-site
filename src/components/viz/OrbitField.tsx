import { useEffect, useRef } from "react";

type Props = {
  tone?: "milk" | "night";
  className?: string;
};

const PERIOD_MS = 34000;

export default function OrbitField({ tone = "milk", className = "" }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const markRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const mark = markRef.current;
    if (!path || !mark) return;

    const length = path.getTotalLength();
    const place = (unit: number) => {
      const point = path.getPointAtLength(unit * length);
      mark.setAttribute("cx", String(point.x));
      mark.setAttribute("cy", String(point.y));
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      place(0);
      return;
    }

    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      place(((now - started) / PERIOD_MS) % 1);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`orbit-field is-${tone} ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 480 300" fill="none">
        <title>Карта поворота взгляда</title>
        <defs>
          <filter id="orbit-paper" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="4" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.40  0 0 0 0 0.34  0 0 0 0 0.24  0 0 0 0.09 0"
              result="grain"
            />
            <feBlend in="grain" in2="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
        <rect className="orbit-plate" x="18" y="16" width="444" height="268" />
        <rect className="orbit-plate orbit-wash" x="28" y="26" width="424" height="248" filter="url(#orbit-paper)" />

        <path className="orbit-guide" d="M28 38 V26 H40" />
        <path className="orbit-guide" d="M452 38 V26 H440" />
        <path className="orbit-guide" d="M28 262 V274 H40" />
        <path className="orbit-guide" d="M452 262 V274 H440" />

        <path
          ref={pathRef}
          className="orbit-path"
          d="M107 180 C128 142 148 96 236 92 C290 90 372 108 390 164 C408 214 330 258 248 246 C168 236 96 220 107 180"
        />
        <path className="orbit-gaze" d="M416 48 Q 348 40 236 92" />
        <circle className="orbit-home" cx="236" cy="92" r="2.2" />
        <circle className="orbit-core" cx="416" cy="48" r="2" />
        <circle ref={markRef} className="orbit-mark" r="1.9" cx="107" cy="180" />
      </svg>
    </div>
  );
}
