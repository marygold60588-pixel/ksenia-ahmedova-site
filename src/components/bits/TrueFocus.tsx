import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

type Props = {
  words: string[];
  className?: string;
};

export default function TrueFocus({ words, className = "" }: Props) {
  const { ref, inView } = useInView<HTMLParagraphElement>();
  const [sharpCount, setSharpCount] = useState(0);

  useEffect(() => {
    if (!inView || words.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSharpCount(words.length);
      return;
    }

    setSharpCount(0);
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setSharpCount(index);
      if (index >= words.length) window.clearInterval(id);
    }, 420);

    return () => window.clearInterval(id);
  }, [inView, words.length]);

  const done = sharpCount >= words.length;

  return (
    <p ref={ref} className={`true-focus${done ? " is-done" : ""} ${className}`.trim()}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className={index < sharpCount || done ? "is-sharp" : ""}>
          {word}
        </span>
      ))}
    </p>
  );
}
