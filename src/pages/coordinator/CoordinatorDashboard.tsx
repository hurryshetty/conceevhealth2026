import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FolderKanban, Clock, CheckCircle2, AlertCircle, ArrowRight, Users } from "lucide-react";

const IN_PROGRESS_STAGES = [
  "assigned", "consultation_scheduled", "consultation_completed",
  "pre_treatment", "treatment_confirmed", "admitted",
  "treatment_in_progress", "recovery", "followup",
  "billing_pending", "escalated", "on_hold",
];

const STAGE_COLOR: Record<string, string> = {
  case_created:           "bg-blue-100 text-blue-700",
  assignment_pending:     "bg-orange-100 text-orange-700",
  assigned:               "bg-purple-100 text-purple-700",
  consultation_scheduled: "bg-indigo-100 text-indigo-700",
  consultation_completed: "bg-cyan-100 text-cyan-700",
  pre_treatment:          "bg-yellow-100 text-yellow-700",
  treatment_confirmed:    "bg-lime-100 text-lime-700",
  admitted:               "bg-teal-100 text-teal-700",
  treatment_in_progress:  "bg-emerald-100 text-emerald-700",
  recovery:               "bg-green-100 text-green-700",
  discharged:             "bg-green-200 text-green-800",
  followup:               "bg-sky-100 text-sky-700",
  billing_pending:        "bg-amber-100 text-amber-700",
  closed:                 "bg-gray-200 text-gray-700",
  cancelled:              "bg-red-100 text-red-700",
  on_hold:                "bg-zinc-100 text-zinc-700",
  escalated:              "bg-rose-100 text-rose-700",
};

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // All cases for accurate stats
  const { data: allCases = [], isLoading } = useQuery({
    queryKey: ["coordinator-dashboard-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // All leads for stats
  const { data: leadsData = [] } = useQuery({
    queryKey: ["coordinator-dashboard-leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, crm_status")
        .eq("lead_type", "patient_enquiry");
      return data ?? [];
    },
    enabled: !!user,
  });

  const recentCases = allCases.slice(0, 10);

  const stats = {
    totalCases:  allCases.length,
    newCases:    allCases.filter((c) => ["case_created", "assignment_pending"].includes(c.case_stage ?? "")).length,
    inProgress:  allCases.filter((c) => IN_PROGRESS_STAGES.includes(c.case_stage ?? "")).length,
    completed:   allCases.filter((c) => ["discharged", "closed"].includes(c.case_stage ?? "")).length,
    totalLeads:  leadsData.length,
    newLeads:    (leadsData as any[]).filter((l) => l.crm_status === "new").length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage patient cases and coordination</p>
      </div>

      {/* Case Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Total Cases",  value: stats.totalCases,  icon: FolderKanban,  color: "text-blue-600" },
          { label: "New / Pending",value: stats.newCases,    icon: AlertCircle,   color: "text-orange-500" },
          { label: "In Progress",  value: stats.inProgress,  icon: Clock,         color: "text-yellow-600" },
          { label: "Completed",    value: stats.completed,   icon: CheckCircle2,  color: "text-green-600" },
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

      {/* Lead Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: "Total Leads",  value: stats.totalLeads, icon: Users,        color: "text-violet-600" },
          { label: "New Leads",    value: stats.newLeads,   icon: AlertCircle,  color: "text-blue-500" },
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
        ) : recentCases.length === 0 ? (
          <p className="text-muted-foreground p-5 text-center">No cases yet</p>
        ) : (
          <div className="divide-y divide-border">
            {recentCases.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/coordinator/cases/${c.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{c.case_code || c.case_number || "—"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLOR[c.case_stage] ?? "bg-gray-100 text-gray-600"}`}>
                      {(c.case_stage ?? "").replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.specialties?.name}
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
