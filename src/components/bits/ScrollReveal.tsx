import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
};

function revealClass(inView: boolean, className: string) {
  return `scroll-reveal ${inView ? "is-in" : ""} ${className}`.trim();
}

function revealStyle(delay: number): CSSProperties | undefined {
  return delay ? { transitionDelay: `${delay}ms` } : undefined;
}

export default function ScrollReveal({ children, className = "", delay = 0, as = "div" }: Props) {
  if (as === "li") {
    return (
      <LiReveal className={className} delay={delay}>
        {children}
      </LiReveal>
    );
  }

  return (
    <DivReveal className={className} delay={delay}>
      {children}
    </DivReveal>
  );
}

function LiReveal({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className: string;
  delay: number;
}) {
  const { ref, inView } = useInView<HTMLLIElement>();
  return (
    <li ref={ref} className={revealClass(inView, className)} style={revealStyle(delay)}>
      {children}
    </li>
  );
}

function DivReveal({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className: string;
  delay: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={revealClass(inView, className)} style={revealStyle(delay)}>
      {children}
    </div>
  );
}
