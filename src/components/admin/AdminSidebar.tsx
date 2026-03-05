import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, UserRound, MapPin, Layers, MessageSquare, LogOut, Users } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/packages", icon: Package, label: "Packages" },
  { to: "/admin/doctors", icon: UserRound, label: "Doctors" },
  { to: "/admin/locations", icon: MapPin, label: "Locations" },
  { to: "/admin/specialties", icon: Layers, label: "Specialties" },
  { to: "/admin/leads", icon: MessageSquare, label: "Leads" },
  { to: "/admin/users", icon: Users, label: "Users" },
];

const AdminSidebar = () => {
  const { signOut, user } = useAdmin();
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col shrink-0">
      <div className="p-6 border-b border-border">
        <h2 className="font-serif text-lg font-bold text-foreground">Conceev Admin</h2>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = link.end
            ? location.pathname === link.to
            : location.pathname.startsWith(link.to);
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <link.icon className="h-4 w-4" />
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
  );
};

export default AdminSidebar;
