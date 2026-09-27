// نص بيلف على مسار SVG (موجة/دايرة/خط) — منقول من React Bits (TextLoop)
// التعديلات: TypeScript، requestAnimationFrame بدل gsap (كانت بتعمل tween خطي بس)،
// والألوان في style عشان var(--primary) يشتغل، و letterSpacing صفر افتراضياً عشان الحروف العربي ماتتفكش.
"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn.utils";

type Shape = "wave" | "circle" | "infinity" | "arch" | "line";

type TextLoopProps = {
  text: string;
  shape?: Shape;
  /** مسار SVG مخصص في viewBox مقاسه 1200x520 — بيلغي shape */
  path?: string;
  /** وحدة في الثانية على المسار */
  speed?: number;
  direction?: "forward" | "reverse";
  separator?: string;
  curviness?: number;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  uppercase?: boolean;
  color?: string;
  ribbon?: boolean;
  ribbonColor?: string;
  ribbonWidth?: number;
  pauseOnHover?: boolean;
  className?: string;
};

const VIEW_W = 1200;
const VIEW_H = 520;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const EDGE_PAD = 6;

function buildPath(shape: Shape, curviness: number, ribbonWidth: number) {
  const c = Math.max(0, curviness);
  const room = Math.max(20, CY - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);

  switch (shape) {
    case "circle": {
      const r = Math.min(90 + c * 0.95, room);
      return `M ${CX - r} ${CY} A ${r} ${r} 0 1 1 ${CX + r} ${CY} A ${r} ${r} 0 1 1 ${CX - r} ${CY} Z`;
    }
    case "infinity": {
      const r = 150 + c * 1.4;
      const h = Math.min(60 + c * 0.95, room);
      return [
        `M ${CX} ${CY}`,
        `C ${CX + r * 0.55} ${CY - h} ${CX + r} ${CY - h} ${CX + r} ${CY}`,
        `C ${CX + r} ${CY + h} ${CX + r * 0.55} ${CY + h} ${CX} ${CY}`,
        `C ${CX - r * 0.55} ${CY - h} ${CX - r} ${CY - h} ${CX - r} ${CY}`,
        `C ${CX - r} ${CY + h} ${CX - r * 0.55} ${CY + h} ${CX} ${CY}`,
        "Z",
      ].join(" ");
    }
    case "arch": {
      const rise = Math.min(120 + c * 1.1, room * 2);
      return `M 120 ${CY + rise / 2} Q ${CX} ${CY - rise * 1.5} ${VIEW_W - 120} ${CY + rise / 2}`;
    }
    case "line":
      return `M -320 ${CY} L ${VIEW_W + 320} ${CY}`;
    case "wave":
    default: {
      const a = Math.min(c * 2.2, room * 2);
      return `M -320 ${CY} Q -160 ${CY - a} 0 ${CY} T 320 ${CY} T 640 ${CY} T 960 ${CY} T 1280 ${CY} T ${VIEW_W + 320} ${CY}`;
    }
  }
}

function TextLoop({
  text,
  shape = "wave",
  path,
  speed = 90,
  direction = "forward",
  separator = "✦",
  curviness = 90,
  fontSize = 46,
  fontWeight = 800,
  letterSpacing = 0,
  uppercase = false,
  color = "var(--primary-foreground)",
  ribbon = true,
  ribbonColor = "var(--primary)",
  ribbonWidth = 86,
  pauseOnHover = true,
  className,
}: TextLoopProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const headRef = useRef<SVGTextPathElement>(null);
  const tailRef = useRef<SVGTextPathElement>(null);

  const [metrics, setMetrics] = useState({ length: 0, reps: 1 });

  const pathId = `text-loop-${useId().replace(/:/g, "")}`;
  const d = useMemo(() => path || buildPath(shape, curviness, ribbonWidth), [path, shape, curviness, ribbonWidth]);

  const unit = useMemo(() => {
    const base = uppercase ? text.toUpperCase() : text;
    const gap = separator ? ` ${separator} ` : "   ";
    return `${base}${gap}`;
  }, [text, separator, uppercase]);

  // direction ltr: في صفحة rtl الكروم بيرسم النص من آخر المسار فبيطلع برّه. الـ bidi لسه بيقلب الكلام العربي صح
  const textStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      fontWeight,
      letterSpacing: `${letterSpacing}px`,
      fill: color,
      direction: "ltr" as const,
    }),
    [fontSize, fontWeight, letterSpacing, color],
  );

  // كام نسخة من الجملة تغطي المسار بالظبط — بيتقاس تاني بعد ما الخط يحمّل
  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    const measureEl = measureRef.current;
    if (!pathEl || !measureEl) return;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const length = pathEl.getTotalLength();
      const unitWidth = measureEl.getComputedTextLength();
      if (!length) return;
      const reps = unitWidth > 0 ? Math.max(1, Math.round(length / unitWidth)) : 1;
      setMetrics((prev) => (prev.length === length && prev.reps === reps ? prev : { length, reps }));
    };

    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [d, unit, fontSize, fontWeight, letterSpacing]);

  // نسختين ورا بعض على نفس المسار: لما واحدة تخرج من الآخر التانية داخلة من الأول
  useEffect(() => {
    const { length } = metrics;
    const head = headRef.current;
    const tail = tailRef.current;
    const root = rootRef.current;
    if (!head || !tail || !root || !length) return;

    const apply = (offset: number) => {
      head.setAttribute("startOffset", String(offset));
      tail.setAttribute("startOffset", String(offset >= 0 ? offset - length : offset + length));
    };
    apply(0);

    if (speed <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sign = direction === "reverse" ? -1 : 1;
    let offset = 0;
    let last = performance.now();
    let paused = false;
    let raf = 0;

    const tick = (now: number) => {
      if (!paused) {
        offset = (offset + (sign * speed * (now - last)) / 1000) % length;
        apply(offset);
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pause = () => (paused = true);
    const resume = () => (paused = false);
    if (pauseOnHover) {
      root.addEventListener("pointerenter", pause);
      root.addEventListener("pointerleave", resume);
    }

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerenter", pause);
      root.removeEventListener("pointerleave", resume);
    };
  }, [metrics, speed, direction, pauseOnHover]);

  const loopText = unit.repeat(metrics.reps);
  const fitLength = metrics.length || undefined;

  return (
    <div ref={rootRef} className={cn("relative w-full overflow-hidden", className)}>
      <svg
        className="block h-auto w-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={text}
      >
        <path
          ref={pathRef}
          id={pathId}
          d={d}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: ribbon ? ribbonColor : "none", strokeWidth: ribbon ? ribbonWidth : 0 }}
        />

        <text ref={measureRef} className="invisible pointer-events-none" style={textStyle} aria-hidden>
          {unit}
        </text>

        {/* spacingAndGlyphs بدل spacing: بيمط الحروف نفسها بدل ما يفرّق بينها، فالعربي يفضل متشبّك */}
        <text
          className="select-none"
          style={textStyle}
          dominantBaseline="central"
          aria-hidden
          textLength={fitLength}
          lengthAdjust="spacingAndGlyphs"
        >
          <textPath ref={headRef} href={`#${pathId}`} startOffset={0}>
            {loopText}
          </textPath>
        </text>
        <text
          className="select-none"
          style={textStyle}
          dominantBaseline="central"
          aria-hidden
          textLength={fitLength}
          lengthAdjust="spacingAndGlyphs"
        >
          <textPath ref={tailRef} href={`#${pathId}`} startOffset={0}>
            {loopText}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

export { TextLoop };
