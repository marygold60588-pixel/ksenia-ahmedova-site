import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function GlareHover({ children, className = "" }: Props) {
  return <div className={`glare-hover ${className}`.trim()}>{children}</div>;
}
