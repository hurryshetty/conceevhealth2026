import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

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

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["coordinator-cases", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name), hospitals(name)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const stats = {
    total: cases.length,
    new: cases.filter((c: any) => c.status === "new").length,
    inProgress: cases.filter((c: any) => ["assigned", "in_progress", "awaiting_docs", "under_review"].includes(c.status)).length,
    completed: cases.filter((c: any) => ["completed", "approved"].includes(c.status)).length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage patient cases and coordination</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Cases", value: stats.total, icon: FolderKanban, color: "text-blue-600" },
          { label: "New", value: stats.new, icon: AlertCircle, color: "text-orange-500" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-yellow-600" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-600" },
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

      {/* Recent Cases */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Cases</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/coordinator/cases")} className="gap-1 text-primary">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground p-5">Loading...</p>
        ) : cases.length === 0 ? (
          <p className="text-muted-foreground p-5 text-center">No cases yet</p>
        ) : (
          <div className="divide-y divide-border">
            {cases.map((c: any) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/coordinator/cases/${c.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{c.case_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] || "bg-gray-100 text-gray-600"}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.specialties?.name} {c.hospitals?.name ? `• ${c.hospitals.name}` : ""}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-4 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
