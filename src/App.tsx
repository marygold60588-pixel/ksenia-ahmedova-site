import { Route, Routes } from "react-router-dom";
import ConsentPage from "@/pages/ConsentPage";
import HomePage from "@/pages/HomePage";
import KogdaGovoryatNetPage from "@/pages/KogdaGovoryatNetPage";
import PrivacyPage from "@/pages/PrivacyPage";
import StrahOtverzheniyaPage from "@/pages/StrahOtverzheniyaPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/strah-otverzheniya" element={<StrahOtverzheniyaPage />} />
      <Route path="/kogda-govoryat-net" element={<KogdaGovoryatNetPage />} />
      <Route path="/legal/privacy" element={<PrivacyPage />} />
      <Route path="/legal/consent" element={<ConsentPage />} />
    </Routes>
  );
}
