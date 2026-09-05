import { assetUrl } from "@/lib/asset";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export default function Portrait({ src, alt, className = "" }: Props) {
  return (
    <figure className={`portrait ${className}`.trim()}>
      <img src={assetUrl(src)} alt={alt} loading="lazy" decoding="async" />
    </figure>
  );
}
