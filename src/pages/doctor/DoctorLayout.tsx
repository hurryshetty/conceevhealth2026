import AppLayout from "@/components/layout/AppLayout";
import { LayoutDashboard, FolderKanban, Stethoscope, UserRound } from "lucide-react";

const nav = [
  { to: "/doctor",         icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/doctor/cases",   icon: FolderKanban,    label: "My Cases" },
  { to: "/doctor/profile", icon: UserRound,       label: "Profile" },
];

const DoctorLayout = () => (
  <AppLayout nav={nav} roleLabel="Doctor" roleIcon={Stethoscope} />
);

export default DoctorLayout;
