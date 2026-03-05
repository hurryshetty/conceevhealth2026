import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
  new: "Submitted — Our team will review shortly",
  assigned: "Assigned to coordinator",
  in_progress: "Treatment in progress",
  awaiting_docs: "Documents required — please upload",
  under_review: "Under medical review",
  approved: "Treatment approved",
  completed: "Treatment completed",
  rejected: "Not approved",
  cancelled: "Cancelled",
};

const PatientCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["patient-case-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name), hospitals(name, city, address, phone), doctors(name, specialty)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["patient-case-notes", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_notes")
        .select("*, profiles!author_id(full_name)")
        .eq("case_id", id!)
        .eq("is_internal", false)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ["patient-case-history", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_status_history")
        .select("*")
        .eq("case_id", id!)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!caseData) return <p className="text-muted-foreground">Case not found</p>;

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/patient/cases")} className="gap-2 mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4" /> My Cases
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Case Header */}
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-xs font-mono text-muted-foreground mb-1">{caseData.case_number}</p>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-3">{caseData.title}</h1>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${STATUS_COLOR[caseData.status] || ""}`}>
              {STATUS_LABEL[caseData.status] || caseData.status}
            </div>
            {caseData.description && (
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">{caseData.description}</p>
            )}
          </div>

          {/* Notes from team */}
          {notes.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground mb-4">Updates from our team</h2>
              <div className="space-y-3">
                {notes.map((note: any) => (
                  <div key={note.id} className="p-3 rounded-lg bg-accent text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{note.profiles?.full_name ?? "Team"}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(note.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {history.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground mb-4">Case Timeline</h2>
              <ol className="relative border-l border-border space-y-4 ml-3">
                {history.map((h: any) => (
                  <li key={h.id} className="ml-4">
                    <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-border bg-card"></div>
                    <p className="text-sm font-medium text-foreground capitalize">{h.status.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Specialty */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Specialty</h3>
            <p className="font-medium text-foreground">{caseData.specialties?.name ?? "—"}</p>
          </div>

          {/* Hospital */}
          {caseData.hospitals && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Hospital</h3>
              <p className="font-medium text-foreground">{caseData.hospitals.name}</p>
              {caseData.hospitals.city && <p className="text-sm text-muted-foreground">{caseData.hospitals.city}</p>}
              {caseData.hospitals.address && <p className="text-sm text-muted-foreground">{caseData.hospitals.address}</p>}
              {caseData.hospitals.phone && <p className="text-sm text-muted-foreground">{caseData.hospitals.phone}</p>}
            </div>
          )}

          {/* Doctor */}
          {caseData.doctors && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Doctor</h3>
              <p className="font-medium text-foreground">Dr. {caseData.doctors.name}</p>
              {caseData.doctors.specialty && <p className="text-sm text-muted-foreground">{caseData.doctors.specialty}</p>}
            </div>
          )}

          {/* Estimated Cost */}
          {caseData.estimated_cost && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Estimated Cost</h3>
              <p className="text-2xl font-bold text-foreground">
                ₹{caseData.estimated_cost.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Estimate subject to change</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientCaseDetail;
