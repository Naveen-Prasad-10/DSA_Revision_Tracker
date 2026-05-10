import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar      from "./components/Navbar";
import HomePage    from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import DashboardPage from "./pages/DashboardPage";
import RoadmapPage   from "./pages/RoadmapPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/problems"  element={<ProblemsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/roadmap"   element={<RoadmapPage />} />
        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
