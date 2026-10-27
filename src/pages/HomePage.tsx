import { lazy, Suspense, useEffect } from "react";
import Noise from "@/components/bits/Noise";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";

const WhoSees = lazy(() => import("@/components/sections/WhoSees"));
const Consultation = lazy(() => import("@/components/sections/Consultation"));
const Traces = lazy(() => import("@/components/sections/Traces"));
const FreePractice = lazy(() => import("@/components/sections/FreePractice"));
const PaperCard = lazy(() => import("@/components/sections/PaperCard"));
const Request = lazy(() => import("@/components/sections/Request"));

function scrollToHash() {
  const id = window.location.hash.replace("#", "");
  if (!id) return;
  document.getElementById(id)?.scrollIntoView();
}

export default function HomePage() {
  useEffect(() => {
    // Opening or refreshing the homepage should always begin at the hero.
    // Clear a stale section hash from previous navigation without reloading.
    if (window.location.hash) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const frame = window.requestAnimationFrame(() => window.scrollTo(0, 0));
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return (
    <>
      <Noise />
      <Header />
      <main>
        <Hero />
        <Suspense fallback={null}>
          <WhoSees />
          <Consultation />
          <Traces />
          <FreePractice />
          <PaperCard />
          <Request />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
