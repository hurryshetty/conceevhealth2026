import AppLayout from "@/components/layout/AppLayout";
import { LayoutDashboard, FolderKanban, Stethoscope } from "lucide-react";

const nav = [
  { to: "/doctor", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/doctor/cases", icon: FolderKanban, label: "My Cases" },
];

const DoctorLayout = () => (
  <AppLayout nav={nav} roleLabel="Doctor" roleIcon={Stethoscope} />
);

export default DoctorLayout;
