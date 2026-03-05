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

const PatientCases = () => {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">My Cases</h1>
        <Button onClick={() => navigate("/patient/new-case")} className="gap-2">
          <PlusCircle className="h-4 w-4" /> New Case
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : cases.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No cases yet</h3>
          <Button onClick={() => navigate("/patient/new-case")} className="gap-2 mt-2">
            <PlusCircle className="h-4 w-4" /> Submit Your First Case
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c: any) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
              onClick={() => navigate(`/patient/cases/${c.id}`)}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{c.case_number}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] || ""}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </div>
                <p className="font-semibold text-foreground">{c.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {c.specialties?.name}
                  {c.hospitals?.name ? ` • ${c.hospitals.name}` : ""}
                  {c.doctors?.name ? ` • Dr. ${c.doctors.name}` : ""}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientCases;
