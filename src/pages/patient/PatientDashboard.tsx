import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight, FolderKanban } from "lucide-react";

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

const STATUS_LABEL: Record<string, string> = {
  new: "Submitted",
  assigned: "Assigned",
  in_progress: "In Progress",
  awaiting_docs: "Docs Needed",
  under_review: "Under Review",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["patient-cases", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name), hospitals(name), doctors(name)")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const active = cases.filter((c: any) => !["completed", "cancelled", "rejected"].includes(c.status));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">My Health Journey</h1>
          <p className="text-muted-foreground mt-1">Track your treatment cases and updates</p>
        </div>
        <Button onClick={() => navigate("/patient/new-case")} className="gap-2">
          <PlusCircle className="h-4 w-4" /> Start New Case
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Cases</p>
            <FolderKanban className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{cases.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Active</p>
            <FolderKanban className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{active.length}</p>
        </div>
      </div>

      {/* Cases */}
      {isLoading ? (
        <p className="text-muted-foreground">Loading your cases...</p>
      ) : cases.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No cases yet</h3>
          <p className="text-muted-foreground text-sm mb-5">Submit your first case to start your healthcare journey with us</p>
          <Button onClick={() => navigate("/patient/new-case")} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Start New Case
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c: any) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-sm cursor-pointer transition-all"
              onClick={() => navigate(`/patient/cases/${c.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{c.case_number}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] || ""}`}>
                      {STATUS_LABEL[c.status] || c.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                    {c.specialties?.name && <span>{c.specialties.name}</span>}
                    {c.hospitals?.name && <span>• {c.hospitals.name}</span>}
                    {c.doctors?.name && <span>• Dr. {c.doctors.name}</span>}
                  </div>
                  {c.estimated_cost && (
                    <p className="text-sm font-medium text-foreground mt-2">
                      Estimated: ₹{c.estimated_cost.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
