import AppLayout from "@/components/layout/AppLayout";
import { LayoutDashboard, FolderKanban, Users, Building2 } from "lucide-react";

const nav = [
  { to: "/hospital", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/hospital/cases", icon: FolderKanban, label: "Cases" },
  { to: "/hospital/staff", icon: Users, label: "Staff" },
];

const HospitalLayout = () => (
  <AppLayout nav={nav} roleLabel="Hospital" roleIcon={Building2} />
);

export default HospitalLayout;
