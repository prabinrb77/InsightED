import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Placeholder from "./pages/Placeholder";

/**
 * Route map for the marketing site. The Figma frame each route maps to is
 * noted so the remaining screens can be filled in one at a time.
 */
const STUBS: { path: string; title: string; node?: string }[] = [
  { path: "/for-schools", title: "For Schools", node: "264:1861" },
  { path: "/for-parents", title: "For Parents", node: "264:2389" },
  { path: "/for-specialists", title: "For Specialists", node: "264:2747" },
  { path: "/pricing", title: "Pricing", node: "264:3156" },
  { path: "/resources", title: "Resources", node: "264:4241" },
  { path: "/about", title: "About", node: "260:3600" },
];

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-brand"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {STUBS.map((s) => (
            <Route
              key={s.path}
              path={s.path}
              element={<Placeholder title={s.title} figmaNode={s.node} />}
            />
          ))}
          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
