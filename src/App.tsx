import { Route, Routes } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import LandingPage from "./pages/LandingPage";
import ForSchoolsPage from "./pages/ForSchoolsPage";
import ForParentsPage from "./pages/ForParentsPage";
import ForSpecialistsPage from "./pages/ForSpecialistsPage";
import PricingPage from "./pages/PricingPage";
import ResourcesPage from "./pages/ResourcesPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SignupFormPage from "./pages/SignupFormPage";
import TeacherSignupPage from "./pages/TeacherSignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <Routes>
      {/* Auth portal — its own slim chrome, no marketing header/footer */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/teacher" element={<TeacherSignupPage />} />
      <Route path="/signup/:role" element={<SignupFormPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Marketing site */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/for-schools" element={<ForSchoolsPage />} />
        <Route path="/for-parents" element={<ForParentsPage />} />
        <Route path="/for-specialists" element={<ForSpecialistsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  );
}
