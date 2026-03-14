import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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

const HospitalCases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: membership } = useQuery({
    queryKey: ["hospital-membership", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("hospital_members")
        .select("hospital_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["hospital-cases-all", membership?.hospital_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name), doctors(name)")
        .eq("hospital_id", membership!.hospital_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!membership?.hospital_id,
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-6">Cases</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="text-muted-foreground p-6">Loading...</p>
        ) : cases.length === 0 ? (
          <p className="text-muted-foreground p-6 text-center">No cases assigned to this hospital</p>
        ) : (
          <div className="divide-y divide-border">
            {cases.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer"
                onClick={() => navigate(`/hospital/cases/${c.id}`)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{c.case_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] || ""}`}>
                      {c.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">• {c.priority}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.specialties?.name}{c.doctors?.name ? ` • ${c.doctors.name}` : ""}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalCases;
