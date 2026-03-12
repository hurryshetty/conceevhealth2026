import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { LogOut, Menu, X, Heart } from "lucide-react";

export interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
}

interface AppLayoutProps {
  nav: NavItem[];
  roleLabel: string;
  roleIcon?: React.ComponentType<{ className?: string }>;
  loginPath?: string;
}

const AppLayout = ({ nav, roleLabel, roleIcon: RoleIcon, loginPath = "/login" }: AppLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(loginPath);
  };

  const IconComponent = RoleIcon ?? Heart;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 border-r border-border bg-card flex flex-col
          transition-transform duration-200
          lg:static lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="font-serif font-bold text-foreground">Conceev</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
              {roleLabel}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0 ml-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end ?? to.split("/").length <= 2}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2 px-3">
            <div className="text-xs text-muted-foreground truncate flex-1">{user?.email}</div>
            <NotificationBell />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4 text-primary" />
            <span className="font-serif font-bold text-foreground">Conceev</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{roleLabel}</span>
          </div>
          <div className="flex-1" />
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
