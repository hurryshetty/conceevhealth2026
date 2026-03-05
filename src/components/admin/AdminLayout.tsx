import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

const AdminLayout = () => {
  const { user, signOut } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/admin/login")}>
              <LogIn className="h-4 w-4" /> Login
            </Button>
          )}
        </header>
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
