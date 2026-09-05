import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  intensity?: "soft" | "full";
};

export default function ScrollExpand({ children, className = "", intensity = "soft" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.setProperty("--expand", "1");
      return;
    }

    const update = () => {
      const rect = node.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const start = view * 0.92;
      const end = view * 0.28;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      node.style.setProperty("--expand", progress.toFixed(3));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={ref} className={`scroll-expand scroll-expand-${intensity} ${className}`.trim()}>
      {children}
    </div>
  );
}
