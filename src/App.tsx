import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { captureAttribution } from "@/lib/analytics";

// Public pages
import Index from "./pages/Index";
import IVFBangalore from "./pages/IVFBangalore";
import IVFPackageLanding from "./pages/IVFPackageLanding";
import HysterectomyHyderabad from "./pages/HysterectomyHyderabad";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import FertilityPackages from "./pages/FertilityPackages";
import FertilityPackageDetail from "./pages/FertilityPackageDetail";
import DoctorProfile from "./pages/DoctorProfile";
import Doctors from "./pages/Doctors";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HospitalPartnership from "./pages/HospitalPartnership";
import DoctorPartnership from "./pages/DoctorPartnership";
import Hospitals from "./pages/Hospitals";
import FAQs from "./pages/FAQs";
import AboutUs from "./pages/AboutUs";
import Careers from "./pages/Careers";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import MedicalDisclaimer from "./pages/MedicalDisclaimer";
import RefundPolicy from "./pages/RefundPolicy";

// ── Authenticated app ─────────────────────────────────────────────────────────
// Everything behind a login is code-split. A visitor landing on a marketing page
// should never download the admin, coordinator, hospital, doctor or patient
// dashboards, which together dominated the single bundle.

// Admin
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminRoute = lazy(() => import("./components/admin/AdminRoute"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPackages = lazy(() => import("./pages/admin/AdminPackages"));
const AdminPackageForm = lazy(() => import("./pages/admin/AdminPackageForm"));
const AdminDoctorForm = lazy(() => import("./pages/admin/AdminDoctorForm"));
const AdminDoctors = lazy(() => import("./pages/admin/AdminDoctors"));
const AdminLocations = lazy(() => import("./pages/admin/AdminLocations"));
const AdminSpecialties = lazy(() => import("./pages/admin/AdminSpecialties"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminCases = lazy(() => import("./pages/admin/AdminCases"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminVerification = lazy(() => import("./pages/admin/AdminVerification"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// Auth guard
const RoleRoute = lazy(() => import("./components/auth/RoleRoute"));

// Coordinator
const CoordinatorLayout = lazy(() => import("./pages/coordinator/CoordinatorLayout"));
const CoordinatorDashboard = lazy(() => import("./pages/coordinator/CoordinatorDashboard"));
const CoordinatorLeads = lazy(() => import("./pages/coordinator/CoordinatorLeads"));
const CoordinatorCases = lazy(() => import("./pages/coordinator/CoordinatorCases"));
const CoordinatorCaseDetail = lazy(() => import("./pages/coordinator/CoordinatorCaseDetail"));
const CoordinatorMessages = lazy(() => import("./pages/coordinator/CoordinatorMessages"));

// Hospital
const HospitalLayout = lazy(() => import("./pages/hospital/HospitalLayout"));
const HospitalDashboard = lazy(() => import("./pages/hospital/HospitalDashboard"));
const HospitalCases = lazy(() => import("./pages/hospital/HospitalCases"));
const HospitalCaseDetail = lazy(() => import("./pages/hospital/HospitalCaseDetail"));
const HospitalStaff = lazy(() => import("./pages/hospital/HospitalStaff"));

// Doctor
const DoctorLayout = lazy(() => import("./pages/doctor/DoctorLayout"));
const DoctorDashboard = lazy(() => import("./pages/doctor/DoctorDashboard"));
const DoctorCases = lazy(() => import("./pages/doctor/DoctorCases"));
const DoctorCaseDetail = lazy(() =>
  import("./pages/doctor/DoctorCases").then((m) => ({ default: m.DoctorCaseDetail }))
);

// Patient
const PatientLayout = lazy(() => import("./pages/patient/PatientLayout"));
const PatientDashboard = lazy(() => import("./pages/patient/PatientDashboard"));
const PatientCases = lazy(() => import("./pages/patient/PatientCases"));
const PatientCaseDetail = lazy(() => import("./pages/patient/PatientCaseDetail"));
const PatientNewCase = lazy(() => import("./pages/patient/PatientNewCase"));

// Profile
const ProfileSettings = lazy(() => import("./pages/profile/ProfileSettings"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
    <span className="sr-only">Loading</span>
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
  </div>
);

const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

/**
 * Records UTM / referrer / device attribution on the very first render, so a
 * landing page is captured as first touch regardless of which route it was.
 */
const AttributionCapture = () => {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AttributionCapture />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/ivf-bangalore" element={<IVFBangalore />} />
            <Route path="/ivf-package" element={<IVFPackageLanding />} />
            <Route path="/hysterectomy-hyderabad" element={<HysterectomyHyderabad />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:slug" element={<PackageDetail />} />
            <Route path="/fertility-packages" element={<FertilityPackages />} />
            <Route path="/fertility-packages/:slug" element={<FertilityPackageDetail />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:slug" element={<DoctorProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/medical-disclaimer" element={<MedicalDisclaimer />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/register-your-hospital" element={<HospitalPartnership />} />
            <Route path="/register-as-doctor" element={<DoctorPartnership />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="packages/new" element={<AdminPackageForm />} />
              <Route path="packages/:id/edit" element={<AdminPackageForm />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="doctors/new" element={<AdminDoctorForm />} />
              <Route path="doctors/:id/edit" element={<AdminDoctorForm />} />
              <Route path="hospitals" element={<AdminLocations />} />
              <Route path="specialties" element={<AdminSpecialties />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="cases" element={<AdminCases />} />
              <Route path="cases/:id" element={<CoordinatorCaseDetail />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="verification" element={<AdminVerification />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>

            {/* Coordinator */}
            <Route
              path="/coordinator"
              element={
                <RoleRoute allowedRoles={["coordinator", "admin", "superadmin"]}>
                  <CoordinatorLayout />
                </RoleRoute>
              }
            >
              <Route index element={<CoordinatorDashboard />} />
              <Route path="leads" element={<CoordinatorLeads />} />
              <Route path="cases" element={<CoordinatorCases />} />
              <Route path="cases/:id" element={<CoordinatorCaseDetail />} />
              <Route path="messages" element={<CoordinatorMessages />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>

            {/* Hospital */}
            <Route
              path="/hospital"
              element={
                <RoleRoute allowedRoles={["hospital", "admin", "superadmin"]}>
                  <HospitalLayout />
                </RoleRoute>
              }
            >
              <Route index element={<HospitalDashboard />} />
              <Route path="cases" element={<HospitalCases />} />
              <Route path="cases/:id" element={<HospitalCaseDetail />} />
              <Route path="staff" element={<HospitalStaff />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>

            {/* Doctor */}
            <Route
              path="/doctor"
              element={
                <RoleRoute allowedRoles={["doctor", "admin", "superadmin"]}>
                  <DoctorLayout />
                </RoleRoute>
              }
            >
              <Route index element={<DoctorDashboard />} />
              <Route path="cases" element={<DoctorCases />} />
              <Route path="cases/:id" element={<DoctorCaseDetail />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>

            {/* Patient */}
            <Route
              path="/patient"
              element={
                <RoleRoute allowedRoles={["patient", "user", "admin", "superadmin"]}>
                  <PatientLayout />
                </RoleRoute>
              }
            >
              <Route index element={<PatientDashboard />} />
              <Route path="cases" element={<PatientCases />} />
              <Route path="cases/:id" element={<PatientCaseDetail />} />
              <Route path="new-case" element={<PatientNewCase />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
