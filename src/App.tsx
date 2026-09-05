import { lazy, Suspense, useEffect } from "react";
import Noise from "@/components/bits/Noise";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";

const WhoSees = lazy(() => import("@/components/sections/WhoSees"));
const GazeTurn = lazy(() => import("@/components/sections/GazeTurn"));
const Consultation = lazy(() => import("@/components/sections/Consultation"));
const Traces = lazy(() => import("@/components/sections/Traces"));
const Diagnosis = lazy(() => import("@/components/sections/Diagnosis"));
const PaperCard = lazy(() => import("@/components/sections/PaperCard"));
const Request = lazy(() => import("@/components/sections/Request"));

function scrollToHash() {
  const id = window.location.hash.replace("#", "");
  if (!id) return;
  document.getElementById(id)?.scrollIntoView();
}

export default function App() {
  useEffect(() => {
    scrollToHash();
    const timer = window.setTimeout(scrollToHash, 350);
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.clearTimeout(timer);
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
          <GazeTurn />
          <Consultation />
          <Traces />
          <Diagnosis />
          <PaperCard />
          <Request />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
