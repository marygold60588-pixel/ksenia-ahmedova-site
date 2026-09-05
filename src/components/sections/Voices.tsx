import { site } from "@/content";

export default function Voices() {
  return (
    <section className="section voices" id="voices" aria-labelledby="voices-title">
      <div className="voices-head">
        <p className="kicker">{site.voices.kicker}</p>
        <h2 className="section-title" id="voices-title">
          {site.voices.title}
        </h2>
      </div>
      <div className="voices-frame">
        <div className="voices-slot" />
        <div className="voices-slot" />
        <div className="voices-slot" />
      </div>
    </section>
  );
}
