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
import SpecialistSignupPage from "./pages/SpecialistSignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/app/DashboardPage";
import StudentsPage from "./pages/app/StudentsPage";
import AddStudentPage from "./pages/app/AddStudentPage";
import StudentProfilePage from "./pages/app/StudentProfilePage";
import MessagesPage from "./pages/app/MessagesPage";
import SchedulePage from "./pages/app/SchedulePage";
import AppSettingsPage from "./pages/app/AppSettingsPage";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <Routes>
      {/* Auth portal — its own slim chrome, no marketing header/footer */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/teacher" element={<TeacherSignupPage />} />
      <Route path="/signup/specialist" element={<SpecialistSignupPage />} />
      <Route path="/signup/:role" element={<SignupFormPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Educator app — dark rail shell */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/new" element={<AddStudentPage />} />
        <Route path="students/:id" element={<StudentProfilePage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="settings" element={<AppSettingsPage />} />
      </Route>

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
