import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost" | "light";
  className?: string;
};

export default function Button({ href, children, variant = "solid", className = "" }: Props) {
  return (
    <a className={`btn btn-${variant} ${className}`.trim()} href={href}>
      {children}
    </a>
  );
}
