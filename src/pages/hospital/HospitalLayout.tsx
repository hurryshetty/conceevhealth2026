import AppLayout from "@/components/layout/AppLayout";
import { LayoutDashboard, FolderKanban, Users, Building2, UserRound } from "lucide-react";

const nav = [
  { to: "/hospital",         icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/hospital/cases",   icon: FolderKanban,    label: "Cases" },
  { to: "/hospital/staff",   icon: Users,           label: "Staff" },
  { to: "/hospital/profile", icon: UserRound,       label: "Profile" },
];

const HospitalLayout = () => (
  <AppLayout nav={nav} roleLabel="Hospital" roleIcon={Building2} />
);

export default HospitalLayout;
