import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { LogIn, LogOut, Menu } from "lucide-react";

const AdminLayout = () => {
  const { user, signOut } = useAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-auto min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-serif font-bold text-foreground lg:hidden">Conceev Admin</span>
          <div className="flex-1" />
          {user ? (
            <>
              <NotificationBell />
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/admin/login")}>
              <LogIn className="h-4 w-4" /> Login
            </Button>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
