import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, UserRound, Building2, Layers, MessageSquare, LogOut, Users, X, ShieldCheck, Settings } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/packages", icon: Package, label: "Packages" },
  { to: "/admin/doctors", icon: UserRound, label: "Doctors" },
  { to: "/admin/hospitals", icon: Building2, label: "Hospitals" },
  { to: "/admin/specialties", icon: Layers, label: "Specialties" },
  { to: "/admin/verification", icon: ShieldCheck, label: "Verification" },
  { to: "/admin/leads", icon: MessageSquare, label: "Leads" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const AdminSidebar = ({ open, onClose }: AdminSidebarProps) => {
  const { signOut, user } = useAdmin();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200
          lg:static lg:translate-x-0 lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-bold text-foreground">Conceev Admin</h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = link.end
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <link.icon className="h-4 w-4 flex-shrink-0" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
