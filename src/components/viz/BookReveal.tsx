import { useEffect, useRef, type PointerEvent } from "react";
import { assetUrl } from "@/lib/asset";

type Props = {
  open: boolean;
};

export default function BookReveal({ open }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    node.style.setProperty("--look-x", "0deg");
    node.style.setProperty("--look-y", "0deg");
  }, [open]);

  const look = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (open) return;
    const node = rootRef.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    node.style.setProperty("--look-x", `${x * 5}deg`);
    node.style.setProperty("--look-y", `${y * -3}deg`);
  };

  const rest = () => {
    const node = rootRef.current;
    if (!node) return;
    node.style.setProperty("--look-x", "0deg");
    node.style.setProperty("--look-y", "0deg");
  };

  return (
    <div
      ref={rootRef}
      className={`book-reveal ${open ? "is-open" : ""}`.trim()}
      onPointerMove={look}
      onPointerLeave={rest}
    >
      <div className="book-idle">
        <div className="book-look">
          <div className="book-stage">
            <span className="book-shadow" />
            <img
              className="book-shot book-shot-open"
              src={assetUrl("/media/book/atlas-open.png")}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{ zIndex: open ? 2 : 1, opacity: open ? 1 : 0 }}
            />
            <img
              className="book-shot book-shot-closed"
              src={assetUrl("/media/book/atlas-closed.png")}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{ zIndex: open ? 1 : 2, opacity: open ? 0 : 1 }}
            />
            <span className="book-glint" />
            <span className="book-gutter" />
            <span className="book-light" />
          </div>
        </div>
      </div>
    </div>
  );
}
