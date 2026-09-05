import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  step?: number;
};

export default function BlurText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  step = 70,
}: Props) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [settled, setSettled] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    if (!inView) return;

    const duration = 720;
    const last = delay + Math.max(0, words.length - 1) * step + duration;
    const id = window.setTimeout(() => setSettled(true), last);
    return () => window.clearTimeout(id);
  }, [delay, inView, step, words.length]);

  return (
    <Tag className={`blur-text ${className}`.trim()}>
      <span ref={ref} className={`blur-text-track${settled ? " is-settled" : ""}`}>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={`blur-word${inView ? " is-in" : ""}${settled ? " is-settled" : ""}`}
            style={settled ? undefined : { transitionDelay: `${delay + index * step}ms` }}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
