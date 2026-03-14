import AppLayout from "@/components/layout/AppLayout";
import { LayoutDashboard, FolderKanban, Users, MessageSquare, Heart, UserRound } from "lucide-react";

const nav = [
  { to: "/coordinator",         icon: LayoutDashboard, label: "Dashboard",  end: true },
  { to: "/coordinator/leads",   icon: Users,           label: "Leads" },
  { to: "/coordinator/cases",   icon: FolderKanban,    label: "Cases" },
  { to: "/coordinator/messages",icon: MessageSquare,   label: "Messages" },
  { to: "/coordinator/profile", icon: UserRound,       label: "Profile" },
];

const CoordinatorLayout = () => (
  <AppLayout nav={nav} roleLabel="Coordinator" roleIcon={Heart} />
);

export default CoordinatorLayout;
