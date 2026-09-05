import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function GlassSurface({ children, className = "" }: Props) {
  return <div className={`glass-surface ${className}`.trim()}>{children}</div>;
}
