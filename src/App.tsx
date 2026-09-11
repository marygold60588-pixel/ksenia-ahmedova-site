import { Route, Routes } from "react-router-dom";
import ConsentPage from "@/pages/ConsentPage";
import HomePage from "@/pages/HomePage";
import PrivacyPage from "@/pages/PrivacyPage";
import StrahOtverzheniyaPage from "@/pages/StrahOtverzheniyaPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/strah-otverzheniya" element={<StrahOtverzheniyaPage />} />
      <Route path="/legal/privacy" element={<PrivacyPage />} />
      <Route path="/legal/consent" element={<ConsentPage />} />
    </Routes>
  );
}
