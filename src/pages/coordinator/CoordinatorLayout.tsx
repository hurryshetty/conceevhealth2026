import AppLayout from "@/components/layout/AppLayout";
import { LayoutDashboard, FolderKanban, MessageSquare, Heart } from "lucide-react";

const nav = [
  { to: "/coordinator", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/coordinator/cases", icon: FolderKanban, label: "Cases" },
  { to: "/coordinator/messages", icon: MessageSquare, label: "Messages" },
];

const CoordinatorLayout = () => (
  <AppLayout nav={nav} roleLabel="Coordinator" roleIcon={Heart} />
);

export default CoordinatorLayout;
