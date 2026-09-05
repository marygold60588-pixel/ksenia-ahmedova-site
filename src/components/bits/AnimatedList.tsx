import { useInView } from "@/hooks/useInView";

type Item = {
  title: string;
  note: string;
};

type Props = {
  items: Item[];
  className?: string;
};

export default function AnimatedList({ items, className = "" }: Props) {
  const { ref, inView } = useInView<HTMLOListElement>({ threshold: 0.12 });

  return (
    <ol ref={ref} className={`animated-list ${inView ? "is-in" : ""} ${className}`.trim()}>
      {items.map((item, index) => (
        <li key={item.title} style={{ transitionDelay: `${index * 90}ms` }}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.note}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
