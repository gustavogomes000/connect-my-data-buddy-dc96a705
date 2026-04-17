import { useEffect, useRef } from "react";

interface Props {
  active: boolean;
  bars?: number;
  /** 0..1 — escala a altura das barras conforme o volume */
  intensity?: number;
}

export function AudioVisualizer({ active, bars = 7, intensity = 1 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      Array.from(el.children).forEach((c) => {
        (c as HTMLElement).style.transform = "scaleY(0.08)";
      });
      return;
    }

    const phases = Array.from({ length: bars }, (_, i) => ({
      p1: Math.random() * Math.PI * 2,
      p2: Math.random() * Math.PI * 2,
      p3: Math.random() * Math.PI * 2,
      speed1: 3.5 + i * 0.4,
      speed2: 5.8 + i * 0.6,
      speed3: 8.2 + i * 0.3,
    }));

    const tick = () => {
      const t = performance.now() / 1000;
      const children = el.children;
      const inten = 0.15 + intensityRef.current * 0.85;
      for (let i = 0; i < bars; i++) {
        const p = phases[i];
        const w1 = Math.sin(t * p.speed1 + p.p1) * 0.35;
        const w2 = Math.sin(t * p.speed2 + p.p2) * 0.25;
        const w3 = Math.sin(t * p.speed3 + p.p3) * 0.15;
        const kick = i < 3 ? Math.pow(Math.max(0, Math.sin(t * 2.2 + i)), 4) * 0.3 : 0;
        const raw = 0.2 + Math.abs(w1 + w2 + w3) + kick;
        const scale = Math.min(1, raw * inten);
        const child = children[i] as HTMLElement | undefined;
        if (child) child.style.transform = `scaleY(${Math.max(0.08, scale)})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, bars]);

  return (
    <div
      ref={containerRef}
      className={`audio-viz ${active ? "is-active" : ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
