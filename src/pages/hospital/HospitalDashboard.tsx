import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  assigned: "bg-purple-100 text-purple-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  awaiting_docs: "bg-orange-100 text-orange-700",
  under_review: "bg-indigo-100 text-indigo-700",
  approved: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const HospitalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get hospital for this user
  const { data: membership } = useQuery({
    queryKey: ["hospital-membership", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("hospital_members")
        .select("hospital_id, hospitals(name, city)")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["hospital-cases", membership?.hospital_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name), doctors(name)")
        .eq("hospital_id", membership!.hospital_id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!membership?.hospital_id,
  });

  const stats = {
    total: cases.length,
    new: cases.filter((c: any) => c.status === "new").length,
    active: cases.filter((c: any) => ["assigned", "in_progress", "awaiting_docs", "under_review"].includes(c.status)).length,
    done: cases.filter((c: any) => ["completed", "approved"].includes(c.status)).length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {(membership as any)?.hospitals?.name ?? "Hospital Dashboard"}
        </h1>
        <p className="text-muted-foreground mt-1">{(membership as any)?.hospitals?.city}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Cases", value: stats.total, icon: FolderKanban, color: "text-blue-600" },
          { label: "New", value: stats.new, icon: AlertCircle, color: "text-orange-500" },
          { label: "Active", value: stats.active, icon: Clock, color: "text-yellow-600" },
          { label: "Completed", value: stats.done, icon: CheckCircle2, color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Cases</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/hospital/cases")} className="gap-1 text-primary">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground p-5">Loading...</p>
        ) : cases.length === 0 ? (
          <p className="text-muted-foreground p-5 text-center">No cases assigned yet</p>
        ) : (
          <div className="divide-y divide-border">
            {cases.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{c.case_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] || ""}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.specialties?.name}{c.doctors?.name ? ` • Dr. ${c.doctors.name}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
