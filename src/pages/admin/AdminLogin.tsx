import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const FALLBACK_URL = "https://rjmuhomeqydszmerlqrh.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbXVob21lcXlkc3ptZXJscXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc5NTEsImV4cCI6MjA4ODI5Mzk1MX0.-AePEE5w3zgFwHzgtKfnlPuhRGAKKuTBtPg3BHcEnAA";

const getUrl = () => import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const getKey = () => import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a local client with hardcoded fallbacks to avoid broken env vars
      const localClient = createClient(getUrl(), getKey(), {
        auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
      });

      const { data, error } = await localClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error("No session returned");

      // Check admin role via app_metadata (set server-side in Supabase dashboard)
      // Falls back to user_roles table if app_metadata not set
      const isAdminMeta = data.user.app_metadata?.role === "admin";

      if (!isAdminMeta) {
        // Fallback: check user_roles table
        const { data: roleData } = await localClient
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!roleData) {
          await localClient.auth.signOut();
          toast({ title: "Access denied", description: "You don't have admin privileges.", variant: "destructive" });
          setLoading(false);
          return;
        }
      }

      // Also set session on the global client so the rest of the app works
      try {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      } catch {
        // Global client may fail if env vars are broken, but local client session is already persisted
        console.warn("Could not set session on global client, continuing with local session");
      }

      navigate("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Conceev Health Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@conceev.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
