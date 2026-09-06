import AnimatedList from "@/components/bits/AnimatedList";
import BlurText from "@/components/bits/BlurText";
import GradualBlur from "@/components/bits/GradualBlur";
import ScrollExpand from "@/components/bits/ScrollExpand";
import ScrollReveal from "@/components/bits/ScrollReveal";
import Button from "@/components/ui/Button";
import { formatPrice, getProduct } from "@/content";
import { assetUrl } from "@/lib/asset";

export default function Diagnosis() {
  const product = getProduct("relationship-script-diagnosis");

  if (!product || product.status === "hidden") return null;

  const price = formatPrice(product.price, product.currency);

  return (
    <section className="section diagnosis" id="diagnosis">
      <div className="diagnosis-object">
        <div className="diagnosis-panel">
          <div className="diagnosis-intro">
            <p className="kicker">{product.kicker}</p>
            <BlurText text={product.name} as="h2" className="section-title" />
            <p className="diagnosis-tagline">{product.tagline}</p>
            <ScrollReveal>
              <p className="section-lead">{product.description}</p>
            </ScrollReveal>
            {price ? <p className="diagnosis-price">{price}</p> : null}
            <Button href={product.href}>{product.cta}</Button>
          </div>

          <ScrollExpand className="diagnosis-photo" intensity="soft">
            <figure>
              <img src={assetUrl(product.image)} alt="Ксения Ахмедова с блокнотом" loading="lazy" decoding="async" />
              <GradualBlur />
            </figure>
          </ScrollExpand>

          {product.result ? (
            <div className="result-pair">
              <blockquote>
                <span>Было</span>
                <p>{product.result.before}</p>
              </blockquote>
              <blockquote>
                <span>Стало</span>
                <p>{product.result.after}</p>
              </blockquote>
            </div>
          ) : null}

          <AnimatedList items={product.modules} />

          <ul className="include-list">
            {product.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
