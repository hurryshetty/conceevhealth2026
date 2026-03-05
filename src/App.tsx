import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";

// Public pages
import Index from "./pages/Index";
import IVFBangalore from "./pages/IVFBangalore";
import HysterectomyHyderabad from "./pages/HysterectomyHyderabad";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import DoctorProfile from "./pages/DoctorProfile";
import Doctors from "./pages/Doctors";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminLocations from "./pages/admin/AdminLocations";
import AdminSpecialties from "./pages/admin/AdminSpecialties";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminUsers from "./pages/admin/AdminUsers";

// Auth guard
import RoleRoute from "./components/auth/RoleRoute";

// Coordinator
import CoordinatorLayout from "./pages/coordinator/CoordinatorLayout";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CoordinatorCases from "./pages/coordinator/CoordinatorCases";
import CoordinatorCaseDetail from "./pages/coordinator/CoordinatorCaseDetail";
import CoordinatorMessages from "./pages/coordinator/CoordinatorMessages";

// Hospital
import HospitalLayout from "./pages/hospital/HospitalLayout";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalCases from "./pages/hospital/HospitalCases";
import HospitalStaff from "./pages/hospital/HospitalStaff";

// Doctor
import DoctorLayout from "./pages/doctor/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorCases, { DoctorCaseDetail } from "./pages/doctor/DoctorCases";

// Patient
import PatientLayout from "./pages/patient/PatientLayout";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientCases from "./pages/patient/PatientCases";
import PatientCaseDetail from "./pages/patient/PatientCaseDetail";
import PatientNewCase from "./pages/patient/PatientNewCase";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/ivf-bangalore" element={<IVFBangalore />} />
          <Route path="/hysterectomy-hyderabad" element={<HysterectomyHyderabad />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:slug" element={<PackageDetail />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:slug" element={<DoctorProfile />} />
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="specialties" element={<AdminSpecialties />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="users" element={<AdminUsers />} />
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
            <Route path="cases" element={<CoordinatorCases />} />
            <Route path="cases/:id" element={<CoordinatorCaseDetail />} />
            <Route path="messages" element={<CoordinatorMessages />} />
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
            <Route path="staff" element={<HospitalStaff />} />
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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
