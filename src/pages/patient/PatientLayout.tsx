import AppLayout from "@/components/layout/AppLayout";
import { LayoutDashboard, FolderKanban, PlusCircle, Heart } from "lucide-react";

const nav = [
  { to: "/patient", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/patient/cases", icon: FolderKanban, label: "My Cases" },
  { to: "/patient/new-case", icon: PlusCircle, label: "New Case" },
];

const PatientLayout = () => (
  <AppLayout nav={nav} roleLabel="Patient" roleIcon={Heart} />
);

export default PatientLayout;
