type Props = {
  position?: "top" | "bottom";
  className?: string;
};

export default function GradualBlur({ position = "bottom", className = "" }: Props) {
  return (
    <div
      className={`gradual-blur gradual-blur-${position} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
