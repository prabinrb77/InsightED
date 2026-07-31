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
import ActivityPage from "./pages/app/ActivityPage";
import SuperAdminLayout from "./components/SuperAdminLayout";
import RequireRole from "./components/RequireRole";
import SuperDashboardPage from "./pages/admin/SuperDashboardPage";
import TenantsPage from "./pages/admin/TenantsPage";
import AdminAccessPage from "./pages/admin/AdminAccessPage";
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
      <Route
        path="/app"
        element={
          <RequireRole allow={["teacher", "external_teacher", "school_admin"]}>
            <AppLayout />
          </RequireRole>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/new" element={<AddStudentPage />} />
        <Route path="students/:id" element={<StudentProfilePage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="settings" element={<AppSettingsPage />} />
      </Route>

      {/* Super admin console — restricted to profiles.role = 'super_admin'.
          RLS is the real boundary; this guard just keeps others out of screens
          that would show them nothing. */}
      <Route
        path="/admin"
        element={
          <RequireRole allow={["super_admin"]}>
            <SuperAdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<SuperDashboardPage />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="settings" element={<AdminAccessPage />} />
        <Route
          path="mlops"
          element={<Placeholder title="MLOps & AI Governance" figmaNode="1:8124" />}
        />
        <Route
          path="security"
          element={<Placeholder title="Security & Compliance" figmaNode="1:8478" />}
        />
        <Route
          path="infrastructure"
          element={
            <Placeholder title="Infrastructure & DevOps" figmaNode="1:9168" />
          }
        />
        <Route
          path="billing"
          element={<Placeholder title="Billing & Revenue" figmaNode="1:8729" />}
        />
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
